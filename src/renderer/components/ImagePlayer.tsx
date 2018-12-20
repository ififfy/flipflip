import * as React from 'react';
import * as ReactDOM from 'react-dom';

import fileURL from 'file-url';

import ImageView from './ImageView';
import TIMING_FUNCTIONS from '../TIMING_FUNCTIONS';

function choice<T>(items: Array<T>): T {
  const i = Math.floor(Math.random() * items.length);
  return items[i];
}

export default class ImagePlayer extends React.Component {
  readonly props: {
    maxInMemory: Number,
    maxLoadingAtOnce: Number,
    maxToRememberInHistory: Number,
    allPaths: Array<Array<string>>,
    isPlaying: boolean,
    timingFunction: string,
    historyOffset: number,
    setHistoryLength: (historyLength: number) => void,
  }

  readonly state = {
    numBeingLoaded: 0,
    pastAndLatest: Array<HTMLImageElement>(),
    readyToDisplay: Array<HTMLImageElement>(),
    historyPaths: Array<string>(),
  }

  _isMounted = false;

  render() {
    if (this.state.pastAndLatest.length < 1) return <div className="ImagePlayer m-empty" />;

    let img = this.state.pastAndLatest[this.state.pastAndLatest.length - 1];

    // if user is browsing history, use that image instead
    if (this.state.historyPaths.length > 0 && !this.props.isPlaying && this.props.historyOffset < 0) {
      let offset = this.props.historyOffset;
      // if user went too far off the end, just loop to the front again
      while (offset < -this.state.historyPaths.length) {
        offset += this.state.historyPaths.length;
      }
      img = new Image();
      img.src = this.state.historyPaths[this.state.historyPaths.length + offset];
    }

    return (
      <div className="ImagePlayer">
        <div className="u-fill-container u-fill-image-blur" style={{
          backgroundImage: `url("${img.src}")`,
        }}>
        </div>
        <ImageView img={img} />
      </div>
    );
  }

  componentDidMount() {
    this._isMounted = true;
    this.start();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(props: any) {
    if (!this.props.isPlaying && props.isPlaying) {
      this.start();
    }
  }

  start() {
    for (let i=0; i<this.props.maxLoadingAtOnce; i++) {
      this.runFetchLoop(i, true);
    }

    this.advance(true, true);
  }

  runFetchLoop(i: Number, isStarting = false) {
    if (!this._isMounted && !isStarting) return;

    // We either get one giant list of paths, or one list per directory,
    // depending on scene.weightDirectoriesEqually
    const collection = choice(this.props.allPaths);

    if (this.state.readyToDisplay.length >= this.props.maxLoadingAtOnce ||
      !(collection && collection.length)) {
      // Wait for the display loop to use an image (it might be fast, or paused)
      setTimeout(() => this.runFetchLoop(i), 100);
      return;
    }
    const path = choice(collection);
    const url: string = fileURL(path);
    const img = new Image();

    this.setState({numBeingLoaded: this.state.numBeingLoaded + 1});

    img.onload = () => {
      // images may load immediately, but that messes up the setState()
      // lifecycle, so always load on the next event loop iteration
      setTimeout(() => {
        if (!this._isMounted) return;
        this.setState({
          readyToDisplay: this.state.readyToDisplay.concat([img]),
          numBeingLoaded: Math.max(0, this.state.numBeingLoaded - 1),
        });
        if (this.state.pastAndLatest.length === 0) {
          this.advance(false, false);
        }
        this.runFetchLoop(i);
      }, 0);
    };

    img.onerror = () => {
      setTimeout(() => {
        if (!this._isMounted) return;
        this.setState({
          numBeingLoaded: Math.max(0, this.state.numBeingLoaded - 1),
        });
        setTimeout(this.runFetchLoop.bind(this, i), 0);
      }, 0);
    };

    img.src = url;
  }

  advance(isStarting = false, schedule = true) {
    let nextPastAndLatest = this.state.pastAndLatest;
    let nextHistoryPaths = this.state.historyPaths;
    if (this.state.readyToDisplay.length) {
      const nextImg = this.state.readyToDisplay.shift();
      nextPastAndLatest = nextPastAndLatest.concat([nextImg]);
      nextHistoryPaths = nextHistoryPaths.concat([nextImg.src]);
    } else if (this.state.pastAndLatest.length) {
      // no new image ready; just pick a random one from the past 120
      const nextImg = choice(this.state.pastAndLatest);
      nextPastAndLatest = nextPastAndLatest.concat([nextImg]);
      nextHistoryPaths = nextHistoryPaths.concat([nextImg.src]);
    }
    while (nextPastAndLatest.length > this.props.maxInMemory) {
      nextPastAndLatest.shift();
      nextHistoryPaths.shift();
    }

    if (isStarting || (this.props.isPlaying && this._isMounted)) {
      this.setState({
        pastAndLatest: nextPastAndLatest,
        historyPaths: nextHistoryPaths,
      });
      this.props.setHistoryLength(nextHistoryPaths.length);

      if (schedule) {
        setTimeout(
          this.advance.bind(this, false, true),
          TIMING_FUNCTIONS.get(this.props.timingFunction)());
      }
    }
  }
};