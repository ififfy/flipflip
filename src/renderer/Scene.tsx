export default class Scene {
  id: Number = 0
  name: string = "Unnamed scene"
  directories: Array<String> = []

  constructor(init?:Partial<Scene>) {
    Object.assign(this, init);
  }
}