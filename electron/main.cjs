const { app, BrowserWindow, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Explicit Windows AppUserModelID ensures Windows Taskbar pins and uses the custom icon
const APP_ID = 'com.forensicreview.workstation';
app.setAppUserModelId(APP_ID);

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(__dirname, '../public/app-icon-white.ico');
  const appIcon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1540,
    height: 960,
    minWidth: 1150,
    minHeight: 720,
    title: 'ForensicReview — Medicolegal Forensic Workstation',
    icon: appIcon,
    backgroundColor: '#0b0f19',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allows local file:// & blob:// for multi-page medical PDFs
      allowRunningInsecureContent: false
    }
  });

  mainWindow.setIcon(appIcon);

  // Load the production build
  const distPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    // Development fallback
    mainWindow.loadURL('http://localhost:5173');
  }

  // Graceful show on ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

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
}
