import Tag from "./Tag";

export default class Clip {
  id: number = 0;
  start: number;
  end: number;
  tags: Array<Tag> = [];

  constructor(init?: Partial<Clip>) {
    Object.assign(this, init);
  }
}