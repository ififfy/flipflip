import * as React from 'react';
import {animated, useSpring, useTransition} from "react-spring";
import Timeout = NodeJS.Timeout;

import {BT, HTF, IT, SL, TF, VTF} from "../../data/const";
import Scene from "../../data/Scene";
import Strobe from "./Strobe";

export default class ImageView extends React.Component {
  readonly props: {
    image: HTMLImageElement | HTMLVideoElement,
    fitParent: boolean,
    hasStarted: boolean,
    scene: Scene,
    timeToNextFrame?: number,
    toggleStrobe?: boolean,
    onLoaded?(): void,
    setVideo?(video: HTMLVideoElement): void,
  };

  readonly backgroundRef: React.RefObject<HTMLDivElement> = React.createRef();
  readonly contentRef: React.RefObject<HTMLDivElement> = React.createRef();
  _image: HTMLImageElement | HTMLVideoElement = null;
  _timeouts: Array<Timeout>;

  componentDidMount() {
    this._timeouts = new Array<Timeout>();
    this._applyImage();
  }

  componentDidUpdate(props: any) {
    let force = false;
    if (this.props.scene.backgroundType !== props.scene.backgroundType) {
      if (this.props.scene.backgroundType === BT.blur) {
        force = true;
      } else if (props.scene.backgroundType === BT.blur) {
        this.backgroundRef.current.removeChild(this.backgroundRef.current.firstChild);
      }
    }
    this._applyImage(force);
    if (!props.hasStarted && this.props.hasStarted) {
      const el = this.contentRef.current;
      if (el && el.firstChild && el.firstChild instanceof HTMLVideoElement) {
        el.firstChild.volume = this.props.scene.videoVolume / 100;
      }
    }
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

  _applyImage(forceBG: boolean = false) {
    const el = this.contentRef.current;
    const bg = this.backgroundRef.current;
    const img = this.props.image;
    if (!el || !img) return;

    const firstChild = el.firstChild;
    if (!forceBG && firstChild && (firstChild as HTMLImageElement | HTMLVideoElement).src == img.src) return;

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
      let crossFadeAudio = this.props.scene.crossFadeAudio && !this.props.scene.gridView;
      if (this.props.hasStarted && this.props.scene.crossFade && crossFadeAudio && v instanceof HTMLVideoElement) {
        v.volume = (this.props.scene.videoVolume / 100) * parseFloat(el.parentElement.parentElement.getAttribute("volume"));
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

    const rotateVideo = img instanceof HTMLVideoElement && this.props.scene.rotatePortrait && imgWidth < imgHeight;

    const blur = this.props.scene.backgroundType == BT.blur;
    let bgImg: any;
    if (blur) {
      if (img.src.endsWith(".gif")) {
        bgImg = img.cloneNode();
      } else {
        bgImg = document.createElement('canvas');
        if (rotateVideo) {
          bgImg.style.transform = "rotate(270deg)";
        }

        const context = bgImg.getContext('2d');
        bgImg.width = parentWidth;
        bgImg.height = parentHeight;

        if (!this.props.scene.crossFade) {
          this.clearTimeouts();
        }
        if (img instanceof HTMLImageElement) {
          context.drawImage(img, 0, 0, parentWidth, parentHeight);
        } else {
          img.onplay = () => {
            videoLoop(img);
            drawLoop(img, context, parentWidth, parentHeight);
          };
          if (forceBG) {
            drawLoop(img, context, parentWidth, parentHeight);
          }
        }
      }

      if (imgAspect < parentAspect) {
        const bgscale = (parentWidth + (0.04 * parentWidth)) / imgWidth;
        bgImg.style.width = '100%';
        bgImg.style.height = (imgHeight * bgscale) + 'px';
        bgImg.style.marginTop = (parentHeight / 2 - imgHeight * bgscale / 2) + 'px';
        bgImg.style.marginLeft = '0';
      } else {
        const bgscale = (parentHeight + (0.04 * parentHeight)) / imgHeight;
        bgImg.style.width = (imgWidth * bgscale) + 'px';
        bgImg.style.height = '100%';
        bgImg.style.marginTop = '0';
        bgImg.style.marginLeft = (parentWidth / 2 - imgWidth * bgscale / 2) + 'px';
      }
    }

    if (img instanceof HTMLVideoElement && !forceBG) {
      if (this.props.hasStarted) {
        img.volume = this.props.scene.videoVolume / 100;
      } else {
        img.volume = 0;
      }
      if (!blur) {
        img.onplay = () => videoLoop(img);
      }
      if (img.paused) {
        img.play();
      }
    }

    switch (this.props.scene.imageType) {
      case (IT.fitBestClip):
        if (rotateVideo) {
          imgAspect = imgHeight / imgWidth;
          if (imgAspect < parentAspect) {
            const scale = parentWidth / imgHeight;
            img.style.height = parentWidth.toString() + "px";
            img.style.marginLeft = '-' + imgWidth * scale + 'px';
            img.style.marginTop = (parentHeight / 2 - imgWidth * scale / 2) + 'px';

            img.style.transform = "rotate(270deg)";
            img.style.transformOrigin = "top right";
          } else {
            const scale = parentHeight / imgWidth;
            img.style.width = parentHeight.toString() + "px";
            img.style.marginLeft = (-parentHeight  + (parentWidth / 2 - imgHeight * scale / 2)) + 'px';

            img.style.transform = "rotate(270deg)";
            img.style.transformOrigin = "top right";
          }
        } else {
          if (imgAspect > parentAspect) {
            const scale = parentHeight / imgHeight;
            img.style.width = 'auto';
            img.style.height = '100%';
            img.style.marginTop = '0';
            img.style.marginLeft = (parentWidth / 2 - imgWidth * scale / 2) + 'px';
          } else {
            const scale = parentWidth / imgWidth;
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.marginTop = (parentHeight / 2 - imgHeight * scale / 2) + 'px';
            img.style.marginLeft = '0';
          }
        }
        break;
      default:
      case (IT.fitBestNoClip):
        if (rotateVideo) {
          imgAspect = imgHeight / imgWidth;
          if (imgAspect < parentAspect) {
            const scale = parentHeight / imgWidth;
            img.style.width = parentHeight.toString() + "px";
            img.style.marginLeft = (-parentHeight  + (parentWidth / 2 - imgHeight * scale / 2)) + 'px';

            img.style.transform = "rotate(270deg)";
            img.style.transformOrigin = "top right";
          } else {
            const scale = parentWidth / imgHeight;
            img.style.height = parentWidth.toString() + "px";
            img.style.marginLeft = '-' + imgWidth * scale + 'px';
            img.style.marginTop = (parentHeight / 2 - imgWidth * scale / 2) + 'px';

            img.style.transform = "rotate(270deg)";
            img.style.transformOrigin = "top right";
          }
        } else {
          if (imgAspect < parentAspect) {
            const scale = parentHeight / imgHeight;
            img.style.width = 'auto';
            img.style.height = '100%';
            img.style.marginTop = '0';
            img.style.marginLeft = (parentWidth / 2 - imgWidth * scale / 2) + 'px';
          } else {
            const scale = parentWidth / imgWidth;
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.marginTop = (parentHeight / 2 - imgHeight * scale / 2) + 'px';
            img.style.marginLeft = '0';
          }
        }
        break;
      case (IT.stretch):
        if (rotateVideo) {
          const scale = parentWidth / imgHeight;
          img.style.height = parentWidth.toString() + "px";
          img.style.marginLeft = '-' + imgWidth * scale + 'px';
          img.style.marginTop = (parentHeight / 2 - imgWidth * scale / 2) + 'px';

          img.style.transform = "rotate(270deg)";
          img.style.transformOrigin = "top right";
        } else {
          img.style.width = '100%';
          img.style.height = '100%';
        }
        break;
      case (IT.center):
        if (rotateVideo) {
          img.style.transform = "rotate(270deg)";
          img.style.transformOrigin = "center";
        }
        const top = Math.max(parentHeight - imgHeight, 0);
        const left = Math.max(parentWidth - imgWidth, 0);
        img.style.marginTop = top / 2 + 'px';
        img.style.marginLeft = left / 2 + 'px';
        break;
      case (IT.fitWidth):
        if (rotateVideo) {
          const scale = parentHeight / imgWidth;
          img.style.width = parentHeight.toString() + "px";
          img.style.marginLeft = (-parentHeight  + (parentWidth / 2 - imgHeight * scale / 2)) + 'px';

          img.style.transform = "rotate(270deg)";
          img.style.transformOrigin = "top right";
        } else {
          const hScale = parentWidth / imgWidth;
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.marginTop = (parentHeight / 2 - imgHeight * hScale / 2) + 'px';
          img.style.marginLeft = '0';
        }
        break;
      case (IT.fitHeight):
        if (rotateVideo) {
          const scale = parentWidth / imgHeight;
          img.style.height = parentWidth.toString() + "px";
          img.style.marginLeft = '-' + imgWidth * scale + 'px';
          img.style.marginTop = (parentHeight / 2 - imgWidth * scale / 2) + 'px';

          img.style.transform = "rotate(270deg)";
          img.style.transformOrigin = "top right";
        } else {
          const wScale = parentHeight / imgHeight;
          img.style.width = 'auto';
          img.style.height = '100%';
          img.style.marginTop = '0';
          img.style.marginLeft = (parentWidth / 2 - imgWidth * wScale / 2) + 'px';
        }
        break;
    }

    if (!forceBG) {
      if (this.props.setVideo) {
        this.props.setVideo(img instanceof HTMLVideoElement ? img : null);
      }

      this._image = img;
      el.appendChild(img);
    }
    if (blur) {
      bg.appendChild(bgImg);
    }

    if (this.props.onLoaded) {
      this.props.onLoaded();
    }
  }

  shouldComponentUpdate(props: any): boolean {
    return (!this.props.image && props.image) ||
      (props.image && this.props.image &&
      (props.image.src !== this.props.image.src ||
      props.image.getAttribute("start") !== this.props.image.getAttribute("start") ||
      props.image.getAttribute("end") !== this.props.image.getAttribute("end"))) ||
      (props.scene.strobe && props.toggleStrobe !== this.props.toggleStrobe) ||
      props.scene !== this.props.scene ||
      props.hasStarted !== this.props.hasStarted;
  }

  render() {
    if (!this.props.image) {
      return (
        <div
          style={{
            zIndex: 2,
            margin: '-5px -10px -10px -5px',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
          }}>
          <div
            ref={this.contentRef}
            style={{
              height: '100%',
              width: '100%',
              zIndex: 2,
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              position: 'absolute',
            }}/>
          <div
            ref={this.backgroundRef}
            style={{
              height: '100%',
              width: '100%',
              zIndex: 1,
              backgroundSize: 'cover',
            }}/>
        </div>
      );
    }

    let backgroundStyle = {};
    if (this.props.scene.backgroundType == BT.color) {
      backgroundStyle = {
        backgroundColor: this.props.scene.backgroundColor,
      };
    } else if (this.props.scene.backgroundType == BT.blur) {
      backgroundStyle = {
        filter: 'blur(' + this.props.scene.backgroundBlur + 'px)',
      };
    }
    return (
      <animated.div
        style={{
          zIndex: 2,
          margin: '-5px -10px -10px -5px',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'hidden',
        }}>
        <this.FadeLayer>
          <this.ZoomMoveLayer>
            {(this.props.scene && this.props.scene.strobe && this.props.scene.strobeLayer == SL.image) && (
              <Strobe
                zIndex={2}
                toggleStrobe={this.props.toggleStrobe}
                timeToNextFrame={this.props.timeToNextFrame}
                scene={this.props.scene}
                strobeFunction={this.strobeImage.bind(this)}>
                <animated.div
                  ref={this.contentRef}
                  style={{
                    height: '100%',
                    width: '100%',
                    zIndex: 2,
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    position: 'absolute',
                  }}/>
              </Strobe>
            )}
            {(!this.props.scene || !this.props.scene.strobe || this.props.scene.strobeLayer != SL.image) && (
              <animated.div
                ref={this.contentRef}
                style={{
                  height: '100%',
                  width: '100%',
                  zIndex: 2,
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  position: 'absolute',
                }}/>
            )}
          </this.ZoomMoveLayer>
          {this.props.scene && this.props.scene.strobe && this.props.scene.strobeLayer == SL.background && (
            <Strobe
              zIndex={1}
              toggleStrobe={this.props.toggleStrobe}
              timeToNextFrame={this.props.timeToNextFrame}
              scene={this.props.scene}/>
          )}
          <animated.div
            ref={this.backgroundRef}
            style={{
              height: '100%',
              width: '100%',
              zIndex: 1,
              backgroundSize: 'cover',
              ...backgroundStyle
            }}/>
        </this.FadeLayer>
      </animated.div>
    );
  }

  strobeImage() {
    const el = this.contentRef.current;
    if (el && this._image && this._image.src == this.props.image.src) {
      el.appendChild(this._image);
      if (this._image instanceof HTMLVideoElement && this._image.paused) {
        this._image.play();
      }
    }
  }

  FadeLayer = (data: {children: React.ReactNode}) => {
    let fadeDuration = 0;
    if (this.props.scene.crossFade) {
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
          const bpmMulti = this.props.scene.fadeBPMMulti > 0 ? this.props.scene.fadeBPMMulti : 1 / (-1 * (this.props.scene.fadeBPMMulti - 2));
          fadeDuration = 60000 / (this.props.scene.bpm * bpmMulti);
          // If we cannot parse this, default to 1s
          if (!fadeDuration) {
            fadeDuration = 1000;
          }
          break;
      }
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
          opacity: this.props.scene.crossFade ? 0 : 1,
          volume: this.props.scene.crossFade ? 0 : 1,
        },
        enter: { // Styles apply for entering elements
          opacity: 1,
          volume: 1,
        },
        leave: { // Styles apply for leaving elements
          opacity: this.props.scene.crossFade ? 0.99 : 1,
          volume: this.props.scene.crossFade ? 0 : 1,
        },
        unique: true, // If this is true, items going in and out with the same key will be re-used
        config: {
          duration: fadeDuration,
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
                overflow: 'hidden',
                ...props
              }}>
              {data.children}
            </animated.div>
          );
        })}
      </React.Fragment>
    );
  };

  ZoomMoveLayer = (data: {children: React.ReactNode}) => {
    let horizTransLevel = 0;
    if (this.props.scene.horizTransType == HTF.left) {
      horizTransLevel = -this.props.scene.horizTransLevel;
    } else if (this.props.scene.horizTransType == HTF.right) {
      horizTransLevel = this.props.scene.horizTransLevel;
    }

    let vertTransLevel = 0;
    if (this.props.scene.vertTransType == VTF.up) {
      vertTransLevel = -this.props.scene.vertTransLevel;
    } else if (this.props.scene.vertTransType == VTF.down) {
      vertTransLevel = this.props.scene.vertTransLevel;
    }

    let zoomStart = 1;
    let zoomEnd = 1;
    if (this.props.scene.zoom) {
      zoomStart = this.props.scene.zoomStart;
      zoomEnd = this.props.scene.zoomEnd;
    }

    let transDuration = 0;
    if (this.props.scene.zoom) {
      switch (this.props.scene.transTF) {
        case TF.scene:
          transDuration = this.props.timeToNextFrame;
          break;
        case TF.constant:
          transDuration = this.props.scene.transDuration;
          break;
        case TF.random:
          transDuration = Math.floor(Math.random() * (this.props.scene.transDurationMax - this.props.scene.transDurationMin + 1)) + this.props.scene.transDurationMin;
          break;
        case TF.sin:
          const sinRate = (Math.abs(this.props.scene.transSinRate - 100) + 2) * 1000;
          transDuration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.transDurationMax - this.props.scene.transDurationMin + 1)) + this.props.scene.transDurationMin;
          break;
        case TF.bpm:
          const bpmMulti = this.props.scene.transBPMMulti > 0 ? this.props.scene.transBPMMulti : 1 / (-1 * (this.props.scene.transBPMMulti - 2));
          transDuration = 60000 / (this.props.scene.bpm * bpmMulti);
          // If we cannot parse this, default to 1s
          if (!transDuration) {
            transDuration = 1000;
          }
          break;
      }
    }

    const imageProps = useSpring(
      {
        from: {
          transform: 'translate(0%, 0%) scale(' + zoomStart + ')',
        },
        to: {
          transform: 'translate(' + horizTransLevel + '%, ' + vertTransLevel + '%) scale(' + zoomEnd + ')',
        },
        config: {
          duration: transDuration,
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