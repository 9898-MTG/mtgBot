/**
 * @module HookRegistry
 * @description Event-driven hook system for the mtgBot platform.
 *
 * Implements the hook architecture documented in hooks/HOOKS.md.
 * Hooks are integration points where custom logic can be triggered
 * in response to events across the Discord bot, web apps, and agent systems.
 *
 * Usage:
 *   const { HookRegistry } = require('./hooks/HookRegistry');
 *   const hooks = new HookRegistry();
 *   hooks.register('H01:BotInit', (payload) => { ... });
 *   hooks.emit('H01:BotInit', { guild, timestamp });
 */

const EventEmitter = require("events");

/**
 * @typedef {Object} HookDefinition
 * @property {string} id - Unique hook identifier (e.g. "H01")
 * @property {string} name - Human-readable name
 * @property {string} category - Hook category (lifecycle, message, event, moderation, web, agent, variable)
 * @property {string} description - What triggers this hook
 * @property {string} source - Source file
 * @property {Object} [schema] - Expected payload shape
 */

/** Built-in hook definitions matching HOOKS.md */
const HOOK_DEFINITIONS = {
    // Lifecycle Hooks
    "H01:BotInit": {
        id: "H01",
        name: "Bot Initialization",
        category: "lifecycle",
        description: "Bot connects to Discord successfully",
        source: "discord/BotFiles/bot.js"
    },
    "H02:SettingsLoad": {
        id: "H02",
        name: "Settings Load",
        category: "lifecycle",
        description: "Settings.json is read at startup",
        source: "discord/BotFiles/bot.js"
    },
    "H03:BotReady": {
        id: "H03",
        name: "Bot Ready",
        category: "lifecycle",
        description: "Bot fully initialized and ready to process events",
        source: "discord/BotFiles/bot.js"
    },
    "H04:BotShutdown": {
        id: "H04",
        name: "Bot Shutdown",
        category: "lifecycle",
        description: "Bot is shutting down gracefully",
        source: "discord/BotFiles/bot.js"
    },

    // Message Hooks
    "H10:MessageReceived": {
        id: "H10",
        name: "Message Received",
        category: "message",
        description: "Any message in a monitored channel",
        source: "discord/BotFiles/Handlers/Message.js"
    },
    "H11:CommandParsed": {
        id: "H11",
        name: "Command Parsed",
        category: "message",
        description: "A command prefix message is identified and parsed",
        source: "discord/BotFiles/bot.js"
    },
    "H12:CommandExecuted": {
        id: "H12",
        name: "Command Executed",
        category: "message",
        description: "Valid command executed with proper permissions",
        source: "discord/BotFiles/Handlers/Message.js"
    },
    "H13:ActionExecuted": {
        id: "H13",
        name: "Action Executed",
        category: "message",
        description: "An individual action in a command sequence completes",
        source: "discord/BotFiles/Handlers/Message.js"
    },

    // Event Hooks
    "H20:MemberJoin": {
        id: "H20",
        name: "Member Join",
        category: "event",
        description: "New member joins the server",
        source: "discord/BotFiles/bot.js"
    },
    "H21:MemberLeave": {
        id: "H21",
        name: "Member Leave",
        category: "event",
        description: "Member leaves or is removed from server",
        source: "discord/BotFiles/bot.js"
    },
    "H22:EventHandled": {
        id: "H22",
        name: "Event Handled",
        category: "event",
        description: "A Discord event has been processed by the event handler",
        source: "discord/BotFiles/Handlers/Events.js"
    },
    "H23:InteractionReceived": {
        id: "H23",
        name: "Interaction Received",
        category: "event",
        description: "Button, select menu, or slash command interaction",
        source: "discord/BotFiles/bot.js"
    },

    // Moderation Hooks
    "H30:SpamDetected": {
        id: "H30",
        name: "Spam Detected",
        category: "moderation",
        description: "Anti-spam system detects potential spam",
        source: "discord/BotFiles/bot.js"
    },
    "H31:UserBanned": {
        id: "H31",
        name: "User Banned",
        category: "moderation",
        description: "User is banned from the server",
        source: "discord/BotFiles/bot.js"
    },
    "H32:UserKicked": {
        id: "H32",
        name: "User Kicked",
        category: "moderation",
        description: "User is kicked from the server",
        source: "discord/BotFiles/bot.js"
    },

    // Variable System Hooks
    "H40:VarRead": {
        id: "H40",
        name: "Variable Read",
        category: "variable",
        description: "A variable is read from the cache",
        source: "discord/BotFiles/BotData/varcache.js"
    },
    "H41:VarWrite": {
        id: "H41",
        name: "Variable Write",
        category: "variable",
        description: "A variable is written to the cache",
        source: "discord/BotFiles/BotData/varcache.js"
    },
    "H42:VarsPersisted": {
        id: "H42",
        name: "Variables Persisted",
        category: "variable",
        description: "Variables are written to disk (servervars.json / globalvars.json)",
        source: "discord/BotFiles/bot.js"
    },

    // Web Application Hooks
    "H50:BoosterGenerated": {
        id: "H50",
        name: "Booster Generated",
        category: "web",
        description: "A booster pack is generated via Scryfall API",
        source: "generateBooster/script.js"
    },
    "H51:DraftStarted": {
        id: "H51",
        name: "Draft Started",
        category: "web",
        description: "A Chaos Commander draft pack is generated",
        source: "chaos_commander_drafting/script.js"
    },
    "H52:ApiRequest": {
        id: "H52",
        name: "API Request",
        category: "web",
        description: "An external API call is made (Scryfall, etc.)",
        source: "lib/utils.js"
    },
    "H53:NavChange": {
        id: "H53",
        name: "Navigation Change",
        category: "web",
        description: "User navigates via the main menu",
        source: "script.js"
    }
};

