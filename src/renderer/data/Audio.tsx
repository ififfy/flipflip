import {TF} from "./const";
import Tag from "./Tag";

export default class Audio {
  id: number = 0;
  url: string;
  marked: boolean = false;
  tags: Array<Tag> = [];

  volume: number = 100;
  speed: number = 10;
  stopAtEnd: boolean = false;
  nextSceneAtEnd: boolean = false;
  tick: boolean = false;
  tickMode: string = TF.constant;
  tickDelay: number = 1000;
  tickMinDelay: number = 500;
  tickMaxDelay: number = 5000;
  tickSinRate: number = 100;
  tickBPMMulti: number = 10;
  bpm: number = 0;

  thumb: string;
  name: string;
  artist: string;
  album: string;
  trackNum: number;
  duration: number;
  comment: string;
  playedCount: number = 0;

  constructor(init?: Partial<Audio>) {
    Object.assign(this, init);
    if (this.tickMode == "at.constant") {
      this.tickMode = "tf.c";
    } else if (this.tickMode == "at.random") {
      this.tickMode = "tf.random";
    } else if (this.tickMode == "at.sin") {
      this.tickMode = "tf.sin";
    } else if (this.tickMode == "at.scene") {
      this.tickMode = "tf.scene";
    }
  }
}