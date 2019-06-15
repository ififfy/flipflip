import { mkdirSync, existsSync, readFileSync, renameSync, writeFileSync } from 'fs';
import path from 'path';

import { removeDuplicatesBy, saveDir } from "./utils";
import { Route } from './Route';
import Config from "./Config";
import Scene from './Scene';
import LibrarySource from '../components/library/LibrarySource';
import Tag from "../components/library/Tag";

/**
 * A compile-time global variable defined in webpack.config'
 *  [plugins] section to pick up the version string from 
 *   package.json
 */
export declare var __VERSION__: string;

export const defaultInitialState = {
  version: __VERSION__,
  config: new Config(),
  scenes: Array<Scene>(),
  library: Array<LibrarySource>(),
  tags: Array<Tag>(),
  route: Array<Route>(),
  autoEdit: false,
  isSelect: false,
  isBatchTag: false,
  libraryYOffset: 0,
  libraryFilters: Array<string>(),
  librarySelected: Array<string>(),
};

/**
 * Archives a file (if it exists) to same path appending '.{epoch now}' 
 * to the file name 
 * @param {string} filePath 
 */
function archiveFile(filePath: string): void {
  if (existsSync(filePath)) {
    renameSync(filePath, (filePath + '.' + Date.now()));
  }
}

export default class AppStorage {
  initialState: any = defaultInitialState;
  savePath: string;

  constructor() {
    try {
      mkdirSync(saveDir);
    }
    catch (e) {
      // who cares
    }
    const savePath = path.join(saveDir, 'data.json');
    console.log("Saving to", savePath);
    try {
      const data = JSON.parse(readFileSync(savePath, 'utf-8'));
      switch (data.version) {
        // When no version number found in data.json -- assume pre-v2.0.0 format
        // This should fail safe and self heal.
        case undefined:
          // Preserve the existing file - so as not to destroy user's data
          archiveFile(savePath);
          // Create Library from aggregate of previous scenes' directories
          let sources = Array<string>();
          for (let scene of data.scenes) {
            sources = sources.concat(scene.directories);
          }
          sources = removeDuplicatesBy((s: string) => s, sources);
          // Create our initialState object
          this.initialState = {
            version: __VERSION__,
            autoEdit: data.autoEdit,
            isSelect: data.isSelect ? data.isSelect : false,
            isBatchTag: data.isBatchTag ? data.isBatchTag : false,
            config: data.config ? new Config(data.config) : new Config(),
            scenes: Array<Scene>(),
            library: Array<LibrarySource>(),
            tags: Array<Tag>(),
            route: data.route.map((s: any) => new Route(s)),
            libraryYOffset: 0,
            libraryFilters: Array<string>(),
            librarySelected: Array<string>(),
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
        default:
          this.initialState = {
            version: __VERSION__,
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
          };
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

    this.savePath = savePath;
  }

  save(state: any) {
    writeFileSync(this.savePath, JSON.stringify(state), 'utf-8');
  }

  backup(showAlert: boolean): boolean {
    try {
      archiveFile(this.savePath);
    } catch (e) {
      if (showAlert) {
        alert("Backup error:\n" + e);
      }
      return false;
    }
    if (showAlert) {
      alert("Backup success!");
    }
    return true;
  }
}
