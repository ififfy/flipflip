import {remote} from 'electron';
import * as React from 'react';
import Sound from 'react-sound';
import fs from "fs";
import fileURL from "file-url";

import {TOT} from "../../const";
import {urlToPath} from '../../utils';
import Config from "../../Config";
import Scene from '../../Scene';
import CaptionProgram from "./CaptionProgram";
import ChildCallbackHack from './ChildCallbackHack';
import HeadlessScenePlayer from './HeadlessScenePlayer';
import Tag from "../library/Tag";
import AudioGroup from "../sceneDetail/AudioGroup";
import EffectGroup from "../sceneDetail/EffectGroup";
import TextGroup from "../sceneDetail/TextGroup";
import TimingGroup from "../sceneDetail/TimingGroup";

const {getCurrentWindow, Menu, MenuItem, app} = remote;

const keyMap = {
  playPause: ['Play/Pause (Playing)', 'space'],
  historyBack: ['Back in Time', 'left'],
  historyForward: ['Forward in Time', 'right'],
  navigateBack: ['Go Back to Scene Details', 'backspace'],
  toggleFullscreen: ['Toggle Fullscreen', 'CommandOrControl+F'],
  toggleAlwaysOnTop: ['Toggle Always On Top', 'CommandOrControl+T'],
  toggleMenuBarDisplay: ['Toggle Menu Bar', 'CommandOrControl+^'],
  onDelete: ['Delete Image', 'Delete'],
};

