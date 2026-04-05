import { contextBridge, ipcRenderer } from "electron";
import { IPC } from "../common/const";
import AppStorageState from "../common/AppStorageState";
import Config from "../common/Config";

contextBridge.exposeInMainWorld("ipc", {
  newWindow: () => ipcRenderer.send(IPC.newWindow),
  getBackups: () => ipcRenderer.invoke(IPC.getBackups),
  getAppStorage: () => ipcRenderer.invoke(IPC.getAppStorage),
  saveAppStorage: (state: AppStorageState) =>
    ipcRenderer.send(IPC.saveAppStorage, state),
  createBackup: (state: AppStorageState) =>
    ipcRenderer.send(IPC.createBackup, state),
  cleanBackups: (config: Config) => ipcRenderer.send(IPC.cleanBackups, config),
  restoreBackup: (backupFile: string) =>
    ipcRenderer.invoke(IPC.restoreBackup, backupFile),
  openExternal: (url: string) => ipcRenderer.send(IPC.openExternal, url),
  reset: () => ipcRenderer.send(IPC.reset),
  saveExport: (filePath: string, json: string) =>
    ipcRenderer.send(IPC.saveExport, filePath, json),
  openImport: () => ipcRenderer.invoke(IPC.openImport),
  openDirectory: () => ipcRenderer.invoke(IPC.openDirectory),
  openVideoDirs: () => ipcRenderer.invoke(IPC.openVideoDirs),
  openVideos: () => ipcRenderer.invoke(IPC.openVideos),
  openAudios: (shiftKey: boolean) =>
    ipcRenderer.invoke(IPC.openAudios, shiftKey),
  onStartScene: (callback: (sceneName: string) => void) =>
    ipcRenderer.on(IPC.startScene, (_event, sceneName: string) =>
      callback(sceneName),
    ),
});
