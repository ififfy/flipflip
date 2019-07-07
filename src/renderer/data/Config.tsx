import {BT, HTF, IF, SL, TF, VTF, WF} from "./const";

interface SceneSettingsI {
  [key: string]: string|number|boolean;
  timingFunction: string;
  timingConstant: number;
  timingMin: number;
  timingMax: number;
  timingSinRate: number;
  imageTypeFilter: string;
  weightFunction: string;
  randomize: boolean;
  forceAll: boolean;
  zoom: boolean;
  zoomStart: number;
  zoomEnd: number;
  horizTransType: string;
  horizTransLevel: number;
  vertTransType: string;
  vertTransLevel: number;
  transFull: boolean;
  transDuration: number;
  crossFade: boolean;
  fadeFull: boolean;
  fadeDuration : number;
  backgroundType: string;
  backgroundColor: string;
  backgroundBlur: number;
  playFullGif: boolean;
  playFullVideo: boolean;
  randomVideoStart: boolean;
  continueVideo: boolean;
  videoVolume: number;
  generatorMax: number;
  overlaySceneID: number;
  overlaySceneOpacity: number;
  textKind: string;
  textSource: string;

  strobe: boolean;
  strobeLayer: string;
  strobeOpacity: number;
  strobeTime: number;
  strobeDelay: number;
  strobePulse: boolean;
  strobeColor: string;

  blinkColor: string;
  blinkFontSize: number;
  blinkFontFamily: string;

  captionColor: string;
  captionFontSize: number;
  captionFontFamily: string;

  captionBigColor: string;
  captionBigFontSize: number;
  captionBigFontFamily: string;

  countColor: string;
  countFontSize: number;
  countFontFamily: string;
}

interface RemoteSettingsI {
  [key: string]: string | Array<string>;
  tumblrKeys: Array<string>;
  tumblrSecrets: Array<string>;

  tumblrKey: string;
  tumblrSecret: string;
  tumblrOAuthToken: string;
  tumblrOAuthTokenSecret: string;

  redditUserAgent: string;
  redditClientID: string;
  redditDeviceID: string;
  redditRefreshToken: string;

  twitterConsumerKey: string;
  twitterConsumerSecret: string;
  twitterAccessTokenKey: string;
  twitterAccessTokenSecret: string;

  instagramUsername: string;
  instagramPassword: string;
}

interface CacheSettingsI {
  [key: string]: string | number | boolean;
  enabled: boolean;
  directory: string;
  maxSize: number;
}

interface DisplaySettingsI {
  [key: string]: number | boolean;
  alwaysOnTop: boolean;
  showMenu: boolean;
  fullScreen: boolean;
  startImmediately: boolean;

  minImageSize: number;
  minVideoSize: number;
  maxInMemory: number;
  maxLoadingAtOnce: number;
  maxInHistory: number;
}

export class SceneSettings implements SceneSettingsI {
  [key: string]: string | number | boolean;

  timingFunction = TF.constant;
  timingConstant = 1000;
  timingMin = 200;
  timingMax = 1200;
  timingSinRate = 100;
  imageTypeFilter = IF.any;
  weightFunction = WF.sources;
  randomize = true;
  forceAll = false;
  zoom = false;
  zoomStart = 1;
  zoomEnd = 2;
  horizTransType = HTF.none;
  horizTransLevel = 10;
  vertTransType = VTF.none;
  vertTransLevel = 10;
  transFull = false;
  transDuration = 5000;
  crossFade = false;
  fadeFull = false;
  fadeDuration = 500;
  backgroundType = BT.blur;
  backgroundColor = "#000000";
  backgroundBlur = 8;
  playFullGif = false;
  playFullVideo = false;
  randomVideoStart = false;
  continueVideo = false;
  videoVolume = 0;
  generatorMax = 100;
  overlaySceneID = 0;
  overlaySceneOpacity = 0.5;
  nextSceneID = 0;
  nextSceneTime = 900;
  textKind = "";
  textSource = "";

  strobe = false;
  strobeLayer = SL.top;
  strobeOpacity = 1;
  strobeTime = 200;
  strobeDelay = 200;
  strobePulse = false;
  strobeColor = "#FFFFFF";

