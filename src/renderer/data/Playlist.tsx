export default class Playlist {
  id: number = 0;
  name: string;
  audios: Array<number> = []; // Array of audio IDs

  constructor(init?: Partial<Playlist>) {
    Object.assign(this, init);
  }
}