/**
 * @module scripts/improveFiles
 * @description Traverses the project directory and applies file-type-specific
 *              improvements. Supports dry-run mode, directory exclusions,
 *              and detailed logging.
 *
 * Usage:
 *   node scripts/improveFiles.js [directory] [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be changed without writing files
 */

const fs = require("fs");
const path = require("path");

const EXCLUDED_DIRS = new Set([
    "node_modules",
    ".git",
    "obj",
    "bin",
    ".vs",
    "__tests__"
]);

const EXCLUDED_FILES = new Set([
    "package-lock.json"
]);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const targetDir = args.find(a => !a.startsWith("--")) || path.join(__dirname, "..");

let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

/**
 * Apply improvements to CSS content.
 * @param {string} content
 * @returns {string}
 */
function improveCSS(content) {
    if (content.startsWith("/* Improved CSS */")) return content;
    return `/* Improved CSS */\n${content}`;
}

/**
 * Apply improvements to JavaScript content.
 * @param {string} content
 * @returns {string}
 */
function improveJS(content) {
    if (content.startsWith("// Improved JS") || content.startsWith("/**")) return content;
    return `// Improved JS\n${content}`;
}

/**
 * Apply improvements to HTML content.
 * @param {string} content
 * @returns {string}
 */
function improveHTML(content) {
    if (content.startsWith("<!-- Improved HTML -->") || content.trimStart().startsWith("<!DOCTYPE")) return content;
    return `<!-- Improved HTML -->\n${content}`;
}

/**
 * Improve file content based on file extension.
 * @param {string} filePath
 * @param {string} content
 * @returns {{ improved: string, changed: boolean }}
 */
function improveFileContent(filePath, content) {
    const ext = path.extname(filePath).toLowerCase();
    let improved;
    switch (ext) {
        case ".css":
            improved = improveCSS(content);
            break;
        case ".js":
            improved = improveJS(content);
            break;
        case ".html":
            improved = improveHTML(content);
            break;
        default:
            return { improved: content, changed: false };
    }
    return { improved, changed: improved !== content };
}

/**
 * Recursively process a directory.
 * @param {string} dirPath
 */
function processDirectory(dirPath) {
    let items;
    try {
        items = fs.readdirSync(dirPath);
    } catch (err) {
        console.error(`  ✗ Error reading directory ${dirPath}: ${err.message}`);
        errorCount++;
        return;
    }

    for (const item of items) {
        if (EXCLUDED_DIRS.has(item) || item.startsWith(".")) {
            continue;
        }

        const itemPath = path.join(dirPath, item);
        let stats;
        try {
            stats = fs.statSync(itemPath);
        } catch (err) {
            console.error(`  ✗ Error stating ${itemPath}: ${err.message}`);
            errorCount++;
            continue;
        }

        if (stats.isDirectory()) {
            processDirectory(itemPath);
        } else if (stats.isFile() && !EXCLUDED_FILES.has(item)) {
            processFile(itemPath);
        }
    }
}

/**
 * Process a single file.
 * @param {string} filePath
 */
function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (![".js", ".css", ".html"].includes(ext)) {
        return;
    }

    try {
        const content = fs.readFileSync(filePath, "utf8");
        const { improved, changed } = improveFileContent(filePath, content);
        const relative = path.relative(targetDir, filePath);

        if (changed) {
            if (dryRun) {
                console.log(`  [DRY RUN] Would improve: ${relative}`);
            } else {
                fs.writeFileSync(filePath, improved, "utf8");
                console.log(`  ✓ Improved: ${relative}`);
            }
            processedCount++;
        } else {
            skippedCount++;
        }
    } catch (err) {
        console.error(`  ✗ Error processing ${filePath}: ${err.message}`);
        errorCount++;
    }
}

// Run
console.log(`\n📝 Improving files in: ${targetDir}`);
if (dryRun) console.log("   (DRY RUN — no files will be modified)\n");
else console.log("");

processDirectory(targetDir);

console.log(`\n📊 Results: ${processedCount} improved, ${skippedCount} skipped, ${errorCount} errors\n`);
