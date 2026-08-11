/**
 * @module scripts/taskScheduler
 * @description Per-file task, todo, action, and command scheduler for mtgBot.
 *
 * This module walks the entire project tree and, for every file, derives a set
 * of scheduled tasks grouped by cadence (`daily`, `weekly`, `monthly`,
 * `yearly`). Each task bundles:
 *
 *   - **todos**    — human-readable checklist items describing the intent.
 *   - **actions**  — machine-readable action identifiers mtgBot can react to.
 *   - **commands** — concrete shell/npm commands mtgBot can execute.
 *
 * The generated data is a manifest (`tasks/tasks.json`) that mtgBot can
 * *contain* (store), *control* (list/filter by cadence or file) and *execute*
 * (run the whitelisted commands for a cadence).
 *
 * Usage:
 *   node scripts/taskScheduler.js [directory] [options]
 *
 * Options:
 *   --generate           Write tasks/tasks.json and per-cadence Markdown docs (default).
 *   --dry-run            Compute tasks but do not write any files.
 *   --list <cadence>     Print the tasks for a cadence (daily|weekly|monthly|yearly|all).
 *   --execute <cadence>  Execute the whitelisted commands for a cadence.
 *   --run <cadence>      Alias for --execute.
 *
 * Examples:
 *   node scripts/taskScheduler.js                 # regenerate the manifest
 *   node scripts/taskScheduler.js --list daily    # show daily tasks
 *   node scripts/taskScheduler.js --execute weekly # run weekly commands
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

/** The ordered set of supported cadences. */
const CADENCES = ["daily", "weekly", "monthly", "yearly"];

/** Directories that should never be traversed. */
const EXCLUDED_DIRS = new Set(["node_modules", ".git", ".github", "obj", "bin", ".vs", "__tests__", "tasks"]);

/** Files that should never have tasks generated for them. */
const EXCLUDED_FILES = new Set(["package-lock.json", ".DS_Store"]);

/**
 * Commands that mtgBot is permitted to execute. Any command emitted by a task
 * generator must appear here (matched by its leading token sequence) to be run
 * by `--execute`. This keeps execution safe and auditable.
 */
const COMMAND_WHITELIST = [
    "npm run lint",
    "npm run format:check",
    "npm test",
    "npm run validate:json",
    "npm run build:toc",
    "npm run generate:hooks",
    "npm run generate:nav",
    "npm run maintain",
    "npm run maintain:dry"
];

/**
 * File-type profiles. Each profile maps a category to the cadence-specific
 * todos, actions, and command templates used when generating tasks for a file
 * of that category. `{file}` placeholders are substituted with the file path.
 */
