import { IAudioMetadata } from "music-metadata";
import AppStorageState from "./common/AppStorageState";
import Backup from "./common/Backup";
import RedditSubscriptionResponse from "./common/RedditSubscriptionResponse";
import TumblrFollowingResponse from "./common/TumblrFollowingResponse";

// Put all your custom type information for 3rd party modules here
declare module "*.svg" {
  const value: any;
  export = value;
}

declare module "*.png" {
  const value: any;
  export = value;
}

declare module "*.ico" {
  const value: any;
  export = value;
}

declare module "*.icns" {
  const value: any;
  export = value;
}

declare module "@mui/material/Slider/ValueLabel";
declare module "d3-ease";
declare module "electron-default-menu";
declare module "get-folder-size";
declare module "gif-info";
declare module "fs-extra";
declare module "file-url";
declare module "font-list";
declare module "imgur";
declare module "music-metadata";
declare module "oauth";
declare module "react-color";
declare module "react-select";
declare module "react-select/creatable";
declare module "react-sortable-hoc";
declare module "react-sortablejs";
declare module "react-spring";
declare module "react-virtualized-auto-sizer";
declare module "react-window";
declare module "recursive-readdir";
declare module "system-font-families" {
  export default class SystemFonts {
    constructor();
    getFonts(): Promise<string[]>;
  }
}
declare module "uuid/v4";
declare module "web-audio-beat-detector";
declare module "xmldom";

// Type declarations for Clipboard API
// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
interface Clipboard {
  writeText(newClipText: string): Promise<void>;
  // Add any other methods you need here.
}

interface NavigatorClipboard {
  // Only available in a secure context.
  readonly clipboard?: Clipboard;
}

interface Navigator extends NavigatorClipboard {}

declare global {
  interface Window {
    files: {
      existsSync: (path: string) => boolean;
      readFileSync: (path: string) => Buffer;
      parseAudioFile: (path: string) => Promise<IAudioMetadata>;
    };
    ipc: {
      platform: () => string;
      newWindow: () => void;
      isFirstWindow: () => Promise<boolean>;
      setProgressBar: (progress: number) => void;
      getBackups: () => Promise<Array<Backup>>;
      getAppStorage: () => Promise<AppStorageState>;
      saveAppStorage: (state: AppStorageState) => void;
      createBackup: (state: AppStorageState) => void;
      cleanBackups: (config: Config) => void;
      restoreBackup: (backupFile: string) => Promise<AppStorageState>;
      onStartScene: (callback: (sceneName: string) => void) => void;
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
      saveScriptAs: (script: string) => Promise<string | undefined>;
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
      ) => void;
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
      ) => void;
      copyImageToClipboard: (sourceURL: string) => void;
      showPlayerContextMenu: (
        config: Config,
        url: string,
        source: string,
        post?: string,
      ) => void;
      onClosePlayerContextMenu: (callback: () => void) => void;
      onBlacklistFile: (
        callback: (
          event: IpcRendererEvent,
          literalSource: string,
          path: string,
        ) => void,
      ) => void;
      onDeletePath: (
        callback: (event: IpcRendererEvent, path: string) => void,
      ) => void;
      onGoToTagSource: (
        callback: (event: IpcRendererEvent, source: string) => void,
      ) => void;
      onGoToClipSource: (
        callback: (event: IpcRendererEvent, source: string) => void,
      ) => void;
      onShowRecentPictureGrid: (callback: () => void) => void;
      offBlacklistFile: (
        callback: (
          event: IpcRendererEvent,
          literalSource: string,
          path: string,
        ) => void,
      ) => void;
      offDeletePath: (
        callback: (event: IpcRendererEvent, path: string) => void,
      ) => void;
      offGoToTagSource: (
        callback: (event: IpcRendererEvent, source: string) => void,
      ) => void;
      offGoToClipSource: (
        callback: (event: IpcRendererEvent, source: string) => void,
      ) => void;
      offShowRecentPictureGrid: (callback: () => void) => void;
      startPowerSaveBlocker: () => Promise<number>;
      stopPowerSaveBlocker: (powerSaveID: number) => void;
      clearBrowserCaches: () => void;
      getFileSize: (path: string) => Promise<number>;
      readTextFile: (path: string) => Promise<string>;
    };
  }
}

export {};
