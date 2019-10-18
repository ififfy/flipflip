import Tag from "./Tag";
import Clip from "./Clip";

export default class LibrarySource {
  id: number = 0;
  url: string;
  offline: boolean = false;
  marked: boolean = false;
  lastCheck: Date = null;
  tags: Array<Tag> = [];
  clips: Array<Clip> = [];
  blacklist: Array<string> = [];
  count: number = 0;
  countComplete: boolean = false;

  constructor(init?: Partial<LibrarySource>) {
    Object.assign(this, init);
  }
}