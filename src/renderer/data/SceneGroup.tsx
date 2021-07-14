export default class SceneGroup {
  id: number = 0;
  type: string;
  name: string = "New Group";
  scenes: Array<number> = [];

  constructor(init?: Partial<SceneGroup>) {
    Object.assign(this, init);
  }
}