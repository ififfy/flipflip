import fs from "fs";
import wretch from "wretch";
import {
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  shell,
  clipboard,
  nativeImage,
} from "electron";
import { urlToPath } from "../renderer/data/utils";

import {
  createNewWindow,
  saveExport,
  openImport,
  openDirectory,
  openVideoDirs,
  openVideos,
  openAudios,
  openScripts,
  openSubtitle,
  openScript,
  saveScript,
  getWindow,
  setProgressBar,
} from "./WindowManager";
import { IPC } from "../common/const";
import { getBackups } from "./utils";
import {
  createNewAppStorage,
  saveAppStorage,
  createBackup,
} from "./storage/StorageManager";
import AppStorageState from "../common/AppStorageState";
import {
  cleanBackups,
  getFonts,
  getRedditSubscriptions,
  getTumblrFollowing,
  redditAuth,
  reset,
  restoreFromBackup,
  tumblrAuth,
} from "./actions";
import Config from "../common/Config";
import PlayerMenu from "./PlayerMenu";

// Define functions
function onRequestCreateNewWindow() {
  createNewWindow();
}

function onRequestBackups() {
  return getBackups();
}

function onRequestAppStorage(ev: IpcMainInvokeEvent) {
  return createNewAppStorage(ev.sender.id);
}

function onSaveAppStorage(ev: IpcMainEvent, state: AppStorageState) {
  saveAppStorage(ev.sender.id, state);
}

function onCreateBackup(ev: IpcMainEvent, state: AppStorageState) {
  createBackup(ev.sender.id, state);
}

function onCleanBackups(ev: IpcMainEvent, config: Config) {
  cleanBackups(config);
}

function onRestoreBackup(ev: IpcMainInvokeEvent, backupFile: string) {
  return restoreFromBackup(backupFile);
}

function onOpenExternal(ev: IpcMainEvent, url: string) {
  shell.openExternal(url);
}

function onShowItemInFolder(ev: IpcMainEvent, path: string) {
  if (fs.existsSync(path)) {
    shell.showItemInFolder(path);
  }
}

function onReset(ev: IpcMainEvent) {
  reset(ev.sender.id);
}

async function onSaveExport(ev: IpcMainEvent, filePath: string, json: string) {
  await saveExport(ev.sender.id, filePath, json);
}

async function onOpenImport(ev: IpcMainEvent) {
  return await openImport(ev.sender.id);
}

async function onOpenDirectory(ev: IpcMainEvent, multiSelections?: boolean) {
  return await openDirectory(ev.sender.id, multiSelections);
}

async function onOpenVideoDirs(ev: IpcMainEvent) {
  return await openVideoDirs(ev.sender.id);
}

async function onOpenVideos(ev: IpcMainEvent) {
  return await openVideos(ev.sender.id);
}

async function onOpenAudios(ev: IpcMainEvent, shiftKey: boolean) {
  return await openAudios(ev.sender.id, shiftKey);
}

async function onOpenScripts(ev: IpcMainEvent, shiftKey: boolean) {
  return await openScripts(ev.sender.id, shiftKey);
}

async function onOpenSubtitle(ev: IpcMainEvent) {
  return await openSubtitle(ev.sender.id);
}

async function onOpenScript(ev: IpcMainEvent) {
  return await openScript(ev.sender.id);
}

async function onSaveScript(ev: IpcMainEvent, script: string) {
  return await saveScript(ev.sender.id, script);
}

async function onGetFonts(ev: IpcMainEvent) {
  return await getFonts();
}

function onTumblrAuthRequest(
  ev: IpcMainEvent,
  tumblrKey: string,
  tumblrSecret: string,
) {
  const window = getWindow(ev.sender.id);
  if (window == null) {
    return;
  }

  tumblrAuth(window, tumblrKey, tumblrSecret);
}

function onRedditAuthRequest(
  ev: IpcMainEvent,
  userAgent: string,
  clientID: string,
  deviceID: string,
) {
  const window = getWindow(ev.sender.id);
  if (window == null) {
    return;
  }

  redditAuth(window, userAgent, clientID, deviceID);
}

function onRequestIsFirstWindow(ev: IpcMainInvokeEvent) {
  return ev.sender.id === 1;
}

function onSetProgressBar(ev: IpcMainEvent, progress: number) {
  setProgressBar(ev.sender.id, progress);
}

function onGetRedditSubscriptions(
  ev: IpcMainInvokeEvent,
  userAgent: string,
  clientId: string,
  refreshToken: string,
  after: string,
) {
  return getRedditSubscriptions(userAgent, clientId, refreshToken, after);
}

async function onGetTumblrFollowing(
  ev: IpcMainInvokeEvent,
  key: string,
  secret: string,
  token: string,
  tokenSecret: string,
  limit: number,
  offset: number,
) {
  return await getTumblrFollowing(
    key,
    secret,
    token,
    tokenSecret,
    limit,
    offset,
  );
}

