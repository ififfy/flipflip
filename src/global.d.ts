import { IAudioMetadata } from "music-metadata";
import AppStorageState from "./common/AppStorageState";
import Audio from "./common/Audio";
import Backup from "./common/Backup";
import RedditSubscriptionResponse from "./common/RedditSubscriptionResponse";
import TumblrFollowingResponse from "./common/TumblrFollowingResponse";
import { Config } from "./common/Config";
import LibrarySource from "./common/LibrarySource";
import LibraryMoveResult from "./common/LibraryMoveResult";
import { Constants } from "./common/constants";
import GetAudioBufferResponse from "./common/GetAudioBufferResponse";
import ScenePickerInitResponse from "./common/ScenePickerInitResponse";
import HydrusAuthResponse from "./common/HydrusAuthResponse";

declare global {
  interface Window {
    constants: Constants;
    ipc: {
      platform: () => string;
      getConstants(): Promise<Constants>;
      newWindow: () => void;
      initScenePicker: (version: string) => Promise<ScenePickerInitResponse>;
      setProgressBar: (progress: number) => void;
      getBackups: () => Promise<Array<Backup>>;
      getAppStorage: () => Promise<AppStorageState>;
      saveAppStorage: (state: AppStorageState) => void;
      createBackup: (state: AppStorageState) => void;
      cleanBackups: (config: Config) => void;
      restoreBackup: (backupFile: string) => Promise<AppStorageState>;
      onStartScene: (callback: (sceneName: string) => void) => () => void;
      openExternal: (url: string) => void;
      showItemInFolder: (path: string) => void;
      reset: () => void;
      saveExport: (filePath: string, json: string) => void;
      openImport: () => Promise<string | undefined>;
      openDirectory: (multiSelections?: boolean) => Promise<string[]>;
      openVideoDirs: () => Promise<string[]>;
      openVideos: () => Promise<string[]>;
      openAudios: (shiftKey: boolean) => Promise<string[]>;
      openScripts: (shiftKey: boolean) => Promise<string[]>;
      openSubtitle: () => Promise<string | undefined>;
      openScript: () => Promise<string | undefined>;
      saveScript: (url: string, script: string) => Promise<void>;
      saveScriptAs: (
        script: string,
        defaultPath: string,
      ) => Promise<string | undefined>;
      getFonts: () => Promise<string[]>;
      tumblrAuthRequest: (tumblrKey: string, tumblrSecret: string) => void;
      onTumblrAuthResponse: (
        callback: (response: AuthResponse) => void,
      ) => void;
      tumblrFollowing: (
        key: string,
        secret: string,
        token: string,
        tokenSecret: string,
        limit: number,
        offset: number,
      ) => Promise<TumblrFollowingResponse>;
      redditAuthRequest: (
        userAgent: string,
        clientID: string,
        deviceID: string,
      ) => void;
      onRedditAuthResponse: (
        callback: (response: AuthResponse) => void,
      ) => void;
      redditSubscriptions: (
        userAgent: string,
        clientId: string,
        refreshToken: string,
        after: string,
      ) => Promise<RedditSubscriptionResponse>;
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
      ) => void;
      destroyPlayerMenu: () => void;
      setAllwaysOnTop: (alwaysOnTop: boolean) => void;
      setMenuBarVisibility: (showMenu: boolean) => void;
      setFullScreen: (fullScreen: boolean) => void;
      playerMenuSetPlayPause: (play: boolean) => void;
      onPlayerMenuPlayPause: (callback: () => void) => () => void;
      onPlayerMenuHistoryBack: (callback: () => void) => () => void;
      onPlayerMenuHistoryForward: (callback: () => void) => () => void;
      onPlayerMenuNavigateBack: (callback: () => void) => () => void;
      onPlayerMenuToggleFullscreen: (callback: () => void) => () => void;
      onPlayerMenuToggleAlwaysOnTop: (callback: () => void) => () => void;
      onPlayerMenuToggleMenuBarDisplay: (callback: () => void) => () => void;
      onPlayerMenuOnDelete: (callback: () => void) => () => void;
      onPlayerMenuPrevSource: (callback: () => void) => () => void;
      onPlayerMenuNextSource: (callback: () => void) => () => void;
      copyImageToClipboard: (sourceURL: string) => void;
      showPlayerContextMenu: (
        config: Config,
        showGotoTagSource: boolean,
        showRecentPictureGrid: boolean,
        url: string,
        source: string,
        post?: string,
      ) => void;
      onClosePlayerContextMenu: (callback: () => void) => void;
      onBlacklistFile: (
        callback: (literalSource: string, path: string) => void,
      ) => () => void;
      onDeletePath: (callback: (path: string) => void) => () => void;
      onGoToTagSource: (callback: (source: string) => void) => () => void;
      onGoToClipSource: (callback: (source: string) => void) => () => void;
      onShowRecentPictureGrid: (callback: () => void) => () => void;
      startPowerSaveBlocker: () => Promise<number>;
      stopPowerSaveBlocker: (powerSaveID: number) => void;
      clearBrowserCaches: () => void;
      getFileSize: (path: string) => Promise<number>;
      readTextFile: (path: string) => Promise<string>;
      cacheImage: (config: Config, url: string, source: string) => void;
      getCacheSize: (config: Config) => Promise<number>;
      onScrapeFilesResponse: (callback: (message: any) => void) => () => void;
      scrapeFiles: (
        allURLs: Map<string, string[]>,
        allPosts: Map<string, string>,
        config: Config,
        source: LibrarySource,
        imageTypeFilter: string,
        weightFunction: string,
        helpers: { next: any; count: number; retries: number; uuid: string },
      ) => void;
      deleteLibrarySource: (sourceURL: string, config: Config) => Promise<void>;
      clearCache: (config: Config) => Promise<void>;
      moveLibrarySource: (
        sourceURL: string,
        config: Config,
      ) => Promise<LibraryMoveResult>;
      portablePathExists: () => Promise<boolean>;
      validateConfig: (config: Config) => Promise<string>;
      deleteAllLibrarySources: (sourceURLs: string[]) => Promise<void>;
      deleteSource: (sourceURL: string) => Promise<void>;
      filterNewScriptSources: (newSources: string[]) => Promise<string[]>;
      getCachePath: (config: Config) => Promise<string>;
      getSourceCachePath: (
        sourceURL: string,
        config: Config,
      ) => Promise<string>;
      deleteBlacklistedFile: (
        fileToBlacklist: string,
        sourceURL: string,
        config: Config,
      ) => void;
      cleanCache: (cachePath: string) => Promise<void>;
      revealFile: (sourceURL: string, config: Config) => void;
      finishDelete: (filePath: string) => Promise<string | undefined>;
      getBackupFile: (backupURL: string) => Promise<string>;
      shouldShowDeleteDialog: (sourceURL: string) => Promise<boolean>;
      getGifInfo: (url: string) => Promise<GifInfo | null>;
      fileExists: (filePath: string) => Promise<boolean>;
      getCachedFileURL: (
        source: string,
        url: string,
        config: Config,
      ) => Promise<string>;
      getScraperSources: (sources: LibrarySource[]) => Promise<LibrarySource[]>;
      getAudioThumbnail: (config: Config) => Promise<string | undefined>;
      addAudioSource: (
        url: string,
        id: number,
        config: Config,
      ) => Promise<Audio | undefined>;
      addAudioURL: (
        url: string,
        id: number,
        config: Config,
      ) => Promise<Audio | undefined>;
      getAudioMetadata: (
        audio: Audio,
        config: Config,
      ) => Promise<Audio | undefined>;
      getAudioBPMMetadata: (url: string) => Promise<number>;
      getAudioBuffer: (url: string) => Promise<GetAudioBufferResponse>;
      authHydrus: (
        schema: string,
        host: string,
        port: string,
        apiKey: string,
      ) => Promise<HydrusAuthResponse>;
      authPiwigo: (
        schema: string,
        host: string,
        username: string,
        password: string,
      ) => Promise<string | undefined>;
    };
  }
}
