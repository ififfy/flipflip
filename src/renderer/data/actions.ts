import {remote, webFrame} from "electron";
import * as fs from "fs";
import path, {sep} from 'path';
import wretch from "wretch";
import {existsSync} from "fs";
import {outputFile} from "fs-extra";
import getFolderSize from "get-folder-size";
import tumblr, {TumblrClient} from "tumblr.js";
import Snoowrap from "snoowrap";
import Twitter from "twitter";
import {IgApiClient} from "instagram-private-api";

import {
  getBackups,
  getCachePath,
  getFileGroup,
  getFileName,
  getRandomIndex,
  getSourceType,
  isVideo,
  saveDir
} from "./utils";
import {AF, GT, PR, SF, ST, TT} from "./const";
import { defaultInitialState } from './AppStorage';
import { Route } from "./Route";
import Scene from "./Scene";
import Config from "./Config";
import LibrarySource from "../components/library/LibrarySource";
import Tag from "../components/library/Tag";
import Clip from "../components/library/Clip";
import Overlay from "../components/library/Overlay";

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
    if (r.kind == 'scene' || r.kind == 'grid') {
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
      isBatchTag: data.isBatchTag,
      config: new Config(data.config),
      scenes: data.scenes.map((s: any) => new Scene(s)),
      library: data.library.map((s: any) => new LibrarySource(s)),
      tags: data.tags.map((t: any) => new Tag(t)),
      route: data.route.map((s: any) => new Route(s)),
      libraryYOffset: 0,
      libraryFilters: Array<string>(),
      librarySelected: Array<string>(),
      progressMode: null as string,
      progressTitle: null as string,
      progressCurrent: 0,
      progressTotal: 0,
      progressNext: null as string,
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

export function saveScene(state: State, scene: Scene): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  const sceneCopy = JSON.parse(JSON.stringify(scene)); // Make a copy
  sceneCopy.generatorWeights = null;
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
  const newScenes = state.scenes.filter((s: Scene) => s.id != scene.id);
  for (let s of newScenes) {
    s.overlays = s.overlays.filter((o) => o.sceneID != scene.id);
    // TODO Fix this
    /*for (let row of s.grid) {
      if (row.find((id: any) => parseInt(id) == scene.id) != null) {
        s.grid = [[]];
        break;
      }
    }*/
  }
  return {
    scenes: newScenes,
    route: Array<Route>(),
    autoEdit: false,
    isSeleft: false,
  };
}

export function nextScene(state: State): Object {
  const scene = getActiveScene(state);
  if (scene && scene.nextSceneID !== 0){
    const nextScene = state.scenes.find((s: Scene) => s.id == scene.nextSceneID);
    if (nextScene != null) {
      return {
        route: [new Route({kind: 'scene', value: nextScene.id}), new Route({kind: 'play', value: nextScene.id})],
      };
    }
  }
}

export function startFromScene(state: State, sceneName: string) {
  const scene = state.scenes.find((s: Scene) => s.name == sceneName);
  if (scene) {
    if (scene.sources.length > 0) {
      return {
        route: [new Route({kind: 'scene', value: scene.id}), new Route({kind: 'play', value: scene.id})],
      };
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
  return {route: [new Route({kind: 'scene', value: scene.id})]};
}

export function openLibrary(state: State): Object {
  return {route: [new Route({kind: 'library', value: null})]};
}

export function openLibraryImport(state: State): Object {
  return {route: state.route.concat(new Route({kind: 'library', value: null})), isSelect: true, librarySelected: []};
}

export function importFromLibrary(state: State, sources: Array<LibrarySource>): Object {
  const scene = getActiveScene(state);
  const sceneSources = addSources(scene.sources, sources.map((s) => s.url));
  return {...updateScene(state, getActiveScene(state), (s: Scene) => {s.sources = sceneSources}), ...goBack(state)};
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
  const librarySource = getLibrarySource(state);
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
    generatorWeights: [],
    ...state.config.defaultScene,
  });
  return {
    scenes: state.scenes.concat([scene]),
    route: [new Route({kind: 'scene', value: scene.id})],
    autoEdit: true
  };
}

function reduceList(sources: Array<LibrarySource>, limit: number): Array<LibrarySource> {
  while (sources.length > limit) {
    sources.splice(getRandomIndex(sources), 1);
  }
  return sources;
}

