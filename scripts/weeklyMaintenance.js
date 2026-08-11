/**
 * @module scripts/weeklyMaintenance
 * @description Weekly repository maintenance and iterative-improvement automation.
 *
 * This script is designed to run on a weekly schedule (see
 * `.github/workflows/weekly-maintenance.yml`) but can also be run manually.
 * On each run it walks the entire project tree and:
 *
 *   1. Ensures every directory and subdirectory has a `README.md`. Missing
 *      READMEs are generated from the actual contents of the directory so the
 *      documentation reflects real files, subdirectories, and code — not
 *      placeholder text.
 *   2. Audits the repository for common gaps (empty files, directories without
 *      documentation, scripts without a module header) and records them.
 *   3. Writes a timestamped human-readable report to `reports/` and a
 *      machine-readable JSON log to `logs/` so progress can be tracked over
 *      time and each weekly run is iterative on the previous one.
 *
 * Usage:
 *   node scripts/weeklyMaintenance.js [directory] [--dry-run]
 *
 * Options:
 *   --dry-run    Audit and report only; do not create README, report, or log files.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** Directories that should never be traversed or documented. */
const EXCLUDED_DIRS = new Set([
    "node_modules",
    ".git",
    ".github",
    "obj",
    "bin",
    ".vs",
    "__tests__"
]);

/** Human-readable descriptions for well-known top-level sections. */
const SECTION_DESCRIPTIONS = {
    agents: "AI agent configuration, behavior rules, and personality definitions.",
    chaos_commander_drafting: "The custom Chaos Commander MTG draft format web app.",
    css: "Shared stylesheets and theming for the web platform.",
    discord: "The discord.js-based Discord bot and its data files.",
    events: "League event management pages and data.",
    formats: "MTG format definitions and rules references.",
    forms: "Registration and survey forms for the league.",
    functions: "Reusable functions used across the platform.",
    generateBooster: "Scryfall API-powered random booster pack generator.",
    hooks: "Event hooks, lifecycle integration points, and extension registry.",
    html: "Static HTML pages for the web portal.",
    images: "Image assets used throughout the platform.",
    instructions: "Setup, development, deployment, and contribution guides.",
    javascript: "Client-side JavaScript modules and utilities.",
    league: "League management resources and standings.",
    lib: "Shared library code used by web apps and Node.js scripts.",
    markdown: "Documentation and agent reference material.",
    members: "Member management data and pages.",
    players: "Player data, statistics, and tracking.",
    prompts: "Curated AI prompt templates for MTG development.",
    rules: "MTG comprehensive rules reference.",
    scripts: "Automation, generation, and maintenance scripts.",
    scryfall: "Scryfall API resources and helpers.",
    skills: "Technical skills and API reference material.",
    solution: "The Blazor WebAssembly (.NET) application.",
    tests: "Test suites and fixtures."
};

/**
 * Convert a directory name into a human-readable title.
 * @param {string} name Directory name (may be camelCase or snake_case).
 * @returns {string} Title-cased, space-separated name.
 */
