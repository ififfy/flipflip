export default class Tag {
  id: number = 0;
  name: string;
  phraseString: string;

  constructor(init?: Partial<Tag>) {
    Object.assign(this, init);
  }
}