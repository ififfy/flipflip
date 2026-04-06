import fs from "fs";
import path from "path";
import { app, BrowserWindow, dialog } from "electron";
import windowStateKeeper from "electron-window-state";

import { releaseIpcEvents } from "./IPCEvents";
import { IPC } from "../common/const";
import { getFilesRecursively } from "./utils";
import { isText, isAudio, isVideo, isVideoPlaylist } from "../common/utils";

// Current window list
const currentWindows: Map<number, BrowserWindow> = new Map();

export function startScene(sceneName: string) {
  const w = currentWindows.get(1);
  if (w) {
    console.log("Attempting to start scene '" + sceneName + "'");
    w.webContents.send(IPC.startScene, sceneName);
  }
}

export function getWindow(windowId: number) {
  return currentWindows.get(windowId);
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
    return undefined;
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

export async function openDirectory(
  windowId: number,
  multiSelections?: boolean,
) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return [];
  }

  const result = await dialog.showOpenDialog(window, {
    properties: multiSelections
      ? ["openDirectory", "multiSelections"]
      : ["openDirectory"],
  });

  return result.filePaths;
}

export async function openVideoDirs(windowId: number) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return [];
  }

  const result = await dialog.showOpenDialog(window, {
    filters: [{ name: "All Files (*.*)", extensions: ["*"] }],
    properties: ["openDirectory", "multiSelections"],
  });

  let files = new Array<string>();
  for (const filePath of result.filePaths) {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
      files = files.concat(getFilesRecursively(filePath));
    } else {
      files.push(filePath);
    }
  }

  return files.filter(
    (file) => isVideo(file, true) || isVideoPlaylist(file, true),
  );
}

export async function openVideos(windowId: number) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return [];
  }

  const result = await dialog.showOpenDialog(window, {
    filters: [
      { name: "All Files (*.*)", extensions: ["*"] },
      { name: "Video files", extensions: ["mp4", "mkv", "webm", "ogv", "mov"] },
      { name: "Playlist files", extensions: ["asx", "m3u8", "pls", "xspf"] },
    ],
    properties: ["openFile", "multiSelections"],
  });

  return result.filePaths.filter(
    (r) => isVideo(r, true) || isVideoPlaylist(r, true),
  );
}

export async function openAudios(windowId: number, shiftKey: boolean) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return [];
  }

  let audios = new Array<string>();
  if (shiftKey) {
    const result = await dialog.showOpenDialog(window, {
      filters: [{ name: "All Files (*.*)", extensions: ["*"] }],
      properties: ["openDirectory", "multiSelections"],
    });

    for (const filePath of result.filePaths) {
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        audios = audios.concat(getFilesRecursively(filePath));
      } else {
        audios.push(filePath);
      }
    }
  } else {
    const result = await dialog.showOpenDialog(window, {
      filters: [
        { name: "All Files (*.*)", extensions: ["*"] },
        { name: "Audio files", extensions: ["mp3", "m4a", "wav", "ogg"] },
      ],
      properties: ["openFile", "multiSelections"],
    });

    audios = result.filePaths;
  }

  return audios.filter((r) => isAudio(r, true));
}

export async function openScripts(windowId: number, shiftKey: boolean) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return [];
  }

  let scripts = new Array<string>();
  if (shiftKey) {
    const result = await dialog.showOpenDialog(window, {
      filters: [{ name: "All Files (*.*)", extensions: ["*"] }],
      properties: ["openDirectory", "multiSelections"],
    });

    for (const filePath of result.filePaths) {
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        scripts = scripts.concat(getFilesRecursively(filePath));
      } else {
        scripts.push(filePath);
      }
    }
  } else {
    const result = await dialog.showOpenDialog(window, {
      filters: [
        { name: "All Files (*.*)", extensions: ["*"] },
        { name: "Text files", extensions: ["txt"] },
      ],
      properties: ["openFile", "multiSelections"],
    });

    scripts = result.filePaths;
  }

  return scripts.filter((r) => isText(r, true));
}

export async function openSubtitle(windowId: number) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return undefined;
  }

  const result = await dialog.showOpenDialog(window, {
    filters: [
      { name: "All Files (*.*)", extensions: ["*"] },
      { name: "Web Video Text Tracks (WebVTT)", extensions: ["vtt"] },
    ],
    properties: ["openFile"],
  });

  return result.filePaths.length > 0 ? result.filePaths[0] : undefined;
}

export async function openScript(windowId: number) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return undefined;
  }

  const result = await dialog.showOpenDialog(window, {
    filters: [
      { name: "All Files (*.*)", extensions: ["*"] },
      { name: "Text Document", extensions: ["txt"] },
    ],
    properties: ["openFile"],
  });

  return result.filePaths.length > 0 ? result.filePaths[0] : undefined;
}

export async function saveScript(windowId: number, script: string) {
  const window = currentWindows.get(windowId);
  if (window == null) {
    return undefined;
  }

  const result = await dialog.showSaveDialog(window, {
    filters: [{ name: "Text Document", extensions: ["txt"] }],
    defaultPath: this.state.captionScript.url,
  });

  if (result.canceled) {
    return undefined;
  }

  fs.writeFileSync(result.filePath, script);
  return result.filePath;
}
