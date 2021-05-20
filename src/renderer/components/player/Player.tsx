import {remote, webFrame} from 'electron';
const {getCurrentWindow} = remote;
import * as React from 'react';

import {
  Button, CircularProgress, Container, Theme, Typography
} from "@material-ui/core";

import {SL, WC} from "../../data/const";
import {getRandomListItem, urlToPath} from "../../data/utils";
import {getFileGroup, getFileName} from "./Scrapers";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from '../../data/Scene';
import Tag from "../../data/Tag";
import ChildCallbackHack from './ChildCallbackHack';
import SourceScraper from './SourceScraper';
import Strobe from "./Strobe";
import PlayerBars from "./PlayerBars";
import PictureGrid from "./PictureGrid";
import Audio from "../../data/Audio";
import ImageView from "./ImageView";
import AudioAlert from "./AudioAlert";
import CaptionProgramPlaylist from "./CaptionProgramPlaylist";
import CaptionScript from "../../data/CaptionScript";
import SceneGrid from "../../data/SceneGrid";
import GridPlayer from "./GridPlayer";
import IdleTimer from "react-idle-timer";

export default class Player extends React.Component {
  readonly props: {
    config: Config,
    scene: Scene,
    scenes: Array<Scene>,
    sceneGrids: Array<SceneGrid>,
    theme: Theme,
    tutorial: string,
    cache(i: HTMLImageElement | HTMLVideoElement): void,
    getTags(source: string): Array<Tag>,
    goBack(): void,
    setCount(sourceURL: string, count: number, countComplete: boolean): void,
    systemMessage(message: string): void,
    preventSleep?: boolean,
    allLoaded?: boolean,
    advanceHack?: ChildCallbackHack,
    allTags?: Array<Tag>,
    captionScale?: number,
    captionProgramJumpToHack?: ChildCallbackHack,
    gridView?: boolean,
    hasStarted?: boolean,
    tags?: Array<Tag>,
    blacklistFile?(sourceURL: string, fileToBlacklist: string): void,
    goToTagSource?(source: LibrarySource): void,
    goToClipSource?(source: LibrarySource): void,
    navigateTagging?(offset: number): void,
    nextScene?(): void,
    onUpdateScene?(scene: Scene, fn: (scene: Scene) => void): void,
    playTrack?(url: string): void,
    changeAudioRoute?(aID: number): void,
    toggleTag?(sourceID: number, tag: Tag): void,
    getCurrentTimestamp?(): number,
    onCaptionError?(e: string): void,
    onLoaded?(): void,
    setProgress?(total: number, current: number, message: string[]): void,
    setVideo?(video: HTMLVideoElement): void,
  };

  readonly state = {
    canStart: this.props.scene.audioScene,
    hasStarted: this.props.hasStarted != null ? this.props.hasStarted : this.props.scene.audioScene,
    isMainLoaded: this.props.scene.audioScene,
    areOverlaysLoaded: Array<boolean>(this.props.scene.overlays.length).fill(false),
    isEmpty: false,
    isPlaying: true,
    total: 0,
    progress: 0,
    progressMessage: this.props.scene.sources.length > 0 ? [this.props.scene.sources[0].url] : [""],
    startTime: null as Date,
    historyOffset: 0,
    historyPaths: Array<any>(),
    imagePlayerAdvanceHacks: new Array<Array<ChildCallbackHack>>(this.props.scene.overlays.length + 1).fill(null).map((c) => [new ChildCallbackHack()]),
    imagePlayerDeleteHack: new ChildCallbackHack(),
    mainVideo: null as HTMLVideoElement,
    overlayVideos: Array<Array<HTMLVideoElement>>(this.props.scene.overlays.length).fill(null).map((n) => [null]),
    currentAudio: null as Audio,
    timeToNextFrame: null as number,
    recentPictureGrid: false,
    thumbImage: null as HTMLImageElement,
    persistAudio: false,
    persistText: false,
    hideCursor: false,
  };

