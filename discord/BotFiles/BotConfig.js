/**
 * @module BotConfig
 * @description Centralized configuration loader for the Discord bot.
 *
 * Supports loading from environment variables (.env via dotenv) with
 * fallback to Settings.json for backwards compatibility.
 *
 * Hook: H02:SettingsLoad — emitted after settings are loaded.
 */

const fs = require("fs");
const path = require("path");

const SETTINGS_PATH = path.join(__dirname, "BotData", "Settings", "Settings.json");
const ENV_PATH = path.join(__dirname, ".env");

/**
 * Load bot configuration from environment or Settings.json.
 * Environment variables take priority over JSON settings.
 *
 * @param {Object} [hookRegistry] - Optional HookRegistry to emit H02:SettingsLoad
 * @returns {Object} Merged configuration object
 */
function loadConfig(hookRegistry) {
    // Attempt to load dotenv if .env file exists
    if (fs.existsSync(ENV_PATH)) {
        try {
            require("dotenv").config({ path: ENV_PATH });
        } catch (_err) {
            // dotenv not installed — fall through to JSON
        }
    }

    // Load the JSON settings file
    let jsonSettings = {};
    try {
        jsonSettings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    } catch (err) {
        console.warn(`[BotConfig] Could not load ${SETTINGS_PATH}: ${err.message}`);
    }

    // Merge: env vars take priority
    const config = {
        token: process.env.DISCORD_TOKEN || jsonSettings.token || "",
        clientid: process.env.DISCORD_CLIENT_ID || jsonSettings.clientid || "",
        prefix: process.env.COMMAND_PREFIX || jsonSettings.prefix || "!"
    };

    if (hookRegistry) {
        hookRegistry.trigger("H02:SettingsLoad", {
            source: process.env.DISCORD_TOKEN ? "env" : "json",
            hasToken: config.token.length > 0,
            prefix: config.prefix
        });
    }

    return config;
}

/**
 * Validate that the configuration has all required fields.
 * @param {Object} config
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateConfig(config) {
    const errors = [];
    if (!config.token) {
        errors.push("Bot token is missing. Set DISCORD_TOKEN in .env or token in Settings.json.");
    }
    if (!config.prefix) {
        errors.push("Command prefix is missing.");
    }
    return { valid: errors.length === 0, errors };
}

module.exports = { loadConfig, validateConfig };
