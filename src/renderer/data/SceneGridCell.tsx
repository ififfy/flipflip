export default class SceneGridCell {
  sceneID: number = -1;
  sceneCopy: Array<number> = [];
  mirror = false;

  constructor(init?: Partial<SceneGridCell>) {
    Object.assign(this, init);
  }
}