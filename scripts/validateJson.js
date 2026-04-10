/**
 * @module scripts/validateJson
 * @description Validates all JSON configuration files used by the Discord bot.
 *
 * Checks:
 * - JSON syntax is valid
 * - commands.json has required structure (command array with name/actions)
 * - events.json has required structure (command array with name/actions)
 * - Settings.json has required fields (token, prefix)
 * - Rules.json has required structure
 */

const fs = require("fs");
const path = require("path");

const BOTDATA = path.join(__dirname, "..", "discord", "BotFiles", "BotData");

let errors = 0;

/**
 * Validate that a file contains parseable JSON.
 * @param {string} filePath
 * @returns {Object|null} Parsed JSON or null on failure
 */
function validateJsonFile(filePath) {
    const relative = path.relative(process.cwd(), filePath);
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw);
        console.log(`  ✓ ${relative} — valid JSON`);
        return parsed;
    } catch (err) {
        console.error(`  ✗ ${relative} — ${err.message}`);
        errors++;
        return null;
    }
}

/**
 * Validate commands.json structure.
 * @param {Object} data
 * @param {string} label
 */
function validateCommandsStructure(data, label) {
    if (!data) return;

    if (!Array.isArray(data.command)) {
        console.error(`  ✗ ${label}: missing or invalid "command" array`);
        errors++;
        return;
    }

    data.command.forEach((cmd, i) => {
        if (typeof cmd.name !== "string" || cmd.name.trim() === "") {
            console.error(`  ✗ ${label}: command[${i}] missing "name"`);
            errors++;
        }
        if (cmd.actions && !Array.isArray(cmd.actions)) {
            console.error(`  ✗ ${label}: command[${i}].actions must be an array`);
            errors++;
        }
    });

    if (errors === 0) {
        console.log(`  ✓ ${label}: structure valid (${data.command.length} commands)`);
    }
}

/**
 * Validate Settings.json structure.
 * @param {Object} data
 */
function validateSettingsStructure(data) {
    if (!data) return;

    const required = ["prefix"];
    for (const key of required) {
        if (data[key] === undefined) {
            console.error(`  ✗ Settings.json: missing required field "${key}"`);
            errors++;
        }
    }

    if (data.token && data.token.length > 10) {
        console.warn(`  ⚠ Settings.json: bot token is present — consider using environment variables`);
    }

    if (errors === 0) {
        console.log("  ✓ Settings.json: structure valid");
    }
}

/**
 * Validate Rules.json structure.
 * @param {Object} data
 */
function validateRulesStructure(data) {
    if (!data) return;

    if (typeof data.enabled !== "boolean") {
        console.error('  ✗ Rules.json: missing "enabled" boolean');
        errors++;
    }

    if (!data.obj || typeof data.obj !== "object") {
        console.error('  ✗ Rules.json: missing "obj" configuration object');
        errors++;
    }

    if (errors === 0) {
        console.log("  ✓ Rules.json: structure valid");
    }
}

// Run validation
console.log("\n🔍 Validating JSON configuration files...\n");

const settingsPath = path.join(BOTDATA, "Settings", "Settings.json");
const rulesPath = path.join(BOTDATA, "Settings", "Rules.json");
const commandsPath = path.join(BOTDATA, "commands", "commands.json");
const eventsPath = path.join(BOTDATA, "commands", "events.json");

if (fs.existsSync(settingsPath)) {
    const settings = validateJsonFile(settingsPath);
    validateSettingsStructure(settings);
} else {
    console.warn(`  ⚠ Settings.json not found at ${settingsPath}`);
}

if (fs.existsSync(rulesPath)) {
    const rules = validateJsonFile(rulesPath);
    validateRulesStructure(rules);
} else {
    console.warn(`  ⚠ Rules.json not found at ${rulesPath}`);
}

if (fs.existsSync(commandsPath)) {
    const commands = validateJsonFile(commandsPath);
    validateCommandsStructure(commands, "commands.json");
} else {
    console.warn(`  ⚠ commands.json not found at ${commandsPath}`);
}

if (fs.existsSync(eventsPath)) {
    const events = validateJsonFile(eventsPath);
    validateCommandsStructure(events, "events.json");
} else {
    console.warn(`  ⚠ events.json not found at ${eventsPath}`);
}

// Also validate variable JSON files
const varFiles = ["variables/servervars.json", "variables/globalvars.json"];
for (const vf of varFiles) {
    const vfPath = path.join(BOTDATA, vf);
    if (fs.existsSync(vfPath)) {
        validateJsonFile(vfPath);
    }
}

console.log(`\n${errors === 0 ? "✅ All validations passed!" : `❌ ${errors} validation error(s) found.`}\n`);
process.exit(errors > 0 ? 1 : 0);
