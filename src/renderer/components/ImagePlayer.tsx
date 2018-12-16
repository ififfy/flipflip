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
  }

  readonly state = {
    numBeingLoaded: 0,
    pastAndLatest: Array<HTMLImageElement>(),
    readyToDisplay: Array<HTMLImageElement>(),
    historyPaths: Array<string>(),
  }

  _isMounted = false;

  render() {
    return (
      <div className="ImagePlayer">
        {this.state.pastAndLatest.length > 0 && (
          <ImageView img={this.state.pastAndLatest[this.state.pastAndLatest.length - 1]} />
        )}
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

    if (this.state.readyToDisplay.length >= this.props.maxLoadingAtOnce) {
      // Wait for the display loop to use an image (it might be fast, or paused)
      setTimeout(() => this.runFetchLoop(i), 100);
      return;
    }

    console.log("running", i, this.state);

    this.setState({numBeingLoaded: this.state.numBeingLoaded + 1});

    // We either get one giant list of paths, or one list per directory,
    // depending on scene.weightDirectoriesEqually
    const collection = choice(this.props.allPaths);
    const path = choice(collection);
    const url: string = fileURL(path);
    const img = new Image();

    img.onload = () => {
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
    if (this.state.readyToDisplay.length) {
      nextPastAndLatest = nextPastAndLatest.concat([this.state.readyToDisplay.shift()]);
    } else if (this.state.pastAndLatest.length) {
      nextPastAndLatest = nextPastAndLatest.concat([choice(this.state.pastAndLatest)]);
    }
    while (nextPastAndLatest.length > this.props.maxInMemory) {
      nextPastAndLatest.shift();
    }

    if (this.props.isPlaying && (this._isMounted || isStarting)) {
      this.setState({pastAndLatest: nextPastAndLatest});

      if (schedule) {
        setTimeout(
          this.advance.bind(this, false, true),
          TIMING_FUNCTIONS.get(this.props.timingFunction)());
      }
    }
  }
};