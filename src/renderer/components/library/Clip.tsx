export default class Clip {
  id: number = 0;
  start: number;
  end: number;

  constructor(init?: Partial<Clip>) {
    Object.assign(this, init);
  }
}