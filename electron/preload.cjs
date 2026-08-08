const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('miraverseDesktop', Object.freeze({
    platform: process.platform,
    isElectron: true,
}));
