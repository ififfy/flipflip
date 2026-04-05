import Audio from "./Audio"
import CaptionScript from "./CaptionScript"
import Config from "./Config"
import LibrarySource from "./LibrarySource"
import Playlist from "./Playlist"
import { Route } from "./Route"
import Scene from "./Scene"
import SceneGrid from "./SceneGrid"
import SceneGroup from "./SceneGroup"
import Tag from "./Tag"
import { Theme } from "./theme"

export default interface AppStorageState {
  version: string,
  config: Config,
  sceneGroups: Array<SceneGroup>,
  scenes: Array<Scene>,
  grids: Array<SceneGrid>,
  library: Array<LibrarySource>,
  audios: Array<Audio>,
  scripts: Array<CaptionScript>,
  playlists: Array<Playlist>,
  tags: Array<Tag>,
  route: Array<Route>,
  specialMode: string,
  openTab: number,
  displayedSources: Array<LibrarySource>,
  libraryYOffset: number,
  libraryFilters: Array<string>,
  librarySelected: Array<string>,
  audioOpenTab: number,
  audioYOffset: number,
  audioFilters: Array<string>,
  audioSelected: Array<string>,
  scriptYOffset: number,
  scriptFilters: Array<string>,
  scriptSelected: Array<string>,
  progressMode: string,
  progressTitle: string,
  progressCurrent: number,
  progressTotal: number,
  progressNext: string,
  systemMessage: string,
  systemSnackOpen: boolean,
  systemSnack: string,
  systemSnackSeverity: string,
  tutorial: string,
  theme: Theme,
}