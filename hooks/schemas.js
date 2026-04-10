/**
 * @module hooks/schemas
 * @description JSON-like schemas defining the expected payload shape for each hook.
 *
 * These schemas serve as documentation and can be used for runtime validation.
 * Each schema maps hook names to their expected payload properties.
 */

const HOOK_SCHEMAS = {
    // Lifecycle Hooks
    "H01:BotInit": {
        description: "Bot connects to Discord successfully",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            timestamp: { type: "number", description: "Unix timestamp of initialization" }
        }
    },
    "H02:SettingsLoad": {
        description: "Settings are loaded from .env or Settings.json",
        payload: {
            source: { type: "string", enum: ["env", "json"], description: "Configuration source" },
            hasToken: { type: "boolean", description: "Whether a bot token was found" },
            prefix: { type: "string", description: "Command prefix" }
        }
    },
    "H03:BotReady": {
        description: "Bot fully initialized and ready to process events",
        payload: {
            guildCount: { type: "number", description: "Number of guilds the bot is in" },
            timestamp: { type: "number", description: "Unix timestamp" }
        }
    },
    "H04:BotShutdown": {
        description: "Bot is shutting down gracefully",
        payload: {
            reason: { type: "string", description: "Shutdown reason" },
            timestamp: { type: "number", description: "Unix timestamp" }
        }
    },

    // Message Hooks
    "H10:MessageReceived": {
        description: "Any message received in a monitored channel",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            message: { type: "object", description: "Discord Message object" },
            isCommand: { type: "boolean", description: "Whether the message starts with the command prefix" }
        }
    },
    "H11:CommandParsed": {
        description: "A command prefix message is parsed",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            commandName: { type: "string", description: "Parsed command name" },
            args: { type: "array", items: "string", description: "Parsed command arguments" },
            message: { type: "object", description: "Discord Message object" }
        }
    },
    "H12:CommandExecuted": {
        description: "A command is executed with proper permissions",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            commandName: { type: "string", description: "Executed command name" },
            args: { type: "array", items: "string", description: "Command arguments" },
            success: { type: "boolean", description: "Whether the command succeeded" }
        }
    },
    "H13:ActionExecuted": {
        description: "An individual action in a command sequence completes",
        payload: {
            actionType: { type: "string", description: "Type of action executed" },
            actionName: { type: "string", description: "Name of the action" },
            index: { type: "number", description: "Action index in the sequence" }
        }
    },

    // Event Hooks
    "H20:MemberJoin": {
        description: "New member joins the server",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            member: { type: "object", description: "Discord GuildMember object" }
        }
    },
    "H21:MemberLeave": {
        description: "Member leaves or is removed from the server",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            member: { type: "object", description: "Discord GuildMember object" }
        }
    },
    "H22:EventHandled": {
        description: "A Discord event has been processed",
        payload: {
            type: { type: "string", description: "Event type name" },
            guild: { type: "object", description: "Discord Guild object" }
        }
    },
    "H23:InteractionReceived": {
        description: "Button, select menu, or slash command interaction",
        payload: {
            type: { type: "string", enum: ["button", "select", "command"], description: "Interaction type" },
            guild: { type: "object", description: "Discord Guild object" },
            interaction: { type: "object", description: "Discord Interaction object" }
        }
    },

    // Moderation Hooks
    "H30:SpamDetected": {
        description: "Anti-spam system detects potential spam",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            user: { type: "object", description: "Discord User object" },
            action: { type: "string", enum: ["warn", "kick", "ban"], description: "Moderation action taken" }
        }
    },
    "H31:UserBanned": {
        description: "User is banned from the server",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            user: { type: "object", description: "Banned Discord User object" }
        }
    },
    "H32:UserKicked": {
        description: "User is kicked from the server",
        payload: {
            guild: { type: "object", description: "Discord Guild object" },
            member: { type: "object", description: "Kicked Discord GuildMember object" }
        }
    },

    // Variable System Hooks
    "H40:VarRead": {
        description: "A variable is read from the cache",
        payload: {
            guildId: { type: "string", description: "Guild ID" },
            name: { type: "string", description: "Variable name" },
            value: { type: "any", description: "Variable value" }
        }
    },
    "H41:VarWrite": {
        description: "A variable is written to the cache",
        payload: {
            guildId: { type: "string", description: "Guild ID" },
            name: { type: "string", description: "Variable name" },
            oldValue: { type: "any", description: "Previous value" },
            newValue: { type: "any", description: "New value" }
        }
    },
    "H42:VarsPersisted": {
        description: "Variables are written to disk",
        payload: {
            scope: { type: "string", enum: ["server", "global"], description: "Variable scope" },
            timestamp: { type: "number", description: "Unix timestamp" }
        }
    },

    // Web Application Hooks
    "H50:BoosterGenerated": {
        description: "A booster pack is generated via Scryfall API",
        payload: {
            syntax: { type: "string", description: "Scryfall search syntax used" },
            cardCount: { type: "number", description: "Number of cards returned" },
            success: { type: "boolean", description: "Whether generation succeeded" }
        }
    },
    "H51:DraftStarted": {
        description: "A Chaos Commander draft pack is generated",
        payload: {
            cardCount: { type: "number", description: "Number of cards in the draft pack" },
            success: { type: "boolean", description: "Whether draft generation succeeded" }
        }
    },
    "H52:ApiRequest": {
        description: "An external API call is made",
        payload: {
            url: { type: "string", description: "API URL" },
            method: { type: "string", description: "HTTP method" },
            status: { type: "number", description: "HTTP status code" },
            duration: { type: "number", description: "Request duration in ms" }
        }
    },
    "H53:NavChange": {
        description: "User navigates via the main menu",
        payload: {
            from: { type: "string", description: "Previous page" },
            to: { type: "string", description: "Target page" }
        }
    }
};

/**
 * Validate a hook payload against its schema.
 * Returns an array of validation errors (empty if valid).
 *
 * @param {string} hookName - The hook identifier
 * @param {Object} payload - The payload to validate
 * @returns {string[]} Array of validation error messages
 */
function validateHookPayload(hookName, payload) {
    const schema = HOOK_SCHEMAS[hookName];
    if (!schema) {
        return [`Unknown hook: ${hookName}`];
    }

    const errors = [];
    const payloadSchema = schema.payload || {};

    for (const [key, spec] of Object.entries(payloadSchema)) {
        if (payload[key] === undefined) {
            // Missing fields are warnings, not errors — payloads are flexible
            continue;
        }

        if (spec.type !== "any" && spec.type !== "array" && spec.type !== "object") {
            if (typeof payload[key] !== spec.type) {
                errors.push(`${hookName}.${key}: expected ${spec.type}, got ${typeof payload[key]}`);
            }
        }

        if (spec.enum && !spec.enum.includes(payload[key])) {
            errors.push(`${hookName}.${key}: value "${payload[key]}" not in enum [${spec.enum.join(", ")}]`);
        }
    }

    return errors;
}

module.exports = { HOOK_SCHEMAS, validateHookPayload };
