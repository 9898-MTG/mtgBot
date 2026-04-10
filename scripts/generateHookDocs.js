/**
 * @module scripts/generateHookDocs
 * @description Auto-generates hook reference documentation from HookRegistry definitions and schemas.
 *
 * Reads hook definitions from hooks/HookRegistry.js and payload schemas from hooks/schemas.js,
 * then generates a markdown reference file.
 *
 * Usage: node scripts/generateHookDocs.js
 */

const fs = require("fs");
const path = require("path");
const { HOOK_DEFINITIONS } = require("../hooks/HookRegistry");
const { HOOK_SCHEMAS } = require("../hooks/schemas");

function generateDocs() {
    const lines = [];

    lines.push("# Hook Reference");
    lines.push("");
    lines.push("> Auto-generated from `hooks/HookRegistry.js` and `hooks/schemas.js`.");
    lines.push(`> Generated: ${new Date().toISOString().split("T")[0]}`);
    lines.push("");
    lines.push("---");
    lines.push("");

    // Group by category
    const categories = {};
    for (const [hookName, def] of Object.entries(HOOK_DEFINITIONS)) {
        if (!categories[def.category]) {
            categories[def.category] = [];
        }
        categories[def.category].push({ hookName, ...def });
    }

    // Table of Contents
    lines.push("## Table of Contents");
    lines.push("");
    for (const category of Object.keys(categories)) {
        const title = category.charAt(0).toUpperCase() + category.slice(1) + " Hooks";
        lines.push(`- [${title}](#${category}-hooks)`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");

    // Generate each category
    for (const [category, hooks] of Object.entries(categories)) {
        const title = category.charAt(0).toUpperCase() + category.slice(1) + " Hooks";
        lines.push(`## ${title}`);
        lines.push("");

        for (const hook of hooks) {
            lines.push(`### ${hook.hookName}`);
            lines.push("");
            lines.push(`| Property | Value |`);
            lines.push(`|----------|-------|`);
            lines.push(`| **ID** | ${hook.id} |`);
            lines.push(`| **Name** | ${hook.name} |`);
            lines.push(`| **Category** | ${hook.category} |`);
            lines.push(`| **Trigger** | ${hook.description} |`);
            lines.push(`| **Source** | \`${hook.source}\` |`);
            lines.push("");

            // Add payload schema if available
            const schema = HOOK_SCHEMAS[hook.hookName];
            if (schema && schema.payload) {
                lines.push("**Payload:**");
                lines.push("");
                lines.push("| Field | Type | Description |");
                lines.push("|-------|------|-------------|");
                for (const [field, spec] of Object.entries(schema.payload)) {
                    const typeStr = spec.enum ? `${spec.type} (${spec.enum.join(" \\| ")})` : spec.type;
                    lines.push(`| \`${field}\` | ${typeStr} | ${spec.description} |`);
                }
                lines.push("");
            }

            lines.push("**Usage:**");
            lines.push("");
            lines.push("```javascript");
            lines.push(`hooks.register("${hook.hookName}", (payload) => {`);
            lines.push(`    console.log("${hook.name} triggered", payload);`);
            lines.push("});");
            lines.push("```");
            lines.push("");
            lines.push("---");
            lines.push("");
        }
    }

    const output = lines.join("\n");
    const outputPath = path.join(__dirname, "..", "hooks", "HOOK_REFERENCE.md");
    fs.writeFileSync(outputPath, output, "utf8");
    console.log(`✅ Hook reference generated at ${outputPath}`);
    console.log(`   ${Object.keys(HOOK_DEFINITIONS).length} hooks documented across ${Object.keys(categories).length} categories.`);
}

generateDocs();
