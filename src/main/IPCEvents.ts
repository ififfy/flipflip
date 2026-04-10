import fs from "fs";
import wretch from "wretch";
import fileUrl from "file-url";
import {
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  shell,
  clipboard,
  nativeImage,
  Menu,
  MenuItem,
  powerSaveBlocker,
  webFrame,
} from "electron";
import { getCachePath, toArrayBuffer, urlToPath } from "../renderer/data/utils";
import getFolderSize from "get-folder-size";
import { Worker } from "worker_threads";
import { rimrafSync } from "rimraf";
import gifInfo from "gif-info";

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
  saveScriptAs,
  getWindow,
  setProgressBar,
} from "./WindowManager";
import { IPC, ST } from "../common/const";
import { getBackups, portablePath, saveDir } from "./utils";
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
import { getFileName, getSourceType } from "../common/utils";
import { move, outputFile } from "fs-extra";
import LibrarySource from "../common/LibrarySource";
import path from "path";
import { getLocalPath } from "../node/data/utils";
import LibraryMoveResult from "../common/LibraryMoveResult";
import GifInfo from "../common/GifInfo";
import { Constants } from "../common/constants";

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

async function onSaveScriptAs(ev: IpcMainEvent, script: string) {
  return await saveScriptAs(ev.sender.id, script);
}

