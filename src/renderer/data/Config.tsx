import {BT, EA, GO, HTF, IF, IT, OF, OT, SC, SL, SOF, TF, VO, VTF, WC, WF} from "./const";
import Overlay from "./Overlay";
import LibrarySource from "./LibrarySource";
import Audio from "./Audio";

interface SceneSettingsI {
  [key: string]: string | number | boolean | Array<any>;

  sources: Array<LibrarySource>;
  timingFunction: string;
  timingConstant: number;
  timingMin: number;
  timingMax: number;
  timingSinRate: number;
  timingBPMMulti: number;
  backForth: boolean;
  backForthTF: string;
  backForthConstant: number;
  backForthMin: number;
  backForthMax: number;
  backForthSinRate: number;
  backForthBPMMulti: number;
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
  transEase: string;
  transExp: number;
  transAmp: number;
  transPer: number;
  transOv: number;
  crossFade: boolean;
  crossFadeAudio: boolean;
  fadeTF: string;
  fadeDuration: number;
  fadeDurationMin: number;
  fadeDurationMax: number;
  fadeSinRate: number;
  fadeBPMMulti: number;
  fadeEase: string;
  fadeExp: number;
  fadeAmp: number;
  fadePer: number;
  fadeOv: number;
  fadeInOut: boolean;
  fadeIOPulse: boolean;
  fadeIOTF: string;
  fadeIODuration: number;
  fadeIODurationMin: number;
  fadeIODurationMax: number;
  fadeIOSinRate: number;
  fadeIOBPMMulti: number;
  fadeIODelayTF: string;
  fadeIODelay: number;
  fadeIODelayMin: number;
  fadeIODelayMax: number;
  fadeIODelaySinRate: number;
  fadeIODelayBPMMulti: number;
  fadeIOStartEase: string;
  fadeIOStartExp: number;
  fadeIOStartAmp: number;
  fadeIOStartPer: number;
  fadeIOStartOv: number;
  fadeIOEndEase: string;
  fadeIOEndExp: number;
  fadeIOEndAmp: number;
  fadeIOEndPer: number;
  fadeIOEndOv: number;
  panning: boolean;
  panTF: string;
  panDuration: number;
  panDurationMin: number;
  panDurationMax: number;
  panSinRate: number;
  panBPMMulti: number;
  panHorizTransType: string;
  panHorizTransImg: boolean;
  panHorizTransLevel: number;
  panHorizTransLevelMax: number;
  panHorizTransLevelMin: number;
  panHorizTransRandom: boolean;
  panVertTransType: string;
  panVertTransImg: boolean;
  panVertTransLevel: number;
  panVertTransLevelMax: number;
  panVertTransLevelMin: number;
  panVertTransRandom: boolean;
  panStartEase: string;
  panStartExp: number;
  panStartAmp: number;
  panStartPer: number;
  panStartOv: number;
  panEndEase: string;
  panEndExp: number;
  panEndAmp: number;
  panEndPer: number;
  panEndOv: number;

  imageType: string;
  imageOrientation: string;
  videoOrientation: string;
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
  strobeEase: string;
  strobeExp: number;
  strobeAmp: number;
  strobePer: number;
  strobeOv: number;

  // migration only
  overlaySceneID: number;
  overlaySceneOpacity: number;
  gridView: boolean;
  grid: Array<Array<number>>;
  rotatePortrait: boolean;
}

interface RemoteSettingsI {
  [key: string]: string | Array<string> | boolean;
  tumblrKeys: Array<string>;
  tumblrSecrets: Array<string>;

  tumblrKey: string;
  tumblrSecret: string;
  tumblrOAuthToken: string;
  tumblrOAuthTokenSecret: string;
  silenceTumblrAlert: boolean;

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

  hydrusProtocol: string;
  hydrusDomain: string;
  hydrusPort: string;
  hydrusAPIKey: string;
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
  easingControls: boolean;
  audioAlert: boolean;

  minImageSize: number;
  minVideoSize: number;
  maxInMemory: number;
  maxLoadingAtOnce: number;
}

interface GeneralSettingsI {
  [key: string]: number | boolean | string;

  portableMode: boolean;
  disableLocalSave: boolean;
  confirmSceneDeletion: boolean;
  autoBackup: boolean;
  autoBackupDays: number;
  autoCleanBackup: boolean;
  autoCleanBackupDays: number;
  autoCleanBackupWeeks: number;
  autoCleanBackupMonths: number;
  cleanRetain: number;
  watermark: boolean;
  watermarkCorner: string;
  watermarkText: string;
  watermarkFontFamily: string;
  watermarkFontSize: number;
  watermarkColor: string;
}

interface TutorialsI {
  [key: string]: string;

  scenePicker: string;
  sceneDetail: string;
  sceneGenerator: string;
  sceneGrid: string;
  library: string;
  audios: string;
  scripts: string;
  player: string;
  scriptor: string;
  videoClipper: string;
}

export class SceneSettings implements SceneSettingsI {
  [key: string]: string | number | boolean | Array<any>;

