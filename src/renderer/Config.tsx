import {BT, HTF, IF, TF, VTF, ZF} from "./const";

export class SceneSettings {
  timingFunction = TF.constant;
  timingConstant = "1000";
  imageTypeFilter= IF.any;
  zoomType = ZF.none;
  effectLevel = 5;
  horizTransType = HTF.none;
  vertTransType = VTF.none;
  crossFade = false;
  backgroundType = BT.blur;
  backgroundColor = "#000000";
  playFullGif = false;
  textKind = "";
  textSource = "";
  overlaySceneID = 0;
  overlaySceneOpacity = 0.5;
}

class APIKeys {
  defaultTumblr = "";
  otherTumlrs = ["BaQquvlxQeRhKRyViknF98vseIdcBEyDrzJBpHxvAiMPHCKR2l",
    "UHpRFx16HFIRgQjtjJKgfVIcwIeb71BYwOQXTMtiCvdSEPjV7N",
    "JFNLu3CbINQjRdUvZibXW9VpSEVYYtiPJ86o8YmvgLZIoKyuNX"];
}

export default class Config {
  defaultScene = new SceneSettings();
  apiKeys = new APIKeys();
  cachingDir = "";
  cachingDirMax = 5120; // Size in MB (default 5GB)

  constructor(init?:Partial<SceneSettings>) {
    Object.assign(this, init);
  }
}

