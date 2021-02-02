import Tag from "./Tag";

export default class CaptionScript {
  id: number = 0;
  url: string;
  script: string;
  marked: boolean = false;
  tags: Array<Tag> = [];

  opacity = 100;

  stopAtEnd = false;
  nextSceneAtEnd = false;
  syncWithAudio = true;

  blink: FontSettingsI = {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Arial Black,Arial Bold,Gadget,sans-serif",
    border: false,
    borderpx: 5,
    borderColor: "#000000",
  };

  caption: FontSettingsI = {
    color: "#FFFFFF" ,
    fontSize: 8,
    fontFamily: "Helvetica Neue,Helvetica,Arial,sans-serif",
    border: false,
    borderpx: 3,
    borderColor: "#000000",
  };

  captionBig: FontSettingsI = {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Arial Black,Arial Bold,Gadget,sans-serif",
    border: false,
    borderpx: 4,
    borderColor: "#000000",
  };

  count: FontSettingsI = {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Arial Black,Arial Bold,Gadget,sans-serif",
    border: false,
    borderpx: 5,
    borderColor: "#000000",
  }

  constructor(init?: Partial<CaptionScript>) {
    Object.assign(this, init);
  }
}

export interface FontSettingsI {
  [key: string]: string | number | boolean;
  color: string,
  fontSize: number,
  fontFamily: string,
  border: boolean,
  borderpx: number,
  borderColor: string,
}