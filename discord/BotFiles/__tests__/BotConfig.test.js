/**
 * @file BotConfig unit tests
 */

const path = require("path");

// We need to test loadConfig and validateConfig in isolation.
// The module reads files at import time, so we test the validation logic.
const { validateConfig } = require("../BotConfig");

describe("BotConfig", () => {
    describe("validateConfig", () => {
        it("should validate a complete config", () => {
            const config = { token: "test-token", clientid: "123", prefix: "!" };
            const result = validateConfig(config);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should fail when token is missing", () => {
            const config = { token: "", clientid: "123", prefix: "!" };
            const result = validateConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain("token");
        });

        it("should fail when prefix is missing", () => {
            const config = { token: "test", clientid: "123", prefix: "" };
            const result = validateConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes("prefix"))).toBe(true);
        });
    });
});
