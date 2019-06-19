import Tag from "./Tag";

export default class LibrarySource {
  id: number = 0;
  url: string;
  offline: boolean = false;
  marked: boolean = false;
  lastCheck: Date = null;
  tags: Array<Tag>;

  constructor(init?: Partial<LibrarySource>) {
    Object.assign(this, init);
  }
}