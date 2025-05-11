const path = require('path');
const extensionPath = path.join(__dirname);

module.exports = {
    launch: {
        headless: false,
        args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        ],
    }
}