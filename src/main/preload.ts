import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPC } from "../common/const";
import AppStorageState from "../common/AppStorageState";
import Config from "../common/Config";
import AuthResponse from "../common/AuthResponse";
import LibrarySource from "../common/LibrarySource";
import Audio from "../common/Audio";

contextBridge.exposeInMainWorld("ipc", {
  platform: () => process.platform,
  getConstants: () => ipcRenderer.invoke(IPC.getConstants),
  newWindow: () => ipcRenderer.send(IPC.newWindow),
  initScenePicker: (version: string) =>
    ipcRenderer.invoke(IPC.initScenePicker, version),
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
  saveScriptAs: (script: string, defaultPath: string) =>
    ipcRenderer.invoke(IPC.saveScriptAs, script, defaultPath),
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
  onStartScene: (callback: (sceneName: string) => void) => {
    const channel = IPC.startScene;
    const listener = (event: IpcRendererEvent, sceneName: string) =>
      callback(sceneName);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
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
  onPlayerMenuPlayPause: (callback: () => void) => {
    const channel = IPC.playerMenuPlayPause;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuHistoryBack: (callback: () => void) => {
    const channel = IPC.playerMenuHistoryBack;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuHistoryForward: (callback: () => void) => {
    const channel = IPC.playerMenuHistoryForward;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuNavigateBack: (callback: () => void) => {
    const channel = IPC.playerMenuNavigateBack;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuToggleFullscreen: (callback: () => void) => {
    const channel = IPC.playerMenuToggleFullscreen;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuToggleAlwaysOnTop: (callback: () => void) => {
    const channel = IPC.playerMenuToggleAlwaysOnTop;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuToggleMenuBarDisplay: (callback: () => void) => {
    const channel = IPC.playerMenuToggleMenuBarDisplay;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuOnDelete: (callback: () => void) => {
    const channel = IPC.playerMenuOnDelete;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuPrevSource: (callback: () => void) => {
    const channel = IPC.playerMenuPrevSource;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onPlayerMenuNextSource: (callback: () => void) => {
    const channel = IPC.playerMenuNextSource;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
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
    showGotoTagSource: boolean,
    showRecentPictureGrid: boolean,
    url: string,
    source: string,
    post?: string,
  ) =>
    ipcRenderer.send(
      IPC.showPlayerContextMenu,
      config,
      showGotoTagSource,
      showRecentPictureGrid,
      url,
      source,
      post,
    ),
  onClosePlayerContextMenu: (callback: () => void) =>
    ipcRenderer.once(IPC.closePlayerContextMenu, callback),
  onBlacklistFile: (
    callback: (literalSource: string, path: string) => void,
  ) => {
    const channel = IPC.blacklistFile;
    const listener = (
      event: IpcRendererEvent,
      literalSource: string,
      path: string,
    ) => callback(literalSource, path);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onDeletePath: (callback: (path: string) => void) => {
    const channel = IPC.deletePath;
    const listener = (event: IpcRendererEvent, path: string) => callback(path);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onGoToTagSource: (callback: (source: string) => void) => {
    const channel = IPC.goToTagSource;
    const listener = (event: IpcRendererEvent, source: string) =>
      callback(source);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onGoToClipSource: (callback: (source: string) => void) => {
    const channel = IPC.goToClipSource;
    const listener = (event: IpcRendererEvent, source: string) =>
      callback(source);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  onShowRecentPictureGrid: (callback: () => void) => {
    const channel = IPC.showRecentPictureGrid;
    const listener = (event: IpcRendererEvent) => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
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
  onScrapeFilesResponse: (callback: (message: any) => void) => {
    const channel = IPC.scrapeFilesResponse;
    const listener = (event: IpcRendererEvent, message: any) =>
      callback(message);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
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
  getCachePath: (config: Config) =>
    ipcRenderer.invoke(IPC.getCachePath, config),
  getSourceCachePath: (sourceURL: string, config: Config) =>
    ipcRenderer.invoke(IPC.getSourceCachePath, sourceURL, config),
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
  cleanCache: (cachePath: string) =>
    ipcRenderer.invoke(IPC.cleanCache, cachePath),
  revealFile: (sourceURL: string, config: Config) =>
    ipcRenderer.send(IPC.revealFile, sourceURL, config),
  finishDelete: (filePath: string) =>
    ipcRenderer.invoke(IPC.finishDelete, filePath),
  getBackupFile: (backupURL: string) =>
    ipcRenderer.invoke(IPC.getBackupFile, backupURL),
  shouldShowDeleteDialog: (sourceURL: string) =>
    ipcRenderer.invoke(IPC.shouldShowDeleteDialog, sourceURL),
  getGifInfo: (url: string) => ipcRenderer.invoke(IPC.getGifInfo, url),
  fileExists: (filePath: string) =>
    ipcRenderer.invoke(IPC.fileExists, filePath),
  getCachedFileURL: (source: string, url: string, config: Config) =>
    ipcRenderer.invoke(IPC.getCachedFileURL, source, url, config),
  getScraperSources: (sources: LibrarySource[]) =>
    ipcRenderer.invoke(IPC.getScraperSources, sources),
  getAudioThumbnail: (config: Config) =>
    ipcRenderer.invoke(IPC.getAudioThumbnail, config),
  addAudioSource: (url: string, id: number, config: Config) =>
    ipcRenderer.invoke(IPC.addAudioSource, url, id, config),
  addAudioURL: (url: string, id: number, config: Config) =>
    ipcRenderer.invoke(IPC.addAudioURL, url, id, config),
  getAudioMetadata: (audio: Audio, config: Config) =>
    ipcRenderer.invoke(IPC.getAudioMetadata, audio, config),
  getAudioBPMMetadata: (url: string) =>
    ipcRenderer.invoke(IPC.getAudioBPMMetadata, url),
  getAudioBuffer: (url: string) => ipcRenderer.invoke(IPC.getAudioBuffer, url),
});
