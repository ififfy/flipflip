import { ipcMain, IpcMessageEvent } from 'electron'

import { createNewWindow } from './WindowManager'
import {IPC} from "../renderer/data/const";

// Define functions
function onRequestCreateNewWindow(ev: IpcMessageEvent) {
  createNewWindow();
}


// Initialize and release listeners
let initialized = false;
export function initializeIpcEvents() {
  if (initialized) {
    return;
  }

  initialized = true;
  ipcMain.on(IPC.newWindow, onRequestCreateNewWindow);
}

export function releaseIpcEvents() {
  if (initialized) {
    ipcMain.removeAllListeners(IPC.newWindow);
  }

  initialized = false;
}