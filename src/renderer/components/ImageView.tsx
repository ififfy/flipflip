import * as React from 'react';
import * as ReactDOM from 'react-dom';


export default class ImageDisplay extends React.Component {
  readonly props: {
    img: HTMLImageElement,
  }

  readonly contentRef: React.RefObject<HTMLImageElement> = React.createRef()

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
    const parentHeight = el.offsetHeight
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
    return <div className="ImageView u-fill-container" ref={this.contentRef} />;
  }
}
