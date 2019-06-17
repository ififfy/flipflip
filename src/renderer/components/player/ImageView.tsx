import * as React from 'react';
import {animated, useSpring, useTransition} from "react-spring";

import {BT} from "../../data/const";

export const FadeLayer = (data: {image: any, backgroundType: string, backgroundColor: string,
  horizTransLevel: number, vertTransLevel: number, zoomStart: number, zoomEnd: number,
  transDuration: number, fadeDuration: any, crossFade: boolean}) => {

  const fadeTransitions: [{item: any, props: any, key: any}] = useTransition(
    data.image,
    (image: any) => {
      return image.key
    },
    {
      initial: { // Initial (first time) base values, optional (can be null)
        opacity: 1,
      },
      from: { // Base values, optional
        opacity: data.crossFade ? 0 : 1,
      },
      enter: { // Styles apply for entering elements
        opacity: 1,
      },
      leave: { // Styles apply for leaving elements
        opacity: data.crossFade ? 0 : 1,
      },
      unique: true, // If this is true, items going in and out with the same key will be re-used
      config: {
        duration: parseInt(data.fadeDuration, 10),
      },
    }
  );

  return (
    <React.Fragment>
      {fadeTransitions.map(({item, props, key}) => {
        return (
          <animated.div className="ImageView u-fill-container" key={key} style={{ ...props }}>
            <ZoomMoveLayer image={item}
                   horizTransLevel={data.horizTransLevel}
                   vertTransLevel={data.vertTransLevel}
                   zoomStart={data.zoomStart}
                   zoomEnd={data.zoomEnd}
                   duration={data.transDuration} />
            <Image className="ImageView__Background"
                   image={item}
                   backgroundType={data.backgroundType}
                   backgroundColor={data.backgroundColor}
                   imageProps={null} />
          </animated.div>
        );
      })}
    </React.Fragment>
  );
};

const ZoomMoveLayer = (data: {image: any, horizTransLevel: number, vertTransLevel: number,
  zoomStart: number, zoomEnd: number, duration: any }) => {
  const imageProps = useSpring(
    {
      from: {
        transform: 'translate(0%, 0%) scale(' + data.zoomStart + ')',
      },
      to: {
        transform: 'translate(' + data.horizTransLevel + '%, ' + data.vertTransLevel + '%) scale(' + data.zoomEnd + ')',
      },
      config: {
        duration: parseInt(data.duration, 10),
      },
    }
  );

  return (
    <Image className="ImageView__Image"
           image={data.image}
           backgroundType={null}
           backgroundColor={null}
           imageProps={imageProps} />
  );
};

const Image = (data: {className: string, image: any, backgroundType: string, backgroundColor: string, imageProps: any }) => {
  const parentWidth = window.innerWidth;
  const parentHeight = window.innerHeight;
  const parentAspect = parentWidth / parentHeight;
  let imgWidth;
  if (data.image instanceof HTMLImageElement) {
    imgWidth = data.image.width;
  } else {
    imgWidth = data.image.videoWidth;
  }
  let imgHeight;
  if (data.image instanceof HTMLImageElement) {
    imgHeight = data.image.height;
  } else {
    imgHeight = data.image.videoHeight;
  }
  const imgAspect = imgWidth / imgHeight;

  let width;
  let height;
  let marginTop;
  let marginLeft;
  if (imgAspect < parentAspect) {
    if (data.backgroundType != null) {
      const bgscale = parentWidth / imgWidth;
      width = '100%';
      height = 'auto';
      marginTop = (parentHeight / 2 - imgHeight * bgscale / 2) + 'px';
      marginLeft = '0';
    } else {
      const scale = parentHeight / imgHeight;
      width = 'auto';
      height = '100%';
      marginTop = '0';
      marginLeft = (parentWidth / 2 - imgWidth * scale / 2) + 'px';
    }
  } else {
    if (data.backgroundType != null) {
      const bgscale = parentHeight / imgHeight;
      width = 'auto';
      height = '100%';
      marginTop = '0';
      marginLeft = (parentWidth / 2 - imgWidth * bgscale / 2) + 'px';
    } else {
      const scale = parentWidth / imgWidth;
      width = '100%';
      height = 'auto';
      marginTop = (parentHeight / 2 - imgHeight * scale / 2) + 'px';
      marginLeft = '0';
    }
  }

  let backgroundStyle = {};
  if (data.imageProps == null) {
    if (data.backgroundType == BT.color) {
      backgroundStyle = {
        backgroundColor: data.backgroundColor,
      };
    } else {
      backgroundStyle = {
        filter: 'blur(8px)',
      };
    }
  }

  const style = {
    width: width,
    height: height,
    marginTop: marginTop,
    marginLeft: marginLeft,
  };

  return (
    <animated.div className={data.className} style={{...data.imageProps, ...backgroundStyle}}>
      {(data.backgroundType == null || data.backgroundType == BT.blur) && (
        <React.Fragment>
          {data.image instanceof HTMLImageElement && (
            <img src={data.image.src} style={style}/>
          )}
          {data.image instanceof HTMLVideoElement && (
            <video src={data.image.src} style={style} preload="auto" loop autoPlay={data.backgroundType == null} muted/>
          )}
        </React.Fragment>
      )}
    </animated.div>
  );
}



export default class ImageView extends React.Component {
  readonly props: {
    image: HTMLImageElement | HTMLVideoElement,
    backgroundType: string,
    backgroundColor: string,
    horizTransLevel: number,
    vertTransLevel: number,
    zoomStart: number,
    zoomEnd: number,
    transDuration: number,
    crossFade: boolean,
    fadeDuration: number,
  };

  shouldComponentUpdate(props: any): boolean {
    return ((props.image.src !== this.props.image.src) ||
      (props.backgroundType !== this.props.backgroundType) ||
      (props.backgroundColor !== this.props.backgroundColor) ||
      (props.horizTransLevel !== this.props.horizTransLevel) ||
      (props.vertTransLevel !== this.props.vertTransLevel) ||
      (props.zoomStart !== this.props.zoomStart) ||
      (props.zoomEnd !== this.props.zoomEnd) ||
      (props.transDuration !== this.props.transDuration) ||
      (props.crossFade !== this.props.crossFade) ||
      (props.fadeDuration !== this.props.fadeDuration));
  }

  render() {
    return (
      <FadeLayer
        image={this.props.image}
        backgroundType={this.props.backgroundType}
        backgroundColor={this.props.backgroundColor}
        horizTransLevel={this.props.horizTransLevel}
        vertTransLevel={this.props.vertTransLevel}
        zoomStart={this.props.zoomStart}
        zoomEnd={this.props.zoomEnd}
        transDuration={this.props.transDuration}
        crossFade={this.props.crossFade}
        fadeDuration={this.props.fadeDuration}/>
    );
  }
}