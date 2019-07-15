import IncomingMessage = Electron.IncomingMessage;
import * as React from 'react';
import request from 'request';
import fs from "fs";
import {outputFile} from "fs-extra";
import wretch from "wretch";
import gifInfo from 'gif-info';
import getFolderSize from "get-folder-size";
import IdleTimer from 'react-idle-timer';
import Timeout = NodeJS.Timeout;

import {HTF, IF, SL, ST, TF, VTF, WF} from '../../data/const';
import {getCachePath, getFileName, getRandomListItem, getSourceType, isVideo, urlToPath} from '../../data/utils';
import Config from "../../data/Config";
import Scene from "../../data/Scene";
import ChildCallbackHack from './ChildCallbackHack';
import ImageView from './ImageView';
import Strobe from "./Strobe";

class GifInfo {
  animated: boolean;
  duration: string;
}

export default class ImagePlayer extends React.Component {
  readonly props: {
    config: Config,
    scene: Scene,
    advanceHack?: ChildCallbackHack,
    deleteHack?: ChildCallbackHack,
    maxInMemory: number,
    maxLoadingAtOnce: number,
    maxToRememberInHistory: number,
    allURLs: Map<String, Array<string>>,
    strobeLayer?: string,
    isPlaying: boolean,
    historyOffset: number,
    hasStarted: boolean,
    setHistoryPaths(historyPaths: Array<any>): void,
    setHistoryOffset(historyOffset: number): void,
    onLoaded(): void,
    setVideo(video: HTMLVideoElement): void,
    setTimeToNextFrame?(timeToNextFrame: number): void,
  };

  readonly state = {
    numBeingLoaded: 0,
    readyToDisplay: Array<any>(),
    historyPaths: Array<any>(),
    timeToNextFrame: 0,
    timeoutID: 0,
    nextImageID: 0,
    hideCursor: false,
  };

  _isMounted = false;
  _loadedURLs: Array<string> = null;
  _nextIndex = 0;
  _nextAdvIndex = 0;
  _nextSourceIndex: Map<String, number> = null;
  _timeout: Timeout = null;
  _waitTimeouts: Array<Timeout> = null;
  _toggleStrobe = false;