function shuffle(array: Array<any>) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function generateScene(state: State, scene: Scene): Object {
  const newScene = state.scenes.find((s) => s.id == scene.id);

  // Record all the groups we're requiring/excluding
  const allTags = newScene.generatorWeights.filter((wg) => wg.type == TT.all && !wg.rules).map((wg) => wg.tag);
  const noneTags = newScene.generatorWeights.filter((wg) => wg.type == TT.none && !wg.rules).map((wg) => wg.tag);
  let reqAdvSources: Array<LibrarySource> = null;
  let excAdvSources: Array<LibrarySource> = null;

  // Build list of sources
  let genSources = new Array<LibrarySource>();

  // First, build all our adv rules
  for (let wg of newScene.generatorWeights) {
    if (wg.rules) {
      // Build this adv rule like a regular set of simple rules
      // First get tags to require/exclude
      const allTags = wg.rules.filter((wg) => wg.type == TT.all).map((wg) => wg.tag);
      const noneTags = wg.rules.filter((wg) => wg.type == TT.none).map((wg) => wg.tag);

      let rulesSources = new Array<LibrarySource>();
      // If we don't have any weights, calculate by just require/exclude
      if (allTags.length + noneTags.length == wg.rules.length) {
        const sources = state.library.filter((s) => {
          for (let at of allTags) {
            if (!s.tags.find((t) => t.id == at.id)) {
              return false;
            }
          }
          for (let nt of noneTags) {
            if (s.tags.find((t) => t.id == nt.id)) {
              return false;
            }
          }
          return true;
        });
        rulesSources = reduceList(sources, Math.round(newScene.generatorMax));
      } else {
        // Otherwise, generate sources for each weighted rule
        for (let rule of wg.rules) {
          if (rule.type == TT.weight) {
            const sources = state.library.filter((s) => {
              if (!s.tags.find((t) => t.id == rule.tag.id)) {
                return false;
              }
              for (let at of allTags) {
                if (!s.tags.find((t) => t.id == at.id)) {
                  return false;
                }
              }
              for (let nt of noneTags) {
                if (s.tags.find((t) => t.id == nt.id)) {
                  return false;
                }
              }
              return true;
            });
            rulesSources = rulesSources.concat(reduceList(sources, Math.round(newScene.generatorMax * (rule.percent / 100))));
          }
        }
      }
      switch (wg.type) {
        // If this adv rule is weighted, add the percentage of sources to the master list
        case TT.weight:
          genSources = genSources.concat(reduceList(rulesSources, Math.round(newScene.generatorMax * (wg.percent / 100))));
          break;
        // If this adv rule is all, add the sources to the require list
        case TT.all:
          if (!reqAdvSources) {
            reqAdvSources = rulesSources;
          } else {
            reqAdvSources = reqAdvSources.filter((s) => !!rulesSources.find((source) => source.url == s.url));
          }
          break;
        // If this adv rule is none, add the sources to the excl list
        case TT.none:
          if (!excAdvSources) {
            excAdvSources = rulesSources;
          } else {
            excAdvSources = excAdvSources.concat(rulesSources);
          }
          break;
      }
    }
  }

  // Now, build our simple rules
  // If we don't have any weights, calculate by just require/exclude
  if (allTags.length + noneTags.length == newScene.generatorWeights.length) {
    const sources = state.library.filter((s) => {
      if (reqAdvSources && !reqAdvSources.find((source) => source.id == s.id)) {
        return false;
      }
      if (excAdvSources && !excAdvSources.find((source) => source.id == s.id)) {
        return false;
      }

      for (let at of allTags) {
        if (!s.tags.find((t) => t.id == at.id)) {
          return false;
        }
      }
      for (let nt of noneTags) {
        if (s.tags.find((t) => t.id == nt.id)) {
          return false;
        }
      }
      return true;
    });
    genSources = reduceList(sources, Math.round(newScene.generatorMax));
  } else {
    // Otherwise, generate sources for each weight
    for (let wg of newScene.generatorWeights) {
      if (wg.rules) continue;
      if (wg.type == TT.weight) {
        const sources = state.library.filter((s) => {
          if (!s.tags.find((t) => t.id == wg.tag.id)) {
            return false;
          }
          if (reqAdvSources && !reqAdvSources.find((source) => source.id == s.id)) {
            return false;
          }
          if (excAdvSources && !excAdvSources.find((source) => source.id == s.id)) {
            return false;
          }

          for (let at of allTags) {
            if (!s.tags.find((t) => t.id == at.id)) {
              return false;
            }
          }
          for (let nt of noneTags) {
            if (s.tags.find((t) => t.id == nt.id)) {
              return false;
            }
          }
          return true;
        });
        genSources = genSources.concat(reduceList(sources, Math.round(newScene.generatorMax * (wg.percent / 100))));
      }
    }
  }
  genSources = shuffle(genSources);
  return updateScene(state, scene, (s) => s.sources = genSources);
}

