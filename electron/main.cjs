const { app, BrowserWindow, shell, Menu, ipcMain, Tray, nativeImage, dialog } = require('electron')
const path = require('path')

const isDev = !app.isPackaged
const SERVER_PORT = 3000
const SERVER_URL = `http://localhost:${SERVER_PORT}`

let mainWindow = null
let tray = null
let isQuitting = false

// Auto-updater (only loads in production)
let autoUpdater = null
if (!isDev) {
  try {
    autoUpdater = require('electron-updater').autoUpdater
  } catch (e) {
    console.log('electron-updater not available, auto-updates disabled')
  }
}

function getTrayIcon() {
  const iconPath = path.join(__dirname, '..', 'public', 'tray-icon.svg')
  try {
    return nativeImage.createFromPath(iconPath)
  } catch (e) {
    // Fallback: create a tiny blue square
    return nativeImage.createEmpty()
  }
}

function createTray() {
  const icon = getTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('Synced')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Synced', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus() } }, type: 'normal' },
    { type: 'separator' },
    { label: 'Check for Updates...', click: () => { if (autoUpdater) autoUpdater.checkForUpdates() }, type: 'normal' },
    { type: 'separator' },
    { label: 'Quit Synced', click: () => { isQuitting = true; app.quit() }, type: 'normal' },
  ])

  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })
}

function setupAutoUpdater() {
  if (!autoUpdater) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    if (mainWindow) mainWindow.webContents.send('update-status', 'checking')
  })

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-status', 'available', info.version)
  })

  autoUpdater.on('update-not-available', () => {
    if (mainWindow) mainWindow.webContents.send('update-status', 'not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) mainWindow.webContents.send('update-status', 'downloading', Math.round(progress.percent))
  })

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-status', 'downloaded', info.version)
  })

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err)
    if (mainWindow) mainWindow.webContents.send('update-status', 'error', err.message)
  })

  // Check for updates 30 seconds after launch (in production only)
  setTimeout(() => {
    if (!isDev && autoUpdater) {
      autoUpdater.checkForUpdates().catch(() => {})
    }
  }, 30000)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Synced',
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    frame: false,
    
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL(SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadURL(SERVER_URL)
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
  })

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion())
ipcMain.handle('get-platform', () => process.platform)
ipcMain.handle('minimize-window', () => { if (mainWindow) mainWindow.minimize() })
ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  }
})
ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.hide()
})
ipcMain.handle('quit-app', () => {
  isQuitting = true
  app.quit()
})

// Git IPC handlers
ipcMain.handle('git-status', async () => {
  const { execSync } = require('child_process')
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8', timeout: 5000 })
    const lines = status.trim().split('
').filter(Boolean)
    return lines.map(line => ({
      status: line.substring(0, 2).trim(),
      file: line.substring(3),
    }))
  } catch (e) {
    return []
  }
})

ipcMain.handle('git-branches', async () => {
  const { execSync } = require('child_process')
  try {
    const branches = execSync('git branch --list', { encoding: 'utf-8', timeout: 5000 })
    const current = execSync('git branch --show-current', { encoding: 'utf-8', timeout: 5000 }).trim()
    return branches.trim().split('
').map(b => ({
      name: b.replace(/^[* ]+/, '').trim(),
      current: b.trim().startsWith('*'),
    }))
  } catch (e) {
    return []
  }
})

ipcMain.handle('git-log', async () => {
  const { execSync } = require('child_process')
  try {
    const log = execSync('git log --oneline -20', { encoding: 'utf-8', timeout: 5000 })
    return log.trim().split('
').map(line => {
      const [hash, ...rest] = line.split(' ')
      return { hash, message: rest.join(' ') }
    })
  } catch (e) {
    return []
  }
})

ipcMain.handle('git-diff', async (_event, file) => {
  const { execSync } = require('child_process')
  try {
    return execSync('git diff ' + (file || ''), { encoding: 'utf-8', timeout: 5000 })
  } catch (e) {
    return ''
  }
})

ipcMain.handle('git-stage', async (_event, file) => {
  const { execSync } = require('child_process')
  try {
    execSync('git add ' + file, { timeout: 5000 })
    return true
  } catch (e) {
    return false
  }
})

