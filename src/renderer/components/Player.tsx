import * as React from 'react';
import * as ReactDOM from 'react-dom';
import recursiveReaddir from 'recursive-readdir';
import fs from 'fs'
import animated from 'animated-gif-detector';
import { remote } from 'electron';

import Scene from '../Scene';
import ImagePlayer from './ImagePlayer';
import CaptionProgram from './CaptionProgram';

function filterPathsToJustImages(imageTypeFilter: string, paths: Array<string>): Array<string> {
  if (imageTypeFilter === 'if.any') return paths;

  if (imageTypeFilter === 'if.gifs') {
    return paths.filter((f) => f.toLowerCase().endsWith('.gif') && animated(fs.readFileSync(f)));
  }

  if (imageTypeFilter === 'if.stills') {
    return paths.filter((f) => {
      if (f.toLowerCase().endsWith('.gif') && !animated(fs.readFileSync(f))) return true;
      if (f.toLowerCase().endsWith('.png')) return true;
      if (f.toLowerCase().endsWith('.jpeg')) return true;
      if (f.toLowerCase().endsWith('.jpg')) return true;
      if (f.toLowerCase().endsWith('.webp')) return true;
      if (f.toLowerCase().endsWith('.tiff')) return true;
      return false;
    });
  }

  console.warn('unknown image type filter', imageTypeFilter);
  return paths;
}

const keyMap2 = {
  playPause: 'space',
  historyBack: 'left',
  historyForward: 'right',
  navigateBack: 'backspace',
  toggleFullscreen: 'CommandOrControl+F',
};

export default class Player extends React.Component {
  readonly props: {
    goBack(): void,
    scene: Scene,
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
        {this.state.isLoaded && (
          <ImagePlayer
            historyOffset={this.state.historyOffset}
            setHistoryLength={this.setHistoryLength.bind(this)}
            maxInMemory={120}
            maxLoadingAtOnce={5}
            maxToRememberInHistory={500}
            timingFunction={this.props.scene.timingFunction}
            timingConstant={this.props.scene.timingConstant}
            zoomType={this.props.scene.zoomType}
            zoomLevel={this.props.scene.zoomLevel}
            isPlaying={this.state.isPlaying}
            fadeEnabled={this.props.scene.crossFade}
            allPaths={this.state.allPaths} />)}
        {this.state.isLoaded && this.props.scene.hastebinID && this.state.isPlaying && (
          <CaptionProgram hastebinID={this.props.scene.hastebinID} />
        )}

        {!this.state.isLoaded && (
          <div className="LoadingIndicator"><div className="loader" /></div>
        )}
        {this.state.isLoaded && this.state.allPaths.length == 0 && (
          <div className="EmptyIndicator">No images found</div>
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
    Object.entries(keyMap2).forEach(([k, v]) => {
      remote.globalShortcut.register(v, (this as any)[k].bind(this));
    })

    const loadAll = () => {
      let n = this.props.scene.directories.length;
      this.setState({allPaths: []});
      this.props.scene.directories.forEach((d) => {
        const blacklist = ['*.css', '*.html', 'avatar.png'];
        recursiveReaddir(d, blacklist, (err: any, rawFiles: Array<string>) => {
          if (err) console.warn(err);

          const files = filterPathsToJustImages(this.props.scene.imageTypeFilter, rawFiles);

          let newAllPaths = this.state.allPaths;

          n -= 1;
          if (n == 0) {
            this.setState({isLoaded: true, isPlaying: true});
          }

          if (!files || files.length === 0) {
            return;
          }

          // The scene can configure which of these branches to take
          if (this.props.scene.weightDirectoriesEqually) {
            // Just add the new paths to the end of the list
            newAllPaths = this.state.allPaths.concat([files]);
            this.setState({allPaths: newAllPaths});
          } else {
            // If we found some files, put them in their own list.
            // If list is empty, ignore.
            if (newAllPaths.length == 0) {
              newAllPaths = [files];
            } else {
              newAllPaths[0] = newAllPaths[0].concat(files);
            }
          }
        });
      });
    };
    loadAll();
  }

  componentWillUnmount() {
    Object.values(keyMap2).forEach((k) => {
      remote.globalShortcut.unregister(k);
    })
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