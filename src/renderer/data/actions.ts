import * as fs from "fs";
import path from 'path';
import {getBackups, saveDir} from "./utils";
import Scene from "./Scene";
import { Route } from "./Route";
import LibrarySource from "../components/library/LibrarySource";
import { defaultInitialState } from './AppStorage';
import Config from "./Config";
import Tag from "../components/library/Tag";
import { remote } from "electron";

type State = typeof defaultInitialState;

/** Getters **/

// Returns true if the last route matches the given kind
export function isRoute(state: State, kind: string): Boolean {
  if (state.route.length < 1) return false;
  return state.route[state.route.length - 1].kind === kind;
}

// Returns the active scene, or null if the current route isn't a scene
export function getActiveScene(state: State): Scene | null {
  for (let r of state.route.slice().reverse()) {
    if (r.kind == 'scene' || r.kind == 'generate') {
      return state.scenes.find((s: Scene) => s.id === r.value);
    }
  }
  return null;
}

// Returns the active library source, or null if the current route isn't a library source
export function getLibrarySource(state: State): LibrarySource | null {
  const libraryID = getActiveScene(state).libraryID;
  for (let s of state.library) {
    if (s.id == libraryID) {
      return s;
    }
  }
  return null;
}

/** Actions **/
// All of these functions return object diffs that you can pass to ReactComponent.setState().
// The first argument is always a State object, even if it isn't used.

export function restoreFromBackup(state: State, backupFile: string): Object {
  try {
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
    return {
      version: data.version,
      autoEdit: data.autoEdit,
      isSelect: data.isSelect,
      config: new Config(data.config),
      scenes: data.scenes.map((s: any) => new Scene(s)),
      library: data.library.map((s: any) => new LibrarySource(s)),
      tags: data.tags.map((t: any) => new Tag(t)),
      route: data.route.map((s: any) => new Route(s)),
      libraryYOffset: 0,
      libraryFilters: Array<string>(),
    };
  } catch (e) {
    alert("Restore error:\n" + e);
    return {};
  }
}

export function cleanBackups(state: State): Object {
  const backups = getBackups();
  backups.shift(); // Keep the newest backup
  let error;
  for (let backup of backups) {
    fs.unlink(saveDir + path.sep + backup, (err) => {
      if (err) {
        error = err;
      }
    });
  }
  if (error) {
    alert("Cleanup error:\n" + error);
  } else {
    alert("Cleanup success!");
  }
  return {};
}

export function goBack(state: State): Object {
  state.route.pop();
  const newRoute = state.route.slice(0);
  return {route: newRoute, autoEdit: false, isSelect: false};
}

export function saveScene(state: State): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  const sceneCopy = JSON.parse(JSON.stringify(getActiveScene(state))); // Make a copy
  sceneCopy.tagWeights = null;
  sceneCopy.sceneWeights = null;
  sceneCopy.id = id;
  return {
    scenes: state.scenes.concat([sceneCopy]),
    route: [new Route({kind: 'scene', value: sceneCopy.id})],
    autoEdit: true,
  };
}

export function addScene(state: State): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  let scene = new Scene({
    id: id,
    name: "New scene",
    sources: new Array<LibrarySource>(),
    ...state.config.defaultScene,
  });
  return {
    scenes: state.scenes.concat([scene]),
    route: [new Route({kind: 'scene', value: scene.id})],
    autoEdit: true,
  };
}

export function deleteScene(state: State, scene: Scene): Object {
  return {
    scenes: state.scenes.filter((s: Scene) => s.id != scene.id),
    route: Array<Route>(),
  };
}

