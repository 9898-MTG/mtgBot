/**
 * @file Shared utilities unit tests
 */

const {
    randomChoice,
    shuffle,
    sleep,
    requireString,
    requirePositiveInt,
    deepClone,
    getNestedValue,
    formatTimestamp
} = require("../utils");

describe("lib/utils", () => {
    describe("randomChoice", () => {
        it("should return an element from the array", () => {
            const arr = [1, 2, 3, 4, 5];
            const result = randomChoice(arr);
            expect(arr).toContain(result);
        });

        it("should return undefined for empty array", () => {
            expect(randomChoice([])).toBeUndefined();
        });

        it("should return undefined for non-array", () => {
            expect(randomChoice(null)).toBeUndefined();
            expect(randomChoice("string")).toBeUndefined();
        });
    });

    describe("shuffle", () => {
        it("should return the same array reference", () => {
            const arr = [1, 2, 3];
            const result = shuffle(arr);
            expect(result).toBe(arr);
        });

        it("should contain all original elements", () => {
            const arr = [1, 2, 3, 4, 5];
            shuffle(arr);
            expect(arr.sort()).toEqual([1, 2, 3, 4, 5]);
        });

        it("should handle single-element arrays", () => {
            const arr = [42];
            shuffle(arr);
            expect(arr).toEqual([42]);
        });
    });

    describe("sleep", () => {
        it("should resolve after the specified time", async () => {
            const start = Date.now();
            await sleep(50);
            const elapsed = Date.now() - start;
            expect(elapsed).toBeGreaterThanOrEqual(40);
        });
    });

    describe("requireString", () => {
        it("should return trimmed string", () => {
            expect(requireString("  hello  ")).toBe("hello");
        });

        it("should throw for empty string", () => {
            expect(() => requireString("")).toThrow("must be a non-empty string");
        });

        it("should throw for non-string", () => {
            expect(() => requireString(123, "myField")).toThrow("myField must be a non-empty string");
        });
    });

    describe("requirePositiveInt", () => {
        it("should return parsed integer", () => {
            expect(requirePositiveInt("5")).toBe(5);
            expect(requirePositiveInt(10)).toBe(10);
        });

        it("should throw for zero", () => {
            expect(() => requirePositiveInt(0)).toThrow("must be a positive integer");
        });

        it("should throw for negative", () => {
            expect(() => requirePositiveInt(-1)).toThrow("must be a positive integer");
        });

        it("should throw for non-numeric", () => {
            expect(() => requirePositiveInt("abc")).toThrow("must be a positive integer");
        });
    });

    describe("deepClone", () => {
        it("should create a deep copy", () => {
            const obj = { a: { b: { c: 1 } } };
            const clone = deepClone(obj);
            expect(clone).toEqual(obj);
            expect(clone).not.toBe(obj);
            expect(clone.a).not.toBe(obj.a);
        });
    });

    describe("getNestedValue", () => {
        const obj = { user: { profile: { name: "Alice", level: 5 } } };

        it("should access nested properties", () => {
            expect(getNestedValue(obj, "user.profile.name")).toBe("Alice");
        });

        it("should return default for missing paths", () => {
            expect(getNestedValue(obj, "user.missing.key", "default")).toBe("default");
        });

        it("should return undefined without default", () => {
            expect(getNestedValue(obj, "user.missing.key")).toBeUndefined();
        });

        it("should handle null objects", () => {
            expect(getNestedValue(null, "key", "fallback")).toBe("fallback");
        });
    });

    describe("formatTimestamp", () => {
        it("should format a date", () => {
            const result = formatTimestamp(new Date("2024-01-15T12:00:00Z"));
            expect(result).toBe("2024-01-15 12:00:00 UTC");
        });

        it("should format a numeric timestamp", () => {
            const result = formatTimestamp(0);
            expect(result).toBe("1970-01-01 00:00:00 UTC");
        });
    });
});
