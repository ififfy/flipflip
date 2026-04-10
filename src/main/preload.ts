// import fs from "fs";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPC } from "../common/const";
import AppStorageState from "../common/AppStorageState";
import Config from "../common/Config";
import AuthResponse from "../common/AuthResponse";
import LibrarySource from "../common/LibrarySource";
// import { parseFile } from "music-metadata";

// FIXME these are just dummys
contextBridge.exposeInMainWorld("files", {
  existsSync: (path: string) => true,
  readFileSync: (path: string) => "text",
  parseAudioFile: (path: string) => Promise.resolve({}),
});

// FIXME
// contextBridge.exposeInMainWorld("files", {
//   existsSync: (path: string) => fs.existsSync(path),
//   readFileSync: (path: string) => fs.readFileSync(path),
//   parseAudioFile: (path: string) => parseFile(path),
// });

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
  saveScriptAs: (script: string) =>
    ipcRenderer.invoke(IPC.saveScriptAs, script),
  saveScript: (url: string, script: string) =>
    ipcRenderer.invoke(IPC.saveScript, url, script),
  getFonts: () => ipcRenderer.invoke(IPC.getFonts),
  tumblrAuthRequest: (tumblrKey: string, tumblrSecret: string) =>
    ipcRenderer.send(IPC.tumblrAuthRequest, tumblrKey, tumblrSecret),
  onTumblrAuthResponse: (callback: (response: AuthResponse) => void) =>
    ipcRenderer.once(IPC.tumblrAuthResponse, (_event, response: AuthResponse) =>
      callback(response),
    ),
  tumblrFollowing: (
    key: string,
    secret: string,
    token: string,
    tokenSecret: string,
    limit: number,
    offset: number,
  ) =>
    ipcRenderer.invoke(
      IPC.tumblrFollowing,
      key,
      secret,
      token,
      tokenSecret,
      limit,
      offset,
    ),
  redditAuthRequest: (userAgent: string, clientID: string, deviceID: string) =>
    ipcRenderer.send(IPC.redditAuthRequest, userAgent, clientID, deviceID),
  onRedditAuthResponse: (callback: (response: AuthResponse) => void) =>
    ipcRenderer.once(IPC.redditAuthResponse, (_event, response: AuthResponse) =>
      callback(response),
    ),
  redditSubscriptions: (
    userAgent: string,
    clientId: string,
    refreshToken: string,
    after: string,
  ) =>
    ipcRenderer.invoke(
      IPC.redditSubscriptions,
      userAgent,
      clientId,
      refreshToken,
      after,
    ),
  onStartScene: (callback: (sceneName: string) => void) =>
    ipcRenderer.on(IPC.startScene, (_event, sceneName: string) =>
      callback(sceneName),
    ),
  buildPlayerMenu: (
    isPlaying: boolean,
    fullScreen: boolean,
    alwaysOnTop: boolean,
    showMenu: boolean,
    cachingEnabled: boolean,
    downloadScene: boolean,
    audioScene: boolean,
    scriptScene: boolean,
    hasAllTags: boolean,
  ) =>
    ipcRenderer.send(
      IPC.buildPlayerMenu,
      isPlaying,
      fullScreen,
      alwaysOnTop,
      showMenu,
      cachingEnabled,
      downloadScene,
      audioScene,
      scriptScene,
      hasAllTags,
    ),
  destroyPlayerMenu: () => ipcRenderer.send(IPC.destroyPlayerMenu),
  onPlayerMenu: (
    historyBack: () => void,
    historyForward: () => void,
    navigateBack: () => void,
    toggleFullscreen: () => void,
    toggleAlwaysOnTop: () => void,
    toggleMenuBarDisplay: () => void,
    onDelete: () => void,
    prevSource: () => void,
    nextSource: () => void,
  ) => {
    ipcRenderer.on(IPC.playerMenuHistoryBack, historyBack);
    ipcRenderer.on(IPC.playerMenuHistoryForward, historyForward);
    ipcRenderer.on(IPC.playerMenuNavigateBack, navigateBack);
    ipcRenderer.on(IPC.playerMenuToggleFullscreen, toggleFullscreen);
    ipcRenderer.on(IPC.playerMenuToggleAlwaysOnTop, toggleAlwaysOnTop);
    ipcRenderer.on(IPC.playerMenuToggleMenuBarDisplay, toggleMenuBarDisplay);
    ipcRenderer.on(IPC.playerMenuOnDelete, onDelete);
    ipcRenderer.on(IPC.playerMenuPrevSource, prevSource);
    ipcRenderer.on(IPC.playerMenuNextSource, nextSource);
  },
  offPlayerMenu: (
    historyBack: () => void,
    historyForward: () => void,
    navigateBack: () => void,
    toggleFullscreen: () => void,
    toggleAlwaysOnTop: () => void,
    toggleMenuBarDisplay: () => void,
    onDelete: () => void,
    prevSource: () => void,
    nextSource: () => void,
  ) => {
    ipcRenderer.off(IPC.playerMenuHistoryBack, historyBack);
    ipcRenderer.off(IPC.playerMenuHistoryForward, historyForward);
    ipcRenderer.off(IPC.playerMenuNavigateBack, navigateBack);
    ipcRenderer.off(IPC.playerMenuToggleFullscreen, toggleFullscreen);
    ipcRenderer.off(IPC.playerMenuToggleAlwaysOnTop, toggleAlwaysOnTop);
    ipcRenderer.off(IPC.playerMenuToggleMenuBarDisplay, toggleMenuBarDisplay);
    ipcRenderer.off(IPC.playerMenuOnDelete, onDelete);
    ipcRenderer.off(IPC.playerMenuPrevSource, prevSource);
    ipcRenderer.off(IPC.playerMenuNextSource, nextSource);
  },
  setAllwaysOnTop: (alwaysOnTop: boolean) =>
    ipcRenderer.send(IPC.setAllwaysOnTop, alwaysOnTop),
  setMenuBarVisibility: (showMenu: boolean) =>
    ipcRenderer.send(IPC.setMenuBarVisibility, showMenu),
  setFullScreen: (fullScreen: boolean) =>
    ipcRenderer.send(IPC.setFullScreen, fullScreen),
  playerMenuSetPlayPause: (play: boolean) =>
    ipcRenderer.send(IPC.playerMenuSetPlayPause, play),
  copyImageToClipboard: (sourceURL: string) =>
    ipcRenderer.send(IPC.copyImageToClipboard, sourceURL),
  showPlayerContextMenu: (
    config: Config,
    url: string,
    source: string,
    post?: string,
  ) => ipcRenderer.send(IPC.showPlayerContextMenu, config, url, source, post),
  onClosePlayerContextMenu: (callback: () => void) =>
    ipcRenderer.once(IPC.closePlayerContextMenu, callback),
  onBlacklistFile: (
    callback: (
      event: IpcRendererEvent,
      literalSource: string,
      path: string,
    ) => void,
  ) => ipcRenderer.on(IPC.blacklistFile, callback),
  onDeletePath: (callback: (event: IpcRendererEvent, path: string) => void) =>
    ipcRenderer.on(IPC.deletePath, callback),
  onGoToTagSource: (
    callback: (event: IpcRendererEvent, source: string) => void,
  ) => ipcRenderer.on(IPC.goToTagSource, callback),
  onGoToClipSource: (
    callback: (event: IpcRendererEvent, source: string) => void,
  ) => ipcRenderer.on(IPC.goToClipSource, callback),
  onShowRecentPictureGrid: (callback: () => void) =>
    ipcRenderer.on(IPC.showRecentPictureGrid, callback),
  offBlacklistFile: (
    callback: (
      event: IpcRendererEvent,
      literalSource: string,
      path: string,
    ) => void,
  ) => ipcRenderer.off(IPC.blacklistFile, callback),
  offDeletePath: (callback: (event: IpcRendererEvent, path: string) => void) =>
    ipcRenderer.off(IPC.deletePath, callback),
  offGoToTagSource: (
    callback: (event: IpcRendererEvent, source: string) => void,
  ) => ipcRenderer.off(IPC.goToTagSource, callback),
  offGoToClipSource: (
    callback: (event: IpcRendererEvent, source: string) => void,
  ) => ipcRenderer.off(IPC.goToClipSource, callback),
  offShowRecentPictureGrid: (callback: () => void) =>
    ipcRenderer.off(IPC.showRecentPictureGrid, callback),
  startPowerSaveBlocker: () => ipcRenderer.invoke(IPC.startPowerSaveBlocker),
  stopPowerSaveBlocker: (powerSaveID: number) =>
    ipcRenderer.send(IPC.stopPowerSaveBlocker, powerSaveID),
  clearBrowserCaches: () => ipcRenderer.send(IPC.clearBrowserCaches),
  getFileSize: (path: string) => ipcRenderer.invoke(IPC.getFileSize, path),
  readTextFile: (path: string) => ipcRenderer.invoke(IPC.readTextFile, path),
  cacheImage: (config: Config, url: string, source: string) =>
    ipcRenderer.send(IPC.cacheImage, config, url, source),
  getCacheSize: (config: Config) =>
    ipcRenderer.invoke(IPC.getCacheSize, config),
  onScrapeFilesResponse: (callback: (message: any) => void) =>
    ipcRenderer.once(IPC.scrapeFilesResponse, (event, message: any) =>
      callback(message),
    ),
  scrapeFiles: (
    allURLs: Map<string, string[]>,
    allPosts: Map<string, string>,
    config: Config,
    source: LibrarySource,
    imageTypeFilter: string,
    weightFunction: string,
    helpers: { next: any; count: number; retries: number; uuid: string },
  ) =>
    ipcRenderer.send(
      IPC.scrapeFilesRequest,
      allURLs,
      allPosts,
      config,
      source,
      imageTypeFilter,
      weightFunction,
      helpers,
    ),
  deleteLibrarySource: (sourceURL: string, config: Config) =>
    ipcRenderer.invoke(IPC.deleteLibrarySource, sourceURL, config),
  clearCache: (config: Config) => ipcRenderer.invoke(IPC.clearCache, config),
  moveLibrarySource: (sourceURL: string, config: Config) =>
    ipcRenderer.invoke(IPC.libraryMove, sourceURL, config),
  portablePathExists: () => ipcRenderer.invoke(IPC.portablePathExists),
  validateConfig: (config: Config) =>
    ipcRenderer.invoke(IPC.validateConfig, config),
  deleteAllLibrarySources: (sourceURLs: string[]) =>
    ipcRenderer.invoke(IPC.deleteAllLibrarySources, sourceURLs),
  deleteSource: (sourceURL: string) =>
    ipcRenderer.invoke(IPC.deleteSource, sourceURL),
  filterNewScriptSources: (newSources: string[]) =>
    ipcRenderer.invoke(IPC.filterNewScriptSources, newSources),
  getCachePath: (sourceURL: string) =>
    ipcRenderer.invoke(IPC.getCachePath, sourceURL),
  deleteBlacklistedFile: (
    fileToBlacklist: string,
    sourceURL: string,
    config: Config,
  ) =>
    ipcRenderer.send(
      IPC.deleteBlacklistedFile,
      fileToBlacklist,
      sourceURL,
      config,
    ),
});
