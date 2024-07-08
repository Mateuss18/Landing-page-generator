const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 670,
    height: 725,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'assets/imgs', 'icon.png')
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenuBarVisibility(false);
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

ipcMain.handle('preview-file', async (event, content) => {
  const cssPath = path.join(__dirname, 'assets', 'base.css');
  let cssContent = '';

  try {
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  } catch (error) {
    console.error('Erro ao ler o arquivo CSS:', error);
  }

  const previewContent = `
    <html>
      <head>
        <style>${cssContent}</style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  const previewWindow = new BrowserWindow({
    width: 1280,
    height: 780,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true
    }
  });

  previewWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(previewContent)}`);
});