export function updateScene(state: State, scene: Scene, fn: (scene: Scene) => void): Object {
  const newScenes = Array<Scene>();
  for (let s of state.scenes) {
    if (s.id == scene.id) {
      const sceneCopy = JSON.parse(JSON.stringify(s));
      fn(sceneCopy);
      newScenes.push(sceneCopy);
    } else {
      newScenes.push(s);
    }
  }
  return {scenes: newScenes};
}

export function replaceScenes(state: State, scenes: Array<Scene>): Object {
  return {scenes: scenes};
}

export function replaceLibrary(state: State, library: Array<LibrarySource>): Object {
  return {library: library};
}

export function clearBlacklist(state: State, sourceURL: string): Object {
  return blacklistFile(state, sourceURL, null);
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

export function batchTag(state: State): Object {
  return {isBatchTag: !state.isBatchTag};
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
      source.tags[source.tags.length - 1].phraseString = "";
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

export function addSource(state: State, scene: Scene, type: string, ...args: any[]): Object {
  let newSources = scene != null ? scene.sources : state.library;
  switch (type) {
    case AF.library:
      return openLibraryImport(state);

    case AF.url:
      newSources = addSources(newSources, [""]);
      break;

    case AF.directory:
      let dResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory', 'multiSelections']});
      if (!dResult) return;
      newSources = addSources(newSources, dResult);
      break;

    case AF.videos:
      let vResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
        {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'MP4', extensions: ['mp4']}, {name: 'MKV', extensions: ['mkv']}, {name: 'WebM', extensions: ['webm']}, {name: 'OGG', extensions: ['ogv']}], properties: ['openFile', 'multiSelections']});
      if (!vResult) return;
      vResult = vResult.filter((r) => isVideo(r, true));
      newSources = addSources(newSources, vResult);
      break;

    case GT.local:
      if (!args || args.length < 2) {
        return;
      }
      let rootDir = args[1];
      if (!rootDir.endsWith(sep)) {
        rootDir += sep;
      }
      newSources = addSources(newSources, getImportURLs(args[0], rootDir));
      break;

    case GT.tumblr:
      if (!args || args.length < 1) {
        return;
      }
      newSources = addSources(newSources, getImportURLs(args[0]));
      break;
  }
  if (scene != null) {
    const newScenes = state.scenes;
    const thisScene = newScenes.find((s) => s.id == scene.id);
    thisScene.sources = newSources;
    if (args) {
      let importURL = args[0];
      if (importURL.includes("pastebinId=")) {
        importURL = importURL.substring(importURL.indexOf("pastebinId=") + 11);

        if (importURL.includes("&")) {
          importURL = importURL.substring(0, importURL.indexOf("&"));
        }

        // Update hastebin URL (if present)
        thisScene.textSource = "https://hastebin.com/raw/" + importURL;
      }
    }
    return {scenes: newScenes};
  } else {
    return {library: newSources};
  }
}

function getImportURLs(importURL: string, rootDir?: string): string[]  {
  if (importURL.includes("sources=")) {
    // Remove everything before "sources="
    importURL = importURL.substring(importURL.indexOf("sources=") + 8);

    if (importURL.includes("&")) {
      // Remove everything after the sources parameter
      importURL = importURL.substring(0, importURL.indexOf("&"));
    }

    // Split into blog names
    let importURLs = importURL.split("%20");
    for (let u = 0; u < importURLs.length; u++) {
      let fullPath;
      if (rootDir) {
        fullPath = rootDir + importURLs[u];
      } else {
        fullPath = "http://" + importURLs[u] + ".tumblr.com";
      }
      if (importURLs.includes(fullPath) || importURLs[u] === sep || importURLs[u] === "") {
        // Remove index and push u back
        importURLs.splice(u, 1);
        u -= 1
      } else {
        importURLs[u] = fullPath;
      }
    }
    return importURLs;
  }
  return [];
}


