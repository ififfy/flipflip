import {IncomingMessage, remote, webFrame} from "electron";
import * as fs from "fs";
import path, {sep} from 'path';
import wretch from "wretch";
import {existsSync, readFileSync} from "fs";
import {outputFile} from "fs-extra";
import getFolderSize from "get-folder-size";
import tumblr, {TumblrClient} from "tumblr.js";
import Snoowrap from "snoowrap";
import Twitter from "twitter";
import {IgApiClient} from "instagram-private-api";
import {analyze} from "web-audio-beat-detector";
import * as mm from "music-metadata";
import request from "request";
import moment from "moment";

import {
  getBackups,
  getCachePath,
  getFilesRecursively,
  getRandomIndex,
  randomizeList,
  removeDuplicatesBy,
  saveDir, toArrayBuffer
} from "./utils";
import {getFileGroup, getFileName, getSourceType, isVideo, isVideoPlaylist} from "../components/player/Scrapers";
import defaultTheme from "./theme";
import {
  AF, ALT, ASF, BT, CST, DONE, GT, HTF, IF, IT, LT, OF, PR, PT, RP, SDGT, SDT, SF, SGT, SL, SLT, SOF, SP, SPT, ST, TF,
  TT, VCT, VTF
} from "./const";
import { defaultInitialState } from './AppStorage';
import { Route } from "./Route";
import en from "./en";
import Audio from "./Audio";
import Scene from "./Scene";
import Config from "./Config";
import Clip from "../data/Clip";
import LibrarySource from "../data/LibrarySource";
import Overlay from "../data/Overlay";
import Tag from "../data/Tag";
import SceneGrid from "./SceneGrid";
import Playlist from "./Playlist";
import CaptionScript from "./CaptionScript";

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
    if (r.kind == 'scene') {
      return state.scenes.find((s: Scene) => s.id === r.value);
    }
  }
  return null;
}

export function getActiveGrid(state: State): SceneGrid | null {
  for (let r of state.route.slice().reverse()) {
    if (r.kind == 'grid') {
      return state.grids.find((g: SceneGrid) => g.id === r.value);
    }
  }
  return null;
}