  render() {
    let offset = this.props.historyOffset;
    if (offset <= -this.state.historyPaths.length) {
      offset = -this.state.historyPaths.length + 1;
    }

    let horizTransLevel = 0;
    if (this.props.scene.horizTransType == HTF.left) {
      horizTransLevel = -this.props.scene.horizTransLevel;
    } else if (this.props.scene.horizTransType == HTF.right) {
      horizTransLevel = this.props.scene.horizTransLevel;
    }

    let vertTransLevel = 0;
    if (this.props.scene.vertTransType == VTF.up) {
      vertTransLevel = -this.props.scene.vertTransLevel;
    } else if (this.props.scene.vertTransType == VTF.down) {
      vertTransLevel = this.props.scene.vertTransLevel;
    }

    let zoomStart = 1;
    let zoomEnd = 1;
    if (this.props.scene.zoom) {
      zoomStart = this.props.scene.zoomStart;
      zoomEnd = this.props.scene.zoomEnd;
    }

    let fadeDuration = 0;
    let crossFade = this.props.scene.crossFade;
    if (crossFade) {
      switch (this.props.scene.fadeTF) {
        case TF.scene:
          fadeDuration = this.state.timeToNextFrame;
          break;
        case TF.constant:
          fadeDuration = this.props.scene.fadeDuration;
          break;
        case TF.random:
          fadeDuration = Math.floor(Math.random() * (this.props.scene.fadeDurationMax - this.props.scene.fadeDurationMin + 1)) + this.props.scene.fadeDurationMin;
          break;
        case TF.sin:
          const sinRate = (Math.abs(this.props.scene.fadeSinRate - 100) + 2) * 1000;
          fadeDuration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.fadeDurationMax - this.props.scene.fadeDurationMin + 1)) + this.props.scene.fadeDurationMin;
          break;
      }
    }
    
    let transDuration = 0;
    if (this.props.scene.zoom) {
      switch (this.props.scene.transTF) {
        case TF.scene:
          transDuration = this.state.timeToNextFrame;
          break;
        case TF.constant:
          transDuration = this.props.scene.transDuration;
          break;
        case TF.random:
          transDuration = Math.floor(Math.random() * (this.props.scene.transDurationMax - this.props.scene.transDurationMin + 1)) + this.props.scene.transDurationMin;
          break;
        case TF.sin:
          const sinRate = (Math.abs(this.props.scene.transSinRate - 100) + 2) * 1000;
          transDuration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.transDurationMax - this.props.scene.transDurationMin + 1)) + this.props.scene.transDurationMin;
          break;
      }
    }

    return (
      <div className="ImagePlayer"
           style={{cursor: this.state.hideCursor ? "none" : "initial"}}>
        {(this.props.strobeLayer == SL.middle || this.props.strobeLayer == SL.background) && (
          <Strobe
            pulse={this.props.scene.strobePulse}
            opacity={1}
            className={this.props.strobeLayer == SL.background ? 'm-background' : ''}
            durationTF={this.props.scene.strobeTF}
            duration={this.props.scene.strobeTime}
            durationMin={this.props.scene.strobeTimeMin}
            durationMax={this.props.scene.strobeTimeMax}
            sinRate={this.props.scene.strobeSinRate}
            delayTF={this.props.scene.strobeDelayTF}
            delay={this.props.scene.strobeDelay}
            delayMin={this.props.scene.strobeDelayMin}
            delayMax={this.props.scene.strobeDelayMax}
            delaySinRate={this.props.scene.strobeDelaySinRate}
            color={this.props.scene.strobeColor}
            timeToNextFrame={this.state.timeToNextFrame}
            toggleStrobe={this._toggleStrobe}
          />
        )}
        <IdleTimer
          ref={null}
          onActive={this.onActive.bind(this)}
          onIdle={this.onIdle.bind(this)}
          timeout={2000} />
          <ImageView
            image={this.state.historyPaths.length > 0 ? this.state.historyPaths[(this.state.historyPaths.length - 1) + offset] : null}
            backgroundType={this.props.scene.backgroundType}
            backgroundColor={this.props.scene.backgroundColor}
            backgroundBlur={this.props.scene.backgroundBlur}
            horizTransLevel={horizTransLevel}
            vertTransLevel={vertTransLevel}
            zoomStart={zoomStart}
            zoomEnd={zoomEnd}
            transDuration={transDuration}
            crossFade={crossFade}
            fadeDuration={fadeDuration}
            videoVolume={this.props.scene.videoVolume}
            onLoaded={this.state.historyPaths.length == 1 ? this.props.onLoaded : this.nop}
            setVideo={this.props.setVideo}/>
      </div>
    );
  }

  nop() {}

  componentDidMount() {
    this._isMounted = true;
    this._loadedURLs = new Array<string>();
    this._nextIndex = 0;
    this._nextAdvIndex = 0;
    this._nextSourceIndex = new Map<String, number>();
    this._waitTimeouts = new Array<Timeout>(this.props.config.displaySettings.maxLoadingAtOnce).fill(null);
    if (this.props.advanceHack) {
      this.props.advanceHack.listener = () => {
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
    this.startFetchLoops(this.props.maxLoadingAtOnce);
    this.start();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._loadedURLs = null;
    this._nextSourceIndex = null;
    clearTimeout(this._timeout);
    for (let timeout of this._waitTimeouts) {
      clearTimeout(this._timeout);
    }
    this._timeout = null;
    this._waitTimeouts = null;
    if (this.props.advanceHack) {
      this.props.advanceHack.listener = null;
    }
    if (this.props.deleteHack) {
      this.props.deleteHack.listener = null;
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return (state.hideCursor !== this.state.hideCursor ||
            state.historyPaths !== this.state.historyPaths ||
            props.hasStarted !== this.props.hasStarted ||
            props.allURLs !== this.props.allURLs ||
            props.historyOffset !== this.props.historyOffset ||
            props.strobeLayer !== this.props.strobeLayer);
  }

  componentWillReceiveProps(props: any) {
    if ((!this.props.isPlaying && props.isPlaying) ||
      (!this.props.allURLs && props.allURLs && !this.props.hasStarted) ||
      (!this.props.hasStarted && props.hasStarted && !this.props.allURLs)) {
      this.start();
    } else if (!props.isPlaying) {
      clearTimeout(this._timeout);
    }
  }

  onActive() {
    this.setState({hideCursor: false})
  }

  onIdle() {
    this.setState({hideCursor: true})
  }

  delete() {
    const img = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.props.historyOffset];
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

  cache(i: HTMLImageElement | HTMLVideoElement) {
    if (this.props.config.caching.enabled) {
      const fileType = getSourceType(i.src);
      if (fileType != ST.local && i.src.startsWith("http")) {
        const cachePath = getCachePath(null, this.props.config);
        if (!fs.existsSync(cachePath)) {
          fs.mkdirSync(cachePath)
        }
        const maxSize = this.props.config.caching.maxSize;
        const sourceCachePath = getCachePath(i.getAttribute("source"), this.props.config);
        const filePath = sourceCachePath + getFileName(i.src);
        const downloadImage = () => {
          if (!fs.existsSync(filePath)) {
            wretch(i.src)
              .get()
              .blob(blob => {
                const reader = new FileReader();
                reader.onload = function () {
                  if (reader.readyState == 2) {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    const buffer = Buffer.alloc(arrayBuffer.byteLength);
                    const view = new Uint8Array(arrayBuffer);
                    for (let i = 0; i < arrayBuffer.byteLength; ++i) {
                      buffer[i] = view[i];
                    }
                    outputFile(filePath, buffer);
                  }
                };
                reader.readAsArrayBuffer(blob);
              });
          }
        };
        if (maxSize == 0) {
          downloadImage();
        } else {
          getFolderSize(cachePath, (err: string, size: number) => {
            if (err) {
              throw err;
            }

            const mbSize = (size / 1024 / 1024);
            if (mbSize < maxSize) {
              downloadImage();
            }
          });
        }
      }
    }
  }

  runFetchLoop(i: number) {
    if (!this._isMounted) return;

    if (this.state.readyToDisplay.length >= this.props.maxLoadingAtOnce) {
      // Wait for the display loop to use an image (it might be fast, or paused)
      this._waitTimeouts[i] = setTimeout(() => this.runFetchLoop(i), 100);
      return;
    }

    let source;
    let collection;
    let url: string;
    if (this.props.scene.weightFunction == WF.sources) {
      if (this.props.scene.randomize) {
        source = getRandomListItem(Array.from(this.props.allURLs.keys()));
      } else {
        source = Array.from(this.props.allURLs.keys())[this._nextIndex++%this.props.allURLs.size];
      }
      collection = this.props.allURLs.get(source);
      if (!(collection && collection.length)) {
        this.runFetchLoop(i);
        return;
      }
      if (this.props.scene.forceAll) {
        collection = collection.filter((u) => !this._loadedURLs.includes(u));
        if (!(collection && collection.length)) {
          const remainingLibrary = [].concat.apply([], Array.from(this.props.allURLs.values())).filter((u: string) => !this._loadedURLs.includes(u));
          if (remainingLibrary.length === 0) {
            this._loadedURLs = new Array<string>();
          }
          this.runFetchLoop(i);
          return;
        }
      }
      if (this.props.scene.randomize) {
        url = getRandomListItem(collection);
      } else {
        let index = this._nextSourceIndex.get(source);
        if (!index) {
          index = 0;
        }
        url = collection[index%collection.length];
        this._nextSourceIndex.set(source, index+1)
      }
    } else {
      collection = [].concat.apply([], Array.from(this.props.allURLs.keys()));
      if (!(collection && collection.length)) {
        this.runFetchLoop(i);
        return;
      }
      if (this.props.scene.forceAll) {
        collection = collection.filter((u: string) => !this._loadedURLs.includes(u));
        if (!(collection && collection.length)) {
          this._loadedURLs = new Array<string>();
          this.runFetchLoop(i);
          return;
        }
      }
      if (this.props.scene.randomize) {
        url = getRandomListItem(collection);
      } else {
        url = collection[this._nextIndex++%collection.length];
      }
      source = this.props.allURLs.get(url)[0];
    }

    this._loadedURLs.push(url);
    this.setState({numBeingLoaded: this.state.numBeingLoaded + 1});

    if (isVideo(url, false)) {
      let video = document.createElement('video');
      video.setAttribute("source", source);

      const successCallback = () => {
        if (!this._isMounted) return;
        this.cache(video);
        if (this.props.scene.playFullVideo) {
          video.setAttribute("duration", (video.duration * 1000).toString());
        }
        (video as any).key = this.state.nextImageID;
        this.setState({
          readyToDisplay: this.state.readyToDisplay.concat([video]),
          numBeingLoaded: Math.max(0, this.state.numBeingLoaded - 1),
          nextImageID: this.state.nextImageID + 1,
        });
        if (this.state.historyPaths.length === 0) {
          this.advance(false, false);
        }
        this.runFetchLoop(i);
      };

      const errorCallback = () => {
        if (!this._isMounted) return;
        this.setState({
          numBeingLoaded: Math.max(0, this.state.numBeingLoaded - 1),
        });
        this.runFetchLoop(i);
      };

      if (this.props.scene.continueVideo) {
        const indexOf = this.state.historyPaths.map((i) => i.src).indexOf(url);
        if (indexOf >= 0) {
          video = this.state.historyPaths[indexOf];
          successCallback();
          return;
        }
      }

      video.onloadeddata = () => {
        // images may load immediately, but that messes up the setState()
        // lifecycle, so always load on the next event loop iteration.
        // Also, now  we know the image size, so we can finally filter it.
        if (video.videoWidth < this.props.config.displaySettings.minVideoSize
          || video.videoHeight < this.props.config.displaySettings.minVideoSize) {
          errorCallback();
        } else {
          successCallback();
        }
      };

      video.onerror = () => {
        errorCallback();
      };

      video.src = url;
      video.preload = "auto";
      video.loop = true;
      video.load();
    } else {
      const img = new Image();
      img.setAttribute("source", source);

      const successCallback = () => {
        if (!this._isMounted) return;
        this.cache(img);
        (img as any).key = this.state.nextImageID;
        this.setState({
          readyToDisplay: this.state.readyToDisplay.concat([img]),
          numBeingLoaded: Math.max(0, this.state.numBeingLoaded - 1),
          nextImageID: this.state.nextImageID + 1,
        });
        if (this.state.historyPaths.length === 0) {
          this.advance(false, false);
        }
        this.runFetchLoop(i);
      };

      const errorCallback = () => {
        if (!this._isMounted) return;
        this.setState({
          numBeingLoaded: Math.max(0, this.state.numBeingLoaded - 1),
        });
        this.runFetchLoop(i);
      };

      function toArrayBuffer(buf: Buffer) {
        let ab = new ArrayBuffer(buf.length);
        let view = new Uint8Array(ab);
        for (let j = 0; j < buf.length; ++j) {
          view[j] = buf[j];
        }
        return ab;
      }

      img.onload = () => {
        // images may load immediately, but that messes up the setState()
        // lifecycle, so always load on the next event loop iteration.
        // Also, now  we know the image size, so we can finally filter it.
        if (img.width < this.props.config.displaySettings.minImageSize
          || img.height < this.props.config.displaySettings.minImageSize) {
          errorCallback();
        } else {
          successCallback();
        }
      };

      img.onerror = () => {
        errorCallback();
      };

      const processInfo = (info: GifInfo) => {
        // If gif is animated and we want to play entire length, store its duration
        if (this.props.scene.playFullGif && info && info.animated) {
          img.setAttribute("duration", info.duration);
        }

        // Exclude non-animated gifs from gifs
        if (this.props.scene.imageTypeFilter == IF.gifs && info && !info.animated) {
          this.runFetchLoop(i);
          return;
          // Exclude animated gifs from stills
        } else if (this.props.scene.imageTypeFilter == IF.stills && info && info.animated) {
          this.runFetchLoop(i);
          return;
        }

        img.src = url;
      };

      // Get gifinfo if we need for imageFilter or playFullGif
      if ((this.props.scene.imageTypeFilter == IF.gifs || this.props.scene.imageTypeFilter == IF.stills || this.props.scene.playFullGif) && url.toLocaleLowerCase().endsWith('.gif')) {
        // Get gif info. See https://github.com/Prinzhorn/gif-info
        try {
          if (url.includes("file:///")) {
            processInfo(gifInfo(toArrayBuffer(fs.readFileSync(urlToPath(url)))));
          } else {
            request.get({url, encoding: null}, function (err: Error, res: IncomingMessage, body: Buffer) {
              if (err) {
                console.error(err);
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
      }
    }
  }

  advance(force = false, schedule = true) {
    // bail if dead
    if (!(force || (this.props.isPlaying && this._isMounted && (this.props.hasStarted || this.state.historyPaths.length == 0)))) return;

    let nextHistoryPaths = this.state.historyPaths;
    let nextImg;
    if (this.state.readyToDisplay.length) {
      nextImg = this.state.readyToDisplay.shift();
    } else if (this.state.historyPaths.length && this.props.config.defaultScene.randomize && !this.props.scene.forceAll) {
      nextImg = getRandomListItem(this.state.historyPaths);
    } else if (this.state.historyPaths.length) {
      nextImg = this.state.historyPaths[this._nextAdvIndex++%this.state.historyPaths.length];
    }
    if (nextImg) {
      if (nextImg instanceof HTMLVideoElement && !this.props.scene.playFullVideo && this.props.scene.randomVideoStart && (!this.props.scene.continueVideo || !nextImg.currentTime)) {
        nextImg.currentTime = Math.random() * nextImg.duration;
      }
      nextHistoryPaths = nextHistoryPaths.concat([nextImg]);
    }
    while (nextHistoryPaths.length > this.props.maxInMemory) {
      nextHistoryPaths.shift();
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
      }
      if (nextImg && nextImg.getAttribute("duration") && timeToNextFrame < parseInt(nextImg.getAttribute("duration"))) {
        timeToNextFrame = parseInt(nextImg.getAttribute("duration"));
      }
      if (this.props.setTimeToNextFrame) {
        this.props.setTimeToNextFrame(timeToNextFrame);
      }
      this._toggleStrobe = !this._toggleStrobe;
      this.setState({
        historyPaths: nextHistoryPaths,
        timeToNextFrame,
      });
      this._timeout = setTimeout(this.advance.bind(this, false, true), timeToNextFrame);
      this.props.setHistoryPaths(nextHistoryPaths);
    }
  }
};
