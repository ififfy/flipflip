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

export class APIKeys {
  defaultTumblr = "BaQquvlxQeRhKRyViknF98vseIdcBEyDrzJBpHxvAiMPHCKR2l";
  overlayTumblr = "G4iZd6FBiyDxHVUpNqtOTDu4woWzfp8WuH3tTrT3MC16GTmNzq";
  otherTumblrs = ["BaQquvlxQeRhKRyViknF98vseIdcBEyDrzJBpHxvAiMPHCKR2l",
    "G4iZd6FBiyDxHVUpNqtOTDu4woWzfp8WuH3tTrT3MC16GTmNzq",
    "UHpRFx16HFIRgQjtjJKgfVIcwIeb71BYwOQXTMtiCvdSEPjV7N",
    "JFNLu3CbINQjRdUvZibXW9VpSEVYYtiPJ86o8YmvgLZIoKyuNX"];
}

export class CacheSettings {
  enabled = true;
  directory = "";
  maxSize = 5120; // Size in MB (default 5GB)
}

export class CaptionSettings {
  blinkColor = "#FFFFFF";
  blinkFontSize = 20;
  blinkFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";

  captionColor = "#FFFFFF";
  captionFontSize = 8;
  captionFontFamily = "Helvetica Neue,Helvetica,Arial,sans-serif";

  captionBigColor = "#FFFFFF";
  captionBigFontSize = 12;
  captionBigFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
}

export default class Config {
  defaultScene = new SceneSettings();
  apiKeys = new APIKeys();
  caching = new CacheSettings();
  captions = new CaptionSettings();

  constructor(init?:Partial<SceneSettings>) {
    Object.assign(this, init);
  }
}

