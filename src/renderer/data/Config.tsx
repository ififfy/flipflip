import {BT, GO, HTF, IF, IT, OF, SC, SL, SOF, TF, VO, VTF, WF} from "./const";
import Overlay from "./Overlay";
import LibrarySource from "./LibrarySource";
import Audio from "./Audio";

interface SceneSettingsI {
  [key: string]: string | number | boolean | Array<LibrarySource> | Array<Overlay> | Array<Audio> | Array<Array<number>> | Array<string> | Array<number>;

  sources: Array<LibrarySource>;
  timingFunction: string;
  timingConstant: number;
  timingMin: number;
  timingMax: number;
  timingSinRate: number;
  timingBPMMulti: number;
  imageTypeFilter: string;
  weightFunction: string;
  sourceOrderFunction: string;
  orderFunction: string;
  forceAll: boolean;
  forceAllSource: boolean;
  fullSource: boolean;

  zoom: boolean;
  zoomStart: number;
  zoomStartMax: number;
  zoomStartMin: number;
  zoomEnd: number;
  zoomEndMax: number;
  zoomEndMin: number;
  zoomRandom: boolean;
  horizTransType: string;
  horizTransLevel: number;
  horizTransLevelMax: number;
  horizTransLevelMin: number;
  horizTransRandom: boolean;
  vertTransType: string;
  vertTransLevel: number;
  vertTransLevelMax: number;
  vertTransLevelMin: number;
  vertTransRandom: boolean;
  transTF: string;
  transDuration: number;
  transDurationMin: number;
  transDurationMax: number;
  transSinRate: number;
  transBPMMulti: number;
  crossFade: boolean;
  crossFadeAudio: boolean;
  fadeTF: string;
  fadeDuration: number;
  fadeDurationMin: number;
  fadeDurationMax: number;
  fadeSinRate: number;
  fadeBPMMulti: number;

  imageType: string;
  backgroundType: string;
  backgroundColor: string;
  backgroundColorSet: Array<string>;
  backgroundBlur: number;
  gifOption: string;
  gifTimingConstant: number;
  gifTimingMin: number;
  gifTimingMax: number;
  videoOption: string;
  videoTimingConstant: number;
  videoTimingMin: number;
  videoTimingMax: number;
  randomVideoStart: boolean;
  continueVideo: boolean;
  rotatePortrait: boolean;
  playVideoClips: boolean;
  skipVideoStart: number;
  skipVideoEnd: number;
  videoVolume: number;
  videoSpeed: number;
  videoRandomSpeed: boolean;
  videoSpeedMin: number;
  videoSpeedMax: number;
  generatorMax: number;
  overlayEnabled: boolean;
  overlays: Array<Overlay>;
  textEnabled: boolean;
  textSource: string;
  textEndStop: boolean;
  textNextScene: boolean;

  strobe: boolean;
  strobePulse: boolean;
  strobeLayer: string;
  strobeOpacity: number;
  strobeTF: string;
  strobeTime: number;
  strobeTimeMin: number;
  strobeTimeMax: number;
  strobeSinRate: number;
  strobeBPMMulti: number;
  strobeDelayTF: string;
  strobeDelay: number;
  strobeDelayMin: number;
  strobeDelayMax: number;
  strobeDelaySinRate: number;
  strobeDelayBPMMulti: number;
  strobeColorType: string;
  strobeColor: string;
  strobeColorSet: Array<string>;

  blinkColor: string;
  blinkFontSize: number;
  blinkFontFamily: string;
  blinkBorder: boolean;
  blinkBorderpx: number;
  blinkBorderColor: string;
  captionColor: string;
  captionFontSize: number;
  captionFontFamily: string;
  captionBorder: boolean;
  captionBorderpx: number;
  captionBorderColor: string;
  captionBigColor: string;
  captionBigFontSize: number;
  captionBigFontFamily: string;
  captionBigBorder: boolean;
  captionBigBorderpx: number;
  captionBigBorderColor: string;
  countColor: string;
  countFontSize: number;
  countFontFamily: string;
  countBorder: boolean;
  countBorderpx: number;
  countBorderColor: string;

  audioEnabled: boolean;
  audios: Array<Audio>;

  // migration only
  overlaySceneID: number;
  overlaySceneOpacity: number;
  gridView: boolean;
  grid: Array<Array<number>>;
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
}

interface GeneralSettingsI {
  [key: string]: number | boolean;

  portableMode: boolean;
  autoBackup: boolean;
  autoBackupDays: number;
}

interface TutorialsI {
  [key: string]: string;

  scenePicker: string;
  sceneDetail: string;
  sceneGenerator: string;
  sceneGrid: string;
  library: string;
}

export class SceneSettings implements SceneSettingsI {
  [key: string]: string | number | boolean | Array<LibrarySource> | Array<Overlay> | Array<Audio> | Array<Array<number>> | Array<string> | Array<number>;

  sources: Array<LibrarySource> = [];
  timingFunction = TF.constant;
  timingConstant = 1000;
  timingMin = 200;
  timingMax = 1200;
  timingSinRate = 100;
  timingBPMMulti = 1;
  imageTypeFilter = IF.any;
  weightFunction = WF.sources;
  sourceOrderFunction = SOF.random;
  orderFunction = OF.random;
  forceAll = false;
  forceAllSource = false;
  fullSource = false;

