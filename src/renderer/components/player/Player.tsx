import * as React from 'react';
import { remote } from 'electron';
const { getCurrentWindow, Menu, MenuItem, app } = remote;
import Sound from 'react-sound';
import fs from "fs";

import Scene from '../../Scene';
import HeadlessScenePlayer from './HeadlessScenePlayer';
import TimingGroup from "../sceneDetail/TimingGroup";
import EffectGroup from "../sceneDetail/EffectGroup";
import Tag from "../library/Tag";
import ChildCallbackHack from './ChildCallbackHack';
import {urlToPath} from '../../utils';
import SimpleCheckbox from "../ui/SimpleCheckbox";

const keyMap = {
  playPause: ['Play/Pause', 'space'],
  historyBack: ['Back in time', 'left'],
  historyForward: ['Forward in time', 'right'],
  navigateBack: ['Go back to scene details', 'backspace'],
  toggleFullscreen: ['Toggle fullscreen', 'CommandOrControl+F'],
  alwaysOnTop: ['Toggle On Top', 'CommandOrControl+T'],
  toggleMenuBarDisplay: ['Show/Hide Menu', 'CommandOrControl+^'],
};

let originalMenu = Menu.getApplicationMenu();

export default class Player extends React.Component {
  readonly props: {
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
    isPlaying: false,
    historyOffset: 0,
    historyPaths: Array<string>(),
    imagePlayerAdvanceHack: new ChildCallbackHack(),
  };

  render() {
    const canGoBack = this.state.historyOffset > -(this.state.historyPaths.length - 1);
    const canGoForward = this.state.historyOffset < 0;
    const audioPlayStatus = this.state.isPlaying
      ? (Sound as any).status.PLAYING
      : (Sound as any).status.PAUSED;
    const tagNames = this.props.tags ? this.props.tags.map((t) => t.name) : [];

    return (
      <div className="Player">
        <HeadlessScenePlayer
          opacity={1}
          scene={this.props.scene}
          historyOffset={this.state.historyOffset}
          isPlaying={this.state.isPlaying}
          showLoadingState={!this.state.isMainLoaded}
          showEmptyState={true}
          showText={true}
          advanceHack={this.state.imagePlayerAdvanceHack}
          didFinishLoading={this.playMain.bind(this)}
          setHistoryPaths={this.setHistoryPaths.bind(this)} />

        {this.props.overlayScene && (
          <HeadlessScenePlayer
            advanceHack={null}
            opacity={this.props.scene.overlaySceneOpacity}
            scene={this.props.overlayScene}
            historyOffset={0}
            isPlaying={this.state.isPlaying}
            showLoadingState={this.state.isMainLoaded && !this.state.isOverlayLoaded}
            showEmptyState={false}
            showText={false}
            didFinishLoading={this.playOverlay.bind(this)}
            setHistoryPaths={this.nop.bind(this)} />
        )}

        <div className={`u-button-row ${this.state.isPlaying ? 'u-show-on-hover-only' : ''}`}>
          <div className="u-button-row-right">
            {this.props.scene.audioURL && (
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
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        </div>

        {this.state.isPlaying && (
          <div className="SceneOptions u-button-sidebar">
            <h2 className="SceneOptionsHeader">Scene Options</h2>
            <TimingGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>

            <EffectGroup
              scene={this.props.scene}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>

            {/*TODO Add text and audio options here*/}
          </div>
        )}

        {this.state.isPlaying && this.props.allTags && (
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
    window.addEventListener('contextmenu', this.showContextMenu, false);

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
    const url = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.state.historyOffset];
    const isFile = url.startsWith('file://');
    const path = urlToPath(url);
    const labelItem = new MenuItem({
      label: isFile ? path : url,
      click: () => { }
    });
    labelItem.enabled = false;
    contextMenu.append(labelItem);
    contextMenu.append(new MenuItem({
      label: 'Copy',
      click: () => {
        navigator.clipboard.writeText(path);
      }
    }));
    contextMenu.append(new MenuItem({
      label: 'Open',
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
          // If you find that this doesn't work on Windows, please add an if/then
          // (see 'reveal' above) rather than changing all cases, since this all
          // works fine on macOS.
          if (!confirm("Are you sure you want to delete " + path + "?")) return;
          if (fs.existsSync(path)) {
            fs.unlink(path, (err) => {
              if (err) {
                alert("An error ocurred while deleting the file: " + err.message);
                console.error(err);
              }
            });
          } else {
            alert("This file doesn't exist, cannot delete");
          }
        }
      }));
    }
    contextMenu.popup({});
  };

  playPause() {
    if (this.state.isPlaying) { this.pause() } else { this.play() }
  }

  play() {
    this.setState({ isPlaying: true, historyOffset: 0 });
  }

  playMain() {
    this.setState({ isMainLoaded: true });
    if (!this.props.overlayScene || this.state.isOverlayLoaded) {
      this.play();
    }
  }

  playOverlay() {
    this.setState({ isOverlayLoaded: true });
    if (this.state.isMainLoaded) {
      this.play();
    }
  }

  pause() {
    this.setState({ isPlaying: false });
  }

  historyBack() {
    this.setState({
      isPlaying: false,
      historyOffset: this.state.historyOffset - 1,
    });
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

  navigateBack() {
    this.props.goBack();
  }

  setHistoryPaths(paths: string[]) {
    this.setState({ historyPaths: paths });
  }
  /**
   * Toggles if Player Window stays on top
   */
  alwaysOnTop() {
    const window = getCurrentWindow();
    window.setAlwaysOnTop(!window.isAlwaysOnTop());
  }

  /**
   * Shows/Hides the MenuBar
   */
  toggleMenuBarDisplay() {
    const window = getCurrentWindow();
    window.setMenuBarVisibility(!window.isMenuBarVisible());
  }

  /** 
  * Toggles fullscreen mode and MenuBar visibility
  */
  toggleFullscreen() {
    const window = getCurrentWindow();
    window.setFullScreen(!window.isFullScreen());
    window.setMenuBarVisibility(!window.isFullScreen());
  }
};