function onSaveScript(ev: IpcMainEvent, url: string, script: string) {
  fs.writeFileSync(url, script);
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

function onShowPlayerContextMenu(
  ev: IpcMainEvent,
  config: Config,
  url: string,
  source: string,
  post?: string,
) {
  const window = getWindow(ev.sender.id);
  if (window == null) {
    return;
  }

  let contextMenu = new Menu();
  const literalSource = source;
  if (/^https?:\/\//g.exec(source) == null) {
    source = urlToPath(fileUrl(source));
  }
  const isFile = url.startsWith("file://");
  const path = urlToPath(url);
  const type = getSourceType(source);
  contextMenu.append(
    new MenuItem({
      label: literalSource,
      click: () => {
        clipboard.writeText(source);
      },
    }),
  );
  if (!!post) {
    contextMenu.append(
      new MenuItem({
        label: post,
        click: () => {
          clipboard.writeText(post);
        },
      }),
    );
  }
  contextMenu.append(
    new MenuItem({
      label: isFile ? path : url,
      click: () => {
        clipboard.writeText(isFile ? path : url);
      },
    }),
  );
  if (
    url.toLocaleLowerCase().endsWith(".png") ||
    url.toLocaleLowerCase().endsWith(".jpg") ||
    url.toLocaleLowerCase().endsWith(".jpeg")
  ) {
    contextMenu.append(
      new MenuItem({
        label: "Copy Image",
        click: () => {
          this.copyImageToClipboard(url);
        },
      }),
    );
  }
  contextMenu.append(
    new MenuItem({
      label: "Open Source",
      click: () => {
        shell.openExternal(source);
      },
    }),
  );
  if (!!post) {
    contextMenu.append(
      new MenuItem({
        label: "Open Post",
        click: () => {
          shell.openExternal(post);
        },
      }),
    );
  }
  contextMenu.append(
    new MenuItem({
      label: "Open File",
      click: () => {
        shell.openExternal(url);
      },
    }),
  );
  if (this.props.config.caching.enabled && type != ST.local) {
    contextMenu.append(
      new MenuItem({
        label: "Open Cached Images",
        click: () => {
          // for some reason windows uses URLs and everyone else uses paths
          if (process.platform === "win32") {
            shell.openExternal(getCachePath(source, config));
          } else {
            shell.openPath(getCachePath(source, config));
          }
        },
      }),
    );
  }
  if (
    (!isFile && type != ST.video && type != ST.playlist) ||
    type == ST.local
  ) {
    contextMenu.append(
      new MenuItem({
        label: "Blacklist File",
        click: () => {
          window.webContents.send(
            IPC.blacklistFile,
            literalSource,
            isFile ? path : url,
          );
        },
      }),
    );
  }
  if (isFile) {
    contextMenu.append(
      new MenuItem({
        label: "Reveal",
        click: () => {
          // for some reason windows uses URLs and everyone else uses paths
          if (process.platform === "win32") {
            shell.showItemInFolder(url);
          } else {
            shell.showItemInFolder(path);
          }
        },
      }),
    );
    contextMenu.append(
      new MenuItem({
        label: "Delete",
        click: () => {
          window.webContents.send(IPC.deletePath, path);
        },
      }),
    );
  }
  if (!this.props.allTags) {
    contextMenu.append(
      new MenuItem({
        label: "Goto Tag Source",
        click: () => {
          window.webContents.send(IPC.goToTagSource, source);
        },
      }),
    );
  }
  if (type == ST.video) {
    contextMenu.append(
      new MenuItem({
        label: "Goto Clip Source",
        click: () => {
          window.webContents.send(IPC.goToClipSource, source);
        },
      }),
    );
  }
  if (!this.props.recentPictureGrid && !this.props.scene.downloadScene) {
    contextMenu.append(
      new MenuItem({
        label: "Recent Picture Grid",
        click: () => {
          window.webContents.send(IPC.showRecentPictureGrid);
        },
      }),
    );
  }
  contextMenu.popup({
    window,
    callback: () => {
      window.webContents.send(IPC.closePlayerContextMenu);
      contextMenu = null;
    },
  });
}

function onStartPowerSaveBlocker() {
  return powerSaveBlocker.start("prevent-display-sleep");
}

function onStopPowerSaveBlocker(ev: IpcMainEvent, powerSaveID: number) {
  powerSaveBlocker.stop(powerSaveID);
}

async function onClearBrowserCaches(ev: IpcMainEvent) {
  const window = getWindow(ev.sender.id);
  if (window == null) {
    return;
  }

  if (global.gc) {
    global.gc();
  }
  webFrame?.clearCache();
  await window.webContents?.session?.clearCache();
}

function onGetFileSize(ev: IpcMainEvent, path: string) {
  try {
    return fs.statSync(path)?.size ?? -1;
  } catch (e) {
    return -1;
  }
}

function onReadTextFile(ev: IpcMainInvokeEvent, path: string) {
  return fs.readFileSync(path, "utf-8");
}

function onCacheImage(
  ev: IpcMainEvent,
  config: Config,
  url: string,
  source: string,
) {
  const cachePath = getCachePath(null, config);
  fs.mkdirSync(cachePath);

  const maxSize = config.caching.maxSize;
  const sourceCachePath = getCachePath(source, config);
  const filePath = sourceCachePath + getFileName(url, path.sep);
  const downloadImage = () => {
    if (!fs.existsSync(filePath)) {
      wretch(url)
        .get()
        .arrayBuffer((arrayBuffer) => {
          const buffer = Buffer.from(arrayBuffer);
          outputFile(filePath, buffer);
        });
    }
  };
  if (maxSize == 0) {
    downloadImage();
  } else {
    getFolderSize(cachePath, (err: string, size: number) => {
      if (err) {
        return;
      }

      const mbSize = size / 1024 / 1024;
      if (mbSize < maxSize) {
        downloadImage();
      }
    });
  }
}

function onGetCacheSize(ev: IpcMainEvent, config: Config) {
  return new Promise((resolve) => {
    const cachePath = getCachePath(null, config);
    if (fs.existsSync(cachePath)) {
      getFolderSize(cachePath, (err: string, size: number) => {
        if (err) {
          resolve(0);
        } else {
          resolve(size);
        }
      });
    }
  });
}

function onScrapeFiles(
  ev: IpcMainEvent,
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
) {
  const window = getWindow(ev.sender.id);
  if (window == null) {
    return;
  }

  const worker = new Worker(path.join(__dirname, "ScraperManager.js"), {
    workerData: { allURLs, allPosts, config, source, filter, weight, helpers },
  });
  worker.on("message", (message) => {
    window.webContents.send(IPC.scrapeFilesResponse, message);
  });
  worker.on("error", (err) => {
    window.webContents.send(IPC.scrapeFilesResponse, { error: String(err) });
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      window.webContents.send(IPC.scrapeFilesResponse, {
        error: `Worker stopped with exit code ${code}`,
      });
    }
  });
}

