import {AT} from "../../data/const";

export default class Audio {
  id: number = 0;
  url: string;
  volume: number;
  speed: number = 10;
  tick: boolean = false;
  tickMode: string = AT.constant;
  tickDelay: number = 1000;
  tickMinDelay: number = 500;
  tickMaxDelay: number = 5000;

  constructor(init?: Partial<Audio>) {
    Object.assign(this, init);
  }
}