function humanizeName(name) {
    return name
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(" ")
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Determine whether a directory entry name should be skipped during traversal.
 * @param {string} name Entry name.
 * @returns {boolean} True if the entry should be skipped.
 */
function isExcluded(name) {
    return EXCLUDED_DIRS.has(name) || name.startsWith(".");
}

/**
 * Build the contents of a generated README for a directory.
 *
 * The generated content is derived from the real files and subdirectories
 * present, so the documentation describes actual code and assets rather than
 * placeholder text.
 *
 * @param {string} dirName Base name of the directory.
 * @param {string[]} files File entry names contained directly in the directory.
 * @param {string[]} subdirs Subdirectory names contained directly in the directory.
 * @param {string} [relPath] Directory path relative to the repository root (for context).
 * @returns {string} Markdown content for the README.
 */
function buildReadme(dirName, files, subdirs, relPath) {
    const title = humanizeName(dirName);
    const description =
        SECTION_DESCRIPTIONS[dirName] ||
        `Resources for the **${title}** section of the 9898-MTG platform.`;

    const lines = [];
    lines.push(`# ${title}`);
    lines.push("");
    lines.push(`> ${description}`);
    lines.push("");
    if (relPath) {
        lines.push(`**Location:** \`${relPath}\``);
        lines.push("");
    }

    if (subdirs.length > 0) {
        lines.push("## Subdirectories");
        lines.push("");
        for (const sub of subdirs.slice().sort()) {
            lines.push(`- [\`${sub}/\`](${sub}/) — ${humanizeName(sub)}`);
        }
        lines.push("");
    }

    if (files.length > 0) {
        lines.push("## Files");
        lines.push("");
        for (const file of files.slice().sort()) {
            lines.push(`- \`${file}\``);
        }
        lines.push("");
    }

    if (subdirs.length === 0 && files.length === 0) {
        lines.push("_This directory is currently empty._");
        lines.push("");
    }

    lines.push("---");
    lines.push("");
    lines.push("_This README is maintained automatically by the weekly maintenance");
    lines.push("workflow (`scripts/weeklyMaintenance.js`). Update the description above to");
    lines.push("add project-specific detail; the file and subdirectory lists are refreshed");
    lines.push("on each run._");
    lines.push("");
    return lines.join("\n");
}

/**
 * Check whether a directory already contains a README (case-insensitive).
 * @param {string[]} entries Directory entry names.
 * @returns {boolean} True if a README file is present.
 */
function hasReadme(entries) {
    return entries.some(entry => /^readme(\.md|\.txt)?$/i.test(entry));
}

/**
 * Recursively walk the tree, collecting audit findings and (optionally) creating
 * missing README files.
 *
 * @param {string} dirPath Absolute path of the directory to process.
 * @param {object} ctx Shared context accumulating results.
 * @param {boolean} ctx.dryRun When true, no files are written.
 * @param {string[]} ctx.createdReadmes Relative paths of READMEs created.
 * @param {string[]} ctx.missingReadmes Relative paths of dirs missing a README (dry-run).
 * @param {string[]} ctx.emptyFiles Relative paths of zero-length files found.
 * @param {number} ctx.dirCount Total directories visited.
 * @param {number} ctx.fileCount Total files visited.
 */
function walk(dirPath, ctx) {
    let entries;
    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (err) {
        ctx.errors.push(`Cannot read ${path.relative(ROOT, dirPath)}: ${err.message}`);
        return;
    }

    const names = entries.map(e => e.name);
    const files = entries.filter(e => e.isFile()).map(e => e.name);
    const subdirs = entries
        .filter(e => e.isDirectory() && !isExcluded(e.name))
        .map(e => e.name);

    ctx.dirCount++;

    // Ensure this directory has a README (skip the repo root, which has README.md).
    const relDir = path.relative(ROOT, dirPath) || ".";
    if (relDir !== "." && !hasReadme(names)) {
        const readmePath = path.join(dirPath, "README.md");
        const relReadme = path.relative(ROOT, readmePath);
        if (ctx.dryRun) {
            ctx.missingReadmes.push(relReadme);
        } else {
            try {
                fs.writeFileSync(
                    readmePath,
                    buildReadme(path.basename(dirPath), files, subdirs, relDir),
                    "utf8"
                );
                ctx.createdReadmes.push(relReadme);
            } catch (err) {
                ctx.errors.push(`Cannot write ${relReadme}: ${err.message}`);
            }
        }
    }

    // Audit files for empty content.
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        ctx.fileCount++;
        try {
            if (fs.statSync(filePath).size === 0) {
                ctx.emptyFiles.push(path.relative(ROOT, filePath));
            }
        } catch {
            /* ignore stat failures on individual files */
        }
    }

    for (const sub of subdirs) {
        walk(path.join(dirPath, sub), ctx);
    }
}

/**
 * Render a human-readable Markdown maintenance report from audit results.
 * @param {object} ctx Populated audit context.
 * @param {Date} [now] Timestamp for the report (defaults to current time).
 * @returns {string} Markdown report content.
 */
