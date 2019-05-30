import {remote, app} from 'electron';
import {readFileSync, writeFileSync} from 'fs';
import * as fs from "fs";
import * as React from 'react';
import path from 'path';

import {getBackups, saveDir} from "../data/utils";
import Config from "../data/Config";
import Scene from '../data/Scene';
import ScenePicker from './ScenePicker';
import ConfigForm from './config/ConfigForm';
import Library from './library/Library';
import LibrarySource from './library/LibrarySource';
import Tag from "./library/Tag";
import TagManager from "./library/TagManager";
import SceneGenerator from "./library/SceneGenerator";
import Player from './player/Player';
import SceneDetail from './sceneDetail/SceneDetail';
import { Route } from '../data/Route';
import AppStorage from '../data/AppStorage';

const appStorage = new AppStorage();

export default class Meta extends React.Component {
  readonly state = appStorage.initialState;

  isRoute(kind: string): Boolean {
    if (this.state.route.length < 1) return false;
    return this.state.route[this.state.route.length - 1].kind === kind;
  }

  scene?(): Scene {
    for (let r of this.state.route.slice().reverse()) {
      if (r.kind == 'scene' || r.kind == 'generate') {
        return this.state.scenes.find((s: any) => s.id === r.value);
      }
    }
    return null;
  }

  librarySource?(): LibrarySource {
    const libraryID = this.scene().libraryID;
    for (let s of this.state.library) {
      if (s.id == libraryID) {
        return s;
      }
    }
    return null;
  }

  componentDidMount() {
    setInterval(appStorage.save.bind(appStorage, this.state), 500);
  }

  render() {
    return (
      <div className="Meta">
        {this.state.route.length === 0 && (
          <ScenePicker
            scenes={this.state.scenes}
            version={this.state.version}
            libraryCount={this.state.library.length}
            onUpdateScenes={this.onUpdateScenes.bind(this)}
            onAdd={this.onAddScene.bind(this)}
            onImport={this.onImport.bind(this)}
            onSelect={this.onOpenScene.bind(this)}
            onOpenLibrary={this.onOpenLibrary.bind(this)}
            onGenerate={this.onAddGenerator.bind(this)}
            onConfig={this.onConfig.bind(this)}
            canGenerate={(this.state.library.length >= 1 && this.state.tags.length >= 1) || (this.state.scenes.length >= 1)}
          />
        )}

        {this.isRoute('library') && (
          <Library
            library={this.state.library}
            tags={this.state.tags}
            config={this.state.config}
            isSelect={this.state.isSelect}
            yOffset={this.state.libraryYOffset}
            filters={this.state.libraryFilters}
            onPlay={this.onPlaySceneFromLibrary.bind(this)}
            onUpdateLibrary={this.onUpdateLibrary.bind(this)}
            goBack={this.goBack.bind(this)}
            manageTags={this.manageTags.bind(this)}
            importSources={this.onImportFromLibrary.bind(this)}
            onClearReddit={this.clearReddit.bind(this)}
          />
        )}

        {this.isRoute('tags') && (
          <TagManager
            tags={this.state.tags}
            onUpdateTags={this.onUpdateTags.bind(this)}
            goBack={this.goBack.bind(this)}
          />
        )}

        {this.isRoute('generate') && (
          <SceneGenerator
            library={this.state.library}
            tags={this.state.tags}
            autoEdit={this.state.autoEdit}
            scenes={this.state.scenes}
            scene={this.scene()}
            goBack={this.goBack.bind(this)}
            onGenerate={this.onGenerateScene.bind(this)}
            onUpdateScene={this.onUpdateScene.bind(this)}
            onDelete={this.onDeleteScene.bind(this)}
          />
        )}

        {this.isRoute('scene') && (
          <SceneDetail
            scene={this.scene()}
            allScenes={this.state.scenes}
            autoEdit={this.state.autoEdit}
            goBack={this.goBack.bind(this)}
            onExport={this.onExport.bind(this)}
            onDelete={this.onDeleteScene.bind(this)}
            onPlay={this.onPlayScene.bind(this)}
            onUpdateScene={this.onUpdateScene.bind(this)}
            onOpenLibraryImport={this.onOpenLibraryImport.bind(this)}
            saveScene={this.saveScene.bind(this)}
          />
        )}

        {this.isRoute('play') && (
          <Player
            config={this.state.config}
            scene={this.scene()}
            scenes={this.state.scenes}
            onUpdateScene={this.onUpdateScene.bind(this)}
            nextScene={this.nextScene.bind(this)}
            goBack={this.goBack.bind(this)}
          />
        )}

        {this.isRoute('libraryplay') && (
          <Player
            config={this.state.config}
            scene={this.scene()}
            scenes={this.state.scenes}
            onUpdateScene={this.onUpdateScene.bind(this)}
            nextScene={this.nextScene.bind(this)}
            goBack={this.endPlaySceneFromLibrary.bind(this)}
            tags={this.librarySource().tags}
            allTags={this.state.tags}
            toggleTag={this.onToggleTag.bind(this)}
          />
        )}

        {this.isRoute('config') && (
          <ConfigForm
            config={this.state.config}
            scenes={this.state.scenes}
            goBack={this.goBack.bind(this)}
            updateConfig={this.updateConfig.bind(this)}
            onDefault={this.onDefaultConfig.bind(this)}
            onBackup={appStorage.backup.bind(appStorage)}
            onRestore={this.restore.bind(this)}
            onClean={this.cleanBackups.bind(this)}
            onClearTumblr={this.clearTumblr.bind(this)}
            onClearReddit={this.clearReddit.bind(this)}
          />
        )}
      </div>
    )
  }

