import * as React from 'react';

const maxFadeSeconds = 5;

export default class ImageView extends React.Component {
  readonly props: {
    img: HTMLImageElement,
    fadeState: string,
    fadeDuration: number,
  };

  readonly contentRef: React.RefObject<HTMLImageElement> = React.createRef();

  componentDidMount() {
    this._applyImage();
  }

  componentDidUpdate() {
    this._applyImage();
  }

  _applyImage() {
    const el = this.contentRef.current;
    if (!el) return "No element";

    const img = this.props.img;
    if (!img) return "No image available";

    const firstChild = el.firstChild;
    if (firstChild instanceof HTMLImageElement) {
      if (firstChild.src === img.src) return;
    }

    const parentWidth = el.offsetWidth;
    const parentHeight = el.offsetHeight;
    const parentAspect = parentWidth / parentHeight;
    const imgAspect = img.width / img.height;

    if (imgAspect < parentAspect) {
      const scale = parentHeight / img.height;
      img.style.width = 'auto';
      img.style.height = '100%';
      img.style.marginTop = '0';
      img.style.marginLeft = (parentWidth / 2 - img.width * scale / 2) + 'px';
    } else {
      const scale = parentWidth / img.width;
      img.style.height = 'auto';
      img.style.width = '100%';
      img.style.marginTop = (parentHeight / 2 - img.height * scale / 2) + 'px';
      img.style.marginLeft = '0';
    }

    if (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    el.appendChild(img);
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
    return (
      <div
        className="ImageView u-fill-container"
        style={style}
        ref={this.contentRef}>
      </div>);
  }
}