const PROFILES = {
    javascript: {
        extensions: [".js", ".mjs", ".cjs"],
        daily: {
            todos: ["Lint `{file}` and fix reported problems"],
            actions: ["lint"],
            commands: ["npm run lint"]
        },
        weekly: {
            todos: ["Run the test suite covering `{file}`", "Check formatting of `{file}`"],
            actions: ["test", "format-check"],
            commands: ["npm test", "npm run format:check"]
        },
        monthly: {
            todos: ["Review `{file}` for dead code and refactor opportunities"],
            actions: ["review-refactor"],
            commands: []
        },
        yearly: {
            todos: ["Audit `{file}` dependencies and update its module header"],
            actions: ["dependency-audit"],
            commands: []
        }
    },
    json: {
        extensions: [".json"],
        daily: {
            todos: ["Validate JSON syntax of `{file}`"],
            actions: ["validate-json"],
            commands: ["npm run validate:json"]
        },
        weekly: {
            todos: ["Check formatting of `{file}`"],
            actions: ["format-check"],
            commands: ["npm run format:check"]
        },
        monthly: {
            todos: ["Review `{file}` schema and remove stale keys"],
            actions: ["schema-review"],
            commands: []
        },
        yearly: {
            todos: ["Archive and version `{file}` if it holds accumulating data"],
            actions: ["archive"],
            commands: []
        }
    },
    markdown: {
        extensions: [".md", ".markdown"],
        daily: {
            todos: ["Verify links and headings in `{file}`"],
            actions: ["docs-check"],
            commands: []
        },
        weekly: {
            todos: ["Regenerate the table of contents affecting `{file}`"],
            actions: ["build-toc"],
            commands: ["npm run build:toc"]
        },
        monthly: {
            todos: ["Proofread `{file}` and refresh outdated sections"],
            actions: ["proofread"],
            commands: []
        },
        yearly: {
            todos: ["Review `{file}` for accuracy against the current codebase"],
            actions: ["annual-doc-review"],
            commands: []
        }
    },
    web: {
        extensions: [".html", ".htm", ".css"],
        daily: {
            todos: ["Check formatting of `{file}`"],
            actions: ["format-check"],
            commands: ["npm run format:check"]
        },
        weekly: {
            todos: ["Regenerate navigation pages that include `{file}`"],
            actions: ["generate-nav"],
            commands: ["npm run generate:nav"]
        },
        monthly: {
            todos: ["Test `{file}` for broken links and accessibility issues"],
            actions: ["accessibility-check"],
            commands: []
        },
        yearly: {
            todos: ["Review `{file}` styling and markup against current standards"],
            actions: ["annual-web-review"],
            commands: []
        }
    },
    data: {
        extensions: [".csv", ".tsv", ".accdb", ".sql"],
        daily: {
            todos: ["Back up `{file}` before any automated modification"],
            actions: ["backup"],
            commands: []
        },
        weekly: {
            todos: ["Validate the integrity of records in `{file}`"],
            actions: ["data-validate"],
            commands: []
        },
        monthly: {
            todos: ["Deduplicate and compact `{file}`"],
            actions: ["deduplicate"],
            commands: []
        },
        yearly: {
            todos: ["Archive `{file}` and start a fresh yearly dataset"],
            actions: ["archive"],
            commands: []
        }
    },
    asset: {
        extensions: [".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".ttf", ".woff", ".woff2", ".pdf"],
        daily: {
            todos: [],
            actions: [],
            commands: []
        },
        weekly: {
            todos: ["Confirm `{file}` is referenced somewhere in the project"],
            actions: ["reference-check"],
            commands: []
        },
        monthly: {
            todos: ["Optimize the size of `{file}`"],
            actions: ["optimize-asset"],
            commands: []
        },
        yearly: {
            todos: ["Review whether `{file}` is still needed"],
            actions: ["asset-audit"],
            commands: []
        }
    }
};

/** Fallback profile for files whose extension matches no known category. */
const DEFAULT_PROFILE = {
    daily: { todos: [], actions: [], commands: [] },
    weekly: {
        todos: ["Verify `{file}` is documented in its directory README"],
        actions: ["docs-check"],
        commands: []
    },
    monthly: {
        todos: ["Review `{file}` for continued relevance"],
        actions: ["review"],
        commands: []
    },
    yearly: {
        todos: ["Annual review of `{file}`"],
        actions: ["annual-review"],
        commands: []
    }
};

/**
 * Determine whether a directory entry name should be skipped during traversal.
 * @param {string} name Entry name.
 * @returns {boolean} True if the entry should be skipped.
 */
function isExcludedDir(name) {
    return EXCLUDED_DIRS.has(name) || name.startsWith(".");
}

/**
 * Resolve the profile category for a file based on its extension.
 * @param {string} file File name or path.
 * @returns {string} The matching category key, or "default".
 */
function categorize(file) {
    const ext = path.extname(file).toLowerCase();
    for (const [category, profile] of Object.entries(PROFILES)) {
        if (profile.extensions.includes(ext)) {
            return category;
        }
    }
    return "default";
}

/**
 * Build the set of cadence tasks for a single file.
 * @param {string} relFile File path relative to the repository root.
 * @returns {object} Map of cadence to `{ todos, actions, commands }`.
 */
function buildFileTasks(relFile) {
    const category = categorize(relFile);
    const profile = category === "default" ? DEFAULT_PROFILE : PROFILES[category];
    const normalized = relFile.split(path.sep).join("/");
    const result = { file: normalized, category, cadences: {} };

    for (const cadence of CADENCES) {
        const spec = profile[cadence] || DEFAULT_PROFILE[cadence];
        result.cadences[cadence] = {
            todos: spec.todos.map(t => t.replace(/\{file\}/g, normalized)),
            actions: spec.actions.slice(),
            commands: spec.commands.slice()
        };
    }
    return result;
}

/**
 * Recursively walk a directory, collecting per-file task definitions.
 * @param {string} dirPath Absolute path of the directory to process.
 * @param {string} baseDir Absolute path used to compute relative file paths.
 * @param {object[]} out Accumulator receiving file task objects.
 */
function walk(dirPath, baseDir, out) {
    let entries;
    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
        return;
    }

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (!isExcludedDir(entry.name)) {
                walk(path.join(dirPath, entry.name), baseDir, out);
            }
        } else if (entry.isFile() && !EXCLUDED_FILES.has(entry.name)) {
            const rel = path.relative(baseDir, path.join(dirPath, entry.name));
            out.push(buildFileTasks(rel));
        }
    }
}

