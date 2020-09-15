import {BT, GO, HTF, IF, IT, OF, SC, SL, SOF, TF, VO, VTF, WF} from './const';
import LibrarySource from "./LibrarySource";
import Audio from "./Audio";
import Overlay from "./Overlay";
import WeightGroup from "./WeightGroup";

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
  weightFunction = WF.sources;
  sourceOrderFunction = SOF.random;
  orderFunction = OF.random;
  forceAll = false;
  forceAllSource = false;
  fullSource = false;
  imageTypeFilter = IF.any;
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
  crossFade = false;
  crossFadeAudio = false;
  fadeTF = TF.constant;
  fadeDuration = 500;
  fadeDurationMin = 100;
  fadeDurationMax = 700;
  fadeSinRate = 100;
  fadeBPMMulti = 10;
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
  panning = false;
  panTF = TF.constant;
  panDuration = 2000;
  panDurationMin = 2000;
  panDurationMax = 5000;
  panSinRate = 100;
  panBPMMulti = 10;
  panHorizTransType = HTF.none;
  panHorizTransLevel = 10;
  panHorizTransLevelMax = 10;
  panHorizTransLevelMin = 5;
  panHorizTransRandom = false;
  panVertTransType = VTF.none;
  panVertTransLevel = 10;
  panVertTransLevelMax = 10;
  panVertTransLevelMin = 5;
  panVertTransRandom = false;
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
  rotatePortrait = false;
  playVideoClips = true;
  skipVideoStart = 0;
  skipVideoEnd = 0;
  textEnabled = false;
  textSource: string = "";
  textEndStop = false;
  textNextScene = false;
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
  generatorMax = 100;
  overlayEnabled: false;
  overlays: Array<Overlay> = [];
  nextSceneID: number = 0;
  nextSceneTime: number = 900;
  nextSceneAllImages = false;
  nextSceneRandomID: number = 0;
  nextSceneRandoms: Array<number> = [];
  libraryID: number = -1;
  videoVolume = 0;
  videoSpeed = 10;
  videoRandomSpeed = false;
  videoSpeedMin = 5;
  videoSpeedMax = 20;
  audioEnabled = false;
  audios: Array<Audio> = [];
  generatorWeights?: Array<WeightGroup> = null;
  openTab = 3;

  // unused; migration only
  effectLevel = 0;
  textKind: string = "";
  audioURL?: string = "";
  overlaySceneID: number = 0;
  overlaySceneOpacity: number = 0.5;
  transFull = false;
  fadeFull = false;
  playFullGif = false;
  playFullVideo = false;
  gridView = false;
  grid: Array<Array<number>> = null;
  tagWeights?: string;
  sceneWeights?: string;

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
  }
}
