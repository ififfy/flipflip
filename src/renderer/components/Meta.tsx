import {remote, ipcRenderer, IpcMessageEvent} from 'electron';
import * as React from 'react';

import {Box, CssBaseline} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";

import AppStorage from '../data/AppStorage';
import {IPC} from "../data/const";
import * as actions from '../data/actions';
import theme from '../data/theme';
import ScenePicker from './ScenePicker';
import ConfigForm from './config/ConfigForm';
import Library from './library/Library';
import TagManager from "./library/TagManager";
import SceneGenerator from "./library/SceneGenerator";
import Player from './player/Player';
import SceneDetail from './sceneDetail/SceneDetail';
import FFAnalytics from "./ui/FFAnalytics";
import VideoClipper from "./player/VideoClipper";
import GridSetup from "./player/GridSetup";

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

  progressAction(fn: any, ...args: any[]) {
    const getState = () => {return this.state};
    fn(getState, this.setState.bind(this), ...args);
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
    const p = (fn: any) => this.progressAction.bind(this, fn);

    return (
      <ThemeProvider theme={theme}>
        <Box className="Meta">
          <CssBaseline />
          {this.state.route.length === 0 && (
            <ScenePicker
              canGenerate={(this.state.library.length >= 1 && this.state.tags.length >= 1) || (this.state.scenes.length >= 1)}
              config={this.state.config}
              libraryCount={this.state.library.length}
              scenes={this.state.scenes}
              version={this.state.version}
              onAddGenerator={a(actions.addGenerator)}
              onAddScene={a(actions.addScene)}
              onImportScene={a(actions.importScene)}
              onOpenConfig={a(actions.openConfig)}
              onOpenLibrary={a(actions.openLibrary)}
              onOpenScene={a(actions.goToScene)}
              onSort={a(actions.sortScene)}
              onUpdateConfig={a(actions.updateConfig)}
              onUpdateScenes={a(actions.replaceScenes)}
            />
          )}

          {this.isRoute('scene') && (
            <SceneDetail
              autoEdit={this.state.autoEdit}
              allScenes={this.state.scenes}
              config={this.state.config}
              scene={scene}
              goBack={a(actions.goBack)}
              onAddSource={a(actions.addSource)}
              onClearBlacklist={a(actions.clearBlacklist)}
              onClip={a(actions.clipVideo)}
              onDelete={a(actions.deleteScene)}
              onExport={a(actions.exportScene)}
              onPlay={a(actions.playScene)}
              onSaveAsScene={a(actions.saveScene)}
              onSetupGrid={a(actions.setupGrid)}
              onSort={a(actions.sortSources)}
              onUpdateScene={a(actions.updateScene)}
            />
          )}

          {this.isRoute('library') && (
            <Library
              config={this.state.config}
              filters={this.state.libraryFilters}
              library={this.state.library}
              progressCurrent={this.state.progressCurrent}
              progressMode={this.state.progressMode}
              progressTitle={this.state.progressTitle}
              progressTotal={this.state.progressTotal}
              tags={this.state.tags}
              goBack={a(actions.goBack)}
              onAddSource={a(actions.addSource)}
              onBatchTag={a(actions.batchTag)}
              onClearBlacklist={a(actions.clearBlacklist)}
              onClip={a(actions.clipVideo)}
              onExportLibrary={a(actions.exportLibrary)}
              onImportLibrary={a(actions.importLibrary)}
              onImportInstagram={p(actions.importInstagram)}
              onImportReddit={p(actions.importReddit)}
              onImportTumblr={p(actions.importTumblr)}
              onImportTwitter={p(actions.importTwitter)}
              onManageTags={a(actions.manageTags)}
              onMarkOffline={p(actions.markOffline)}
              onSort={a(actions.sortSources)}
              onUpdateLibrary={a(actions.replaceLibrary)}
              onUpdateMode={a(actions.setMode)}
              /*isSelect={this.state.isSelect}
              isBatchTag={this.state.isBatchTag}
              yOffset={this.state.libraryYOffset}
              selected={this.state.librarySelected}
              onPlay={a(actions.playSceneFromLibrary)}
              onClip={a(actions.clipVideo)}
              savePosition={a(actions.saveLibraryPosition)}
              importSourcesFromLibrary={a(actions.importFromLibrary)}
              onBackup={appStorage.backup.bind(appStorage)}
              blacklistFile={a(actions.blacklistFile)}*/
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

          {this.isRoute('grid') && (
            <GridSetup
              scene={scene}
              allScenes={this.state.scenes}
              onUpdateGrid={a(actions.onUpdateGrid)}
              goBack={a(actions.goBack)}
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
              setCount={a(actions.setCount)}
              cache={a(actions.cacheImage)}
              setupGrid={a(actions.setupGrid)}
              blacklistFile={a(actions.blacklistFile)}
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
              setCount={a(actions.setCount)}
              cache={a(actions.cacheImage)}
              blacklistFile={a(actions.blacklistFile)}
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
        </Box>
      </ThemeProvider>
    )
  }
};