export function nextScene(state: State): Object {
  const scene = getActiveScene(state);
  if (scene && scene.nextSceneID !== 0){
    const nextScene = state.scenes.find((s: Scene) => s.id === getActiveScene(state).nextSceneID);
    if (nextScene != null) {
      if (nextScene.tagWeights || nextScene.sceneWeights) {
        return {
          route: [new Route({kind: 'generate', value: scene.id}),
          new Route({kind: 'scene', value: nextScene.id}), new Route({kind: 'play', value: nextScene.id})],
        };
      } else {
        return {
          route: [new Route({kind: 'scene', value: nextScene.id}), new Route({kind: 'play', value: nextScene.id})],
        };
      }
    }
  }
}

export function updateConfig(state: State, newConfig: Config): Object {
  return {config: newConfig};
}

export function openConfig(state: State): Object {
  return {route: [new Route({kind: 'config', value: null})]};
}

export function setDefaultConfig(state: State): Object {
  return {config: new Config(), route: new Array<Route>()};
}

export function goToScene(state: State, scene: Scene): Object {
  if (scene.tagWeights || scene.sceneWeights) {
    return {route: [new Route({kind: 'generate', value: scene.id})]};
  } else {
    return {route: [new Route({kind: 'scene', value: scene.id})]};
  }
}

export function openLibrary(state: State): Object {
  return {route: [new Route({kind: 'library', value: null})], libraryYOffset: 0, libraryFilters: Array<string>()};
}

export function openLibraryImport(state: State): Object {
  return {route: state.route.concat(new Route({kind: 'library', value: null})), isSelect: true};
}

export function importFromLibrary(state: State, sources: Array<string>): Object {
  const sceneSources = getActiveScene(state).sources;
  const sceneSourceURLs = sceneSources.map((s) => s.url);
  let id = sceneSources.length + 1;
  getActiveScene(state).sources.forEach((s) => {
    id = Math.max(s.id + 1, id);
  });
  for (let source of sources) {
    if (!sceneSourceURLs.includes(source)) {
      const newSource = new LibrarySource({
        url: source,
        id: id,
        tags: new Array<Tag>(),
      });
      sceneSources.unshift(newSource);
      id += 1;
    }
  }
  updateScene(state, getActiveScene(state), (s: Scene) => {s.sources = sceneSources});
  return goBack(state);
}

export function playScene(state: State, scene: Scene): Object {
  return {route: state.route.concat(new Route({kind: 'play', value: scene.id}))};
}

export function playSceneFromLibrary(state: State, source: LibrarySource, yOffset: number, filters: Array<string>): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  let tempScene = new Scene({
    name: "library_scene_temp",
    sources: [source],
    libraryID: source.id,
    id: id,
  });
  const newRoute = [new Route({kind: 'scene', value: tempScene.id}), new Route({kind: 'libraryplay', value: tempScene.id})];
  return {
    scenes: state.scenes.concat([tempScene]),
    route: newRoute,
    libraryYOffset: yOffset,
    libraryFilters: filters,
  };
}

