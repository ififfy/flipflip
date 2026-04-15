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
declare module "web-audio-beat-detector";
declare module "react-sound" {
  import * as React from "react";
  export interface ReactSoundProps {
    url: string;
    playStatus: "PLAYING" | "STOPPED" | "PAUSED";
    playFromPosition?: number | undefined;
    position?: number | undefined;
    volume?: number | undefined;
    playbackRate?: number | undefined;
    autoLoad?: boolean | undefined;
    loop?: boolean | undefined;
    onError?: (() => void) | undefined;
    onLoading?: (() => void) | undefined;
    onLoad?: (() => void) | undefined;
    onPlaying?: (() => void) | undefined;
    onPause?: (() => void) | undefined;
    onResume?: (() => void) | undefined;
    onStop?: (() => void) | undefined;
    onFinishedPlaying?: (() => void) | undefined;
    onBufferChange?: (() => void) | undefined;
  }

  export default class Sound extends React.Component<ReactSoundProps> {
    // This line fixes the JSX error
    readonly props: ReactSoundProps;
  }
}

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
