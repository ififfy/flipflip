import * as React from 'react';
import {animated, useTransition} from "react-spring";

import {HTF, TF, VTF} from "../../data/const";
import {getEaseFunction} from "../../data/utils";
import Scene from "../../data/Scene";
import Audio from "../../data/Audio";

export default class Panning extends React.Component {
  readonly props: {
    togglePan: boolean,
    currentAudio: Audio,
    timeToNextFrame: number,
    scene: Scene,
    panFunction: Function,
    image?: HTMLImageElement | HTMLVideoElement,
    children?: React.ReactNode,
  };

  readonly state = {
    togglePan: false,
    duration: this.getDuration(),
  };

  _panTimeout: NodeJS.Timeout = null;
  _panOut = false;

  render() {
    // TODO Fix with TF.scene
    return (
      <this.PanningLayer>
        {this.props.children}
      </this.PanningLayer>
    );
  }


  _lastToggle: any = null;
  _lastHorizRandom: number = 0;
  _lastVertRandom: number = 0;
  PanningLayer = (data: {children: React.ReactNode}) => {
    const sceneTiming = this.props.scene.panTF == TF.scene;
    if (this.props.togglePan != this._lastToggle) {
      this._panOut = false;
      this._lastToggle = this.props.togglePan;
    }
    let panTransitions: [{ item: any, props: any, key: any }];
    const image = this.props.image;

    let horizTransLevel = 0;
    let horizPix = false;
    if (this.props.scene.panHorizTransType != HTF.none) {
      if (image && this.props.scene.panHorizTransImg) {
        const height = image.offsetHeight;
        const width = image.offsetWidth;
        const parentHeight = window.innerHeight;
        const parentWidth = window.innerWidth;
        const heightDiff = Math.max(height - parentHeight, 0);
        const widthDiff = Math.max(width - parentWidth - heightDiff, 0);
        horizTransLevel = widthDiff / 2;
        horizPix = true;
      } else {
        horizTransLevel = this.props.scene.panHorizTransLevel;
        if (this.props.scene.panHorizTransRandom) {
          horizTransLevel = Math.floor(Math.random() * (this.props.scene.panHorizTransLevelMax - this.props.scene.panHorizTransLevelMin + 1)) + this.props.scene.panHorizTransLevelMin;
        }
      }
      if (this.props.scene.panHorizTransType == HTF.left) {
        horizTransLevel = -horizTransLevel;
      } else if (this.props.scene.panHorizTransType == HTF.right) {
        // Already set
      } else if (this.props.scene.panHorizTransType == HTF.random) {
        if ((sceneTiming && this._panOut) || (!sceneTiming && this.state.togglePan)) {
          const type = Math.floor(Math.random() * 2);
          if (type) {
            horizTransLevel = -horizTransLevel;
          } else {
            // Already set
          }
          this._lastHorizRandom = type;
        } else {
          if (this._lastHorizRandom == 0) {
            // Already set
          } else {
            horizTransLevel = -horizTransLevel;
          }
        }
      }
    }
    const horizSuffix = horizPix ? "px" : "%";

    let vertTransLevel = 0;
    let vertPix = false;
    if (this.props.scene.panVertTransType != VTF.none) {
      if (image && this.props.scene.panVertTransImg) {
        const height = image.offsetHeight;
        const width = image.offsetWidth;
        const parentHeight = window.innerHeight;
        const parentWidth = window.innerWidth;
        const widthDiff = Math.max(width - parentWidth, 0);
        const heightDiff = Math.max(height - parentHeight - widthDiff, 0);
        vertTransLevel = heightDiff / 2;
        vertPix = true;
      } else {
        vertTransLevel = this.props.scene.panVertTransLevel;
        if (this.props.scene.panVertTransRandom) {
          vertTransLevel = Math.floor(Math.random() * (this.props.scene.panVertTransLevelMax - this.props.scene.panVertTransLevelMin + 1)) + this.props.scene.panVertTransLevelMin;
        }
      }
      if (this.props.scene.panVertTransType == VTF.up) {
        vertTransLevel = -vertTransLevel;
      } else if (this.props.scene.panVertTransType == VTF.down) {
        // Already set
      } else if (this.props.scene.panVertTransType == VTF.random) {
        if ((sceneTiming && this._panOut) || (!sceneTiming && this.state.togglePan)) {
          const type = Math.floor(Math.random() * 2);
          if (type) {
            vertTransLevel = -vertTransLevel;
          } else {
            // Already set
          }
          this._lastVertRandom = type;
        } else {
          if (this._lastVertRandom == 0) {
            // Already set
          } else {
            vertTransLevel = -vertTransLevel;
          }
        }
      }
    }
    const vertSuffix = vertPix ? "px" : "%";

    const horizTransLevelNeg = -horizTransLevel;
    const vertTransLevelNeg = -vertTransLevel;

    if (sceneTiming) {
      panTransitions = useTransition(
        this._panOut ? null : this.props.togglePan,
        (toggle: any) => {
          return toggle
        },
        {
          from: {
            transform: this._panOut ? 'translate(' + horizTransLevel + horizSuffix + ', ' + vertTransLevel + vertSuffix + ')' : 'translate(' + horizTransLevelNeg + horizSuffix + ', ' + vertTransLevelNeg + vertSuffix + ')',
          },
          enter: {
            transform: this._panOut ? 'translate(' + horizTransLevelNeg + horizSuffix + ', ' + vertTransLevelNeg + vertSuffix + ')' : 'translate(' + horizTransLevel + horizSuffix + ', ' + vertTransLevel + vertSuffix + ')',
          },
          leave: {
            transform: this._panOut ? 'translate(' + horizTransLevel + horizSuffix + ', ' + vertTransLevel + vertSuffix + ')' : 'translate(' + horizTransLevelNeg + horizSuffix + ', ' + vertTransLevelNeg + vertSuffix + ')',
          },
          config: {
            duration: this.getDuration(),
            easing : this._panOut ? getEaseFunction(this.props.scene.panEndEase, this.props.scene.panEndExp, this.props.scene.panEndAmp, this.props.scene.panEndPer, this.props.scene.panEndOv) :
              getEaseFunction(this.props.scene.panStartEase, this.props.scene.panStartExp, this.props.scene.panStartAmp, this.props.scene.panStartPer, this.props.scene.panStartOv)
          },
        }
      );
      clearTimeout(this._panTimeout);
      if (this._panOut) {
        this.props.panFunction();
        this._panTimeout = setTimeout(() => {
          this._panOut = false;1
        }, this.getDuration());
      } else {
        this._panTimeout = setTimeout(() => {
          this._panOut = true;
          this.setState({togglePan: !this.state.togglePan});
        }, this.getDuration());
      }
    } else {
      panTransitions = useTransition(
        this.state.togglePan,
        (toggle: any) => {
          return toggle
        },
        {
          from: {
            transform: this.state.togglePan ? 'translate(' + horizTransLevelNeg + horizSuffix + ', ' + vertTransLevelNeg + vertSuffix + ')' : 'translate(' + horizTransLevel + horizSuffix + ', ' + vertTransLevel + vertSuffix + ')',
          },
          enter: {
            transform: this.state.togglePan ? 'translate(' + horizTransLevel + horizSuffix + ', ' + vertTransLevel + vertSuffix + ')' : 'translate(' + horizTransLevelNeg + horizSuffix + ', ' + vertTransLevelNeg + vertSuffix + ')',
          },
          leave: {
            transform: this.state.togglePan ? 'translate(' + horizTransLevelNeg + horizSuffix + ', ' + vertTransLevelNeg + vertSuffix + ')' : 'translate(' + horizTransLevel + horizSuffix + ', ' + vertTransLevel + vertSuffix + ')',
          },
          config: {
            duration: this.state.duration,
            easing : this.state.togglePan ? getEaseFunction(this.props.scene.panStartEase, this.props.scene.panStartExp, this.props.scene.panStartAmp, this.props.scene.panStartPer, this.props.scene.panStartOv) :
              getEaseFunction(this.props.scene.panEndEase, this.props.scene.panEndExp, this.props.scene.panEndAmp, this.props.scene.panEndPer, this.props.scene.panEndOv)
          },
        }
      );
    }

    return (
      <React.Fragment>
        {panTransitions.map(({item, props, key}) => {
          return (
            <animated.div
              key={key}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                overflow: 'hidden',
                zIndex: 2,
                ...props
              }}>
              {data.children}
            </animated.div>
          );
        })}
      </React.Fragment>
    );
  };

  panIn() {
    const duration = this.getDuration();
    this.setState({togglePan: true, duration: duration});
    this.props.panFunction();
    return duration;
  }

  panOut() {
    const duration = this.getDuration();
    this.setState({togglePan: false, duration: duration});
    this.props.panFunction();
    return duration;
  }

  panLoop(panIn: boolean) {
    const delay = panIn ? this.panIn() : this.panOut();
    this._panTimeout = setTimeout(this.panLoop.bind(this, !panIn), delay);
  }

  componentDidMount() {
    this._panOut = false;
    this._lastHorizRandom = 0;
    this._lastVertRandom = 0;
    if (this.props.scene.panning && this.props.scene.panTF != TF.scene) {
      this.panLoop(true);
    }
  }

  componentDidUpdate(props: any) {
    if (this.props.scene.panning && this.props.scene.panTF != props.scene.panTF) {
      clearTimeout(this._panTimeout);
      if (this.props.scene.panTF != TF.scene) {
        this.panLoop(true);
      }
    }
  }

  shouldComponentUpdate(props: any, state: any) {
    return !props.panning ||
      this.props.togglePan != props.togglePan ||
      this.state.togglePan != state.togglePan;
  }

  componentWillUnmount() {
    clearTimeout(this._panTimeout);
    this._panTimeout = null;
    this._panOut = null;
    this._lastToggle = null;
    this._lastHorizRandom = null;
    this._lastVertRandom = null;
  }

  getDuration() {
    let duration;
    switch (this.props.scene.panTF) {
      case TF.constant:
        duration = Math.max(this.props.scene.panDuration, 10);
        break;
      case TF.random:
        duration = Math.floor(Math.random() * (Math.max(this.props.scene.panDurationMax, 10) - Math.max(this.props.scene.panDurationMin, 10) + 1)) + Math.max(this.props.scene.panDurationMin, 10);
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.panSinRate - 100) + 2) * 1000;
        duration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (Math.max(this.props.scene.panDurationMax, 10) - Math.max(this.props.scene.panDurationMin, 10) + 1)) + Math.max(this.props.scene.panDurationMin, 10);
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.panBPMMulti / 10;
        const bpm = this.props.currentAudio ? this.props.currentAudio.bpm : 60;
        duration = 60000 / (bpm * bpmMulti);
        // If we cannot parse this, default to 1s
        if (!duration) {
          duration = 1000;
        }
        break;
      case TF.scene:
        duration = this.props.timeToNextFrame;
    }
    duration = duration / 2;
    return duration;
  }
}

(Panning as any).displayName="Panning";