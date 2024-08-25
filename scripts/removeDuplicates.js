const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const directoryPath = path.join(__dirname, 'html_files'); // Change this to your directory

function removeDuplicateHeadersAndFooters(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return console.log('Unable to read file: ' + err);
        }

        const dom = new JSDOM(data);
        const document = dom.window.document;

        const headers = document.querySelectorAll('header');
        const footers = document.querySelectorAll('footer');

        if (headers.length > 1) {
            for (let i = 1; i < headers.length; i++) {
                headers[i].remove();
            }
        }

        if (footers.length > 1) {
            for (let i = 1; i < footers.length; i++) {
                footers[i].remove();
            }
        }

        fs.writeFile(filePath, dom.serialize(), 'utf8', err => {
            if (err) {
                return console.log('Unable to write file: ' + err);
            }
            console.log(`Processed ${filePath}`);
        });
    });
}

function traverseDirectory(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(file => {
            const filePath = path.join(directory, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    return console.log('Unable to stat file: ' + err);
                }

                if (stats.isDirectory()) {
                    traverseDirectory(filePath);
                } else if (stats.isFile() && path.extname(file) === '.html') {
                    removeDuplicateHeadersAndFooters(filePath);
                }
            });
        });
    });
}

traverseDirectory(directoryPath);
