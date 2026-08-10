const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const SERVER_PORT = 3000;
const APP_URL = process.env.MIRAVERSE_URL || `http://127.0.0.1:${SERVER_PORT}`;
let serverProcess = null;
let mainWindow = null;

function isPortOpen(port) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ host: '127.0.0.1', port });
        socket.once('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.once('error', () => resolve(false));
        socket.setTimeout(400, () => {
            socket.destroy();
            resolve(false);
        });
    });
}

async function waitForServer(port, attempts = 60) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (await isPortOpen(port)) return;
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Miraverse server did not respond on port ${port}.`);
}

async function ensureServer() {
    if (await isPortOpen(SERVER_PORT)) {
        console.log(`Port ${SERVER_PORT} already active.`);
        return;
    }

    serverProcess = spawn(process.execPath, [path.resolve(__dirname, '..', 'server.js')], {
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, PORT: String(SERVER_PORT), ELECTRON_RUN_AS_NODE: '1' },
        stdio: 'inherit',
        windowsHide: true,
    });

    serverProcess.once('exit', (code) => {
        if (code && !app.isQuitting) {
            console.error(`Miraverse server process exited with code ${code}.`);
        }
        serverProcess = null;
    });

    await waitForServer(SERVER_PORT);
}

async function createWindow() {
    try {
        await ensureServer();
    } catch (e) {
        console.warn('Server launch check warning:', e.message);
    }

    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 680,
        backgroundColor: '#07040d',
        title: 'MiraverseOSx | Celestial Netrunner OS',
        autoHideMenuBar: true,
        show: true,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
            return { action: 'allow' };
        }
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.webContents.on('did-fail-load', () => {
        console.log('Retrying connection to UI...');
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.loadURL(APP_URL);
            }
        }, 1000);
    });

    await mainWindow.loadURL(APP_URL);
    mainWindow.show();
    mainWindow.focus();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    try {
        await createWindow();
    } catch (error) {
        console.error('Failed to create Electron window:', error);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('before-quit', () => {
    app.isQuitting = true;
    if (serverProcess && !serverProcess.killed) {
        try { serverProcess.kill(); } catch (_) {}
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
