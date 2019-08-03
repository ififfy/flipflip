import {remote, shell, webFrame} from 'electron';
import * as React from 'react';
import fs from "fs";
import fileURL from "file-url";

import {SL, ST, TOT} from "../../data/const";
import {getCachePath, getSourceType, urlToPath} from '../../data/utils';
import Config from "../../data/Config";
import Scene from '../../data/Scene';
import CaptionProgram from "./CaptionProgram";
import Strobe from "./Strobe";
import ChildCallbackHack from './ChildCallbackHack';
import HeadlessScenePlayer from './HeadlessScenePlayer';
import Tag from "../library/Tag";
import LibrarySource from "../library/LibrarySource";
import Progress from "../ui/Progress";
import AudioGroup from "../sceneDetail/AudioGroup";
import ImageEffectGroup from "../sceneDetail/ImageEffectGroup";
import TextGroup from "../sceneDetail/TextGroup";
import ImageGroup from "../sceneDetail/ImageGroup";
import SceneEffectGroup from "../sceneDetail/SceneEffectGroup";
import StrobeGroup from "../sceneDetail/StrobeGroup";
import ZoomMoveGroup from "../sceneDetail/ZoomMoveGroup";
import VideoGroup from "../sceneDetail/VideoGroup";
import {createMainMenu, createMenuTemplate} from "../../../main/MainMenu";

const {getCurrentWindow, Menu, MenuItem, app} = remote;

function textURL(kind: string, src: string): string {
  switch (kind) {
    case TOT.url:
      return src;
    case TOT.hastebin:
      return `https://hastebin.com/raw/${src}`;
    default:
      return src;
  }
}

export default class Player extends React.Component {
  readonly props: {
    config: Config,
    goBack(): void,
    scene: Scene,
    scenes: Array<Scene>,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    nextScene?(): void,
    tags?: Array<Tag>,
    allTags?: Array<Tag>,
    toggleTag?(sourceID: number, tag: Tag): void,
    goToTagSource?(source: LibrarySource): void,
    navigateTagging?(offset: number): void,
    getTags(source: string): Array<Tag>,
  };

  readonly state = {
    canStart: false,
    hasStarted: false,
    isMainLoaded: false,
    areOverlaysLoaded: Array<boolean>(this.getValidOverlays().length).fill(false),
    isEmpty: false,
    isPlaying: true,
    total: 0,
    progress: 0,
    progressMessage: this.props.scene.sources.length > 0 ? this.props.scene.sources[0].url : "",
    startTime: null as Date,
    historyOffset: 0,
    historyPaths: Array<any>(),
    imagePlayerAdvanceHack: new ChildCallbackHack(),
    imagePlayerDeleteHack: new ChildCallbackHack(),
    mainVideo: null as HTMLVideoElement,
    overlayVideos: Array<HTMLVideoElement>(this.getValidOverlays().length).fill(null),
    timeToNextFrame: null as number,
  };

  _interval: NodeJS.Timer = null;
  _toggleStrobe = false;

