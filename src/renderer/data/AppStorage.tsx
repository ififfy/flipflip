import { copyFileSync, mkdirSync, existsSync, readFileSync, renameSync, writeFile } from 'fs';

import {getBackups, portablePath, removeDuplicatesBy, saveDir, savePath} from "./utils";
import {cleanBackups} from "./actions";
import { Route } from './Route';
import {TT} from "./const";
import Audio from "./Audio";
import LibrarySource from '../data/LibrarySource';
import Tag from "../data/Tag";
import WeightGroup from "../data/WeightGroup";
import Config from "./Config";
import Scene from './Scene';
import SceneGrid from "./SceneGrid";
import defaultTheme from "./theme";
import Playlist from "./Playlist";
import CaptionScript from "./CaptionScript";

/**
 * A compile-time global variable defined in webpack.config' [plugins]
 * section to pick up the version string from package.json
 */
export declare var __VERSION__: string;

export const defaultInitialState = {
  version: __VERSION__,
  config: new Config(),
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
  systemSnack: null as string,
  tutorial: null as string,
  theme: defaultTheme,
};

/**
 * Archives a file (if it exists) to same path appending '.{epoch now}'
 * to the file name
 * @param {string} filePath
 */
function archiveFile(filePath: string): void {
  if (existsSync(filePath)) {
    copyFileSync(filePath, (filePath + '.' + Date.now()));
  }
}

export default class AppStorage {
  initialState: any = defaultInitialState;

