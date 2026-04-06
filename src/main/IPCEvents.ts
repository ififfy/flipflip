import fs from "fs";
import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, shell } from "electron";

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
  redditAuth,
  reset,
  restoreFromBackup,
  tumblrAuth,
} from "./actions";
import Config from "../common/Config";

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
}

export function releaseIpcEvents() {
  if (initialized) {
    ipcMain.removeAllListeners(IPC.newWindow);
    ipcMain.removeAllListeners(IPC.getBackups);
    // FIXME removeAllListeners for all initialized events
  }

  initialized = false;
}
