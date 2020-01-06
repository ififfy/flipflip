import {remote, ipcRenderer, IpcMessageEvent} from 'electron';
import * as React from 'react';

import {
  Box, createMuiTheme, CssBaseline, Dialog, DialogContent, DialogContentText, Slide, Snackbar, SnackbarContent
} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";

import {IPC} from "../data/const";
import * as actions from '../data/actions';
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
    const grid = actions.getActiveGrid(this.state);

    // Save a lot of typing and potential bugs
    const a = (fn: any, ...args: any[]) => this.applyAction.bind(this, fn, ...args);
    const p = (fn: any) => this.progressAction.bind(this, fn);

    const theme = createMuiTheme(this.state.theme);
    return (
      <ThemeProvider theme={theme}>
        <Box className="Meta">
          <CssBaseline />
          {this.state.route.length === 0 && (
            <ScenePicker
              canGenerate={this.state.library.length >= 1 && this.state.tags.length >= 1}
              canGrid={this.state.scenes.length > 0}
              config={this.state.config}
              grids={this.state.grids}
              libraryCount={this.state.library.length}
              openTab={this.state.openTab}
              scenes={this.state.scenes}
              tutorial={this.state.tutorial}
              version={this.state.version}
              onAddGenerator={a(actions.addGenerator)}
              onAddGrid={a(actions.addGrid)}
              onAddScene={a(actions.addScene)}
              onChangeTab={a(actions.changeScenePickerTab)}
              onImportScene={a(actions.importScene)}
              onOpenConfig={a(actions.openConfig)}
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
              autoEdit={this.state.autoEdit}
              allScenes={this.state.scenes}
              config={this.state.config}
              library={this.state.library}
              scene={scene}
              tags={this.state.tags}
              tutorial={this.state.tutorial}
              goBack={a(actions.goBack)}
              onAddSource={a(actions.addSource)}
              onClearBlacklist={a(actions.clearBlacklist)}
              onClip={a(actions.clipVideo)}
              onDelete={a(actions.deleteScene)}
              onExport={a(actions.exportScene)}
              onGenerate={a(actions.generateScene)}
              onPlayScene={a(actions.playScene)}
              onPlay={a(actions.playSceneFromLibrary)}
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
              isBatchTag={this.state.isBatchTag}
              isSelect={this.state.isSelect}
              library={this.state.library}
              progressCurrent={this.state.progressCurrent}
              progressMode={this.state.progressMode}
              progressTitle={this.state.progressTitle}
              progressTotal={this.state.progressTotal}
              selected={this.state.librarySelected}
              tags={this.state.tags}
              tutorial={this.state.tutorial}
              yOffset={this.state.libraryYOffset}
              goBack={a(actions.goBack)}
              onAddSource={a(actions.addSource)}
              onBatchTag={a(actions.batchTag)}
              onClearBlacklist={a(actions.clearBlacklist)}
              onClip={a(actions.clipVideo)}
              onExportLibrary={a(actions.exportLibrary)}
              onImportFromLibrary={a(actions.importFromLibrary)}
              onImportLibrary={a(actions.importLibrary, appStorage.backup.bind(appStorage))}
              onImportInstagram={p(actions.importInstagram)}
              onImportReddit={p(actions.importReddit)}
              onImportTumblr={p(actions.importTumblr)}
              onImportTwitter={p(actions.importTwitter)}
              onManageTags={a(actions.manageTags)}
              onMarkOffline={p(actions.markOffline)}
              onPlay={a(actions.playSceneFromLibrary)}
              onSort={a(actions.sortSources)}
              onTutorial={a(actions.doneTutorial)}
              onUpdateLibrary={a(actions.replaceLibrary)}
              onUpdateMode={a(actions.setMode)}
              savePosition={a(actions.saveLibraryPosition)}
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
              source={actions.getActiveSource(this.state)}
              tutorial={this.state.tutorial}
              videoVolume={this.state.config.defaultScene.videoVolume}
              onTutorial={a(actions.doneTutorial)}
              onStartVCTutorial={a(actions.startVCTutorial)}
              onUpdateClips={a(actions.onUpdateClips)}
              goBack={a(actions.goBack)}
              navigateClipping={a(actions.navigateClipping)}
              cache={a(actions.cacheImage)}
            />
          )}

          {this.isRoute('grid') && (
            <GridSetup
              allScenes={this.state.scenes}
              autoEdit={this.state.autoEdit}
              grid={grid}
              tutorial={this.state.tutorial}
              goBack={a(actions.goBack)}
              onDelete={a(actions.deleteGrid)}
              onPlayGrid={a(actions.playGrid)}
              onTutorial={a(actions.doneTutorial)}
              onUpdateGrid={a(actions.updateGrid)}
            />
          )}

          {this.isRoute('play') && (
            <Player
              config={this.state.config}
              scene={scene}
              scenes={this.state.scenes}
              theme={theme}
              tutorial={this.state.tutorial}
              onUpdateScene={a(actions.updateScene)}
              nextScene={a(actions.nextScene)}
              goBack={a(actions.goBack)}
              goToTagSource={a(actions.playSceneFromLibrary)}
              getTags={actions.getTags.bind(this, this.state.library)}
              setCount={a(actions.setCount)}
              cache={a(actions.cacheImage)}
              blacklistFile={a(actions.blacklistFile)}
              systemMessage={a(actions.systemMessage)}
            />
          )}

          {this.isRoute('libraryplay') && (
            <Player
              config={this.state.config}
              scene={scene}
              scenes={this.state.scenes}
              theme={theme}
              tutorial={this.state.tutorial}
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
              systemMessage={a(actions.systemMessage)}
            />
          )}

          {this.isRoute('gridplay') && (
            <GridPlayer
              config={this.state.config}
              grid={grid}
              scenes={this.state.scenes}
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
              theme={this.state.theme}
              goBack={a(actions.goBack)}
              onBackup={appStorage.backup.bind(appStorage)}
              onChangeThemeColor={a(actions.changeThemeColor)}
              onClean={actions.cleanBackups}
              onDefault={a(actions.setDefaultConfig)}
              onRestore={a(actions.restoreFromBackup)}
              onResetTutorials={a(actions.resetTutorials)}
              onToggleDarkMode={a(actions.toggleDarkMode)}
              onUpdateConfig={a(actions.updateConfig)}
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
              scene={scene}
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
      </ThemeProvider>
    )
  }
};
