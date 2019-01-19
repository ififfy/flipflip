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

declare module 'file-url';
declare module 'recursive-readdir';
declare module 'gif-info';
declare module 'request';
declare module 'progressbar.js';

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