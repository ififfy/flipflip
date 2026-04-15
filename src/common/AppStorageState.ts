import Audio from "./Audio";
import CaptionScript from "./CaptionScript";
import Config from "./Config";
import LibrarySource from "./LibrarySource";
import Playlist from "./Playlist";
import { Route } from "./Route";
import Scene from "./Scene";
import SceneGrid from "./SceneGrid";
import SceneGroup from "./SceneGroup";
import Tag from "./Tag";
import defaultTheme, { Theme } from "./theme";

export default interface AppStorageState {
  version: string;
  config: Config;
  sceneGroups: Array<SceneGroup>;
  scenes: Array<Scene>;
  grids: Array<SceneGrid>;
  library: Array<LibrarySource>;
  audios: Array<Audio>;
  scripts: Array<CaptionScript>;
  playlists: Array<Playlist>;
  tags: Array<Tag>;
  route: Array<Route>;
  specialMode: string;
  openTab: number;
  displayedSources: Array<LibrarySource>;
  libraryYOffset: number;
  libraryFilters: Array<string>;
  librarySelected: Array<string>;
  audioOpenTab: number;
  audioYOffset: number;
  audioFilters: Array<string>;
  audioSelected: Array<string>;
  scriptYOffset: number;
  scriptFilters: Array<string>;
  scriptSelected: Array<string>;
  progressMode: string;
  progressTitle: string;
  progressCurrent: number;
  progressTotal: number;
  progressNext: string;
  systemMessage: string;
  systemSnackOpen: boolean;
  systemSnack: string;
  systemSnackSeverity: string;
  tutorial: string;
  theme: Theme;
}

export const defaultInitialState: AppStorageState = {
  version: "0.0.0",
  config: new Config(),
  sceneGroups: Array<SceneGroup>(),
  scenes: Array<Scene>(),
  grids: Array<SceneGrid>(),
  library: Array<LibrarySource>(),
  audios: Array<Audio>(),
  scripts: Array<CaptionScript>(),
  playlists: Array<Playlist>(),
  tags: Array<Tag>(),
  route: Array<Route>(),
  specialMode: null as string,
  openTab: 0,
  displayedSources: Array<LibrarySource>(),
  libraryYOffset: 0,
  libraryFilters: Array<string>(),
  librarySelected: Array<string>(),
  audioOpenTab: 3,
  audioYOffset: 0,
  audioFilters: Array<string>(),
  audioSelected: Array<string>(),
  scriptYOffset: 0,
  scriptFilters: Array<string>(),
  scriptSelected: Array<string>(),
  progressMode: null as string,
  progressTitle: null as string,
  progressCurrent: 0,
  progressTotal: 0,
  progressNext: null as string,
  systemMessage: null as string,
  systemSnackOpen: false,
  systemSnack: null as string,
  systemSnackSeverity: null as string,
  tutorial: null as string,
  theme: defaultTheme,
};