ipcMain.handle('git-unstage', async (_event, file) => {
  const { execSync } = require('child_process')
  try {
    execSync('git reset HEAD ' + file, { timeout: 5000 })
    return true
  } catch (e) {
    return false
  }
})

ipcMain.handle('git-commit', async (_event, message) => {
  const { execSync } = require('child_process')
  try {
    execSync('git commit -m ' + JSON.stringify(message), { timeout: 5000 })
    return true
  } catch (e) {
    return false
  }
})

ipcMain.handle('git-create-branch', async (_event, name) => {
  const { execSync } = require('child_process')
  try {
    execSync('git checkout -b ' + name, { timeout: 5000 })
    return true
  } catch (e) {
    return false
  }
})

ipcMain.handle('git-switch-branch', async (_event, name) => {
  const { execSync } = require('child_process')
  try {
    execSync('git checkout ' + name, { timeout: 5000 })
    return true
  } catch (e) {
    return false
  }
})

// File dialog IPC
ipcMain.handle('open-file-dialog', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open File',
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'JavaScript', extensions: ['js', 'jsx', 'ts', 'tsx'] },
      { name: 'Web', extensions: ['html', 'css', 'scss', 'json'] },
      { name: 'Python', extensions: ['py', 'pyw'] },
      { name: 'Markdown', extensions: ['md', 'mdx'] },
      { name: 'Config', extensions: ['yaml', 'yml', 'toml', 'env'] },
    ],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const filePath = result.filePaths[0]
  const fs = require('fs')
  const path = require('path')
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { filePath, name: path.basename(filePath), content }
  } catch (e) {
    return { filePath, name: path.basename(filePath), content: null, error: e.message }
  }
})

ipcMain.handle('save-file-dialog', async (_event, defaultName, content) => {
  if (!mainWindow) return null
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save File',
    defaultPath: defaultName,
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'JavaScript', extensions: ['js', 'jsx', 'ts', 'tsx'] },
      { name: 'Web', extensions: ['html', 'css', 'scss', 'json'] },
    ],
  })
  if (result.canceled || !result.filePath) return null
  const filePath = result.filePath
  const fs = require('fs')
  const path = require('path')
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { filePath, name: path.basename(filePath), saved: true }
  } catch (e) {
    return { filePath, name: path.basename(filePath), saved: false, error: e.message }
  }
})

ipcMain.handle('read-local-file', async (_event, filePath) => {
  const fs = require('fs')
  const path = require('path')
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { filePath, name: path.basename(filePath), content }
  } catch (e) {
    return { filePath, name: path.basename(filePath), content: null, error: e.message }
  }
})

ipcMain.handle('save-local-file', async (_event, filePath, content) => {
  const fs = require('fs')
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { filePath, saved: true }
  } catch (e) {
    return { filePath, saved: false, error: e.message }
  }
})

// Auto-update IPC
ipcMain.handle('check-for-updates', () => {
  if (autoUpdater && !isDev) {
    return autoUpdater.checkForUpdates().then(() => 'checking').catch(() => 'error')
  }
  return 'dev-mode'
})

ipcMain.handle('install-update', () => {
  if (autoUpdater) {
    autoUpdater.quitAndInstall()
  }
})

// App lifecycle
app.whenReady().then(() => {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => { if (mainWindow) mainWindow.webContents.send('menu-action', 'new-file') } },
        { label: 'Open File...', accelerator: 'CmdOrCtrl+O', click: () => { if (mainWindow) mainWindow.webContents.send('menu-action', 'open-file') } },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => { if (mainWindow) mainWindow.webContents.send('menu-action', 'save') } },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Check for Updates...', click: () => { if (autoUpdater && !isDev) autoUpdater.checkForUpdates() } },
        { type: 'separator' },
        { label: 'About Synced', click: () => { if (mainWindow) mainWindow.webContents.send('menu-action', 'about') } },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  createWindow()
  createTray()
  setupAutoUpdater()

  app.on('activate', () => {
    if (mainWindow) {
      mainWindow.show()
    } else {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  isQuitting = true
})
