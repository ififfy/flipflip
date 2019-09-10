import * as React from 'react';
import {animated, useSpring, useTransition} from "react-spring";
import Timeout = NodeJS.Timeout;

import {BT, SL} from "../../data/const";
import Scene from "../../data/Scene";
import Strobe from "./Strobe";

export default class ImageView extends React.Component {
  readonly props: {
    image: HTMLImageElement | HTMLVideoElement,
    scene?: Scene,
    timeToNextFrame?: number,
    toggleStrobe?: boolean,
    backgroundType: string,
    backgroundColor: string,
    backgroundBlur: number,
    horizTransLevel: number,
    vertTransLevel: number,
    zoomStart: number,
    zoomEnd: number,
    transDuration: number,
    crossFade: boolean,
    crossFadeAudio: boolean,
    fadeDuration: number,
    videoVolume: number,
    fitParent: boolean,
    onLoaded(): void,
    setVideo(video: HTMLVideoElement): void,
  };

  readonly backgroundRef: React.RefObject<HTMLDivElement> = React.createRef();
  readonly contentRef: React.RefObject<HTMLDivElement> = React.createRef();
  _image: HTMLImageElement | HTMLVideoElement = null;
  _timeouts: Array<Timeout>;

  componentDidMount() {
    this._timeouts = new Array<Timeout>();
    this._applyImage();
  }

  componentDidUpdate() {
    this._applyImage();
  }

  componentWillUnmount() {
    this.clearTimeouts();
    this._timeouts = null;
  }

  clearTimeouts() {
    for (let timeout of this._timeouts) {
      clearTimeout(timeout);
    }
  }

  _applyImage() {
    const el = this.contentRef.current;
    const bg = this.backgroundRef.current;
    const img = this.props.image;
    if (!el || !img) return;

    const firstChild = el.firstChild;
    if (firstChild && (firstChild as HTMLImageElement | HTMLVideoElement).src == img.src) return;

    let parentWidth = el.offsetWidth;
    let parentHeight = el.offsetHeight;
    if (this.props.fitParent) {
      parentWidth = el.parentElement.offsetWidth;
      parentHeight = el.parentElement.offsetHeight;
    }
    if (parentWidth == 0 || parentHeight == 0) {
      parentWidth = window.innerWidth;
      parentHeight = window.innerHeight;
    }
    let parentAspect = parentWidth / parentHeight;
    let imgWidth;
    let imgHeight;
    if (img instanceof HTMLImageElement) {
      imgWidth = img.width;
      imgHeight = img.height;
    } else {
      imgWidth = img.videoWidth;
      imgHeight = img.videoHeight;
    }
    let imgAspect = imgWidth / imgHeight;

    const videoLoop = (v: any) => {
      if (parseFloat(el.parentElement.style.opacity) == 0.99 || v.ended || v.paused) return;
      if (this.props.crossFade && this.props.crossFadeAudio && v instanceof HTMLVideoElement) {
        v.volume = (this.props.videoVolume / 100) * parseFloat(el.parentElement.parentElement.getAttribute("volume"));
      }
      if (v.hasAttribute("start") && v.hasAttribute("end")) {
        const start = v.getAttribute("start");
        const end = v.getAttribute("end");
        if (v.currentTime > end) {
          v.currentTime = start;
        }
      }
      this._timeouts.push(setTimeout(videoLoop, 100, v));
    };

    const drawLoop = (v: any, c: CanvasRenderingContext2D, w: number, h: number) => {
      if (parseFloat(el.parentElement.style.opacity) == 0.99 || v.ended || v.paused) return;
      c.drawImage(v, 0, 0, w, h);
      this._timeouts.push(setTimeout(drawLoop, 20, v, c, w, h));
    };

    const blur = this.props.backgroundType == BT.blur;
    let bgImg: any;
    if (blur) {
      if (img.src.endsWith(".gif")) {
        bgImg = img.cloneNode();
      } else {
        bgImg = document.createElement('canvas');

        const context = bgImg.getContext('2d');
        bgImg.width = parentWidth;
        bgImg.height = parentHeight;

        if (!this.props.crossFade) {
          this.clearTimeouts();
        }
        if (img instanceof HTMLImageElement) {
          context.drawImage(img, 0, 0, parentWidth, parentHeight);
        } else {
          img.onplay = () => {
            videoLoop(img);
            drawLoop(img, context, parentWidth, parentHeight);
          }
        }
      }
    }

    if (img instanceof HTMLVideoElement) {
      img.volume = this.props.videoVolume / 100;
      if (!blur) {
        img.onplay = () => videoLoop(img);
      }
      img.play();
    }

    if (imgAspect < parentAspect) {
      const scale = parentHeight / imgHeight;
      img.style.width = 'auto';
      img.style.height = '100%';
      img.style.marginTop = '0';
      img.style.marginLeft = (parentWidth / 2 - imgWidth * scale / 2) + 'px';
      if (blur) {
        const bgscale = (parentWidth + (0.04 * parentWidth)) / imgWidth;
        bgImg.style.width = '100%';
        bgImg.style.height = (imgHeight * bgscale) + 'px';
        bgImg.style.marginTop = (parentHeight / 2 - imgHeight * bgscale / 2) + 'px';
        bgImg.style.marginLeft = '0';
      }
    } else {
      const scale = parentWidth / imgWidth;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.marginTop = (parentHeight / 2 - imgHeight * scale / 2) + 'px';
      img.style.marginLeft = '0';
      if (blur) {
        const bgscale = (parentHeight + (0.04 * parentHeight)) / imgHeight;
        bgImg.style.width = (imgWidth * bgscale) + 'px';
        bgImg.style.height = '100%';
        bgImg.style.marginTop = '0';
        bgImg.style.marginLeft = (parentWidth / 2 - imgWidth * bgscale / 2) + 'px';
      }
    }

    this.props.setVideo(img instanceof HTMLVideoElement ? img : null);

    this._image = img;
    el.appendChild(img);
    if (blur) {
      bg.appendChild(bgImg);
    }

    this.props.onLoaded();
  }

