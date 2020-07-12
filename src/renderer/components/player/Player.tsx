import {remote, webFrame} from 'electron';
const {getCurrentWindow} = remote;
import * as React from 'react';

import {
  Button, CircularProgress, Container, Theme, Typography
} from "@material-ui/core";

import {SL} from "../../data/const";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from '../../data/Scene';
import Tag from "../../data/Tag";
import CaptionProgram from "./CaptionProgram";
import ChildCallbackHack from './ChildCallbackHack';
import SourceScraper from './SourceScraper';
import Strobe from "./Strobe";
import PlayerBars from "./PlayerBars";

export default class Player extends React.Component {
  readonly props: {
    config: Config,
    scene: Scene,
    scenes: Array<Scene>,
    theme: Theme,
    tutorial: string,
    cache(i: HTMLImageElement | HTMLVideoElement): void,
    getTags(source: string): Array<Tag>,
    goBack(): void,
    setCount(sourceURL: string, count: number, countComplete: boolean): void,
    systemMessage(message: string): void,
    preventSleep?: boolean,
    allTags?: Array<Tag>,
    gridView?: boolean,
    tags?: Array<Tag>,
    blacklistFile?(sourceURL: string, fileToBlacklist: string): void,
    goToTagSource?(source: LibrarySource): void,
    navigateTagging?(offset: number): void,
    nextScene?(): void,
    onUpdateScene?(scene: Scene, fn: (scene: Scene) => void): void,
    toggleTag?(sourceID: number, tag: Tag): void,
  };

  readonly state = {
    canStart: false,
    hasStarted: false,
    isMainLoaded: false,
    areOverlaysLoaded: Array<boolean>(this.props.scene.overlays.length).fill(false),
    isEmpty: false,
    isPlaying: true,
    total: 0,
    progress: 0,
    progressMessage: this.props.scene.sources.length > 0 ? [this.props.scene.sources[0].url] : [""],
    startTime: null as Date,
    historyOffset: 0,
    historyPaths: Array<any>(),
    imagePlayerAdvanceHack: new ChildCallbackHack(),
    imagePlayerDeleteHack: new ChildCallbackHack(),
    mainVideo: null as HTMLVideoElement,
    overlayVideos: Array<HTMLVideoElement>(this.props.scene.overlays.length).fill(null),
    timeToNextFrame: null as number,
  };

  _interval: NodeJS.Timer = null;
  _toggleStrobe = false;
  _powerSaveID: number = null;

  render() {
    const nextScene = this.getScene(this.props.scene.nextSceneID);
    const showCaptionProgram = (
      this.props.scene.textEnabled &&
      this.props.scene.textSource &&
      this.props.scene.textSource.length &&
      this.state.isPlaying &&
      this.state.hasStarted);
    const showStrobe = this.props.scene.strobe && this.state.hasStarted && this.state.isPlaying &&
      (this.props.scene.strobeLayer == SL.top || this.props.scene.strobeLayer == SL.bottom);

    let rootStyle: any;
    if (this.props.gridView) {
      rootStyle = {
        display: 'flex',
        position: 'relative',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '104%',
        height: '104%',
        marginLeft: '-2%',
        marginTop: '-2%',
        overflow: 'hidden',
      }
    } else {
      rootStyle = {
        display: 'flex',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };
    }
    if (this.props.tutorial != null) {
      rootStyle = {
        ...rootStyle,
        pointerEvents: 'none',
      }
    }

    let playerStyle: any = {};
    if (!this.props.gridView) {
      playerStyle = {
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      };
    }
    if (!this.state.hasStarted) {
      playerStyle = {
        ...playerStyle,
        display: 'none',
      }
    }

    return (
      <div style={rootStyle}>
        {showStrobe && (
          <Strobe
            zIndex={5}
            toggleStrobe={this._toggleStrobe}
            timeToNextFrame={this.state.timeToNextFrame}
            scene={this.props.scene}
          />
        )}
        {!this.state.hasStarted && !this.state.isEmpty && (
          <main style={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            backgroundColor: this.props.theme.palette.background.default,
            zIndex: 10,
          }}>
            <Container
              maxWidth={false}
              style={{
                flexGrow: 1,
                padding: this.props.theme.spacing(0),
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}>
              <CircularProgress
                size={300}
                value={Math.round((this.state.progress / this.state.total) * 100)}
                variant="static"/>
                <div
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    position: 'absolute',
                    flexDirection: 'column',
                  }}>
                  <Typography component="h1" variant="h6" color="inherit" noWrap>
                    {this.state.progress} / {this.state.total}
                  </Typography>
                  {this.state.progressMessage.map((message) =>
                    <Typography component="h1" variant="h5" color="inherit" noWrap>
                      {message}
                    </Typography>
                  )}
                  {this.state.canStart && (
                    <Button
                      style={{
                        marginTop: this.props.theme.spacing(1),
                      }}
                      variant="contained"
                      color="secondary"
                      onClick={this.start.bind(this, this.state.canStart, true)}>
                      Start Now
                    </Button>
                  )}
                </div>
            </Container>
          </main>
        )}
        {this.state.isEmpty && (
          <main
            style={{
              display: 'flex',
              flexGrow: 1,
              flexDirection: 'column',
              backgroundColor: this.props.theme.palette.background.default,
              zIndex: 10,
            }} >
            <div style={{...this.props.theme.mixins.toolbar as any}}/>
            <Container
              maxWidth={false}
              style={{
                flexGrow: 1,
                padding: this.props.theme.spacing(0),
                position: 'relative',
              }}>
              <Typography component="h1" variant="h3" color="inherit" noWrap
                          style={{
                            textAlign: 'center',
                            marginTop: '25%',
                          }}>
                (ಥ﹏ಥ)
              </Typography>
              <Typography component="h1" variant="h4" color="inherit" noWrap
                          style={{textAlign: 'center'}}>
                I couldn't find anything
              </Typography>
            </Container>
          </main>
        )}

