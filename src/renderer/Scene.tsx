import {ZF, HTF, VTF, TF, IF, TK, BT} from './const';

export default class Scene {
  id: number = 0;
  name: string = "Unnamed scene";
  directories: Array<string> = [];
  timingFunction = TF.constant;
  timingConstant = "1000";
  imageTypeFilter = IF.any;
  zoomType = ZF.none;
  effectLevel: number = 5;
  horizTransType = HTF.none;
  vertTransType = VTF.none;
  crossFade = false;
  backgroundType = BT.image; 
  backgroundColor = "";  //Color name of number Empty - use blurred image 
  playFullGif = false;
  textKind: string = "";
  textSource: string = "";
  imageSizeMin: 200;
  overlaySceneID: number = 0;
  overlaySceneOpacity: number = 0.5;
  audioURL?: string = "";

  // unused; migration only
  hastebinID: string = "";

  // if true, the display chooses a directory first, then picks an image out
  // of it.
  // if false, the display chooses an image out of all possible images, without
  // looking at which directory it was in.
  weightDirectoriesEqually = true;

  constructor(init?:Partial<Scene>) {
    Object.assign(this, init);
    this.directories = this.directories.filter((d) => !!d);

    this.overlaySceneID = parseInt(this.overlaySceneID as any, 10);
    if (!this.overlaySceneOpacity) {
      this.overlaySceneOpacity = 0.5;
    }

    if (!this.imageSizeMin) {
      this.imageSizeMin = 200;
    }

    if (this.hastebinID.length && !(this.textSource && this.textSource.length)) {
      this.textKind = TK.hastebin;
      this.textSource = this.hastebinID;
      this.hastebinID = "";
    }

    if (!(this.textKind && this.textKind.length)) {
      this.textKind = TK.url;
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