function onDeleteLibrarySource(
  ev: IpcMainInvokeEvent,
  sourceURL: string,
  config: Config,
) {
  const fileType = getSourceType(sourceURL);
  try {
    if (fileType == ST.local) {
      rimrafSync(sourceURL);
    } else if (
      fileType == ST.video ||
      fileType == ST.playlist ||
      fileType == ST.list
    ) {
      fs.unlinkSync(sourceURL);
      rimrafSync(
        getCachePath(sourceURL, config) + getFileName(sourceURL, path.sep),
      );
    } else {
      rimrafSync(getCachePath(sourceURL, config));
    }
  } catch (e) {
    console.error(e);
  }
}

function onClearCache(ev: IpcMainInvokeEvent, config: Config) {
  const cachePath = getCachePath(null, config);
  rimrafSync(cachePath);
}

async function onLibraryMove(
  ev: IpcMainInvokeEvent,
  sourceURL: string,
  config: Config,
) {
  let files: string[];
  const cachePath = getCachePath(sourceURL, config);
  try {
    files = await fs.promises.readdir(cachePath);
  } catch (error) {
    console.error(error);
    files = [];
  }

  let localPath = "";
  const moved = files.length > 0;
  if (moved) {
    localPath = getLocalPath(sourceURL, config);
    move(cachePath, localPath, console.error);
  }

  const result: LibraryMoveResult = { moved, count: files.length, localPath };
  return result;
}

function onPortablePathExists() {
  return fs.existsSync(portablePath);
}

// This should only validate data REQUIRED for FlipFlip to work
function onValidateConfig(ev: IpcMainInvokeEvent, config: Config) {
  let errorMessages = "";
  if (
    config.caching.directory != "" &&
    !fs.existsSync(config.caching.directory)
  ) {
    errorMessages = "Invalid Cache Directory";
  }
  return errorMessages;
}

function onDeleteAllLibrarySources(
  ev: IpcMainInvokeEvent,
  sourceURLs: string[],
) {
  for (const sourceURL of sourceURLs) {
    deleteSource(sourceURL);
  }
}

function onDeleteSource(ev: IpcMainInvokeEvent, sourceURL: string) {
  deleteSource(sourceURL);
}

function deleteSource(sourceURL: string) {
  const fileType = getSourceType(sourceURL);
  try {
    if (fileType == ST.local) {
      rimrafSync(sourceURL);
    } else if (
      fileType == ST.video ||
      fileType == ST.playlist ||
      fileType == ST.list
    ) {
      fs.unlinkSync(sourceURL);
    }
  } catch (e) {
    console.error(e);
  }
}

function onFilterNewScriptSources(
  ev: IpcMainInvokeEvent,
  newSources: string[],
) {
  return newSources.filter((s) => fs.existsSync(s));
}

function onGetCachePath(ev: IpcMainInvokeEvent, sourceURL: string) {
  let cachePath = "";
  const fileType = getSourceType(sourceURL);
  if (fileType != ST.local) {
    if (fileType == ST.video || fileType == ST.playlist) {
      cachePath =
        getCachePath(sourceURL, this.props.config) +
        getFileName(sourceURL, path.sep);
    } else {
      cachePath = getCachePath(sourceURL, this.props.config);
    }
  }

  return cachePath;
}

