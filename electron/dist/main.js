"use strict";
const { app, BrowserWindow } = require("electron");
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.loadURL("http://localhost:3000"); // Load Next.js dev/prod server
}
app.whenReady().then(createWindow);
