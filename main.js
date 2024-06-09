const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Adicione estas linhas no início do seu arquivo main.js
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 650,
    height: 748,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('save-file', async (event, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Salvar Arquivo HTML',
    defaultPath: path.join(__dirname, 'pagina-pronta.html'),
    filters: [{ name: 'HTML Files', extensions: ['html'] }]
  });

  if (!canceled && filePath) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, filePath };
  } else {
    return { success: false };
  }
});
