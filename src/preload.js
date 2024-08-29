const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    saveFile: (content, images) => ipcRenderer.invoke('save-file', content, images),
    previewFile: (content) => ipcRenderer.invoke('preview-file', content),
    onResetSections: (callback) => ipcRenderer.on('reset-sections', callback)
});