export function getActiveSource(state: State): LibrarySource | null {
  for (let r of state.route.slice().reverse()) {
    if (r.kind == 'clip') {
      return r.value;
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

// Returns the active audio source, or null if the current route isn't a audio source
export function getAudioSource(state: State): Audio | null {
  const activeScene = getActiveScene(state);
  if (activeScene == null) return null;
  return state.audios.find((a) => a.id == activeScene.libraryID);
}

// Returns the active script source, or null if the current route isn't a script source
export function getScriptSource(state: State): CaptionScript | null {
  const activeScene = getActiveScene(state);
  if (activeScene == null) return null;
  return state.scripts.find((s) => s.id == activeScene.libraryID);
}

export function getSelectScript(state: State): CaptionScript | null {
  return state.route[state.route.length - 1].value;
}

export function changeAudioRoute(state: State, aID: number): Object {
  const activeScene = getActiveScene(state);
  if (activeScene) {
    activeScene.libraryID = aID;
  }
  return {};
}

export function getTags(library: Array<LibrarySource>, source: string, clipID?: string): Array<Tag> {
  const librarySource = library.find((s) => s.url == source);
  if (librarySource) {
    if (clipID) {
      const clip = librarySource.clips.find((c) => c.id.toString() == clipID);
      if (clip) {
        if (clip.tags && clip.tags.length > 0) {
          return clip.tags;
        }
      }
    }
    return librarySource.tags;
  } else {
    return [];
  }
}

/** Actions **/
// All of these functions return object diffs that you can pass to ReactComponent.setState().
// The first argument is always a State object, even if it isn't used.

export function restoreFromBackup(state: State, backupFile: string): Object {
  const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
  return {
    version: data.version,
    specialMode: data.specialMode ? data.specialMode : null,
    openTab: data.openTab ? data.openTab : 0,
    displayedSources: Array<LibrarySource>(),
    config: new Config(data.config),
    scenes: data.scenes.map((s: any) => new Scene(s)),
    grids: data.grids ? data.grids.map((g: any) => new SceneGrid(g)) : Array<SceneGrid>(),
    audios: data.audios ? data.audios.map((a: any) => new Audio(a)) : Array <Audio>(),
    scripts: data.scripts ? data.scripts.map((a: any) => new CaptionScript(a)) : Array <CaptionScript>(),
    playlists: data.playlists ? data.playlists.map((p: any) => new Playlist(p)) : Array <Playlist>(),
    library: data.library.map((s: any) => new LibrarySource(s)),
    tags: data.tags.map((t: any) => new Tag(t)),
    route: data.route.map((s: any) => new Route(s)),
    libraryYOffset: 0,
    libraryFilters: Array<string>(),
    librarySelected: Array<string>(),
    audioOpenTab: data.audioOpenTab ? data.audioOpenTab : 3,
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
    systemSnack: null as string,
    tutorial: null as string,
    theme: data.theme ? data.theme : defaultTheme,
  };
}

export function changeThemeColor(state: State, colorTheme: any, primary: boolean): Object {
  const newTheme = JSON.parse(JSON.stringify(state.theme));
  if (primary) {
    newTheme.palette.primary = colorTheme;
    const type = newTheme.palette.type;
    if (type === "dark") {
      (newTheme.palette as any).background = {};
    } else if (type === "light") {
      (newTheme.palette as any).background = {default: colorTheme[50]};
    }
  } else {
    newTheme.palette.secondary = colorTheme;
  }
  return {theme: newTheme};
}

export function startTutorial(state: State): Object {
  if (state.config.tutorials.scenePicker == null) {
    return {tutorial: SPT.welcome}
  } else {
    return {}
  }
}

export function startVCTutorial(state: State): Object {
  if (state.config.tutorials.videoClipper == null) {
    return {tutorial: VCT.welcome}
  } else {
    return {}
  }
}

export function setTutorial(state: State, tutorial: string): Object {
  return {tutorial: tutorial};
}

export function skipTutorials(state: State): Object {
  const newConfig = state.config;
  newConfig.tutorials.scenePicker = DONE;
  newConfig.tutorials.sceneDetail = DONE;
  newConfig.tutorials.player = DONE;
  newConfig.tutorials.library = DONE;
  newConfig.tutorials.audios = DONE;
  newConfig.tutorials.scripts = DONE;
  newConfig.tutorials.scriptor = DONE;
  newConfig.tutorials.sceneGenerator = DONE;
  newConfig.tutorials.sceneGrid = DONE;
  newConfig.tutorials.videoClipper = DONE;
  return {config: newConfig, tutorial: null}
}

export function resetTutorials(state: State): Object {
  const newConfig = state.config;
  newConfig.tutorials.scenePicker = null;
  newConfig.tutorials.sceneDetail = null;
  newConfig.tutorials.player = null;
  newConfig.tutorials.library = null;
  newConfig.tutorials.audios = null;
  newConfig.tutorials.scripts = null;
  newConfig.tutorials.scriptor = null;
  newConfig.tutorials.sceneGenerator = null;
  newConfig.tutorials.sceneGrid = null;
  newConfig.tutorials.videoClipper = null;
  return {config: newConfig, tutorial: null}
}

export function doneTutorial(state: State, tutorial: string): Object {
  const newConfig = state.config;
  let newTutorial = state.tutorial;
  if (state.route.length == 0) {
    if (tutorial == SPT.add2) {
      newTutorial = null;
      state.config.tutorials.scenePicker = DONE;
    } else {
      state.config.tutorials.scenePicker = tutorial;
    }
  } else if (isRoute(state, 'scene')) {
    if (getActiveScene(state).generatorWeights) {
      if (tutorial == SDGT.final || tutorial == SDGT.finalError) {
        newTutorial = null;
        state.config.tutorials.sceneGenerator = DONE;
      } else {
        state.config.tutorials.sceneGenerator = tutorial;
      }
    } else {
      if (tutorial == SDT.play) {
        newTutorial = null;
        state.config.tutorials.sceneDetail = DONE;
      } else {
        state.config.tutorials.sceneDetail = tutorial;
      }
    }
  } else if (isRoute(state, 'play')) {
    if (tutorial == PT.final) {
      newTutorial = null;
      state.config.tutorials.player = DONE;
    } else {
      state.config.tutorials.player = tutorial;
    }
  } else if (isRoute(state, 'library')) {
    if (tutorial == LT.final) {
      newTutorial = null;
      state.config.tutorials.library = DONE;
    } else {
      state.config.tutorials.library = tutorial;
    }
  } else if (isRoute(state, 'audios')) {
    if (tutorial == ALT.final) {
      newTutorial = null;
      state.config.tutorials.audios = DONE;
    } else {
      state.config.tutorials.audios = tutorial;
    }
  } else if (isRoute(state, 'scripts')) {
    if (tutorial == SLT.final) {
      newTutorial = null;
      state.config.tutorials.scripts = DONE;
    } else {
      state.config.tutorials.scripts = tutorial;
    }
  } else if (isRoute(state, 'scriptor')) {
    if (tutorial == CST.final) {
      newTutorial = null;
      state.config.tutorials.scriptor = DONE;
    } else {
      state.config.tutorials.scriptor = tutorial;
    }
  } else if (isRoute(state, 'grid')) {
    if (tutorial == SGT.final) {
      newTutorial = null;
      state.config.tutorials.sceneGrid = DONE;
    } else {
      state.config.tutorials.sceneGrid = tutorial;
    }
  } else if (isRoute(state, 'clip')) {
    if (tutorial == VCT.final) {
      newTutorial = null;
      state.config.tutorials.videoClipper = DONE;
    } else {
      state.config.tutorials.videoClipper = tutorial;
    }
  }
  return {config: newConfig, tutorial: newTutorial};
}

export function toggleDarkMode(state: State): Object {
  const newTheme = state.theme;
  const type = newTheme.palette.type;
  if (type === "dark") {
    newTheme.palette.type = "light";
    (newTheme.palette as any).background = {default: newTheme.palette.primary[50]};
  } else if (type === "light") {
    newTheme.palette.type = "dark";
    (newTheme.palette as any).background = {};
  }
  return {theme: newTheme};
}

export function cleanBackups(config: Config) {
  let backups = getBackups();
  if (backups.length <= 1) return;
  if (config.generalSettings.autoCleanBackup) {
    let keepDays = [backups[0]], keepWeeks = [backups[0]], keepMonths = [backups[0]];

    const convertFromEpoch = (backupFile: string) => {
      const epochString = backupFile.substring(backupFile.lastIndexOf(".") + 1);
      return new Date(Number.parseInt(epochString));
    }

    for (let backup of backups) {
      let backupDate = convertFromEpoch(backup.url);
      let lastDay = convertFromEpoch(keepDays[keepDays.length - 1].url);
      let lastWeek = convertFromEpoch(keepWeeks[keepWeeks.length - 1].url);
      let lastMonth = convertFromEpoch(keepMonths[keepMonths.length - 1].url);

      if (moment(backupDate).isSame(lastDay, 'day')) {
        if (backupDate < lastDay) {
          keepDays[keepDays.length - 1]  = backup;
        }
      } else if (keepDays.length < config.generalSettings.autoCleanBackupDays) {
        keepDays.push(backup);
      }

      if (moment(backupDate).isSame(lastWeek, 'week')) {
        if (backupDate < lastWeek) {
          keepWeeks[keepWeeks.length - 1]  = backup;
        }
      } else if (keepWeeks.length < config.generalSettings.autoCleanBackupWeeks) {
        keepWeeks.push(backup);
      }

      if (moment(backupDate).isSame(lastMonth, 'month')) {
        if (backupDate < lastWeek) {
          keepMonths[keepMonths.length - 1]  = backup;
        }
      } else if (keepMonths.length < config.generalSettings.autoCleanBackupMonths) {
        keepMonths.push(backup);
      }
    }
    backups = backups.filter((b) => !keepDays.includes(b) && !keepWeeks.includes(b) && !keepMonths.includes(b));
  } else {
    for (let k = 0; k < config.generalSettings.cleanRetain; k++) {
      backups.shift(); // Keep the K newest backups
    }
  }
  for (let backup of backups) {
    fs.unlinkSync(saveDir + path.sep + backup.url);
  }
}

export function cacheImage(state: State, i: HTMLImageElement | HTMLVideoElement) {
  if (state.config.caching.enabled) {
    const fileType = getSourceType(i.src);
    if (fileType == ST.hydrus) return;

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
  console.log('------');
}

export function goBack(state: State): Object {
  const newRoute = state.route.slice(0, state.route.length - 1);
  return {route: newRoute, specialMode: null};
}

export function cloneScene(state: State, scene: Scene): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  const sceneCopy = JSON.parse(JSON.stringify(scene)); // Make a copy
  sceneCopy.id = id;
  return {
    scenes: state.scenes.concat([sceneCopy]),
    route: [new Route({kind: 'scene', value: sceneCopy.id})],
    specialMode: SP.autoEdit,
    systemSnack: "Clone successful!"
  };
}

export function saveScene(state: State, scene: Scene): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  const sceneCopy = JSON.parse(JSON.stringify(scene)); // Make a copy
  sceneCopy.generatorWeights = null;
  sceneCopy.id = id;
  sceneCopy.openTab = 3;
  return {
    scenes: state.scenes.concat([sceneCopy]),
    route: [new Route({kind: 'scene', value: sceneCopy.id})],
    specialMode: SP.autoEdit,
    systemSnack: "Save successful!"
  };
}

export function closeMessage(state: State): Object {
  return {systemMessage: null, systemSnack: null};
}

export function systemMessage(state: State, message: string): Object {
  return {systemMessage: message};
}

export function systemSnack(state: State, message: string): Object {
  return {systemSnack: message};
}

export function changeScenePickerTab(state: State, newTab: number): Object {
  return {openTab: newTab};
}

export function changeAudioLibraryTab(state: State, newTab: number): Object {
  return {audioOpenTab: newTab};
}

export function addScene(state: State): Object {
  const tutorial = state.config.tutorials.sceneDetail == null;
  let newTutorial = null;
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
  if (tutorial) {
    scene.name = "Cute Stuff";
    scene.timingFunction = TF.constant;
    scene.timingConstant = 1000;
    scene.nextSceneID = 0;
    scene.overlayEnabled = false;
    scene.imageTypeFilter = IF.any;
    scene.sourceOrderFunction = SOF.random;
    scene.orderFunction = OF.random;
    scene.zoom = false;
    scene.zoomStart = 1;
    scene.zoomEnd = 2;
    scene.transTF = TF.constant;
    scene.transSinRate = 97;
    scene.transDuration = 5000;
    scene.transDurationMin = 2000;
    scene.transDurationMax = 5000;
    scene.crossFade = false;
    scene.fadeTF = TF.constant;
    scene.fadeDuration = 500;
    scene.backgroundType = BT.blur;
    newTutorial = SDT.welcome;
  }
  return {
    scenes: state.scenes.concat([scene]),
    tutorial: newTutorial,
    route: [new Route({kind: 'scene', value: scene.id})],
    specialMode: !tutorial ? SP.autoEdit : null,
  };
}

export function deleteScenes(state: State, sceneIDs: Array<number>): Object {
  const deleteScenes = Array<number>();
  const deleteGrids = Array<number>();
  for (let sceneID of sceneIDs) {
    if (sceneID.toString().startsWith("999")) {
      const gridID = parseInt(sceneID.toString().replace("999", ""));
      deleteGrids.push(gridID);
    } else {
      deleteScenes.push(sceneID);
    }
  }

  const newScenes = state.scenes.filter((s: Scene) => !deleteScenes.includes(s.id));
  for (let s of newScenes) {
    if (deleteScenes.includes(s.nextSceneID)) {
      s.nextSceneID = 0;
    }
    s.nextSceneRandoms = s.nextSceneRandoms.filter((s) => !deleteScenes.includes(s));
    s.overlays = s.overlays.filter((o) => !deleteScenes.includes(o.sceneID) && (!o.sceneID.toString().startsWith("999") || !deleteGrids.includes(parseInt(o.sceneID.toString().replace("999", "")))));
  }
  const newGrids = state.grids.filter((g: SceneGrid) => !deleteGrids.includes(g.id));
  for (let g of newGrids) {
    for (let row of g.grid) {
      row = row.map((sceneID) => {
        if (deleteScenes.includes(sceneID)) {
          return -1;
        } else {
          return sceneID;
        }
      });
    }
  }
  return {
    scenes: newScenes,
    grids: newGrids,
    route: Array<Route>(),
    specialMode: null,
  };
}

export function deleteScene(state: State, scene: Scene): Object {
  const newScenes = state.scenes.filter((s: Scene) => s.id != scene.id);
  for (let s of newScenes) {
    if (s.nextSceneID == scene.id) {
      s.nextSceneID = 0;
    }
    s.nextSceneRandoms = s.nextSceneRandoms.filter((s) => s != scene.id);
    s.overlays = s.overlays.filter((o) => o.sceneID != scene.id);
  }
  const newGrids = state.grids;
  for (let g of newGrids) {
    for (let row of g.grid) {
      row = row.map((sceneID) => {
        if (sceneID == scene.id) {
          return -1;
        } else {
          return sceneID;
        }
      });
    }
  }
  return {
    scenes: newScenes,
    grids: newGrids,
    route: Array<Route>(),
    specialMode: null,
  };
}

export function deleteGrid(state: State, grid: SceneGrid): Object {
  const newGrids = state.grids.filter((g: SceneGrid) => g.id != grid.id);
  const newScenes = state.scenes;
  for (let s of newScenes) {
    s.overlays = s.overlays.filter((o) => o.sceneID != parseInt("999" + grid.id.toString()));
  }
  return {
    scenes: newScenes,
    grids: newGrids,
    route: Array<Route>(),
    specialMode: null,
  };
}

export function nextScene(state: State): Object {
  const scene = getActiveScene(state);
  if (scene && scene.nextSceneID !== 0){
    let nextScene;
    if (scene.nextSceneID == -1) {
      nextScene = state.scenes.find((s: Scene) => s.id == scene.nextSceneRandomID);
    } else {
      nextScene = state.scenes.find((s: Scene) => s.id == scene.nextSceneID);
    }
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

export function goToGrid(state: State, scene: Scene): Object {
  return {route: [new Route({kind: 'grid', value: scene.id})]};
}

export function openLibrary(state: State): Object {
  return {route: [new Route({kind: 'library', value: null})], tutorial: state.config.tutorials.library == null ? LT.welcome : null};
}

export function openAudios(state: State): Object {
  return {route: [new Route({kind: 'audios', value: null})], tutorial: state.config.tutorials.audios == null ? ALT.welcome : null};
}

export function openScripts(state: State): Object {
  return {route: [new Route({kind: 'scripts', value: null})], tutorial: state.config.tutorials.scripts == null ? SLT.welcome : null};
}

export function openScriptor(state: State): Object {
  const testScript = "setBlinkDuration 300\n" +
    "setBlinkDelay 100\n" +
    "setBlinkGroupDelay 1200\n" +
    "setCaptionDuration 2000\n" +
    "setCaptionDelay 1200\n" +
    "\n" +
    "bigcap YOU LOVE FLUFFY KITTENS\n" +
    "blink KITTENS / ARE / YOUR / LIFE\n" +
    "cap Cuddle all the kittens forever because you love them."
  const tutorial = state.config.tutorials.scriptor == null;
  return {route: [new Route({kind: 'scriptor', value: tutorial ? new CaptionScript({script:testScript}) : null})], tutorial: tutorial ? CST.welcome : null};
}

export function openScriptInScriptor(state: State, source: CaptionScript) {
  return {route: state.route.concat(new Route({kind: 'scriptor', value: source}))};
}

export function openLibraryImport(state: State): Object {
  return {route: state.route.concat(new Route({kind: 'library', value: null})), specialMode: SP.select, librarySelected: []};
}

export function importAudioFromLibrary(state: State, sources: Array<Audio>): Object {
  const playlistIndex = state.route[state.route.length - 1].value;
  return {...updateScene(state, getActiveScene(state), (s: Scene) => {s.audioPlaylists[playlistIndex].audios = s.audioPlaylists[playlistIndex].audios.concat(sources)}), ...goBack(state)};
}

export function importScriptFromLibrary(state: State, sources: Array<CaptionScript>): Object {
  const playlistIndex = state.route[state.route.length - 1].value;
  return {...updateScene(state, getActiveScene(state), (s: Scene) => {s.scriptPlaylists[playlistIndex].scripts = s.scriptPlaylists[playlistIndex].scripts.concat(sources)}), ...goBack(state)};
}

export function importScriptToScriptor(state: State, source: CaptionScript): Object {
  const newRoute = state.route.slice(0, state.route.length - 1);
  newRoute[newRoute.length - 1].value = source;
  return {route: newRoute, specialMode: null};
}

export function importFromLibrary(state: State, sources: Array<LibrarySource>): Object {
  const scene = getActiveScene(state);
  const sceneSources = mergeSources(scene.sources, sources);
  return {...updateScene(state, getActiveScene(state), (s: Scene) => {s.sources = sceneSources}), ...goBack(state)};
}

export function saveLibraryPosition(state: State, yOffset: number, filters: Array<string>, selected: Array<string>): Object {
  return {
    libraryYOffset: yOffset,
    libraryFilters: filters,
    librarySelected: selected,
  };
}

export function saveAudioPosition(state: State, yOffset: number, filters: Array<string>, selected: Array<string>): Object {
  return {
    audioYOffset: yOffset,
    audioFilters: filters,
    audioSelected: selected,
  };
}

export function saveScriptPosition(state: State, yOffset: number, filters: Array<string>, selected: Array<string>): Object {
  return {
    scriptYOffset: yOffset,
    scriptFilters: filters,
    scriptSelected: selected,
  };
}

export function resetScene(state: State, scene: Scene): Object {
  return updateScene(state, scene, (scene) => {
    const ignoreProps = ["sources"];
    for (let property in state.config.defaultScene) {
      if (ignoreProps.includes(property)) continue;
      (scene as any)[property] = (state.config.defaultScene as any)[property];
    }
  });
}

export function playGrid(state: State, grid: SceneGrid): Object {
  return {route: state.route.concat(new Route({kind: 'gridplay', value: grid.id}))};
}

export function playScene(state: State, scene: Scene): Object {
  return {route: state.route.concat(new Route({kind: 'play', value: scene.id})), tutorial: state.config.tutorials.player == null ? PT.welcome : null};
}

export function playTrack(state: State, url: string) {
  return updateAudioLibrary(state, (l) => {
    for (let a of l) {
      if (a.url == url) {
        a.playedCount++;
        break;
      }
    }
  })
}

export function playAudio(state: State, source: Audio, displayed: Array<Audio>): Object {
  const sourceURL = source.url.startsWith("http") ? source.url : source.url.replace(/\//g, path.sep);
  let librarySource = state.audios.find((s) => s.url == sourceURL);
  if (librarySource == null) {
    throw new Error("Source not found in Library");
  }
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  const startIndex = displayed.indexOf(displayed.find((a) => a.url == source.url));
  const tempScene = new Scene({
    id: id,
    name: "audio_scene_temp",
    libraryID: librarySource.id,
    audioScene: true,
    audioEnabled: true,
    audioPlaylists: [{audios: displayed, shuffle: false, repeat: RP.all}],
    audioStartIndex: startIndex,
    strobe: true,
    strobeTime: 10000,
    strobeLayer: SL.image,
    panning: true,
    panDuration: 20000,
    panHorizTransType: HTF.random,
    panHorizTransLevelMax: 50,
    panHorizTransLevelMin: 10,
    panHorizTransRandom: true,
    panVertTransType: VTF.random,
    panVertTransLevelMax: 50,
    panVertTransLevelMin: 10,
    panVertTransRandom: true,
    imageType: IT.centerNoClip,
  });
  return {
    scenes: state.scenes.concat([tempScene]),
    route: state.route.concat([new Route({kind: 'scene', value: tempScene.id}), new Route({kind: 'libraryplay', value: tempScene.id})]),
  };
}

export function playScript(state: State, source: CaptionScript, sceneID: number, displayed: Array<CaptionScript>): Object {
  const sourceURL = source.url.startsWith("http") ? source.url : source.url.replace(/\//g, path.sep);
  let librarySource = state.scripts.find((s) => s.url == sourceURL);
  if (librarySource == null) {
    throw new Error("Script not found in Library");
  }
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  const startIndex = displayed.indexOf(displayed.find((s) => s.url == source.url));
  const tempScene = JSON.parse(JSON.stringify(state.scenes.find((s) => s.id == sceneID)));
  tempScene.id = id;
  tempScene.libraryID = librarySource.id;
  tempScene.scriptScene = true;
  tempScene.textEnabled = true;
  tempScene.scriptPlaylists = [{scripts: displayed, shuffle: false, repeat: RP.all}];
  tempScene.scriptStartIndex = startIndex;
  return {
    scenes: state.scenes.concat([tempScene]),
    route: state.route.concat([new Route({kind: 'scene', value: tempScene.id}), new Route({kind: 'libraryplay', value: tempScene.id})]),
  };
}

export function playSceneFromLibrary(state: State, source: LibrarySource, displayed: Array<LibrarySource>): Object {
  const sourceURL = source.url.startsWith("http") ? source.url : source.url.replace(/\//g, path.sep);
  let librarySource = state.library.find((s) => s.url == sourceURL);
  if (librarySource == null) {
    throw new Error("Source not found in Library");
  }
  librarySource.disabledClips =  [];
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  if (getLibrarySource(state) != null) {
    state.route.pop();
    state.route.pop();
    state.scenes.pop();
  }
  let tempScene = new Scene({
    id: id,
    name: "library_scene_temp",
    sources: [librarySource],
    libraryID: librarySource.id,
    forceAll: state.config.defaultScene.forceAll,
    backgroundType: state.config.defaultScene.backgroundType,
    backgroundColor: state.config.defaultScene.backgroundColor,
    backgroundColorSet: state.config.defaultScene.backgroundColorSet,
    backgroundBlur: state.config.defaultScene.backgroundBlur,
    imageOrientation: state.config.defaultScene.imageOrientation,
    videoOrientation: state.config.defaultScene.videoOrientation,
    randomVideoStart: state.config.defaultScene.randomVideoStart,
    continueVideo:  getSourceType(source.url) == ST.video || state.config.defaultScene.continueVideo,
    playVideoClips: state.config.defaultScene.playVideoClips,
    videoVolume: state.config.defaultScene.videoVolume,
  });
  return {
    displayedSources: displayed,
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
      sceneSource.disabledClips = sceneSource.disabledClips ? sceneSource.disabledClips.filter((n) => sceneSource.clips.find((c) => c.id == n)) : [];
    }
  }
  return {library: newLibrary, scenes: newScenes};
}

export function clipVideo(state: State, source: LibrarySource, displayed: Array<LibrarySource>) {
  const sourceURL = source.url.startsWith("http") ? source.url : source.url.replace(/\//g, path.sep);
  let librarySource = state.library.find((s) => s.url == sourceURL);
  if (getActiveSource(state) != null) {
    state.route.pop();
  }
  if (!displayed) {
    displayed = state.displayedSources;
  }
  return {
    displayedSources: displayed,
    route: state.route.concat([new Route({kind: 'clip', value: librarySource})])
  };
}

export function setDisabledClips(state: State, disabled: Array<number>) {
  const activeScene = getActiveScene(state);
  if (activeScene) {
    return updateScene(state, activeScene, (s) => {
      const source = s.sources.find((ls) => ls.url == getActiveSource(state).url);
      if (source) {
        source.disabledClips = disabled;
      }
    })
  }
}

export function navigateClipping(state: State, offset: number): Object {
  const displayed = Array.from(state.displayedSources);
  let newIndexOf = displayed.map((s) => s.url).indexOf(getActiveSource(state).url);
  let newSource;
  do {
    newIndexOf = newIndexOf + offset;
    if (newIndexOf < 0) {
      newIndexOf = displayed.length - 1;
    } else if (newIndexOf >= displayed.length) {
      newIndexOf = 0;
    }
    newSource = displayed[newIndexOf];
  } while (getSourceType(newSource.url) != ST.video);
  return clipVideo(state, newSource, displayed);
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
  const displayed = Array.from(state.displayedSources);
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
  let librarySource;
  if (getActiveScene(state).audioScene) {
    librarySource = getAudioSource(state);
  } else if (getActiveScene(state).scriptScene) {
    librarySource = getScriptSource(state);
  } else {
    librarySource = getLibrarySource(state);
  }
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

export function addGrid(state: State): Object {
  let id = state.grids.length + 1;
  state.grids.forEach((g: SceneGrid) => {
    id = Math.max(g.id + 1, id);
  });
  let grid = new SceneGrid({
    id: id,
    name: "New Grid",
    grid: [[-1]],
  });
  return {
    grids: state.grids.concat([grid]),
    route: [new Route({kind: 'grid', value: grid.id})],
    specialMode: SP.autoEdit,
    tutorial: state.config.tutorials.sceneGrid == null ? SGT.welcome : null
  };
}

export function addGenerator(state: State): Object {
  let id = state.scenes.length + 1;
  state.scenes.forEach((s: Scene) => {
    id = Math.max(s.id + 1, id);
  });
  let scene = new Scene({
    id: id,
    name: "New Generator",
    sources: new Array<LibrarySource>(),
    generatorWeights: [],
    openTab: 4,
    ...state.config.defaultScene,
  });
  return {
    scenes: state.scenes.concat([scene]),
    route: [new Route({kind: 'scene', value: scene.id})],
    specialMode: SP.autoEdit,
    tutorial: state.config.tutorials.sceneGenerator == null ? SDGT.welcome : null
  };
}

function reduceList(sources: Array<LibrarySource>, limit: number): Array<LibrarySource> {
  while (sources.length > limit) {
    sources.splice(getRandomIndex(sources), 1);
  }
  return sources;
}

export function generateScenes(state: State, scenes: Array<Scene>): Object {
  const newScenes = Array.from(state.scenes);
  for (let scene of scenes) {
    const newScene = state.scenes.find((s) => s.id == scene.id);

    // Record all the groups we're requiring/excluding
    const allTags = newScene.generatorWeights.filter((wg) => wg.type == TT.all && !wg.rules && !wg.tag.typeTag).map((wg) => wg.tag);
    const noneTags = newScene.generatorWeights.filter((wg) => wg.type == TT.none && !wg.rules && !wg.tag.typeTag).map((wg) => wg.tag);
    const allTypes = newScene.generatorWeights.filter((wg) => wg.type == TT.all && !wg.rules && wg.tag.typeTag).map((wg) => wg.tag.name);
    const noneTypes = newScene.generatorWeights.filter((wg) => wg.type == TT.none && !wg.rules && wg.tag.typeTag).map((wg) => wg.tag.name);

    // Sources to require
    let reqAdvSources: Array<LibrarySource> = null;
    // Sources to exclude
    let excAdvSources: Array<LibrarySource> = null;

    // Build generator's list of sources
    let genSources = new Array<LibrarySource>();

    // First, build all our adv rules
    for (let wg of newScene.generatorWeights.filter((wg) => !!wg.rules)) {
      // Build each adv rule like a regular set of simple rules
      // First get tags to require/exclude
      const ruleAllTags = wg.rules.filter((wg) => !wg.tag.typeTag && wg.type == TT.all).map((wg) => wg.tag);
      const ruleNoneTags = wg.rules.filter((wg) => !wg.tag.typeTag && wg.type == TT.none).map((wg) => wg.tag);
      const ruleAllTypes = wg.rules.filter((wg) => wg.tag.typeTag && wg.type == TT.all).map((wg) => wg.tag.name);
      const ruleNoneTypes = wg.rules.filter((wg) => wg.tag.typeTag && wg.type == TT.none).map((wg) => wg.tag.name);

      // Build this rule's list of sources
      let rulesSources = new Array<LibrarySource>();

      // If we don't have any weights, calculate by just require/exclude
      if (ruleAllTags.length + ruleNoneTags.length + ruleAllTypes.length + ruleNoneTypes.length == wg.rules.length) {
        let sources = [];
        // For each source in the library
        for (let s of state.library) {
          let addedClip = false;
          let invalidClips = [];
          const sType = getSourceType(s.url);
          const sTypeEn = en.get(sType);
          // If this is a video with clips
          if (sType == ST.video && s.clips && s.clips.length > 0) {
            // Weight each clip first
            for (let c of s.clips) {
              // If clip is not tagged, default to source tags
              let cTags = c.tags && c.tags.length > 0 ? c.tags : s.tags;
              let b = false;

              // Filter out clips which don't have ruleAllTags/allTags
              for (let at of ruleAllTags) {
                if (!cTags.find((t) => t.id == at.id)) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;
              for (let at of allTags) {
                if (!cTags.find((t) => t.id == at.id)) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;

              // Filter out clips which have ruleNoneTags/noneTags
              for (let nt of ruleNoneTags) {
                if (cTags.find((t) => t.id == nt.id)) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue
              for (let nt of noneTags) {
                if (cTags.find((t) => t.id == nt.id)) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;

              // Filter out clips which don't have ruleAllTypes/allTypes
              for (let at of ruleAllTypes) {
                if (at != sTypeEn) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;
              for (let at of allTypes) {
                if (at != sTypeEn) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;

              // Filter out clips which have ruleNoneTypes/noneTypes
              for (let nt of ruleNoneTypes) {
                if (nt == sTypeEn) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;
              for (let nt of noneTypes) {
                if (nt == sTypeEn) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;

              // If this clip is valid, mark as added
              addedClip = true;
            }
          }

          // If we're not already adding a clip, check the source tags
          if (!addedClip) {
            let b = false;

            // Filter out sources which don't have ruleAllTags/allTags
            for (let at of ruleAllTags) {
              if (!s.tags.find((t) => t.id == at.id)) {
                b = true;
                break;
              }
            }
            if (b) continue;
            for (let at of allTags) {
              if (!s.tags.find((t) => t.id == at.id)) {
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out sources which have ruleNoneTags/noneTags
            for (let nt of ruleNoneTags) {
              if (s.tags.find((t) => t.id == nt.id)) {
                b = true;
                break;
              }
            }
            if (b) continue;
            for (let nt of noneTags) {
              if (s.tags.find((t) => t.id == nt.id)) {
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out sources which don't have ruleAllTypes/allTypes
            for (let at of ruleAllTypes) {
              if (at != sTypeEn) {
                b = true;
                break;
              }
            }
            if (b) continue;
            for (let at of allTypes) {
              if (at != sTypeEn) {
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out sources which have ruleNonTypes/noneTypes
            for (let nt of ruleNoneTypes) {
              if (nt == sTypeEn) {
                b = true;
                break;
              }
            }
            if (b) continue;
            for (let nt of noneTypes) {
              if (nt == sTypeEn) {
                b = true;
                break;
              }
            }
            if (b) continue;
          } else {
            // If we're adding a clip, mark invalid ones
            s.disabledClips = invalidClips;
          }
          sources.push(s);
        }
        rulesSources = sources;
      } else {
        // Otherwise, generate sources for each weighted rule
        for (let rule of wg.rules) {
          if (rule.type == TT.weight) {
            let sources = [];
            // For each source in the library
            for (let s of state.library) {
              let addedClip = false;
              let invalidClips = [];
              const sType = getSourceType(s.url);
              const sTypeEn = en.get(sType);
              // If this is a video with clips
              if (sType == ST.video && s.clips && s.clips.length > 0) {
                // Weight each clip first
                for (let c of s.clips) {
                  // If clip is not tagged, default to source tags
                  let cTags = c.tags && c.tags.length > 0 ? c.tags : s.tags;
                  let b = false;

                  // Filter out clips which don't have this tag/type
                  if (rule.tag.typeTag) {
                    if (sTypeEn != rule.tag.name) {
                      continue
                    }
                  } else {
                    if (!cTags.find((t) => t.id == rule.tag.id)) {
                      invalidClips.push(c.id);
                      continue;
                    }
                  }

                  // Filter out clips which don't have ruleAllTags/allTags
                  for (let at of ruleAllTags) {
                    if (!cTags.find((t) => t.id == at.id)) {
                      invalidClips.push(c.id);
                      b = true;
                      break;
                    }
                  }
                  if (b) continue;
                  for (let at of allTags) {
                    if (!cTags.find((t) => t.id == at.id)) {
                      invalidClips.push(c.id);
                      b = true;
                      break;
                    }
                  }
                  if (b) continue;

                  // Filter out clips which have ruleNonTags/noneTags
                  for (let nt of ruleNoneTags) {
                    if (cTags.find((t) => t.id == nt.id)) {
                      invalidClips.push(c.id);
                      b = true;
                      break;
                    }
                  }
                  if (b) continue;
                  for (let nt of noneTags) {
                    if (cTags.find((t) => t.id == nt.id)) {
                      invalidClips.push(c.id);
                      b = true;
                      break;
                    }
                  }
                  if (b) continue;

                  // Filter out clips which don't have ruleAllTypes/allTypes
                  for (let at of ruleAllTypes) {
                    if (at != sTypeEn) {
                      invalidClips.push(c.id);
                      b = true;
                      break;
                    }
                  }
                  if (b) continue;
                  for (let at of allTypes) {
                    if (at != sTypeEn) {
                      invalidClips.push(c.id);
                      b = true;
                      break;
                    }
                  }
                  if (b) continue;

                  // Filter out clips which have ruleNoneTypes/noneTypes
                  for (let nt of ruleNoneTypes) {
                    if (nt == sTypeEn) {
                      invalidClips.push(c.id);
                      b = true;
                      break;
                    }
                  }
                  if (b) continue;
                  for (let nt of noneTypes) {
                    if (nt == sTypeEn) {
                      invalidClips.push(c.id);
                      b = true;
                      break;
                    }
                  }
                  if (b) continue;

                  // If this clip is valid, mark as added
                  addedClip = true;
                }
              }

              // If we've not already added a clip, check the source tags
              if (!addedClip) {
                let b = false;

                // Filter out sources which don't have this tag/type
                if (rule.tag.typeTag) {
                  if (sTypeEn != rule.tag.name) {
                    continue
                  }
                } else {
                  if (!s.tags.find((t) => t.id == rule.tag.id)) {
                    continue
                  }
                }

                // Filter out sources which don't have ruleAllTags/allTags
                for (let at of ruleAllTags) {
                  if (!s.tags.find((t) => t.id == at.id)) {
                    b = true;
                    break;
                  }
                }
                if (b) continue;
                for (let at of allTags) {
                  if (!s.tags.find((t) => t.id == at.id)) {
                    b = true;
                    break;
                  }
                }
                if (b) continue;

                // Filter out sources which have ruleNoneTags/noneTags
                for (let nt of ruleNoneTags) {
                  if (s.tags.find((t) => t.id == nt.id)) {
                    b = true;
                    break;
                  }
                }
                if (b) continue;
                for (let nt of noneTags) {
                  if (s.tags.find((t) => t.id == nt.id)) {
                    b = true;
                    break;
                  }
                }
                if (b) continue;

                // Filter out sources which don't have ruleAllTypes/allTypes
                for (let at of ruleAllTypes) {
                  if (at != sTypeEn) {
                    b = true;
                    break;
                  }
                }
                if (b) continue;
                for (let at of allTypes) {
                  if (at != sTypeEn) {
                    b = true;
                    break;
                  }
                }
                if (b) continue;

                // Filter out sources which have ruleNoneTypes/noneTypes
                for (let nt of ruleNoneTypes) {
                  if (nt == sTypeEn) {
                    b = true;
                    break;
                  }
                }
                if (b) continue;
                for (let nt of noneTypes) {
                  if (nt == sTypeEn) {
                    b = true;
                    break;
                  }
                }
                if (b) continue;
              } else {
                // If we're adding a clip, mark invalid ones
                s.disabledClips = invalidClips;
              }
              sources.push(s);
            }
            // Randomize list and reduce
            rulesSources = rulesSources.concat(reduceList(randomizeList(sources), Math.round(newScene.generatorMax * (rule.percent / 100))));
          }
        }
      }
      switch (wg.type) {
        // If this adv rule is weighted, add the percentage of sources to the master list
        case TT.weight:
          wg.max = rulesSources.length;
          let chosenSources = reduceList(randomizeList(rulesSources), Math.round(newScene.generatorMax * (wg.percent / 100)))
          genSources = genSources.concat(chosenSources);
          wg.chosen = chosenSources.length;
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

    // Now, build our simple rules
    // If we don't have any weights, calculate by just require/exclude
    if (allTags.length + noneTags.length + allTypes.length + noneTypes.length == newScene.generatorWeights.length) {
      let sources = [];
      for (let s of state.library) {
        // Filter out sources which are not in required list
        if (reqAdvSources && !reqAdvSources.find((source) => source.id == s.id)) {
          continue;
        }
        // Filter out sources which are in exclude list
        if (excAdvSources && excAdvSources.find((source) => source.id == s.id)) {
          continue;
        }

        let addedClip = false;
        let invalidClips = [];
        const sType = getSourceType(s.url);
        const sTypeEn = en.get(sType);
        // If this is a video with clips
        if (sType == ST.video && s.clips && s.clips.length > 0) {
          // Weight each clip first
          for (let c of s.clips) {
            // If clip is not tagged, default to source tags
            let cTags = c.tags && c.tags.length > 0 ? c.tags : s.tags;
            let b = false;

            // Filter out clips which don't have allTags
            for (let at of allTags) {
              if (!cTags.find((t) => t.id == at.id)) {
                invalidClips.push(c.id);
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out clips which have noneTags
            for (let nt of noneTags) {
              if (cTags.find((t) => t.id == nt.id)) {
                invalidClips.push(c.id);
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out clips which don't have allTypes
            for (let at of allTypes) {
              if (at != sTypeEn) {
                invalidClips.push(c.id);
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out clips which have noneTypes
            for (let nt of noneTypes) {
              if (nt == sTypeEn) {
                invalidClips.push(c.id);
                b = true;
                break;
              }
            }
            if (b) continue;

            // If this clip is valid, mark as added
            addedClip = true;
          }
        }

        // If we're not already adding a clip, check the source tags
        if (!addedClip) {
          let b = false;

          // Filter out sources which don't have allTags
          for (let at of allTags) {
            if (!s.tags.find((t) => t.id == at.id)) {
              b = true;
              break;
            }
          }
          if (b) continue;

          // Filter out sources which have noneTags
          for (let nt of noneTags) {
            if (s.tags.find((t) => t.id == nt.id)) {
              b = true;
              break;
            }
          }
          if (b) continue;

          // Filter out sources which don't have allTypes
          for (let at of allTypes) {
            if (at != sTypeEn) {
              b = true;
              break;
            }
          }
          if (b) continue;

          // Filter out sources which have noneTypes
          for (let nt of noneTypes) {
            if (nt == sTypeEn) {
              b = true;
              break;
            }
          }
          if (b) continue;
        } else {
          // If we're adding a clip, mark invalid ones
          s.disabledClips = invalidClips;
        }
        sources.push(s);
      }
      genSources = sources;
    } else {
      // Otherwise, generate sources for each weight
      for (let wg of newScene.generatorWeights.filter((wg) => !wg.rules && wg.type == TT.weight)) {
        let sources = [];
        // For each source in the library
        for (let s of state.library) {
          // Filter out sources which are not in required list
          if (reqAdvSources && !reqAdvSources.find((source) => source.id == s.id)) {
            continue;
          }
          // Filter out sources which are in exclude list
          if (excAdvSources && excAdvSources.find((source) => source.id == s.id)) {
            continue;
          }

          let addedClip = false;
          let invalidClips = [];
          const sType = getSourceType(s.url);
          const sTypeEn = en.get(sType);
          // If this is a video with clips
          if (sType == ST.video && s.clips && s.clips.length > 0) {
            // Weight each clip first
            for (let c of s.clips) {
              // If clip is not tagged, default to source tags
              let cTags = c.tags && c.tags.length > 0 ? c.tags : s.tags;
              let b = false;

              // Filter out clip which don't have this type/tag
              if (wg.tag.typeTag) {
                if (wg.tag.name != sTypeEn) {
                  invalidClips.push(c.id);
                  continue;
                }
              } else {
                if (!cTags.find((t) => t.id == wg.tag.id)) {
                  invalidClips.push(c.id);
                  continue;
                }
              }

              // Filter out clips which don't have allTags
              for (let at of allTags) {
                if (!cTags.find((t) => t.id == at.id)) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;

              // Filter out clips which have noneTags
              for (let nt of noneTags) {
                if (cTags.find((t) => t.id == nt.id)) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;

              // Filter out clips which don't have allTypes
              for (let at of allTypes) {
                if (at != sTypeEn) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;

              // Filter out clips which have noneTypes
              for (let nt of noneTypes) {
                if (nt == sTypeEn) {
                  invalidClips.push(c.id);
                  b = true;
                  break;
                }
              }
              if (b) continue;

              // If this clip is valid, mark as added
              addedClip = true;
            }
          }

          // If we're not already adding a clip, check the source tags
          if (!addedClip) {
            let b = false;

            // Filter out sources which don't have this tag
            if (wg.tag.typeTag) {
              if (wg.tag.name != sTypeEn) {
                continue;
              }
            } else {
              if (!s.tags.find((t) => t.id == wg.tag.id)) {
                continue;
              }
            }

            // Filter out sources which don't have allTags
            for (let at of allTags) {
              if (!s.tags.find((t) => t.id == at.id)) {
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out sources which have noneTags
            for (let nt of noneTags) {
              if (s.tags.find((t) => t.id == nt.id)) {
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out sources which don't have allTypes
            for (let at of allTypes) {
              if (at != sTypeEn) {
                b = true;
                break;
              }
            }
            if (b) continue;

            // Filter out sources which have noneTypes
            for (let nt of noneTypes) {
              if (nt == sTypeEn) {
                b = true;
                break;
              }
            }
            if (b) continue;
          } else {
            // If we're adding a clip, mark invalid ones
            s.disabledClips = invalidClips;
          }
          sources.push(s);
        }
        wg.max = sources.length;
        let chosenSources = reduceList(sources, Math.round(newScene.generatorMax * (wg.percent / 100)));
        genSources = genSources.concat(chosenSources);
        wg.chosen = chosenSources.length;
      }
    }
    genSources = reduceList(randomizeList(removeDuplicatesBy((s: LibrarySource) => s.url, genSources)), newScene.generatorMax);
    genSources = JSON.parse(JSON.stringify(genSources));
    genSources.forEach((s, i) => s.id = i);
    newScene.sources = genSources;
  }
  return {scenes: newScenes};
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

export function updateGrid(state: State, grid: SceneGrid, fn: (grid: SceneGrid) => void): Object {
  const newGrids = Array<SceneGrid>();
  for (let g of state.grids) {
    if (g.id == grid.id) {
      const gridCopy = JSON.parse(JSON.stringify(g));
      fn(gridCopy);
      newGrids.push(gridCopy);
    } else {
      newGrids.push(g);
    }
  }
  return {grids: newGrids};
}

export function replaceScenes(state: State, scenes: Array<Scene>): Object {
  return {scenes: scenes};
}

export function replaceGrids(state: State, grids: Array<SceneGrid>): Object {
  return {grids: grids};
}

export function updatePlaylists(state: State, fn: (playlists: Array<Playlist>) => void): Object {
  const playlistsCopy = JSON.parse(JSON.stringify(state.playlists));
  fn(playlistsCopy);
  return {playlists: playlistsCopy};
}

export function updateAudioLibrary(state: State, fn: (audios: Array<Audio>) => void): Object {
  const audiosCopy = JSON.parse(JSON.stringify(state.audios));
  fn(audiosCopy);
  return {audios: audiosCopy};
}

export function updateScriptLibrary(state: State, fn: (scripts: Array<CaptionScript>) => void): Object {
  const scriptsCopy = JSON.parse(JSON.stringify(state.scripts));
  fn(scriptsCopy);
  return {scripts: scriptsCopy};
}

export function updateLibrary(state: State, fn: (library: Array<LibrarySource>) => void): Object {
  const libraryCopy = JSON.parse(JSON.stringify(state.library));
  fn(libraryCopy);
  return {library: libraryCopy};
}

export function clearBlacklist(state: State, sourceURL: string): Object {
  return blacklistFile(state, sourceURL, null);
}

export function editBlacklist(state: State, sourceURL: string, blacklist: string): Object {
  const newBlacklist = blacklist.split("\n").filter((s) => /^\w*$/.exec(s) == null);
  const newLibrary = state.library;
  const newScenes = state.scenes;
  const source = newLibrary.find((s) => s.url == sourceURL);
  if (source) {
    source.blacklist = newBlacklist;
  }
  for (let scene of newScenes) {
    const sceneSource = scene.sources.find((s) => s.url == sourceURL);
    if (sceneSource) {
      sceneSource.blacklist = newBlacklist;
    }
  }
  return {library: newLibrary, scenes: newScenes};
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
        if (!sceneSource.blacklist.includes(fileToBlacklist)) {
          sceneSource.blacklist.push(fileToBlacklist);
        }
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
  let newAudios = state.audios;
  let newScripts = state.scripts;
  let newScenes = state.scenes;
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
    if (source.clips) {
      for (let clip of source.clips) {
        // Remove deleted tags, update any edited tags, and order the same as tags
        if (clip.tags) {
          clip.tags = clip.tags.filter((t: Tag) => tagIDs.includes(t.id));
        } else {
          clip.tags = [];
        }
        clip.tags = clip.tags.map((t: Tag) => {
          for (let tag of tags) {
            if (t.id == tag.id) {
              t.name = tag.name;
              t.phraseString = tag.phraseString;
              return t;
            }
          }
        });
        clip.tags = clip.tags.sort((a: Tag, b: Tag) => {
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
    }
  }
  for (let source of newAudios) {
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
  for (let source of newScripts) {
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
  for (let scene of newScenes) {
    for (let source of scene.sources) {
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
      if (source.clips) {
        for (let clip of source.clips) {
          // Remove deleted tags, update any edited tags, and order the same as tags
          if (clip.tags) {
            clip.tags = clip.tags.filter((t: Tag) => tagIDs.includes(t.id));
          } else {
            clip.tags = [];
          }
          clip.tags = clip.tags.map((t: Tag) => {
            for (let tag of tags) {
              if (t.id == tag.id) {
                t.name = tag.name;
                t.phraseString = tag.phraseString;
                return t;
              }
            }
          });
          clip.tags = clip.tags.sort((a: Tag, b: Tag) => {
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
      }
    }
  }
  return {tags: tags, library: newLibrary};
}

export function addToPlaylist(state: State): Object {
  if (state.specialMode == SP.addToPlaylist) {
    return {specialMode: null, audioOpenTab: 3};
  } else {
    return {specialMode: SP.addToPlaylist, audioOpenTab: 3};
  }
}

export function batchTag(state: State): Object {
  if (state.specialMode == SP.batchTag) {
    return {specialMode: null, audioOpenTab: 3};
  } else {
    return {specialMode: SP.batchTag, audioOpenTab: 3};
  }

}

export function batchEdit(state: State): Object {
  if (state.specialMode == SP.batchEdit) {
    return {specialMode: null, audioOpenTab: 3};
  } else {
    return {specialMode: SP.batchEdit, audioOpenTab: 3};
  }
}

export function toggleAudioTag(state: State, sourceID: number, tag: Tag): Object {
  const newAudios = state.audios;
  const source = newAudios.find((s) => s.id == sourceID);
  if (source) {
    if (source.tags.find((t: Tag) => t.name == tag.name)) {
      source.tags = source.tags.filter((t: Tag) => t.name != tag.name);
    } else {
      source.tags.push(tag);
    }
  }
  return {audios: newAudios};
}

export function toggleScriptTag(state: State, sourceID: number, tag: Tag): Object {
  const newScripts = state.scripts;
  const source = newScripts.find((s) => s.id == sourceID);
  if (source) {
    if (source.tags.find((t: Tag) => t.name == tag.name)) {
      source.tags = source.tags.filter((t: Tag) => t.name != tag.name);
    } else {
      source.tags.push(tag);
    }
  }
  return {scripts: newScripts};
}

export function toggleTag(state: State, sourceID: number, tag: Tag): Object {
  const newLibrary = state.library;
  const newScenes = state.scenes;
  const source = newLibrary.find((s) => s.id == sourceID);
  if (source) {
    if (source.tags.find((t: Tag) => t.name == tag.name)) {
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

export function addTracks(state: State, playlistIndex: number) {
  return {route: state.route.concat(new Route({kind: 'audios', value: playlistIndex})), specialMode: SP.select, audioSelected: new Array<string>(), audioOpenTab: 3};
}

export function addScript(state: State, playlistIndex: number) {
  return {route: state.route.concat(new Route({kind: 'scripts', value: playlistIndex})), specialMode: SP.select, scriptSelected: new Array<string>()};
}

export function addScriptSingle(state: State) {
  return {route: state.route.concat(new Route({kind: 'scripts', value: null})), specialMode: SP.selectSingle, scriptSelected: new Array<string>()};
}

export function addSource(state: State, scene: Scene, type: string, ...args: any[]): Object {
  const handleArgs = (s: Scene) => {
    if (args.length > 0) {
      let importURL = args[0];
      if (importURL.includes("pastebinId=")) {
        importURL = importURL.substring(importURL.indexOf("pastebinId=") + 11);

        if (importURL.includes("&")) {
          importURL = importURL.substring(0, importURL.indexOf("&"));
        }

        // Update hastebin URL (if present)
        s.scriptPlaylists.push({scripts: [new CaptionScript({url: "https://hastebin.com/raw/" + importURL})], shuffle: false, repeat: RP.none});
      }
    }
  }

  switch (type) {
    case "tutorial":
      return updateScene(state, scene, (s) => {
        let id = s.sources.length + 1;
        s.sources.forEach((s) => {
          id = Math.max(s.id + 1, id);
        });

        let combinedSources = Array.from(s.sources);
        const cuteTag = new Tag();
        cuteTag.id = 1000000;
        cuteTag.name = "Cute";
        const animalTag = new Tag();
        animalTag.id = 1000001;
        animalTag.name = "Animals";
        combinedSources.unshift(new LibrarySource({
          url: "https://imgur.com/a/mMslVXT",
          id: id,
          tags: [cuteTag, animalTag],
          count: 100,
        }));
        s.sources = combinedSources;
      })

    case AF.library:
      return openLibraryImport(state);

    case AF.url:
      if (!args || args.length != 1) {
        if (scene != null) {
          return updateScene(state, scene, (s) => {
            addSources(s.sources, [""], state.library);
            handleArgs(s);
          })
        } else {
          return updateLibrary(state, (l) => {addSources(l, [""], state.library)});
        }
      } else {
        if (scene != null) {
          return updateScene(state, scene, (s) => {
            addSources(s.sources, args[0], state.library);
            handleArgs(s);
          })
        } else {
          return updateLibrary(state, (l) =>  addSources(l, args[0], state.library));
        }
      }

    case AF.directory:
      let dResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory', 'multiSelections']});
      if (!dResult) return;
      if (scene != null) {
        return updateScene(state, scene, (s) => {
          addSources(s.sources, dResult, state.library);
          handleArgs(s);
        })
      } else {
        return updateLibrary(state, (l) =>  addSources(l, dResult, state.library));
      }

    case AF.videos:
      let vResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
        {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'Video files', extensions: ['mp4', 'mkv', 'webm', 'ogv', 'mov']}, {name: 'Playlist files', extensions: ['asx', 'm3u8', 'pls', 'xspf']}], properties: ['openFile', 'multiSelections']});
      if (!vResult) return;
      vResult = vResult.filter((r) => isVideo(r, true) || isVideoPlaylist(r, true));
      if (scene != null) {
        return updateScene(state, scene, (s) => {
          addSources(s.sources, vResult, state.library);
          handleArgs(s);
        })
      } else {
        return updateLibrary(state, (l) =>  addSources(l, vResult, state.library));
      }

    case AF.videoDir:
      let vdResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
        {filters: [{name:'All Files (*.*)', extensions: ['*']}], properties: ['openDirectory', 'multiSelections']});
      if (!vdResult) return;
      let rvResult = new Array<string>();
      for (let path of vdResult) {
        if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
          rvResult = rvResult.concat(getFilesRecursively(path));
        } else {
          rvResult.push(path);
        }
      }
      rvResult = rvResult.filter((r) => isVideo(r, true) || isVideoPlaylist(r, true));
      if (scene != null) {
        return updateScene(state, scene, (s) => {
          addSources(s.sources, rvResult, state.library);
          handleArgs(s);
        })
      } else {
        return updateLibrary(state, (l) =>  addSources(l, rvResult, state.library));
      }

    case GT.local:
      if (!args || args.length < 2) {
        return;
      }
      let rootDir = args[1];
      if (!rootDir.endsWith(sep)) {
        rootDir += sep;
      }
      if (scene != null) {
        return updateScene(state, scene, (s) => {
          addSources(s.sources, getImportURLs(args[0], rootDir), state.library);
          handleArgs(s);
        })
      } else {
        return updateLibrary(state, (l) =>  addSources(l, getImportURLs(args[0], rootDir), state.library));
      }

    case GT.tumblr:
      if (!args || args.length < 1) {
        return;
      }
      if (scene != null) {
        return updateScene(state, scene, (s) => {
          addSources(s.sources, getImportURLs(args[0]), state.library);
          handleArgs(s);
        })
      } else {
        return updateLibrary(state, (l) =>  addSources(l, getImportURLs(args[0]), state.library));
      }
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

function mergeSources(originalSources: Array<LibrarySource>, newSources: Array<LibrarySource>): Array<LibrarySource> {
  // dedup
  let sourceURLs = originalSources.map((s) => s.url);
  newSources = newSources.filter((s) => !sourceURLs.includes(s.url));

  let id = originalSources.length + 1;
  originalSources.forEach((s) => {
    id = Math.max(s.id + 1, id);
  });

  let combinedSources = Array.from(originalSources);
  for (let source of newSources) {
    const newSource = new LibrarySource(source);
    newSource.id = id;
    combinedSources.unshift(newSource);
    id += 1;
  }
  return combinedSources;
}


function addSources(originalSources: Array<LibrarySource>, newSources: Array<string>, library: Array<LibrarySource>) {
  // dedup
  let sourceURLs = originalSources.map((s) => s.url);
  newSources = newSources.filter((s) => !sourceURLs.includes(s));

  let id = originalSources.length + 1;
  originalSources.forEach((s) => {
    id = Math.max(s.id + 1, id);
  });

  for (let url of newSources) {
    const librarySource = library.find((s) => s.url === url);
    originalSources.unshift(new LibrarySource({
      url: url,
      id: id,
      lastCheck: new Date(),
      tags: librarySource ? librarySource.tags : [],
      clips: librarySource ? librarySource.clips : [],
      blacklist: librarySource ? librarySource.blacklist : [],
      count: librarySource ? librarySource.count : 0,
      countComplete: librarySource ? librarySource.countComplete : false,
    }));
    id += 1;
  }
}

export function sortScene(state: State, algorithm: string, ascending: boolean): Object {
  if (algorithm == SF.random) {
    return {scenes: randomizeList(state.scenes.concat())}
  }
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

export function sortPlaylist(state: State, playlistName: string, algorithm: string, ascending: boolean): Object {
  const newPlaylists = Array.from(state.playlists);
  const playlist = newPlaylists.find((p) => p.name == playlistName);
  if (playlist) {
    playlist.audios = playlist.audios.map((aID) => state.audios.find((a) => a.id==aID)).concat().sort(audioSortFunction(algorithm, ascending)).map((a) => a.id);
    return {playlists: newPlaylists};
  }
  return {};
}

export function sortAudioSources(state: State, algorithm: string, ascending: boolean): Object {
  if (algorithm == ASF.random) {
    return {audios: randomizeList(state.audios.concat())};
  } else {
    const newLibrary = state.audios.concat().sort(audioSortFunction(algorithm, ascending));
    return {audios: newLibrary};
  }
}

function audioSortFunction(algorithm: string, ascending: boolean): (a: Audio, b: Audio) => number {
  return (a, b) => {
    let secondary = null;
    let aValue: any, bValue: any;
    switch (algorithm) {
      case ASF.url:
        aValue = a.url;
        bValue = b.url;
        break;
      case ASF.name:
        const reA = /^(A\s|a\s|The\s|the\s)/g
        aValue = a.name.replace(reA, "");
        bValue = b.name.replace(reA, "");

        const compare = aValue.localeCompare(bValue, 'en', { numeric: true });
        return ascending ? compare : compare * -1;
      case ASF.artist:
        aValue = a.artist;
        bValue = b.artist;
        secondary = ASF.album;
        break;
      case ASF.album:
        aValue = a.album;
        bValue = b.album;
        secondary = ASF.trackNum;
        break;
      case ASF.date:
        aValue = a.id;
        bValue = b.id;
        break;
      case ASF.trackNum:
        aValue = parseInt(a.trackNum as any);
        bValue = parseInt(b.trackNum as any);
        secondary = ASF.name;
        break;
      case ASF.duration:
        aValue = a.duration;
        bValue = b.duration;
        break;
      case ASF.playedCount:
        aValue = a.playedCount;
        bValue = b.playedCount;
        secondary = ASF.artist;
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
      if (!!secondary) {
        return audioSortFunction(secondary, true)(a, b);
      } else {
        return 0;
      }
    }
  }
}

export function sortScripts(state: State, algorithm: string, ascending: boolean): Object {
  if (algorithm == SF.random) {
    return {scripts: randomizeList(state.scripts.concat())};
  }
  const newLibrary = state.scripts.concat().sort(scriptSortFunction(algorithm, ascending));
  return {scripts: newLibrary};
}

function scriptSortFunction(algorithm: string, ascending: boolean): (a: CaptionScript, b: CaptionScript) => number {
  return (a, b) => {
    let aValue: any, bValue: any;
    switch (algorithm) {
      case SF.alpha:
        aValue = getFileName(a.url).toLowerCase();
        bValue = getFileName(b.url).toLowerCase();
        break;
      case SF.alphaFull:
        aValue = a.url.toLowerCase();
        bValue = b.url.toLowerCase();
        break;
      case SF.date:
        aValue = a.id;
        bValue = b.id;
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
      return 0;
    }
  }
}

export function sortSources(state: State, scene: Scene, algorithm: string, ascending: boolean): Object {
  if (algorithm == SF.random) {
    if (scene != null) {
      return updateScene(state, scene, (s) => s.sources = randomizeList(s.sources.concat()));
    } else {
      const newLibrary = randomizeList(state.library.concat());
      return {library: newLibrary};
    }
  }
  const getName = (a: LibrarySource) => {
    const sourceType = getSourceType(a.url);
    return sourceType == ST.video || sourceType == ST.playlist ? getFileName(a.url).toLowerCase() : getFileGroup(a.url).toLowerCase();
  };
  const getFullName = (a: LibrarySource) => {
    return a.url.toLowerCase();
  };
  const getCount = (a: LibrarySource) => {
    if (a.count === undefined) a.count = 0;
    if (a.countComplete === undefined) a.countComplete = false;
    if (getSourceType(a.url) == ST.video) {
      return a.clips.length;
    }
    return a.count;
  };
  const getType = (a: LibrarySource) => {
    return getSourceType(a.url)
  };
  let secondary: string = null;
  if (algorithm == SF.alpha) {
    secondary = SF.type;
  }
  if (algorithm == SF.type) {
    secondary = SF.alpha;
  }
  if (scene != null) {
    return updateScene(state, scene, (s) => s.sources = s.sources.sort(
      sortFunction(algorithm, ascending, getName, getFullName, getCount, getType, secondary)));
  } else {
    const newLibrary = state.library.concat().sort(
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
      case SF.duration:
        aValue = a.duration;
        bValue = b.duration;
        break;
      case SF.resolution:
        aValue = a.resolution;
        bValue = b.resolution;
        break;
      default:
        aValue = "";
        bValue = "";
    }

    if (algorithm == SF.duration || algorithm == SF.resolution) {
      if (aValue == null && bValue != null) {
        return 1;
      } else if (bValue == null && aValue != null) {
        return -1;
      } else if (bValue == null && aValue == null) {
        return 0;
      }
    }
    if (aValue < bValue) {
      return ascending ? -1 : 1;
    } else if (aValue > bValue) {
      return ascending ? 1 : -1;
    } else {
      if (!!secondary) {
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
    // Add grid
    for (let row of sceneCopy.grid) {
      for (let g of row) {
        const grid = state.scenes.find((s) => s.id == g);
        if (grid && !scenesToExport.find((s) => s.id == g)) {
          const gridCopy = JSON.parse(JSON.stringify(grid)); // Make a copy
          gridCopy.generatorWeights = null;
          gridCopy.overlays = [];
          scenesToExport.push(gridCopy);
        }
      }
    }
  } else {
    // Add overlays
    for (let o of sceneCopy.overlays) {
      const overlay = state.scenes.find((s) => s.id == o.sceneID);
      if (overlay && !scenesToExport.find((s) => s.id == o.sceneID)) {
        const overlayCopy = JSON.parse(JSON.stringify(overlay)); // Make a copy
        overlayCopy.generatorWeights = null;
        overlayCopy.overlays = [];
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

export function importScene(state: State, addToLibrary: boolean): Object {
  const filePath = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
    {filters: [{name:'All Files (*.*)', extensions: ['*']},{name: 'JSON Document', extensions: ['json']}], properties: ['openFile']});
  if (!filePath || !filePath.length) return;
  const importScenes = JSON.parse(fs.readFileSync(filePath[0], 'utf-8'));
  if (!importScenes[0].id || !importScenes[0].name || !importScenes[0].sources) {
    return {systemMessage: "Not a valid scene file"};
  }
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
      return {
        systemSnack: "Added " + sources.length + " new sources to the Library",
        scenes: newScenes,
        library: state.library.concat(sources),
        route: [new Route({kind: 'scene', value: scene.id})]
      };
    } else {
      return {systemSnack: "No new sources detected"};
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
  backup();
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

  return {systemSnack: "Library Import complete!", library: newLibrary, tags: newTags};
}

export function setMode(state: State, mode: string): Object {
  return {progressMode: mode};
}

export function markOffline(getState: () => State, setState: Function) {
  const win = remote.getCurrentWindow();
  const state = getState();
  const actionableLibrary = state.library.filter((ls) => {
    // If this link was checked within the last week, skip
    return new Date().getTime() - new Date(ls.lastCheck).getTime() >= 604800000;
  });

  const offlineLoop = () => {
    const state = getState();
    const offset = state.progressCurrent;
    if (state.progressMode == PR.cancel) {
      win.setProgressBar(-1);
      setState({progressMode: null, progressCurrent: 0, progressTotal: 0, progressTitle: ""});
    } else if (actionableLibrary.length == offset) {
      win.setProgressBar(-1);
      setState({
        systemSnack: "Offline Check has completed. Sources not available are now marked.",
        progressMode: null,
        progressCurrent: 0,
        progressTotal: 0,
        progressTitle: ""
      });
    } else if (actionableLibrary[offset].url.startsWith("http://") ||
      actionableLibrary[offset].url.startsWith("https://")) {
      const actionSource = actionableLibrary[offset];
      state.progressTitle = actionSource.url;
      setState({progressTitle: state.progressTitle});

      const librarySource = state.library.find((s) => s.url == actionSource.url);
      if (librarySource) {
        librarySource.lastCheck = new Date();
        wretch(librarySource.url)
          .get()
          .notFound((res) => {
            librarySource.offline = true;
            state.progressCurrent = offset + 1;
            setState({progressCurrent: state.progressCurrent});
            win.setProgressBar(state.progressCurrent / state.progressTotal);
            setTimeout(offlineLoop, 1000);
          })
          .res((res) => {
            librarySource.offline = false;
            state.progressCurrent = offset + 1;
            setState({progressCurrent: state.progressCurrent});
            win.setProgressBar(state.progressCurrent / state.progressTotal);
            setTimeout(offlineLoop, 1000);
          })
          .catch((e) => {
            console.error(e);
            librarySource.lastCheck = null;
            state.progressCurrent = offset + 1;
            setState({progressCurrent: state.progressCurrent});
            win.setProgressBar(state.progressCurrent / state.progressTotal);
            setTimeout(offlineLoop, 100);
          });
      } else {
        // Skip if removed from library during check
        state.progressCurrent = offset + 1;
        setState({progressCurrent: state.progressCurrent});
        win.setProgressBar(state.progressCurrent / state.progressTotal);
        setTimeout(offlineLoop, 100);
      }
    } else {
      const actionSource = actionableLibrary[offset];
      state.progressTitle = actionSource.url;
      state.progressCurrent = offset + 1;
      setState({progressTitle: state.progressTitle, progressCurrent: state.progressCurrent});
      win.setProgressBar(state.progressCurrent / state.progressTotal);

      actionSource.lastCheck = new Date();
      const exists = existsSync(actionSource.url);
      if (!exists) {
        actionSource.offline = true;
      }
      setTimeout(offlineLoop, 10);
    }
  };

  // If we don't have an import running
  if (!state.progressMode) {
    state.progressMode = PR.offline;
    state.progressCurrent = 0;
    state.progressTotal = actionableLibrary.length;
    setState({
      progressMode: state.progressMode,
      progressCurrent: state.progressCurrent,
      progressTotal: state.progressTotal,
    });
    win.setProgressBar(state.progressCurrent / state.progressTotal);
    offlineLoop();
  }
}

export function detectBPMs(getState: () => State, setState: Function) {
  const readMetadata = (audio: Audio, offset: number) => {
    const win = remote.getCurrentWindow();
    const state = getState();
    mm.parseFile(audio.url)
      .then((metadata: any) => {
        if (metadata && metadata.common && metadata.common.bpm) {
          audio.bpm = metadata.common.bpm;
          state.progressCurrent = offset + 1;
          setState({progressCurrent: state.progressCurrent});
          win.setProgressBar(state.progressCurrent / state.progressTotal);
          setTimeout(detectBPMLoop, 100);
        } else {
          detectBPM(audio, offset);
        }
      })
      .catch((e: any) => {
        console.error("Error reading track metadata: " + audio.url);
        console.error(e);
        detectBPM(audio, offset);
      });
  }

  const detectBPM = (audio: Audio, offset: number) => {
    const bpmError = (e: any) => {
      console.error("Error detecting track BPM: " + audio.url);
      console.error(e);
      const win = remote.getCurrentWindow();
      const state = getState();
      state.progressCurrent = offset + 1;
      setState({progressCurrent: state.progressCurrent});
      win.setProgressBar(state.progressCurrent / state.progressTotal);
      setTimeout(detectBPMLoop, 100);
    }

    const detectBPM = (data: ArrayBuffer) => {
      const maxByteSize = 200000000;
      if (data.byteLength < maxByteSize) {
        const win = remote.getCurrentWindow();
        const state = getState();
        let context = new AudioContext();
        context.decodeAudioData(data, (buffer) => {
          analyze(buffer)
            .then((tempo: number) => {
              audio.bpm = Number.parseFloat(tempo.toFixed(2));
              state.progressCurrent = offset + 1;
              setState({progressCurrent: state.progressCurrent});
              win.setProgressBar(state.progressCurrent / state.progressTotal);
              setTimeout(detectBPMLoop, 100);
            })
            .catch((e: any) => {
              bpmError(e);
            });
        }, (e) => {
          bpmError(e);
        });
      } else {
        console.error("'" + audio.url + "' is too large to decode");
      }
    }

    try {
      const url = audio.url;
      if (existsSync(url)) {
        detectBPM(toArrayBuffer(readFileSync(url)));
      } else {
        request.get({url, encoding: null}, function (e: Error, res: IncomingMessage, body: Buffer) {
          if (e) {
            bpmError(e);
            return;
          }
          detectBPM(toArrayBuffer(body));
        });
      }
    } catch (e) {
      bpmError(e);
    }
  }

  const detectBPMLoop = () => {
    const state = getState();
    const offset = state.progressCurrent;
    if (state.progressMode == PR.cancel) {
      win.setProgressBar(-1);
      setState({progressMode: null, progressCurrent: 0, progressTotal: 0, progressTitle: ""});
    } else if (actionableLibrary.length == offset) {
      win.setProgressBar(-1);
      setState({
        systemSnack: "BPM Detection has completed.",
        progressMode: null,
        progressCurrent: 0,
        progressTotal: 0,
        progressTitle: ""
      });
    } else {
      const actionSource = actionableLibrary[offset];
      state.progressTitle = actionSource.url;
      setState({progressTitle: state.progressTitle});

      const librarySource = state.audios.find((s) => s.url == actionSource.url);
      if (librarySource) {
        readMetadata(librarySource, offset)
      } else {
        // Skip if removed from library during check
        state.progressCurrent = offset + 1;
        setState({progressCurrent: state.progressCurrent});
        win.setProgressBar(state.progressCurrent / state.progressTotal);
        detectBPMLoop();
      }
    }
  }

  const win = remote.getCurrentWindow();
  const state = getState();
  const actionableLibrary = state.audios.filter((a) => a.bpm == 0);

  // If we don't have an import running
  if (!state.progressMode) {
    state.progressMode = PR.bpm;
    state.progressCurrent = 0;
    state.progressTotal = actionableLibrary.length;
    setState({
      progressMode: state.progressMode,
      progressCurrent: state.progressCurrent,
      progressTotal: state.progressTotal,
    });
    win.setProgressBar(state.progressCurrent / state.progressTotal);
    detectBPMLoop();
  }
}

export function updateVideoMetadata(getState: () => State, setState: Function) {
  const win = remote.getCurrentWindow();
  const state = getState();
  const actionableLibrary = state.library.filter((ls) => getSourceType(ls.url) == ST.video && (ls.duration == null || ls.resolution == null));

  const videoMetadataLoop = () => {
    const state = getState();
    const offset = state.progressCurrent;
    if (state.progressMode == PR.cancel) {
      win.setProgressBar(-1);
      setState({progressMode: null, progressCurrent: 0, progressTotal: 0, progressTitle: ""});
    } else if (actionableLibrary.length == offset) {
      win.setProgressBar(-1);
      setState({
        systemSnack: "Video Metadata update has completed.",
        progressMode: null,
        progressCurrent: 0,
        progressTotal: 0,
        progressTitle: ""
      });
    } else {
      const actionSource = actionableLibrary[offset];
      state.progressTitle = actionSource.url;
      setState({progressTitle: state.progressTitle});

      const librarySource = state.library.find((s) => s.url == actionSource.url);
      if (librarySource) {
        let video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          const height = video.videoHeight;
          const width = video.videoWidth;
          librarySource.resolution = Math.min(height, width);
          librarySource.duration = video.duration;
          video.remove();
          state.progressCurrent = offset + 1;
          setState({progressCurrent: state.progressCurrent});
          win.setProgressBar(state.progressCurrent / state.progressTotal);
          setTimeout(videoMetadataLoop, 100);
        }
        video.onerror = () => {
          video.remove();
          state.progressCurrent = offset + 1;
          setState({progressCurrent: state.progressCurrent});
          win.setProgressBar(state.progressCurrent / state.progressTotal);
          setTimeout(videoMetadataLoop, 100);
        }

        video.src = librarySource.url;
      } else {
        // Skip if removed from library during check
        state.progressCurrent = offset + 1;
        setState({progressCurrent: state.progressCurrent});
        win.setProgressBar(state.progressCurrent / state.progressTotal);
        videoMetadataLoop();
      }
    }
  }

  // If we don't have an import running
  if (!state.progressMode && actionableLibrary.length) {
    state.progressMode = PR.videoMetadata;
    state.progressCurrent = 0;
    state.progressTotal = actionableLibrary.length;
    setState({
      progressMode: state.progressMode,
      progressCurrent: state.progressCurrent,
      progressTotal: state.progressTotal,
    });
    win.setProgressBar(state.progressCurrent / state.progressTotal);
    videoMetadataLoop();
  }
}

export function importTumblr(getState: () => State, setState: Function) {
  let client: TumblrClient;
  const win = remote.getCurrentWindow();
  // Define our loop
  const tumblrImportLoop = () => {
    const state = getState();
    const offset = state.progressCurrent;
    if (state.progressMode == PR.cancel) {
      win.setProgressBar(-1);
      setState({progressMode: null, progressCurrent: 0, progressTotal: 0});
      return;
    }
    // Get the next page of blogs
    client.userFollowing({offset: offset}, (err, data) => {
      if (err) {
        win.setProgressBar(-1);
        setState({systemMessage: "Error retrieving following: " + err, progressMode: null, progressCurrent: 0, progressTotal: 0});
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
      const newestState = getState();
      let sourceURLs = newestState.library.map((s) => s.url);
      following = following.filter((b) => !sourceURLs.includes(b));

      let id = newestState.library.length + 1;
      newestState.library.forEach((s) => {
        id = Math.max(s.id + 1, id);
      });

      // Add to Library
      let newLibrary = newestState.library;
      for (let url of following) {
        newLibrary = newLibrary.concat([new LibrarySource({
          url: url,
          id: id,
          tags: new Array<Tag>(),
        })]);
        id += 1;
      }
      setState({library: newLibrary});

      let nextOffset = offset + 20;
      if (offset > state.progressTotal) {
        nextOffset = state.progressTotal;
      }

      // Update progress
      setState({progressCurrent: nextOffset});
      win.setProgressBar(nextOffset / state.progressTotal);

      // Loop until we run out of blogs
      if ((nextOffset) < state.progressTotal) {
        setTimeout(tumblrImportLoop, 1500);
      } else {
        win.setProgressBar(-1);
        setState({systemSnack: "Tumblr Following Import has completed", progressMode: null, progressCurrent: 0, progressTotal: 0});
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
        win.setProgressBar(-1);
        setState({systemMessage: "Error retrieving following: " + err, progressMode: null, progressCurrent: 0, progressTotal: 0});
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
      win.setProgressBar(state.progressCurrent / state.progressTotal);
      tumblrImportLoop();
    });
  }
}

export function importReddit(getState: () => State, setState: Function) {
  let reddit: any;
  const win = remote.getCurrentWindow();
  const redditImportLoop = () => {
    const state = getState();
    if (state.progressMode == PR.cancel) {
      win.setProgressBar(-1);
      setState({progressMode: null, progressNext: null, progressCurrent: 0});
      return;
    }
    reddit.getSubscriptions({limit: 20, after: state.progressNext}).then((subscriptionListing: any) => {
      if (subscriptionListing.length == 0) {
        win.setProgressBar(-1);
        setState({systemSnack: "Reddit Subscription Import has completed", progressMode: null, progressNext: null, progressCurrent: 0});
      } else {
        // Get the next 20 blogs
        let subscriptions = [];
        for (let sub of subscriptionListing) {
          const subURL = "http://www.reddit.com" + sub.url;
          subscriptions.push(subURL);
        }

        // dedup
        const newestState = getState();
        let sourceURLs = newestState.library.map((s) => s.url);
        subscriptions = subscriptions.filter((s) => !sourceURLs.includes(s));

        let id = newestState.library.length + 1;
        newestState.library.forEach((s) => {
          id = Math.max(s.id + 1, id);
        });

        // Add to Library
        let newLibrary = newestState.library;
        for (let url of subscriptions) {
          newLibrary = newLibrary.concat([new LibrarySource({
            url: url,
            id: id,
            tags: new Array<Tag>(),
          })]);
          id += 1;
        }
        setState({library: newLibrary});

        // Loop until we run out of blogs
        setTimeout(redditImportLoop, 1500);
        state.progressNext = subscriptionListing[subscriptionListing.length - 1].name;
        state.progressCurrent = state.progressCurrent + 1;
        setState({progressNext: state.progressNext, progressCurrent: state.progressCurrent});
        win.setProgressBar(2);
      }
    }).catch((err: any) => {
      console.error(err);
      win.setProgressBar(-1);
      setState({systemMessage: "Error retrieving subscriptions: " + err, progressMode: null, progressNext: null, progressCurrent: 0});
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
    state.progressMode = PR.reddit;
    state.progressCurrent = 0;
    setState({
      systemSnack: "Your Reddit subscriptions are being imported... You will recieve an alert when the import is finished.",
      progressMode: state.progressMode, progressCurrent: state.progressCurrent
    });
    win.setProgressBar(2);
    redditImportLoop();
  }
}

export function importTwitter(getState: () => State, setState: Function) {
  let twitter: any;
  const win = remote.getCurrentWindow();
  const twitterImportLoop = () => {
    const state = getState();
    if (state.progressMode == PR.cancel) {
      win.setProgressBar(-1);
      setState({progressMode: null, progressNext: null, progressCurrent: 0});
      return;
    }
    twitter.get('friends/list', !state.progressNext ? {count: 200} : {count: 200, cursor: state.progressNext}, (error: any, data: any) => {
      if (error) {
        let message = "Error retrieving following:";
        for (let e of error) {
          message = message + "\n" + e.code + " - " + e.message;
          console.error("Error retrieving following: " + e.code + " - " + e.message);
        }
        win.setProgressBar(-1);
        setState({systemMessage: message, progressMode: null, progressNext: null, progressCurrent: 0});
        return;
      }

      // Get the next 200 users
      let following = [];
      for (let user of data.users) {
        const userURL = "https://twitter.com/" + user.screen_name;
        following.push(userURL);
      }

      // dedup
      const newestState = getState();
      let sourceURLs = newestState.library.map((s) => s.url);
      following = following.filter((s) => !sourceURLs.includes(s));

      let id = newestState.library.length + 1;
      newestState.library.forEach((s) => {
        id = Math.max(s.id + 1, id);
      });

      // Add to Library
      let newLibrary = newestState.library;
      for (let url of following) {
        newLibrary = newLibrary.concat([new LibrarySource({
          url: url,
          id: id,
          tags: new Array<Tag>(),
        })]);
        id += 1;
      }
      setState({library: newLibrary});

      if (data.next_cursor == 0) { // We're done
        win.setProgressBar(-1);
        setState({systemSnack: "Twitter Following Import has completed", progressMode: null, progressNext: null, progressCurrent: 0});
      } else {
        // Loop until we run out of blogs
        setTimeout(twitterImportLoop, 1500);
        state.progressNext = data.next_cursor;
        state.progressCurrent = state.progressCurrent + 1;
        setState({progressNext: state.progressNext, progressCurrent: state.progressCurrent});
        win.setProgressBar(2);
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
    state.progressMode = PR.twitter;
    state.progressCurrent = 0;
    setState({
      systemSnack: "Your Twitter Following is being imported... You will recieve an alert when the import is finished.",
      progressMode: state.progressMode, progressCurrent: state.progressCurrent
    });
    win.setProgressBar(2);
    twitterImportLoop();
  }
}

let ig: IgApiClient = null;
let session: any = null;
export function importInstagram(getState: () => State, setState: Function) {
  const win = remote.getCurrentWindow();
  const processItems = (items: any, next: any) => {
    let following = [];
    for (let account of items) {
      const accountURL = "https://www.instagram.com/" + account.username + "/";
      following.push(accountURL);
    }

    // dedup
    const newestState = getState();
    let sourceURLs = newestState.library.map((s) => s.url);
    following = following.filter((s) => !sourceURLs.includes(s));

    let id = newestState.library.length + 1;
    newestState.library.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    // Add to Library
    let newLibrary = newestState.library;
    for (let url of following) {
      newLibrary = newLibrary.concat([new LibrarySource({
        url: url,
        id: id,
        tags: new Array<Tag>(),
      })]);
      id += 1;
    }
    setState({library: newLibrary});

    // Loop until we run out of blogs
    setTimeout(instagramImportLoop, 1500);
    state.progressNext = next;
    state.progressCurrent = state.progressCurrent + 1;
    setState({progressNext: state.progressNext, progressCurrent: state.progressCurrent});
    win.setProgressBar(2);
  };

  const error = (error: string) => {
    win.setProgressBar(-1);
    setState({systemMessage: error, progressMode: null, progressNext: null, progressCurrent: 0});
    console.error(error);
    ig = null;
  };

  // Define our loop
  const instagramImportLoop = () => {
    const state = getState();
    if (state.progressMode == PR.cancel) {
      win.setProgressBar(-1);
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
          }).catch((e) => {error(e);});
        }).catch((e) => {error(e);});
      }).catch((e) => {error(e);});
    } else {
      ig.state.deserializeCookieJar(JSON.parse(session)).then((data) => {
        const id = (state.progressNext as string).split("~")[0];
        const feedSession = (state.progressNext as string).split("~")[1];
        const followingFeed = ig.feed.accountFollowing(id);
        followingFeed.deserialize(feedSession);
        if (!followingFeed.isMoreAvailable()) {
          ig = null;
          win.setProgressBar(-1);
          setState({systemSnack: "Instagram Following Import has completed", progressMode: null, progressNext: null, progressCurrent: 0});
          return;
        }
        followingFeed.items().then((items) => {
          processItems(items, id + "~" + followingFeed.serialize());
        }).catch((e) => {error(e);});
      }).catch((e) => {error(e);});
    }
  };

  const state = getState();
  if (!state.progressMode) {
    // Show progress bar and kick off loop
    state.progressMode = PR.instagram;
    state.progressCurrent = 0;
    setState({
      systemSnack: "Your Instagram Following is being imported... You will recieve an alert when the import is finished.",
      progressMode: state.progressMode, progressCurrent: state.progressCurrent
    });
    win.setProgressBar(2);
    instagramImportLoop();
  }
}