/**
 * Generate the complete task manifest for a target directory.
 * @param {string} [targetDir] Directory to scan (defaults to the repo root).
 * @returns {object} The manifest with `generatedAt`, `files`, and `summary`.
 */
function generateManifest(targetDir = ROOT) {
    const files = [];
    walk(targetDir, targetDir, files);
    files.sort((a, b) => a.file.localeCompare(b.file));

    const summary = { files: files.length };
    for (const cadence of CADENCES) {
        summary[cadence] = files.reduce((total, f) => {
            const c = f.cadences[cadence];
            return total + c.todos.length + c.actions.length + c.commands.length;
        }, 0);
    }

    return {
        generatedAt: new Date().toISOString(),
        cadences: CADENCES,
        summary,
        files
    };
}

/**
 * Collect the unique, whitelisted commands for a cadence across all files.
 * @param {object} manifest A manifest produced by {@link generateManifest}.
 * @param {string} cadence One of the supported cadences.
 * @returns {string[]} Ordered, de-duplicated list of runnable commands.
 */
function commandsForCadence(manifest, cadence) {
    const seen = new Set();
    const commands = [];
    for (const file of manifest.files) {
        const bucket = file.cadences[cadence];
        if (!bucket) continue;
        for (const command of bucket.commands) {
            if (!seen.has(command) && isWhitelisted(command)) {
                seen.add(command);
                commands.push(command);
            }
        }
    }
    return commands;
}

/**
 * Check whether a command is permitted to run.
 * @param {string} command The command string.
 * @returns {boolean} True if the command is on the whitelist.
 */
function isWhitelisted(command) {
    return COMMAND_WHITELIST.some(allowed => command === allowed);
}

/**
 * Render a Markdown document listing the tasks for a single cadence.
 * @param {object} manifest A manifest produced by {@link generateManifest}.
 * @param {string} cadence One of the supported cadences.
 * @returns {string} Markdown content.
 */
function buildCadenceDoc(manifest, cadence) {
    const title = cadence.charAt(0).toUpperCase() + cadence.slice(1);
    const lines = [];
    lines.push(`# ${title} Tasks`);
    lines.push("");
    lines.push(`> Generated: ${manifest.generatedAt}`);
    lines.push(`> Files with ${cadence} tasks are listed below with their todos, actions, and commands.`);
    lines.push("");

    const commands = commandsForCadence(manifest, cadence);
    lines.push("## Executable commands");
    lines.push("");
    if (commands.length === 0) {
        lines.push("_No executable commands for this cadence._");
    } else {
        for (const command of commands) {
            lines.push(`- \`${command}\``);
        }
    }
    lines.push("");

    lines.push("## Per-file tasks");
    lines.push("");
    let any = false;
    for (const file of manifest.files) {
        const bucket = file.cadences[cadence];
        if (!bucket || (bucket.todos.length === 0 && bucket.actions.length === 0 && bucket.commands.length === 0)) {
            continue;
        }
        any = true;
        lines.push(`### \`${file.file}\``);
        lines.push("");
        if (bucket.todos.length > 0) {
            lines.push("**Todos:**");
            for (const todo of bucket.todos) lines.push(`- [ ] ${todo}`);
            lines.push("");
        }
        if (bucket.actions.length > 0) {
            lines.push(`**Actions:** ${bucket.actions.map(a => `\`${a}\``).join(", ")}`);
            lines.push("");
        }
        if (bucket.commands.length > 0) {
            lines.push("**Commands:**");
            for (const command of bucket.commands) lines.push(`- \`${command}\``);
            lines.push("");
        }
    }
    if (!any) {
        lines.push("_No files have tasks for this cadence._");
        lines.push("");
    }
    return lines.join("\n");
}

/**
 * Write the manifest and per-cadence Markdown docs to the `tasks/` directory.
 * @param {object} manifest A manifest produced by {@link generateManifest}.
 * @param {string} [targetDir] Directory whose `tasks/` folder receives output.
 * @returns {string[]} Relative paths of the files written.
 */
