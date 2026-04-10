/**
 * @module lib/utils
 * @description Shared utility functions for the mtgBot platform.
 *
 * Provides common helpers for API calls, DOM manipulation, error handling,
 * and random selection — used by both web apps and Node.js scripts.
 */

/**
 * Pick a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
function randomChoice(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm.
 * @param {Array} arr
 * @returns {Array} The same array, shuffled
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Wait for the specified number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch JSON from a URL with retry logic and timeout.
 * Works in both browser (fetch) and Node.js (node-fetch) environments.
 *
 * @param {string} url - URL to fetch
 * @param {Object} [options]
 * @param {number} [options.retries=3] - Number of retry attempts
 * @param {number} [options.retryDelay=1000] - Delay between retries in ms
 * @param {number} [options.timeout=10000] - Request timeout in ms
 * @param {Object} [options.fetchOptions={}] - Additional fetch options
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} After all retries are exhausted
 */
async function fetchJson(url, options = {}) {
    const { retries = 3, retryDelay = 1000, timeout = 10000, fetchOptions = {} } = options;

    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
            const timeoutId = controller ? setTimeout(() => controller.abort(), timeout) : null;

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller ? controller.signal : undefined
            });

            if (timeoutId) clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                await sleep(retryDelay * attempt);
            }
        }
    }

    throw new Error(`fetchJson failed after ${retries} attempts: ${lastError.message}`);
}

/**
 * Validate that a value is a non-empty string.
 * @param {*} value
 * @param {string} [name="value"]
 * @returns {string} The validated string
 * @throws {Error} If value is not a non-empty string
 */
function requireString(value, name = "value") {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${name} must be a non-empty string`);
    }
    return value.trim();
}

/**
 * Validate that a value is a positive integer.
 * @param {*} value
 * @param {string} [name="value"]
 * @returns {number}
 * @throws {Error} If value is not a positive integer
 */
function requirePositiveInt(value, name = "value") {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
        throw new Error(`${name} must be a positive integer`);
    }
    return num;
}

/**
 * Deep clone a plain object using JSON serialization.
 * @param {Object} obj
 * @returns {Object}
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Safely access a nested property by path string.
 * @param {Object} obj - The object to search
 * @param {string} path - Dot-separated property path (e.g. "user.profile.name")
 * @param {*} [defaultValue] - Return value if path not found
 * @returns {*}
 */
function getNestedValue(obj, path, defaultValue = undefined) {
    const keys = path.split(".");
    let current = obj;
    for (const key of keys) {
        if (current == null || typeof current !== "object") {
            return defaultValue;
        }
        current = current[key];
    }
    return current !== undefined ? current : defaultValue;
}

/**
 * Format a timestamp as a readable date string.
 * @param {number|Date} [date=Date.now()]
 * @returns {string} Formatted date string
 */
function formatTimestamp(date) {
    const d = date instanceof Date ? date : new Date(date !== undefined && date !== null ? date : Date.now());
    return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

// Export for both CommonJS (Node.js) and ES modules (browser)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        randomChoice,
        shuffle,
        sleep,
        fetchJson,
        requireString,
        requirePositiveInt,
        deepClone,
        getNestedValue,
        formatTimestamp
    };
}
