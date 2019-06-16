import {BT, HTF, IF, TF, TOT, VTF, WF, ZF} from './const';
import LibrarySource from "../components/library/LibrarySource";

export default class Scene {
  id: number = 0;
  name: string = "Unnamed scene";
  sources: Array<LibrarySource> = [];
  timingFunction = TF.constant;
  timingConstant = "1000";
  weightFunction = WF.sources;
  randomize = true;
  forceAll = false;
  imageTypeFilter = IF.any;
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
  strobe = false;
  strobeOverlay = false;
  strobeTime = 200;
  strobeColor = "#FFFFFF";
  playFullGif = false;
  textKind: string = "";
  textSource: string = "";
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
  generatorMax = 100;
  overlaySceneID: number = 0;
  overlaySceneOpacity: number = 0.5;
  nextSceneID: number = 0;
  nextSceneTime: number = 900;
  libraryID: number = -1;
  audioURL?: string = "";
  tagWeights?: string;
  sceneWeights?: string;

  // unused; migration only
  hastebinID: string = "";
  zoomType = "";
  effectLevel = 0;

  constructor(init?: Partial<Scene>) {
    Object.assign(this, init);
    this.sources = this.sources.filter((d) => !!d);

    this.overlaySceneID = parseInt(this.overlaySceneID as any, 10);
    if (!this.overlaySceneOpacity) {
      this.overlaySceneOpacity = 0.5;
    }

    if (this.hastebinID.length && !(this.textSource && this.textSource.length)) {
      this.textKind = TOT.hastebin;
      this.textSource = this.hastebinID;
      this.hastebinID = "";
    }

    if (!this.zoom && this.zoomType != "") {
      if (this.zoomType == ZF.in) {
        this.zoom = true;
      } else if (this.zoomType == ZF.out) {
        this.zoom = true;
        this.zoomStart = 1.5;
        this.zoomEnd = 1.;
      }
      this.zoomType = "";
    }

    if (!this.transDuration && this.effectLevel != 0) {
      this.transDuration = this.effectLevel * 1000;
      this.effectLevel = 0;
    }

    if (!(this.textKind && this.textKind.length)) {
      this.textKind = TOT.url;
    }

    // backward compatible with 1.0.1
    if (!this.timingFunction.startsWith('tf.')) {
      this.timingFunction = 'tf.' + this.timingFunction;
    }
    if (Object.values(TF).indexOf(this.timingFunction) < 0) {
      this.timingFunction = TF.constant;
      this.timingConstant = "1000";
    }

    // backward compatible with 1.0.1
    if (!this.imageTypeFilter.startsWith('if.')) {
      this.imageTypeFilter = 'if.' + this.imageTypeFilter;
    }
    if (Object.values(IF).indexOf(this.imageTypeFilter) < 0) {
      this.imageTypeFilter = IF.any;
    }
  }
}
