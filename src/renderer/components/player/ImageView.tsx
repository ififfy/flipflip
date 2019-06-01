import * as React from 'react';
import {BT, HTF, VTF, ZF} from "../../data/const";

const maxFadeSeconds = 5;

export default class ImageView extends React.Component {
  readonly props: {
    img: HTMLImageElement | HTMLVideoElement,
    fadeState: string,
    fadeDuration: number,
    backgroundType: string,
    backgroundColor: string,
    horizTransType: string,
    vertTransType: string,
    zoomType: string,
    effectLevel: number,
  };

  readonly backgroundRef: React.RefObject<any> = React.createRef();
  readonly contentRef: React.RefObject<any> = React.createRef();

  componentDidMount() {
    this._applyImage();
  }

  componentDidUpdate() {
    this._applyImage();
  }

  _applyImage() {
    const el = this.contentRef.current;
    const bg = this.backgroundRef.current;
    const img = this.props.img;
    if (!el || !img) return;

    const firstChild = el.firstChild;
    if (firstChild instanceof HTMLImageElement || firstChild instanceof HTMLVideoElement) {
      if (firstChild.src === img.src) return;
    }

    const blur = this.props.backgroundType == BT.blur;
    let bgImg: any;
    if (blur) {
      bgImg = this.props.img.cloneNode();
    }

    const parentWidth = el.offsetWidth;
    const parentHeight = el.offsetHeight;
    const parentAspect = parentWidth / parentHeight;
    let imgWidth;
    if (img instanceof HTMLImageElement) {
      imgWidth = img.width;
    } else {
      imgWidth = img.videoWidth;
    }
    let imgHeight;
    if (img instanceof HTMLImageElement) {
      imgHeight = img.height;
    } else {
      imgHeight = img.videoHeight;
    }
    const imgAspect = imgWidth / imgHeight;

    if (imgAspect < parentAspect) {
      const scale = parentHeight / imgHeight;
      img.style.width = 'auto';
      img.style.height = '100%';
      img.style.marginTop = '0';
      img.style.marginLeft = (parentWidth / 2 - imgWidth * scale / 2) + 'px';
      if (blur) {
        const bgscale = parentWidth / imgWidth;
        bgImg.style.width = '100%';
        bgImg.style.height = 'auto';
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
        const bgscale = parentHeight / imgHeight;
        bgImg.style.width = 'auto';
        bgImg.style.height = '100%';
        bgImg.style.marginTop = '0';
        bgImg.style.marginLeft = (parentWidth / 2 - imgWidth * bgscale / 2) + 'px';
      }
    }

    if (firstChild) {
      el.removeChild(firstChild);
    }
    if (bg.firstChild) {
      bg.removeChild(bg.firstChild);
    }

    if (img instanceof HTMLVideoElement) {
      img.onpause = () => {
        bgImg.pause();
      }
    }

    el.appendChild(img);
    if (blur) {
      if (bgImg instanceof HTMLVideoElement) {
        bgImg.muted = true;
        bgImg.volume = 0;
      }
      bg.appendChild(bgImg);
    }
  }

  render() {
    let style = {};
    const fadeDuration = Math.min(maxFadeSeconds, (this.props.fadeDuration / 1000)) + 's';
    if (this.props.fadeState === 'in') {
      style = {
        animationName: 'fadeIn',
        opacity: 1,
        animationDuration: fadeDuration,
      };
    } else if (this.props.fadeState === 'out') {
      style = {
        animationName: 'fadeOut',
        opacity: 0,
        animationDuration: fadeDuration,
      };
    }

    let className = "ImageView u-fill-container translate-";

    switch (this.props.horizTransType) {
      case HTF.none:
        className += '0-';
        break;
      case HTF.right:
        className += '10-';
        break;
      case HTF.left:
        className += '-10-';
        break;
    }
    switch (this.props.vertTransType) {
      case VTF.none:
        className += '0-';
        break;
      case VTF.down:
        className += '10-';
        break;
      case VTF.up:
        className += '-10-';
        break;
    }
    switch (this.props.zoomType) {
      case ZF.none:
        className += `${this.props.effectLevel}s`;
        break;
      case ZF.in:
        className += `zoom-${this.props.effectLevel}s`;
        break;
      case ZF.out:
        className += `zoom-out-${this.props.effectLevel}s`;
    }

    return (
      <div style={style}>
        <div
          className={`ImageViewBackground u-fill-container ${this.props.backgroundType == BT.color ? '' : 'm-blur'}`}
          style={{background: this.props.backgroundType == BT.color ? this.props.backgroundColor : null}}
          ref={this.backgroundRef}
        />
        <div
          className={className}
          ref={this.contentRef}
        />
      </div>);
  }
}