  shouldComponentUpdate(props: any): boolean {
    return (!this.props.image && props.image) ||
      (props.image && this.props.image &&
      (props.image.src !== this.props.image.src ||
      props.image.getAttribute("start") !== this.props.image.getAttribute("start") ||
      props.image.getAttribute("end") !== this.props.image.getAttribute("end"))) ||
      (props.scene && props.scene.strobe && props.toggleStrobe !== this.props.toggleStrobe) ||
      props.backgroundType !== this.props.backgroundType ||
      props.backgroundColor !== this.props.backgroundColor ||
      props.backgroundBlur !== this.props.backgroundBlur ||
      props.horizTransLevel !== this.props.horizTransLevel ||
      props.vertTransLevel !== this.props.vertTransLevel ||
      props.zoomStart !== this.props.zoomStart ||
      props.zoomEnd !== this.props.zoomEnd ||
      props.transDuration !== this.props.transDuration ||
      props.videoVolume !== this.props.videoVolume ||
      props.crossFade !== this.props.crossFade ||
      props.crossFadeAudio !== this.props.crossFadeAudio ||
      props.fadeDuration !== this.props.fadeDuration;
  }

  render() {
    if (!this.props.image) {
      return (
        <div id="ImageView" className="ImageView u-fill-container">
          <div className="ImageView__Image" ref={this.contentRef}/>
          <div className="ImageView__Background" ref={this.backgroundRef}/>
        </div>
      );
    }

    let backgroundStyle = {};
    if (this.props.backgroundType == BT.color) {
      backgroundStyle = {
        backgroundColor: this.props.backgroundColor,
      };
    } else if (this.props.backgroundType == BT.blur) {
      backgroundStyle = {
        filter: 'blur(' + this.props.backgroundBlur + 'px)',
      };
    }
    return (
      <animated.div id="ImageView" className="ImageView u-fill-container">
        <this.FadeLayer>
          <this.ZoomMoveLayer>
            {(this.props.scene && this.props.scene.strobe && this.props.scene.strobeLayer == SL.image) && (
              <Strobe
                strobeFunction={this.strobeImage.bind(this)}
                toggleStrobe={this.props.toggleStrobe}
                pulse={this.props.scene.strobePulse}
                opacity={1}
                timeToNextFrame={this.props.timeToNextFrame}
                durationTF={this.props.scene.strobeTF}
                duration={this.props.scene.strobeTime}
                durationMin={this.props.scene.strobeTimeMin}
                durationMax={this.props.scene.strobeTimeMax}
                sinRate={this.props.scene.strobeSinRate}
                delayTF={this.props.scene.strobeDelayTF}
                delay={this.props.scene.strobeDelay}
                delayMin={this.props.scene.strobeDelayMin}
                delayMax={this.props.scene.strobeDelayMax}
                delaySinRate={this.props.scene.strobeDelaySinRate}>
                <animated.div className="ImageView__Image" ref={this.contentRef}/>
              </Strobe>
            )}
            {(!this.props.scene || !this.props.scene.strobe || this.props.scene.strobeLayer != SL.image) && (
              <animated.div className="ImageView__Image" ref={this.contentRef}/>
            )}
          </this.ZoomMoveLayer>
          {this.props.scene && this.props.scene.strobe && this.props.scene.strobeLayer == SL.background && (
            <Strobe
              className={'m-background'}
              toggleStrobe={this.props.toggleStrobe}
              pulse={this.props.scene.strobePulse}
              opacity={1}
              timeToNextFrame={this.props.timeToNextFrame}
              durationTF={this.props.scene.strobeTF}
              duration={this.props.scene.strobeTime}
              durationMin={this.props.scene.strobeTimeMin}
              durationMax={this.props.scene.strobeTimeMax}
              sinRate={this.props.scene.strobeSinRate}
              delayTF={this.props.scene.strobeDelayTF}
              delay={this.props.scene.strobeDelay}
              delayMin={this.props.scene.strobeDelayMin}
              delayMax={this.props.scene.strobeDelayMax}
              delaySinRate={this.props.scene.strobeDelaySinRate}
              color={this.props.scene.strobeColor}/>
          )}
          <animated.div className="ImageView__Background" ref={this.backgroundRef} style={{...backgroundStyle}}/>
        </this.FadeLayer>
      </animated.div>
    );
  }

