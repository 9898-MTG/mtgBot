/**
 * @file Weekly maintenance script unit tests
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    humanizeName,
    isExcluded,
    hasReadme,
    buildReadme,
    buildReport,
    createContext,
    run
} = require("../weeklyMaintenance");

describe("scripts/weeklyMaintenance", () => {
    describe("humanizeName", () => {
        it("converts snake_case to Title Case", () => {
            expect(humanizeName("chaos_commander_drafting")).toBe("Chaos Commander Drafting");
        });

        it("converts camelCase to Title Case", () => {
            expect(humanizeName("generateBooster")).toBe("Generate Booster");
        });

        it("handles single lowercase words", () => {
            expect(humanizeName("hooks")).toBe("Hooks");
        });
    });

    describe("isExcluded", () => {
        it("excludes known dependency directories", () => {
            expect(isExcluded("node_modules")).toBe(true);
            expect(isExcluded("__tests__")).toBe(true);
        });

        it("excludes dotfiles and dot-directories", () => {
            expect(isExcluded(".git")).toBe(true);
            expect(isExcluded(".eslintrc.json")).toBe(true);
        });

        it("does not exclude regular directories", () => {
            expect(isExcluded("hooks")).toBe(false);
        });
    });

    describe("hasReadme", () => {
        it("detects README.md regardless of case", () => {
            expect(hasReadme(["index.js", "README.md"])).toBe(true);
            expect(hasReadme(["readme.txt"])).toBe(true);
            expect(hasReadme(["ReadMe"])).toBe(true);
        });

        it("returns false when no README is present", () => {
            expect(hasReadme(["index.js", "style.css"])).toBe(false);
        });
    });

    describe("buildReadme", () => {
        it("includes the humanized title and listed contents", () => {
            const md = buildReadme("generateBooster", ["index.html"], ["assets"], "generateBooster");
            expect(md).toContain("# Generate Booster");
            expect(md).toContain("`index.html`");
            expect(md).toContain("[`assets/`](assets/)");
            expect(md).toContain("**Location:** `generateBooster`");
        });

        it("notes when a directory is empty", () => {
            const md = buildReadme("empty", [], [], "empty");
            expect(md).toContain("_This directory is currently empty._");
        });
    });

    describe("buildReport", () => {
        it("summarizes counts in a Markdown table", () => {
            const ctx = createContext(false);
            ctx.dirCount = 5;
            ctx.fileCount = 12;
            ctx.createdReadmes = ["a/README.md"];
            const report = buildReport(ctx, new Date("2026-01-01T00:00:00Z"));
            expect(report).toContain("# Weekly Maintenance Report");
            expect(report).toContain("| Directories scanned | 5 |");
            expect(report).toContain("`a/README.md`");
        });
    });

    describe("run (integration)", () => {
        let tmpDir;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "maint-"));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        it("creates missing READMEs in nested directories", () => {
            const sub = path.join(tmpDir, "alpha", "beta");
            fs.mkdirSync(sub, { recursive: true });
            fs.writeFileSync(path.join(sub, "code.js"), "console.log(1);\n");

            const ctx = run({ targetDir: tmpDir, dryRun: false });

            expect(fs.existsSync(path.join(tmpDir, "alpha", "README.md"))).toBe(true);
            expect(fs.existsSync(path.join(sub, "README.md"))).toBe(true);
            expect(ctx.createdReadmes.length).toBeGreaterThanOrEqual(2);
        });

        it("does not write files in dry-run mode", () => {
            const sub = path.join(tmpDir, "gamma");
            fs.mkdirSync(sub, { recursive: true });

            const ctx = run({ targetDir: tmpDir, dryRun: true });

            expect(fs.existsSync(path.join(sub, "README.md"))).toBe(false);
            expect(ctx.missingReadmes.length).toBeGreaterThanOrEqual(1);
        });

        it("reports empty files", () => {
            const sub = path.join(tmpDir, "delta");
            fs.mkdirSync(sub, { recursive: true });
            fs.writeFileSync(path.join(sub, "empty.txt"), "");

            const ctx = run({ targetDir: tmpDir, dryRun: true });

            expect(ctx.emptyFiles.some(f => f.endsWith("empty.txt"))).toBe(true);
        });
    });
});
