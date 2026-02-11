import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Module from 'node:module';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
} else {
  const nodeRequire = Module.createRequire(__filename);
  const BetterSqlite = nodeRequire('better-sqlite3') as typeof import('better-sqlite3');
  let db: ReturnType<typeof BetterSqlite> | null = null;

  const initDatabase = () => {
    const dbPath = path.join(app.getPath('userData'), 'app-template.db');
    db = new BetterSqlite(dbPath);

    db.prepare(
      `CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
    ).run();

    const updatedAt = Date.now();
    db.prepare(
      `INSERT INTO config (key, value, updated_at)
       SELECT @key, @value, @updatedAt
       WHERE NOT EXISTS (SELECT 1 FROM config WHERE key = @key)`,
    ).run({ key: 'templateName', value: 'My Electron App', updatedAt });
  };

  const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      backgroundColor: '#070910',
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    const sendMaximizedChanged = () => {
      // frameless window 下，最大化状态可能通过双击拖拽区/快捷键等方式变化，这里统一推送给渲染层同步 UI。
      mainWindow.webContents.send(
        'window:maximized-changed',
        mainWindow.isMaximized() || mainWindow.isFullScreen(),
      );
    };

    mainWindow.on('maximize', sendMaximizedChanged);
    mainWindow.on('unmaximize', sendMaximizedChanged);
    mainWindow.on('enter-full-screen', sendMaximizedChanged);
    mainWindow.on('leave-full-screen', sendMaximizedChanged);

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      );
    }

    // Open the DevTools.
    if (import.meta.env.DEV) {
      mainWindow.webContents.openDevTools();
    }

    // 避免首屏白屏闪烁（先加载渲染进程资源，再显示窗口）。
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      sendMaximizedChanged();
    });
  };

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    initDatabase();
    createWindow();
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('before-quit', () => {
    db?.close();
    db = null;
  });

  ipcMain.handle('app:ping', () => 'pong');

  ipcMain.handle('config:get', (_event, key: string) => {
    if (!db) return null;
    const row = db.prepare('SELECT key, value, updated_at FROM config WHERE key = ?').get(key);
    if (!row) return null;
    return { key: row.key as string, value: row.value as string, updatedAt: Number(row.updated_at) };
  });

  ipcMain.handle('config:set', (_event, payload: { key: string; value: string }) => {
    if (!db) throw new Error('Database not initialized');
    const updatedAt = Date.now();
    db.prepare(
      `INSERT INTO config (key, value, updated_at) VALUES (@key, @value, @updatedAt)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    ).run({ key: payload.key, value: payload.value, updatedAt });

    return { key: payload.key, value: payload.value, updatedAt };
  });

  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.handle('window:toggle-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;

    // macOS 上“绿色”按钮更接近“全屏”语义；其他平台使用最大化/还原。
    if (process.platform === 'darwin') {
      const next = !win.isFullScreen();
      win.setFullScreen(next);
      return next;
    }

    if (win.isMaximized()) {
      win.unmaximize();
      return false;
    }

    win.maximize();
    return true;
  });

  ipcMain.handle('window:is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return (win?.isMaximized() ?? false) || (win?.isFullScreen() ?? false);
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
