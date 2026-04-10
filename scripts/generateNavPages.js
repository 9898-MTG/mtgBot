/**
 * @module scripts/generateNavPages
 * @description Generates consistent navigation index.html pages from a template.
 *
 * Scans the root directory for subdirectories and generates an index.html
 * for each one that either doesn't have one or has a stub page.
 *
 * Usage:
 *   node scripts/generateNavPages.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const EXCLUDED_DIRS = new Set([
    "node_modules", ".git", ".github", "obj", "bin", ".vs",
    "__tests__", "images", "solution"
]);

/**
 * Get all navigation options from the root index.html.
 * @returns {Array<{value: string, label: string}>}
 */
function getNavOptions() {
    const rootIndex = path.join(ROOT, "index.html");
    if (!fs.existsSync(rootIndex)) return [];

    const content = fs.readFileSync(rootIndex, "utf8");
    const optionRegex = /<option value="([^"]+)">([^<]+)<\/option>/g;
    const options = [];
    let match;

    while ((match = optionRegex.exec(content)) !== null) {
        options.push({ value: match[1], label: match[2] });
    }
    return options;
}

/**
 * Generate an index.html page for a section directory.
 * @param {string} dirName - Directory name
 * @param {string} title - Human-readable title
 * @param {Array} navOptions - Navigation options
 * @returns {string} HTML content
 */
function generatePage(dirName, title, navOptions) {
    const optionHtml = navOptions
        .map(opt => `            <option value="${opt.value}"${opt.value === dirName ? " selected" : ""}>${opt.label}</option>`)
        .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — 9898-MTG</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<header>
    <nav>
        <label for="menu" class="visually-hidden">Navigate to:</label>
        <select id="menu" aria-label="Navigation Menu">
${optionHtml}
        </select>
    </nav>
</header>
    <main>
        <h1>${title}</h1>
        <div id="content">
            <p>Welcome to the ${title} section of the 9898-MTG platform.</p>
        </div>
    </main>
    <script>
        document.getElementById("menu").addEventListener("change", function(e) {
            if (e.target.value) {
                window.location.href = "../" + e.target.value + "/index.html";
            }
        });
    </script>
<footer>
    <p>2024 &copy; 9898-MTG</p>
</footer>
</body>
</html>
`;
}

// Run
const navOptions = getNavOptions();
console.log(`\n🔧 Generating navigation pages...`);
console.log(`   Found ${navOptions.length} navigation options\n`);

let generated = 0;
let skipped = 0;

// Get all subdirectories
const dirs = fs.readdirSync(ROOT).filter(item => {
    if (EXCLUDED_DIRS.has(item) || item.startsWith(".")) return false;
    const itemPath = path.join(ROOT, item);
    return fs.statSync(itemPath).isDirectory();
});

for (const dir of dirs) {
    const indexPath = path.join(ROOT, dir, "index.html");
    const navOption = navOptions.find(opt => opt.value === dir);
    const title = navOption ? navOption.label : dir.charAt(0).toUpperCase() + dir.slice(1);

    // Check if existing index.html is a stub (small or has "Under Construction")
    let shouldGenerate = false;
    if (!fs.existsSync(indexPath)) {
        shouldGenerate = true;
    } else {
        const existing = fs.readFileSync(indexPath, "utf8");
        const isStub = existing.length < 500 && !existing.includes("<script");
        if (isStub) {
            shouldGenerate = true;
        }
    }

    if (shouldGenerate) {
        const content = generatePage(dir, title, navOptions);
        if (dryRun) {
            console.log(`  [DRY RUN] Would generate: ${dir}/index.html`);
        } else {
            fs.writeFileSync(indexPath, content, "utf8");
            console.log(`  ✓ Generated: ${dir}/index.html`);
        }
        generated++;
    } else {
        skipped++;
    }
}

console.log(`\n📊 Results: ${generated} generated, ${skipped} skipped\n`);
