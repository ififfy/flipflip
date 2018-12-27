import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { remote } from 'electron';
const { Menu, app } = remote;

import Scene from '../../Scene';
import HeadlessScenePlayer from './HeadlessScenePlayer';

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
    overlayScene?: Scene,
  }

  readonly state = {
    isLoaded: false,
    isPlaying: false,
    historyOffset: -1,
    allPaths: Array<Array<string>>(),
    historyLength: 0,
  }

  render() {
    const canGoBack = this.state.historyOffset > -this.state.historyLength;
    const canGoForward = this.state.historyOffset < -1;
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
          didFinishLoading={this.play.bind(this)}
          setHistoryLength={this.setHistoryLength.bind(this)} />

        {this.props.overlayScene && (
          <HeadlessScenePlayer
            opacity={this.props.scene.overlaySceneOpacity}
            scene={this.props.overlayScene}
            historyOffset={-1}
            isPlaying={this.state.isPlaying}
            showLoadingState={false}
            showEmptyState={false}
            showText={false}
            didFinishLoading={this.nop.bind(this)}  
            setHistoryLength={this.nop.bind(this)} />
        )}

        <div className={`u-button-row ${this.state.isPlaying ? 'u-show-on-hover-only' : ''}`}>
          <div className="u-button-row-right">
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
  }

  nop() {

  }

  playPause() {
    if (this.state.isPlaying) { this.pause() } else { this.play() }
  }

  play() {
    this.setState({isPlaying: true, historyOffset: -1});
  }

  pause() {
    this.setState({isPlaying: false});
  }

  historyBack() {
    this.setState({isPlaying: false, historyOffset: this.state.historyOffset - 1});
  }

  historyForward() {
    this.setState({isPlaying: false, historyOffset: Math.min(-1, this.state.historyOffset + 1)});
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
  }
};