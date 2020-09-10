import * as React from 'react';
import {animated, useTransition} from "react-spring";

import {HTF, TF, VTF} from "../../data/const";
import Scene from "../../data/Scene";

export default class Panning extends React.Component {
  readonly props: {
    togglePan: boolean,
    timeToNextFrame: number,
    scene: Scene,
    panFunction: Function,
    children?: React.ReactNode,
  };

  readonly state = {
    togglePan: false,
    duration: this.getDuration(),
  };

  _panTimeout: NodeJS.Timeout = null;
  _panOut = false;

  render() {
    if (this.props.scene.panning) {
      return (
        <this.PanningLayer>
          {this.props.children}
        </this.PanningLayer>
      );
    } else {
      return this.props.children;
    }
  }


  _lastToggle: any = null;
  PanningLayer = (data: {children: React.ReactNode}) => {
    const sceneTiming = this.props.scene.panTF == TF.scene;
    if (this.props.togglePan != this._lastToggle) {
      this._panOut = false;
      this._lastToggle = this.props.togglePan;
    }
    let panTransitions: [{ item: any, props: any, key: any }];

    let horizTransLevel = 0;
    if (this.props.scene.panHorizTransType != HTF.none) {
      horizTransLevel = this.props.scene.panHorizTransLevel;
      if (this.props.scene.panHorizTransRandom) {
        horizTransLevel = Math.floor(Math.random() * (this.props.scene.panHorizTransLevelMax - this.props.scene.panHorizTransLevelMin + 1)) + this.props.scene.panHorizTransLevelMin;
      }
      if (this.props.scene.panHorizTransType == HTF.left) {
        horizTransLevel = -horizTransLevel;
      } else if (this.props.scene.panHorizTransType == HTF.right) {
        // Already set
      } else if (this.props.scene.panHorizTransType == HTF.random) {
        const type = Math.floor(Math.random() * 2);
        if (type) {
          horizTransLevel = -horizTransLevel;
        } else {
          // Alreaedy set
        }
      }
    }

    let vertTransLevel = 0;
    if (this.props.scene.panVertTransType != VTF.none) {
      vertTransLevel = this.props.scene.panVertTransLevel;
      if (this.props.scene.panVertTransRandom) {
        vertTransLevel = Math.floor(Math.random() * (this.props.scene.panVertTransLevelMax - this.props.scene.panVertTransLevelMin + 1)) + this.props.scene.panVertTransLevelMin;
      }
      if (this.props.scene.panVertTransType == VTF.up) {
        vertTransLevel = -vertTransLevel;
      } else if (this.props.scene.panVertTransType == VTF.down) {
        // Already set
      } else if (this.props.scene.panVertTransType == VTF.random) {
        const type = Math.floor(Math.random() * 2);
        if (type) {
          vertTransLevel = -vertTransLevel;
        } else {
          // Already set
        }
      }
    }

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
            transform: this._panOut ? 'translate(' + horizTransLevel + '%, ' + vertTransLevel + '%)' : 'translate(' + horizTransLevelNeg + '%, ' + vertTransLevelNeg + '%)',
          },
          enter: {
            transform: this._panOut ? 'translate(' + horizTransLevelNeg + '%, ' + vertTransLevelNeg + '%)' : 'translate(' + horizTransLevel + '%, ' + vertTransLevel + '%)',
          },
          leave: {
            transform: this._panOut ? 'translate(' + horizTransLevel + '%, ' + vertTransLevel + '%)' : 'translate(' + horizTransLevelNeg + '%, ' + vertTransLevelNeg + '%)',
          },
          config: {
            duration: this.getDuration(),
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
            transform: this.state.togglePan ? 'translate(' + horizTransLevel + '%, ' + vertTransLevel + '%)' : 'translate(' + horizTransLevelNeg + '%, ' + vertTransLevelNeg + '%)',
          },
          enter: {
            transform: this.state.togglePan ? 'translate(' + horizTransLevelNeg + '%, ' + vertTransLevelNeg + '%)' : 'translate(' + horizTransLevel + '%, ' + vertTransLevel + '%)',
          },
          leave: {
            transform: this.state.togglePan ? 'translate(' + horizTransLevel + '%, ' + vertTransLevel + '%)' : 'translate(' + horizTransLevelNeg + '%, ' + vertTransLevelNeg + '%)',
          },
          config: {
            duration: this.state.duration,
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

  pan() {
    const duration = this.getDuration();
    this.setState({togglePan: !this.state.togglePan, duration: duration});
    this.props.panFunction();
    return duration;
  }

  panLoop() {
    const delay = this.pan();
    this._panTimeout = setTimeout(this.panLoop.bind(this), delay);
  }

  componentDidMount() {
    this._panOut = false;
    if (this.props.scene.panning && this.props.scene.panTF != TF.scene) {
      this.panLoop();
    }
  }

  componentDidUpdate(props: any) {
    if (this.props.scene.panning && this.props.scene.panTF != props.scene.panTF) {
      clearTimeout(this._panTimeout);
      if (this.props.scene.panTF != TF.scene) {
        this.panLoop();
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
        const bpmMulti = this.props.scene.panBPMMulti > 0 ? this.props.scene.panBPMMulti : 1 / (-1 * (this.props.scene.panBPMMulti - 2));
        const bpm = this.props.scene.audios.length > 0 ? this.props.scene.audios[0].bpm : 60;
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