        {!this.props.gridView && (
          <PlayerBars
            config={this.props.config}
            hasStarted={this.state.hasStarted}
            historyPaths={this.state.historyPaths}
            historyOffset={this.state.historyOffset}
            imagePlayerAdvanceHack={this.state.imagePlayerAdvanceHack}
            imagePlayerDeleteHack={this.state.imagePlayerDeleteHack}
            isEmpty={this.state.isEmpty}
            isPlaying={this.state.isPlaying}
            mainVideo={this.state.mainVideo}
            overlayVideos={this.state.overlayVideos}
            scene={this.props.scene}
            scenes={this.props.scenes}
            title={this.props.tags ? this.props.scene.sources[0].url : this.props.scene.name}
            tutorial={this.props.tutorial}
            goBack={this.props.goBack.bind(this)}
            historyBack={this.historyBack.bind(this)}
            historyForward={this.historyForward.bind(this)}
            navigateTagging={this.navigateTagging.bind(this)}
            onUpdateScene={this.props.onUpdateScene.bind(this)}
            playNextScene={this.props.nextScene}
            play={this.play.bind(this)}
            pause={this.pause.bind(this)}
            allTags={this.props.allTags}
            tags={this.props.tags}
            blacklistFile={this.props.blacklistFile}
            goToTagSource={this.props.goToTagSource}
            toggleTag={this.props.toggleTag}
          />
        )}

        <div style={playerStyle}>
          <SourceScraper
            config={this.props.config}
            scene={this.props.scene}
            nextScene={nextScene}
            opacity={1}
            gridView={this.props.gridView}
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
            setCount={this.props.setCount.bind(this)}
            cache={this.props.cache.bind(this)}
            setTimeToNextFrame={this.setTimeToNextFrame.bind(this)}
            systemMessage={this.props.systemMessage.bind(this)}
            playNextScene={this.props.nextScene}
          />

          {this.props.scene.overlayEnabled && this.props.scene.overlays.length > 0 &&
           !this.state.isEmpty && this.props.scene.overlays.map((overlay, index) => {
              let showProgress = this.state.isMainLoaded && !this.state.hasStarted;
              if (showProgress) {
                for (let x = 0; x < index; x++) {
                  if (!this.state.areOverlaysLoaded[x]) {
                    showProgress = false;
                    break;
                  }
                }
              }
              const overlayScene = this.getScene(overlay.sceneID);
              if (overlayScene) {
                return (
                  <SourceScraper
                    key={overlay.id}
                    config={this.props.config}
                    scene={this.getScene(overlay.sceneID)}
                    opacity={overlay.opacity / 100}
                    gridView={this.props.gridView}
                    isPlaying={this.state.isPlaying && !this.state.isEmpty}
                    hasStarted={this.state.hasStarted}
                    historyOffset={0}
                    setHistoryOffset={this.nop}
                    setHistoryPaths={this.nop}
                    finishedLoading={this.setOverlayLoaded.bind(this, index)}
                    firstImageLoaded={this.nop}
                    setProgress={showProgress ? this.setProgress.bind(this) : this.nop}
                    setVideo={this.setOverlayVideo.bind(this, index)}
                    setCount={this.props.setCount.bind(this)}
                    cache={this.props.cache.bind(this)}
                    systemMessage={this.props.systemMessage.bind(this)}
                  />
                );
              } else {
                if (!this.state.areOverlaysLoaded[index]) {
                  this.setOverlayLoaded(index, true);
                }
                return <div key={overlay.id}/>;
              }
            }
          )}
        </div>

