export default class Scene {
  id: Number = 0
  name: string = "Unnamed scene"
  directories: Array<string> = []
  timingFunction = 'tf.1s'
  imageTypeFilter = 'if.any'  // 'if.gifs', 'if.stills'
  zoomType = 'zf.none'// 'zf.1s', 'zf.5s'
  crossFade = false

  // if true, the display chooses a directory first, then picks an image out
  // of it.
  // if false, the display chooses an image out of all possible images, without
  // looking at which directory it was in.
  weightDirectoriesEqually = true

  constructor(init?:Partial<Scene>) {
    Object.assign(this, init);
    this.directories = this.directories.filter((d) => !!d);
  }
}