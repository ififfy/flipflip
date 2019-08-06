import {remote, ipcRenderer, IpcMessageEvent} from 'electron';
import * as React from 'react';

import AppStorage from '../data/AppStorage';
import {IPC} from "../data/const";
import * as actions from '../data/actions';

import ScenePicker from './ScenePicker';
import ConfigForm from './config/ConfigForm';
import Library from './library/Library';
import TagManager from "./library/TagManager";
import SceneGenerator from "./library/SceneGenerator";
import Player from './player/Player';
import SceneDetail from './sceneDetail/SceneDetail';
import FFAnalytics from "./ui/FFAnalytics";
import VideoClipper from "./player/VideoClipper";

const appStorage = new AppStorage(remote.getCurrentWindow().id);

export default class Meta extends React.Component {
  readonly state = appStorage.initialState;

  isRoute(kind: string): Boolean {
    return actions.isRoute(this.state, kind);
  }

  applyAction(fn: any, ...args: any[]) {
    // Actions are functions that take (state, args+) and return {objectDiff}.
    // So we simply call the function and setState(return value).
    // This is basically the Redux pattern with fewer steps.
    const result = fn(this.state, ...args);
    // run `window.logStateChanges = true` to see these
    if ((window as any).logStateChanges) {
      console.log(result);
    }
    this.setState(result);
  }

  componentDidMount() {
    // We never bother cleaning this up, but that's OK because this is the top level
    // component of the whole app.
    setInterval(() => appStorage.save(this.state), 500);
    ipcRenderer.on(IPC.startScene, this.startScene.bind(this));
  }

  startScene(ev: IpcMessageEvent, sceneName: string) {
    this.applyAction(actions.startFromScene, sceneName);
  }

  render() {
    const scene = actions.getActiveScene(this.state);

    // Save a lot of typing and potential bugs
    const a = (fn: any) => this.applyAction.bind(this, fn);

    return (
      <div className="Meta">
        {this.state.route.length === 0 && (
          <ScenePicker
            scenes={this.state.scenes}
            config={this.state.config}
            version={this.state.version}
            libraryCount={this.state.library.length}
            onUpdateConfig={a(actions.updateConfig)}
            onUpdateScenes={a(actions.replaceScenes)}
            onAdd={a(actions.addScene)}
            onImport={a(actions.importScene)}
            onSelect={a(actions.goToScene)}
            onOpenLibrary={a(actions.openLibrary)}
            onGenerate={a(actions.addGenerator)}
            onConfig={a(actions.openConfig)}
            canGenerate={(this.state.library.length >= 1 && this.state.tags.length >= 1) || (this.state.scenes.length >= 1)}
          />
        )}

        {this.isRoute('library') && (
          <Library
            library={this.state.library}
            tags={this.state.tags}
            config={this.state.config}
            isSelect={this.state.isSelect}
            isBatchTag={this.state.isBatchTag}
            yOffset={this.state.libraryYOffset}
            filters={this.state.libraryFilters}
            selected={this.state.librarySelected}
            onPlay={a(actions.playSceneFromLibrary)}
            onClip={a(actions.clipVideo)}
            savePosition={a(actions.saveLibraryPosition)}
            onUpdateLibrary={a(actions.replaceLibrary)}
            goBack={a(actions.goBack)}
            manageTags={a(actions.manageTags)}
            batchTag={a(actions.batchTag)}
            importSourcesFromLibrary={a(actions.importFromLibrary)}
            onBackup={appStorage.backup.bind(appStorage)}
            onImportLibrary={a(actions.importLibrary)}
            onExportLibrary={a(actions.exportLibrary)}
          />
        )}

        {this.isRoute('clip') && (
          <VideoClipper
            source={actions.getActiveSource(this.state)}
            videoVolume={this.state.config.defaultScene.videoVolume}
            onUpdateClips={a(actions.onUpdateClips)}
            goBack={a(actions.goBack)}
            cache={a(actions.cacheImage)}
          />
        )}

        {this.isRoute('tags') && (
          <TagManager
            tags={this.state.tags}
            onUpdateTags={a(actions.updateTags)}
            goBack={a(actions.goBack)}
          />
        )}

        {this.isRoute('generate') && (
          <SceneGenerator
            library={this.state.library}
            tags={this.state.tags}
            autoEdit={this.state.autoEdit}
            scenes={this.state.scenes}
            scene={scene}
            goBack={a(actions.goBack)}
            onGenerate={a(actions.generateScene)}
            onUpdateScene={a(actions.updateScene)}
            onDelete={a(actions.deleteScene)}
          />
        )}

        {this.isRoute('scene') && (
          <SceneDetail
            scene={scene}
            allScenes={this.state.scenes}
            config={this.state.config}
            autoEdit={this.state.autoEdit}
            goBack={a(actions.goBack)}
            onExport={a(actions.exportScene)}
            onDelete={a(actions.deleteScene)}
            onPlay={a(actions.playScene)}
            onClip={a(actions.clipVideo)}
            onUpdateScene={a(actions.updateScene)}
            onOpenLibraryImport={a(actions.openLibraryImport)}
            saveScene={a(actions.saveScene)}
          />
        )}

        {this.isRoute('play') && (
          <Player
            config={this.state.config}
            scene={scene}
            scenes={this.state.scenes}
            onUpdateScene={a(actions.updateScene)}
            nextScene={a(actions.nextScene)}
            goBack={a(actions.goBack)}
            goToTagSource={a(actions.playSceneFromLibrary)}
            getTags={actions.getTags.bind(this, this.state.library)}
            cache={a(actions.cacheImage.bind(this))}
          />
        )}

        {this.isRoute('libraryplay') && (
          <Player
            config={this.state.config}
            scene={scene}
            scenes={this.state.scenes}
            onUpdateScene={a(actions.updateScene)}
            goBack={a(actions.endPlaySceneFromLibrary)}
            tags={actions.getLibrarySource(this.state).tags}
            allTags={this.state.tags}
            toggleTag={a(actions.toggleTag)}
            navigateTagging={a(actions.navigateDisplayedLibrary)}
            getTags={actions.getTags.bind(this, this.state.library)}
            cache={a(actions.cacheImage)}
          />
        )}

        {this.isRoute('config') && (
          <ConfigForm
            config={this.state.config}
            scenes={this.state.scenes}
            goBack={a(actions.goBack)}
            updateConfig={a(actions.updateConfig)}
            onDefault={a(actions.setDefaultConfig)}
            onBackup={appStorage.backup.bind(appStorage)}
            onRestore={a(actions.restoreFromBackup)}
            onClean={a(actions.cleanBackups)}
          />
        )}

        <FFAnalytics
          config={this.state.config}
          onUpdateConfig={a(actions.updateConfig)}
          version={this.state.version}
          page={this.state.route.length == 0 ? 'home' : this.state.route[this.state.route.length - 1].kind} />
      </div>
    )
  }
};
