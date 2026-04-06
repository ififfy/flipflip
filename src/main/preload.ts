import { contextBridge, ipcRenderer } from "electron";
import { IPC } from "../common/const";
import AppStorageState from "../common/AppStorageState";
import Config from "../common/Config";
import AuthResponse from "../common/AuthResponse";

contextBridge.exposeInMainWorld("ipc", {
  platform: () => process.platform,
  newWindow: () => ipcRenderer.send(IPC.newWindow),
  isFirstWindow: () => ipcRenderer.invoke(IPC.isFirstWindow),
  setProgressBar: (progress: number) =>
    ipcRenderer.send(IPC.setProgressBar, progress),
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
  showItemInFolder: (path: string) =>
    ipcRenderer.send(IPC.showItemInFolder, path),
  reset: () => ipcRenderer.send(IPC.reset),
  saveExport: (filePath: string, json: string) =>
    ipcRenderer.send(IPC.saveExport, filePath, json),
  openImport: () => ipcRenderer.invoke(IPC.openImport),
  openDirectory: (multiSelections?: boolean) =>
    ipcRenderer.invoke(IPC.openDirectory, multiSelections),
  openVideoDirs: () => ipcRenderer.invoke(IPC.openVideoDirs),
  openVideos: () => ipcRenderer.invoke(IPC.openVideos),
  openAudios: (shiftKey: boolean) =>
    ipcRenderer.invoke(IPC.openAudios, shiftKey),
  openScripts: (shiftKey: boolean) =>
    ipcRenderer.invoke(IPC.openScripts, shiftKey),
  openSubtitle: () => ipcRenderer.invoke(IPC.openSubtitle),
  openScript: () => ipcRenderer.invoke(IPC.openScript),
  saveScript: (script: string) => ipcRenderer.invoke(IPC.saveScript, script),
  getFonts: () => ipcRenderer.invoke(IPC.getFonts),
  tumblrAuthRequest: (tumblrKey: string, tumblrSecret: string) =>
    ipcRenderer.send(IPC.tumblrAuthRequest, tumblrKey, tumblrSecret),
  onTumblrAuthResponse: (callback: (response: AuthResponse) => void) =>
    ipcRenderer.once(IPC.tumblrAuthResponse, (_event, response: AuthResponse) =>
      callback(response),
    ),
  redditAuthRequest: (userAgent: string, clientID: string, deviceID: string) =>
    ipcRenderer.send(IPC.redditAuthRequest, userAgent, clientID, deviceID),
  onRedditAuthResponse: (callback: (response: AuthResponse) => void) =>
    ipcRenderer.once(IPC.redditAuthResponse, (_event, response: AuthResponse) =>
      callback(response),
    ),
  onStartScene: (callback: (sceneName: string) => void) =>
    ipcRenderer.on(IPC.startScene, (_event, sceneName: string) =>
      callback(sceneName),
    ),
});
