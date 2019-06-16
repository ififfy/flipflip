import * as React from 'react';
import {animated, useSpring, useTransition} from "react-spring";

import {BT} from "../../data/const";

// Numbers are suddenly becoming string when passed to this object,
// so just cast them when they are used.
export const ImageGroup = (data: {image: any, backgroundType: any, backgroundColor: any,
  horizTransLevel: any, vertTransLevel: any, zoomStart: any, zoomEnd: any,
  transDuration: any, fadeDuration: any, crossFade: boolean}) => {

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

        let backgroundStyle;
        if (data.backgroundType == BT.color) {
          backgroundStyle = {
            backgroundColor: data.backgroundColor,
          };
        } else {
          backgroundStyle = {
            filter: 'blur(8px)',
            backgroundImage: `url(${item.src})`,
          };
        }
        return (
          <animated.div className="ImageView u-fill-container" key={key} style={{ ...props }}>
            <Image src={item.src}
                   horizTransLevel={data.horizTransLevel}
                   vertTransLevel={data.vertTransLevel}
                   zoomStart={data.zoomStart}
                   zoomEnd={data.zoomEnd}
                   duration={data.transDuration} />
            <animated.div
              className="ImageView__Background"
              style={backgroundStyle}
            />
          </animated.div>
        );
      })}
    </React.Fragment>
  );
};

const Image = (data: {src: string, horizTransLevel: any, vertTransLevel: any,
  zoomStart: any, zoomEnd: any, duration: any }) => {
  const imageProps = useSpring(
    {
      from: {
        transform: 'translate(0%, 0%) scale(' + parseInt(data.zoomStart, 10) + ')',
      },
      to: {
        transform: 'translate(' + parseInt(data.horizTransLevel, 10) + '%, ' + parseInt(data.vertTransLevel, 10) + '%) scale(' + parseInt(data.zoomEnd, 10) + ')',
      },
      config: {
        duration: parseInt(data.duration, 10),
      },
    }
  );

  const style = {
    backgroundImage: `url(${data.src})`,
  };

  return <animated.div className="ImageView__Image" style={{ ...imageProps, ...style}} />
};

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
      (props.transDuration !== this.props.transDuration) ||
      (props.fadeDuration !== this.props.fadeDuration));
  }

  render() {
    return (
      <ImageGroup
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