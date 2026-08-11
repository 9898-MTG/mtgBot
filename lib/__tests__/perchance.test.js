/**
 * @file Perchance generator client unit tests
 */

const {
    generatorSourceUrl,
    parseGenerator,
    parseOption,
    pickWeighted,
    resolveReferences,
    generate,
    PerchanceClient
} = require("../perchance");

/**
 * Create a deterministic pseudo-random function that cycles through values.
 * @param {number[]} values Sequence of [0,1) values to return.
 * @returns {() => number} Seeded rng.
 */
function seededRng(values) {
    let i = 0;
    return () => values[i++ % values.length];
}

const SAMPLE = `
// A tiny MTG chaos generator
output
  [creature] attacks with [keyword]

creature
  Goblin
  Dragon ^3

keyword
  flying
  trample
`;

describe("lib/perchance", () => {
    describe("generatorSourceUrl", () => {
        it("builds the Perchance download URL with encoding", () => {
            expect(generatorSourceUrl("9898-mtg-chaos-rpg-2024")).toBe(
                "https://perchance.org/api/downloadGenerator?generatorName=9898-mtg-chaos-rpg-2024"
            );
            expect(generatorSourceUrl("a b")).toContain("a%20b");
        });
    });

    describe("parseOption", () => {
        it("parses plain options with default weight", () => {
            expect(parseOption("flying")).toEqual({ text: "flying", weight: 1 });
        });

        it("parses weighted options", () => {
            expect(parseOption("Dragon ^3")).toEqual({ text: "Dragon", weight: 3 });
        });

        it("ignores non-positive weights", () => {
            expect(parseOption("x ^0")).toEqual({ text: "x", weight: 1 });
        });
    });

    describe("parseGenerator", () => {
        it("parses lists, options, weights, and skips comments", () => {
            const lists = parseGenerator(SAMPLE);
            expect(Object.keys(lists).sort()).toEqual(["creature", "keyword", "output"]);
            expect(lists.creature).toEqual([
                { text: "Goblin", weight: 1 },
                { text: "Dragon", weight: 3 }
            ]);
            expect(lists.output).toHaveLength(1);
        });

        it("throws on non-string input", () => {
            expect(() => parseGenerator(null)).toThrow(TypeError);
        });
    });

    describe("pickWeighted", () => {
        it("returns empty string for empty lists", () => {
            expect(pickWeighted([], Math.random)).toBe("");
        });

        it("respects weights via the rng threshold", () => {
            const options = [
                { text: "a", weight: 1 },
                { text: "b", weight: 3 }
            ];
            // total weight = 4; rng 0 -> first bucket, rng 0.5 -> second bucket
            expect(pickWeighted(options, () => 0)).toBe("a");
            expect(pickWeighted(options, () => 0.5)).toBe("b");
        });
    });

    describe("resolveReferences", () => {
        it("resolves nested references recursively", () => {
            const lists = parseGenerator(SAMPLE);
            const rng = seededRng([0, 0]); // pick first creature, first keyword
            const out = resolveReferences(lists, "[creature] uses [keyword]", rng);
            expect(out).toBe("Goblin uses flying");
        });

        it("leaves unknown references untouched", () => {
            const out = resolveReferences({}, "value is [missing]", Math.random);
            expect(out).toBe("value is [missing]");
        });
    });

    describe("generate", () => {
        it("produces deterministic output with a seeded rng", () => {
            const lists = parseGenerator(SAMPLE);
            const rng = seededRng([0, 0, 0]); // output[0], creature[0], keyword[0]
            expect(generate(lists, { rng })).toBe("Goblin attacks with flying");
        });

        it("throws when the root list is missing", () => {
            expect(() => generate({}, { root: "output" })).toThrow(/no "output" list/);
        });
    });

    describe("PerchanceClient", () => {
        it("loads a generator via injected fetchText and generates", async () => {
            const fetchText = jest.fn().mockResolvedValue(SAMPLE);
            const client = new PerchanceClient({ generator: "test-gen", fetchText });

            const out = await client.generate({ rng: seededRng([0, 1, 0]) });

            expect(fetchText).toHaveBeenCalledWith(
                "https://perchance.org/api/downloadGenerator?generatorName=test-gen"
            );
            // creature rng 1 -> "Dragon" (last bucket), keyword rng 0 -> "flying"
            expect(out).toBe("Dragon attacks with flying");
        });

        it("caches the parsed generator across calls", async () => {
            const fetchText = jest.fn().mockResolvedValue(SAMPLE);
            const client = new PerchanceClient({ fetchText });
            await client.generate({ rng: () => 0 });
            await client.generate({ rng: () => 0 });
            expect(fetchText).toHaveBeenCalledTimes(1);
        });
    });
});
