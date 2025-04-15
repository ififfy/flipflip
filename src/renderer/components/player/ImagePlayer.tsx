import IncomingMessage = Electron.IncomingMessage;
import * as React from 'react';
import * as path from "path";
import request from 'request';
import fs from "fs";
import gifInfo from 'gif-info';

import {CircularProgress, Container, Typography} from "@mui/material";

import {GO, HTF, IF, OF, OT, SL, SOF, ST, TF, VO, VTF, WF} from '../../data/const';
import {flatten, getCachePath, getRandomListItem, getRandomNumber, toArrayBuffer, urlToPath} from '../../data/utils';
import {getFileName, getSourceType, isVideo} from "./Scrapers";
import Config from "../../data/Config";
import Scene from "../../data/Scene";
import ChildCallbackHack from './ChildCallbackHack';
import ImageView from './ImageView';
import Strobe from "./Strobe";
import Audio from "../../data/Audio";
import AdjustIcon from "@mui/icons-material/Adjust";

class GifInfo {
  animated: boolean;
  duration: number;
  durationChrome: number;
}

export default class ImagePlayer extends React.Component {
  readonly props: {
    config: Config,
    scene: Scene,
    currentAudio: Audio,
    gridView: boolean,
    advanceHack: ChildCallbackHack,
    allURLs: Map<string, Array<string>>,
    allPosts: Map<string, string>,
    isPlaying: boolean,
    historyOffset: number,
    hasStarted: boolean,
    singleImage: number,
    deleteHack?: ChildCallbackHack,
    focusData?: Map<string, Map<string, string>>,
    focusMode?: boolean,
    gridCoordinates?: Array<number>,
    isOverlay?: boolean,
    strobeLayer?: string,
    setHistoryPaths(historyPaths: Array<any>): void,
    setHistoryOffset(historyOffset: number): void,
    onLoaded(): void,
    setVideo(video: HTMLVideoElement): void,
    cache(i: HTMLImageElement | HTMLVideoElement): void,
    onEndScene?(): void,
    setSceneCopy?(children: React.ReactNode): void,
    setTimeToNextFrame?(timeToNextFrame: number): void,
    playNextScene?(): void,
  };

  readonly state = {
    readyToDisplay: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>(),
    historyPaths: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>(),
    timeToNextFrame: 0,
    timeoutID: 0,
    nextImageID: 0,
    historyOffset: 0,
    zoom: null as string,
  };

  _backForth: NodeJS.Timeout = null;
  _isMounted: boolean;
  _isLooping: boolean;
  _loadedSources: Array<string>;
  _loadedURLs: Array<string>;
  _playedURLs: Array<string>;
  _nextIndex: number;
  _nextAdvIndex: number;
  _sourceComplete: boolean;
  _count: number;
  _nextSourceIndex: Map<string, number>;
  _timeout: NodeJS.Timeout;
  _waitTimeouts: Array<NodeJS.Timeout>;
  _imgLoadTimeouts: Array<NodeJS.Timeout>;
  _toggleStrobe: boolean;
  _runFetchLoopCallRequests: Array<number>;
  _animationFrameHandle: number;

  render() {
    let offset = this.getHistoryOffset();
    if (offset <= -this.state.historyPaths.length) {
      offset = -this.state.historyPaths.length + 1;
    }

    const style: any = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      position: this.props.gridView ? 'static' : 'fixed',
      zIndex: this.props.isOverlay ? 4 : 'auto',
    };

    let left = 50;
    let bottom = 50;
    if (!!this.state.zoom) {
      let zoomStringSplit = this.state.zoom.split(",");
      let horiz = parseInt(zoomStringSplit[0]);
      let vert = parseInt(zoomStringSplit[1]);

      let horizTransType = horiz > 0 ? HTF.left : HTF.right;
      let horizTransLevel = Math.abs(horiz);
      let vertTransType = vert > 0 ? VTF.up : VTF.down;
      let vertTransLevel = Math.abs(vert);

      if (horizTransType == HTF.left) {
        left+=horizTransLevel;
      } else if (horizTransType == HTF.right) {
        left-=horizTransLevel;
      }
      if (vertTransType == VTF.up) {
        bottom-=vertTransLevel;
      } else if (vertTransType == VTF.down) {
        bottom+=vertTransLevel;
      }
    }

