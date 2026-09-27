const { app, BrowserWindow, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'electron.log');
function log(msg) {
  try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch(e){}
}
log('Electron main process starting, pid: ' + process.pid);

process.on('uncaughtException', (err) => {
  log('UNCAUGHT EXCEPTION: ' + (err.stack || err));
});
process.on('unhandledRejection', (reason) => {
  log('UNHANDLED REJECTION: ' + reason);
});
process.on('exit', (code) => {
  log('PROCESS EXIT EVENT WITH CODE: ' + code);
});

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
  log('distPath: ' + distPath + ' exists: ' + fs.existsSync(distPath));
  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath).catch(err => {
      log('loadFile error: ' + err);
    });
  } else {
    // Development fallback
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.webContents.on('did-fail-load', (e, code, desc, url) => {
    log(`did-fail-load: ${code} - ${desc} on ${url}`);
  });

  mainWindow.webContents.on('render-process-gone', (e, details) => {
    log(`render-process-gone: ${JSON.stringify(details)}`);
  });

  // Graceful show on ready
  mainWindow.once('ready-to-show', () => {
    log('ready-to-show fired, showing window');
    mainWindow.maximize();
    mainWindow.show();
  });

  // Fallback show after 1.5s in case ready-to-show doesn't fire
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      log('Fallback timeout showing window');
      mainWindow.show();
    }
  }, 1500);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('close', (e) => {
    log('mainWindow close event fired');
  });

  mainWindow.on('closed', () => {
    log('mainWindow closed event fired');
    mainWindow = null;
  });
}

// Single instance lock
log('Requesting single instance lock...');
const gotTheLock = app.requestSingleInstanceLock();
log('gotTheLock: ' + gotTheLock);
if (!gotTheLock) {
  log('Could not get single instance lock, quitting.');
  app.quit();
} else {
  app.on('second-instance', () => {
    log('Second instance triggered');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    log('app.whenReady fired, calling createWindow()');
    try {
      createWindow();
      log('createWindow() called successfully');
    } catch (e) {
      log('Error in createWindow: ' + (e.stack || e));
    }
  });

  app.on('window-all-closed', () => {
    log('window-all-closed event fired');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('will-quit', () => {
    log('app will-quit fired');
  });

  app.on('quit', (e, code) => {
    log('app quit fired with code: ' + code);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