  readonly idleTimerRef: React.RefObject<HTMLDivElement> = React.createRef();
  _interval: NodeJS.Timer = null;
  _toggleStrobe = false;
  _powerSaveID: number = null;

  render() {
    const nextScene = this.getScene(this.props.scene.nextSceneID == -1 ? this.props.scene.nextSceneRandomID : this.props.scene.nextSceneID);
    const showCaptionProgram = (this.state.hasStarted &&
      ((this.props.scene.textEnabled &&
      this.props.scene.scriptPlaylists.length) || this.state.persistText));
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
    } else if (this.props.hasStarted ? this.props.hasStarted : this.state.hasStarted) {
      playerStyle = {
        position: 'relative',
        width: '100%',
        height: '100%',
      }
    }
    if (!this.state.hasStarted) {
      playerStyle = {
        ...playerStyle,
        opacity: 0,
      }
    }

    if (this.state.hideCursor) {
      playerStyle = {
        ...playerStyle,
        cursor: 'none',
      }
    }

    let watermarkStyle: any = {}
    let watermarkText = "";
    if (this.props.config.generalSettings.watermark) {
      watermarkStyle = {
        position: 'absolute',
        zIndex: 11,
        whiteSpace: 'pre',
        fontFamily: this.props.config.generalSettings.watermarkFontFamily,
        fontSize: this.props.config.generalSettings.watermarkFontSize,
        color: this.props.config.generalSettings.watermarkColor
      };
      switch (this.props.config.generalSettings.watermarkCorner) {
        case WC.bottomRight:
          watermarkStyle.bottom = 5;
          watermarkStyle.right = 5;
          watermarkStyle.textAlign = 'right';
          break;
        case WC.bottomLeft:
          watermarkStyle.bottom = 5;
          watermarkStyle.left = 5;
          watermarkStyle.textAlign = 'left';
          break;
        case WC.topRight:
          watermarkStyle.top = 5;
          watermarkStyle.right = 5;
          watermarkStyle.textAlign = 'right';
          break;
        case WC.topLeft:
          watermarkStyle.top = 5;
          watermarkStyle.left = 5;
          watermarkStyle.textAlign = 'left';
          break;
      }

      watermarkText = this.props.config.generalSettings.watermarkText;
      watermarkText = watermarkText.replace("{scene_name}", this.props.scene.name);
      const img = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.state.historyOffset];
      if (img) {
        watermarkText = watermarkText.replace("{source_url}", img.getAttribute("source"));
        watermarkText = watermarkText.replace("{source_name}", getFileGroup(img.getAttribute("source")));
        watermarkText = watermarkText.replace("{file_url}", urlToPath(img.src));
        watermarkText = watermarkText.replace("{file_name}", decodeURIComponent(getFileName(img.src)));
      } else {
        watermarkText = watermarkText.replace(/\s*\{source_url\}\s*/g, "");
        watermarkText = watermarkText.replace(/\s*\{source_name\}\s*/g, "");
        watermarkText = watermarkText.replace(/\s*\{file_url\}\s*/g, "");
        watermarkText = watermarkText.replace(/\s*\{file_name\}\s*/g, "");
      }
      if (this.state.currentAudio) {
        watermarkText = watermarkText.replace("{audio_url}", this.state.currentAudio.url);
        watermarkText = watermarkText.replace("{audio_name}", getFileName(this.state.currentAudio.url));
        if (this.state.currentAudio.name) {
          watermarkText = watermarkText.replace("{audio_title}", this.state.currentAudio.name);
        } else {
          watermarkText = watermarkText.replace(/\s*\{audio_title\}\s*/g, "");
        }
        if (this.state.currentAudio.artist) {
          watermarkText = watermarkText.replace("{audio_artist}", this.state.currentAudio.artist);
        } else {
          watermarkText = watermarkText.replace(/\s*\{audio_artist\}\s*/g, "");
        }
        if (this.state.currentAudio.album) {
          watermarkText = watermarkText.replace("{audio_album}", this.state.currentAudio.album);
        } else {
          watermarkText = watermarkText.replace(/\s*\{audio_album\}\s*/g, "");
        }
      } else {
        watermarkText = watermarkText.replace(/\s*\{audio_url\}\s*/g, "");
        watermarkText = watermarkText.replace(/\s*\{audio_name\}\s*/g, "");
        watermarkText = watermarkText.replace(/\s*\{audio_title\}\s*/g, "");
        watermarkText = watermarkText.replace(/\s*\{audio_artist\}\s*/g, "");
        watermarkText = watermarkText.replace(/\s*\{audio_album\}\s*/g, "");
      }
    }

    const captionScale = this.props.captionScale ? this.props.captionScale : 1;

    let getCurrentTimestamp: any = undefined;
    if (this.props.getCurrentTimestamp) {
      getCurrentTimestamp = this.props.getCurrentTimestamp;
    } else if (this.props.scene && this.props.scene.audioEnabled) {
      getCurrentTimestamp = this.getTimestamp.bind(this);
    }

    return (
      <div style={rootStyle}>
        {showStrobe && (
          <Strobe
            currentAudio={this.state.currentAudio}
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
                    <Typography key={message} component="h1" variant="h5" color="inherit" noWrap>
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
            <div style={{height: 64}}/>
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
            imagePlayerAdvanceHacks={this.state.imagePlayerAdvanceHacks}
            imagePlayerDeleteHack={this.state.imagePlayerDeleteHack}
            isEmpty={this.state.isEmpty}
            isPlaying={this.state.isPlaying}
            mainVideo={this.state.mainVideo}
            overlayVideos={this.state.overlayVideos}
            scene={this.props.scene}
            scenes={this.props.scenes}
            sceneGrids={this.props.sceneGrids}
            title={this.props.tags ? (this.props.scene.audioScene ? this.state.currentAudio ? this.state.currentAudio.name : "Loading..." : this.props.scene.sources[0].url) : this.props.scene.name}
            tutorial={this.props.tutorial}
            recentPictureGrid={this.state.recentPictureGrid}
            persistAudio={this.state.persistAudio}
            persistText={this.state.persistText}
            goBack={this.goBack.bind(this)}
            historyBack={this.historyBack.bind(this)}
            historyForward={this.historyForward.bind(this)}
            navigateTagging={this.navigateTagging.bind(this)}
            onRecentPictureGrid={this.onRecentPictureGrid.bind(this)}
            onUpdateScene={this.props.onUpdateScene.bind(this)}
            playNextScene={this.props.nextScene}
            play={this.play.bind(this)}
            pause={this.pause.bind(this)}
            playTrack={this.props.playTrack}
            onPlaying={!this.props.scene.textEnabled || !this.state.currentAudio || this.props.getCurrentTimestamp ? undefined : this.onPlaying.bind(this)}
            setCurrentAudio={this.setCurrentAudio.bind(this)}
            allTags={this.props.allTags}
            tags={this.props.tags}
            blacklistFile={this.props.blacklistFile}
            goToTagSource={this.props.goToTagSource}
            goToClipSource={this.props.goToClipSource}
            toggleTag={this.props.toggleTag}
          />
        )}

        {this.state.recentPictureGrid && (
          <PictureGrid
            pictures={this.state.historyPaths} />
        )}

        <div style={playerStyle}
             ref={this.idleTimerRef}>
          {!this.props.gridView && (
            <IdleTimer
              ref={ref => {return this.idleTimerRef}}
              onActive={this.onActive.bind(this)}
              onIdle={this.onIdle.bind(this)}
              timeout={2000} />
          )}
          {this.props.config.generalSettings.watermark && (
            <div style={watermarkStyle}>
              {watermarkText}
            </div>
          )}
          {this.props.scene.audioScene && (
            <ImageView
              image={this.state.thumbImage}
              currentAudio={this.state.currentAudio}
              scene={this.props.scene}
              fitParent
              hasStarted
              removeChild
              />
          )}
          {(this.props.config.displaySettings.audioAlert || this.props.tags) &&
          (this.props.scene.audioEnabled || this.state.persistAudio) && (
            <AudioAlert
              audio={this.state.currentAudio}
            />
          )}
          {!this.props.scene.audioScene && (
            <SourceScraper
              config={this.props.config}
              scene={this.props.scene}
              nextScene={nextScene}
              currentAudio={this.state.currentAudio}
              opacity={1}
              gridView={this.props.gridView}
              isPlaying={this.state.isPlaying}
              hasStarted={this.state.hasStarted}
              strobeLayer={this.props.scene.strobe ? this.props.scene.strobeLayer : null}
              historyOffset={this.state.historyOffset}
              advanceHack={this.props.advanceHack ? this.props.advanceHack : this.state.imagePlayerAdvanceHacks[0][0]}
              deleteHack={this.state.imagePlayerDeleteHack}
              setHistoryOffset={this.setHistoryOffset.bind(this)}
              setHistoryPaths={this.setHistoryPaths.bind(this)}
              finishedLoading={this.setMainLoaded.bind(this)}
              firstImageLoaded={this.setMainCanStart.bind(this)}
              setProgress={this.setProgress.bind(this)}
              setVideo={this.props.setVideo ? this.props.setVideo : this.setMainVideo.bind(this)}
              setCount={this.props.setCount.bind(this)}
              cache={this.props.cache.bind(this)}
              setTimeToNextFrame={this.setTimeToNextFrame.bind(this)}
              systemMessage={this.props.systemMessage.bind(this)}
              playNextScene={this.props.nextScene}
            />
          )}

          {!this.props.scene.audioScene && this.props.scene.overlayEnabled && this.props.scene.overlays.length > 0 &&
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
              let overlayScene = null;
              let overlayGrid = null;
              if (overlay.sceneID.toString().startsWith('999')) {
                overlayGrid = this.getSceneGrid(overlay.sceneID.toString().replace('999', ''));
              } else {
                overlayScene = this.getScene(overlay.sceneID);
              }
              if (overlayScene) {
                let advanceHacks = this.state.imagePlayerAdvanceHacks;
                let changed = false;
                while (advanceHacks.length <= index + 1) {
                  advanceHacks.push([new ChildCallbackHack()]);
                  changed = true;
                }
                if (changed) {
                  setTimeout(() => this.setState({imagePlayerAdvanceHacks: advanceHacks}), 200);
                }
                return (
                  <SourceScraper
                    key={overlay.id}
                    config={this.props.config}
                    scene={this.getScene(overlay.sceneID)}
                    currentAudio={this.state.currentAudio}
                    opacity={overlay.opacity / 100}
                    gridView={this.props.gridView}
                    isOverlay
                    isPlaying={this.state.isPlaying && !this.state.isEmpty}
                    hasStarted={this.state.hasStarted}
                    historyOffset={0}
                    advanceHack={this.state.imagePlayerAdvanceHacks[index + 1][0]}
                    setHistoryOffset={this.nop}
                    setHistoryPaths={this.nop}
                    finishedLoading={this.setOverlayLoaded.bind(this, index)}
                    firstImageLoaded={this.nop}
                    setProgress={showProgress ? this.setProgress.bind(this) : this.nop}
                    setVideo={this.props.setVideo && !this.props.gridView ? this.props.setVideo : this.setOverlayVideo.bind(this, index)}
                    setCount={this.props.setCount.bind(this)}
                    cache={this.props.cache.bind(this)}
                    systemMessage={this.props.systemMessage.bind(this)}
                  />
                );
              } else if (overlayGrid && !this.props.gridView) {
                const gridSize = overlayGrid.grid[0].length * overlayGrid.grid.length;
                let advanceHacks = this.state.imagePlayerAdvanceHacks;
                let changed = false;
                while (advanceHacks.length <= index + 1) {
                  advanceHacks.push([new ChildCallbackHack()]);
                  changed = true;
                }
                if (advanceHacks[index + 1].length != gridSize) {
                  advanceHacks[index + 1] = new Array<ChildCallbackHack>(gridSize).fill(null).map((c) => new ChildCallbackHack());
                  setTimeout(() => this.setState({imagePlayerAdvanceHacks: advanceHacks}), 200);
                } else if (changed) {
                  setTimeout(() => this.setState({imagePlayerAdvanceHacks: advanceHacks}), 200);
                }
                return (
                  <div
                    key={overlay.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      opacity: overlay.opacity / 100
                    }}>
                    <GridPlayer
                      hideBars
                      advanceHacks={this.state.imagePlayerAdvanceHacks[index + 1]}
                      config={this.props.config}
                      grid={overlayGrid}
                      hasStarted={this.state.hasStarted}
                      scenes={this.props.scenes}
                      sceneGrids={this.props.sceneGrids}
                      theme={this.props.theme}
                      cache={this.props.cache}
                      finishedLoading={this.setOverlayLoaded.bind(this, index)}
                      getTags={this.props.getTags}
                      goBack={this.props.goBack}
                      setCount={this.props.setCount}
                      setProgress={showProgress ? this.setProgress.bind(this) : undefined}
                      setVideo={this.setGridOverlayVideo.bind(this, index)}
                      systemMessage={this.props.systemMessage}
                    />
                  </div>
                )
              } else {
                if (!this.state.areOverlaysLoaded[index]) {
                  setTimeout(() => this.setOverlayLoaded(index, true), 200);
                }
                return <div key={overlay.id}/>;
              }
            }
          )}
        </div>

        {showCaptionProgram && this.props.scene.scriptPlaylists.map((playlist, i) =>
          <CaptionProgramPlaylist
            key={i}
            playlistIndex={i}
            playlist={playlist}
            currentAudio={this.state.currentAudio}
            currentImage={this.state.historyPaths.length > 0 ? this.state.historyPaths[this.state.historyPaths.length - 1] : null}
            scale={captionScale}
            scene={this.props.scene}
            timeToNextFrame={this.state.timeToNextFrame}
            persist={this.state.persistText}
            getTags={this.props.getTags.bind(this)}
            goBack={this.props.goBack.bind(this)}
            orderScriptTags={this.orderScriptTags.bind(this)}
            playNextScene={this.props.nextScene}
            jumpToHack={this.props.captionProgramJumpToHack}
            getCurrentTimestamp={getCurrentTimestamp}
            advance={() => {
              const advance = this.props.advanceHack ? this.props.advanceHack : this.state.imagePlayerAdvanceHacks[0][0];
              advance.fire();
            }}
            onError={this.props.onCaptionError}
            systemMessage={this.props.systemMessage}/>
        )}
      </div>
    );
  }

  nextSceneLoop() {
    if (this.props.scene.nextSceneID === 0) {
      clearInterval(this._interval);
    }
    if (!this.props.scene.scriptScene && this.state.isPlaying && this.state.startTime != null && !this.props.scene.nextSceneAllImages &&
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
    if (this.state.currentAudio && state.currentAudio != this.state.currentAudio) {
      let thumbImage = new Image();
      if (this.state.currentAudio.thumb) {
        thumbImage.src = this.state.currentAudio.thumb;
      } else {
        thumbImage.src = 'src/renderer/icons/flipflip_logo.png';
      }
      thumbImage.onload = () => {
        this.setState({thumbImage: thumbImage});
      };
    }
    if (props.scene.id !== this.props.scene.id) {
      if (this.props.tags) {
        this.setState({startTime: new Date()});
      } else {
        this.setState({hasStarted: true, startTime: new Date()});
      }
      if (this.props.scene.nextSceneID == -1 && this.props.onUpdateScene) {
        let sceneID: number;
        if (this.props.scene.nextSceneRandoms.length == 0) {
          sceneID = getRandomListItem(this.props.scenes.map((s) => s.id));
        } else {
          sceneID = getRandomListItem(this.props.scene.nextSceneRandoms);
        }
        this.props.onUpdateScene(this.props.scene, (s) => {
          s.nextSceneRandomID = sceneID;
        })
      }
    }
    if (this.props.scene.overlayEnabled != props.scene.overlayEnabled) {
      this.setState({overlayVideos: Array<Array<HTMLVideoElement>>(this.props.scene.overlays.length).fill(null).map((n) => [null])});
    } else if (this.props.scene.overlays != props.scene.overlays) {
      if (this.props.scene.overlays.length == props.scene.overlays.length) {
        for (let o = 0; o < this.props.scene.overlays.length; o++) {
          if (this.props.scene.overlays[o].sceneID != props.scene.overlays[o].sceneID) {
            this.clearOverlayVideo(o);
            break;
          }
        }
      } else if (this.props.scene.overlays.length < props.scene.overlays.length) {
        for (let o = 0; o < this.props.scene.overlays.length; o++) {
          if (this.props.scene.overlays[o].sceneID != props.scene.overlays[o].sceneID) {
            this.spliceOverlayVideo(o);
            break;
          }
        }
      }
    }
    if ((this.props.allLoaded == true && props.allLoaded == false) || (this.props.hasStarted && this.props.hasStarted != props.hasStarted)) {
      this.start(true);
    }
  }

  componentDidMount() {
    if (!this.props.gridView) {
      this._interval = setInterval(() => this.nextSceneLoop(), 1000);
    }
    if (this.props.preventSleep) {
      this._powerSaveID = remote.powerSaveBlocker.start('prevent-display-sleep');
    }
    if (this.props.scene.nextSceneID == -1 && this.props.onUpdateScene) {
      let sceneID: number;
      if (this.props.scene.nextSceneRandoms.length == 0) {
        sceneID = getRandomListItem(this.props.scenes.map((s) => s.id));
      } else {
        sceneID = getRandomListItem(this.props.scene.nextSceneRandoms);
      }
      this.props.onUpdateScene(this.props.scene, (s) => {
        s.nextSceneRandomID = sceneID;
      })
    }
    if (this.state.currentAudio) {
      let thumbImage = new Image();
      if (this.state.currentAudio.thumb) {
        thumbImage.src = this.state.currentAudio.thumb;
      } else {
        thumbImage.src = 'src/renderer/icons/flipflip_logo.png';
      }
      thumbImage.onload = () => {
        this.setState({thumbImage: thumbImage});
      };
    }
    if (this.props.scene.persistAudio && this.props.scene.audioEnabled) {
      this.setState({persistAudio: true});
    }
    if (this.props.scene.persistText && this.props.scene.textEnabled) {
      this.setState({persistText: true});
    }
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    this._interval = null;
    getCurrentWindow().setAlwaysOnTop(false);
    getCurrentWindow().setFullScreen(false);
    // Clear ALL the available browser caches
    global.gc();
    webFrame.clearCache();
    remote.getCurrentWindow().webContents.session.clearCache(() => {});
    if (this.props.preventSleep || this._powerSaveID != null) {
      remote.powerSaveBlocker.stop(this._powerSaveID);
      this._powerSaveID = null;
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return this.props.scene !== props.scene ||
      this.props.tags !== props.tags ||
      this.props.gridView !== props.gridView ||
      this.props.allLoaded !== props.allLoaded ||
      this.props.hasStarted !== props.hasStarted ||
      this.state.canStart !== state.canStart ||
      this.state.hasStarted !== state.hasStarted ||
      this.state.isMainLoaded !== state.isMainLoaded ||
      this.state.areOverlaysLoaded !== state.areOverlaysLoaded ||
      this.state.hideCursor !== state.hideCursor ||
      this.state.isEmpty !== state.isEmpty ||
      this.state.isPlaying !== state.isPlaying ||
      this.state.total !== state.total ||
      this.state.progress !== state.progress ||
      this.state.progressMessage !== state.progressMessage ||
      this.state.historyOffset !== state.historyOffset ||
      this.state.historyPaths !== state.historyPaths ||
      this.state.mainVideo !== state.mainVideo ||
      this.state.overlayVideos !== state.overlayVideos ||
      this.state.recentPictureGrid !== state.recentPictureGrid ||
      this.state.thumbImage !== state.thumbImage ||
      this.state.currentAudio !== state.currentAudio;
  }

  nop() {}

  _currentTimestamp: number = null;
  onPlaying(position: number, duration: number) {
    this._currentTimestamp = position;
  }
  getTimestamp() {
    return this._currentTimestamp;
  }

  setCurrentAudio(audio: Audio) {
    this.setState({currentAudio: audio});
    if (this.props.changeAudioRoute) {
      this.props.changeAudioRoute(audio.id);
    }
  }

  setProgress(total: number, current: number, message: string[]) {
    if (this.props.setProgress) {
      this.props.setProgress(total, current, message);
    }
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

  spliceOverlayVideo(index: number) {
    const newOV = Array.from(this.state.overlayVideos);
    while (newOV.length <= index) {
      newOV.push([null]);
    }
    newOV.splice(index, 1);
    this.setState({overlayVideos: newOV});
  }

  clearOverlayVideo(index: number) {
    const newOV = Array.from(this.state.overlayVideos);
    while (newOV.length <= index) {
      newOV.push([null]);
    }
    newOV[index] = [null];
    this.setState({overlayVideos: newOV});
  }

  setOverlayVideo(index: number, video: HTMLVideoElement) {
    const newOV = Array.from(this.state.overlayVideos);
    while (newOV.length <= index) {
      newOV.push([null]);
    }
    if (newOV[index][0] != video) {
      newOV[index][0] = video;
      this.setState({overlayVideos: newOV});
    }
  }

  setGridOverlayVideo(oIndex: number, gIndex: number, video: HTMLVideoElement) {
    const newOV = Array.from(this.state.overlayVideos);
    while (newOV.length <= oIndex) {
      newOV.push([null]);
    }
    while (newOV[oIndex].length <= gIndex) {
      newOV[oIndex].push(null);
    }
    if (newOV[oIndex][gIndex] != video) {
      newOV[oIndex][gIndex] = video;
      this.setState({overlayVideos: newOV});
    }
  }

  start(canStart: boolean, force = false) {
    const isLoaded = !force && (this.state.isMainLoaded && (!this.props.scene.overlayEnabled || this.props.scene.overlays.length == 0 || this.state.areOverlaysLoaded.find((b) => !b) == null));
    if (this.props.onLoaded && isLoaded) {
      this.props.onLoaded();
    }
    if (force || (canStart && ((isLoaded && (this.props.allLoaded == undefined || this.props.allLoaded)) || this.props.config.displaySettings.startImmediately))) {
      this.setState({hasStarted: this.props.hasStarted != null ? this.props.hasStarted : true, isLoaded: true, startTime: this.state.startTime ?  this.state.startTime : new Date()});
    } else {
      this.setState({isLoaded: isLoaded});
    }
  }

  goBack() {
    if (this.state.recentPictureGrid) {
      this.setState({recentPictureGrid: false});
      this.play();
    } else {
      this.props.goBack();
    }
  }

  play() {
    this.setState({isPlaying: true});
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

  getSceneGrid(id: string): SceneGrid {
    return this.props.sceneGrids.find((s) => s.id.toString() == id);
  }

  getScene(id: number): Scene {
    return this.props.scenes.find((s) => s.id == id);
  }

  onActive() {
    this.setState({hideCursor: false})
  }

  onIdle() {
    this.setState({hideCursor: true})
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

  orderScriptTags(script: CaptionScript) {
    const tagNames = this.props.allTags.map((t: Tag) => t.name);
    // Re-order the tags of the audio we were playing
    script.tags = script.tags.sort((a: Tag, b: Tag) => {
      const aIndex = tagNames.indexOf(a.name);
      const bIndex = tagNames.indexOf(b.name);
      if (aIndex < bIndex) {
        return -1;
      } else if (aIndex > bIndex) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  onRecentPictureGrid() {
    this.pause();
    this.setState({recentPictureGrid: true});
  }
}

(Player as any).displayName="Player";