function onSetAlwaysOnTop(ev: IpcMainEvent, alwaysOnTop: boolean) {
  const window = getWindow(ev.sender.id);
  if (window == null) {
    return;
  }

  window.setAlwaysOnTop(alwaysOnTop);
  PlayerMenu.setAlwaysOnTop(alwaysOnTop);
}

function onSetMenuBarVisibility(ev: IpcMainEvent, showMenu: boolean) {
  const window = getWindow(ev.sender.id);
  if (window == null) {
    return;
  }

  window.setMenuBarVisibility(showMenu);
  PlayerMenu.setMenuBarVisibility(showMenu);
}

function onSetFullScreen(ev: IpcMainEvent, fullScreen: boolean) {
  const window = getWindow(ev.sender.id);
  if (window == null) {
    return;
  }

  window.setFullScreen(fullScreen);
  PlayerMenu.setFullScreen(fullScreen);
}

function onCopyImageToClipboard(ev: IpcMainEvent, sourceURL: string) {
  let url = sourceURL;
  if (!url) {
    url =
      this.props.historyPaths[
        this.props.historyPaths.length - 1 + this.props.historyOffset
      ].src;
  }
  const isFile = url.startsWith("file://");
  const path = urlToPath(url);
  const imagePath = isFile ? path : url;
  if (
    imagePath.toLocaleLowerCase().endsWith(".png") ||
    imagePath.toLocaleLowerCase().endsWith(".jpg") ||
    imagePath.toLocaleLowerCase().endsWith(".jpeg")
  ) {
    if (isFile) {
      clipboard.writeImage(nativeImage.createFromPath(imagePath));
    } else {
      wretch(imagePath)
        .get()
        .arrayBuffer((arrayBuffer) => {
          const buffer = Buffer.from(arrayBuffer);
          const bufferImage = nativeImage.createFromBuffer(buffer);
          if (bufferImage.isEmpty()) {
            clipboard.writeText(imagePath);
          } else {
            clipboard.writeImage(bufferImage);
          }
        });
    }
  } else {
    clipboard.writeText(imagePath);
  }
}

// Initialize and release listeners
let initialized = false;
export function initializeIpcEvents() {
  if (initialized) {
    return;
  }

  initialized = true;
  ipcMain.on(IPC.newWindow, onRequestCreateNewWindow);
  ipcMain.handle(IPC.isFirstWindow, onRequestIsFirstWindow);
  ipcMain.handle(IPC.getBackups, onRequestBackups);
  ipcMain.handle(IPC.getAppStorage, onRequestAppStorage);
  ipcMain.on(IPC.saveAppStorage, onSaveAppStorage);
  ipcMain.on(IPC.createBackup, onCreateBackup);
  ipcMain.on(IPC.cleanBackups, onCleanBackups);
  ipcMain.handle(IPC.restoreBackup, onRestoreBackup);
  ipcMain.on(IPC.openExternal, onOpenExternal);
  ipcMain.on(IPC.showItemInFolder, onShowItemInFolder);
  ipcMain.on(IPC.reset, onReset);
  ipcMain.on(IPC.saveExport, onSaveExport);
  ipcMain.handle(IPC.openImport, onOpenImport);
  ipcMain.handle(IPC.openDirectory, onOpenDirectory);
  ipcMain.handle(IPC.openVideoDirs, onOpenVideoDirs);
  ipcMain.handle(IPC.openVideos, onOpenVideos);
  ipcMain.handle(IPC.openAudios, onOpenAudios);
  ipcMain.handle(IPC.openScripts, onOpenScripts);
  ipcMain.handle(IPC.openSubtitle, onOpenSubtitle);
  ipcMain.handle(IPC.openScript, onOpenScript);
  ipcMain.handle(IPC.saveScript, onSaveScript);
  ipcMain.handle(IPC.getFonts, onGetFonts);
  ipcMain.on(IPC.tumblrAuthRequest, onTumblrAuthRequest);
  ipcMain.on(IPC.redditAuthRequest, onRedditAuthRequest);
  ipcMain.on(IPC.setProgressBar, onSetProgressBar);
  ipcMain.handle(IPC.redditSubscriptions, onGetRedditSubscriptions);
  ipcMain.handle(IPC.tumblrFollowing, onGetTumblrFollowing);
  ipcMain.on(IPC.buildPlayerMenu, PlayerMenu.create);
  ipcMain.on(IPC.destroyPlayerMenu, PlayerMenu.destroy);
  ipcMain.on(IPC.setAllwaysOnTop, onSetAlwaysOnTop);
  ipcMain.on(IPC.setMenuBarVisibility, onSetMenuBarVisibility);
  ipcMain.on(IPC.setFullScreen, onSetFullScreen);
  ipcMain.on(IPC.playerMenuSetPlayPause, PlayerMenu.setIsPlaying);
  ipcMain.on(IPC.copyImageToClipboard, onCopyImageToClipboard);
}

export function releaseIpcEvents() {
  if (initialized) {
    ipcMain.removeAllListeners(IPC.newWindow);
    ipcMain.removeAllListeners(IPC.getBackups);
    // FIXME removeAllListeners for all initialized events
  }

  initialized = false;
}
