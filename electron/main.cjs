const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn, fork } = require('child_process');
const fs = require('fs');

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

    let startUrl;
    if (app.isPackaged) {
        startUrl = `file://${path.join(app.getAppPath(), 'dist/index.html')}`;
    } else {
        startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
    }

    mainWindow.loadURL(startUrl);

    // Open DevTools in dev mode or if requested
    if (process.env.ELECTRON_START_URL || process.env.DEBUG_PROD === 'true') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function startServer() {
    let serverPath;
    if (app.isPackaged) {
        // In production, use the bundled server in app.asar
        // The main process is in electron/dist/main.cjs
        // The server is in server/dist/server.cjs
        // Relative path: ../../server/dist/server.cjs
        serverPath = path.join(__dirname, '../../server/dist/server.cjs');
    } else {
        serverPath = path.join(__dirname, '../server/index.cjs');
    }

    const userDataPath = app.getPath('userData');
    const logPath = path.join(userDataPath, 'server.log');
    const logStream = fs.createWriteStream(logPath, { flags: 'a' });

    console.log('Starting server from:', serverPath);
    console.log('Server logs will be written to:', logPath);

    // Use fork instead of spawn('node') to ensure it works in production without system Node.js
    // fork uses the Electron executable as the Node.js runtime.
    serverProcess = fork(serverPath, [], {
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        env: { ...process.env, USER_DATA_PATH: userDataPath }
    });

    if (serverProcess.stdout) {
        serverProcess.stdout.on('data', (data) => {
            console.log(`[Server]: ${data}`);
            logStream.write(`[STDOUT] ${data}`);
        });
    }

    if (serverProcess.stderr) {
        serverProcess.stderr.on('data', (data) => {
            console.error(`[Server Error]: ${data}`);
            logStream.write(`[STDERR] ${data}`);
        });
    }

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        logStream.write(`[EXIT] Code ${code}\n`);
        logStream.end();
    });

    serverProcess.on('error', (err) => {
        console.error('Failed to start server process:', err);
        logStream.write(`[SPAWN ERROR] ${err}\n`);
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