  strobeImage() {
    const el = this.contentRef.current;
    if (el && this._image) {
      el.appendChild(this._image);
    }
  }

  FadeLayer = (data: {children: React.ReactNode}) => {
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
          opacity: this.props.crossFade ? 0 : 1,
          volume: this.props.crossFade ? 0 : 1,
        },
        enter: { // Styles apply for entering elements
          opacity: 1,
          volume: 1,
        },
        leave: { // Styles apply for leaving elements
          opacity: this.props.crossFade ? 0.99 : 1,
          volume: this.props.crossFade ? 0 : 1,
        },
        unique: true, // If this is true, items going in and out with the same key will be re-used
        config: {
          duration: this.props.fadeDuration,
        },
      }
    );

    return (
      <React.Fragment>
        {fadeTransitions.map(({item, props, key}) => {
          return (
            <animated.div className="FadeLayer u-fill-container" key={key} volume={props.volume} style={{ ...props }}>
              {data.children}
            </animated.div>
          );
        })}
      </React.Fragment>
    );
  };

  ZoomMoveLayer = (data: {children: React.ReactNode}) => {
    const imageProps = useSpring(
      {
        from: {
          transform: 'translate(0%, 0%) scale(' + this.props.zoomStart + ')',
        },
        to: {
          transform: 'translate(' + this.props.horizTransLevel + '%, ' + this.props.vertTransLevel + '%) scale(' + this.props.zoomEnd + ')',
        },
        config: {
          duration: this.props.transDuration,
        },
      }
    );

    return (
      <animated.div className="ZoomMoveLayer u-fill-container" style={{ ...imageProps }}>
        {data.children}
      </animated.div>
    );
  };
}