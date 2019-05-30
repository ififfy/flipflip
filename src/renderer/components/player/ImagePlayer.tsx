import IncomingMessage = Electron.IncomingMessage;
import * as React from 'react';
import request from 'request';
import fs from "fs";
import {outputFile} from "fs-extra";
import wretch from "wretch";
import gifInfo from 'gif-info';
import getFolderSize from "get-folder-size";
import IdleTimer from 'react-idle-timer';

import {BT, HTF, IF, ST, TF, VTF, ZF} from '../../data/const';
import {getCachePath, getFileName, getRandomListItem, getSourceType, urlToPath} from '../../data/utils';
import Config from "../../data/Config";
import Scene from "../../data/Scene";
import TIMING_FUNCTIONS from '../../data/TIMING_FUNCTIONS';
import ChildCallbackHack from './ChildCallbackHack';
import ImageView from './ImageView';

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
    strobe: boolean,
    strobeTime: number,
    isPlaying: boolean,
    historyOffset: number,
    setHistoryPaths: (historyPaths: Array<HTMLImageElement>) => void,
    setHistoryOffset: (historyOffset: number) => void,
    onLoaded: () => void,
    hasStarted: boolean,
  };

  readonly state = {
    numBeingLoaded: 0,
    readyToDisplay: Array<HTMLImageElement>(),
    historyPaths: Array<HTMLImageElement>(),
    timeToNextFrame: 0,
    timeoutID: 0,
    nextImageID: 0,
    hideCursor: false,
  };

  _isMounted = false;

  render() {
    if (this.state.historyPaths.length < 1 || !this.props.hasStarted) return <div className="ImagePlayer m-empty"/>;

    const imgs = Array<HTMLImageElement>();

    // if user is browsing history, use that image instead
    if (this.state.historyPaths.length > 0 && !this.props.isPlaying) {
      let offset = this.props.historyOffset;
      if (offset <= -this.state.historyPaths.length) {
        offset = -this.state.historyPaths.length + 1;
      }
      const img = this.state.historyPaths[(this.state.historyPaths.length - 1) + offset];
      (img as any).key = 0;
      imgs.push(img);
    } else {
      const max = this.props.scene.crossFade ? 3 : 2;
      for (let i = 1; i < max; i++) {
        const img = this.state.historyPaths[this.state.historyPaths.length - i];
        if (img) {
          imgs.push(img);
        }
      }
    }

    let className = "ImagePlayer translate-";

    switch (this.props.scene.horizTransType) {
      case HTF.none:
        className += '0-';
        break;
      case HTF.right:
        className += '10-';
        break;
      case HTF.left:
        className += '-10-';
        break;
    }
    switch (this.props.scene.vertTransType) {
      case VTF.none:
        className += '0-';
        break;
      case VTF.down:
        className += '10-';
        break;
      case VTF.up:
        className += '-10-';
        break;
    }
    switch (this.props.scene.zoomType) {
      case ZF.none:
        className += `${this.props.scene.effectLevel}s`;
        break;
      case ZF.in:
        className += `zoom-${this.props.scene.effectLevel}s`;
        break;
      case ZF.out:
        className += `zoom-out-${this.props.scene.effectLevel}s`;
    }

    return (
      <div className={className}
           style={{background: this.props.strobe ? this.props.scene.strobeColor : "none", cursor: this.state.hideCursor ? "none" : "initial"}}>
        <IdleTimer
          ref={null}
          onActive={this.onActive.bind(this)}
          onIdle={this.onIdle.bind(this)}
          timeout={2000} />
        <div style={{ animation: this.props.strobe ? "strobe " + this.props.strobeTime + "ms steps(1, end) infinite" : "none" }}>
          <div className={`u-fill-container ${this.props.scene.backgroundType == BT.color ? '' : 'u-fill-image-blur'}`} style={{
            background: this.props.scene.backgroundType == BT.color ? this.props.scene.backgroundColor : null,
            backgroundImage: this.props.scene.backgroundType == BT.color ? null : `url("${imgs[0].src}")`,
          }}
          />
          {imgs.map((img) => {
            return <ImageView
              img={img}
              key={(img as any).key}
              fadeState={this.props.scene.crossFade ? (img.src === imgs[0].src ? 'in' : 'out') : 'none'}
              fadeDuration={this.state.timeToNextFrame / 2}/>;
          })}
        </div>
      </div>
    );
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.advanceHack) {
      this.props.advanceHack.listener = () => {
        // advance, ignoring isPlaying status and not scheduling another
        this.advance(false, false, true);
      }
    }
    if (this.props.deleteHack) {
      this.props.deleteHack.listener = () => {
        // delete current image from historyPaths and readyToDisplay
        this.delete();
      }
    }
    this.start();
  }

  componentWillUnmount() {
    this._isMounted = false;
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
            state.timeoutID !== this.state.timeoutID ||
            props.hasStarted !== this.props.hasStarted ||
            props.allURLs !== this.props.allURLs ||
            props.historyOffset !== this.props.historyOffset ||
            props.strobe !== this.props.strobe ||
            props.strobeTime !== this.props.strobeTime);
  }

  componentWillReceiveProps(props: any) {
    if (!this.props.isPlaying && props.isPlaying) {
      this.start();
    } else if (!props.isPlaying && this.state.timeoutID != 0) {
      clearTimeout(this.state.timeoutID);
      this.setState({timeoutID: 0});
    }
  }

  componentDidUpdate(props: any) {
    if (props.allURLs == null && this.props.allURLs != null) {
      this.start();
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

    for (let i = 0; i < this.props.maxLoadingAtOnce; i++) {
      this.runFetchLoop(i, true);
    }

    this.advance(true, true);
  }

  runFetchLoop(i: number, isStarting = false) {
    if (!this._isMounted && !isStarting) return;

    const source = getRandomListItem(Array.from(this.props.allURLs.keys()));
    const collection = this.props.allURLs.get(source);

    if (this.state.readyToDisplay.length >= this.props.maxLoadingAtOnce ||
      !(collection && collection.length)) {
      // Wait for the display loop to use an image (it might be fast, or paused)
      setTimeout(() => this.runFetchLoop(i), 100);
      return;
    }
    const url = getRandomListItem(collection);
    const img = new Image();
    img.setAttribute("source", source);

    this.setState({numBeingLoaded: this.state.numBeingLoaded + 1});

    const successCallback = () => {
      if (!this._isMounted) return;
      if (this.props.onLoaded && this.state.historyPaths.length == 0) {
        this.props.onLoaded();
      }
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
      setTimeout(this.runFetchLoop.bind(this, i), 0);
    };

    function toArrayBuffer(buf: Buffer) {
      let ab = new ArrayBuffer(buf.length);
      let view = new Uint8Array(ab);
      for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
      }
      return ab;
    }

    img.onload = () => {
      // images may load immediately, but that messes up the setState()
      // lifecycle, so always load on the next event loop iteration.
      // Also, now  we know the image size, so we can finally filter it.
      if (img.width < this.props.config.displaySettings.minImageSize
        || img.height < this.props.config.displaySettings.minImageSize) {
        setTimeout(errorCallback, 0);
      } else {
        if (this.props.config.caching.enabled) {
          const fileType = getSourceType(img.src);
          if (fileType != ST.local) {
            const cachePath = getCachePath(null, this.props.config);
            if (!fs.existsSync(cachePath)) {
              fs.mkdirSync(cachePath)
            }
            const maxSize = this.props.config.caching.maxSize;
            const sourceCachePath = getCachePath(img.getAttribute("source"), this.props.config);
            const filePath = sourceCachePath + getFileName(img.src);
            const downloadImage = () => {
              if (!fs.existsSync(filePath)) {
                wretch(img.src)
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
        setTimeout(successCallback, 0);
      }
    };

    img.onerror = () => {
      setTimeout(errorCallback, 0);
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

  advance(isStarting = false, schedule = true, ignoreIsPlayingStatus = false) {
    let nextHistoryPaths = this.state.historyPaths;
    let nextImg: HTMLImageElement;
    if (this.state.readyToDisplay.length) {
      nextImg = this.state.readyToDisplay.shift();
      nextHistoryPaths = nextHistoryPaths.concat([nextImg]);
    } else if (this.state.historyPaths.length) {
      // no new image ready; just pick a random one from the past 120
      nextImg = getRandomListItem(this.state.historyPaths);
      nextHistoryPaths = nextHistoryPaths.concat([nextImg]);
    }
    while (nextHistoryPaths.length > this.props.maxInMemory) {
      nextHistoryPaths.shift();
    }

    // bail if dead
    if (!(isStarting || ignoreIsPlayingStatus || (this.props.isPlaying && this._isMounted))) return;

    this.setState({
      historyPaths: nextHistoryPaths,
    });
    this.props.setHistoryPaths(nextHistoryPaths);

    if (!schedule) return;

    let timeToNextFrame: number = 0;
    if (this.props.scene.timingFunction === TF.constant) {
      timeToNextFrame = parseInt(this.props.scene.timingConstant, 10);
      // If we cannot parse this, default to 1s
      if (!timeToNextFrame && timeToNextFrame != 0) {
        timeToNextFrame = 1000;
      }
    } else {
      timeToNextFrame = TIMING_FUNCTIONS.get(this.props.scene.timingFunction)();
    }
    if (nextImg && nextImg.getAttribute("duration") && timeToNextFrame < parseInt(nextImg.getAttribute("duration"))) {
      timeToNextFrame = parseInt(nextImg.getAttribute("duration"));
    }
    this.setState({
      timeToNextFrame,
      timeoutID: setTimeout(this.advance.bind(this, false, true), timeToNextFrame),
    });
  }
};
