import * as React from 'react';
import {animated, useSpring} from "react-spring";

import {TF} from "../../data/const";
import {getEaseFunction} from "../../data/utils";
import Scene from "../../data/Scene";
import Audio from "../../data/Audio";

export default class StrobeImage extends React.Component {
  readonly props: {
    scene: Scene,
    timeToNextFrame: number,
    currentAudio: Audio,
    children?: React.ReactNode,
  };

  render() {
    return (
      <this.StrobeImageLayer>
        {this.props.children}
      </this.StrobeImageLayer>
    );
  }

  StrobeImageLayer = (data: {children: React.ReactNode}) => {
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
        const bpmMulti = this.props.scene.strobeBPMMulti / 10;
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

    const imageProps = useSpring(
      {
        reset: true,
        from: {
          opacity: 1,
        },
        to: {
          opacity: 0,
        },
        config: {
          duration: duration,
          easing : getEaseFunction(this.props.scene.transEase, this.props.scene.transExp, this.props.scene.transAmp, this.props.scene.transPer, this.props.scene.transOv)
        },
      }
    );

    return (
      <animated.div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'hidden',
          zIndex: 2,
          ...imageProps
        }}>
        {data.children}
      </animated.div>
    );
  };
}

(StrobeImage as any).displayName="StrobeImage";