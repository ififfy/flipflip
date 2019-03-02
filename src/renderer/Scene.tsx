import {BT, HTF, IF, TF, TOT, VTF, ZF} from './const';
import LibrarySource from "./components/library/LibrarySource";

export default class Scene {
  id: number = 0;
  name: string = "Unnamed scene";
  sources: Array<LibrarySource> = [];
  timingFunction = TF.constant;
  timingConstant = "1000";
  imageTypeFilter = IF.any;
  zoomType = ZF.none;
  effectLevel: number = 5;
  horizTransType = HTF.none;
  vertTransType = VTF.none;
  crossFade = false;
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
  imageSizeMin: 200;
  overlaySceneID: number = 0;
  overlaySceneOpacity: number = 0.5;
  libraryID: number = -1;
  audioURL?: string = "";
  tagWeights?: string;

  // unused; migration only
  hastebinID: string = "";

  constructor(init?: Partial<Scene>) {
    Object.assign(this, init);
    this.sources = this.sources.filter((d) => !!d);

    this.overlaySceneID = parseInt(this.overlaySceneID as any, 10);
    if (!this.overlaySceneOpacity) {
      this.overlaySceneOpacity = 0.5;
    }

    if (!this.imageSizeMin) {
      this.imageSizeMin = 200;
    }

    if (this.hastebinID.length && !(this.textSource && this.textSource.length)) {
      this.textKind = TOT.hastebin;
      this.textSource = this.hastebinID;
      this.hastebinID = "";
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
