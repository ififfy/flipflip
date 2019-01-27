import * as React from 'react';

import ImageView from './ImageView';
import TIMING_FUNCTIONS from '../../TIMING_FUNCTIONS';
import {IF, TF, ZF, HTF, VTF, BT} from '../../const';
import fs from "fs";
import gifInfo from 'gif-info';
import ChildCallbackHack from './ChildCallbackHack';
import urlToPath from '../../urlToPath';
import { isNull, isNullOrUndefined } from 'util';

function choice<T>(items: Array<T>): T {
  const i = Math.floor(Math.random() * items.length);
  return items[i];
}

export default class ImagePlayer extends React.Component {
  readonly props: {
    advanceHack?: ChildCallbackHack,
    maxInMemory: number,
    maxLoadingAtOnce: number,
    maxToRememberInHistory: number,
    allURLs: Array<Array<string>>,
    isPlaying: boolean,
    timingFunction: string,
    timingConstant: string,
    zoomType: string,
    backgroundType : string;   // Background blurred image or color
    backgroundColor : string;  // color name or number 
    effectLevel: number,
    horizTransType: string,
    vertTransType: string,
    imageTypeFilter: string,
    historyOffset: number,
    fadeEnabled: boolean,
    playFullGif: boolean;
    imageSizeMin: number,
    setHistoryPaths: (historyPaths: string[]) => void,
    onLoaded: () => void,
  };

  readonly state = {
    numBeingLoaded: 0,
    pastAndLatest: Array<HTMLImageElement>(),
    readyToDisplay: Array<HTMLImageElement>(),
    historyPaths: Array<string>(),
    timeToNextFrame: 0,
    timeoutID: 0,
    nextImageID: 0,
  };

  _isMounted = false;

