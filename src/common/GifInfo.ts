interface GifImage {
  identifier: string;
  localPalette: boolean;
  localPaletteSize: number;
  interlace: boolean;
  comments: string[];
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
  delay: number;
  disposal: number;
}

export default interface GifInfo {
  valid: boolean;
  globalPalette: boolean;
  globalPaletteSize: number;
  loopCount: number;
  height: number;
  width: number;
  animated: boolean;
  images: GifImage[];
  isBrowserDuration: boolean;
  duration: number;
  durationIE: number;
  durationSafari: number;
  durationFirefox: number;
  durationChrome: number;
  durationOpera: number;
}