export function endPlaySceneFromLibrary(state: State): Object {
  const newScenes = state.scenes;
  const libraryID = newScenes.pop().libraryID;
  const tagNames = state.tags.map((t: Tag) => t.name);
  // Re-order the tags of the source we were playing
  const newLibrary = state.library.map((s: LibrarySource) => {
    if (s.id == libraryID) {
       s.tags = s.tags.sort((a: Tag, b: Tag) => {
        const aIndex = tagNames.indexOf(a.name);
        const bIndex = tagNames.indexOf(b.name);
        if (aIndex < bIndex) {
          return -1;
        } else if (aIndex > bIndex) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    return s;
  });
  return {route: [new Route({kind: 'library'})], scenes: newScenes, library: newLibrary};
}

export function manageTags(state: State): Object {
  const newRoute = state.route.concat(new Route({kind: 'tags', value: null}));
  return {route: newRoute};
}

export function addGenerator(state: State): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  let scene = new Scene({
    id: id,
    name: "New generator",
    sources: new Array<LibrarySource>(),
    tagWeights: "[]",
    sceneWeights: "[]",
    ...state.config.defaultScene,
  });
  return {
    scenes: state.scenes.concat([scene]),
    route: [new Route({kind: 'generate', value: scene.id})],
    autoEdit: true
  };
}

export function generateScene(state: State): Object {
  const newRoute = state.route.concat(new Route({kind: 'scene', value: getActiveScene(state).id}));
  return {route: newRoute};
}

export function updateScene(state: State, scene: Scene, fn: (scene: Scene) => void): Object {
  const scenes = state.scenes;
  for (let s of scenes) {
    if (s.id == scene.id) {
      fn(s);
    }
  }
  return {scenes: scenes};
}

export function replaceScenes(state: State, scenes: Array<Scene>): Object {
  return {scenes: scenes};
}

export function replaceLibrary(state: State, library: Array<LibrarySource>): Object {
  return {library: library};
}

export function updateTags(state: State, tags: Array<Tag>): Object {
  // Go through each scene in the library
  let newLibrary = state.library;
  const tagIDs = tags.map((t) => t.id);
  for (let source of newLibrary) {
    // Remove deleted tags, update any edited tags, and order the same as tags
    source.tags = source.tags.filter((t: Tag) => tagIDs.includes(t.id));
    source.tags = source.tags.map((t: Tag) => {
      for (let tag of tags) {
        if (t.id == tag.id) {
          t.name = tag.name;
          return t;
        }
      }
    });
    source.tags = source.tags.sort((a: Tag, b: Tag) => {
      const aIndex = tagIDs.indexOf(a.id);
      const bIndex = tagIDs.indexOf(b.id);
      if (aIndex < bIndex) {
        return -1;
      } else if (aIndex > bIndex) {
        return 1;
      } else {
        return 0;
      }
    });
  }
  return {tags: tags, library: newLibrary};
}

export function toggleTag(state: State, sourceID: number, tag: Tag): Object {
  let newLibrary = state.library;
  for (let source of newLibrary) {
    if (source.id == sourceID) {
      if (source.tags.map((t: Tag) => t.name).includes(tag.name)) {
        source.tags = source.tags.filter((t: Tag) => t.name != tag.name);
      } else {
        source.tags.push(tag);
      }
    }
  }
  return replaceLibrary(state, newLibrary);
}

export function exportScene(state: State, scene: Scene): Object {
  const sceneCopy = JSON.parse(JSON.stringify(scene)); // Make a copy
  sceneCopy.tagWeights = null;
  sceneCopy.sceneWeights = null;
  const sceneExport = JSON.stringify(sceneCopy);
  const fileName = sceneCopy.name + "_export.json";
  remote.dialog.showSaveDialog(remote.getCurrentWindow(),
    {filters: [{name: 'JSON Document', extensions: ['json']}], defaultPath: fileName}, (filePath) => {
      if (filePath != null) {
        fs.writeFileSync(filePath, sceneExport);
      }
  });
  return {};
}

export function importScene(state: State): Object {
  const filePath = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
    {filters: [{name:'All Files (*.*)', extensions: ['*']},{name: 'JSON Document', extensions: ['json']}], properties: ['openFile']});
  if (!filePath || !filePath.length) return;
  const scene = new Scene(JSON.parse(fs.readFileSync(filePath[0], 'utf-8')));
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  scene.id = id;
  return {scenes: state.scenes.concat([scene]), route: [new Route({kind: 'scene', value: scene.id})]};
}

export function clearTumblr(state: State): Object {
  const newConfig = state.config;
  newConfig.remoteSettings.tumblrKey = "";
  newConfig.remoteSettings.tumblrSecret = "";
  newConfig.remoteSettings.tumblrOAuthToken = "";
  newConfig.remoteSettings.tumblrOAuthTokenSecret = "";
  return {config: newConfig};
}

export function clearReddit(state: State): Object {
  const newConfig = state.config;
  newConfig.remoteSettings.redditRefreshToken = "";
  return {config: newConfig};
}