  sources: Array<LibrarySource> = [];
  timingFunction = TF.constant;
  timingConstant = 1000;
  timingMin = 200;
  timingMax = 1200;
  timingSinRate = 100;
  timingBPMMulti = 10;
  backForth = false;
  backForthTF = TF.constant;
  backForthConstant = 1000;
  backForthMin = 200;
  backForthMax = 1200;
  backForthSinRate = 100;
  backForthBPMMulti = 10;
  imageTypeFilter = IF.any;
  imageOrientation = OT.original;
  videoOrientation = OT.original;
  weightFunction = WF.sources;
  sourceOrderFunction = SOF.random;
  orderFunction = OF.random;
  forceAll = false;
  forceAllSource = false;
  fullSource = false;
  regenerate = true;

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
  transBPMMulti = 10;
  transEase = EA.linear;
  transExp = 6;
  transAmp = 20;
  transPer = 6;
  transOv = 3;
  crossFade = false;
  crossFadeAudio = false;
  fadeTF = TF.constant;
  fadeDuration = 500;
  fadeDurationMin = 100;
  fadeDurationMax = 700;
  fadeSinRate = 100;
  fadeBPMMulti = 10;
  fadeEase = EA.linear;
  fadeExp = 6;
  fadeAmp = 20;
  fadePer = 6;
  fadeOv = 3;
  fadeInOut = false;
  fadeIOPulse = false;
  fadeIOTF = TF.constant;
  fadeIODuration = 2000;
  fadeIODurationMin = 2000;
  fadeIODurationMax = 5000;
  fadeIOSinRate = 100;
  fadeIOBPMMulti = 10;
  fadeIODelayTF = TF.constant;
  fadeIODelay = 2000;
  fadeIODelayMin = 2000;
  fadeIODelayMax = 5000;
  fadeIODelaySinRate = 100;
  fadeIODelayBPMMulti = 10;
  fadeIOStartEase = EA.linear;
  fadeIOStartExp = 6;
  fadeIOStartAmp = 20;
  fadeIOStartPer = 6;
  fadeIOStartOv = 3;
  fadeIOEndEase = EA.linear;
  fadeIOEndExp = 6;
  fadeIOEndAmp = 20;
  fadeIOEndPer = 6;
  fadeIOEndOv = 3;
  panning = false;
  panTF = TF.constant;
  panDuration = 2000;
  panDurationMin = 2000;
  panDurationMax = 5000;
  panSinRate = 100;
  panBPMMulti = 10;
  panHorizTransType = HTF.none;
  panHorizTransImg = false;
  panHorizTransLevel = 10;
  panHorizTransLevelMax = 10;
  panHorizTransLevelMin = 5;
  panHorizTransRandom = false;
  panVertTransType = VTF.none;
  panVertTransImg = false;
  panVertTransLevel = 10;
  panVertTransLevelMax = 10;
  panVertTransLevelMin = 5;
  panVertTransRandom = false;
  panStartEase = EA.linear;
  panStartExp = 6;
  panStartAmp = 20;
  panStartPer = 6;
  panStartOv = 3;
  panEndEase = EA.linear;
  panEndExp = 6;
  panEndAmp = 20;
  panEndPer = 6;
  panEndOv = 3;

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
  persistAudio = false;
  persistText = false;
  nextSceneRandoms: Array<number> = [];

  strobe = false;
  strobePulse = false;
  strobeLayer = SL.top;
  strobeOpacity = 1;
  strobeTF = TF.constant;
  strobeTime = 200;
  strobeTimeMin = 100;
  strobeTimeMax = 300;
  strobeSinRate = 100;
  strobeBPMMulti = 10;
  strobeDelayTF = TF.constant;
  strobeDelay = 200;
  strobeDelayMin = 100;
  strobeDelayMax = 300;
  strobeDelaySinRate = 100;
  strobeDelayBPMMulti = 10;
  strobeColorType = SC.color;
  strobeColor = "#FFFFFF";
  strobeColorSet: Array<string> = [];
  strobeEase = EA.linear;
  strobeExp = 6;
  strobeAmp = 20;
  strobePer = 6;
  strobeOv = 3;

  // migration only
  overlaySceneID = 0;
  overlaySceneOpacity = 0.5;
  gridView = false;
  grid: Array<Array<number>> = [[]];
  audios: Array<Audio> = [];
  rotatePortrait = false;
}

export class RemoteSettings implements RemoteSettingsI {
  [key: string]: string | Array<string> | boolean;

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
  silenceTumblrAlert = false;

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

  hydrusProtocol = "http";
  hydrusDomain = "localhost";
  hydrusPort = "45869";
  hydrusAPIKey = "";
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
  easingControls = false;
  audioAlert = true;

  minVideoSize = 200;
  minImageSize = 200;
  maxInMemory = 120;
  maxLoadingAtOnce = 5;
}

export class GeneralSettings  implements GeneralSettingsI {
  [key: string]: number | boolean | string;

  portableMode = false;
  disableLocalSave = false;
  confirmSceneDeletion = true;
  autoBackup = false;
  autoBackupDays = 1;
  autoCleanBackup = false;
  autoCleanBackupDays = 14;
  autoCleanBackupWeeks = 8;
  autoCleanBackupMonths = 6;
  cleanRetain = 1;
  watermark = false;
  watermarkCorner = WC.bottomRight;
  watermarkText = "";
  watermarkFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
  watermarkFontSize = 14;
  watermarkColor = "#FFFFFF";
}

export class Tutorials implements TutorialsI {
  [key: string]: string;

  scenePicker = null as string;
  sceneDetail = null as string;
  player = null as string;
  library = null as string;
  audios = null as string;
  scripts = null as string;
  scriptor = null as string;
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
    if (this.defaultScene && this.defaultScene.rotatePortrait) {
      this.defaultScene.videoOrientation = OT.forceLandscape;
      this.defaultScene.rotatePortrait = false;
    }
    if (this.displaySettings && (this.displaySettings as any).portableMode == true) {
      (this.displaySettings as any).portableMode = undefined;
      this.generalSettings.portableMode = true;
    }
  }
}