  restore(backupFile: string) {
    try {
      const data = JSON.parse(readFileSync(backupFile, 'utf-8'));
      this.setState({
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
      });
    } catch (e) {
      alert("Restore error:\n" + e);
      return;
    }
    alert("Restore success!");
  }

  cleanBackups() {
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
  }

  goBack() {
    const newRoute = this.state.route;
    this.state.route.pop();
    this.setState({route: newRoute, autoEdit: false, isSelect: false});
  }

  saveScene() {
    let id = this.state.scenes.length + 1;
    this.state.scenes.forEach((s: any) => {
      id = Math.max(s.id + 1, id);
    });
    const sceneCopy = JSON.parse(JSON.stringify(this.scene())); // Make a copy
    sceneCopy.tagWeights = null;
    sceneCopy.sceneWeights = null;
    sceneCopy.id = id;
    this.setState({
      scenes: this.state.scenes.concat([sceneCopy]),
      route: [new Route({kind: 'scene', value: sceneCopy.id})],
      autoEdit: true,
    });
  }

  onAddScene() {
    let id = this.state.scenes.length + 1;
    this.state.scenes.forEach((s: any) => {
      id = Math.max(s.id + 1, id);
    });
    let scene = new Scene({
      id: id,
      name: "New scene",
      sources: new Array<LibrarySource>(),
      ...this.state.config.defaultScene,
    });
    this.setState({
      scenes: this.state.scenes.concat([scene]),
      route: [new Route({kind: 'scene', value: scene.id})],
      autoEdit: true,
    });
  }

  onDeleteScene(scene: Scene) {
    this.setState({
      scenes: this.state.scenes.filter((s: any) => s.id != scene.id),
      route: [],
    });
  }

  nextScene() {
    const scene = this.scene();
    if (scene && scene.nextSceneID !== 0){
      const nextScene = this.state.scenes.find((s: any) => s.id === this.scene().nextSceneID);
      if (nextScene != null) {
        if (nextScene.tagWeights || nextScene.sceneWeights) {
          this.setState({route: [new Route({kind: 'generate', value: scene.id}),
              new Route({kind: 'scene', value: nextScene.id}), new Route({kind: 'play', value: nextScene.id})]});
        } else {
          this.setState({route: [new Route({kind: 'scene', value: nextScene.id}), new Route({kind: 'play', value: nextScene.id})]});
        }
      }
    }
  }

  updateConfig(newConfig: Config) {
    this.setState({config: newConfig});
  }

  onConfig() {
    this.setState({route: [new Route({kind: 'config', value: null})]});
  }

  onDefaultConfig() {
    this.setState({config: new Config(), route: []});
  }

  onOpenScene(scene: Scene) {
    if (scene.tagWeights || scene.sceneWeights) {
      this.setState({route: [new Route({kind: 'generate', value: scene.id})]});
    } else {
      this.setState({route: [new Route({kind: 'scene', value: scene.id})]});
    }
  }

  onOpenLibrary() {
    this.setState({route: [new Route({kind: 'library', value: null})], libraryYOffset: 0, libraryFilters: Array<string>()});
  }

  onOpenLibraryImport() {
    this.setState({route: this.state.route.concat(new Route({kind: 'library', value: null})), isSelect: true});
  }

