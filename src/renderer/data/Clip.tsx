import Tag from "./Tag";

export default class Clip {
  id: number = 0;
  start: number;
  end: number;
  volume: number = null;
  tags: Array<Tag> = [];

  constructor(init?: Partial<Clip>) {
    Object.assign(this, init);
  }
}