import * as React from 'react';
import {animated, useTransition} from "react-spring";

import {SC, SL, TF} from "../../data/const";
import Scene from "../../data/Scene";

export default class FadeInOut extends React.Component {
  readonly props: {
    toggleFade: boolean,
    timeToNextFrame: number,
    scene: Scene,
    fadeFunction: Function,
    children?: React.ReactNode,
  };

  readonly state = {
    toggleFade: false,
    duration: this.getDuration(),
    delay: 0,
  };

  _fadeTimeout: NodeJS.Timeout = null;
  _fadeOut = false;

  render() {
    if (this.props.scene.fadeInOut) {
      return (
        <this.FadeInOutLayer>
          {this.props.children}
        </this.FadeInOutLayer>
      );
    } else {
      return this.props.children;
    }
  }


  _lastToggle: any = null;
  FadeInOutLayer = (data: {children: React.ReactNode}) => {
    const sceneTiming = this.props.scene.fadeIOTF == TF.scene;
    if (this.props.toggleFade != this._lastToggle) {
      this._fadeOut = false;
      this._lastToggle = this.props.toggleFade;
    }
    let fadeTransitions: [{ item: any, props: any, key: any }];
    if (sceneTiming) {
      fadeTransitions = useTransition(
        this._fadeOut ? null : this.props.toggleFade,
        (toggle: any) => {
          return toggle
        },
        {
          from: {
            opacity: this._fadeOut ? 1 : 0,
          },
          enter: {
            opacity: this._fadeOut ? 0 : 1,
          },
          leave: {
            opacity: this._fadeOut ? 1 : 0,
          },
          unique: true,
          config: {
            duration: this.getDuration(),
          },
        }
      );
      clearTimeout(this._fadeTimeout);
      if (this._fadeOut) {
        this.props.fadeFunction();
        this._fadeTimeout = setTimeout(() => {
          this._fadeOut = false;
        }, this.getDuration());
      } else {
        this._fadeTimeout = setTimeout(() => {
          this._fadeOut = true;
          this.setState({toggleFade: !this.state.toggleFade});
        }, this.getDuration());
      }
    } else {
      fadeTransitions = useTransition(
        this.state.toggleFade,
        (toggle: any) => {
          return toggle
        },
        {
          from: {
            opacity: this.state.toggleFade ? 0 : 1,
          },
          enter: {
            opacity: this.state.toggleFade ? 1 : 0,
          },
          leave: {
            opacity: this.state.toggleFade ? 0 : 1,
          },
          unique: true,
          config: {
            duration: this.state.duration,
          },
        }
      );
    }

    return (
      <React.Fragment>
        {fadeTransitions.map(({item, props, key}) => {
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

  fade() {
    const duration = this.getDuration();
    const delay = this.props.scene.fadeIOPulse ? this.getDelay() : duration;
    this.setState({toggleFade: !this.state.toggleFade, duration: duration, delay: delay});
    this.props.fadeFunction();
    return delay;
  }

  fadeLoop() {
    const delay = this.fade();
    this._fadeTimeout = setTimeout(this.fadeLoop.bind(this), delay);
  }

  componentDidMount() {
    this._fadeOut = false;
    if (this.props.scene.fadeInOut) {
      if (this.props.scene.fadeIOPulse ? this.props.scene.fadeIODelayTF != TF.scene : this.props.scene.fadeIOTF != TF.scene) {
        this.fadeLoop();
      }
    }
  }

  componentDidUpdate(props: any) {
    if (this.props.scene.fadeInOut) {
      if (this.props.scene.fadeIOTF != props.scene.fadeIOTF || this.props.scene.fadeIODelayTF != props.scene.fadeIODelayTF || this.props.scene.fadeIOPulse != props.scene.fadeIOPulse) {
        clearTimeout(this._fadeTimeout);
        if (this.props.scene.fadeIOPulse ? this.props.scene.fadeIODelayTF != TF.scene : this.props.scene.fadeIOTF != TF.scene) {
          this.fadeLoop();
        }
      }
    }
  }

  shouldComponentUpdate(props: any, state: any) {
    return !props.fadeInOut ||
      this.props.toggleFade != props.toggleFade ||
      this.state.toggleFade != state.toggleFade;
  }

  componentWillUnmount() {
    clearTimeout(this._fadeTimeout);
    this._fadeTimeout = null;
    this._fadeOut = null;
  }

  getDuration() {
    let duration;
    switch (this.props.scene.fadeIOTF) {
      case TF.constant:
        duration = Math.max(this.props.scene.fadeIODuration, 10);
        break;
      case TF.random:
        duration = Math.floor(Math.random() * (Math.max(this.props.scene.fadeIODurationMax, 10) - Math.max(this.props.scene.fadeIODurationMin, 10) + 1)) + Math.max(this.props.scene.fadeIODurationMin, 10);
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.fadeIOSinRate - 100) + 2) * 1000;
        duration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (Math.max(this.props.scene.fadeIODurationMax, 10) - Math.max(this.props.scene.fadeIODurationMin, 10) + 1)) + Math.max(this.props.scene.fadeIODurationMin, 10);
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.fadeIOBPMMulti / 10;
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

  getDelay() {
    let delay;
    switch (this.props.scene.fadeIODelayTF) {
      case TF.constant:
        delay = this.props.scene.fadeIODelay;
        break;
      case TF.random:
        delay = Math.floor(Math.random() * (this.props.scene.fadeIODelayMax - this.props.scene.fadeIODelayMin + 1)) + this.props.scene.fadeIODelayMin;
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.fadeIODelaySinRate - 100) + 2) * 1000;
        delay = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.fadeIODelayMax - this.props.scene.fadeIODelayMin + 1)) + this.props.scene.fadeIODelayMin;
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.fadeIODelayBPMMulti / 10;
        const bpm = this.props.scene.audios.length > 0 ? this.props.scene.audios[0].bpm : 60;
        delay = 60000 / (bpm * bpmMulti);
        // If we cannot parse this, default to 1s
        if (!delay) {
          delay = 1000;
        }
        break;
      case TF.scene:
        delay = this.props.timeToNextFrame;
    }
    return delay;
  }
}