import Tag from "./Tag";

export default class CaptionScript {
  id: number = 0;
  url: string;
  marked: boolean = false;
  tags: Array<Tag> = [];

  constructor(init?: Partial<CaptionScript>) {
    Object.assign(this, init);
  }
}