  zoom = false;
  zoomStart = 1;
  zoomStartMax = 1;
  zoomStartMin = 0.5;
  zoomEnd = 2;
  zoomEndMax = 2;
  zoomEndMin = 1.5;
  zoomRandom = false;
  horizTransType = HTF.none;
  horizTransLevel = 10;
  horizTransLevelMax = 10;
  horizTransLevelMin = 5;
  horizTransRandom = false;
  vertTransType = VTF.none;
  vertTransLevel = 10;
  vertTransLevelMax = 10;
  vertTransLevelMin = 5;
  vertTransRandom = false;
  transTF = TF.constant;
  transDuration = 5000;
  transDurationMin = 1000;
  transDurationMax = 7000;
  transSinRate = 100;
  transBPMMulti = 1;
  crossFade = false;
  crossFadeAudio = false;
  fadeTF = TF.constant;
  fadeDuration = 500;
  fadeDurationMin = 100;
  fadeDurationMax = 700;
  fadeSinRate = 100;
  fadeBPMMulti = 1;

  imageType = IT.fitBestNoClip;
  backgroundType = BT.blur;
  backgroundColor = "#000000";
  backgroundColorSet: Array<string> = [];
  backgroundBlur = 8;
  gifOption = GO.none;
  gifTimingConstant = 3000;
  gifTimingMin = 1000;
  gifTimingMax = 3000;
  videoOption = VO.none;
  videoTimingConstant = 3000;
  videoTimingMin = 1000;
  videoTimingMax = 3000;
  randomVideoStart = false;
  continueVideo = false;
  rotatePortrait = false;
  playVideoClips = true;
  skipVideoStart = 0;
  skipVideoEnd = 0;
  videoVolume = 0;
  videoSpeed = 10;
  videoRandomSpeed = false;
  videoSpeedMin = 5;
  videoSpeedMax = 20;
  generatorMax = 100;
  overlayEnabled: false;
  overlays: Array<Overlay> = [];
  nextSceneID = 0;
  nextSceneTime = 900;
  nextSceneAllImages = false;
  nextSceneRandoms: Array<number> = [];
  textEnabled = false;
  textSource = "";
  textEndStop = false;
  textNextScene = false;

  strobe = false;
  strobePulse = false;
  strobeLayer = SL.top;
  strobeOpacity = 1;
  strobeTF = TF.constant;
  strobeTime = 200;
  strobeTimeMin = 100;
  strobeTimeMax = 300;
  strobeSinRate = 100;
  strobeBPMMulti = 1;
  strobeDelayTF = TF.constant;
  strobeDelay = 200;
  strobeDelayMin = 100;
  strobeDelayMax = 300;
  strobeDelaySinRate = 100;
  strobeDelayBPMMulti = 1;
  strobeColorType = SC.color;
  strobeColor = "#FFFFFF";
  strobeColorSet: Array<string> = [];

  blinkColor = "#FFFFFF";
  blinkFontSize = 20;
  blinkFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
  blinkBorder = false;
  blinkBorderpx = 5;
  blinkBorderColor = "#000000";
  captionColor = "#FFFFFF";
  captionFontSize = 8;
  captionFontFamily = "Helvetica Neue,Helvetica,Arial,sans-serif";
  captionBorder = false;
  captionBorderpx = 3;
  captionBorderColor = "#000000";
  captionBigColor = "#FFFFFF";
  captionBigFontSize = 12;
  captionBigFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
  captionBigBorder = false;
  captionBigBorderpx = 4;
  captionBigBorderColor = "#000000";
  countColor = "#FFFFFF";
  countFontSize = 20;
  countFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
  countBorder = false;
  countBorderpx = 5;
  countBorderColor = "#000000";

  audioEnabled = false;
  audios: Array<Audio> = [];

  // migration only
  overlaySceneID = 0;
  overlaySceneOpacity = 0.5;
  gridView = false;
  grid: Array<Array<number>> = [[]];
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
}

export class GeneralSettings  implements GeneralSettingsI {
  [key: string]: number | boolean;

  portableMode = false;
  autoBackup = false;
  autoBackupDays = 1;
}

export class Tutorials implements TutorialsI {
  [key: string]: string;

  scenePicker = null as string;
  sceneDetail = null as string;
  player = null as string;
  library = null as string;
  sceneGenerator = null as string;
  sceneGrid = null as string;
  videoClipper = null as string;
}

export default class Config {
  defaultScene = new SceneSettings();
  remoteSettings = new RemoteSettings();
  caching = new CacheSettings();
  displaySettings = new DisplaySettings();
  generalSettings = new GeneralSettings();
  tutorials = new Tutorials();
  clientID = "";
  newWindowAlerted = false;

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
    for (let key of Object.keys(new GeneralSettings())) {
      if (this.generalSettings[key] == null) {
        this.generalSettings[key] = new GeneralSettings()[key];
      }
    }
    for (let key of Object.keys(new Tutorials())) {
      if (this.tutorials[key] == null) {
        this.tutorials[key] = new Tutorials()[key];
      }
    }

    if (this.defaultScene && this.defaultScene.overlaySceneID != 0) this.defaultScene.overlaySceneID = 0;
    if (this.displaySettings && (this.displaySettings as any).portableMode == true) {
      (this.displaySettings as any).portableMode = undefined;
      this.generalSettings.portableMode = true;
    }
  }
}