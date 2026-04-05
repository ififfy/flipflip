import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, shell } from "electron";

import { createNewWindow, saveExport } from "./WindowManager";
import { IPC } from "../common/const";
import { getBackups } from "./utils";
import {
  createNewAppStorage,
  saveAppStorage,
  createBackup,
} from "./storage/StorageManager";
import AppStorageState from "../common/AppStorageState";
import { cleanBackups, reset, restoreFromBackup } from "./actions";
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

function onReset(ev: IpcMainEvent) {
  reset(ev.sender.id);
}

async function onSaveExport(ev: IpcMainEvent, filePath: string, json: string) {
  await saveExport(ev.sender.id, filePath, json);
}

// Initialize and release listeners
let initialized = false;
export function initializeIpcEvents() {
  if (initialized) {
    return;
  }

  initialized = true;
  ipcMain.on(IPC.newWindow, onRequestCreateNewWindow);
  ipcMain.handle(IPC.getBackups, onRequestBackups);
  ipcMain.handle(IPC.getAppStorage, onRequestAppStorage);
  ipcMain.on(IPC.saveAppStorage, onSaveAppStorage);
  ipcMain.on(IPC.createBackup, onCreateBackup);
  ipcMain.on(IPC.cleanBackups, onCleanBackups);
  ipcMain.handle(IPC.restoreBackup, onRestoreBackup);
  ipcMain.on(IPC.openExternal, onOpenExternal);
  ipcMain.on(IPC.reset, onReset);
  ipcMain.on(IPC.saveExport, onSaveExport);
}

export function releaseIpcEvents() {
  if (initialized) {
    ipcMain.removeAllListeners(IPC.newWindow);
    ipcMain.removeAllListeners(IPC.getBackups);
  }

  initialized = false;
}
