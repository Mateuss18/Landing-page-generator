const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    saveFile: (content) => ipcRenderer.invoke('save-file', content)
});
