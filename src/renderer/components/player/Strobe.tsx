import * as React from 'react';
import {animated, useTransition} from "react-spring";

import {SL, TF} from "../../data/const";
import Scene from "../../data/Scene";

export default class Strobe extends React.Component {
  readonly props: {
    zIndex: number,
    toggleStrobe: boolean,
    timeToNextFrame: number,
    scene: Scene,
    strobeFunction?: Function,
    children?: React.ReactNode,
  };

  readonly state = {
    toggleStrobe: false,
    duration: this.getDuration(),
    delay: 0,
  };

  _strobeTimeout: NodeJS.Timeout = null;

  render() {
    return (
      <this.StrobeLayer>
        {this.props.children}
      </this.StrobeLayer>
    );
  }

  StrobeLayer = (data: {children: React.ReactNode}) => {
    const strobeTransitions: [{ item: any, props: any, key: any }] = useTransition(
      this.state.toggleStrobe,
      (toggle: any) => {
        return toggle
      },
      {
        from: {
          backgroundColor: this.props.scene.strobeLayer == SL.image ? "" : this.props.scene.strobeColor,
          opacity: this.props.scene.strobeLayer == SL.bottom ? this.props.scene.strobeOpacity : 1,
        },
        enter: {
          opacity: 0,
        },
        leave: {
          opacity: 0,
        },
        reset: true,
        unique: true,
        config: {
          duration: this.props.scene.strobeTime,
        },
      }
    );

    return (
      <React.Fragment>
        {strobeTransitions.map(({item, props, key}) => {
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
                zIndex: this.props.zIndex,
                ...props
              }}>
              {data.children}
            </animated.div>
          );
        })}
      </React.Fragment>
    );
  };

  strobe() {
    const duration = this.getDuration();
    const delay = this.props.scene.strobePulse ? this.getDelay() : duration;
    this.setState({toggleStrobe: !this.state.toggleStrobe, duration: duration, delay: delay});
    if (this.props.strobeFunction) {
      this.props.strobeFunction();
    }
    return delay;
  }

  strobeLoop() {
    const delay = this.strobe();
    this._strobeTimeout = setTimeout(this.strobeLoop.bind(this), delay);
  }

  componentDidMount() {
    if (this.props.scene.strobePulse ? this.props.scene.strobeDelayTF != TF.scene : this.props.scene.strobeTF != TF.scene) {
      this.strobeLoop();
    }
  }

  componentDidUpdate(props: any) {
    if (this.props.scene.strobeTF != props.scene.strobeTF || this.props.scene.strobeDelayTF != props.scene.strobeDelayTF || this.props.scene.strobePulse != props.scene.strobePulse) {
      clearTimeout(this._strobeTimeout);
      if (this.props.scene.strobePulse ? this.props.scene.strobeDelayTF != TF.scene : this.props.scene.strobeTF != TF.scene) {
        this.strobeLoop();
      }
    }
    if ((this.props.scene.strobePulse ? this.props.scene.strobeDelayTF == TF.scene : this.props.scene.strobeTF == TF.scene) && this.props.toggleStrobe != props.toggleStrobe) {
      this.strobe();
    }
  }

  shouldComponentUpdate(props: any, state: any) {
    return true;
  }

  componentWillUnmount() {
    clearTimeout(this._strobeTimeout);
    this._strobeTimeout = null;
  }

  getDuration() {
    let duration;
    switch (this.props.scene.strobeTF) {
      case TF.constant:
        duration = Math.max(this.props.scene.strobeTime, 10);
        break;
      case TF.random:
        duration = Math.floor(Math.random() * (Math.max(this.props.scene.strobeTimeMax, 10) - Math.max(this.props.scene.strobeTimeMin, 10) + 1)) + Math.max(this.props.scene.strobeTimeMin, 10);
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.strobeSinRate - 100) + 2) * 1000;
        duration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (Math.max(this.props.scene.strobeTimeMax, 10) - Math.max(this.props.scene.strobeTimeMin, 10) + 1)) + Math.max(this.props.scene.strobeTimeMin, 10);
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.strobeBPMMulti > 0 ? this.props.scene.strobeBPMMulti : 1 / (-1 * (this.props.scene.strobeBPMMulti - 2));
        duration = 60000 / (this.props.scene.bpm * bpmMulti);
        // If we cannot parse this, default to 1s
        if (!duration) {
          duration = 1000;
        }
        break;
      case TF.scene:
        duration = this.props.timeToNextFrame;
    }
    return duration;
  }

  getDelay() {
    let delay;
    switch (this.props.scene.strobeDelayTF) {
      case TF.constant:
        delay = this.props.scene.strobeDelay;
        break;
      case TF.random:
        delay = Math.floor(Math.random() * (this.props.scene.strobeDelayMax - this.props.scene.strobeDelayMin + 1)) + this.props.scene.strobeDelayMin;
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.strobeDelaySinRate - 100) + 2) * 1000;
        delay = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.strobeDelayMax - this.props.scene.strobeDelayMin + 1)) + this.props.scene.strobeDelayMin;
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.strobeDelayBPMMulti > 0 ? this.props.scene.strobeDelayBPMMulti : 1 / (-1 * (this.props.scene.strobeDelayBPMMulti - 2));
        delay = 60000 / (this.props.scene.bpm * bpmMulti);
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