  render() {
    const canGoBack = this.state.historyOffset > -(this.state.historyPaths.length - 1);
    const canGoForward = this.state.historyOffset < 0;
    const tagNames = this.props.tags ? this.props.tags.map((t) => t.name) : [];
    const validOverlays = this.getValidOverlays();
    const nextScene = this.getScene(this.props.scene.nextSceneID);
    const showCaptionProgram = (
      this.props.scene.textSource &&
      this.props.scene.textSource.length &&
      this.state.isPlaying &&
      this.state.hasStarted);
    const showStrobe = this.props.scene.strobe && this.state.hasStarted && this.state.isPlaying &&
      (this.props.scene.strobeLayer == SL.top || this.props.scene.strobeLayer == SL.bottom);

    return (
      <div className="Player">
        {showStrobe && (
          <Strobe
            pulse={this.props.scene.strobePulse}
            opacity={this.props.scene.strobeLayer == SL.bottom ? this.props.scene.strobeOpacity : 1}
            durationTF={this.props.scene.strobeTF}
            duration={this.props.scene.strobeTime}
            durationMin={this.props.scene.strobeTimeMin}
            durationMax={this.props.scene.strobeTimeMax}
            sinRate={this.props.scene.strobeSinRate}
            delayTF={this.props.scene.strobeDelayTF}
            delay={this.props.scene.strobeDelay}
            delayMin={this.props.scene.strobeDelayMin}
            delayMax={this.props.scene.strobeDelayMax}
            delaySinRate={this.props.scene.strobeDelaySinRate}
            color={this.props.scene.strobeColor}
            timeToNextFrame={this.state.timeToNextFrame}
            toggleStrobe={this._toggleStrobe}
          />
        )}
        {!this.state.hasStarted && !this.state.isEmpty && (
          <Progress
            total={this.state.total}
            current={this.state.progress}
            message={this.state.progressMessage}>
            {this.state.canStart && (<div
              className="StartButton u-button u-clickable"
              onClick={this.start.bind(this, this.state.canStart, true)}>
              Start Now
            </div>)}
          </Progress>
        )}
        {this.state.isEmpty && (
          <div className="EmptyIndicator"><p>I couldn't find anything</p><p>(ಥ﹏ಥ)</p></div>
        )}

        <div style={{display: this.state.hasStarted ? "" : "none"}}>
          <HeadlessScenePlayer
            config={this.props.config}
            scene={this.props.scene}
            nextScene={nextScene}
            opacity={1}
            isPlaying={this.state.isPlaying}
            hasStarted={this.state.hasStarted}
            strobeLayer={this.props.scene.strobe ? this.props.scene.strobeLayer : null}
            historyOffset={this.state.historyOffset}
            advanceHack={this.state.imagePlayerAdvanceHack}
            deleteHack={this.state.imagePlayerDeleteHack}
            setHistoryOffset={this.setHistoryOffset.bind(this)}
            setHistoryPaths={this.setHistoryPaths.bind(this)}
            finishedLoading={this.setMainLoaded.bind(this)}
            firstImageLoaded={this.setMainCanStart.bind(this)}
            setProgress={this.setProgress.bind(this)}
            setVideo={this.setMainVideo.bind(this)}
            setTimeToNextFrame={this.setTimeToNextFrame.bind(this)}
          />

          {validOverlays.length > 0 && !this.state.isEmpty && validOverlays.map((overlay, index) => {
            let showProgress = this.state.isMainLoaded && !this.state.hasStarted;
            if (showProgress) {
              for (let x=0; x < index; x++) {
                if (!this.state.areOverlaysLoaded[x]) {
                  showProgress = false;
                  break;
                }
              }
            }
            return (
              <HeadlessScenePlayer
                key={overlay.id}
                config={this.props.config}
                scene={this.getScene(overlay.sceneID)}
                opacity={overlay.opacity / 100}
                isPlaying={this.state.isPlaying && !this.state.isEmpty}
                hasStarted={this.state.hasStarted}
                historyOffset={0}
                setHistoryOffset={this.nop}
                setHistoryPaths={this.nop}
                finishedLoading={this.setOverlayLoaded.bind(this, index)}
                firstImageLoaded={this.nop}
                setProgress={showProgress ? this.setProgress.bind(this) : this.nop}
                setVideo={this.setOverlayVideo.bind(this, index)}
              />
            );}
          )}
        </div>

        {showCaptionProgram && (
          <CaptionProgram
            blinkColor={this.props.scene.blinkColor}
            blinkFontSize={this.props.scene.blinkFontSize}
            blinkFontFamily={this.props.scene.blinkFontFamily}
            captionColor={this.props.scene.captionColor}
            captionFontSize={this.props.scene.captionFontSize}
            captionFontFamily={this.props.scene.captionFontFamily}
            captionBigColor={this.props.scene.captionBigColor}
            captionBigFontSize={this.props.scene.captionBigFontSize}
            captionBigFontFamily={this.props.scene.captionBigFontFamily}
            countColor={this.props.scene.countColor}
            countFontSize={this.props.scene.countFontSize}
            countFontFamily={this.props.scene.countFontFamily}
            url={textURL(this.props.scene.textKind, this.props.scene.textSource)}
            getTags={this.props.getTags}
            currentSource={this.state.historyPaths.length > 0 ? this.state.historyPaths[0].getAttribute("source") : null}/>
        )}

        <div className={`u-button-row ${this.state.hasStarted && this.state.isPlaying ? 'u-show-on-hover-only' : ''}`}>
          <div className="u-button-row-right">
            <div
              className="FullscreenButton u-button u-icon-button u-clickable"
              title="Toggle Fullscreen"
              onClick={this.toggleFull.bind(this)}>
              <div className="u-fullscreen"/>
            </div>
            <div
              className={`HistoryBackButton u-button u-icon-button u-clickable ${canGoBack ? '' : 'u-disabled'}`}
              title="Backwards"
              onClick={canGoBack ? this.historyBack.bind(this) : this.nop}>
              <div className="u-left-arrow"/>
            </div>
            {this.state.isPlaying && (
              <div
                className="PauseButton u-button u-icon-button u-clickable"
                title="Pause"
                onClick={this.setPlayPause.bind(this, false)}>
                <div className="u-pause"/>
              </div>
            )}
            {!this.state.isPlaying && (
              <div
                className="PlayButton u-button u-icon-button u-clickable"
                title="Play"
                onClick={this.setPlayPause.bind(this, true)}>
                <div className="u-play"/>
              </div>
            )}
            <div
              className={`HistoryForwardButton u-button u-icon-button u-clickable ${canGoForward ? '' : 'u-disabled'}`}
              title="Forwards"
              onClick={canGoForward ? this.historyForward.bind(this) : this.nop}>
              <div className="u-right-arrow"/>
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.navigateBack.bind(this)}>Back</div>
        </div>

        {this.state.hasStarted && (
          <div className="SceneOptions ControlGroupGroup u-button-sidebar">
            <h2 className="SceneOptionsHeader">Scene Options</h2>
            <VideoGroup
              scene={this.props.scene}
              overlayScenes={this.getValidOverlays().map((o) => this.getScene(o.sceneID))}
              isPlaying={this.state.isPlaying}
              mainVideo={this.state.mainVideo}
              overlayVideos={this.state.overlayVideos}
              isPlayer={true}
              onUpdateScene={this.props.onUpdateScene.bind(this)}
            />

            <SceneEffectGroup
              scene={this.props.scene}
              showAll={this.props.tags == null}
              allScenes={this.props.scenes}
              onUpdateScene={this.props.onUpdateScene.bind(this)} />

            <ImageEffectGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)} />

            <ZoomMoveGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)} />

            <StrobeGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)} />

            <ImageGroup
              scene={this.props.scene}
              isPlayer={true}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>

            <AudioGroup
              scene={this.props.scene}
              isPlaying={this.state.isPlaying}
              isPlayer={true}
              scenePaths={this.state.historyPaths}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>

            <TextGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>
          </div>
        )}

        {this.state.hasStarted && this.props.allTags && (
          <div className="SourceTags">
            {this.props.allTags.map((tag) =>
              <div className={`SourceTag u-clickable ${tagNames && tagNames.includes(tag.name) ? 'u-selected' : ''}`}
                   onClick={this.props.toggleTag.bind(this, this.props.scene.libraryID, tag)}
                   key={tag.id}>
                <div className="SourceTagTitle">
                  {tag.name}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  nextSceneLoop() {
    if (this.props.scene.nextSceneID === 0) {
      clearInterval(this._interval);
    }
    if (this.state.startTime != null &&
      Math.round(Math.abs(new Date().getTime() - this.state.startTime.getTime()) / 1000) >= this.props.scene.nextSceneTime) {
      this.setState({startTime: null});
      this.props.nextScene();
    }
  }

  componentDidUpdate(props: any, state: any) {
    if (props.scene.id !== this.props.scene.id) {
      if (this.props.tags) {
        this.setState({startTime: new Date()});
      } else {
        this.setState({hasStarted: true, startTime: new Date()});
      }
    }
  }

  componentDidMount() {
    this.setAlwaysOnTop(this.props.config.displaySettings.alwaysOnTop);
    this.setMenuBarVisibility(this.props.config.displaySettings.showMenu);
    this.setFullscreen(this.props.config.displaySettings.fullScreen);

    window.addEventListener('contextmenu', this.showContextMenu, false);
    window.addEventListener('keydown', this.onKeyDown, false);

    this.buildMenu();
    this._interval = setInterval(() => this.nextSceneLoop(), 1000);
  }

  buildMenu() {
    createMainMenu(Menu, createMenuTemplate(app, {
      label: 'Player controls',
      submenu: Array.from(this.getKeyMap().entries()).map(([k, v]) => {
        const [label, accelerator] = v;
        return {
          label,
          accelerator,
          click: (this as any)[k as any].bind(this),
        };
      })
    }));
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    this._interval = null;
    getCurrentWindow().setAlwaysOnTop(false);
    getCurrentWindow().setFullScreen(false);
    createMainMenu(Menu, createMenuTemplate(app));
    window.removeEventListener('contextmenu', this.showContextMenu);
    window.removeEventListener('keydown', this.onKeyDown);
    // Clear ALL the available browser caches
    global.gc();
    webFrame.clearCache();
    remote.getCurrentWindow().webContents.session.clearCache(() => {});
  }

  nop() {}

  setProgress(total: number, current: number, message: string) {
    this.setState({total: total, progress: current, progressMessage: message});
  }

  showContextMenu = () => {
    const contextMenu = new Menu();
    const img = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.state.historyOffset];
    const url = img.src;
    let source = img.getAttribute("source");
    if (!source.startsWith("http://") && !source.startsWith("https://")) {
      source = urlToPath(fileURL(source));
    }
    const isFile = url.startsWith('file://');
    const path = urlToPath(url);
    contextMenu.append(new MenuItem({
      label: source,
      click: () => { navigator.clipboard.writeText(source); }
    }));
    contextMenu.append(new MenuItem({
      label: isFile ? path : url,
      click: () => { navigator.clipboard.writeText(isFile ? path : url); }
    }));
    contextMenu.append(new MenuItem({
      label: 'Open Source',
      click: () => { remote.shell.openExternal(source); }
    }));
    contextMenu.append(new MenuItem({
      label: 'Open File',
      click: () => { remote.shell.openExternal(url); }
    }));
    if (this.props.config.caching.enabled && getSourceType(source) != ST.local) {
      contextMenu.append(new MenuItem({
        label: 'Open Cached Images',
        click: () => {
          // for some reason windows uses URLs and everyone else uses paths
          if (process.platform === "win32") {
            remote.shell.openExternal(getCachePath(source, this.props.config));
          } else {
            remote.shell.openExternal(urlToPath(getCachePath(source, this.props.config)));
          }
        }
      }));
    }
    if (isFile) {
      contextMenu.append(new MenuItem({
        label: 'Reveal',
        click: () => {
          // for some reason windows uses URLs and everyone else uses paths
          if (process.platform === "win32") {
            remote.shell.showItemInFolder(url);
          } else {
            remote.shell.showItemInFolder(path);
          }
        }
      }));
      contextMenu.append(new MenuItem({
        label: 'Delete',
        click: () => {
          this.onDeletePath(path);
        }
      }));
    }
    if (!this.props.tags) {
      contextMenu.append(new MenuItem({
        label: 'Goto Tag Source',
        click: () => {
          this.props.goToTagSource(new LibrarySource({url: source}));
        }
      }));
    }
    contextMenu.popup({});
  };

  getValidOverlays() {
    return this.props.scene.overlays.filter((o) => {
      if (o.sceneID == 0) return false;
      const getO = this.getScene(o.sceneID);
      return (getO != null && getO.sources.length > 0);
    });
  }

  setMainCanStart() {
    if (!this.state.canStart) {
      this.setState({canStart: true, isEmpty: false});
      this.start(true);
    }
  }

  setMainLoaded(empty: boolean) {
    if (empty) {
      this.setState({isEmpty: empty});
    } else {
      this.setState({isMainLoaded: true});
      this.play();
    }
  }

  setOverlayLoaded(index: number, empty: boolean) {
    const newAOL = this.state.areOverlaysLoaded;
    newAOL[index] = true;
    this.setState({areOverlaysLoaded: newAOL});
    this.play();
  }

  setTimeToNextFrame(ttnf: number) {
    this._toggleStrobe = !this._toggleStrobe;
    this.setState({timeToNextFrame: ttnf});
  }

  setMainVideo(video: HTMLVideoElement) {
    this.setState({mainVideo: video});
  }

  setOverlayVideo(index: number, video: HTMLVideoElement) {
    const newOV = this.state.overlayVideos;
    newOV[index] = video;
    this.setState({overlayVideos: newOV});
  }

  start(canStart: boolean, force = false) {
    const isLoaded = !force && this.state.isMainLoaded && (this.getValidOverlays().length == 0 || this.state.areOverlaysLoaded.find((b) => !b) == null);
    if (force || ((isLoaded || this.props.config.displaySettings.startImmediately) && canStart)) {
      this.setState({hasStarted: true, isLoaded: true, startTime: new Date()});
    } else {
      this.setState({isLoaded: isLoaded});
    }
  }

  play() {
    this.setState({isPlaying: true, historyOffset: 0});
    this.start(this.state.canStart);
  }

  pause() {
    this.setState({isPlaying: false});
  }

  setPlayPause(play: boolean) {
    if (play) {
      this.play()
    } else {
      this.pause()
    }
    this.buildMenu();
  }

  historyBack() {
    if (this.state.historyOffset > -(this.state.historyPaths.length - 1)) {
      this.setState({
        isPlaying: false,
        historyOffset: this.state.historyOffset - 1,
      });
    }
  }

  historyForward() {
    if (this.state.historyOffset >= 0) {
      this.state.imagePlayerAdvanceHack.fire();
    } else {
      this.setState({
        isPlaying: false,
        historyOffset: this.state.historyOffset + 1,
      });
    }
  }

  onDeletePath(path: string) {
    if (!confirm("Are you sure you want to delete " + path + "?")) return;
    if (fs.existsSync(path)) {
      fs.unlink(path, (err) => {
        if (err) {
          alert("An error ocurred while deleting the file: " + err.message);
          console.error(err);
        } else {
          this.state.imagePlayerDeleteHack.fire();
        }
      });
    } else {
      alert("This file doesn't exist, cannot delete");
    }
  }

  navigateBack() {
    const window = getCurrentWindow();
    window.setFullScreen(false);
    window.setMenuBarVisibility(true);
    this.props.goBack();
  }

  setHistoryPaths(paths: Array<any>) {
    this.setState({historyPaths: paths});
  }

  setHistoryOffset(offset: number) {
    this.setState({historyOffset: offset});
  }

  setAlwaysOnTop(alwaysOnTop: boolean){
    this.props.config.displaySettings.alwaysOnTop = alwaysOnTop;
    this.buildMenu();
    getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
  }

  setMenuBarVisibility(showMenu: boolean) {
    this.props.config.displaySettings.showMenu = showMenu;
    this.buildMenu();
    getCurrentWindow().setMenuBarVisibility(showMenu);
  }

  setFullscreen(fullScreen: boolean) {
    this.props.config.displaySettings.fullScreen = fullScreen;
    this.buildMenu();
    getCurrentWindow().setFullScreen(fullScreen);
  }

  toggleFull() {
    this.setFullscreen(!getCurrentWindow().isFullScreen());
    this.setMenuBarVisibility(!getCurrentWindow().isFullScreen());
  }

  getScene(id: number): Scene {
    return this.props.scenes.find((s) => s.id == id);
  }

  getKeyMap() {
    const keyMap = new Map<String, Array<string>>([
      ['playPause', ['Play/Pause ' + (this.state.isPlaying ? '(Playing)' : '(Paused)'), 'space']],
      ['historyBack', ['Back in Time', 'left']],
      ['historyForward', ['Forward in Time', 'right']],
      ['navigateBack', ['Go Back to Scene Details', 'escape']],
      ['toggleFullscreen', ['Toggle Fullscreen ' + (this.props.config.displaySettings.fullScreen ? '(On)' : '(Off)'), 'Control+F']],
      ['toggleAlwaysOnTop', ['Toggle Always On Top ' + (this.props.config.displaySettings.alwaysOnTop ? '(On)' : '(Off)'), 'Control+T']],
      ['toggleMenuBarDisplay', ['Toggle Menu Bar ' + (this.props.config.displaySettings.showMenu ? '(On)' : '(Off)'), 'Control+G']],
    ]);

    if (this.props.config.caching.enabled) {
      keyMap.set('onDelete', ['Delete Image', 'Delete']);
    }

    if (this.props.tags != null) {
      keyMap.set('prevSource', ['Previous Source', '[']);
      keyMap.set('nextSource', ['Next Source', ']']);
    }

    return keyMap;
  }

  onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        this.playPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.historyBack();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.historyForward();
        break;
      case 'Escape':
        e.preventDefault();
        this.navigateBack();
        break;
      case 'f':
        if (e.ctrlKey) {
          e.preventDefault();
          this.toggleFullscreen();
        }
        break;
      case 't':
        if (e.ctrlKey) {
          e.preventDefault();
          this.toggleAlwaysOnTop();
        }
        break;
      case 'g':
        if (e.ctrlKey) {
          e.preventDefault();
          this.toggleMenuBarDisplay();
        }
        break;
      case 'Delete':
        if (this.props.config.caching.enabled) {
          e.preventDefault();
          this.onDelete();
        }
        break;
      case '[':
        if (this.props.tags != null) {
          e.preventDefault();
          this.prevSource();
        }
        break;
      case ']':
        if (this.props.tags != null) {
          e.preventDefault();
          this.nextSource();
        }
        break;
    }
  };

  /* Menu and hotkey options DON'T DELETE */

  onDelete() {
    const img = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.state.historyOffset];
    const url = img.src;
    const isFile = url.startsWith('file://');
    const path = urlToPath(url);
    if (isFile) {
      this.onDeletePath(path);
    }
  }

  playPause() {
    this.setPlayPause(!this.state.isPlaying)
  }

  toggleAlwaysOnTop() {
    this.setAlwaysOnTop(!this.props.config.displaySettings.alwaysOnTop);
  }

  toggleMenuBarDisplay() {
    this.setMenuBarVisibility(!this.props.config.displaySettings.showMenu);
  }

  toggleFullscreen() {
    this.setFullscreen(!this.props.config.displaySettings.fullScreen);
  }

  prevSource() {
    this.navigateTagging(-1);
  }

  nextSource() {
    this.navigateTagging(1);
  }

  navigateTagging(offset: number) {
    this.setState({
      canStart: false,
      hasStarted: false,
      isMainLoaded: false,
      isEmpty: false,
      historyOffset: 0,
      historyPaths: Array<any>(),
      total: 0,
      progress: 0,
      progressMessage: this.props.scene.sources.length > 0 ? this.props.scene.sources[0].url : "",
    });
    this.props.navigateTagging(offset);
  }
};
