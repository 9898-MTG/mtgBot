/**
 * @file HookRegistry unit tests
 */

const { HookRegistry, HOOK_DEFINITIONS } = require("../../hooks/HookRegistry");

describe("HookRegistry", () => {
    let registry;

    beforeEach(() => {
        registry = new HookRegistry();
    });

    afterEach(() => {
        registry.reset();
    });

    describe("constructor", () => {
        it("should initialize with all built-in hook definitions", () => {
            const defs = registry.listHooks();
            expect(defs.length).toBeGreaterThan(0);
            expect(defs.length).toBe(Object.keys(HOOK_DEFINITIONS).length);
        });

        it("should accept debug option", () => {
            const debugRegistry = new HookRegistry({ debug: true });
            expect(debugRegistry.debug).toBe(true);
        });

        it("should accept maxListeners option", () => {
            const reg = new HookRegistry({ maxListeners: 100 });
            expect(reg.getMaxListeners()).toBe(100);
        });
    });

    describe("register", () => {
        it("should register a listener for a hook", () => {
            const handler = jest.fn();
            registry.register("H01:BotInit", handler);
            expect(registry.listenerCount("H01:BotInit")).toBe(1);
        });

        it("should allow multiple listeners on same hook", () => {
            registry.register("H01:BotInit", jest.fn());
            registry.register("H01:BotInit", jest.fn());
            expect(registry.listenerCount("H01:BotInit")).toBe(2);
        });

        it("should return the registry for chaining", () => {
            const result = registry.register("H01:BotInit", jest.fn());
            expect(result).toBe(registry);
        });
    });

    describe("registerOnce", () => {
        it("should only fire the listener once", () => {
            const handler = jest.fn();
            registry.registerOnce("H01:BotInit", handler);

            registry.trigger("H01:BotInit", { test: 1 });
            registry.trigger("H01:BotInit", { test: 2 });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({ test: 1 });
        });
    });

    describe("unregister", () => {
        it("should remove a specific listener", () => {
            const handler = jest.fn();
            registry.register("H01:BotInit", handler);
            expect(registry.listenerCount("H01:BotInit")).toBe(1);

            registry.unregister("H01:BotInit", handler);
            expect(registry.listenerCount("H01:BotInit")).toBe(0);
        });
    });

    describe("trigger", () => {
        it("should call registered listeners with payload", () => {
            const handler = jest.fn();
            registry.register("H01:BotInit", handler);

            const payload = { guild: "test-guild", timestamp: Date.now() };
            registry.trigger("H01:BotInit", payload);

            expect(handler).toHaveBeenCalledWith(payload);
        });

        it("should return true if listeners were called", () => {
            registry.register("H01:BotInit", jest.fn());
            expect(registry.trigger("H01:BotInit")).toBe(true);
        });

        it("should return false if no listeners", () => {
            expect(registry.trigger("H01:BotInit")).toBe(false);
        });

        it("should add to history", () => {
            registry.trigger("H01:BotInit", { test: true });
            const history = registry.getHistory();
            expect(history.length).toBe(1);
            expect(history[0].hook).toBe("H01:BotInit");
            expect(history[0].payload).toEqual({ test: true });
            expect(history[0].timestamp).toBeDefined();
        });

        it("should maintain bounded history", () => {
            const reg = new HookRegistry({ maxHistory: 3 });
            reg.trigger("H01:BotInit", { n: 1 });
            reg.trigger("H01:BotInit", { n: 2 });
            reg.trigger("H01:BotInit", { n: 3 });
            reg.trigger("H01:BotInit", { n: 4 });

            const history = reg.getHistory(10);
            expect(history.length).toBe(3);
            expect(history[0].payload.n).toBe(2);
        });
    });

    describe("getDefinition", () => {
        it("should return a built-in definition", () => {
            const def = registry.getDefinition("H01:BotInit");
            expect(def).toBeDefined();
            expect(def.id).toBe("H01");
            expect(def.name).toBe("Bot Initialization");
            expect(def.category).toBe("lifecycle");
        });

        it("should return undefined for unknown hooks", () => {
            expect(registry.getDefinition("H99:Unknown")).toBeUndefined();
        });
    });

    describe("defineHook", () => {
        it("should add a custom hook definition", () => {
            registry.defineHook("custom:MyHook", {
                id: "C01",
                name: "My Custom Hook",
                category: "custom",
                description: "A custom hook",
                source: "test"
            });

            const def = registry.getDefinition("custom:MyHook");
            expect(def).toBeDefined();
            expect(def.name).toBe("My Custom Hook");
        });
    });

    describe("listHooks", () => {
        it("should list all hooks without filter", () => {
            const hooks = registry.listHooks();
            expect(hooks.length).toBe(Object.keys(HOOK_DEFINITIONS).length);
        });

        it("should filter by category", () => {
            const lifecycleHooks = registry.listHooks("lifecycle");
            expect(lifecycleHooks.length).toBeGreaterThan(0);
            lifecycleHooks.forEach(([, def]) => {
                expect(def.category).toBe("lifecycle");
            });
        });

        it("should return empty array for unknown category", () => {
            expect(registry.listHooks("nonexistent")).toEqual([]);
        });
    });

    describe("getHistory", () => {
        it("should return last N entries", () => {
            registry.trigger("H01:BotInit", { n: 1 });
            registry.trigger("H02:SettingsLoad", { n: 2 });
            registry.trigger("H03:BotReady", { n: 3 });

            const history = registry.getHistory(2);
            expect(history.length).toBe(2);
            expect(history[0].hook).toBe("H02:SettingsLoad");
            expect(history[1].hook).toBe("H03:BotReady");
        });
    });

    describe("getListenerSummary", () => {
        it("should return counts for hooks with listeners", () => {
            registry.register("H01:BotInit", jest.fn());
            registry.register("H01:BotInit", jest.fn());
            registry.register("H10:MessageReceived", jest.fn());

            const summary = registry.getListenerSummary();
            expect(summary["H01:BotInit"]).toBe(2);
            expect(summary["H10:MessageReceived"]).toBe(1);
            expect(summary["H04:BotShutdown"]).toBeUndefined();
        });
    });

    describe("reset", () => {
        it("should remove all listeners and clear history", () => {
            registry.register("H01:BotInit", jest.fn());
            registry.trigger("H01:BotInit");

            registry.reset();

            expect(registry.listenerCount("H01:BotInit")).toBe(0);
            expect(registry.getHistory()).toEqual([]);
        });
    });
});