function writeManifest(manifest, targetDir = ROOT) {
    const tasksDir = path.join(targetDir, "tasks");
    fs.mkdirSync(tasksDir, { recursive: true });

    const written = [];
    const manifestPath = path.join(tasksDir, "tasks.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    written.push(path.relative(targetDir, manifestPath));

    for (const cadence of CADENCES) {
        const docPath = path.join(tasksDir, `${cadence}.md`);
        fs.writeFileSync(docPath, buildCadenceDoc(manifest, cadence), "utf8");
        written.push(path.relative(targetDir, docPath));
    }
    return written;
}

/**
 * Execute the whitelisted commands for a cadence.
 * @param {object} manifest A manifest produced by {@link generateManifest}.
 * @param {string} cadence One of the supported cadences.
 * @param {object} [options]
 * @param {boolean} [options.dryRun] When true, print commands without running them.
 * @param {Function} [options.runner] Command runner (defaults to execSync); receives the command string.
 * @returns {{ command: string, ok: boolean, error?: string }[]} Execution results.
 */
function executeCadence(manifest, cadence, { dryRun = false, runner } = {}) {
    const commands = commandsForCadence(manifest, cadence);
    const exec = runner || (command => execSync(command, { cwd: ROOT, stdio: "inherit" }));
    const results = [];
    for (const command of commands) {
        if (dryRun) {
            console.log(`  would run: ${command}`);
            results.push({ command, ok: true });
            continue;
        }
        try {
            console.log(`  running: ${command}`);
            exec(command);
            results.push({ command, ok: true });
        } catch (err) {
            results.push({ command, ok: false, error: err.message });
        }
    }
    return results;
}

/**
 * Print the tasks for one cadence (or all cadences) to stdout.
 * @param {object} manifest A manifest produced by {@link generateManifest}.
 * @param {string} cadence A cadence name or "all".
 */
function listTasks(manifest, cadence) {
    const targets = cadence === "all" ? CADENCES : [cadence];
    for (const c of targets) {
        console.log(`\n=== ${c.toUpperCase()} ===`);
        console.log(buildCadenceDoc(manifest, c));
    }
}

/**
 * Parse CLI arguments into a normalized options object.
 * @param {string[]} argv Arguments (excluding node and script path).
 * @returns {object} Parsed options.
 */
function parseArgs(argv) {
    const options = {
        targetDir: ROOT,
        dryRun: argv.includes("--dry-run"),
        generate: true,
        list: null,
        execute: null
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--list") {
            options.list = argv[++i] || "all";
            options.generate = false;
        } else if (arg === "--execute" || arg === "--run") {
            options.execute = argv[++i] || "daily";
            options.generate = false;
        } else if (arg === "--generate") {
            options.generate = true;
        } else if (!arg.startsWith("--")) {
            options.targetDir = arg;
        }
    }
    return options;
}

/**
 * CLI entry point.
 * @param {string[]} argv Arguments (excluding node and script path).
 * @returns {number} Process exit code.
 */
function main(argv) {
    const options = parseArgs(argv);
    const manifest = generateManifest(options.targetDir);

    if (options.list) {
        if (options.list !== "all" && !CADENCES.includes(options.list)) {
            console.error(`Unknown cadence: ${options.list}. Use one of: ${CADENCES.join(", ")}, all.`);
            return 1;
        }
        listTasks(manifest, options.list);
        return 0;
    }

    if (options.execute) {
        if (!CADENCES.includes(options.execute)) {
            console.error(`Unknown cadence: ${options.execute}. Use one of: ${CADENCES.join(", ")}.`);
            return 1;
        }
        console.log(`\n🗓️  Executing ${options.execute} tasks${options.dryRun ? " (dry run)" : ""}:`);
        const results = executeCadence(manifest, options.execute, { dryRun: options.dryRun });
        const failed = results.filter(r => !r.ok);
        console.log(`\n✅ ${results.length - failed.length} succeeded, ❌ ${failed.length} failed.`);
        return failed.length > 0 ? 1 : 0;
    }

    // Default: generate the manifest and docs.
    console.log(`\n🗓️  Generating task schedule for: ${options.targetDir}`);
    if (options.dryRun) {
        console.log("   (DRY RUN — no files will be written)");
    }
    console.log(`📄 Files scheduled: ${manifest.summary.files}`);
    for (const cadence of CADENCES) {
        console.log(`   ${cadence}: ${manifest.summary[cadence]} task items`);
    }
    if (!options.dryRun) {
        const written = writeManifest(manifest, options.targetDir);
        console.log("📝 Wrote:");
        for (const file of written) console.log(`   - ${file}`);
    }
    return 0;
}

// Execute when invoked directly (not when required by tests).
if (require.main === module) {
    process.exit(main(process.argv.slice(2)));
}

module.exports = {
    CADENCES,
    PROFILES,
    DEFAULT_PROFILE,
    COMMAND_WHITELIST,
    isExcludedDir,
    categorize,
    buildFileTasks,
    generateManifest,
    commandsForCadence,
    isWhitelisted,
    buildCadenceDoc,
    writeManifest,
    executeCadence,
    listTasks,
    parseArgs,
    main
};
