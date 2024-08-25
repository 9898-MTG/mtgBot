// Improved JS
const fs = require('fs');
const path = require('path');

function improveHTML(content) {
    return `<!-- Improved HTML -->\n${content}`;
}

function improveCSS(content) {
    return `/* Improved CSS */\n${content}`;
}

function improveJS(content) {
    return `// Improved JS\n${content}`;
}

// Function to improve file content based on its type
function improveFileContent(filePath, content) {
    const ext = path.extname(filePath);
    switch (ext) {
        case '.css':
            return improveCSS(content);
        case '.js':
            return improveJS(content);
        case '.html':
            return improveHTML(content);
        default:
            return content;
    }
}

// Function to read, improve, and write files
function processDirectory(directoryPath) {
    fs.readdir(directoryPath, (err, items) => {
        if (err) {
            console.error(`Error reading directory ${directoryPath}:`, err);
            return;
        }

        items.forEach(item => {
            const itemPath = path.join(directoryPath, item);
            fs.stat(itemPath, (err, stats) => {
                if (err) {
                    console.error(`Error stating item ${itemPath}:`, err);
                    return;
                }

                if (stats.isFile()) {
                    fs.readFile(itemPath, 'utf8', (err, content) => {
                        if (err) {
                            console.error(`Error reading file ${itemPath}:`, err);
                            return;
                        }

                        const improvedContent = improveFileContent(itemPath, content);
                        fs.writeFile(itemPath, improvedContent, 'utf8', err => {
                            if (err) {
                                console.error(`Error writing file ${itemPath}:`, err);
                            } else {
                                console.log(`Improved file: ${itemPath}`);
                            }
                        });
                    });
                } else if (stats.isDirectory()) {
                    processDirectory(itemPath);
                }
            });
        });
    });
}

// Start processing from the current directory
processDirectory(__dirname);
