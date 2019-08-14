import {remote, webFrame} from "electron";
import * as fs from "fs";
import path from 'path';
import wretch from "wretch";
import {outputFile} from "fs-extra";
import getFolderSize from "get-folder-size";

import {getBackups, getCachePath, getFileName, getSourceType, saveDir} from "./utils";
import {ST} from "./const";
import { defaultInitialState } from './AppStorage';
import { Route } from "./Route";
import Scene from "./Scene";
import Config from "./Config";
import LibrarySource from "../components/library/LibrarySource";
import Tag from "../components/library/Tag";
import Clip from "../components/library/Clip";

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
    if (r.kind == 'scene' || r.kind == 'generate' || r.kind == 'grid') {
      return state.scenes.find((s: Scene) => s.id === r.value);
    }
  }
  return null;
}

export function getActiveSource(state: State): LibrarySource | null {
  for (let r of state.route.slice().reverse()) {
    if (r.kind == 'clip') {
      let source = state.library.find((s: LibrarySource) => s.url === r.value);
      if (source) return source;
      for (let scene of state.scenes) {
        source = scene.sources.find((s: LibrarySource) => s.url === r.value);
        if (source) return source;
      }
    }
  }
  return null;
}

// Returns the active library source, or null if the current route isn't a library source
export function getLibrarySource(state: State): LibrarySource | null {
  const activeScene = getActiveScene(state);
  if (activeScene == null) return null;
  return state.library.find((s) => s.id == activeScene.libraryID);
}

