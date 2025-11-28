const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        fullscreen: true,
        autoHideMenuBar: true,
        title: "FPOS",
        icon: path.join(__dirname, '../public/favicon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
    mainWindow.loadURL(startUrl);

    if (process.env.ELECTRON_START_URL) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function startServer() {
    let serverPath;
    if (app.isPackaged) {
        // In production, the server is unpacked to app.asar.unpacked/server
        // app.getAppPath() returns .../resources/app.asar
        // We need to replace app.asar with app.asar.unpacked
        serverPath = path.join(app.getAppPath().replace('app.asar', 'app.asar.unpacked'), 'server/index.cjs');
    } else {
        serverPath = path.join(__dirname, '../server/index.cjs');
    }

    console.log('Starting server from:', serverPath);
    serverProcess = spawn('node', [serverPath], { stdio: 'inherit' });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
    });
}

app.on('ready', () => {
    startServer();
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        if (serverProcess) {
            serverProcess.kill();
            serverProcess = null;
        }
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
});
