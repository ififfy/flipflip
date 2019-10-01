// Put all your custom type information for 3rd party modules here
declare module '*.svg' {
  const value: any;
  export = value;
}

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.ico' {
  const value: any;
  export = value;
}

declare module '*.icns' {
  const value: any;
  export = value;
}

declare module 'fs-extra';
declare module 'file-url';
declare module 'recursive-readdir';
declare module 'gif-info';
declare module 'request';
declare module 'progressbar.js';
declare module 'sortablejs';
declare module 'react-sortablejs';
declare module 'react-select';
declare module 'react-select/creatable';
declare module 'react-spring';
declare module 'snoowrap';
declare module 'rimraf';
declare module 'get-folder-size';
declare module 'uuid/v4';
declare module 'system-font-families';
declare module 'oauth';
declare module 'imgur';
declare module 'twitter';
declare module 'jsmediatags';
declare module 'electron-google-analytics';
declare module 'electron-default-menu';

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