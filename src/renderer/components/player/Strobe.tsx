import * as React from 'react';
import {animated, Transition} from "react-spring/renderprops";

import {TF} from "../../data/const";

export default class Strobe extends React.Component {
  readonly props: {
    className?: string,
    toggleStrobe: boolean,
    pulse: boolean,
    opacity: number,
    timeToNextFrame: number,
    durationTF: string,
    duration: number,
    durationMin: number,
    durationMax: number,
    sinRate: number,
    delayTF: string,
    delay: number,
    delayMin: number,
    delayMax: number,
    delaySinRate: number,
    color: string,
  };

  readonly state = {
    toggleStrobe: false,
    duration: this.getDuration(),
    delay: 0,
  };

  _strobeTimeout: NodeJS.Timeout = null;

  render() {
    return (
      <Transition
        reset
        unique
        items={this.state.toggleStrobe}
        config={{duration: this.state.duration}}
        from={{ backgroundColor: this.props.color, opacity: this.props.opacity}}
        enter={{ opacity: 0 }}
        leave={{ opacity: 0 }} >
        {toggle => props =>
          <animated.div
            className={this.props.className ? "Strobe u-fill-container " + this.props.className : "Strobe u-fill-container"}
            style={props}
          />
        }
      </Transition>
    )
  }

  strobe() {
    const duration = this.getDuration();
    const delay = this.props.pulse ? this.getDelay() : duration;
    this.setState({toggleStrobe: !this.state.toggleStrobe, duration: duration, delay: delay});
    return delay;
  }

  strobeLoop() {
    const delay = this.strobe();
    this._strobeTimeout = setTimeout(this.strobeLoop.bind(this), delay);
  }

  componentDidMount() {
    if (this.props.pulse ? this.props.delayTF != TF.scene : this.props.durationTF != TF.scene) {
      this.strobeLoop();
    } else {
      this.strobe();
    }
  }

  componentWillUpdate(props: any) {
    if (this.props.durationTF != props.durationTF || this.props.delayTF != props.delayTF || this.props.pulse != props.pulse) {
      clearTimeout(this._strobeTimeout);
      if (props.pulse ? props.delayTF != TF.scene : props.durationTF != TF.scene) {
        this.strobeLoop();
      }
    }
    if ((props.pulse ? props.delayTF == TF.scene : props.durationTF == TF.scene) && this.props.toggleStrobe != props.toggleStrobe) {
      this.strobe();
    }
  }

  componentWillUnmount() {
    clearTimeout(this._strobeTimeout);
    this._strobeTimeout = null;
  }

  getDuration() {
    let duration;
    switch (this.props.durationTF) {
      case TF.constant:
        duration = Math.max(this.props.duration, 10);
        break;
      case TF.random:
        duration = Math.floor(Math.random() * (Math.max(this.props.durationMax, 10) - Math.max(this.props.durationMin, 10) + 1)) + Math.max(this.props.durationMin, 10);
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.sinRate - 100) + 2) * 1000;
        duration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (Math.max(this.props.durationMax, 10) - Math.max(this.props.durationMin, 10) + 1)) + Math.max(this.props.durationMin, 10);
        break;
      case TF.scene:
        duration = this.props.timeToNextFrame;
    }
    return duration;
  }

  getDelay() {
    let delay;
    switch (this.props.delayTF) {
      case TF.constant:
        delay = this.props.delay;
        break;
      case TF.random:
        delay = Math.floor(Math.random() * (this.props.delayMax - this.props.delayMin + 1)) + this.props.delayMin;
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.delaySinRate - 100) + 2) * 1000;
        delay = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.delayMax - this.props.delayMin + 1)) + this.props.delayMin;
        break;
      case TF.scene:
        delay = this.props.timeToNextFrame;
    }
    return delay;
  }
}