import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Module from 'node:module';
import type { Database } from 'better-sqlite3';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const betterSqliteSpecifier = app.isPackaged
  ? path.join(process.resourcesPath, 'better-sqlite3')
  : 'better-sqlite3';

const nodeRequire = Module.createRequire(__filename);
const BetterSqlite = nodeRequire(betterSqliteSpecifier) as unknown as typeof import('better-sqlite3');
const db: Database = new BetterSqlite(path.join(app.getPath('userData'), 'app-template.db'));

db.prepare(
  `CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
).run();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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

ipcMain.handle('app:ping', () => 'pong');

ipcMain.handle('config:get', (_event, key: string) => {
  const row = db.prepare('SELECT key, value, updated_at FROM config WHERE key = ?').get(key);
  if (!row) return null;
  return { key: row.key as string, value: row.value as string, updatedAt: Number(row.updated_at) };
});

ipcMain.handle('config:set', (_event, payload: { key: string; value: string }) => {
  const updatedAt = Date.now();
  db.prepare(
    `INSERT INTO config (key, value, updated_at) VALUES (@key, @value, @updatedAt)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  ).run({ key: payload.key, value: payload.value, updatedAt });

  return { key: payload.key, value: payload.value, updatedAt };
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
