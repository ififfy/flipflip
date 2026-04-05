import fs from "fs";
import path from "path";
import { app, BrowserWindow, dialog } from "electron";
import windowStateKeeper from "electron-window-state";

import { releaseIpcEvents } from "./IPCEvents";
import { IPC } from "../common/const";

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
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    icon: path.join(__dirname, "src/renderer/icons/flipflip_logo.png"),
    title: "FlipFlip",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Store this window in the map
  const windowId = newWindow.id;
  currentWindows.set(windowId, newWindow);

  // Only manage the size of the mainWindow
  if (windowId == 1) {
    mainWindowState.manage(newWindow);
  }

  newWindow.on("closed", () => {
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
  newWindow.webContents.on("did-finish-load", () => {
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
  const isDevToolsDisabled = Boolean(
    process.argv.find((el, i, arr) => {
      return el == "--no-dev-tools";
    }),
  );
  if (process.defaultApp && windowId == 1 && !isDevToolsDisabled) {
    // Comment the following line out to enable attachment of a remote debugger
    newWindow.webContents.openDevTools();
  }
}

export function reloadWindow(windowId: number) {
  currentWindows.get(windowId)?.reload();
}

export async function saveExport(
  windowId: number,
  filePath: string,
  json: string,
) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return;
  }

  const result = await dialog.showSaveDialog(window, {
    filters: [{ name: "JSON Document", extensions: ["json"] }],
    defaultPath: filePath,
  });
  if (result.canceled) {
    return;
  }

  fs.writeFileSync(result.filePath, json);
}

export async function openImport(windowId: number) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return;
  }

  const result = await dialog.showOpenDialog(window, {
    filters: [
      { name: "All Files (*.*)", extensions: ["*"] },
      { name: "JSON Document", extensions: ["json"] },
    ],
    properties: ["openFile"],
  });
  return result.filePaths.length > 0 ? result.filePaths[0] : undefined;
}
