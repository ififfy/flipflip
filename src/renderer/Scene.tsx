import {ZF, TF, IF} from './const';
export default class Scene {
  id: Number = 0
  name: string = "Unnamed scene"
  directories: Array<string> = []
  timingFunction = TF.constant
  timingConstant = "1000";
  imageTypeFilter = IF.any
  zoomType = ZF.none
  zoomLevel: number = 5
  crossFade = false
  hastebinID: string = "";

  // if true, the display chooses a directory first, then picks an image out
  // of it.
  // if false, the display chooses an image out of all possible images, without
  // looking at which directory it was in.
  weightDirectoriesEqually = true

  constructor(init?:Partial<Scene>) {
    Object.assign(this, init);
    this.directories = this.directories.filter((d) => !!d);

    // backward compatible with 1.0.1
    if (!(TF as any)[this.timingFunction]) {
      this.timingFunction = 'tf.' + this.timingFunction;
    }
    if (!(TF as any)[this.timingFunction]) {
      this.timingFunction = TF.constant;
      this.timingConstant = "1000";
    }

    // backward compatible with 1.0.1
    if (!(IF as any)[this.imageTypeFilter]) {
      this.imageTypeFilter = 'if.' + this.imageTypeFilter;
    }
    if (!(IF as any)[this.imageTypeFilter]) {
      this.imageTypeFilter = IF.any;
    }
  }
}