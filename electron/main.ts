import { menubar } from 'menubar';
import { app, nativeImage, Menu, Tray } from 'electron';
import * as path from 'path';
import { registerIpcHandlers } from './ipc-handlers';
import { startNotificationScheduler, stopNotificationScheduler } from './notifications';

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

app.dock?.hide();

// Register IPC handlers early so they're available when the preloaded window calls them
registerIpcHandlers();

const iconPath = path.join(__dirname, '..', 'assets', 'IconTemplate.png');
const icon = nativeImage.createFromPath(iconPath);
icon.setTemplateImage(true);

const indexUrl = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, '..', 'dist-renderer', 'index.html')}`;

const mb = menubar({
  index: indexUrl,
  icon,
  preloadWindow: true,
  browserWindow: {
    width: 380,
    height: 520,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  },
});

mb.on('ready', () => {
  console.log('Time Tracker ready');
  startNotificationScheduler(mb);

  const tray = mb.tray;
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Time Tracker', click: () => mb.showWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });
});

mb.on('after-hide', () => {
  // Window hidden, nothing to do
});

app.on('will-quit', () => {
  stopNotificationScheduler();
});
