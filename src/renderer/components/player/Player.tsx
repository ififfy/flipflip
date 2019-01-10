import * as React from 'react';
import { remote } from 'electron';
const { Menu, app } = remote;
import Sound from 'react-sound';

import Scene from '../../Scene';
import HeadlessScenePlayer from './HeadlessScenePlayer';
import TimingGroup from "../sceneDetail/TimingGroup";
import EffectGroup from "../sceneDetail/EffectGroup";

const keyMap = {
  playPause: ['Play/Pause', 'space'],
  historyBack: ['Back in time', 'left'],
  historyForward: ['Forward in time', 'right'],
  navigateBack: ['Go back to scene details', 'backspace'],
  toggleFullscreen: ['Toggle fullscreen', 'CommandOrControl+F'],
};

let originalMenu = Menu.getApplicationMenu();

export default class Player extends React.Component {
  readonly props: {
    goBack(): void,
    scene: Scene,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    overlayScene?: Scene,
  };

  readonly state = {
    isMainLoaded: false,
    isOverlayLoaded: false,
    isPlaying: false,
    historyOffset: 0,
    historyLength: 0,
  };

  render() {
    const canGoBack = this.state.historyOffset > -(this.state.historyLength-1);
    const canGoForward = this.state.historyOffset < 0;
    const audioPlayStatus = this.state.isPlaying
      ? (Sound as any).status.PLAYING
      : (Sound as any).status.PAUSED;
    const showOverlayIndicator = this.state.isMainLoaded && !this.state.isOverlayLoaded;

    return (
      <div className="Player">
        <HeadlessScenePlayer
          opacity={1}
          scene={this.props.scene}
          historyOffset={this.state.historyOffset}
          isPlaying={this.state.isPlaying}
          showLoadingState={true}
          showEmptyState={true}
          showText={true}
          didFinishLoading={this.playMain.bind(this)}
          setHistoryLength={this.setHistoryLength.bind(this)} />

        {this.props.overlayScene && (
          <HeadlessScenePlayer
            opacity={this.props.scene.overlaySceneOpacity}
            scene={this.props.overlayScene}
            historyOffset={0}
            isPlaying={this.state.isPlaying}
            showLoadingState={showOverlayIndicator}
            showEmptyState={false}
            showText={false}
            didFinishLoading={this.playOverlay.bind(this)}
            setHistoryLength={this.nop.bind(this)} />
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

        <div className={`u-button-sidebar ${this.state.isPlaying ? 'u-show-on-hover-only' : 'u-hidden'}`}>
          <h2 className="SceneOptions">Scene Options</h2>
          <TimingGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>

          <EffectGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>
        </div>
      </div>
    );
  }

  componentDidMount() {
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
    remote.getCurrentWindow().setFullScreen(false);
  }

  nop() {

  }

  playPause() {
    if (this.state.isPlaying) { this.pause() } else { this.play() }
  }

  play() {
    this.setState({isPlaying: true, historyOffset: 0});
  }

  playMain() {
    this.setState({isMainLoaded: true});
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
    this.setState({
      isPlaying: false,
      historyOffset: this.state.historyOffset - 1,
    });
  }

  historyForward() {
    this.setState({
      isPlaying: false,
      historyOffset: this.state.historyOffset + 1,
    });
  }

  navigateBack() {
    this.props.goBack();
  }

  setHistoryLength(n: number) {
    this.setState({historyLength: n});
  }

  toggleFullscreen() {
    const window = remote.getCurrentWindow();
    window.setFullScreen(!window.isFullScreen());
    if (Menu.getApplicationMenu() == null) {
      // Reattach menu
      this.componentDidMount();
    } else {
      // Remove menu
      Menu.setApplicationMenu(null);
    }
  }
};