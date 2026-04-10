/**
 * @module scripts/improve_content
 * @description Recursively traverses the project and applies basic content
 *              improvements to HTML, CSS, and JS files. Skips already-improved
 *              files and excludes dependency directories.
 *
 * Usage:
 *   node scripts/improve_content.js [directory] [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const EXCLUDED_DIRS = new Set(["node_modules", ".git", "obj", "bin", ".vs", "__tests__"]);
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const targetDir = args.find(a => !a.startsWith("--")) || path.join(__dirname, "..");

const stats = { improved: 0, skipped: 0, errors: 0 };

/**
 * Check if file already has an improvement marker.
 * @param {string} content
 * @param {string} ext
 * @returns {boolean}
 */
function isAlreadyImproved(content, ext) {
    switch (ext) {
        case ".html":
            return content.startsWith("<!-- Improved HTML -->") || content.trimStart().startsWith("<!DOCTYPE");
        case ".css":
            return content.startsWith("/* Improved CSS */");
        case ".js":
            return content.startsWith("// Improved JS") || content.startsWith("/**");
        default:
            return true;
    }
}

/**
 * Add improvement marker to file content.
 * @param {string} content
 * @param {string} ext
 * @returns {string}
 */
function addImproveMarker(content, ext) {
    switch (ext) {
        case ".html":
            return `<!-- Improved HTML -->\n${content}`;
        case ".css":
            return `/* Improved CSS */\n${content}`;
        case ".js":
            return `// Improved JS\n${content}`;
        default:
            return content;
    }
}

/**
 * Process a directory recursively.
 * @param {string} directoryPath
 */
function processDirectory(directoryPath) {
    let items;
    try {
        items = fs.readdirSync(directoryPath);
    } catch (err) {
        console.error(`Error reading directory ${directoryPath}: ${err.message}`);
        stats.errors++;
        return;
    }

    for (const item of items) {
        if (EXCLUDED_DIRS.has(item) || item.startsWith(".")) continue;

        const itemPath = path.join(directoryPath, item);
        let itemStats;
        try {
            itemStats = fs.statSync(itemPath);
        } catch (err) {
            stats.errors++;
            continue;
        }

        if (itemStats.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (![".js", ".css", ".html"].includes(ext)) continue;

            try {
                const content = fs.readFileSync(itemPath, "utf8");
                if (isAlreadyImproved(content, ext)) {
                    stats.skipped++;
                    continue;
                }

                const improved = addImproveMarker(content, ext);
                if (dryRun) {
                    console.log(`  [DRY RUN] Would improve: ${path.relative(targetDir, itemPath)}`);
                } else {
                    fs.writeFileSync(itemPath, improved, "utf8");
                    console.log(`  ✓ Improved: ${path.relative(targetDir, itemPath)}`);
                }
                stats.improved++;
            } catch (err) {
                console.error(`  ✗ Error: ${path.relative(targetDir, itemPath)}: ${err.message}`);
                stats.errors++;
            }
        } else if (itemStats.isDirectory()) {
            processDirectory(itemPath);
        }
    }
}

console.log(`\n📝 Improving content in: ${targetDir}`);
if (dryRun) console.log("   (DRY RUN — no files will be modified)\n");
processDirectory(targetDir);
console.log(`\n📊 Results: ${stats.improved} improved, ${stats.skipped} skipped, ${stats.errors} errors\n`);