  blinkColor = "#FFFFFF";
  blinkFontSize = 20;
  blinkFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";

  captionColor = "#FFFFFF";
  captionFontSize = 8;
  captionFontFamily = "Helvetica Neue,Helvetica,Arial,sans-serif";

  captionBigColor = "#FFFFFF";
  captionBigFontSize = 12;
  captionBigFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";

  countColor = "#FFFFFF";
  countFontSize = 20;
  countFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
}

export class RemoteSettings implements RemoteSettingsI {
  [key: string]: string | Array<string>;

  tumblrKeys = ["BaQquvlxQeRhKRyViknF98vseIdcBEyDrzJBpHxvAiMPHCKR2l",
    "G4iZd6FBiyDxHVUpNqtOTDu4woWzfp8WuH3tTrT3MC16GTmNzq",
    "y5uUQJYTCp15Nj3P80cLmNFqwSr1mxIhm3C4PCsGAfReydkF9m",
    "IZiOt6PYazf4g0sYWVfpfebMITRFWmtlKq2UKe6l0RsqKHPgui",
    "ATtwOUlruyVl8bEiHTnYcRpByEAzov2LtLEWOfDLqhPRZFmT4X"];
  tumblrSecrets = ["XWVCo7t0GMGkOAd9wsxMMkKPhQbl3RqauGzQtnzAnmHCJ7WdSn",
    "RmoWUh844NqVdw7btWI6EYldJ91KhwJyfCKPtAIcuVokFtRYgS",
    "xiEV5sJISJAwegJHTTLWtxnmFUkowxgMk2gOq4mc20VNLM2TpJ",
    "Iw3yKgjfMvrKPNCcqdUyRuxCkYWYyRlrMdFUojRHVkSSADOKCT",
    "cMM7xqJV1roUudEdBiZeOqv3n1H0pzNnGY1iAbp3oo3c29MXGq"];

  tumblrKey = "";
  tumblrSecret = "";
  tumblrOAuthToken = "";
  tumblrOAuthTokenSecret = "";

  redditUserAgent = "desktop:flipflip:v2.0.0 (by /u/ififfy)";
  redditClientID = "2Iqe-1CsO4VQlA";
  redditDeviceID = "";
  redditRefreshToken = "";

  twitterConsumerKey = "qSRfdIWfpkesYDVJHrRh05wji";
  twitterConsumerSecret = "ad11IC4CLwVzYyGyYwHKVMP9WwAcKxymw4D9162S5Ex75l5eWw";
  twitterAccessTokenKey = "";
  twitterAccessTokenSecret = "";

  instagramUsername = "";
  instagramPassword = "";
}

export class CacheSettings implements CacheSettingsI {
  [key: string]: string | number | boolean;

  enabled = true;
  directory = "";
  maxSize = 500; // Size in MB
}

export class DisplaySettings  implements DisplaySettingsI {
  [key: string]: number | boolean;

  alwaysOnTop = false;
  showMenu = true;
  fullScreen = false;
  startImmediately = false;

  minVideoSize = 200;
  minImageSize = 200;
  maxInMemory = 120;
  maxLoadingAtOnce = 5;
  maxInHistory = 500;
}

export default class Config {
  defaultScene = new SceneSettings();
  remoteSettings = new RemoteSettings();
  caching = new CacheSettings();
  displaySettings = new DisplaySettings();
  clientID = "";

  constructor(init?: Partial<Config>) {
    Object.assign(this, init);

    // Add any missing keys (keeps config up-to-date)
    for (let key of Object.keys(new SceneSettings())) {
      if (this.defaultScene[key] == null) {
        this.defaultScene[key] = new SceneSettings()[key];
      }
    }
    for (let key of Object.keys(new RemoteSettings())) {
      if (this.remoteSettings[key] == null) {
        this.remoteSettings[key] = new RemoteSettings()[key];
      }
    }
    for (let key of Object.keys(new CacheSettings())) {
      if (this.caching[key] == null) {
        this.caching[key] = new CacheSettings()[key];
      }
    }
    for (let key of Object.keys(new DisplaySettings())) {
      if (this.displaySettings[key] == null) {
        this.displaySettings[key] = new DisplaySettings()[key];
      }
    }
  }
}