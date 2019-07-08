import {remote, shell} from 'electron';
import defaultMenu from "electron-default-menu";
import * as React from 'react';
import fs from "fs";
import fileURL from "file-url";
import {animated, Transition} from "react-spring/renderprops";

import {SL, ST, TOT} from "../../data/const";
import {getCachePath, getSourceType, urlToPath} from '../../data/utils';
import Config from "../../data/Config";
import Scene from '../../data/Scene';
import CaptionProgram from "./CaptionProgram";
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
  };

  readonly state = {
    isLoaded: false,
    hasStarted: false,
    canMainStart: false,
    isMainLoaded: false,
    canOverlaysStart: Array<boolean>(this.getValidOverlays().length).fill(false),
    areOverlaysLoaded: Array<boolean>(this.getValidOverlays().length).fill(false),
    isEmpty: false,
    isPlaying: true,
    toggleStrobe: false,
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
  };

  interval: NodeJS.Timer = null;
  strobeInterval: NodeJS.Timer = null;
  strobeDelay = 0;

  render() {
    const canGoBack = this.state.historyOffset > -(this.state.historyPaths.length - 1);
    const canGoForward = this.state.historyOffset < 0;
    const tagNames = this.props.tags ? this.props.tags.map((t) => t.name) : [];
    const validOverlays = this.getValidOverlays();
    const showCaptionProgram = (
      this.props.scene.textSource &&
      this.props.scene.textSource.length &&
      this.state.isPlaying);
    const nextScene = this.getScene(this.props.scene.nextSceneID);
    const strobeOpacity = this.props.scene.strobeLayer == SL.bottom ? this.props.scene.strobeOpacity : 1;

    return (
      <div className="Player">
        {this.props.scene.strobe && this.state.hasStarted &&
          (this.props.scene.strobeLayer == SL.top || this.props.scene.strobeLayer == SL.bottom) && (
          <Transition
            reset
            unique
            items={this.state.toggleStrobe}
            config={{duration: (this.props.scene.strobeTime > 0 ? this.props.scene.strobeTime : 10)}}
            from={{ backgroundColor: this.props.scene.strobeColor, opacity: strobeOpacity}}
            enter={{ opacity: 0 }}
            leave={{ opacity: 0 }} >
            {toggle => props => <animated.div className="Strobe u-fill-container" style={props}/>}
          </Transition>
        )}
        {!this.state.hasStarted && !this.state.isEmpty && (
          <Progress
            total={this.state.total}
            current={this.state.progress}
            message={this.state.progressMessage}>
            {this.state.isLoaded && (<div
              className="StartButton u-button u-clickable"
              onClick={this.start.bind(this, true)}>
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
            strobeLayer={this.props.scene.strobe ? this.props.scene.strobeLayer : null}
            toggleStrobe={this.state.toggleStrobe}
            historyOffset={this.state.historyOffset}
            advanceHack={this.state.imagePlayerAdvanceHack}
            deleteHack={this.state.imagePlayerDeleteHack}
            setHistoryOffset={this.setHistoryOffset.bind(this)}
            setHistoryPaths={this.setHistoryPaths.bind(this)}
            finishedLoading={this.setMainLoaded.bind(this)}
            firstImageLoaded={this.setMainCanStart.bind(this)}
            setProgress={this.setProgress.bind(this)}
            hasStarted={this.state.hasStarted}
            setVideo={this.setMainVideo.bind(this)}
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
                historyOffset={0}
                setHistoryOffset={this.nop}
                setHistoryPaths={this.nop}
                finishedLoading={this.setOverlayLoaded.bind(this, overlay.id)}
                firstImageLoaded={this.setOverlayCanStart.bind(this, overlay.id)}
                setProgress={showProgress ? this.setProgress.bind(this) : this.nop}
                hasStarted={this.state.hasStarted}
                setVideo={this.setOverlayVideo.bind(this, overlay.id)}
              />
            );}
          )}
        </div>

        {this.state.hasStarted && showCaptionProgram && (
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
            url={textURL(this.props.scene.textKind, this.props.scene.textSource)}/>
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
      clearInterval(this.interval);
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
    const strobeDelay = props.scene.strobePulse ? props.scene.strobeDelay : props.scene.strobeTime;
    if (strobeDelay != this.strobeDelay) {
      clearInterval(this.strobeInterval);
      this.strobeDelay = strobeDelay;
      this.strobeInterval = setInterval(() => {
        this.setState({toggleStrobe: !this.state.toggleStrobe})
      }, this.strobeDelay);
    }
  }

  componentDidMount() {
    this.setAlwaysOnTop(this.props.config.displaySettings.alwaysOnTop);
    this.setMenuBarVisibility(this.props.config.displaySettings.showMenu);
    this.setFullscreen(this.props.config.displaySettings.fullScreen);

    window.addEventListener('contextmenu', this.showContextMenu, false);

    this.buildMenu();
    this.interval = setInterval(() => this.nextSceneLoop(), 1000);
    this.strobeInterval = setInterval(() => {
      this.setState({toggleStrobe: !this.state.toggleStrobe})
    }, this.props.scene.strobePulse ? this.props.scene.strobeDelay : this.props.scene.strobeTime);
  }

  getKeyMap() {
    const keyMap = new Map<String, Array<string>>([
      ['playPause', ['Play/Pause (Playing)', 'space']],
      ['historyBack', ['Back in Time', 'left']],
      ['historyForward', ['Forward in Time', 'right']],
      ['navigateBack', ['Go Back to Scene Details', 'escape']],
      ['toggleFullscreen', ['Toggle Fullscreen', 'CommandOrControl+F']],
      ['toggleAlwaysOnTop', ['Toggle Always On Top', 'CommandOrControl+T']],
      ['toggleMenuBarDisplay', ['Toggle Menu Bar', 'CommandOrControl+^']],
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

  buildMenu() {
    const menu = defaultMenu(app, shell);
    if (process.platform !== 'darwin') {
      menu.splice(0, 0, {
        label: 'File',
        submenu: [
          { role: 'quit' }
        ]
      })
    }
    menu.splice(2, 1, {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
      ]
    });
    menu.splice(4, 1, {
      label: 'Player controls',
      submenu: Array.from(this.getKeyMap().entries()).map(([k, v]) => {
        const [label, accelerator] = v;
        return {
          label,
          accelerator,
          click: (this as any)[k as any].bind(this),
        };
      })
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.strobeInterval);
    getCurrentWindow().setAlwaysOnTop(false);
    const menu = defaultMenu(app, shell);
    if (process.platform !== 'darwin') {
      menu.splice(0, 0, {
        label: 'File',
        submenu: [
          { role: 'quit' }
        ]
      })
    }
    menu.splice(2, 1, {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
      ]
    });
    menu.splice(4, 1);
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
    getCurrentWindow().setFullScreen(false);
    window.removeEventListener('contextmenu', this.showContextMenu);
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
    if (!this.state.canMainStart) {
      this.setState({canMainStart: true, isEmpty: false});
      if (this.getValidOverlays().length == 0 || this.state.canOverlaysStart.find((b) => !b) == null) {
        this.play();
      }
    }
  }

  setOverlayCanStart(id: number) {
    if (this.state.canOverlaysStart.find((b) => !b) != null) {
      const newCOS = this.state.canOverlaysStart;
      const indexOf = this.getValidOverlays().map((o) => o.id).indexOf(id);
      newCOS[indexOf] = true;
      this.setState({canOverlayStart: newCOS});
      if (this.state.canOverlaysStart.find((b) => !b) == null && this.state.canMainStart) {
        this.play();
      }
    }
  }

  setMainLoaded(empty: boolean) {
    if (empty) {
      this.setState({isEmpty: empty});
    } else {
      this.setState({isMainLoaded: true});
      if (this.getValidOverlays().length == 0 || this.state.areOverlaysLoaded.find((b) => !b) == null) {
        this.start();
      }
    }
  }

  setOverlayLoaded(id: number, empty: boolean) {
    const newAOL = this.state.areOverlaysLoaded;
    const indexOf = this.getValidOverlays().map((o) => o.id).indexOf(id);
    newAOL[indexOf] = true;
    this.setState({areOverlaysLoaded: newAOL});
    if (this.state.areOverlaysLoaded.find((b) => !b) == null && this.state.isMainLoaded) {
      this.start();
    }
  }

  setMainVideo(video: HTMLVideoElement) {
    this.setState({mainVideo: video});
  }

  setOverlayVideo(id: number, video: HTMLVideoElement) {
    const newOV = this.state.overlayVideos;
    const indexOf = this.getValidOverlays().map((o) => o.id).indexOf(id);
    newOV[indexOf] = video;
    this.setState({overlayVideos: newOV});
  }

  start() {
    this.setState({hasStarted: true, startTime: new Date()});
  }

  play() {
    this.setState({isPlaying: true, isLoaded: true, historyOffset: 0});
    if (this.props.config.displaySettings.startImmediately) {
      this.start();
    }
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
    this.getKeyMap().set('playPause', ["Play/Pause " + (play ? "(Playing)" : "(Paused)"), 'space']);
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
    this.getKeyMap().set('toggleAlwaysOnTop', ['Toggle Always On Top ' + (alwaysOnTop ? "(On)" : "(Off)"), 'CommandOrControl+T']);
    this.buildMenu();
    getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
  }

  setMenuBarVisibility(showMenu: boolean) {
    this.props.config.displaySettings.showMenu = showMenu;
    this.getKeyMap().set('toggleMenuBarDisplay', ['Toggle Menu Bar ' + (showMenu ? "(On)" : "(Off)"), 'CommandOrControl+^']);
    this.buildMenu();
    getCurrentWindow().setMenuBarVisibility(showMenu);
  }

  setFullscreen(fullScreen: boolean) {
    this.props.config.displaySettings.fullScreen = fullScreen;
    this.getKeyMap().set('toggleFullscreen', ['Toggle Fullscreen ' + (fullScreen ? "(On)" : "(Off)"), 'CommandOrControl+F']);
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
      isLoaded: false,
      hasStarted: false,
      canMainStart: false,
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
