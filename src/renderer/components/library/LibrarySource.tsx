export default class LibrarySource {
  id: number = 0;
  url: string;
  tags: Array<string>;

  constructor(init?:Partial<LibrarySource>) {
    Object.assign(this, init);
  }

  setURL(url: string) {
    this.url = url;
  }
}