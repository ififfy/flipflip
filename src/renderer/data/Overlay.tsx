export default class Overlay {
  id: number = 0;
  sceneID: number = 0;
  opacity: number = 50;

  constructor(init?: Partial<Overlay>) {
    Object.assign(this, init);
  }
}