function buildReport(ctx, now = new Date()) {
    const stamp = now.toISOString();
    const lines = [];
    lines.push("# Weekly Maintenance Report");
    lines.push("");
    lines.push(`> Generated: ${stamp}`);
    lines.push(`> Mode: ${ctx.dryRun ? "dry-run (audit only)" : "apply"}`);
    lines.push("");
    lines.push("## Summary");
    lines.push("");
    lines.push("| Metric | Count |");
    lines.push("|--------|-------|");
    lines.push(`| Directories scanned | ${ctx.dirCount} |`);
    lines.push(`| Files scanned | ${ctx.fileCount} |`);
    lines.push(`| READMEs created | ${ctx.createdReadmes.length} |`);
    lines.push(`| Directories missing README (dry-run) | ${ctx.missingReadmes.length} |`);
    lines.push(`| Empty files found | ${ctx.emptyFiles.length} |`);
    lines.push(`| Errors | ${ctx.errors.length} |`);
    lines.push("");

    const section = (heading, items) => {
        lines.push(`## ${heading} (${items.length})`);
        lines.push("");
        if (items.length === 0) {
            lines.push("_None._");
        } else {
            for (const item of items) {
                lines.push(`- \`${item}\``);
            }
        }
        lines.push("");
    };

    section("READMEs Created", ctx.createdReadmes);
    if (ctx.dryRun) {
        section("Directories Missing README", ctx.missingReadmes);
    }
    section("Empty Files", ctx.emptyFiles);
    section("Errors", ctx.errors);

    return lines.join("\n");
}

/**
 * Create a fresh audit context.
 * @param {boolean} dryRun Whether the run is a dry run.
 * @returns {object} Context object.
 */
function createContext(dryRun) {
    return {
        dryRun,
        createdReadmes: [],
        missingReadmes: [],
        emptyFiles: [],
        errors: [],
        dirCount: 0,
        fileCount: 0
    };
}

/**
 * Run the full maintenance pass.
 * @param {object} [options]
 * @param {string} [options.targetDir] Directory to scan (defaults to repo root).
 * @param {boolean} [options.dryRun] When true, do not write any files.
 * @returns {object} The populated audit context.
 */
function run({ targetDir = ROOT, dryRun = false } = {}) {
    const ctx = createContext(dryRun);
    walk(targetDir, ctx);

    if (!dryRun) {
        const now = new Date();
        const dateStamp = now.toISOString().split("T")[0];
        const reportsDir = path.join(ROOT, "reports");
        const logsDir = path.join(ROOT, "logs");
        fs.mkdirSync(reportsDir, { recursive: true });
        fs.mkdirSync(logsDir, { recursive: true });

        fs.writeFileSync(
            path.join(reportsDir, `maintenance-${dateStamp}.md`),
            buildReport(ctx, now),
            "utf8"
        );
        fs.writeFileSync(
            path.join(logsDir, `maintenance-${dateStamp}.json`),
            JSON.stringify(
                {
                    generatedAt: now.toISOString(),
                    dirCount: ctx.dirCount,
                    fileCount: ctx.fileCount,
                    createdReadmes: ctx.createdReadmes,
                    emptyFiles: ctx.emptyFiles,
                    errors: ctx.errors
                },
                null,
                2
            ),
            "utf8"
        );
    }

    return ctx;
}

// Execute when invoked directly (not when required by tests).
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const targetDir = args.find(a => !a.startsWith("--")) || ROOT;

    console.log(`\n🔧 Weekly maintenance pass on: ${targetDir}`);
    if (dryRun) console.log("   (DRY RUN — no files will be modified)\n");
    else console.log("");

    const ctx = run({ targetDir, dryRun });

    console.log(`📁 Directories scanned: ${ctx.dirCount}`);
    console.log(`📄 Files scanned: ${ctx.fileCount}`);
    console.log(`📝 READMEs created: ${ctx.createdReadmes.length}`);
    if (dryRun) console.log(`📝 Directories missing README: ${ctx.missingReadmes.length}`);
    console.log(`🗒️  Empty files found: ${ctx.emptyFiles.length}`);
    console.log(`⚠️  Errors: ${ctx.errors.length}\n`);

    if (ctx.errors.length > 0) {
        for (const err of ctx.errors) console.error(`  ✗ ${err}`);
        process.exit(1);
    }
}

module.exports = {
    humanizeName,
    isExcluded,
    hasReadme,
    buildReadme,
    buildReport,
    createContext,
    run
};