function addSources(originalSources: Array<LibrarySource>, newSources: Array<string>): Array<LibrarySource> {
  // dedup
  let sourceURLs = originalSources.map((s) => s.url);
  newSources = newSources.filter((s) => !sourceURLs.includes(s));

  let id = originalSources.length + 1;
  originalSources.forEach((s) => {
    id = Math.max(s.id + 1, id);
  });

  let combinedSources = Array.from(originalSources);
  for (let url of newSources) {
    combinedSources.unshift(new LibrarySource({
      url: url,
      id: id,
      tags: new Array<Tag>(),
    }));
    id += 1;
  }
  return combinedSources;
}

export function sortScene(state: State, algorithm: string, ascending: boolean): Object {
  const getName = (a: Scene) => {
    return a.name.toLowerCase();
  };
  const getCount = (a: Scene) => {
    return a.sources.length;
  };
  const getType = (a: Scene) => {
    if (a.generatorWeights) {
      return "1";
    }
    return "0";
  };
  const newScenes = state.scenes.sort(
    sortFunction(algorithm, ascending, getName, null, getCount, getType,
      algorithm == SF.type ? SF.alpha : null));
  return {scenes: newScenes}
}

export function sortSources(state: State, scene: Scene, algorithm: string, ascending: boolean): Object {
  const getName = (a: LibrarySource) => {
    return getSourceType(a.url) == ST.video ? getFileName(a.url).toLowerCase() : getFileGroup(a.url).toLowerCase();
  };
  const getFullName = (a: LibrarySource) => {
    return a.url.toLowerCase();
  };
  const getCount = (a: LibrarySource) => {
    if (a.count === undefined) a.count = 0;
    if (a.countComplete === undefined) a.countComplete = false;
    return a.count;
  };
  const getType = (a: LibrarySource) => {
    return getSourceType(a.url)
  };
  let secondary = null;
  if (algorithm == SF.alpha) {
    secondary = SF.type;
  }
  if (algorithm == SF.type) {
    secondary = SF.alpha;
  }
  if (scene != null) {
    const newScenes = state.scenes;
    const thisScene = newScenes.find((s) => s.id == scene.id);
    thisScene.sources = thisScene.sources.sort(
      sortFunction(algorithm, ascending, getName, getFullName, getCount, getType, secondary));
    return {scenes: newScenes};
  } else {
    const newLibrary = state.library.sort(
      sortFunction(algorithm, ascending, getName, getFullName, getCount, getType, secondary));
    return {library: newLibrary};
  }
}

export function sortTags(state: State, algorithm: string, ascending: boolean): Object {
  const getName = (a: Tag) => {
    return a.name.toLowerCase();
  };
  const newTags = state.tags.sort(
    sortFunction(algorithm, ascending, getName, null, null, null, null));
  return {tags: newTags}
}

function sortFunction(algorithm: string, ascending: boolean, getName: (a: any) => string,
                      getFullName: (a: any) => string, getCount: (a: any) => number,
                      getType: (a: any) => string, secondary: string): (a: any, b: any) => number {
  return (a, b) => {
    let aValue: any, bValue: any;
    switch (algorithm) {
      case SF.alpha:
        aValue = getName(a);
        bValue = getName(b);
        break;
      case SF.alphaFull:
        aValue = getFullName(a);
        bValue = getFullName(b);
        break;
      case SF.date:
        aValue = a.id;
        bValue = b.id;
        break;
      case SF.count:
        aValue = getCount(a);
        bValue = getCount(b);
        break;
      case SF.type:
        aValue = getType(a);
        bValue = getType(b);
        break;
      default:
        aValue = "";
        bValue = "";
    }
    if (aValue < bValue) {
      return ascending ? -1 : 1;
    } else if (aValue > bValue) {
      return ascending ? 1 : -1;
    } else {
      if (secondary) {
        return sortFunction(secondary, true, getName, getFullName, getCount, getType, null)(a, b);
      } else {
        return 0;
      }
    }
  }
}

