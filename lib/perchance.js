/**
 * @module lib/perchance
 * @description Perchance generator client and evaluator for the 9898-MTG platform.
 *
 * Perchance (https://perchance.org) is a random-text generator platform. The
 * 9898-MTG League maintains a Chaos RPG generator at
 * `https://perchance.org/9898-mtg-chaos-rpg-2024`. This module provides a real,
 * self-contained implementation that can:
 *
 *   1. Fetch a generator's raw source text from Perchance.
 *   2. Parse the Perchance list grammar into structured lists.
 *   3. Evaluate the grammar — resolving `[list]` references recursively with
 *      weighted random selection — to produce generated output.
 *
 * The parser/evaluator is pure and deterministic when supplied with a seeded
 * random function, which makes it fully unit-testable without network access.
 *
 * Perchance list grammar (simplified):
 *
 *   listName
 *     option one
 *     option two ^3        // weight of 3 (three times as likely)
 *     an [otherList] here  // references are resolved recursively
 *
 * A top-level list named `output` (by convention) is the entry point.
 */

/** Default Perchance generator used by the 9898-MTG League. */
const DEFAULT_GENERATOR = "9898-mtg-chaos-rpg-2024";

/**
 * Endpoint that returns the raw, editable source of a Perchance generator.
 * @param {string} generatorName Perchance generator slug.
 * @returns {string} Fully-qualified download URL.
 */
function generatorSourceUrl(generatorName) {
    return `https://perchance.org/api/downloadGenerator?generatorName=${encodeURIComponent(generatorName)}`;
}

/**
 * Parse Perchance generator source text into a map of list name -> options.
 *
 * A list is introduced by a non-indented, non-empty line (the list name).
 * Subsequent indented lines are that list's options. Blank lines and lines
 * beginning with `//` are ignored. An option may declare a weight with a
 * trailing `^N` token.
 *
 * @param {string} source Raw generator source text.
 * @returns {Object<string, Array<{text: string, weight: number}>>} Parsed lists.
 */
function parseGenerator(source) {
    if (typeof source !== "string") {
        throw new TypeError("parseGenerator expects a string source");
    }

    const lists = {};
    let currentList = null;

    const rawLines = source.split(/\r?\n/);
    for (const rawLine of rawLines) {
        // Skip blank lines and comments.
        if (rawLine.trim() === "" || rawLine.trim().startsWith("//")) {
            continue;
        }

        const isIndented = /^\s/.test(rawLine);
        if (!isIndented) {
            // New list definition.
            currentList = rawLine.trim();
            if (!lists[currentList]) {
                lists[currentList] = [];
            }
        } else if (currentList) {
            // Option belonging to the current list.
            const { text, weight } = parseOption(rawLine.trim());
            lists[currentList].push({ text, weight });
        }
    }

    return lists;
}

/**
 * Parse a single option line, extracting an optional `^N` weight suffix.
 * @param {string} line Trimmed option text.
 * @returns {{text: string, weight: number}} Option text and weight (default 1).
 */
function parseOption(line) {
    const match = line.match(/^(.*?)\s*\^(\d+(?:\.\d+)?)\s*$/);
    if (match) {
        const weight = Number(match[2]);
        return { text: match[1], weight: weight > 0 ? weight : 1 };
    }
    return { text: line, weight: 1 };
}

/**
 * Select a weighted-random option from a list.
 * @param {Array<{text: string, weight: number}>} options List options.
 * @param {() => number} rng Random function returning [0, 1).
 * @returns {string} Selected option text, or empty string if list is empty.
 */
function pickWeighted(options, rng) {
    if (!Array.isArray(options) || options.length === 0) {
        return "";
    }
    const total = options.reduce((sum, o) => sum + (o.weight || 1), 0);
    let threshold = rng() * total;
    for (const option of options) {
        threshold -= option.weight || 1;
        if (threshold < 0) {
            return option.text;
        }
    }
    return options[options.length - 1].text;
}

/**
 * Resolve `[list]` references within a template string, recursively.
 * @param {Object} lists Parsed lists.
 * @param {string} template Text possibly containing `[reference]` tokens.
 * @param {() => number} rng Random function.
 * @param {number} [depth=0] Current recursion depth (guards against cycles).
 * @returns {string} Fully resolved text.
 */
function resolveReferences(lists, template, rng, depth = 0) {
    if (depth > 50) {
        // Prevent infinite recursion from self-referential generators.
        return template;
    }
    return template.replace(/\[([^\][]+)\]/g, (whole, name) => {
        const listName = name.trim();
        if (!Object.prototype.hasOwnProperty.call(lists, listName)) {
            // Unknown reference — leave the literal token in place.
            return whole;
        }
        const chosen = pickWeighted(lists[listName], rng);
        return resolveReferences(lists, chosen, rng, depth + 1);
    });
}

/**
 * Generate output from parsed lists starting at a root list.
 * @param {Object} lists Parsed lists (from {@link parseGenerator}).
 * @param {Object} [options]
 * @param {string} [options.root="output"] Entry-point list name.
 * @param {() => number} [options.rng=Math.random] Random function.
 * @returns {string} Generated text.
 * @throws {Error} If the root list does not exist.
 */
function generate(lists, { root = "output", rng = Math.random } = {}) {
    if (!lists || !Object.prototype.hasOwnProperty.call(lists, root)) {
        throw new Error(`Perchance generator has no "${root}" list`);
    }
    const seed = pickWeighted(lists[root], rng);
    return resolveReferences(lists, seed, rng).trim();
}

/**
 * Client for fetching and generating from Perchance generators.
 */
class PerchanceClient {
    /**
     * @param {Object} [options]
     * @param {string} [options.generator] Default generator slug.
     * @param {(url: string) => Promise<string>} [options.fetchText] Text fetcher
     *        (injectable for testing / environments without global fetch).
     */
    constructor({ generator = DEFAULT_GENERATOR, fetchText } = {}) {
        this.generator = generator;
        this._fetchText = fetchText || defaultFetchText;
        /** @type {Object|null} Cache of the parsed generator. */
        this._lists = null;
    }

    /**
     * Fetch and parse the generator source, caching the result.
     * @param {string} [generatorName] Override the default generator slug.
     * @returns {Promise<Object>} Parsed lists.
     */
    async load(generatorName = this.generator) {
        const source = await this._fetchText(generatorSourceUrl(generatorName));
        this._lists = parseGenerator(source);
        return this._lists;
    }

    /**
     * Generate output, loading the generator first if necessary.
     * @param {Object} [options] Passed through to {@link generate}.
     * @returns {Promise<string>} Generated text.
     */
    async generate(options = {}) {
        if (!this._lists) {
            await this.load();
        }
        return generate(this._lists, options);
    }
}

/**
 * Default text fetcher using the global `fetch` implementation.
 * @param {string} url URL to fetch.
 * @returns {Promise<string>} Response body text.
 * @throws {Error} If `fetch` is unavailable or the response is not OK.
 */
async function defaultFetchText(url) {
    if (typeof fetch === "undefined") {
        throw new Error("global fetch is not available; provide a fetchText function");
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Perchance request failed: HTTP ${response.status} ${response.statusText}`);
    }
    return response.text();
}

const api = {
    DEFAULT_GENERATOR,
    generatorSourceUrl,
    parseGenerator,
    parseOption,
    pickWeighted,
    resolveReferences,
    generate,
    PerchanceClient
};

// Support both Node.js (CommonJS) and browser (global) environments.
if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
}
if (typeof window !== "undefined") {
    window.Perchance = api;
}
