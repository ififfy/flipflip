import path from "path";

import {urlToPath} from "./utils";
import {BT, EA, GO, HTF, IF, IT, OF, OT, RP, SC, SL, SOF, STF, TF, VO, VTF, WF} from './const';
import LibrarySource from "./LibrarySource";
import Audio from "./Audio";
import Overlay from "./Overlay";
import WeightGroup from "./WeightGroup";
import CaptionScript from "./CaptionScript";

export default class Scene {
  id: number = 0;
  name: string = "Unnamed scene";
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
  weightFunction = WF.sources;
  sourceOrderFunction = SOF.random;
  orderFunction = OF.random;
  forceAll = false;
  forceAllSource = false;
  fullSource = false;
  imageTypeFilter = IF.any;
  imageOrientation = OT.original;
  videoOrientation = OT.original;
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
  slide = false;
  slideTF = TF.constant;
  slideType = STF.left;
  slideDistance = 100;
  slideDuration = 500;
  slideDurationMin = 100;
  slideDurationMax = 700;
  slideSinRate = 100;
  slideBPMMulti = 10;
  slideEase = EA.linear;
  slideExp = 6;
  slideAmp = 20;
  slidePer = 6;
  slideOv = 3;
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
  gifOption = GO.none;
  gifTimingConstant = 3000;
  gifTimingMin = 1000;
  gifTimingMax = 3000;
  videoOption= VO.none;
  videoTimingConstant = 3000;
  videoTimingMin = 1000;
  videoTimingMax = 3000;
  randomVideoStart = false;
  continueVideo = false;
  playVideoClips = true;
  skipVideoStart = 0;
  skipVideoEnd = 0;
  scriptScene = false;
  generatorMax = 100;
  overlayEnabled: false;
  overlays: Array<Overlay> = [];
  nextSceneID: number = 0;
  nextSceneTime: number = 900;
  nextSceneAllImages = false;
  persistAudio = false;
  persistText = false;
  nextSceneRandomID: number = 0;
  nextSceneRandoms: Array<number> = [];
  libraryID: number = -1;
  videoVolume = 0;
  videoSpeed = 10;
  videoRandomSpeed = false;
  videoSpeedMin = 5;
  videoSpeedMax = 20;
  audioScene = false;
  audioEnabled = false;
  audioPlaylists: Array<{audios: Array<Audio>, shuffle: boolean, repeat: string}> = [];
  audioStartIndex = 0;
  textEnabled = false;
  scriptPlaylists: Array<{scripts: Array<CaptionScript>, shuffle: boolean, repeat: string}> = [];
  scriptStartIndex = 0;
  regenerate = true;
  generatorWeights?: Array<WeightGroup> = null;
  openTab = 3;

  // unused; migration only
  effectLevel: number;
  textKind: string;
  audioURL?: string;
  overlaySceneID: number;
  overlaySceneOpacity: number;
  transFull: boolean;
  fadeFull: boolean;
  playFullGif: boolean;
  playFullVideo: boolean;
  gridView: boolean;
  grid: Array<Array<number>>;
  tagWeights?: string;
  sceneWeights?: string;
  audios: Array<Audio>;
  textSource: string;
  textEndStop: boolean;
  textNextScene: boolean;
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
  rotatePortrait: boolean;

