import * as React from 'react';
import {animated, useTransition} from "react-spring";

import {STF, TF} from "../../data/const";
import {getEaseFunction, getRandomNumber} from "../../data/utils";
import Scene from "../../data/Scene";
import Audio from "../../data/Audio";

export default class Slide extends React.Component {
  readonly props: {
    image: HTMLImageElement | HTMLVideoElement,
    scene: Scene,
    timeToNextFrame: number,
    currentAudio: Audio,
    hideOverflow: boolean,
    children?: React.ReactNode,
  };

  render() {
    if (this.props.scene.slide) {
      return (
        <this.SlideLayer>
          {this.props.children}
        </this.SlideLayer>
      );
    } else {
      return this.props.children;
    }
  }

  SlideLayer = (data: {children: React.ReactNode}) => {
    let slideDuration = 0;
    switch (this.props.scene.slideTF) {
      case TF.scene:
        slideDuration = this.props.timeToNextFrame;
        break;
      case TF.constant:
        slideDuration = this.props.scene.slideDuration;
        break;
      case TF.random:
        slideDuration = Math.floor(Math.random() * (this.props.scene.slideDurationMax - this.props.scene.slideDurationMin + 1)) + this.props.scene.slideDurationMin;
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.slideSinRate - 100) + 2) * 1000;
        slideDuration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.slideDurationMax - this.props.scene.slideDurationMin + 1)) + this.props.scene.slideDurationMin;
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.slideBPMMulti / 10;
        const bpm = this.props.currentAudio ? this.props.currentAudio.bpm : 60;
        slideDuration = 60000 / (bpm * bpmMulti);
        // If we cannot parse this, default to 1s
        if (!slideDuration) {
          slideDuration = 1000;
        }
        break;
    }

    let slideHStart, slideHEnd, slideVStart, slideVEnd;
    let slideType = this.props.scene.slideType;
    if (slideType == STF.leftright) {
      slideType = getRandomNumber(0, 1) == 0 ? STF.left : STF.right;
    } else if (slideType == STF.updown) {
      slideType = getRandomNumber(0, 1) == 0 ? STF.up : STF.down;
    } else if (slideType == STF.random) {
      const rand = getRandomNumber(0, 3);
      switch (rand) {
        case 0:
          slideType = STF.left;
          break;
        case 1:
          slideType = STF.right;
          break;
        case 2:
          slideType = STF.up;
          break;
        case 3:
          slideType = STF.down;
          break;
      }
    }

    switch (slideType) {
      case (STF.left):
        slideHStart = 100;
        slideHEnd = this.props.scene.slideDistance * -1;
        slideVStart = 0;
        slideVEnd = 0;
        break;
      case (STF.right):
        slideHStart = -100;
        slideHEnd = this.props.scene.slideDistance;
        slideVStart = 0;
        slideVEnd = 0;
        break;
      case (STF.up):
        slideVStart = 100;
        slideVEnd = this.props.scene.slideDistance * -1;
        slideHStart = 0;
        slideHEnd = 0;
        break;
      case (STF.down):
        slideVStart = -100;
        slideVEnd = this.props.scene.slideDistance;
        slideHStart = 0;
        slideHEnd = 0;
        break;
    }

    const slideTransitions: [{item: any, props: any, key: any}] = useTransition(
      this.props.image,
      (image: any) => {
        return image.key
      },
      {
        from: { // Base values, optional
          transform: `translate3d(${slideHStart}%,${slideVStart}%,0)`
        },
        enter: { // Styles apply for entering elements
          transform: 'translate3d(0%,0%,0)'
        },
        leave: { // Styles apply for leaving elements
          transform: `translate3d(${slideHEnd}%,${slideVEnd}%,0)`
        },
        unique: true, // If this is true, items going in and out with the same key will be re-used
        config: {
          duration: slideDuration,
          easing : getEaseFunction(this.props.scene.slideEase, this.props.scene.slideExp, this.props.scene.slideAmp, this.props.scene.slidePer, this.props.scene.slideOv)
        },
      }
    );

    return (
      <React.Fragment>
        {slideTransitions.map(({item, props, key}) => {
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

(Slide as any).displayName="Slide";