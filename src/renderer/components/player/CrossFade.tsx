import * as React from 'react';
import {animated, useTransition} from "react-spring";

import {TF} from "../../data/const";
import {getEaseFunction} from "../../data/utils";
import Scene from "../../data/Scene";
import Audio from "../../data/Audio";

export default class CrossFade extends React.Component {
  readonly props: {
    image: HTMLImageElement | HTMLVideoElement,
    scene: Scene,
    timeToNextFrame: number,
    currentAudio: Audio,
    hideOverflow: boolean,
    children?: React.ReactNode,
  };

  render() {
    if (this.props.scene.crossFade) {
      return (
        <this.FadeLayer>
          {this.props.children}
        </this.FadeLayer>
      );
    } else {
      return this.props.children;
    }
  }

  FadeLayer = (data: {children: React.ReactNode}) => {
    let fadeDuration = 0;
    switch (this.props.scene.fadeTF) {
      case TF.scene:
        fadeDuration = this.props.timeToNextFrame;
        break;
      case TF.constant:
        fadeDuration = this.props.scene.fadeDuration;
        break;
      case TF.random:
        fadeDuration = Math.floor(Math.random() * (this.props.scene.fadeDurationMax - this.props.scene.fadeDurationMin + 1)) + this.props.scene.fadeDurationMin;
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.fadeSinRate - 100) + 2) * 1000;
        fadeDuration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.fadeDurationMax - this.props.scene.fadeDurationMin + 1)) + this.props.scene.fadeDurationMin;
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.fadeBPMMulti / 10;
        const bpm = this.props.currentAudio ? this.props.currentAudio.bpm : 60;
        fadeDuration = 60000 / (bpm * bpmMulti);
        // If we cannot parse this, default to 1s
        if (!fadeDuration) {
          fadeDuration = 1000;
        }
        break;
    }

    const fadeTransitions: [{item: any, props: any, key: any}] = useTransition(
      this.props.image,
      (image: any) => {
        return image.key
      },
      {
        initial: { // Initial (first time) base values, optional (can be null)
          opacity: 1,
          volume: 1,
        },
        from: { // Base values, optional
          opacity: 0,
          volume: 0,
        },
        enter: { // Styles apply for entering elements
          opacity: 1,
          volume: 1,
        },
        leave: { // Styles apply for leaving elements
          opacity: 0.99,
          volume: 0,
        },
        unique: true, // If this is true, items going in and out with the same key will be re-used
        config: {
          duration: fadeDuration,
          easing : getEaseFunction(this.props.scene.fadeEase, this.props.scene.fadeExp, this.props.scene.fadeAmp, this.props.scene.fadePer, this.props.scene.fadeOv)
        },
      }
    );

    return (
      <React.Fragment>
        {fadeTransitions.map(({item, props, key}) => {
          return (
            <animated.div
              key={key}
              volume={props.volume}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                overflow: this.props.hideOverflow ? 'hidden' : 'visible',
                ...props
              }}>
              {data.children}
            </animated.div>
          );
        })}
      </React.Fragment>
    );
  };
}

(CrossFade as any).displayName="CrossFade";