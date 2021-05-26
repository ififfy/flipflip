import * as React from 'react';
import {Keyframes, animated} from "react-spring/renderprops";

const JiggleAnimation: any = Keyframes.Spring(async (next: any, cancel: any, props: any) => {
  const bounce = props.bounce;
  if (props.started) {
    await next({
      from: {
        transform: bounce ? 'scale(1.0, 1.0) translate(0, 0)' : 'scale(1.0, 1.0)',
      },
      transform: bounce ? 'scale(1.1, 0.9) translate(0, -5px)' : 'scale(1.1, 0.9)',
      config: {duration: bounce ? 80 : 100},
    });
    await next({
      from: {
        transform: bounce ? 'scale(1.1, 0.9) translate(0, -5px)' : 'scale(1.1, 0.9)'
      },
      transform: bounce ? 'scale(0.9, 1.1) translate(0, -5px)' : 'scale(0.9, 1.1)',
      config: {duration: bounce ? 80 : 100},
    });
    await next({
      from: {
        transform: bounce ? 'scale(0.9, 1.1) translate(0, -5px)' : 'scale(0.9, 1.1)'
      },
      transform: bounce ? 'scale(1.0, 1.0)  translate(0, 0)' : 'scale(1.0, 1.0)',
      config: {duration: bounce ? 80 : 100},
    }, true);
  } else {
    next({
      from: {
        transform: 'scale(1, 1)'
      }
    }, true)
  }
});

export default class Jiggle extends React.Component {
  readonly props: {
    bounce?: boolean,
    className?: string,
    style?: any,
    disable?: boolean
    onClick?(): void,
    children?: React.ReactNode,
  };

  readonly state = {
    jiggling: Array<string>(),
    hasStarted: false,
  };

  jiggle = (e: any) => {
    const target = e.currentTarget;
    if (!this.state.jiggling.includes(target)) {
      this.setState({ jiggling: this.state.jiggling.concat([target]), hasStarted: true });
    }
  };

  stopJiggle = (e: any) => {
    this.state.jiggling.splice(this.state.jiggling.indexOf(e), 1);
  };

  shouldComponentUpdate(props: any, state: any): boolean {
    return this.state.hasStarted !== state.hasStarted ||
      this.state.jiggling !== state.jiggling ||
      this.props.disable !== props.disable ||
      this.props.className !== props.className;
  }

  render() {
    if (this.props.disable) {
      return (
        <div
          className={this.props.className}
          style={this.props.style}
          onClick={this.props.onClick}>
          {this.props.children}
        </div>
      );
    } else {
      return (
        <JiggleAnimation
          reset
          native
          started={this.state.hasStarted}
          bounce={this.props.bounce ? this.props.bounce : false}
          onRest={this.stopJiggle.bind(this)}>
          {(props: any) => (
            <animated.div
              className={this.props.className}
              style={this.props.style ? {...props, ...this.props.style} : props}
              onMouseEnter={this.jiggle.bind(this)}
              onClick={this.props.onClick}>
              {this.props.children}
            </animated.div>
          )}
        </JiggleAnimation>
      );
    }
  }
}

(Jiggle as any).displayName="Jiggle";