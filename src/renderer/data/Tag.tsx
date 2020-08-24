export default class Tag {
  id: number = 0;
  name: string;
  phraseString: string;
  typeTag = false;

  constructor(init?: Partial<Tag>) {
    Object.assign(this, init);
  }
}