    return (
      <div style={style}>
        {this.props.focusMode && this.state.zoom && (
          <Container
            maxWidth={false}
            style={{
              zIndex: 3,
              flexGrow: 1,
              padding: 0,
              position: 'absolute',
              left: left + "%",
              bottom: bottom + "%",
            }}>
            <AdjustIcon
              style={{
                color: "red",
                marginLeft: -12,
                marginBottom: -12,
              }}
            />
          </Container>
        )}
        {(this.props.scene && this.props.scene.strobe && this.props.strobeLayer == SL.middle) && (
          <Strobe
            currentAudio={this.props.currentAudio}
            zIndex={3}
            toggleStrobe={this._toggleStrobe}
            timeToNextFrame={this.state.timeToNextFrame}
            scene={this.props.scene}/>
        )}
        {this.props.scene.downloadScene && (
          <Container
            maxWidth={false}
            style={{
              height: '100%',
              zIndex: 3,
              flexGrow: 1,
              padding: 0,
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
            }}>
            {this.props.scene.sources[0].countComplete &&
              <CircularProgress size={300} variant="determinate"
                                value={Math.round((this._playedURLs?.length / this.props.scene.sources[0].count) * 100)}
              />}
            {!this.props.scene.sources[0].countComplete && <CircularProgress size={300}/>}
            <div
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                position: 'absolute',
                flexDirection: 'column',
              }}>
              <Typography component="h1" variant="h6" color="inherit" noWrap style={{paddingLeft: 8, paddingRight: 8, backgroundColor: '#2C2C2C'}}>
                {this._playedURLs?.length} / {this.props.scene.sources[0].count}{this.props.scene.sources[0].countComplete? "" : "+"}
              </Typography>
            </div>
          </Container>
        )}
        <ImageView
          removeChild
          gridCoordinates={this.props.gridCoordinates}
          image={this.state.historyPaths.length > 0 ? this.state.historyPaths[(this.state.historyPaths.length - 1) + offset] : null}
          currentAudio={this.props.currentAudio}
          scene={this.props.scene}
          config={this.props.config}
          timeToNextFrame={this.state.timeToNextFrame}
          toggleStrobe={this._toggleStrobe}
          fitParent={this.props.gridView}
          hasStarted={this.props.hasStarted}
          zoom={this.props.focusMode ? null : this.state.zoom}
          onLoaded={this.state.historyPaths.length == 1 ? this.props.onLoaded : undefined}
          setSceneCopy={this.props.setSceneCopy}
          setVideo={this.props.setVideo}/>
      </div>
    );
  }

  getHistoryOffset() {
    return this.props.historyOffset + this.state.historyOffset;
  }

  _lastAdvance: number = null;
  componentDidMount() {
    this._runFetchLoopCallRequests = [];
    this._isMounted = true;
    this._isLooping = false;
    this._loadedSources = new Array<string>();
    this._loadedURLs = new Array<string>();
    this._playedURLs = new Array<string>();
    this._nextIndex = -1;
    this._nextAdvIndex = 0;
    this._sourceComplete = false;
    this._count = 0;
    this._nextSourceIndex = new Map<string, number>();
    this._waitTimeouts = new Array<NodeJS.Timeout>(this.props.config.displaySettings.maxLoadingAtOnce).fill(null);
    this._imgLoadTimeouts = new Array<NodeJS.Timeout>(this.props.config.displaySettings.maxLoadingAtOnce).fill(null);
    this._toggleStrobe = false;
    this.props.advanceHack.listener = () => {
      let delay = 100;
      if (this.state.historyPaths.length > 0) {
        const source = this.state.historyPaths[this.state.historyPaths.length - 1].getAttribute("source");
        if (source && getSourceType(source) == ST.video) {
          delay = 200;
        }
      }
      if (this._lastAdvance == null || new Date().getTime() - this._lastAdvance > delay) {
        this._lastAdvance = new Date().getTime();
        clearTimeout(this._timeout);
        this.advance(true, true);
      }
    }
    if (this.props.deleteHack) {
      this.props.deleteHack.listener = () => {
        // delete current image from historyPaths and readyToDisplay
        this.delete();
      }
    }
    this._animationFrameHandle = requestAnimationFrame(this.animationFrame);
    this.startFetchLoops(this.props.config.displaySettings.maxLoadingAtOnce);
    this.start();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._animationFrameHandle);
    clearTimeout(this._backForth);
    clearTimeout(this._timeout);
    for (let timeout of this._waitTimeouts) {
      clearTimeout(timeout);
    }
    for (let timeout of this._imgLoadTimeouts) {
      clearTimeout(timeout);
    }
    this._backForth = null;
    this._timeout = null;
    this._waitTimeouts = null;
    this._imgLoadTimeouts= null;
    this._isMounted = null;
    this._isLooping = null;
    this._loadedSources = null;
    this._loadedURLs = null;
    this._playedURLs = null;
    this._nextIndex = null;
    this._nextAdvIndex = null;
    this._sourceComplete = null;
    this._count = null;
    this._nextSourceIndex = null;
    this._toggleStrobe = null;
    this.props.advanceHack.listener = null;
    if (this.props.deleteHack) {
      this.props.deleteHack.listener = null;
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return (state.historyPaths !== this.state.historyPaths ||
            props.scene !== this.props.scene ||
            props.isPlaying !== this.props.isPlaying ||
            props.hasStarted !== this.props.hasStarted ||
            props.allURLs !== this.props.allURLs ||
            props.historyOffset !== this.props.historyOffset ||
            state.historyOffset !== this.state.historyOffset ||
            props.gridView !== this.props.gridView ||
            props.strobeLayer !== this.props.strobeLayer);
  }

  componentDidUpdate(props: any, state: any) {
    if (((!props.isPlaying && this.props.isPlaying) ||
      (!props.allURLs && this.props.allURLs) ||
      (!props.hasStarted && this.props.hasStarted)) && !this._isLooping) {
      this.start();
    } else if (!this.props.isPlaying) {
      this._isLooping = false;
      clearTimeout(this._timeout);
    }
    if (this.props.scene.orderFunction !== props.scene.orderFunction || this.props.scene.sourceOrderFunction !== props.scene.sourceOrderFunction) {
      this.setState({readyToDisplay: []});
    }
    if (this.props.scene.backForth && this._backForth == null && this.props.isPlaying && this.props.hasStarted) {
      clearTimeout(this._backForth);
      this._backForth = null;
      setTimeout(() => this.advance(true, false), 200);
      this._backForth = setTimeout(this.backForth.bind(this, -1), this.getBackForthTiming());
    } else if (props.scene.backForth && !this.props.scene.backForth) {
      clearTimeout(this._backForth);
      this._backForth = null;
    }
  }

  getBackForthTiming(): number {
    let delay;
    switch (this.props.scene.backForthTF) {
      case TF.constant:
        delay = this.props.scene.backForthConstant;
        break;
      case TF.random:
        delay = Math.floor(Math.random() * (this.props.scene.backForthMax - this.props.scene.backForthMin + 1)) + this.props.scene.backForthMin;
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.backForthSinRate - 100) + 2) * 1000;
        delay = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.backForthMax - this.props.scene.backForthMin + 1)) + this.props.scene.backForthMin;
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.strobeDelayBPMMulti / 10;
        const bpm = this.props.currentAudio ? this.props.currentAudio.bpm : 60;
        delay = 60000 / (bpm * bpmMulti);
        // If we cannot parse this, default to 1s
        if (!delay) {
          delay = 1000;
        }
        break;
    }
    return delay;
  }

  backForth(newOffset: number) {
    if (this.props.isPlaying && this._isMounted) {
      this.setState({historyOffset: newOffset});
      this._backForth = setTimeout(this.backForth.bind(this, newOffset == 0 ? -1 : 0), this.getBackForthTiming());
    } else {
      if (this._isMounted && this.state.historyOffset != 0) {
        this.setState({historyOffset: 0});
      }
      clearTimeout(this._backForth);
      this._backForth = null;
    }
  }

  delete() {
    const img = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.getHistoryOffset()];
    const url = img.src;
    let newHistoryPaths = [];
    let newHistoryOffset = this.props.historyOffset;
    for (let image of this.state.historyPaths) {
      if (image.src != url) {
        newHistoryPaths.push(image);
      } else {
        newHistoryOffset += 1;
      }
    }
    if (newHistoryOffset > 0) {
      newHistoryOffset = 0;
    }
    this.props.setHistoryPaths(newHistoryPaths);
    this.props.setHistoryOffset(newHistoryOffset);
    this.setState({
      historyPaths: newHistoryPaths,
      historyOffset: newHistoryOffset,
      readyToDisplay: this.state.readyToDisplay.filter((i) => i.src != url),
    });
  }

  start() {
    if (this.props.allURLs == null) {
      return;
    }

    this.advance(true, true);
  }

  startFetchLoops(max: number, loop = 0) {
    if (loop < max) {
      this.runFetchLoop(loop);
      // Put a small delay between our loops
      this._waitTimeouts[loop] = setTimeout(this.startFetchLoops.bind(this, max, loop+1), 10);
    }
  }

  animationFrame = () => {
    if (!this._isMounted || (this.props.singleImage)) {
      cancelAnimationFrame(this._animationFrameHandle);
      return;
    }
    let requestAnimation = false;
    if (this.state.readyToDisplay.length < this.props.config.displaySettings.maxLoadingAtOnce && this.props.allURLs) {
      while (this._runFetchLoopCallRequests.length > 0) {
        requestAnimation = true;
        this.runFetchLoop(this._runFetchLoopCallRequests.shift());
      }
    }
    if (requestAnimation) {
      this._animationFrameHandle = requestAnimationFrame(this.animationFrame);
    } else {
      setTimeout(this.animationFrame, 100);
    }
  }

  queueRunFetchLoop(i: number) {
    this._runFetchLoopCallRequests.push(i);
  }

  runFetchLoop(i: number) {
    if (!this._isMounted) return;

    if (this.state.readyToDisplay.length >= this.props.config.displaySettings.maxInMemory || !this.props.allURLs) {
      // Wait for the display loop to use an image
      this._waitTimeouts[i] = setTimeout(() => this.queueRunFetchLoop(i), 100);
      return;
    }

    let source: string;
    let collection: string[];
    let url: string;
    let urlIndex: number;
    let sourceIndex: number = null;
    let sourceLength: number;

    // For source weighted
    if (this.props.scene.weightFunction == WF.sources) {
      let keys;
      if (this.props.scene.useWeights) {
        const validKeys = Array.from(this.props.allURLs.keys());
        keys = [];
        for (let source of this.props.scene.sources) {
          if (validKeys.includes(source.url)) {
            for (let w = source.weight; w > 0; w--) {
              keys.push(source.url);
            }
          }
        }
      } else {
        keys = Array.from(this.props.allURLs.keys());
      }

      // If sorting randomly, get a random source
      if (this.props.scene.sourceOrderFunction == SOF.random) {
        // If we're playing full sources
        if (this.props.scene.fullSource) {
          // If this is the first loop or source is done get next source
          if (this._nextIndex == -1 || this._sourceComplete) {
            if (this.props.scene.forceAllSource) {
              // Filter the available urls to those not played yet
              keys = keys.filter((s) => !this._loadedSources.includes(s));
              // If there are no remaining urls for this source
              if (!(keys && keys.length)) {
                this._loadedSources = new Array<string>();
                keys = Array.from(this.props.allURLs.keys());
              }
            }
            source = getRandomListItem(keys);
            this._nextIndex = Array.from(this.props.allURLs.keys()).indexOf(source);
            this._sourceComplete = false;
            this._loadedSources.push(source);
          } else { // Play same source
            source = keys[this._nextIndex];
          }
        } else {
          source = getRandomListItem(keys);
          this._loadedSources.push(source);
        }
      } else { // Else get the next source
        // If we're playing full sources
        if (this.props.scene.fullSource) {
          // If this is the first loop or source is done get next source
          if (this._nextIndex == -1 || this._sourceComplete) {
            source = keys[++this._nextIndex % keys.length];
            this._sourceComplete = false;
          } else { // Play same source
            source = keys[this._nextIndex % keys.length];
          }
        } else {
          source = keys[++this._nextIndex % keys.length];
        }
        sourceIndex = this._nextIndex % keys.length;
      }
      // Get the urls from the source
      collection = this.props.allURLs.get(source);

      // If we have no urls, loop again
      if (!(collection && collection.length)) {
        this.queueRunFetchLoop(i);
        return;
      }

      // If sorting randomly and forcing all
      if (this.props.scene.orderFunction == OF.random && (this.props.scene.forceAll || this.props.scene.fullSource)) {
        // Filter the available urls to those not played yet
        collection = collection.filter((u) => !this._loadedURLs.includes(u));
        // If there are no remaining urls for this source
        if (!(collection && collection.length)) {
          if (this.props.scene.fullSource) {
            this._loadedURLs = new Array<string>();
            this._sourceComplete = true;
            this.queueRunFetchLoop(i);
            return;
          } else {
            // Make sure all the other sources are also extinguished
            const remainingLibrary = flatten(Array.from(this.props.allURLs.values())).filter((u: string) => !this._loadedURLs.includes(u));
            // If they are, clear loadedURLs
            if (remainingLibrary.length === 0) {
              this._loadedURLs = new Array<string>();
              collection = this.props.allURLs.get(source);
            } else { // Else loop again
              this.queueRunFetchLoop(i);
              return;
            }
          }
        }
      }

      // If sorting randomly, get a random URL
      if (this.props.scene.orderFunction == OF.random) {
        url = getRandomListItem(collection);
      } else { // Else get the next index for this source
        let index = this._nextSourceIndex.get(source);
        if (!index) {
          if (this._nextSourceIndex.size > 0) {
            index = Math.min(...this._nextSourceIndex.values());
          } else {
            index = 0;
          }
        }
        if (this.props.scene.orderFunction == OF.strict) {
          urlIndex = index;
          sourceLength = collection.length;
        }
        if (this.props.scene.fullSource && index % collection.length == collection.length - 1) {
          this._sourceComplete = true;
        }
        url = collection[index%collection.length];
        this._nextSourceIndex.set(source, index+1);
      }
    } else { // For image weighted

      // Concat all images together
      const urlKeys = flatten(Array.from(this.props.allURLs.keys()));
      collection = urlKeys;
      // If there are none, loop again
      if (!(collection && collection.length)) {
        this.queueRunFetchLoop(i);
        return;
      }

      // If sorting randomly and forcing all
      if (this.props.scene.orderFunction == OF.random && this.props.scene.forceAll) {
        // Filter the available ulls to those not played yet
        collection = collection.filter((u: string) => !this._loadedURLs.includes(u));
        // If there are no remaining urls, clear loadedURLs
        if (!(collection && collection.length)) {
          this._loadedURLs = new Array<string>();
          collection = urlKeys;
        }
      }

      // If sorting randomly, get a random URL
      if (this.props.scene.orderFunction == OF.random) {
        url = getRandomListItem(collection);
      } else { // Else get the next index
        url = collection[++this._nextIndex%collection.length];
        if (this.props.scene.orderFunction == OF.strict) {
          urlIndex = this._nextIndex;
          sourceLength = collection.length;
        }
      }

      // Get the source of this image from the map
      source = this.props.allURLs.get(url)[0];
    }

    let post = this.props.allPosts.has(url) ? this.props.allPosts.get(url) : null;

    if (this.props.scene.orderFunction == OF.random && (this.props.scene.forceAll || (this.props.scene.weightFunction == WF.sources && this.props.scene.fullSource))) {
      this._loadedURLs.push(url);
    }

    // Don't bother loading files we've already cached locally
    const fileType = getSourceType(url);
    if (this.props.config.caching.enabled && url.startsWith("http")) {
      if (fileType != ST.nimja && fileType != ST.hydrus && fileType != ST.piwigo && fileType != ST.video && fileType != ST.local && fileType != ST.playlist) {
        const sourceCachePath = getCachePath(source, this.props.config);
        const filePath = sourceCachePath + getFileName(url);
        const cachedAlready = fs.existsSync(filePath);
        if (cachedAlready) {
          url = filePath;
        }
      }
    }

    if (fileType == ST.nimja) {
      let iframe = document.createElement('iframe');
      iframe.setAttribute("source", source);
      if (!!post) {
        iframe.setAttribute("post", post);
      }
      if (this.props.scene.orderFunction == OF.strict) {
        iframe.setAttribute("index", urlIndex.toString());
        iframe.setAttribute("length", sourceLength.toString());
        if (sourceIndex != null) {
          iframe.setAttribute("sindex", sourceIndex.toString());
        }
      }

      const successCallback = () => {
        if (this._imgLoadTimeouts) {
          clearTimeout(this._imgLoadTimeouts[i]);
        }
        if (!this._isMounted) return;

        (iframe as any).key = this.state.nextImageID;
        this.setState({
          readyToDisplay: this.state.readyToDisplay.concat([iframe]),
          nextImageID: this.state.nextImageID + 1,
        });
        if (this.state.historyPaths.length === 0) {
          this.advance(false, false);
        }
        this.queueRunFetchLoop(i);
      };

      iframe.oncontextmenu = () => {return false}

      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
      iframe.src = url;

      clearTimeout(this._imgLoadTimeouts[i]);
      successCallback();
    } else if (isVideo(url, false)) {
      let video = document.createElement('video');
      video.setAttribute("source", source);
      if (!!post) {
        video.setAttribute("post", post);
      }
      if (this.props.scene.orderFunction == OF.strict) {
        video.setAttribute("index", urlIndex.toString());
        video.setAttribute("length", sourceLength.toString());
        if (sourceIndex != null) {
          video.setAttribute("sindex", sourceIndex.toString());
        }
      }
      let subtitleSplit = url.split("|||");
      if (subtitleSplit.length > 1) {
        url = subtitleSplit[0];
        video.setAttribute("subtitles", subtitleSplit[1]);
      }
      let clipRegex = /(.*):::(\d+):([\d-]+):::(\d+\.?\d*):(\d+\.?\d*)$/g.exec(url);
      if (clipRegex != null) {
        url = clipRegex[1];
        video.setAttribute("clip", clipRegex[2]);
        if (clipRegex[3] != "-") {
          video.setAttribute("volume", clipRegex[3]);
        }
        video.setAttribute("start", clipRegex[4]);
        video.setAttribute("end", clipRegex[5]);
      }

      const successCallback = () => {
        if (this._imgLoadTimeouts) {
          clearTimeout(this._imgLoadTimeouts[i]);
        }
        if (!this._isMounted) return;
        this.props.cache(video);

        const width = video.videoWidth;
        const height = video.videoHeight;
        if ((this.props.scene.videoOrientation == OT.onlyLandscape && height > width) ||
          (this.props.scene.videoOrientation == OT.onlyPortrait && height < width)) {
          errorCallback();
          return;
        }

        if (!video.hasAttribute("start") && !video.hasAttribute("end") &&
          (this.props.scene.skipVideoStart > 0 || this.props.scene.skipVideoEnd > 0) &&
          (video.duration - (this.props.scene.skipVideoStart / 1000) - (this.props.scene.skipVideoEnd / 1000)) > 0) {
          video.setAttribute("start", (this.props.scene.skipVideoStart / 1000).toString());
          video.setAttribute("end", (video.duration - (this.props.scene.skipVideoEnd / 1000)).toString());
        }

        let speed = this.props.scene.videoSpeed;
        if (this.props.scene.videoRandomSpeed) {
          speed = Math.floor(Math.random() * (this.props.scene.videoSpeedMax - this.props.scene.videoSpeedMin + 1)) + this.props.scene.videoSpeedMin;
        }
        video.setAttribute("speed", speed.toString());

        if (video.hasAttribute("start") && video.hasAttribute("end")) {
          const start = parseFloat(video.getAttribute("start"));
          const end = parseFloat(video.getAttribute("end"));
          if (this.props.scene.randomVideoStart && (!this.props.scene.continueVideo || !video.currentTime)) {
            video.currentTime = start + (Math.random() * (end - start));
          } else if (video.currentTime < start || video.currentTime > end) {
            video.currentTime = start;
          }
        } else if (this.props.scene.randomVideoStart && (!this.props.scene.continueVideo || !video.currentTime)) {
          video.currentTime = Math.random() * video.duration;
        }

        switch(this.props.scene.videoOption) {
          case VO.full:
            let duration;
            if (video.hasAttribute("start") && video.hasAttribute("end")) {
              const start = video.currentTime ? video.currentTime : parseFloat(video.getAttribute("start"));
              const end = parseFloat(video.getAttribute("end"));
              duration = end - start;
            } else {
              duration = video.duration - video.currentTime;
            }
            duration = duration * 1000 / (speed / 10);
            video.setAttribute("duration", duration.toString());
            break;
          case VO.part:
            video.setAttribute("duration", this.props.scene.videoTimingConstant.toString());
            break;
          case VO.partr:
            video.setAttribute("duration", getRandomNumber(this.props.scene.videoTimingMin, this.props.scene.videoTimingMax).toString());
            break;
          case VO.atLeast:
            let partDuration;
            if (video.hasAttribute("start") && video.hasAttribute("end")) {
              const start = parseFloat(video.getAttribute("start"));
              const end = parseFloat(video.getAttribute("end"));
              partDuration = end - start;
            } else {
              partDuration = video.duration;
            }
            partDuration = partDuration * 1000 / (speed / 10);
            let atLeastDuration = 0;
            do {
              atLeastDuration += partDuration;
            } while (atLeastDuration < this.props.scene.videoTimingConstant);
            video.setAttribute("duration", atLeastDuration.toString())
            break;
        }

        (video as any).key = this.state.nextImageID;
        if (this.props.scene.orderFunction == OF.strict) {
          const lastIndex = this.state.historyPaths.length ? parseInt(this.state.historyPaths[this.state.historyPaths.length - 1].getAttribute("index")) : -1;
          let readyToDisplay = this.state.readyToDisplay;
          let count = 0;
          while (readyToDisplay.length < urlIndex - lastIndex) {
            count++;
            readyToDisplay = readyToDisplay.concat([null]);
          }
          readyToDisplay[urlIndex - lastIndex - 1] = video;
          this.setState({
            readyToDisplay: readyToDisplay,
            nextImageID: this.state.nextImageID + 1,
          });
        } else {
          this.setState({
            readyToDisplay: this.state.readyToDisplay.concat([video]),
            nextImageID: this.state.nextImageID + 1,
          });
        }
        if (this.state.historyPaths.length === 0) {
          this.advance(false, false);
        }
        this.queueRunFetchLoop(i);
      };

      const errorCallback = () => {
        if (this._imgLoadTimeouts) {
          clearTimeout(this._imgLoadTimeouts[i]);
        }
        if (!this._isMounted) return;
        if (this.props.scene.downloadScene || (this.props.scene.nextSceneAllImages && this.props.scene.nextSceneID != 0 && this.props.playNextScene && video && video.src)) {
          if (!this._playedURLs.includes(video.src)) {
            this._playedURLs.push(video.src);
          }
        }
        if (this.props.scene.orderFunction == OF.strict) {
          const lastIndex = this.state.historyPaths.length ? parseInt(this.state.historyPaths[this.state.historyPaths.length - 1].getAttribute("index")) : -1;

          let readyToDisplay = this.state.readyToDisplay;
          let count = 0;
          while (readyToDisplay.length < urlIndex - lastIndex) {
            count++;
            readyToDisplay = readyToDisplay.concat([null]);
          }
          const errImage = new Image();
          errImage.setAttribute("index", urlIndex.toString());
          errImage.setAttribute("length", sourceLength.toString());
          if (sourceIndex != null) {
            errImage.setAttribute("sindex", sourceIndex.toString());
          }
          errImage.src = "src/renderer/icons/flipflip_logo.png"
          readyToDisplay[urlIndex - lastIndex - 1] = errImage;
          this.setState({
            readyToDisplay: readyToDisplay,
            nextImageID: this.state.nextImageID + 1,
          });
        }
        this.queueRunFetchLoop(i);
      };

      video.onloadeddata = () => {
        // images may load immediately, but that messes up the setState()
        // lifecycle, so always load on the next event loop iteration.
        // Also, now  we know the image size, so we can finally filter it.
        if (video.videoWidth < this.props.config.displaySettings.minVideoSize
          || video.videoHeight < this.props.config.displaySettings.minVideoSize) {
          console.warn("Video skipped due to minimum width/height: " + video.src);
          errorCallback();
        } else {
          successCallback();
        }
      };

      video.onerror = video.onabort = () => {
        errorCallback();
      };

      video.onended = () => {
        if (this.props.scene.videoOption == VO.full) {
          clearTimeout(this._timeout);
          this.advance(true, true);
        } else {
          video.play();
        }
      }

      video.src = url;
      video.volume = 0;
      video.preload = "auto";

      clearTimeout(this._imgLoadTimeouts[i]);
      this._imgLoadTimeouts[i] = setTimeout(errorCallback, 15000);

      video.load();
    } else {
      const img = new Image();
      img.setAttribute("source", source);
      if (this.props.focusData.has(source)) {
        const focusData = this.props.focusData.get(source);
        if (!!focusData && !!focusData.has && focusData.has(url)) {
          img.setAttribute("focus", focusData.get(url));
        }
      }
      if (!!post) {
        img.setAttribute("post", post);
      }
      if (this.props.scene.orderFunction == OF.strict) {
        img.setAttribute("index", urlIndex.toString());
        img.setAttribute("length", sourceLength.toString());
        if (sourceIndex != null) {
          img.setAttribute("sindex", sourceIndex.toString());
        }
      }

      const successCallback = () => {
        if (this._imgLoadTimeouts) {
          clearTimeout(this._imgLoadTimeouts[i]);
        }
        if (!this._isMounted) return;
        this.props.cache(img);

        const width = img.width;
        const height = img.height;
        if ((this.props.scene.imageOrientation == OT.onlyLandscape && height > width) ||
          (this.props.scene.imageOrientation == OT.onlyPortrait && height < width)) {
          errorCallback();
          return;
        }

        (img as any).key = this.state.nextImageID;
        if (this.props.scene.orderFunction == OF.strict) {
          const lastIndex = this.state.historyPaths.length ? parseInt(this.state.historyPaths[this.state.historyPaths.length - 1].getAttribute("index")) : -1;

          let readyToDisplay = this.state.readyToDisplay;
          let count = 0;
          while (readyToDisplay.length < urlIndex - lastIndex) {
            count++;
            readyToDisplay = readyToDisplay.concat([null]);
          }
          readyToDisplay[urlIndex - lastIndex - 1] = img;
          this.setState({
            readyToDisplay: readyToDisplay,
            nextImageID: this.state.nextImageID + 1,
          });
        } else {
          this.setState({
            readyToDisplay: this.state.readyToDisplay.concat([img]),
            nextImageID: this.state.nextImageID + 1,
          });
        }
        if (this.state.historyPaths.length === 0) {
          this.advance(false, false);
        }
        this.queueRunFetchLoop(i);
      };

      const errorCallback = () => {
        if (this._imgLoadTimeouts) {
          clearTimeout(this._imgLoadTimeouts[i]);
        }
        if (!this._isMounted) return;
        if (this.props.scene.downloadScene || (this.props.scene.nextSceneAllImages && this.props.scene.nextSceneID != 0 && this.props.playNextScene && img && img.src)) {
          if (!this._playedURLs.includes(img.src)) {
            this._playedURLs.push(img.src);
          }
        }
        if (this.props.scene.orderFunction == OF.strict) {
          const lastIndex = this.state.historyPaths.length ? parseInt(this.state.historyPaths[this.state.historyPaths.length - 1].getAttribute("index")) : -1;

          let readyToDisplay = this.state.readyToDisplay;
          let count = 0;
          while (readyToDisplay.length < urlIndex - lastIndex) {
            count++;
            readyToDisplay = readyToDisplay.concat([null]);
          }
          const errImage = new Image();
          errImage.setAttribute("index", urlIndex.toString());
          errImage.setAttribute("length", sourceLength.toString());
          if (sourceIndex != null) {
            errImage.setAttribute("sindex", sourceIndex.toString());
          }
          errImage.src = "src/renderer/icons/flipflip_logo.png"
          readyToDisplay[urlIndex - lastIndex - 1] = errImage;
          this.setState({
            readyToDisplay: readyToDisplay,
            nextImageID: this.state.nextImageID + 1,
          });
        }
        this.queueRunFetchLoop(i);
      };

      img.onload = () => {
        // images may load immediately, but that messes up the setState()
        // lifecycle, so always load on the next event loop iteration.
        // Also, now  we know the image size, so we can finally filter it.
        if (img.width < this.props.config.displaySettings.minImageSize
          || img.height < this.props.config.displaySettings.minImageSize) {
          console.warn("Image skipped due to minimum width/height: " + img.src);
          errorCallback();
        } else {
          successCallback();
        }
      };

      img.onerror = img.onabort = () => {
        errorCallback();
      };

      const processInfo = (info: GifInfo) => {
        if (info == null) {
          this.queueRunFetchLoop(i);
          return;
        }

        // If gif is animated and we want to play entire length, store its duration
        if (info && info.animated) {
          switch (this.props.scene.gifOption) {
            case GO.full:
              img.setAttribute("duration", (!!info.durationChrome ? info.durationChrome : info.duration).toString());
              break;
            case GO.part:
              img.setAttribute("duration", this.props.scene.gifTimingConstant.toString());
              break;
            case GO.partr:
              img.setAttribute("duration", getRandomNumber(this.props.scene.gifTimingMin, this.props.scene.gifTimingMax).toString());
              break;
            case GO.atLeast:
              let duration = 0;
              do {
                duration += (!!info.durationChrome ? info.durationChrome : info.duration);
                if (duration == 0) {
                  break;
                }
              } while (duration < this.props.scene.gifTimingConstant);
              img.setAttribute("duration", duration.toString());
              break;
          }
        }

        // Exclude non-animated gifs from gifs
        if (this.props.scene.imageTypeFilter == IF.animated && info && !info.animated) {
          this.queueRunFetchLoop(i);
          return;
          // Exclude animated gifs from stills
        } else if (this.props.scene.imageTypeFilter == IF.stills && info && info.animated) {
          this.queueRunFetchLoop(i);
          return;
        }

        img.src = url;
        clearTimeout(this._imgLoadTimeouts[i]);
        this._imgLoadTimeouts[i] = setTimeout(errorCallback, 5000);
      };

      // Get gifinfo if we need for imageFilter or playing full gif
      if ((this.props.scene.imageTypeFilter == IF.animated || this.props.scene.imageTypeFilter == IF.stills || this.props.scene.gifOption != GO.none) && url.includes('.gif')) {
        // Get gif info. See https://github.com/Prinzhorn/gif-info
        try {
          if (url.includes("file://")) {
            processInfo(gifInfo(toArrayBuffer(fs.readFileSync(urlToPath(url)))));
          } else {
            request.get({url, encoding: null}, function (err: Error, res: IncomingMessage, body: Buffer) {
              if (err) {
                console.error(err);
                processInfo(null);
                return;
              }
              processInfo(gifInfo(toArrayBuffer(body)));
            });
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        img.src = url;
        clearTimeout(this._imgLoadTimeouts[i]);
        this._imgLoadTimeouts[i] = setTimeout(errorCallback, 5000);
      }
    }
  }

  _strictCheckCount = 0;
  advance(force = false, schedule = true) {
    // bail if dead
    if (!(force || (this.props.isPlaying && this._isMounted && (this.props.hasStarted || this.state.historyPaths.length == 0)))) {
      this._isLooping = false;
      return;
    }
    this._isLooping = true;

    let nextHistoryPaths = this.state.historyPaths;
    let nextImg: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement;
    if (this.props.historyOffset == 0) {
      if (this.props.scene.downloadScene && this._playedURLs.length == this.props.scene.sources[0].count && this.props.hasStarted) {
        this.props.onEndScene();
      }
      if (this.props.scene.nextSceneAllImages && this.props.scene.nextSceneID != 0 && this.props.playNextScene) {
        let remainingLibrary;
        if (this.props.scene.weightFunction == WF.sources) {
          remainingLibrary = flatten(Array.from(this.props.allURLs.values())).filter((u: string) => !this._playedURLs.includes(u));
        } else {
          remainingLibrary = flatten(Array.from(this.props.allURLs.keys())).filter((u: string) => !this._playedURLs.includes(u));
        }
        if (remainingLibrary.length === 0) {
          this._playedURLs = new Array<string>();
          this.props.playNextScene();
          return;
        }
      }

      // Prevent playing same image again, if possible
      do {
        if (this.state.readyToDisplay.length && this.state.readyToDisplay[0] != null) {
          // If there is an image ready, display the next image
          nextImg = this.state.readyToDisplay.shift();
          this._strictCheckCount = 0;
        } else if (this.state.historyPaths.length && this.props.config.defaultScene.orderFunction == OF.random && !this.props.scene.forceAll) {
          // If no image is ready, we have a history to choose from, ordering is random, and NOT forcing all
          // Choose a random image from history to display
          nextImg = getRandomListItem(this.state.historyPaths);
        } else if (this.state.historyPaths.length) {
          // If no image is ready, we have a history to choose from, and ordering is not random
          // Show the next image from history
          if (this.props.scene.orderFunction == OF.strict) {
            // If ordering strictly and next isn't ready yet, don't load any image
            this._strictCheckCount++;
            if (this._strictCheckCount >= 50) {
              this.state.readyToDisplay.shift();
              this._strictCheckCount = 0;
            }
            nextImg = null;
          } else {
            nextImg = this.state.historyPaths[this._nextAdvIndex++ % this.state.historyPaths.length];
          }
        }
      } while (this.state.historyPaths.length > 0 && nextImg?.src == this.state.historyPaths[this.state.historyPaths.length - 1].src &&
      (this.state.readyToDisplay.length > 0 || this.state.historyPaths.filter((s) => s.src != this.state.historyPaths[this.state.historyPaths.length - 1]?.src).length > 0))

      if (nextImg) {
        if (this.props.scene.continueVideo && nextImg instanceof HTMLVideoElement) {
          const videoFind = Array.from(this.state.historyPaths).reverse().find((i) => i.src == nextImg.src &&
            i.getAttribute("start") == nextImg.getAttribute("start") &&
            i.getAttribute("end") == nextImg.getAttribute("end"));
          if (videoFind) {
            nextImg = videoFind;
          }
        }
        nextHistoryPaths = nextHistoryPaths.concat([nextImg]);
      }

      while (nextHistoryPaths.length > this.props.config.displaySettings.maxInHistory) {
        nextHistoryPaths.shift().remove();
      }

      if (nextImg != null && (this.props.scene.downloadScene || (this.props.scene.nextSceneAllImages && this.props.scene.nextSceneID != 0 && this.props.playNextScene && nextImg && nextImg.src))) {
        if (!this._playedURLs.includes(nextImg.src)) {
          this._playedURLs.push(nextImg.src);
        }
      }
    } else {
      const newOffset = this.props.historyOffset + 1;
      nextImg = this.state.historyPaths[(this.state.historyPaths.length - 1) + newOffset];
      this.props.setHistoryOffset(newOffset);
    }

    if (!schedule) {
      this.setState({
        historyPaths: nextHistoryPaths,
      });
      this.props.setHistoryPaths(nextHistoryPaths);
    } else {
      let timeToNextFrame: number = 0;
      switch (this.props.scene.timingFunction) {
        case TF.random:
          timeToNextFrame = Math.floor(Math.random() * (this.props.scene.timingMax - this.props.scene.timingMin + 1)) + this.props.scene.timingMin;
          break;
        case TF.sin:
          const sinRate = (Math.abs(this.props.scene.timingSinRate - 100) + 2) * 1000;
          timeToNextFrame = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.timingMax - this.props.scene.timingMin + 1)) + this.props.scene.timingMin;
          break;
        case TF.constant:
          timeToNextFrame = this.props.scene.timingConstant;
          // If we cannot parse this, default to 1s
          if (!timeToNextFrame && timeToNextFrame != 0) {
            timeToNextFrame = 1000;
          }
          break;
        case TF.bpm:
          const bpmMulti = this.props.scene.timingBPMMulti / 10;
          const bpm = this.props.currentAudio ? this.props.currentAudio.bpm : 60;
          timeToNextFrame = 60000 / (bpm * bpmMulti);
          // If we cannot parse this, default to 1s
          if (!timeToNextFrame) {
            timeToNextFrame = 1000;
          }
          break;
      }
      if (nextImg && nextImg.getAttribute("duration") && timeToNextFrame < parseFloat(nextImg.getAttribute("duration"))) {
        timeToNextFrame = parseFloat(nextImg.getAttribute("duration"));
      }
      if (this.props.setTimeToNextFrame) {
        this.props.setTimeToNextFrame(timeToNextFrame);
      }
      let zoom = null;
      if (nextImg && nextImg.hasAttribute("focus")) {
        zoom = nextImg.getAttribute("focus");
      }
      this._toggleStrobe = !this._toggleStrobe;
      this.props.setHistoryPaths(nextHistoryPaths);
      this.setState({
        historyPaths: nextHistoryPaths,
        timeToNextFrame,
        zoom: zoom,
      });
      this._count++;
      if (!(nextImg instanceof HTMLVideoElement && this.props.scene.videoOption == VO.full) && !(this.props.singleImage && this.state.historyPaths.length > 0 && getSourceType(this.state.historyPaths[this.state.historyPaths.length - 1]?.getAttribute("source")) == ST.nimja)) {
        this._timeout = setTimeout(this.advance.bind(this, false, true), timeToNextFrame);
      }
    }
  }
};

(ImagePlayer as any).displayName="ImagePlayer";