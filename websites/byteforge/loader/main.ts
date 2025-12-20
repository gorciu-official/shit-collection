import { BrowserWindow, app } from 'electron';

let browser: BrowserWindow | null = null;

function start_IDE_instance() {
    browser = new BrowserWindow({
        minWidth: 1000,
        minHeight: 700,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    browser.loadFile('src/index.html');
}

async function main() {
    app.on('activate', () => start_IDE_instance());
    await app.whenReady();
    start_IDE_instance();
}

main();