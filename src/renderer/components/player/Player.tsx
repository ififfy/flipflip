import {remote} from 'electron';
import * as React from 'react';
import Sound from 'react-sound';
import fs from "fs";
import fileURL from "file-url";

import {TOT} from "../../const";
import {urlToPath} from '../../utils';
import Config from "../../Config";
import Scene from '../../Scene';
import ChildCallbackHack from './ChildCallbackHack';
import HeadlessScenePlayer from './HeadlessScenePlayer';
import Tag from "../library/Tag";
import AudioGroup from "../sceneDetail/AudioGroup";
import EffectGroup from "../sceneDetail/EffectGroup";
import TextGroup from "../sceneDetail/TextGroup";
import TimingGroup from "../sceneDetail/TimingGroup";
import CaptionProgram from "./CaptionProgram";
import { bool } from 'prop-types';

const {getCurrentWindow, Menu, MenuItem, app} = remote;

var keyMap = {
  playPause: ['Play/Pause (Playing)', 'space'],
  historyBack: ['Back in Time', 'left'],
  historyForward: ['Forward in Time', 'right'],
  navigateBack: ['Go Back to Scene Details', 'backspace'],
  toggleFullscreen: ['Toggle Fullscreen', 'CommandOrControl+F'],
  alwaysOnTop: ['Toggle On Top', 'CommandOrControl+T'],
  toggleMenuBarDisplay: ['Show/Hide Menu', 'CommandOrControl+^'],
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

        <div className={`u-button-row ${this.state.isPlaying ? 'u-show-on-hover-only' : ''}`} 
             onMouseEnter={this.setMenuBarVisibleOnHover.bind(this)}
             onMouseLeave={this.setMenuBarVisibleOnHover.bind(this)}
             >
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
              onClick={this.toggleFullscreen.bind(this)}>
              Fullscreen on/off
            </div>
            <div
              className={`HistoryBackButton u-button u-clickable ${canGoBack ? '' : 'u-disabled'}`}
              onClick={canGoBack ? this.historyBack.bind(this) : this.nop}>
              &larr; back
            </div>
            {this.state.isPlaying && (
              <div
                className="PauseButton u-button u-clickable"
                onClick={this.pause.bind(this)}>
                Pause
              </div>
            )}
            {!this.state.isPlaying && (
              <div
                className="PlayButton u-button u-clickable"
                onClick={this.play.bind(this)}>
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
    this.setFullScreen(getCurrentWindow().isFullScreen());
    window.addEventListener('contextmenu', this.showContextMenu, false);

    this.BuildMenu();
  }

  private BuildMenu() {
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
    Menu.setApplicationMenu(originalMenu);
    getCurrentWindow().setFullScreen(false);
    window.removeEventListener('contextmenu', this.showContextMenu);
  }

  nop() {

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

  play() {
    this.setState({isPlaying: true, historyOffset: 0});
  }

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

  pause() {
    this.setState({isPlaying: false});
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

  setHistoryPaths(paths: Array<HTMLImageElement>) {
    this.setState({historyPaths: paths});
  }

  setHistoryOffset(offset: number) {
    this.setState({historyOffset: offset});
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

  setPlayPause(bPlay: boolean) {
    if (bPlay) {
      this.play()
    }
    else {
      this.pause()
    }
    keyMap.playPause[0] = "Play/Pause " + (bPlay?"(Playing)":"(Paused)");
    this.BuildMenu();
  }


  alwaysOnTop() {
    const window = getCurrentWindow();
    this.setAlwaysOnTop(!window.isAlwaysOnTop());
  }

  /** Sets window.setAlwaysOnTop and strores the state */
  setAlwaysOnTop(value:boolean){
    const window = getCurrentWindow();
    this.props.config.displaySettings.alwaysOnTop = value;
    window.setAlwaysOnTop(value);
    keyMap.alwaysOnTop[0] = "Always on top " + (value?"(On)":"(Off)");
    this.BuildMenu();
  }

  toggleMenuBarDisplay() {
    this.setMenuBarVisibility(!this.props.config.displaySettings.showMenu);
  }

  /** Sets window.setMenuBarVisibility and stores the state */
  setMenuBarVisibility(value: boolean) {
    const window = getCurrentWindow();
    this.props.config.displaySettings.showMenu = value;
    window.setMenuBarVisibility(value);
    keyMap.toggleMenuBarDisplay[0] = "Show/Hide Menu " + (value?"(Shown)":"(Hidden)");
    this.BuildMenu();

  }

  setMenuBarVisibleOnHover(mouseEvent: MouseEvent) {
    const window = getCurrentWindow();
  
    // Mouse entering button row and menu not visible - make menu visible
    if (!window.isMenuBarVisible() && mouseEvent.type == "mouseenter" && mouseEvent.clientY > 0) {
      window.setMenuBarVisibility(true);
    }
    // Mouse leaving button row going to menu keep menu visible
    else if (mouseEvent.type == "mouseleave" && mouseEvent.clientY <= 0) {
      window.setMenuBarVisibility(true);
    }
    // Mouse leaving button row not going to menu set menu per props
    else if (mouseEvent.type == "mouseleave" && mouseEvent.clientY >= 0) {
      window.setMenuBarVisibility(this.props.config.displaySettings.showMenu);
    }
  }

  toggleFullscreen() {
    const window = getCurrentWindow();
    this.setFullScreen(!window.isFullScreen());
  }

  setFullScreen(bFullScreen:boolean){
    const window = getCurrentWindow();
    this.setMenuBarVisibility(!bFullScreen);
    window.setFullScreen(bFullScreen);
    keyMap.toggleFullscreen[0] = "Toggle FullScreen " + (bFullScreen?"(On)":"(Off)");
    this.BuildMenu();
  }
};