function onDeleteBlacklistedFile(
  ev: IpcMainEvent,
  fileToBlacklist: string,
  sourceURL: string,
  config: Config,
) {
  const cachePath =
    getCachePath(sourceURL, config) + getFileName(fileToBlacklist, path.sep);
  fs.unlink(cachePath, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

function onCleanCache(ev: IpcMainInvokeEvent, cachePath: string) {
  rimrafSync(cachePath);
}

function onRevealFile(ev: IpcMainEvent, sourceURL: string, config: Config) {
  const fileType = getSourceType(sourceURL);
  let cachePath;
  if (fileType == ST.video || fileType == ST.playlist) {
    if (
      fs.existsSync(
        getCachePath(sourceURL, config) + getFileName(sourceURL, path.sep),
      )
    ) {
      cachePath = getCachePath(sourceURL, config);
    } else {
      shell.showItemInFolder(sourceURL);
    }
  } else {
    cachePath = getCachePath(sourceURL, config);
  }
  if (cachePath) {
    const url = process.platform === "win32" ? cachePath : urlToPath(cachePath);
    shell.openExternal(url);
  }
}

function onFinishDelete(ev: IpcMainInvokeEvent, filePath: string) {
  fs.unlinkSync(filePath);
}

function onGetBackupFile(ev: IpcMainInvokeEvent, backupURL: string) {
  return path.join(saveDir, backupURL);
}

function onShouldShowDeleteDialog(ev: IpcMainInvokeEvent, sourceURL: string) {
  const fileType = getSourceType(sourceURL);
  return (
    (fileType == ST.local ||
      fileType == ST.video ||
      fileType == ST.playlist ||
      fileType == ST.list) &&
    fs.existsSync(sourceURL)
  );
}

function onGetGifInfo(ev: IpcMainInvokeEvent, url: string) {
  return new Promise<GifInfo | null>((resolve) => {
    // Get gif info. See https://github.com/Prinzhorn/gif-info
    if (url.includes("file://")) {
      resolve(gifInfo(toArrayBuffer(fs.readFileSync(urlToPath(url)))));
    } else {
      wretch(url)
        .get()
        .arrayBuffer((body) => {
          resolve(gifInfo(body)); // FIXME gifInfo
        })
        .catch((err) => {
          console.error(err);
          resolve(null);
        });
    }
  });
}

function onGetConstants() {
  const value: Constants = { pathSep: path.sep, portablePath };
  return value;
}

function onFileExists(ev: IpcMainInvokeEvent, filePath: string) {
  return fs.existsSync(filePath)
}

// Initialize and release listeners
let initialized = false;
export function initializeIpcEvents() {
  if (initialized) {
    return;
  }

  initialized = true;
  ipcMain.on(IPC.newWindow, onRequestCreateNewWindow);
  ipcMain.handle(IPC.getConstants, onGetConstants);
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
  ipcMain.handle(IPC.saveScriptAs, onSaveScriptAs);
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
  ipcMain.on(IPC.showPlayerContextMenu, onShowPlayerContextMenu);
  ipcMain.handle(IPC.startPowerSaveBlocker, onStartPowerSaveBlocker);
  ipcMain.on(IPC.stopPowerSaveBlocker, onStopPowerSaveBlocker);
  ipcMain.on(IPC.clearBrowserCaches, onClearBrowserCaches);
  ipcMain.handle(IPC.getFileSize, onGetFileSize);
  ipcMain.handle(IPC.readTextFile, onReadTextFile);
  ipcMain.on(IPC.cacheImage, onCacheImage);
  ipcMain.handle(IPC.getCacheSize, onGetCacheSize);
  ipcMain.on(IPC.scrapeFilesRequest, onScrapeFiles);
  ipcMain.handle(IPC.deleteLibrarySource, onDeleteLibrarySource);
  ipcMain.handle(IPC.clearCache, onClearCache);
  ipcMain.handle(IPC.libraryMove, onLibraryMove);
  ipcMain.handle(IPC.portablePathExists, onPortablePathExists);
  ipcMain.handle(IPC.validateConfig, onValidateConfig);
  ipcMain.handle(IPC.deleteAllLibrarySources, onDeleteAllLibrarySources);
  ipcMain.handle(IPC.deleteSource, onDeleteSource);
  ipcMain.handle(IPC.filterNewScriptSources, onFilterNewScriptSources);
  ipcMain.handle(IPC.getCachePath, onGetCachePath);
  ipcMain.on(IPC.deleteBlacklistedFile, onDeleteBlacklistedFile);
  ipcMain.handle(IPC.cleanCache, onCleanCache);
  ipcMain.on(IPC.revealFile, onRevealFile);
  ipcMain.handle(IPC.finishDelete, onFinishDelete);
  ipcMain.handle(IPC.getBackupFile, onGetBackupFile);
  ipcMain.handle(IPC.shouldShowDeleteDialog, onShouldShowDeleteDialog);
  ipcMain.handle(IPC.getGifInfo, onGetGifInfo);
  ipcMain.handle(IPC.fileExists, onFileExists)
}

export function releaseIpcEvents() {
  if (initialized) {
    ipcMain.removeAllListeners(IPC.newWindow);
    ipcMain.removeAllListeners(IPC.getBackups);
    // FIXME removeAllListeners for all initialized events
  }

  initialized = false;
}
