import {app, BrowserWindow} from 'electron';
import windowStateKeeper from 'electron-window-state';
import * as path from 'path';
import * as url from 'url';

import {releaseIpcEvents} from "./IPCEvents";
import {IPC} from "../renderer/data/const";

// Current window list
const currentWindows: Map<number, BrowserWindow> = new Map();

export function startScene(sceneName: string) {
  const w = currentWindows.get(1);
  if (w) {
    console.log("Attempting to start scene '" + sceneName + "'");
    w.webContents.send(IPC.startScene, sceneName);
  }
}

export function createNewWindow() {
  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultHeight: 800,
    defaultWidth: 600,
  });

  // Create the window using the state information
  const newWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    'icon': path.join(__dirname, 'src/renderer/icons/flipflip_logo.png'),
    'title': 'FlipFlip',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Store this window in the map
  const windowId = newWindow.id;
  currentWindows.set(windowId, newWindow);

  // Only manage the size of the mainWindow
  if (windowId == 1) {
    mainWindowState.manage(newWindow);
  }

  newWindow.on('closed', () => {
    // If we close the main window, close everything
    if (windowId == 1) {
      releaseIpcEvents();
      app.quit();
    } else {
      // Else just remove that window
      currentWindows.delete(windowId);
    }
  });

  // Add * to extra windows
  newWindow.webContents.on('did-finish-load', () => {
    if (windowId != 1) {
      newWindow.setTitle(newWindow.getTitle() + "*");
    }
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    newWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    newWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  const isDevToolsDisabled = Boolean(process.argv.find((el, i, arr) => {
    return el == '--no-dev-tools';
  }));
  if (process.defaultApp && windowId == 1 && !isDevToolsDisabled) {
    // Comment the following line out to enable attachment of a remote debugger
    newWindow.webContents.openDevTools();
  }
}