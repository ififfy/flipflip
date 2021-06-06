import {remote, ipcRenderer, IpcMessageEvent} from 'electron';
import * as React from 'react';

import {
  Box, createMuiTheme, CssBaseline, Dialog, DialogContent, DialogContentText, Slide, Snackbar, SnackbarContent
} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";

import {IPC, SP} from "../data/const";
import {getCachePath} from "../data/utils";
import * as actions from '../data/actions';
import ErrorBoundary from "../../main/ErrorBoundary";
import AppStorage from '../data/AppStorage';
import FFAnalytics from "./FFAnalytics";
import ScenePicker from './ScenePicker';
import ConfigForm from './config/ConfigForm';
import Library from './library/Library';
import TagManager from "./library/TagManager";
import GridSetup from "./config/GridSetup";
import VideoClipper from "./config/VideoClipper";
import Player from './player/Player';
import SceneDetail from './sceneDetail/SceneDetail';
import GridPlayer from "./player/GridPlayer";
import Tutorial from "./Tutorial";
import AudioLibrary from "./library/AudioLibrary";
import CaptionScriptor from "./sceneDetail/CaptionScriptor";
import ScriptLibrary from "./library/ScriptLibrary";
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
    ipcRenderer.on(IPC.startScene, this.startScene.bind(this));

    // Disable react-sound's verbose console output
    (window as any).soundManager.setup({debugMode: false});

    if (remote.getCurrentWindow().id == 1) {
      setInterval(this.queueSave.bind(this), 500);
      if (this.state.is)
        (window as any).onbeforeunload = (e: any) => {
          window.onbeforeunload = null;
          e.returnValue = false;
          appStorage.save(this.state, () => {window.close()});
        }
    }
  }

  _queueSave = false;
  _lastSave: Date = null;
  queueSave() {
    if (this._queueSave && (this._lastSave == null || new Date().getTime() - this._lastSave.getTime() > 3000)) {
      appStorage.save(this.state);
      this._lastSave = new Date();
      this._queueSave = false;
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (prevState.version !== this.state.version ||
      prevState.config !== this.state.config ||
      prevState.scenes !== this.state.scenes ||
      prevState.grids !== this.state.grids ||
      prevState.library !== this.state.library ||
      prevState.audios !== this.state.audios ||
      prevState.scripts !== this.state.scripts ||
      prevState.playlists !== this.state.playlists ||
      prevState.tags !== this.state.tags ||
      prevState.route !== this.state.route ||
      prevState.specialMode !== this.state.specialMode ||
      prevState.openTab !== this.state.openTab ||
      prevState.displayedSources !== this.state.displayedSources ||
      prevState.libraryYOffset !== this.state.libraryYOffset ||
      prevState.libraryFilters !== this.state.libraryFilters ||
      prevState.librarySelected !== this.state.librarySelected ||
      prevState.audioOpenTab !== this.state.audioOpenTab ||
      prevState.audioYOffset !== this.state.audioYOffset ||
      prevState.audioFilters !== this.state.audioFilters ||
      prevState.audioSelected !== this.state.audioSelected ||
      prevState.scriptYOffset !== this.state.scriptYOffset ||
      prevState.scriptFilters !== this.state.scriptFilters ||
      prevState.scriptSelected !== this.state.scriptSelected ||
      prevState.progressMode !== this.state.progressMode ||
      prevState.progressTitle !== this.state.progressTitle ||
      prevState.progressCurrent !== this.state.progressCurrent ||
      prevState.progressTotal !== this.state.progressTotal ||
      prevState.progressNext !== this.state.progressNext ||
      prevState.systemMessage !== this.state.systemMessage ||
      prevState.systemSnack !== this.state.systemSnack ||
      prevState.tutorial !== this.state.tutorial ||
      prevState.theme !== this.state.theme) {
      this._queueSave = true;
    }
  }

  startScene(ev: IpcMessageEvent, sceneName: string) {
    this.applyAction(actions.startFromScene, sceneName);
  }

  render() {
    const scene = actions.getActiveScene(this.state);
    const grid = actions.getActiveGrid(this.state);

    // Save a lot of typing and potential bugs
    const a = (fn: any, ...args: any[]) => this.applyAction.bind(this, fn, ...args);
    const p = (fn: any) => this.progressAction.bind(this, fn);

    const theme = createMuiTheme(this.state.theme);
    return (
      <ThemeProvider theme={theme}>
        <ErrorBoundary
          version={this.state.version}
          onRestore={a(actions.restoreFromBackup)}
          goBack={a(actions.goBack)}>
          <Box className="Meta">
            <CssBaseline />
            {this.state.route.length === 0 && (
              <ScenePicker
                canGenerate={this.state.library.length >= 1}
                canGrid={this.state.scenes.length > 0}
                config={this.state.config}
                grids={this.state.grids}
                audioLibraryCount={this.state.audios.length}
                scriptLibraryCount={this.state.scripts.length}
                libraryCount={this.state.library.length}
                openTab={this.state.openTab}
                scenes={this.state.scenes}
                tutorial={this.state.tutorial}
                version={this.state.version}
                onAddGenerator={a(actions.addGenerator)}
                onAddGrid={a(actions.addGrid)}
                onAddScene={a(actions.addScene)}
                onChangeTab={a(actions.changeScenePickerTab)}
                onDeleteScenes={a(actions.deleteScenes)}
                onImportScene={a(actions.importScene)}
                onOpenConfig={a(actions.openConfig)}
                onOpenAudioLibrary={a(actions.openAudios)}
                onOpenScriptLibrary={a(actions.openScripts)}
                onOpenCaptionScriptor={a(actions.openScriptor)}
                onOpenLibrary={a(actions.openLibrary)}
                onOpenScene={a(actions.goToScene)}
                onOpenGrid={a(actions.goToGrid)}
                onTutorial={a(actions.doneTutorial)}
                onSort={a(actions.sortScene)}
                onUpdateConfig={a(actions.updateConfig)}
                onUpdateScenes={a(actions.replaceScenes)}
                onUpdateGrids={a(actions.replaceGrids)}
                startTutorial={a(actions.startTutorial)}
              />
            )}

            {this.isRoute('scene') && (
              <SceneDetail
                autoEdit={this.state.specialMode == SP.autoEdit}
                allScenes={this.state.scenes}
                allSceneGrids={this.state.grids}
                config={this.state.config}
                library={this.state.library}
                scene={scene}
                tags={this.state.tags}
                tutorial={this.state.tutorial}
                goBack={a(actions.goBack)}
                onAddSource={a(actions.addSource)}
                onAddTracks={a(actions.addTracks)}
                onAddScript={a(actions.addScript)}
                onClearBlacklist={a(actions.clearBlacklist)}
                onClip={a(actions.clipVideo)}
                onCloneScene={a(actions.cloneScene)}
                onDelete={a(actions.deleteScene)}
                onEditBlacklist={a(actions.editBlacklist)}
                onExport={a(actions.exportScene)}
                onGenerate={a(actions.generateScenes)}
                onPlayScene={a(actions.playScene)}
                onPlay={a(actions.playSceneFromLibrary)}
                onPlayAudio={a(actions.playAudio)}
                onPlayScript={a(actions.playScript)}
                onResetScene={a(actions.resetScene)}
                onSaveAsScene={a(actions.saveScene)}
                onSort={a(actions.sortSources)}
                onTutorial={a(actions.doneTutorial)}
                onUpdateScene={a(actions.updateScene)}
                systemMessage={a(actions.systemMessage)}
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
                selected={this.state.librarySelected}
                specialMode={this.state.specialMode}
                tags={this.state.tags}
                tutorial={this.state.tutorial}
                yOffset={this.state.libraryYOffset}
                goBack={a(actions.goBack)}
                onAddSource={a(actions.addSource)}
                onBatchTag={a(actions.batchTag)}
                onClearBlacklist={a(actions.clearBlacklist)}
                onClip={a(actions.clipVideo)}
                onEditBlacklist={a(actions.editBlacklist)}
                onExportLibrary={a(actions.exportLibrary)}
                onImportFromLibrary={a(actions.importFromLibrary)}
                onImportLibrary={a(actions.importLibrary, appStorage.backup.bind(appStorage, this.state))}
                onImportInstagram={p(actions.importInstagram)}
                onImportReddit={p(actions.importReddit)}
                onImportTumblr={p(actions.importTumblr)}
                onImportTwitter={p(actions.importTwitter)}
                onManageTags={a(actions.manageTags)}
                onMarkOffline={p(actions.markOffline)}
                onPlay={a(actions.playSceneFromLibrary)}
                onSort={a(actions.sortSources)}
                onTutorial={a(actions.doneTutorial)}
                onUpdateLibrary={a(actions.updateLibrary)}
                onUpdateMode={a(actions.setMode)}
                onUpdateVideoMetadata={p(actions.updateVideoMetadata)}
                savePosition={a(actions.saveLibraryPosition)}
                systemMessage={a(actions.systemMessage)}
              />
            )}

            {this.isRoute('audios') && (
              <AudioLibrary
                cachePath={getCachePath(null, this.state.config)}
                filters={this.state.audioFilters}
                library={this.state.audios}
                progressCurrent={this.state.progressCurrent}
                progressMode={this.state.progressMode}
                progressTitle={this.state.progressTitle}
                progressTotal={this.state.progressTotal}
                openTab={this.state.audioOpenTab}
                playlists={this.state.playlists}
                selected={this.state.audioSelected}
                specialMode={this.state.specialMode}
                tags={this.state.tags}
                tutorial={this.state.tutorial}
                yOffset={this.state.audioYOffset}
                goBack={a(actions.goBack)}
                onAddToPlaylist={a(actions.addToPlaylist)}
                onBatchTag={a(actions.batchTag)}
                onBatchEdit={a(actions.batchEdit)}
                onBatchDetectBPM={p(actions.detectBPMs)}
                onChangeTab={a(actions.changeAudioLibraryTab)}
                onImportFromLibrary={a(actions.importAudioFromLibrary)}
                onManageTags={a(actions.manageTags)}
                onPlay={a(actions.playAudio)}
                onSort={a(actions.sortAudioSources)}
                onSortPlaylist={a(actions.sortPlaylist)}
                onTutorial={a(actions.doneTutorial)}
                onUpdateLibrary={a(actions.updateAudioLibrary)}
                onUpdatePlaylists={a(actions.updatePlaylists)}
                onUpdateMode={a(actions.setMode)}
                savePosition={a(actions.saveAudioPosition)}
                systemMessage={a(actions.systemMessage)}
              />
            )}

            {this.isRoute('scripts') && (
              <ScriptLibrary
                allScenes={this.state.scenes}
                filters={this.state.scriptFilters}
                library={this.state.scripts}
                selected={this.state.scriptSelected}
                specialMode={this.state.specialMode}
                tags={this.state.tags}
                tutorial={this.state.tutorial}
                yOffset={this.state.scriptYOffset}
                goBack={a(actions.goBack)}
                onBatchTag={a(actions.batchTag)}
                onEditScript={a(actions.openScriptInScriptor)}
                onImportFromLibrary={a(actions.importScriptFromLibrary)}
                onImportToScriptor={a(actions.importScriptToScriptor)}
                onManageTags={a(actions.manageTags)}
                onPlay={a(actions.playScript)}
                onSort={a(actions.sortScripts)}
                onTutorial={a(actions.doneTutorial)}
                onUpdateLibrary={a(actions.updateScriptLibrary)}
                onUpdateMode={a(actions.setMode)}
                savePosition={a(actions.saveScriptPosition)}
                systemMessage={a(actions.systemMessage)}
              />
            )}

            {this.isRoute('tags') && (
              <TagManager
                tags={this.state.tags}
                goBack={a(actions.goBack)}
                onSort={a(actions.sortTags)}
                onUpdateTags={a(actions.updateTags)}
              />
            )}

            {this.isRoute('clip') && (
              <VideoClipper
                allTags={this.state.tags}
                source={actions.getActiveSource(this.state)}
                isLibrary={!actions.getActiveScene(this.state)}
                tutorial={this.state.tutorial}
                videoVolume={this.state.config.defaultScene.videoVolume}
                onTutorial={a(actions.doneTutorial)}
                onStartVCTutorial={a(actions.startVCTutorial)}
                onSetDisabledClips={a(actions.setDisabledClips)}
                onUpdateClips={a(actions.onUpdateClips)}
                goBack={a(actions.goBack)}
                navigateClipping={a(actions.navigateClipping)}
                cache={a(actions.cacheImage)}
              />
            )}

            {this.isRoute('grid') && (
              <GridSetup
                allScenes={this.state.scenes}
                autoEdit={this.state.specialMode == SP.autoEdit}
                grid={grid}
                tutorial={this.state.tutorial}
                goBack={a(actions.goBack)}
                onDelete={a(actions.deleteGrid)}
                onGenerate={a(actions.generateScenes)}
                onPlayGrid={a(actions.playGrid)}
                onTutorial={a(actions.doneTutorial)}
                onUpdateGrid={a(actions.updateGrid)}
              />
            )}

            {this.isRoute('play') && (
              <Player
                preventSleep
                config={this.state.config}
                scene={scene}
                scenes={this.state.scenes}
                sceneGrids={this.state.grids}
                theme={theme}
                tutorial={this.state.tutorial}
                onUpdateScene={a(actions.updateScene)}
                nextScene={a(actions.nextScene)}
                goBack={a(actions.goBack)}
                playTrack={a(actions.playTrack)}
                goToTagSource={a(actions.playSceneFromLibrary)}
                goToClipSource={a(actions.clipVideo)}
                getTags={actions.getTags.bind(this, this.state.library)}
                setCount={a(actions.setCount)}
                cache={a(actions.cacheImage)}
                blacklistFile={a(actions.blacklistFile)}
                systemMessage={a(actions.systemMessage)}
              />
            )}

            {this.isRoute('libraryplay') && (
              <Player
                preventSleep
                config={this.state.config}
                scene={scene}
                scenes={this.state.scenes}
                sceneGrids={this.state.grids}
                theme={theme}
                tutorial={this.state.tutorial}
                onUpdateScene={a(actions.updateScene)}
                goBack={a(actions.endPlaySceneFromLibrary)}
                playTrack={a(actions.playTrack)}
                tags={scene.audioScene ? actions.getAudioSource(this.state)?.tags : scene.scriptScene ? actions.getScriptSource(this.state)?.tags : actions.getLibrarySource(this.state)?.tags}
                allTags={this.state.tags}
                toggleTag={scene.audioScene ? a(actions.toggleAudioTag) : scene.scriptScene ? a(actions.toggleScriptTag) : a(actions.toggleTag)}
                inheritTags={scene.audioScene || scene.scriptScene ? undefined : a(actions.inheritTags)}
                navigateTagging={a(actions.navigateDisplayedLibrary)}
                getTags={actions.getTags.bind(this, this.state.library)}
                changeAudioRoute={scene.audioScene ? a(actions.changeAudioRoute) : undefined}
                setCount={a(actions.setCount)}
                cache={a(actions.cacheImage)}
                goToClipSource={a(actions.clipVideo)}
                blacklistFile={a(actions.blacklistFile)}
                systemMessage={a(actions.systemMessage)}
              />
            )}

            {this.isRoute('gridplay') && (
              <GridPlayer
                config={this.state.config}
                grid={grid}
                scenes={this.state.scenes}
                sceneGrids={this.state.grids}
                theme={theme}
                cache={a(actions.cacheImage)}
                getTags={actions.getTags.bind(this, this.state.library)}
                goBack={a(actions.goBack)}
                setCount={a(actions.setCount)}
                systemMessage={a(actions.systemMessage)}
              />
            )}

            {this.isRoute('config') && (
              <ConfigForm
                config={this.state.config}
                scenes={this.state.scenes}
                sceneGrids={this.state.grids}
                theme={this.state.theme}
                goBack={a(actions.goBack)}
                onBackup={appStorage.backup.bind(appStorage, this.state)}
                onChangeThemeColor={a(actions.changeThemeColor)}
                onClean={actions.cleanBackups}
                onDefault={a(actions.setDefaultConfig)}
                onRestore={a(actions.restoreFromBackup)}
                onResetTutorials={a(actions.resetTutorials)}
                onToggleDarkMode={a(actions.toggleDarkMode)}
                onUpdateConfig={a(actions.updateConfig)}
              />
            )}

            {this.isRoute('scriptor') && (
              <CaptionScriptor
                config={this.state.config}
                scenes={this.state.scenes}
                sceneGrids={this.state.grids}
                tutorial={this.state.tutorial}
                openScript={actions.getSelectScript(this.state)}
                theme={theme}
                onAddFromLibrary={a(actions.addScriptSingle)}
                getTags={actions.getTags.bind(this, this.state.library)}
                goBack={a(actions.goBack)}
                onUpdateScene={a(actions.updateScene)}
                onUpdateLibrary={a(actions.updateScriptLibrary)}
              />
            )}

            <Dialog
              open={!!this.state.systemMessage}
              onClose={a(actions.closeMessage)}
              aria-describedby="message-description">
              <DialogContent>
                <DialogContentText id="message-description">
                  {this.state.systemMessage}
                </DialogContentText>
              </DialogContent>
            </Dialog>

            <Snackbar
              open={!!this.state.systemSnack}
              autoHideDuration={2000}
              key={this.state.systemSnack + new Date()}
              onClose={a(actions.closeMessage)}
              TransitionComponent={(props) => <Slide {...props} direction="up"/>}>
              <SnackbarContent
                message={
                  <span style={{display: 'flex', alignItems: 'center',}}>
                    {this.state.systemSnack}
                  </span>
                }
              />
            </Snackbar>

            {this.state.tutorial && (
              <Tutorial
                config={this.state.config}
                route={this.state.route}
                scene={!!scene ? scene : grid}
                tutorial={this.state.tutorial}
                onSetTutorial={a(actions.setTutorial)}
                onDoneTutorial={a(actions.doneTutorial)}
                onSkipAllTutorials={a(actions.skipTutorials)}
              />
            )}

            <FFAnalytics
              config={this.state.config}
              onUpdateConfig={a(actions.updateConfig)}
              version={this.state.version}
              page={this.state.route.length == 0 ? 'home' : this.state.route[this.state.route.length - 1].kind} />
          </Box>
        </ErrorBoundary>
      </ThemeProvider>
    )
  }
};

(Meta as any).displayName="Meta";