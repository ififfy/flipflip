import SceneGridCell from "./SceneGridCell";

export default class SceneGrid {
  id: number = 0;
  name: string;
  grid: Array<Array<SceneGridCell>> = [[new SceneGridCell()]];

  constructor(init?: Partial<SceneGrid>) {
    Object.assign(this, init);

    this.grid = this.grid.map((r) => r.map((c) => {
      if (!c.sceneID) {
        return new SceneGridCell({sceneID: parseInt(c as any)})
      } else {
        return c;
      }
    }));
  }
}