  onImportFromLibrary(sources: Array<string>) {
    const sceneSources = this.scene().sources;
    const sceneSourceURLs = sceneSources.map((s) => s.url);
    let id = sceneSources.length + 1;
    this.scene().sources.forEach((s) => {
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
    this.onUpdateScene(this.scene(), (s) => {s.sources = sceneSources;});
    this.goBack();
  }

  onPlayScene(scene: Scene) {
    this.setState({route: this.state.route.concat(new Route({kind: 'play', value: scene.id}))});
  }

  onPlaySceneFromLibrary(source: LibrarySource, yOffset: number, filters: Array<string>) {
    let id = this.state.scenes.length + 1;
    this.state.scenes.forEach((s: any) => {
      id = Math.max(s.id + 1, id);
    });
    let tempScene = new Scene({
      name: "library_scene_temp",
      sources: [source],
      libraryID: source.id,
      id: id,
    });
    const newRoute = [new Route({kind: 'scene', value: tempScene.id}), new Route({kind: 'libraryplay', value: tempScene.id})];
    this.setState({
      scenes: this.state.scenes.concat([tempScene]),
      route: newRoute,
      libraryYOffset: yOffset,
      libraryFilters: filters,
    });
  }

  endPlaySceneFromLibrary() {
    const newScenes = this.state.scenes;
    const libraryID = newScenes.pop().libraryID;
    const tagNames = this.state.tags.map((t: any) => t.name);
    // Re-order the tags of the source we were playing
    const newLibrary = this.state.library.map((s: any) => {
      if (s.id == libraryID) {
         s.tags = s.tags.sort((a: any, b: any) => {
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
    this.setState({route: [new Route({kind: 'library'})], scenes: newScenes, library: newLibrary});
  }

  manageTags() {
    const newRoute = this.state.route.concat(new Route({kind: 'tags', value: null}));
    this.setState({route: newRoute});
  }

  onAddGenerator() {
    let id = this.state.scenes.length + 1;
    this.state.scenes.forEach((s: any) => {
      id = Math.max(s.id + 1, id);
    });
    let scene = new Scene({
      id: id,
      name: "New generator",
      sources: new Array<LibrarySource>(),
      tagWeights: "[]",
      sceneWeights: "[]",
      ...this.state.config.defaultScene,
    });
    this.setState({
      scenes: this.state.scenes.concat([scene]),
      route: [new Route({kind: 'generate', value: scene.id})],
      autoEdit: true
    });
  }

  onGenerateScene() {
    const newRoute = this.state.route.concat(new Route({kind: 'scene', value: this.scene().id}));
    this.setState({route: newRoute});
  }

  onUpdateScene(scene: Scene, fn: (scene: Scene) => void) {
    const scenes = this.state.scenes;
    for (let s of scenes) {
      if (s.id == scene.id) {
        fn(s);
      }
    }
    this.setState({scenes: scenes});
  }

  onUpdateScenes(scenes: Array<Scene>) {
    this.setState({scenes: scenes});
  }

  onUpdateLibrary(library: Array<LibrarySource>) {
    this.setState({library: library});
  }

  onUpdateTags(tags: Array<Tag>) {
    // Go through each scene in the library
    let newLibrary = this.state.library;
    const tagIDs = tags.map((t) => t.id);
    for (let source of newLibrary) {
      // Remove deleted tags, update any edited tags, and order the same as tags
      source.tags = source.tags.filter((t: any) => tagIDs.includes(t.id));
      source.tags = source.tags.map((t: any) => {
        for (let tag of tags) {
          if (t.id == tag.id) {
            t.name = tag.name;
            return t;
          }
        }
      });
      source.tags = source.tags.sort((a: any, b: any) => {
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
    this.setState({tags: tags, library: newLibrary});
  }

  onToggleTag(sourceID: number, tag: Tag) {
    let newLibrary = this.state.library;
    for (let source of newLibrary) {
      if (source.id == sourceID) {
        if (source.tags.map((t: any) => t.name).includes(tag.name)) {
          source.tags = source.tags.filter((t: any) => t.name != tag.name);
        } else {
          source.tags.push(tag);
        }
      }
    }
    this.onUpdateLibrary(newLibrary);
  }

  onExport(scene: Scene) {
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
  }

  onImport() {
    const filePath = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
      {filters: [{name:'All Files (*.*)', extensions: ['*']},{name: 'JSON Document', extensions: ['json']}], properties: ['openFile']});
    if (!filePath || !filePath.length) return;
    const scene = new Scene(JSON.parse(readFileSync(filePath[0], 'utf-8')));
    let id = this.state.scenes.length + 1;
    this.state.scenes.forEach((s: any) => {
      id = Math.max(s.id + 1, id);
    });
    scene.id = id;
    this.setState({scenes: this.state.scenes.concat([scene]), route: [new Route({kind: 'scene', value: scene.id})]});
  }

  clearTumblr() {
    const newConfig = this.state.config;
    newConfig.remoteSettings.tumblrKey = "";
    newConfig.remoteSettings.tumblrSecret = "";
    newConfig.remoteSettings.tumblrOAuthToken = "";
    newConfig.remoteSettings.tumblrOAuthTokenSecret = "";
    this.setState({config: newConfig});
  }

  clearReddit() {
    const newConfig = this.state.config;
    newConfig.remoteSettings.redditRefreshToken = "";
    this.setState({config: newConfig});
  }
};