  render() {
    if (this.state.pastAndLatest.length < 1) return <div className="ImagePlayer m-empty" />;

    const imgs = Array<HTMLImageElement>();

    // if user is browsing history, use that image instead
    if (this.state.historyPaths.length > 0 && !this.props.isPlaying) {
      let offset = this.props.historyOffset;
      if (offset <= -this.state.historyPaths.length) {
        offset = -this.state.historyPaths.length + 1;
      }
      const img = new Image();
      img.src = this.state.historyPaths[(this.state.historyPaths.length - 1) + offset];
      imgs.push(img);
    } else {
      const max = this.props.fadeEnabled ? 3 : 2;
      for (let i=1; i<max; i++) {
        const img = this.state.pastAndLatest[this.state.pastAndLatest.length - i];
        if (img) {
          imgs.push(img);
        }
      }
    }

    let className = "ImagePlayer translate-";

    switch (this.props.horizTransType) {
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
    switch (this.props.vertTransType) {
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
    switch (this.props.zoomType) {
      case ZF.none:
        className += `${this.props.effectLevel}s`;
        break;
      case ZF.in:
        className += `zoom-${this.props.effectLevel}s`;
        break;
      case ZF.out:
        className += `zoom-out-${this.props.effectLevel}s`;
    }


    // prepare the background
    let backgroundDiv;
    switch (this.props.backgroundType) {
      case BT.color:
        backgroundDiv = <div className="u-fill-container" style={{ background: this.props.backgroundColor, }}></div>;
        break;
      default:
        backgroundDiv = <div className="u-fill-container u-fill-image-blur" style={{ backgroundImage: `url("${imgs[0].src}")`, }}></div>;
    }

    return (
      <div className={className}>
        {backgroundDiv}
        {imgs.map((img) => {
          return <ImageView
            img={img}
            key={(img as any).key}
            fadeState={this.props.fadeEnabled ? (img.src === imgs[0].src ? 'in' : 'out') : 'none'}
            fadeDuration={this.state.timeToNextFrame / 2} />;
        })}
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
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.props.advanceHack) {
      this.props.advanceHack.listener = null;
    }
  }

  componentWillReceiveProps(props: any) {
    if (!this.props.isPlaying && props.isPlaying) {
      this.start();
    } else if (!props.isPlaying && this.state.timeoutID != 0) {
      clearTimeout(this.state.timeoutID);
      this.setState({timeoutID: 0});
    }
  }

  start() {
    for (let i=0; i<this.props.maxLoadingAtOnce; i++) {
      this.runFetchLoop(i, true);
    }

    this.advance(true, true);
  }

  runFetchLoop(i: number, isStarting = false) {
    if (!this._isMounted && !isStarting) return;

    // We either get one giant list of paths, or one list per directory,
    // depending on scene.weightDirectoriesEqually
    const collection = choice(this.props.allURLs);

    if (this.state.readyToDisplay.length >= this.props.maxLoadingAtOnce ||
      !(collection && collection.length)) {
      // Wait for the display loop to use an image (it might be fast, or paused)
      setTimeout(() => this.runFetchLoop(i), 100);
      return;
    }
    const url = choice(collection);
    const img = new Image();

    this.setState({numBeingLoaded: this.state.numBeingLoaded + 1});

    const successCallback = () => {
      if (!this._isMounted) return;
      if (this.props.onLoaded && this.state.historyPaths.length == 1) {
        this.props.onLoaded();
      }
      (img as any).key = this.state.nextImageID;
      this.setState({
        readyToDisplay: this.state.readyToDisplay.concat([img]),
        numBeingLoaded: Math.max(0, this.state.numBeingLoaded - 1),
        nextImageID: this.state.nextImageID + 1,
      });
      if (this.state.pastAndLatest.length === 0) {
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

    function toArrayBuffer(buf : Buffer) {
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
      if (img.width < this.props.imageSizeMin || img.height < this.props.imageSizeMin) {
        console.log("Skipping tiny image at", img.src);
        setTimeout(errorCallback, 0);
      } else {
        setTimeout(successCallback, 0);
      }
    };

    img.onerror = () => {
      setTimeout(errorCallback, 0);
    };

    // Filter gifs by animation
    if (url.toLocaleLowerCase().endsWith('.gif')) {
      // Get gif info. See https://github.com/Prinzhorn/gif-info
      try {
        let info = gifInfo(toArrayBuffer(fs.readFileSync(urlToPath(url))));

        // If gif is animated and we want to play entire length, store its duration
        if (info.animated && this.props.playFullGif) {
          img.alt=info.duration;
        }

        // Exclude non-animated gifs from gifs
        if (this.props.imageTypeFilter == IF.gifs && !info.animated) {
          this.runFetchLoop(i);
          return;
        // Exclude animated gifs from stills
        } else if (this.props.imageTypeFilter == IF.stills && info.animated) {
          this.runFetchLoop(i);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    img.src = url;
  }

  advance(isStarting = false, schedule = true, ignoreIsPlayingStatus = false) {
    let nextPastAndLatest = this.state.pastAndLatest;
    let nextHistoryPaths = this.state.historyPaths;
    let nextImg : HTMLImageElement;
    if (this.state.readyToDisplay.length) {
      nextImg = this.state.readyToDisplay.shift();
      nextPastAndLatest = nextPastAndLatest.concat([nextImg]);
      nextHistoryPaths = nextHistoryPaths.concat([nextImg.src]);
    } else if (this.state.pastAndLatest.length) {
      // no new image ready; just pick a random one from the past 120
      nextImg = choice(this.state.pastAndLatest);
      nextPastAndLatest = nextPastAndLatest.concat([nextImg]);
      nextHistoryPaths = nextHistoryPaths.concat([nextImg.src]);
    }
    while (nextPastAndLatest.length > this.props.maxInMemory) {
      nextPastAndLatest.shift();
      nextHistoryPaths.shift();
    }

    // bail if dead
    if (!(isStarting || ignoreIsPlayingStatus || (this.props.isPlaying && this._isMounted))) return;

    this.setState({
      pastAndLatest: nextPastAndLatest,
      historyPaths: nextHistoryPaths,
    });
    this.props.setHistoryPaths(nextHistoryPaths);

    if (!schedule) return;

    let timeToNextFrame: number = 0;
    if (this.props.timingFunction === TF.constant) {
      timeToNextFrame = parseInt(this.props.timingConstant, 10);
      // If we cannot parse this, default to 1s
      if (!timeToNextFrame && timeToNextFrame != 0) {
        timeToNextFrame = 1000;
      }
    } else {
      timeToNextFrame = TIMING_FUNCTIONS.get(this.props.timingFunction)();
    }
    if (nextImg && nextImg.alt && timeToNextFrame < parseInt(nextImg.alt)) {
      timeToNextFrame = parseInt(nextImg.alt);
    }
    this.setState({
      timeToNextFrame,
      timeoutID: setTimeout(this.advance.bind(this, false, true), timeToNextFrame),
    });
  }
};