export function getTags(library: Array<LibrarySource>, source: string): Array<Tag> {
  const librarySource = library.find((s) => s.url == source);
  if (librarySource) {
    return librarySource.tags;
  } else {
    return [];
  }
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
      librarySelected: Array<string>(),
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
    fs.unlink(saveDir + path.sep + backup.url, (err) => {
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

export function cacheImage(state: State, i: HTMLImageElement | HTMLVideoElement) {
  if (state.config.caching.enabled) {
    const fileType = getSourceType(i.src);
    if (fileType != ST.local && i.src.startsWith("http")) {
      const cachePath = getCachePath(null, state.config);
      if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath)
      }
      const maxSize = state.config.caching.maxSize;
      const sourceCachePath = getCachePath(i.getAttribute("source"), state.config);
      const filePath = sourceCachePath + getFileName(i.src);
      const downloadImage = () => {
        if (!fs.existsSync(filePath)) {
          wretch(i.src)
            .get()
            .blob(blob => {
              const reader = new FileReader();
              reader.onload = function () {
                if (reader.readyState == 2) {
                  const arrayBuffer = reader.result as ArrayBuffer;
                  const buffer = Buffer.alloc(arrayBuffer.byteLength);
                  const view = new Uint8Array(arrayBuffer);
                  for (let i = 0; i < arrayBuffer.byteLength; ++i) {
                    buffer[i] = view[i];
                  }
                  outputFile(filePath, buffer);
                }
              };
              reader.readAsArrayBuffer(blob);
            });
        }
      };
      if (maxSize == 0) {
        downloadImage();
      } else {
        getFolderSize(cachePath, (err: string, size: number) => {
          if (err) {
            throw err;
          }

          const mbSize = (size / 1024 / 1024);
          if (mbSize < maxSize) {
            downloadImage();
          }
        });
      }
    }
  }
}

export function printMemoryReport() {
  function format(x: any) {
    let f = x.toString();
    while (f.length < 15) {
      f = " " + f;
    }
    f = f.substr(0, 15);
    return f;
  }
  function logB(x: any) {
    console.log(format(x[0]), format((x[1] / (1000.0*1000)).toFixed(2)), "MB");
  }
  function logKB(x: any) {
    console.log(format(x[0]), format((x[1] / (1000.0)).toFixed(2)), "MB");
  }
  function logCount(x: any) {
    console.log(format(x[0]), format(x[1].count), format((x[1].size / (1000.0*1000)).toFixed(2)), "MB", format((x[1].liveSize / (1000.0*1000)).toFixed(2)), "MB");
  }

  Object.entries(process.memoryUsage()).map(logB);
  Object.entries(process.getProcessMemoryInfo()).map(logKB);
  Object.entries(process.getSystemMemoryInfo()).map(logKB);
  console.log("\n");
  console.log(format("object"), format("count"), format("size"), format("liveSize"));
  Object.entries(webFrame.getResourceUsage()).map(logCount);
  console.log('------')
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
    const nextScene = state.scenes.find((s: Scene) => s.id == scene.nextSceneID);
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

export function startFromScene(state: State, sceneName: string) {
  const scene = state.scenes.find((s: Scene) => s.name == sceneName);
  if (scene) {
    if (scene.sources.length > 0) {
      if (scene.tagWeights || scene.sceneWeights) {
        return {
          route: [new Route({kind: 'generate', value: scene.id}),
            new Route({kind: 'scene', value: scene.id}), new Route({kind: 'play', value: scene.id})],
        };
      } else {
        return {
          route: [new Route({kind: 'scene', value: scene.id}), new Route({kind: 'play', value: scene.id})],
        };
      }
    } else {
      console.error("Scene '" + sceneName+ "' has no sources");
    }
  } else {
    console.error("Couldn't find scene '" + sceneName + "'");
  }
}

export function updateConfig(state: State, newConfig: Config): Object {
  return {config: newConfig};
}

export function openConfig(state: State): Object {
  return {route: [new Route({kind: 'config', value: null})]};
}

export function setDefaultConfig(state: State): Object {
  return {config: new Config()};
}

export function goToScene(state: State, scene: Scene): Object {
  if (scene.tagWeights || scene.sceneWeights) {
    return {route: [new Route({kind: 'generate', value: scene.id})]};
  } else {
    return {route: [new Route({kind: 'scene', value: scene.id})]};
  }
}

export function openLibrary(state: State): Object {
  return {route: [new Route({kind: 'library', value: null})]};
}

export function openLibraryImport(state: State): Object {
  return {route: state.route.concat(new Route({kind: 'library', value: null})), isSelect: true, librarySelected: []};
}

export function importFromLibrary(state: State, sources: Array<LibrarySource>): Object {
  const sceneSources = getActiveScene(state).sources;
  const sceneSourceURLs = sceneSources.map((s) => s.url);
  for (let source of sources) {
    if (!sceneSourceURLs.includes(source.url)) {
      sceneSources.unshift(source);
    }
  }
  updateScene(state, getActiveScene(state), (s: Scene) => {s.sources = sceneSources});
  return goBack(state);
}

export function saveLibraryPosition(state: State, yOffset: number, filters: Array<string>, selected: Array<string>): Object {
  return {
    libraryYOffset: yOffset,
    libraryFilters: filters,
    librarySelected: selected,
  };
}

export function playScene(state: State, scene: Scene): Object {
  return {route: state.route.concat(new Route({kind: 'play', value: scene.id}))};
}

export function playSceneFromLibrary(state: State, source: LibrarySource, displayed: Array<LibrarySource>): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  if (getLibrarySource(state) != null) {
    state.route.pop();
    state.route.pop();
    state.scenes.pop();
  }
  let librarySource = state.library.find((s) => s.url == source.url);
  if (librarySource == null) {
    alert("The source " + source.url + " isn't in your Library");
    return;
  }
  let tempScene = new Scene({
    id: id,
    name: "library_scene_temp",
    sources: [source],
    libraryID: librarySource.id,
    displayedLibrary: displayed,
    forceAll: state.config.defaultScene.forceAll,
    backgroundType: state.config.defaultScene.backgroundType,
    backgroundColor: state.config.defaultScene.backgroundColor,
    backgroundBlur: state.config.defaultScene.backgroundBlur,
    randomVideoStart: state.config.defaultScene.randomVideoStart,
    continueVideo: state.config.defaultScene.continueVideo,
    playVideoClips: state.config.defaultScene.playVideoClips,
    videoVolume: state.config.defaultScene.videoVolume,
  });
  return {
    scenes: state.scenes.concat([tempScene]),
    route: state.route.concat([new Route({kind: 'scene', value: tempScene.id}), new Route({kind: 'libraryplay', value: tempScene.id})]),
  };
}

export function onUpdateClips(state: State, sourceURL: string, clips: Array<Clip>) {
  const newLibrary = state.library;
  const newScenes = state.scenes;
  const source = newLibrary.find((s) => s.url == sourceURL);
  if (source) {
    source.clips = clips;
  }
  for (let scene of newScenes) {
    const sceneSource = scene.sources.find((s) => s.url == sourceURL);
    if (sceneSource) {
      sceneSource.clips = clips;
    }
  }
  return {library: newLibrary, scenes: newScenes};
}

export function clipVideo(state: State, source: LibrarySource) {
  return {route: state.route.concat([new Route({kind: 'clip', value: source.url})])};
}

export function navigateDisplayedLibrary(state: State, offset: number): Object {
  const activeScene = getActiveScene(state);
  const displayed = Array.from(activeScene.displayedLibrary);
  const indexOf = displayed.map((s) => s.url).indexOf(activeScene.sources[0].url);
  let newIndexOf = indexOf + offset;
  if (newIndexOf < 0) {
    newIndexOf = displayed.length - 1;
  } else if (newIndexOf >= displayed.length) {
    newIndexOf = 0;
  }
  return playSceneFromLibrary(state, displayed[newIndexOf], displayed);
}

export function endPlaySceneFromLibrary(state: State): Object {
  const librarySource = getLibrarySource(state);
  state.scenes.pop();
  const tagNames = state.tags.map((t: Tag) => t.name);
  // Re-order the tags of the source we were playing
  librarySource.tags = librarySource.tags.sort((a: Tag, b: Tag) => {
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
  state.route.pop();
  state.route.pop();
  return {route: state.route.slice(0), scenes: state.scenes.slice(0)};
}

export function manageTags(state: State): Object {
  return {route: state.route.concat(new Route({kind: 'tags', value: null}))};
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
  return {route: state.route.concat(new Route({kind: 'scene', value: getActiveScene(state).id}))};
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

export function blacklistFile(state: State, sourceURL: string, fileToBlacklist: string): Object {
  const newLibrary = state.library;
  const newScenes = state.scenes;
  const source = newLibrary.find((s) => s.url == sourceURL);
  if (source) {
    if (source.blacklist === undefined || fileToBlacklist == null) source.blacklist = [];
    if (fileToBlacklist != null) {
      source.blacklist.push(fileToBlacklist);
    }
  }
  for (let scene of newScenes) {
    const sceneSource = scene.sources.find((s) => s.url == sourceURL);
    if (sceneSource) {
      if (sceneSource.blacklist === undefined || fileToBlacklist == null) sceneSource.blacklist = [];
      if (fileToBlacklist != null) {
        sceneSource.blacklist.push(fileToBlacklist);
      }
    }
  }
  if (fileToBlacklist != null) {
    const cachePath = getCachePath(sourceURL, state.config) + getFileName(fileToBlacklist);
    if (fs.existsSync(cachePath)) {
      fs.unlink(cachePath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  }
  return {library: newLibrary, scenes: newScenes};
}

export function setCount(state: State, sourceURL: string, count: number, countComplete: boolean): Object {
  const newLibrary = state.library;
  const newScenes = state.scenes;
  const source = newLibrary.find((s) => s.url == sourceURL);
  if (source) {
    if (source.count === undefined) source.count = 0;
    if (source.countComplete === undefined) source.countComplete = false;
    if (countComplete) {
      source.count = count;
      source.countComplete = true;
    } else if (count > source.count) {
      source.count = count;
    }
  }
  for (let scene of newScenes) {
    const sceneSource = scene.sources.find((s) => s.url == sourceURL);
    if (sceneSource) {
      if (sceneSource.count === undefined) sceneSource.count = 0;
      if (sceneSource.countComplete === undefined) sceneSource.countComplete = false;
      if (countComplete) {
        sceneSource.count = count;
        sceneSource.countComplete = true;
      } else if (count > sceneSource.count) {
        sceneSource.count = count;
      }
    }
  }
  return {library: newLibrary, scenes: newScenes};
}

// TODO Make sure tags are properly ordered when navigating with [ ]
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
          t.phraseString = tag.phraseString;
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

export function batchTag(state: State, isBatchTag: boolean): Object {
  return {isBatchTag: isBatchTag};
}

export function toggleTag(state: State, sourceID: number, tag: Tag): Object {
  const newLibrary = state.library;
  const newScenes = state.scenes;
  const source = newLibrary.find((s) => s.id == sourceID);
  if (source) {
    if (source.tags.map((t: Tag) => t.name).includes(tag.name)) {
      source.tags = source.tags.filter((t: Tag) => t.name != tag.name);
    } else {
      source.tags.push(tag);
    }
    for (let scene of newScenes) {
      const sceneSource = scene.sources.find((s) => s.url == source.url);
      if (sceneSource) {
        sceneSource.tags = source.tags;
      }
    }
  }
  return {library: newLibrary, scenes: newScenes};
}

export function setupGrid(state: State, scene: Scene) {
  return {route: state.route.concat([new Route({kind: 'grid', value: scene.id})])};
}

export function onUpdateGrid(state: State, grid: Array<Array<number>>): Object {
  const newScenes = state.scenes;
  const scene = newScenes.find((s) => s.id == getActiveScene(state).id);
  scene.grid = grid;
  const newRoute = state.route;
  newRoute.pop();
  return {scenes: newScenes, route: newRoute};
}

export function exportScene(state: State, scene: Scene): Object {
  const scenesToExport = Array<Scene>();
  const sceneCopy = JSON.parse(JSON.stringify(scene)); // Make a copy
  sceneCopy.tagWeights = null;
  sceneCopy.sceneWeights = null;
  scenesToExport.push(sceneCopy);
  const removeO = Array<number>();
  for (let o of scene.overlays) {
    const overlay = state.scenes.find((s) => s.id == o.sceneID);
    if (overlay == null) {
      removeO.push(o.id);
    } else {
      const overlayCopy = JSON.parse(JSON.stringify(overlay)); // Make a copy
      overlayCopy.tagWeights = null;
      overlayCopy.sceneWeights = null;
      overlayCopy.overlays = null;
      scenesToExport.push(overlayCopy);
    }
  }
  sceneCopy.overlays = sceneCopy.overlays.filter((o: any) => !removeO.includes(o.id));
  const sceneExport = JSON.stringify(scenesToExport);
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
  const addToLibrary = confirm("Would you also like to import this Scene's sources into your Library?");
  let newScenes = state.scenes;
  let sources = Array<LibrarySource>();
  const importScenes = JSON.parse(fs.readFileSync(filePath[0], 'utf-8'));

  const scene = new Scene(importScenes[0]);
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  scene.id = id;
  newScenes = newScenes.concat([scene]);
  if (addToLibrary) {
    sources = sources.concat(scene.sources);
  }

  const overlays = new Map<number, number>();
  if (scene.overlays) {
    for (let o of scene.overlays) {
      if (overlays.has(o.sceneID)) {
        o.id = overlays.get(o.sceneID);
      } else {
        const sID = o.sceneID;
        o.sceneID = ++id;
        overlays.set(sID, o.sceneID);
      }
    }
  }
  if (overlays.size > 0) {
    for (let i=1; i < importScenes.length; i++) {
      const scene = new Scene(importScenes[i]);
      scene.id = overlays.get(scene.id);
      newScenes = newScenes.concat([scene]);
      if (addToLibrary) {
        sources = sources.concat(scene.sources);
      }
    }
  }

  if (addToLibrary) {
    const sourceURLs = sources.map((s) => s.url);
    id = state.library.length + 1;
    for (let source of state.library) {
      id = Math.max(source.id+1, id);
      let indexOf = sourceURLs.indexOf(source.url);
      if (indexOf >= 0) {
        while (indexOf >= 0) {
          sources.splice(indexOf, 1);
          sourceURLs.splice(indexOf, 1);
          indexOf = sourceURLs.indexOf(source.url);
        }
      }
    }
    if (sources.length > 0) {
      alert("Added " + sources.length + " new sources to the Library");
      return {scenes: newScenes, library: state.library.concat(sources), route: [new Route({kind: 'scene', value: scene.id})]};
    } else {
      alert("No new sources detected");
    }
  }
  return {scenes: newScenes, route: [new Route({kind: 'scene', value: scene.id})]};
}

export function exportLibrary(state: State): Object {
  const libraryExport = JSON.stringify(state.library);
  const fileName = "library_export-" + new Date().getTime() + ".json";
  remote.dialog.showSaveDialog(remote.getCurrentWindow(),
    {filters: [{name: 'JSON Document', extensions: ['json']}], defaultPath: fileName}, (filePath) => {
      if (filePath != null) {
        fs.writeFileSync(filePath, libraryExport);
      }
    });
  return {};
}

export function importLibrary(state: State, backup:Function): Object {
  const filePath = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
    {filters: [{name:'All Files (*.*)', extensions: ['*']},{name: 'JSON Document', extensions: ['json']}], properties: ['openFile']});
  if (!filePath || !filePath.length) return;
  if (!backup(false)) { // If backup fails, prompt user to continue
    if (!confirm("Backup failed. Continue anyway?")) {
      return;
    }
  }
  const libraryImport = JSON.parse(fs.readFileSync(filePath[0], 'utf-8'));
  const newLibrary = Array.from(state.library);
  const newTags = Array.from(state.tags);
  const myLibrary = newLibrary.map((s) => s.url);
  const myTags = newTags.map((t) => t.name);
  let tagID = newTags.length + 1;
  newTags.forEach((t) => {tagID = Math.max(t.id + 1, tagID);});
  let sourceID = newLibrary.length + 1;
  for (let source of libraryImport) {
    if (source.tags) {
      for (let tag of source.tags) { // Make sure we have all of these tags
        if (!myTags.includes(tag.name)) { // Add tags we don't have yet
          tag.id = tagID++;
          newTags.push(tag);
          myTags.push(tag.name);
        } else {
          tag.id = newTags.find((t) => t.name == tag.name).id; // Map tags we already have
        }
      }
    } else {
      source.tags = new Array<Tag>();
    }

    const indexOf = myLibrary.indexOf(source.url);
    if (indexOf === -1) { // Add sources we don't have yet
      source.id = sourceID++;
      newLibrary.push(source);
      myLibrary.push(source.url);
    } else { // If this source is untagged, add imported tags
      const librarySource = newLibrary[indexOf];
      if (librarySource.tags.length == 0) {
        librarySource.tags = source.tags;
      }
    }
  }

  alert("Import complete!");
  return {library: newLibrary, tags: newTags};
}