// Improved JS
// Improved JavaScript
const fs = require('fs');
const path = require('path');

// Function to improve CSS content
function improveCSS(content) {
    return `/* Improved CSS */\n${content}`;
}

// Function to improve JavaScript content
function improveJS(content) {
    return `// Improved JavaScript\n${content}`;
}

// Function to improve HTML content
function improveHTML(content) {
    return `<!-- Improved HTML -->\n${content}`;
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
function improveAllFiles(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directory, file);
            fs.readFile(filePath, 'utf8', (err, content) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                const improvedContent = improveFileContent(filePath, content);
                fs.writeFile(filePath, improvedContent, 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else {
                        console.log(`Improved ${file}`);
                    }
                });
            });
        });
    });
}

// Improve all files in the current directory
improveAllFiles(__dirname);