  constructor(windowId: number) {
    try {
      mkdirSync(saveDir);
    }
    catch (e) {
      // who cares
    }
    try {
      let data;
      let portableMode = false;
      if (!existsSync(savePath) && existsSync(portablePath)) {
        data = JSON.parse(readFileSync(portablePath, 'utf-8'));
        if (!data.config.generalSettings.portableMode) {
          data = JSON.parse(readFileSync(savePath, 'utf-8'));
        } else {
          portableMode = true;
          console.log("Portable: " + portablePath);
        }
      } else {
        data = JSON.parse(readFileSync(savePath, 'utf-8'));
        if (data.config.generalSettings.portableMode) {
          portableMode = true;
          console.log("Portable: " + portablePath);
          data = JSON.parse(readFileSync(portablePath, 'utf-8'));
        }
      }

      if (portableMode) {
        if (existsSync(`${portablePath}.new`)) console.warn("FOUND OLD SAVE");
      } else {
        if (existsSync(`${savePath}.new`)) console.warn("FOUND OLD SAVE");
      }

      if (data.version != __VERSION__) {
        // Preserve the existing file - so as not to destroy user's data
        archiveFile(portableMode ? portablePath : savePath);
      }

      switch (data.version) {
        // When no version number found in data.json -- assume pre-v2.0.0 format
        // This should fail safe and self heal.
        case undefined:
          // Create Library from aggregate of previous scenes' directories
          let sources = Array<string>();
          for (let scene of data.scenes) {
            sources = sources.concat(scene.directories);
          }
          sources = removeDuplicatesBy((s: string) => s, sources);
          // Create our initialState object
          this.initialState = {
            version: __VERSION__,
            specialMode: data.specialMode ? data.specialMode : null,
            openTab: data.openTab ? data.openTab : 0,
            displayedSources: Array<LibrarySource>(),
            config: data.config ? new Config(data.config) : new Config(),
            scenes: Array<Scene>(),
            grids: Array<SceneGrid>(),
            audios: Array<Audio>(),
            scripts: Array<CaptionScript>(),
            playlists: Array<Playlist>(),
            library: Array<LibrarySource>(),
            tags: Array<Tag>(),
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
            theme: defaultTheme,
          };
          // Hydrate and add the library ! Yay!!! :)
          let libraryID = 0;
          const newLibrarySources = Array<LibrarySource>();
          for (let url of sources) {
            newLibrarySources.push(new LibrarySource({
              url: url,
              id: libraryID,
              tags: Array<Tag>(),
            }));
            libraryID += 1;
          }
          this.initialState.library = newLibrarySources;
          // Convert and add old scenes
          const newScenes = Array<Scene>();
          for (let oldScene of data.scenes) {
            const newScene = new Scene(oldScene);
            let sourceID = 0;
            const newSources = Array<LibrarySource>();
            for (let oldDirectory of oldScene.directories) {
              newSources.push(new LibrarySource({
                url: oldDirectory,
                id: sourceID,
                tags: Array<Tag>(),
              }));
              sourceID += 1;
            }
            newScene.sources = newSources;
            newScenes.push(newScene);
          }
          this.initialState.scenes = newScenes;
          break;
        case "2.0.0":
        case "2.1.0":
        case "2.1.1":
        case "2.2.0":
        case "2.2.1":
        case "2.3.0":
        case "2.3.1":
        case "2.3.2":
        case "3.0.0-beta1":
        case "3.0.0-beta2":
          this.initialState = {
            version: __VERSION__,
            specialMode: data.specialMode,
            openTab: 0,
            displayedSources: Array<LibrarySource>(),
            config: new Config(data.config),
            scenes: data.scenes.map((s: any) => new Scene(s)),
            grids: Array<SceneGrid>(),
            audios: Array<Audio>(),
            scripts: Array<CaptionScript>(),
            playlists: Array<Playlist>(),
            library: data.library.map((s: any) => new LibrarySource(s)),
            tags: data.tags.map((t: any) => new Tag(t)),
            route: [],
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
            systemSnack: null as string,
            tutorial: null as string,
            theme: defaultTheme,
          };

          // Port to new generator format
          for (let scene of this.initialState.scenes) {
            // If this is a generator scene
            if (scene.tagWeights || scene.sceneWeights) {
              scene.generatorWeights = [];
              // Get weights for this scene
              const tagWeights = new Map<Tag, { type: string, value: number }>(JSON.parse(scene.tagWeights));
              let sceneWeights = new Map<number, { type: string, value: number }>();
              if (scene.sceneWeights != null) {
                sceneWeights = new Map<number, { type: string, value: number }>(JSON.parse(scene.sceneWeights));
              }
              const weights = Array.from(tagWeights.values()).concat(Array.from(sceneWeights.values()));
              const sum = weights.length > 0 ? weights.map((w) => w.value).reduce((total, value) => Number(total) + Number(value)) : 0;

              // For each tag weight
              for (let tag of tagWeights.keys()) {
                const weight = tagWeights.get(tag);
                // If this is relevant
                if (weight.type != TT.weight || weight.value > 0) {
                  // Add as weight group
                  const wg = new WeightGroup();
                  // Convert weight to percentage
                  if (weight.value > 0) {
                    wg.percent = Math.round((weight.value / sum) * 100);
                  } else {
                    wg.percent = 0;
                  }
                  wg.type = weight.type;
                  wg.tag = tag;
                  wg.name = tag.name;

                  scene.generatorWeights.push(wg);
                }
              }

              // For each scene weight
              for (let sceneID of sceneWeights.keys()) {
                const weight = sceneWeights.get(sceneID);
                // If this is relevant
                if (weight.value > 0) {
                  const wg = new WeightGroup();
                  wg.percent = Math.round((weight.value / sum) * 100);
                  wg.type = TT.weight;

                  // Build a set of rules from this scene's weights
                  const tagScene = this.initialState.scenes.find((s: Scene) => s.id == sceneID);
                  if (tagScene.tagWeights) {
                    const tagWeights = new Map<Tag, { type: string, value: number }>(JSON.parse(tagScene.tagWeights));
                    const weights = Array.from(tagWeights.values());
                    const swSum = weights.length > 0 ? weights.map((w) => w.value).reduce((total, value) => Number(total) + Number(value)) : 0;
                    const rules = new Array<WeightGroup>();
                    let name = "";

                    // For each tag weight
                    for (let tag of tagWeights.keys()) {
                      const weight = tagWeights.get(tag);
                      // If this is relevant
                      if (weight.type != TT.weight || weight.value > 0) {
                        // Add as weight group
                        const rule = new WeightGroup();
                        if (weight.value > 0) {
                          rule.percent = Math.round((weight.value / swSum) * 100);
                        } else {
                          rule.percent = 0;
                        }
                        rule.type = weight.type;
                        rule.tag = tag;
                        rule.name = tag.name;
                        rules.push(rule);
                        const comma = name != "";
                        if (comma) name = name + ", ";
                        switch (weight.type) {
                          case TT.weight:
                            name = name + rule.percent + "% " + rule.name;
                            break;
                          case TT.all:
                            name = name + "Y " + rule.name;
                            break;
                          case TT.none:
                            name = name + "N " + rule.name;
                            break;
                        }
                      }
                    }

                    // Ensure weights are valid
                    let remaining = 100;
                    for (let rule of rules) {
                      if (rule.type == TT.weight) {
                        remaining = remaining - rule.percent;
                      }
                    }
                    if (remaining != 0 && remaining != 100) {
                      rules[0].percent = rules[0].percent + remaining;
                    }

                    // Add rules
                    wg.rules = rules;
                    wg.name = name;
                    scene.generatorWeights.push(wg);
                  }
                }
              }

              // Ensure weights are valid
              let remaining = 100;
              for (let wg of scene.generatorWeights) {
                if (wg.type == TT.weight) {
                  remaining = remaining - wg.percent;
                }
              }
              if (remaining != 0 && remaining != 100) {
                for (let wg of scene.generatorWeights) {
                  if (wg.type == TT.weight) {
                    wg.percent = wg.percent + remaining;
                    break;
                  }
                }
              }

              scene.tagWeights = null;
              scene.sceneWeights = null;
            }
          }

          for (let i = 0; i < this.initialState.library.length; i++) {
            this.initialState.library[i].id = i;
          }
          break;
        default:
          this.initialState = {
            version: __VERSION__,
            specialMode: data.specialMode,
            openTab: data.openTab,
            displayedSources: Array<LibrarySource>(),
            config: new Config(data.config),
            scenes: data.scenes.map((s: any) => new Scene(s)),
            grids: data.grids.map((g: any) => new SceneGrid(g)),
            audios: data.audios ? data.audios.map((a: any) => new Audio(a)) : [],
            scripts: data.scripts ? data.scripts.map((s: any) => new CaptionScript(s)) : [],
            playlists: data.playlists ? data.playlists.map((p: any) => new Playlist(p)) : [],
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
            tutorial: data.tutorial,
            theme: data.theme,
          };
          break;
      }
    }
    catch (e) {
      // When an error occurs archive potentially incompatible data.json file
      // This essentially renames the data.json file and thus the app is self-healing
      // in that it will recreate an initial (blank) data.json file on restarting
      // - The archived file being available for investigation.
      console.error(e);
      archiveFile(savePath);
    }

    if (windowId == 1) {
      if (this.initialState.config.generalSettings.portableMode) {
        console.log("Saving to", portablePath);
        if (this.initialState.config.generalSettings.disableLocalSave) {
          return;
        }
      }
      console.log("Saving to", savePath);
    }
  }

