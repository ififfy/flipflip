export default class SceneGrid {
  id: number = 0;
  name: string;
  fill: boolean = false;
  grid: Array<Array<number>> = [[-1]];

  constructor(init?: Partial<SceneGrid>) {
    Object.assign(this, init);
  }
}