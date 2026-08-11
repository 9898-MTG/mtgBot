/**
 * @file Task scheduler script unit tests
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    CADENCES,
    isExcludedDir,
    categorize,
    buildFileTasks,
    generateManifest,
    commandsForCadence,
    isWhitelisted,
    buildCadenceDoc,
    writeManifest,
    executeCadence,
    parseArgs
} = require("../taskScheduler");

describe("scripts/taskScheduler", () => {
    describe("CADENCES", () => {
        it("defines daily, weekly, monthly, and yearly", () => {
            expect(CADENCES).toEqual(["daily", "weekly", "monthly", "yearly"]);
        });
    });

    describe("isExcludedDir", () => {
        it("excludes dependency, VCS, and output directories", () => {
            expect(isExcludedDir("node_modules")).toBe(true);
            expect(isExcludedDir(".git")).toBe(true);
            expect(isExcludedDir("tasks")).toBe(true);
        });

        it("does not exclude regular directories", () => {
            expect(isExcludedDir("discord")).toBe(false);
        });
    });

    describe("categorize", () => {
        it("maps extensions to categories", () => {
            expect(categorize("bot.js")).toBe("javascript");
            expect(categorize("Settings.json")).toBe("json");
            expect(categorize("README.md")).toBe("markdown");
            expect(categorize("index.html")).toBe("web");
            expect(categorize("theme.css")).toBe("web");
            expect(categorize("data.csv")).toBe("data");
            expect(categorize("logo.png")).toBe("asset");
        });

        it("falls back to default for unknown extensions", () => {
            expect(categorize("mystery.xyz")).toBe("default");
        });
    });

    describe("buildFileTasks", () => {
        it("produces all four cadences with substituted file paths", () => {
            const task = buildFileTasks(path.join("discord", "bot.js"));
            expect(task.file).toBe("discord/bot.js");
            expect(task.category).toBe("javascript");
            expect(Object.keys(task.cadences)).toEqual(CADENCES);
            expect(task.cadences.daily.todos[0]).toContain("discord/bot.js");
            expect(task.cadences.daily.commands).toContain("npm run lint");
        });
    });

    describe("commandsForCadence & isWhitelisted", () => {
        it("only returns unique whitelisted commands", () => {
            const manifest = {
                files: [
                    { cadences: { daily: { todos: [], actions: [], commands: ["npm run lint"] } } },
                    { cadences: { daily: { todos: [], actions: [], commands: ["npm run lint"] } } },
                    { cadences: { daily: { todos: [], actions: [], commands: ["rm -rf /"] } } }
                ]
            };
            const commands = commandsForCadence(manifest, "daily");
            expect(commands).toEqual(["npm run lint"]);
        });

        it("rejects non-whitelisted commands", () => {
            expect(isWhitelisted("npm run lint")).toBe(true);
            expect(isWhitelisted("rm -rf /")).toBe(false);
        });
    });

    describe("buildCadenceDoc", () => {
        it("renders todos, actions, and commands for a cadence", () => {
            const manifest = generateManifestFixture();
            const doc = buildCadenceDoc(manifest, "daily");
            expect(doc).toContain("# Daily Tasks");
            expect(doc).toContain("code.js");
            expect(doc).toContain("- [ ]");
        });
    });

    describe("executeCadence", () => {
        it("runs whitelisted commands via the injected runner", () => {
            const manifest = {
                files: [{ cadences: { daily: { todos: [], actions: [], commands: ["npm run lint"] } } }]
            };
            const runCalls = [];
            const results = executeCadence(manifest, "daily", { runner: cmd => runCalls.push(cmd) });
            expect(runCalls).toEqual(["npm run lint"]);
            expect(results).toEqual([{ command: "npm run lint", ok: true }]);
        });

        it("does not run commands in dry-run mode", () => {
            const manifest = {
                files: [{ cadences: { daily: { todos: [], actions: [], commands: ["npm run lint"] } } }]
            };
            const runCalls = [];
            const results = executeCadence(manifest, "daily", { dryRun: true, runner: cmd => runCalls.push(cmd) });
            expect(runCalls).toEqual([]);
            expect(results[0].ok).toBe(true);
        });

        it("captures failures from the runner", () => {
            const manifest = {
                files: [{ cadences: { daily: { todos: [], actions: [], commands: ["npm run lint"] } } }]
            };
            const results = executeCadence(manifest, "daily", {
                runner: () => {
                    throw new Error("boom");
                }
            });
            expect(results[0].ok).toBe(false);
            expect(results[0].error).toContain("boom");
        });
    });

    describe("parseArgs", () => {
        it("defaults to generate mode", () => {
            const opts = parseArgs([]);
            expect(opts.generate).toBe(true);
            expect(opts.dryRun).toBe(false);
        });

        it("parses --list and --execute", () => {
            expect(parseArgs(["--list", "weekly"]).list).toBe("weekly");
            expect(parseArgs(["--execute", "monthly"]).execute).toBe("monthly");
            expect(parseArgs(["--run", "yearly"]).execute).toBe("yearly");
        });
    });

    describe("generateManifest & writeManifest (integration)", () => {
        let tmpDir;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tasks-"));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        it("builds a manifest covering every non-excluded file", () => {
            fs.mkdirSync(path.join(tmpDir, "src"), { recursive: true });
            fs.writeFileSync(path.join(tmpDir, "src", "code.js"), "console.log(1);\n");
            fs.writeFileSync(path.join(tmpDir, "data.json"), "{}\n");
            fs.mkdirSync(path.join(tmpDir, "node_modules"), { recursive: true });
            fs.writeFileSync(path.join(tmpDir, "node_modules", "ignored.js"), "");

            const manifest = generateManifest(tmpDir);
            const files = manifest.files.map(f => f.file);
            expect(files).toContain("src/code.js");
            expect(files).toContain("data.json");
            expect(files).not.toContain("node_modules/ignored.js");
            expect(manifest.cadences).toEqual(CADENCES);
        });

        it("writes tasks.json and per-cadence docs", () => {
            fs.writeFileSync(path.join(tmpDir, "code.js"), "console.log(1);\n");
            const manifest = generateManifest(tmpDir);
            const written = writeManifest(manifest, tmpDir);

            expect(fs.existsSync(path.join(tmpDir, "tasks", "tasks.json"))).toBe(true);
            for (const cadence of CADENCES) {
                expect(fs.existsSync(path.join(tmpDir, "tasks", `${cadence}.md`))).toBe(true);
            }
            expect(written).toContain("tasks/tasks.json");
        });
    });
});

/**
 * Build a small manifest fixture for doc rendering tests.
 * @returns {object} A manifest with one JavaScript file.
 */
function generateManifestFixture() {
    return {
        generatedAt: "2026-01-01T00:00:00.000Z",
        cadences: CADENCES,
        summary: { files: 1 },
        files: [buildFileTasks("code.js")]
    };
}
