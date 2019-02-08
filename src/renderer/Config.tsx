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
  overlaySceneID = 0;
  overlaySceneOpacity = 0.5;
  textKind = "";
  textSource = "";

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

export class RemoteSettings {
  tumblrDefault = "BaQquvlxQeRhKRyViknF98vseIdcBEyDrzJBpHxvAiMPHCKR2l";
  tumblrOverlay = "G4iZd6FBiyDxHVUpNqtOTDu4woWzfp8WuH3tTrT3MC16GTmNzq";
  tumblrOther = ["BaQquvlxQeRhKRyViknF98vseIdcBEyDrzJBpHxvAiMPHCKR2l",
    "G4iZd6FBiyDxHVUpNqtOTDu4woWzfp8WuH3tTrT3MC16GTmNzq",
    "UHpRFx16HFIRgQjtjJKgfVIcwIeb71BYwOQXTMtiCvdSEPjV7N",
    "JFNLu3CbINQjRdUvZibXW9VpSEVYYtiPJ86o8YmvgLZIoKyuNX"];

  redditClientID = "";
  redditClientSecret = "";
  redditUsername = "";
  redditPassword = "";
}

export class CacheSettings {
  enabled = true;
  directory = "";
  maxSize = 5120; // Size in MB (default 5GB)
}

export default class Config {
  defaultScene = new SceneSettings();
  remoteSettings = new RemoteSettings();
  caching = new CacheSettings();

  constructor(init?:Partial<SceneSettings>) {
    Object.assign(this, init);
  }
}