let originalMenu = Menu.getApplicationMenu();

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
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    overlayScene?: Scene,
    tags?: Array<Tag>,
    allTags?: Array<Tag>,
    toggleTag?(sourceID: number, tag: Tag): void,
  };

  readonly state = {
    isMainLoaded: false,
    isOverlayLoaded: false,
    isEmpty: false,
    isPlaying: false,
    historyOffset: 0,
    historyPaths: Array<HTMLImageElement>(),
    imagePlayerAdvanceHack: new ChildCallbackHack(),
    imagePlayerDeleteHack: new ChildCallbackHack(),
  };

  render() {
    const canGoBack = this.state.historyOffset > -(this.state.historyPaths.length - 1);
    const canGoForward = this.state.historyOffset < 0;
    const audioPlayStatus = this.state.isPlaying
      ? (Sound as any).status.PLAYING
      : (Sound as any).status.PAUSED;
    const tagNames = this.props.tags ? this.props.tags.map((t) => t.name) : [];
    const isLoaded = this.state.isMainLoaded && (!this.props.overlayScene || this.state.isOverlayLoaded) && !this.state.isEmpty;
    const overlayStrobe = this.props.scene.strobe && this.props.scene.strobeOverlay;
    const showCaptionProgram = (
      isLoaded &&
      this.props.scene.textSource &&
      this.props.scene.textSource.length &&
      this.state.isPlaying);

    return (
      <div className="Player" style={{
        background: overlayStrobe && isLoaded ? this.props.scene.strobeColor : "none",
      }}>
        <div style={{ animation: overlayStrobe && isLoaded ? "strobe " + this.props.scene.strobeTime + "ms steps(1, end) infinite" : "none" }}>
          <HeadlessScenePlayer
            config={this.props.config}
            opacity={1}
            scene={this.props.scene}
            historyOffset={this.state.historyOffset}
            isPlaying={this.state.isPlaying}
            showLoadingState={!this.state.isMainLoaded}
            showEmptyState={true}
            advanceHack={this.state.imagePlayerAdvanceHack}
            deleteHack={this.state.imagePlayerDeleteHack}
            didFinishLoading={this.playMain.bind(this)}
            setHistoryOffset={this.setHistoryOffset.bind(this)}
            setHistoryPaths={this.setHistoryPaths.bind(this)}/>

          {this.props.overlayScene && (
            <HeadlessScenePlayer
              config={this.props.config}
              opacity={this.props.scene.overlaySceneOpacity}
              scene={this.props.overlayScene}
              historyOffset={0}
              isPlaying={this.state.isPlaying && !this.state.isEmpty}
              showLoadingState={this.state.isMainLoaded && !this.state.isOverlayLoaded}
              showEmptyState={false}
              didFinishLoading={this.playOverlay.bind(this)}
              setHistoryOffset={this.nop.bind(this)}
              setHistoryPaths={this.nop.bind(this)}/>
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
            url={textURL(this.props.scene.textKind, this.props.scene.textSource)}/>
        )}

        <div className={`u-button-row ${this.state.isPlaying ? 'u-show-on-hover-only' : ''}`}>
          <div className="u-button-row-right">
            {this.props.scene.audioURL && isLoaded && (
              <Sound
                url={this.props.scene.audioURL}
                playStatus={audioPlayStatus}
                loop={true}
              />
            )}
            <div
              className={`FullscreenButton u-button u-clickable`}
              onClick={this.toggleFull.bind(this)}
              style={{verticalAlign: 'bottom'}}>
              <div className="u-fullscreen"/>
            </div>
            <div
              className={`HistoryBackButton u-button u-clickable ${canGoBack ? '' : 'u-disabled'}`}
              onClick={canGoBack ? this.historyBack.bind(this) : this.nop}>
              &larr; back
            </div>
            {this.state.isPlaying && (
              <div
                className="PauseButton u-button u-clickable"
                onClick={this.setPlayPause.bind(this, false)}>
                Pause
              </div>
            )}
            {!this.state.isPlaying && (
              <div
                className="PlayButton u-button u-clickable"
                onClick={this.setPlayPause.bind(this, true)}>
                Play
              </div>
            )}
            <div
              className={`HistoryForwardButton u-button u-clickable ${canGoForward ? '' : 'u-disabled'}`}
              onClick={canGoForward ? this.historyForward.bind(this) : this.nop}>
              forward &rarr;
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.navigateBack.bind(this)}>Back</div>
        </div>

        {isLoaded && (
          <div className="SceneOptions u-button-sidebar">
            <h2 className="SceneOptionsHeader">Scene Options</h2>
            <TimingGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>

            <EffectGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>

            <AudioGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>

            <TextGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>
          </div>
        )}

        {isLoaded && this.props.allTags && (
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

  componentDidMount() {
    this.setAlwaysOnTop(this.props.config.displaySettings.alwaysOnTop);
    this.setMenuBarVisibility(this.props.config.displaySettings.showMenu);
    this.setFullscreen(this.props.config.displaySettings.fullScreen);

    window.addEventListener('contextmenu', this.showContextMenu, false);

    this.buildMenu();
  }

  buildMenu() {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
        ]
      },
      {
        label: 'Player controls',
        submenu: Object.entries(keyMap).map(([k, v]) => {
          const [label, accelerator] = v;
          return {
            label,
            accelerator,
            click: (this as any)[k].bind(this),
          };
        })
      }
    ]));
  }

  componentWillUnmount() {
    getCurrentWindow().setAlwaysOnTop(false);
    Menu.setApplicationMenu(originalMenu);
    getCurrentWindow().setFullScreen(false);
    window.removeEventListener('contextmenu', this.showContextMenu);
  }

  nop() {}

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
      click: () => { navigator.clipboard.writeText(path); }
    }));
    contextMenu.append(new MenuItem({
      label: 'Open Source',
      click: () => { remote.shell.openExternal(source); }
    }));
    contextMenu.append(new MenuItem({
      label: 'Open File',
      click: () => { remote.shell.openExternal(url); }
    }));
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
    contextMenu.popup({});
  };

  playMain(empty: boolean) {
    this.setState({isMainLoaded: true, isEmpty: empty});
    if (!this.props.overlayScene || this.state.isOverlayLoaded) {
      this.play();
    }
  }

  playOverlay() {
    this.setState({isOverlayLoaded: true});
    if (this.state.isMainLoaded) {
      this.play();
    }
  }

  play() {
    this.setState({isPlaying: true, historyOffset: 0});
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
    keyMap.playPause = ["Play/Pause " + (play ? "(Playing)" : "(Paused)"), 'space'];
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
    this.setMenuBarVisibility(true);
    this.props.goBack();
  }

  setHistoryPaths(paths: Array<HTMLImageElement>) {
    this.setState({historyPaths: paths});
  }

  setHistoryOffset(offset: number) {
    this.setState({historyOffset: offset});
  }

  setAlwaysOnTop(alwaysOnTop: boolean){
    this.props.config.displaySettings.alwaysOnTop = alwaysOnTop;
    keyMap.toggleAlwaysOnTop = ['Toggle Always On Top ' + (alwaysOnTop ? "(On)" : "(Off)"), 'CommandOrControl+T'];
    this.buildMenu();
    getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
  }

  setMenuBarVisibility(showMenu: boolean) {
    this.props.config.displaySettings.showMenu = showMenu;
    keyMap.toggleMenuBarDisplay = ['Toggle Menu Bar ' + (showMenu ? "(On)" : "(Off)"), 'CommandOrControl+^'];
    this.buildMenu();
    getCurrentWindow().setMenuBarVisibility(showMenu);
  }

  setFullscreen(fullScreen: boolean) {
    this.props.config.displaySettings.fullScreen = fullScreen;
    keyMap.toggleFullscreen = ['Toggle Fullscreen ' + (fullScreen ? "(On)" : "(Off)"), 'CommandOrControl+F'];
    this.buildMenu();
    getCurrentWindow().setFullScreen(fullScreen);
  }

  toggleFull() {
    this.setFullscreen(!getCurrentWindow().isFullScreen());
    this.setMenuBarVisibility(!getCurrentWindow().isFullScreen());
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
};