/**
 * HookRegistry — central event bus for the mtgBot platform.
 *
 * @extends EventEmitter
 * @example
 *   const hooks = new HookRegistry();
 *   hooks.register('H01:BotInit', (payload) => console.log('Bot started!', payload));
 *   hooks.emit('H01:BotInit', { guild: myGuild, timestamp: Date.now() });
 */
class HookRegistry extends EventEmitter {
    /**
     * @param {Object} [options]
     * @param {boolean} [options.debug=false] - Log all hook emissions to console
     * @param {number} [options.maxListeners=50] - Max listeners per hook
     */
    constructor(options = {}) {
        super();
        this.debug = options.debug || false;
        this.setMaxListeners(options.maxListeners || 50);

        /** @type {Map<string, HookDefinition>} */
        this.definitions = new Map(Object.entries(HOOK_DEFINITIONS));

        /** @type {Array<{hook: string, timestamp: number, payload: Object}>} */
        this.history = [];

        /** @type {number} */
        this.maxHistory = options.maxHistory || 100;
    }

    /**
     * Register a listener for a specific hook.
     * @param {string} hookName - The hook identifier (e.g. "H01:BotInit")
     * @param {Function} handler - Callback receiving the hook payload
     * @returns {this}
     */
    register(hookName, handler) {
        if (this.debug) {
            console.log(`[HookRegistry] Registered listener for ${hookName}`);
        }
        this.on(hookName, handler);
        return this;
    }

    /**
     * Register a one-time listener for a specific hook.
     * @param {string} hookName - The hook identifier
     * @param {Function} handler - Callback receiving the hook payload
     * @returns {this}
     */
    registerOnce(hookName, handler) {
        if (this.debug) {
            console.log(`[HookRegistry] Registered one-time listener for ${hookName}`);
        }
        this.once(hookName, handler);
        return this;
    }

    /**
     * Unregister a specific listener from a hook.
     * @param {string} hookName - The hook identifier
     * @param {Function} handler - The handler to remove
     * @returns {this}
     */
    unregister(hookName, handler) {
        this.removeListener(hookName, handler);
        return this;
    }

    /**
     * Emit a hook event with payload.
     * @param {string} hookName - The hook identifier
     * @param {Object} [payload={}] - Data to pass to listeners
     * @returns {boolean} - Whether any listeners were called
     */
    trigger(hookName, payload = {}) {
        const entry = {
            hook: hookName,
            timestamp: Date.now(),
            payload
        };

        // Maintain bounded history
        this.history.push(entry);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        if (this.debug) {
            console.log(`[HookRegistry] Trigger: ${hookName}`, payload);
        }

        return this.emit(hookName, payload);
    }

    /**
     * Get the definition of a registered hook.
     * @param {string} hookName
     * @returns {HookDefinition|undefined}
     */
    getDefinition(hookName) {
        return this.definitions.get(hookName);
    }

    /**
     * Register a custom hook definition.
     * @param {string} hookName - The hook identifier
     * @param {HookDefinition} definition - Hook metadata
     * @returns {this}
     */
    defineHook(hookName, definition) {
        this.definitions.set(hookName, definition);
        return this;
    }

    /**
     * Get all hook definitions, optionally filtered by category.
     * @param {string} [category] - Filter by category
     * @returns {Array<[string, HookDefinition]>}
     */
    listHooks(category) {
        const entries = Array.from(this.definitions.entries());
        if (category) {
            return entries.filter(([, def]) => def.category === category);
        }
        return entries;
    }

    /**
     * Get the recent hook emission history.
     * @param {number} [count=10] - Number of recent entries
     * @returns {Array<{hook: string, timestamp: number, payload: Object}>}
     */
    getHistory(count = 10) {
        return this.history.slice(-count);
    }

    /**
     * Get a summary of all hook listener counts.
     * @returns {Object<string, number>}
     */
    getListenerSummary() {
        const summary = {};
        for (const [hookName] of this.definitions) {
            const count = this.listenerCount(hookName);
            if (count > 0) {
                summary[hookName] = count;
            }
        }
        return summary;
    }

    /**
     * Remove all listeners and clear history.
     */
    reset() {
        this.removeAllListeners();
        this.history = [];
    }
}

module.exports = { HookRegistry, HOOK_DEFINITIONS };
