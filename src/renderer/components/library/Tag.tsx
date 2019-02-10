export default class Tag {
  id: number = 0;
  name: string;

  constructor(init?: Partial<Tag>) {
    Object.assign(this, init);
  }
}