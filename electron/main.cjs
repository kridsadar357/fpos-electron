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

// --- Auto Updater ---
const { autoUpdater } = require('electron-updater');
const { ipcMain } = require('electron');

// Configure logging
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

// Auto-download is true by default, but let's be explicit or control it
autoUpdater.autoDownload = false;

function sendStatusToWindow(text) {
    autoUpdater.logger.info(text);
    if (mainWindow) {
        mainWindow.webContents.send('message', text);
    }
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'available', info });
});

autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'not-available', info });
});

autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'error', error: err.message });
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'downloading', progress: progressObj });
});

autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'downloaded', info });
});

// IPC Handlers
ipcMain.on('check_for_update', () => {
    autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on('download_update', () => {
    autoUpdater.downloadUpdate();
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.handle('get_version', () => {
    return app.getVersion();
});

// Check for updates when app is ready (optional, or trigger from UI)
app.on('ready', () => {
    // autoUpdater.checkForUpdatesAndNotify(); // Can enable auto check on startup
});
