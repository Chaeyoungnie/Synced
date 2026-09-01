const { contextBridge, ipcRenderer } = require('electron')

// Expose desktop-specific APIs to the renderer process
contextBridge.exposeInMainWorld('__DESKTOP_APP__', true)

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Window controls
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  quit: () => ipcRenderer.invoke('quit-app'),

  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultName, content) => ipcRenderer.invoke('save-file-dialog', defaultName, content),
  readLocalFile: (filePath) => ipcRenderer.invoke('read-local-file', filePath),
  
  // Git operations
  gitStatus: () => ipcRenderer.invoke('git-status'),
  gitBranches: () => ipcRenderer.invoke('git-branches'),
  gitLog: () => ipcRenderer.invoke('git-log'),
  gitDiff: (file) => ipcRenderer.invoke('git-diff', file),
  gitStage: (file) => ipcRenderer.invoke('git-stage', file),
  gitUnstage: (file) => ipcRenderer.invoke('git-unstage', file),
  gitCommit: (message) => ipcRenderer.invoke('git-commit', message),
  gitCreateBranch: (name) => ipcRenderer.invoke('git-create-branch', name),
  gitSwitchBranch: (name) => ipcRenderer.invoke('git-switch-branch', name),
  saveLocalFile: (filePath, content) => ipcRenderer.invoke('save-local-file', filePath, content),

  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (_event, status, data) => callback(status, data))
    return () => ipcRenderer.removeAllListeners('update-status')
  },

  // Menu actions from main process
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (_event, action) => callback(action))
    return () => ipcRenderer.removeAllListeners('menu-action')
  },
})
