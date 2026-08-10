const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const APP_URL = process.env.MIRAVERSE_URL || 'http://127.0.0.1:3000';
const SERVER_PORT = 3000;
let serverProcess = null;

function isPortOpen(port) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ host: '127.0.0.1', port });
        socket.once('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.once('error', () => resolve(false));
        socket.setTimeout(500, () => {
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
    throw new Error(`Miraverse server did not start on port ${port}.`);
}

async function ensureServer() {
    if (await isPortOpen(SERVER_PORT)) return;

    serverProcess = spawn('node', ['server.js'], {
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, PORT: String(SERVER_PORT) },
        stdio: 'inherit',
        windowsHide: true,
    });

    serverProcess.once('exit', (code) => {
        if (code && !app.isQuitting) {
            console.error(`Miraverse server exited with code ${code}.`);
        }
        serverProcess = null;
    });

    await waitForServer(SERVER_PORT);
}

async function createWindow() {
    await ensureServer();

    const window = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 680,
        backgroundColor: '#07040d',
        title: 'MiraverseOSx',
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    window.once('ready-to-show', () => window.show());
    window.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith(APP_URL) || url.startsWith('http://localhost:3000') || url.startsWith('http://127.0.0.1:3000')) {
            return { action: 'allow' };
        }
        shell.openExternal(url);
        return { action: 'deny' };
    });

    await window.loadURL(APP_URL);
}

app.whenReady().then(async () => {
    try {
        await createWindow();
    } catch (error) {
        console.error(error);
        app.quit();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('before-quit', () => {
    app.isQuitting = true;
    if (serverProcess && !serverProcess.killed) serverProcess.kill();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