  writeFileTransactional (path: any, content: any, callback?: Function) {
    let temporaryPath = `${path}.new`;
    writeFile(temporaryPath, content, function (err) {
      if (err) {
        console.error(err);
        return;
      }
      renameSync(temporaryPath, path);
      if (callback) {
        callback();
      }
    });
  };

  save(state: any, callback?: Function) {
    if (state.config.generalSettings.portableMode) {
      this.writeFileTransactional(portablePath, JSON.stringify(state), callback);
      if (!state.config.generalSettings.disableLocalSave) {
        this.writeFileTransactional(savePath, JSON.stringify(state), callback);
      }
    } else {
      this.writeFileTransactional(savePath, JSON.stringify(state), callback);
    }

    if (callback) return;

    if (state.config.generalSettings.autoBackup) {
      const backups = getBackups();
      if (backups.length == 0) {
        this.backup(state);
      } else {
        const lastBackup = backups[0];
        const epoch = parseInt(lastBackup.url.substring(lastBackup.url.lastIndexOf(".") + 1));
        if (Date.now()  - epoch > (86400000 * state.config.generalSettings.autoBackupDays)) {
          this.backup(state);
        }
      }
    }

    if (state.config.generalSettings.autoCleanBackup) {
      const backups = getBackups();
      const lastBackup = backups[0];
      const epoch = parseInt(lastBackup.url.substring(lastBackup.url.lastIndexOf(".") + 1));
      if (Date.now()  - epoch > (86400000 * state.config.generalSettings.autoBackupDays)) {
        cleanBackups(state.config);
      }
    }

  }

  backup(state: any) {
    if (state.config.generalSettings.portableMode) {
      archiveFile(portablePath);
      if (!state.config.generalSettings.disableLocalSave) {
        archiveFile(savePath);
      }
    } else {
      archiveFile(savePath);
    }
  }
}