  constructor(init?: Partial<Scene>) {
    Object.assign(this, init);
    this.sources = this.sources.filter((d) => !!d);

    if (this.gridView) {
      this.gridView = false;
    }
    if (this.grid) {
      this.grid = null;
    }

    if (!this.transDuration && this.effectLevel != 0) {
      this.transDuration = this.effectLevel * 1000;
      this.effectLevel = 0;
    }
    if (this.overlaySceneID != 0) {
      this.overlays.push(new Overlay({sceneID: this.overlaySceneID, opacity: this.overlaySceneOpacity * 100}));
      this.overlaySceneID = 0;
    }

    if (this.audioURL && this.audioURL != "") {
      this.audios.push(new Audio({url: this.audioURL}));
      this.audioURL = "";
    }

    if (typeof this.timingConstant == "string") {
      this.timingConstant = parseInt(this.timingConstant);
    }

    if (this.timingFunction == 'tf.variableFaster') {
      this.timingFunction = TF.sin;
      this.timingMin = 0;
      this.timingMax = 600;
    } else if (this.timingFunction == 'tf.variableMedium') {
      this.timingFunction = TF.sin;
      this.timingMin = 3000;
      this.timingMax = 5000;
    } else if (this.timingFunction == 'tf.variableSlow') {
      this.timingFunction = TF.sin;
      this.timingMin = 3500;
      this.timingMax = 6500;
    } else if (this.timingFunction == 'tf.variableSlower') {
      this.timingFunction = TF.sin;
      this.timingMin = 10000;
      this.timingMax = 20000;
    } else if (this.timingFunction == 'tf.variableSlowest') {
      this.timingFunction = TF.sin;
      this.timingMin = 30000;
      this.timingMax = 60000;
    } else if (this.timingFunction == "at.random") {
      this.timingFunction = "tf.random"
    } else if (this.timingFunction == "at.sin") {
      this.timingFunction = "tf.sin"
    }

    if (this.transFull) {
      this.transTF = TF.scene;
      this.transFull = false;
    }

    if (this.fadeFull) {
      this.fadeTF = TF.scene;
      this.fadeFull = false;
    }

    if (this.playFullGif) {
      this.gifOption = GO.full;
      this.playFullGif = false;
    }

    if (this.playFullVideo) {
      this.videoOption = VO.full;
      this.playFullVideo = false;
    }

    if (this.textEndStop && this.textNextScene) {
      this.textEndStop = false;
      this.textNextScene = false;
    }

    if (this.textKind && this.textKind == "tot.hastebin") {
      this.textKind = "";
      this.textSource = "https://hastebin.com/raw/" + this.textSource;
    }

    if (this.timingBPMMulti <= 0) {
      this.timingBPMMulti = -1 * (this.timingBPMMulti - 2);
    }
    if (this.transBPMMulti <= 0) {
      this.transBPMMulti = -1 * (this.transBPMMulti - 2);
    }
    if (this.fadeBPMMulti <= 0) {
      this.fadeBPMMulti = -1 * (this.fadeBPMMulti - 2);
    }
    if (this.strobeBPMMulti <= 0) {
      this.strobeBPMMulti = -1 * (this.strobeBPMMulti - 2);
    }
    if (this.strobeDelayBPMMulti <= 0) {
      this.strobeDelayBPMMulti = -1 * (this.strobeDelayBPMMulti - 2);
    }

    if (this.audios) {
      this.audioPlaylists = this.audios.filter((a) => !!a.url && a.url.length).map((a) => {
        if (!a.name) {
          if (a.url.startsWith("http")) {
            a.name = a.url.substring(a.url.lastIndexOf("\/") + 1, a.url.lastIndexOf("."))
          } else {
            a.url = urlToPath(a.url).replace(/\//g, path.sep);
            a.name = a.url.substring(a.url.lastIndexOf(path.sep) + 1, a.url.lastIndexOf("."));
          }
          a.duration = 0;
        }
        return {audios: [a], shuffle: false, repeat: RP.all};
      });
      this.audios = null;
    }

    if (this.textSource && this.textSource.length > 0) {
      const newScripts = [new CaptionScript({
        url: this.textSource,
        stopAtEnd: this.textEndStop,
        nextSceneAtEnd: this.textNextScene,
        blink: {
          color: this.blinkColor,
          fontSize: this.blinkFontSize,
          fontFamily: this.blinkFontFamily,
          border: this.blinkBorder,
          borderpx: this.blinkBorderpx,
          borderColor: this.blinkBorderColor
        },
        caption: {
          color: this.captionColor,
          fontSize: this.captionFontSize,
          fontFamily: this.captionFontFamily,
          border: this.captionBorder,
          borderpx: this.captionBorderpx,
          borderColor: this.captionBorderColor
        },
        captionBig: {
          color: this.captionBigColor,
          fontSize: this.captionBigFontSize,
          fontFamily: this.captionBigFontFamily,
          border: this.captionBigBorder,
          borderpx: this.captionBigBorderpx,
          borderColor: this.captionBigBorderColor
        },
        count: {
          color: this.countColor,
          fontSize: this.countFontSize,
          fontFamily: this.countFontFamily,
          border: this.countBorder,
          borderpx: this.countBorderpx,
          borderColor: this.countBorderColor
        },
      })];
      this.scriptPlaylists = [{scripts: newScripts, shuffle: false, repeat: RP.all}]
      this.textSource = null;
      this.textEndStop = null;
      this.textNextScene = null;
      this.blinkColor = null;
      this.blinkFontSize = null;
      this.blinkFontFamily = null;
      this.blinkBorder = null;
      this.blinkBorderpx = null;
      this.blinkBorderColor = null;
      this.captionColor = null;
      this.captionFontSize = null;
      this.captionFontFamily = null;
      this.captionBorder = null;
      this.captionBorderpx = null;
      this.captionBorderColor = null;
      this.captionBigColor = null;
      this.captionBigFontSize = null;
      this.captionBigFontFamily = null;
      this.captionBigBorder = null;
      this.captionBigBorderpx = null;
      this.captionBigBorderColor = null;
      this.countColor = null;
      this.countFontSize = null;
      this.countFontFamily = null;
      this.countBorder = null;
      this.countBorderpx = null;
      this.countBorderColor = null;
    }
    for (let playlist of this.scriptPlaylists) {
      for (let script of playlist.scripts) {
        if (isNaN(script.opacity)) {
          script.opacity = 100;
        }
      }
    }

    if (this.rotatePortrait) {
      this.videoOrientation = OT.forceLandscape;
      this.rotatePortrait = false;
    }
  }
}