export function exportScene(state: State, scene: Scene): Object {
  const scenesToExport = Array<Scene>();
  const sceneCopy = JSON.parse(JSON.stringify(scene)); // Make a copy
  sceneCopy.generatorWeights = null;
  sceneCopy.overlays = sceneCopy.overlays.filter((o: Overlay) => o.sceneID != 0);
  scenesToExport.push(sceneCopy);

  if (sceneCopy.gridView) {
    sceneCopy.overlays = [];
    // Add grid
    for (let row of sceneCopy.grid) {
      for (let g of row) {
        const grid = state.scenes.find((s) => s.id == g);
        if (grid && !scenesToExport.find((s) => s.id == g)) {
          const gridCopy = JSON.parse(JSON.stringify(grid)); // Make a copy
          gridCopy.generatorWeights = null;
          gridCopy.overlays = [];
          gridCopy.grid = [[]];
          scenesToExport.push(gridCopy);
        }
      }
    }
  } else {
    sceneCopy.grid = [[]];
    // Add overlays
    for (let o of sceneCopy.overlays) {
      const overlay = state.scenes.find((s) => s.id == o.sceneID);
      if (overlay && !scenesToExport.find((s) => s.id == o.sceneID)) {
        const overlayCopy = JSON.parse(JSON.stringify(overlay)); // Make a copy
        overlayCopy.generatorWeights = null;
        overlayCopy.overlays = [];
        overlayCopy.grid = [[]];
        scenesToExport.push(overlayCopy);
      }
    }
  }

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
  const importScenes = JSON.parse(fs.readFileSync(filePath[0], 'utf-8'));
  if (!importScenes[0].id || !importScenes[0].name || !importScenes[0].sources) {
    alert("Not a valid scene file");
    return {};
  }
  const addToLibrary = confirm("Would you also like to import this Scene's sources into your Library?");
  let newScenes = state.scenes;
  let sources = Array<LibrarySource>();

  const scene = new Scene(importScenes[0]);
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  const newSceneMap = new Map<number, number>();
  newSceneMap.set(scene.id, id);
  scene.id = id;

  newScenes = newScenes.concat([scene]);
  if (addToLibrary) {
    sources = sources.concat(scene.sources);
  }
  if (scene.overlays) {
    for (let o of scene.overlays) {
      const sID = parseInt(o.sceneID as any);
      if (newSceneMap.has(sID)) {
        o.sceneID = newSceneMap.get(sID);
      } else {
        o.sceneID = ++id;
        newSceneMap.set(sID, o.sceneID);
      }
    }
  }
  if (scene.grid) {
    for (let r=0; r < scene.grid.length; r++) {
      for (let g=0; g < scene.grid[r].length; g++) {
        const sID = parseInt(scene.grid[r][g] as any);
        if (newSceneMap.has(sID)) {
          scene.grid[r][g] = newSceneMap.get(sID);
        } else {
          scene.grid[r][g] = ++id;
          newSceneMap.set(sID, scene.grid[r][g]);
        }
      }
    }
  }
  if (newSceneMap.size > 0) {
    for (let i=1; i < importScenes.length; i++) {
      const scene = new Scene(importScenes[i]);
      scene.id = newSceneMap.get(scene.id);
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

export function importLibrary(state: State, backup: Function): Object {
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
  newLibrary.forEach((s) => {sourceID = Math.max(s.id + 1, sourceID);});
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
    } else {
      // If this source is untagged, add imported tags
      const librarySource = newLibrary[indexOf];
      if (librarySource.tags.length == 0) {
        librarySource.tags = source.tags;
      }
      // Add new blacklist urls
      librarySource.blacklist = librarySource.blacklist.concat(source.blacklist.filter((url: string) => !librarySource.blacklist.includes(url)));
      // Add new clips
      if (source.clips) {
        let newID = source.clips.length + 1;
        for (let clip of source.clips) {
          let found = false;
          if (librarySource.clips) {
            for (let lClip of librarySource.clips) {
              if (clip.start == lClip.start && clip.end == lClip.end) {
                found = true;
                break;
              }
            }
          }
          if (!found) {
            clip.id = newID++;
            librarySource.clips = librarySource.clips.concat([clip]);
          }
        }
      }
    }
  }

  alert("Import complete!");
  return {library: newLibrary, tags: newTags};
}

export function setMode(state: State, mode: string): Object {
  return {progressMode: mode};
}

export function markOffline(getState: () => State, setState: Function) {
  const offlineLoop = () => {
    const state = getState();
    const offset = state.progressCurrent;
    if (state.progressMode == PR.cancel) {
      setState({progressMode: null, progressCurrent: 0, progressTotal: 0, progressTitle: ""});
    } else if (state.library.length == offset) {
      setState({progressMode: null, progressCurrent: 0, progressTotal: 0, progressTitle: ""});
      alert("Offline Check has completed. Remote sources not available are now marked in red.");
    } else if (state.library[offset].url.startsWith("http://") ||
      state.library[offset].url.startsWith("https://")) {
      state.progressTitle = state.library[offset].url;
      setState({progressTitle: state.progressTitle});
      const lastCheck = state.library[offset].lastCheck;
      if (lastCheck != null) {
        // If this link was checked within the last week, skip
        if (new Date().getTime() - new Date(lastCheck).getTime() < 604800000) {
          state.progressCurrent = offset + 1;
          setState({progressCurrent: state.progressCurrent});
          setTimeout(offlineLoop, 100);
          return;
        }
      }

      state.library[offset].lastCheck = new Date();
      wretch(state.library[offset].url)
        .get()
        .notFound((res) => {
          state.library[offset].offline = true;
          state.progressCurrent = offset + 1;
          setState({progressCurrent: state.progressCurrent});
          setTimeout(offlineLoop, 1000);
        })
        .res((res) => {
          state.library[offset].offline = false;
          state.progressCurrent = offset + 1;
          setState({progressCurrent: state.progressCurrent});
          setTimeout(offlineLoop, 1000);
        })
        .catch((e) => {
          console.error(e);
          state.library[offset].lastCheck = null;
          state.progressCurrent = offset + 1;
          setState({progressCurrent: state.progressCurrent});
          setTimeout(offlineLoop, 100);
        });
    } else {
      state.progressTitle = state.library[offset].url;
      state.progressCurrent = offset + 1;
      setState({progressTitle: state.progressTitle, progressCurrent: state.progressCurrent});
      state.library[offset].lastCheck = new Date();
      const exists = existsSync(state.library[offset].url);
      if (!exists) {
        state.library[offset].offline = true;
      }
      setTimeout(offlineLoop, 100);
    }
  };

  // If we don't have an import running
  const state = getState();
  if (!state.progressMode) {
    state.progressMode = PR.offline;
    state.progressCurrent = 0;
    state.progressTotal = state.library.length;
    setState({
      progressMode: state.progressMode,
      progressCurrent: state.progressCurrent,
      progressTotal: state.progressTotal,
    });
    offlineLoop();
  }
}

export function importTumblr(getState: () => State, setState: Function) {
  let client: TumblrClient;
  // Define our loop
  const tumblrImportLoop = () => {
    const state = getState();
    const offset = state.progressCurrent;
    if (state.progressMode == PR.cancel) {
      setState({progressMode: null, progressCurrent: 0, progressTotal: 0});
      return;
    }
    // Get the next page of blogs
    client.userFollowing({offset: offset}, (err, data) => {
      if (err) {
        alert("Error retrieving following: " + err);
        setState({progressMode: null, progressCurrent: 0, progressTotal: 0});
        console.error(err);
        return;
      }

      // Get the next 20 blogs
      let following = [];
      for (let blog of data.blogs) {
        const blogURL = "http://" + blog.name + ".tumblr.com/";
        following.push(blogURL);
      }

      // dedup
      let sourceURLs = state.library.map((s) => s.url);
      following = following.filter((b) => !sourceURLs.includes(b));

      let id = state.library.length + 1;
      state.library.forEach((s) => {
        id = Math.max(s.id + 1, id);
      });

      // Add to Library
      let newLibrary = state.library;
      for (let url of following) {
        newLibrary = newLibrary.concat([new LibrarySource({
          url: url,
          id: id,
          tags: new Array<Tag>(),
        })]);
        id += 1;
      }
      //this.props.onUpdateLibrary(newLibrary);

      let nextOffset = offset + 20;
      if (offset > state.progressTotal) {
        nextOffset = state.progressTotal;
      }

      // Update progress
      setState({progressCurrent: nextOffset});

      // Loop until we run out of blogs
      if ((nextOffset) < state.progressTotal) {
        setTimeout(tumblrImportLoop, 1500);
      } else {
        setState({progressMode: null, progressCurrent: 0, progressTotal: 0});
        alert("Tumblr Following Import has completed");
      }
    });
  };

  // If we don't have an import running
  const state = getState();
  if (!state.progressMode) {
    // Build our Tumblr client
    client = tumblr.createClient({
      consumer_key: state.config.remoteSettings.tumblrKey,
      consumer_secret: state.config.remoteSettings.tumblrSecret,
      token: state.config.remoteSettings.tumblrOAuthToken,
      token_secret: state.config.remoteSettings.tumblrOAuthTokenSecret,
    });

    // Make the first call just to check the total blogs
    client.userFollowing({limit: 0}, (err, data) => {
      if (err) {
        alert("Error retrieving following: " + err);
        console.error(err);
        return;
      }

      state.progressMode = PR.tumblr;
      state.progressCurrent = 0;
      state.progressTotal = data.total_blogs;
      setState({
        progressMode: state.progressMode,
        progressCurrent: state.progressCurrent,
        progressTotal: state.progressTotal,
      });
      tumblrImportLoop();
    });
  }
}

export function importReddit(getState: () => State, setState: Function) {
  let reddit: any;
  const redditImportLoop = () => {
    const state = getState();
    if (state.progressMode == PR.cancel) {
      setState({progressMode: null, progressNext: null, progressCurrent: 0});
      return;
    }
    reddit.getSubscriptions({limit: 20, after: state.progressNext}).then((subscriptionListing: any) => {
      if (subscriptionListing.length == 0) {
        setState({progressMode: null, progressNext: null, progressCurrent: 0});
        alert("Reddit Subscription Import has completed");
      } else {
        // Get the next 20 blogs
        let subscriptions = [];
        for (let sub of subscriptionListing) {
          const subURL = "http://www.reddit.com" + sub.url;
          subscriptions.push(subURL);
        }

        // dedup
        let sourceURLs = state.library.map((s) => s.url);
        subscriptions = subscriptions.filter((s) => !sourceURLs.includes(s));

        let id = state.library.length + 1;
        state.library.forEach((s) => {
          id = Math.max(s.id + 1, id);
        });

        // Add to Library
        let newLibrary = state.library;
        for (let url of subscriptions) {
          newLibrary = newLibrary.concat([new LibrarySource({
            url: url,
            id: id,
            tags: new Array<Tag>(),
          })]);
          id += 1;
        }
        //this.props.onUpdateLibrary(newLibrary);

        // Loop until we run out of blogs
        setTimeout(redditImportLoop, 1500);
        state.progressNext = subscriptionListing[subscriptionListing.length - 1].name;
        state.progressCurrent = state.progressCurrent + 1;
        setState({progressNext: state.progressNext, progressCurrent: state.progressCurrent});
      }
    }).catch((err: any) => {
      // If user is not authenticated for subscriptions, prompt to re-authenticate
      if (err.statusCode == 403) {
        alert("You have not authorized FlipFlip to work with Reddit subscriptions. Visit Preferences and authorize FlipFlip to work with Reddit.");
      } else {
        alert("Error retrieving subscriptions: " + err);
        console.error(err);
      }
      setState({progressMode: null, progressNext: null, progressCurrent: 0});
    });
  };

  const state = getState();
  if (!state.progressMode) {
    reddit = new Snoowrap({
      userAgent: state.config.remoteSettings.redditUserAgent,
      clientId: state.config.remoteSettings.redditClientID,
      clientSecret: "",
      refreshToken: state.config.remoteSettings.redditRefreshToken,
    });

    // Show progress bar and kick off loop
    alert("Your Reddit subscriptions are being imported... You will recieve an alert when the import is finished.");

    state.progressMode = PR.reddit;
    state.progressCurrent = 0;
    setState({progressMode: state.progressMode, progressCurrent: state.progressCurrent});
    redditImportLoop();
  }
}

export function importTwitter(getState: () => State, setState: Function) {
  let twitter: any;
  const twitterImportLoop = () => {
    const state = getState();
    if (state.progressMode == PR.cancel) {
      setState({progressMode: null, progressNext: null, progressCurrent: 0});
      return;
    }
    twitter.get('friends/list', !state.progressNext ? {count: 200} : {count: 200, cursor: state.progressNext}, (error: any, data: any) => {
      if (error) {
        alert("Error retrieving following: " + error);
        console.error(error);
        setState({progressMode: null, progressNext: null, progressCurrent: 0});
        return;
      }

      // Get the next 200 users
      let following = [];
      for (let user of data.users) {
        const userURL = "https://twitter.com/" + user.screen_name;
        following.push(userURL);
      }

      // dedup
      let sourceURLs = state.library.map((s) => s.url);
      following = following.filter((s) => !sourceURLs.includes(s));

      let id = state.library.length + 1;
      state.library.forEach((s) => {
        id = Math.max(s.id + 1, id);
      });

      // Add to Library
      let newLibrary = state.library;
      for (let url of following) {
        newLibrary = newLibrary.concat([new LibrarySource({
          url: url,
          id: id,
          tags: new Array<Tag>(),
        })]);
        id += 1;
      }
      //this.props.onUpdateLibrary(newLibrary);

      if (data.next_cursor == 0) { // We're done
        setState({progressMode: null, progressNext: null, progressCurrent: 0});
        alert("Twitter Following Import has completed");
      } else {
        // Loop until we run out of blogs
        setTimeout(twitterImportLoop, 1500);
        state.progressNext = data.next_cursor;
        state.progressCurrent = state.progressCurrent + 1;
        setState({progressNext: state.progressNext, progressCurrent: state.progressCurrent});
      }
    });
  };

  const state = getState();
  if (!state.progressMode) {
    twitter = new Twitter({
      consumer_key: state.config.remoteSettings.twitterConsumerKey,
      consumer_secret: state.config.remoteSettings.twitterConsumerSecret,
      access_token_key: state.config.remoteSettings.twitterAccessTokenKey,
      access_token_secret: state.config.remoteSettings.twitterAccessTokenSecret,
    });

    // Show progress bar and kick off loop
    alert("Your Twitter Following is being imported... You will recieve an alert when the import is finished.");

    state.progressMode = PR.twitter;
    state.progressCurrent = 0;
    setState({progressMode: state.progressMode, progressCurrent: state.progressCurrent});
    twitterImportLoop();
  }
}

let ig: IgApiClient = null;
let session: any = null;
export function importInstagram(getState: () => State, setState: Function) {
  const processItems = (items: any, next: any) => {
    let following = [];
    for (let account of items) {
      const accountURL = "https://www.instagram.com/" + account.username + "/";
      following.push(accountURL);
    }

    // dedup
    let sourceURLs = state.library.map((s) => s.url);
    following = following.filter((s) => !sourceURLs.includes(s));

    let id = state.library.length + 1;
    state.library.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    // Add to Library
    let newLibrary = state.library;
    for (let url of following) {
      newLibrary = newLibrary.concat([new LibrarySource({
        url: url,
        id: id,
        tags: new Array<Tag>(),
      })]);
      id += 1;
    }
    //this.props.onUpdateLibrary(newLibrary);

    // Loop until we run out of blogs
    setTimeout(instagramImportLoop, 1500);
    state.progressNext = next;
    state.progressCurrent = state.progressCurrent + 1;
    setState({progressNext: state.progressNext, progressCurrent: state.progressCurrent});
  };

  // Define our loop
  const instagramImportLoop = () => {
    const state = getState();
    if (state.progressMode == PR.cancel) {
      setState({progressMode: null, progressNext: null, progressCurrent: 0});
      return;
    }
    if (ig == null) {
      ig = new IgApiClient();
      ig.state.generateDevice(state.config.remoteSettings.instagramUsername);
      ig.account.login(state.config.remoteSettings.instagramUsername, state.config.remoteSettings.instagramPassword).then((loggedInUser) => {
        ig.state.serializeCookieJar().then((cookies) => {
          session = JSON.stringify(cookies);
          const followingFeed = ig.feed.accountFollowing(loggedInUser.pk);
          followingFeed.items().then((items) => {
            processItems(items, loggedInUser.pk + "~" + followingFeed.serialize());
          }).catch((e) => {console.error(e);ig = null;});
        }).catch((e) => {console.error(e);ig = null;});
      }).catch((e) => {alert(e);console.error(e);ig = null;});
    } else {
      ig.state.deserializeCookieJar(JSON.parse(session)).then((data) => {
        const id = (state.progressNext as string).split("~")[0];
        const feedSession = (state.progressNext as string).split("~")[1];
        const followingFeed = ig.feed.accountFollowing(id);
        followingFeed.deserialize(feedSession);
        if (!followingFeed.isMoreAvailable()) {
          setState({progressMode: null, progressNext: null, progressCurrent: 0});
          alert("Instagram Following Import has completed");
          return;
        }
        followingFeed.items().then((items) => {
          processItems(items, id + "~" + followingFeed.serialize());
        }).catch((e) => {console.error(e);ig = null;});
      }).catch((e) => {console.error(e);ig = null;});
    }
  };

  const state = getState();
  if (!state.progressMode) {
    // Show progress bar and kick off loop
    alert("Your Instagram Following is being imported... You will recieve an alert when the import is finished.");

    state.progressMode = PR.instagram;
    state.progressCurrent = 0;
    setState({progressMode: state.progressMode, progressCurrent: state.progressCurrent});
    instagramImportLoop();
  }
}