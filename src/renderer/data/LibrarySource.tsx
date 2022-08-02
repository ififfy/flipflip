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
  disabledClips: Array<number> = [];
  blacklist: Array<string> = [];
  count: number = 0;
  countComplete: boolean = false;
  weight: number = 1;

  // Type specific properties
  // Local
  dirOfSources: boolean = false;
  // Video
  subtitleFile: string;
  duration: number;
  resolution: number;
  // Reddit
  redditFunc: string;
  redditTime: string;
  // Twitter
  includeRetweets: boolean = false;
  includeReplies: boolean = false;

  constructor(init?: Partial<LibrarySource>) {
    Object.assign(this, init);
  }
}