        {showCaptionProgram && (
          <CaptionProgram
            blinkColor={this.props.scene.blinkColor}
            blinkFontSize={this.props.scene.blinkFontSize}
            blinkFontFamily={this.props.scene.blinkFontFamily}
            blinkBorder={this.props.scene.blinkBorder}
            blinkBorderpx={this.props.scene.blinkBorderpx}
            blinkBorderColor={this.props.scene.blinkBorderColor}
            captionColor={this.props.scene.captionColor}
            captionFontSize={this.props.scene.captionFontSize}
            captionFontFamily={this.props.scene.captionFontFamily}
            captionBorder={this.props.scene.captionBorder}
            captionBorderpx={this.props.scene.captionBorderpx}
            captionBorderColor={this.props.scene.captionBorderColor}
            captionBigColor={this.props.scene.captionBigColor}
            captionBigFontSize={this.props.scene.captionBigFontSize}
            captionBigFontFamily={this.props.scene.captionBigFontFamily}
            captionBigBorder={this.props.scene.captionBigBorder}
            captionBigBorderpx={this.props.scene.captionBigBorderpx}
            captionBigBorderColor={this.props.scene.captionBigBorderColor}
            countColor={this.props.scene.countColor}
            countFontSize={this.props.scene.countFontSize}
            countFontFamily={this.props.scene.countFontFamily}
            countBorder={this.props.scene.countBorder}
            countBorderpx={this.props.scene.countBorderpx}
            countBorderColor={this.props.scene.countBorderColor}
            url={this.props.scene.textSource}
            textEndStop={this.props.scene.textEndStop}
            textNextScene={this.props.scene.textNextScene}
            getTags={this.props.getTags.bind(this)}
            goBack={this.props.goBack.bind(this)}
            playNextScene={this.props.nextScene}
            currentSource={this.state.historyPaths.length > 0 ? this.state.historyPaths[0].getAttribute("source") : null}
            currentClip={this.state.historyPaths.length > 0 ? this.state.historyPaths[0].getAttribute("clip") : null}/>
        )}
      </div>
    );
  }

  nextSceneLoop() {
    if (this.props.scene.nextSceneID === 0) {
      clearInterval(this._interval);
    }
    if (this.state.isPlaying && this.state.startTime != null && !this.props.scene.nextSceneAllImages &&
      Math.round(Math.abs(new Date().getTime() - this.state.startTime.getTime()) / 1000) >= this.props.scene.nextSceneTime) {
      this.setState({startTime: null});
      this.props.nextScene();
    } else if (!this.state.isPlaying && this.state.startTime) {
      const startTime = this.state.startTime;
      startTime.setTime(startTime.getTime() + 1000);
      this.setState({startTime: startTime});
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
    if (!this.props.gridView) {
      this._interval = setInterval(() => this.nextSceneLoop(), 1000);
    }
    if (this.props.preventSleep) {
      this._powerSaveID = remote.powerSaveBlocker.start('prevent-display-sleep');
    }
    window.addEventListener('wheel', this.onScroll, false);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    this._interval = null;
    window.removeEventListener('wheel', this.onScroll);
    getCurrentWindow().setAlwaysOnTop(false);
    getCurrentWindow().setFullScreen(false);
    // Clear ALL the available browser caches
    global.gc();
    webFrame.clearCache();
    remote.getCurrentWindow().webContents.session.clearCache().then(() => {});
    if (this.props.preventSleep || this._powerSaveID != null) {
      remote.powerSaveBlocker.stop(this._powerSaveID);
      this._powerSaveID = null;
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return this.props.scene !== props.scene ||
      this.props.tags !== props.tags ||
      this.state.canStart !== state.canStart ||
      this.state.hasStarted !== state.hasStarted ||
      this.state.isMainLoaded !== state.isMainLoaded ||
      this.state.areOverlaysLoaded !== state.areOverlaysLoaded ||
      this.state.isEmpty !== state.isEmpty ||
      this.state.isPlaying !== state.isPlaying ||
      this.state.total !== state.total ||
      this.state.progress !== state.progress ||
      this.state.progressMessage !== state.progressMessage ||
      this.state.historyOffset !== state.historyOffset ||
      this.state.historyPaths !== state.historyPaths ||
      this.state.mainVideo !== state.mainVideo ||
      this.state.overlayVideos !== state.overlayVideos;
  }

  nop() {}

  onScroll = (e: WheelEvent) => {
    const volumeChange = (e.deltaY / 100) * -5;
    let newVolume = parseInt(this.props.scene.videoVolume as any) + volumeChange;
    if (newVolume < 0) {
      newVolume = 0;
    } else if (newVolume > 100) {
      newVolume = 100;
    }
    this.props.onUpdateScene(this.props.scene, (s) => s.videoVolume = newVolume);
  }

  setProgress(total: number, current: number, message: string[]) {
    this.setState({total: total, progress: current, progressMessage: message});
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
    const isLoaded = !force && (this.state.isMainLoaded && (!this.props.scene.overlayEnabled || this.props.scene.overlays.length == 0 || this.state.areOverlaysLoaded.find((b) => !b) == null));
    if (force || (canStart && (isLoaded || this.props.config.displaySettings.startImmediately))) {
      this.setState({hasStarted: true, isLoaded: true, startTime: this.state.startTime ?  this.state.startTime : new Date()});
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

  setHistoryPaths(paths: Array<any>) {
    this.setState({historyPaths: paths});
  }

  setHistoryOffset(offset: number) {
    this.setState({historyOffset: offset});
  }

  getScene(id: number): Scene {
    return this.props.scenes.find((s) => s.id == id);
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
      progressMessage: this.props.scene.sources.length > 0 ? [this.props.scene.sources[0].url] : [""],
    });
    this.props.navigateTagging(offset);
  }
}
