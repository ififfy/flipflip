import * as React from 'react';
import {Spring, animated} from "react-spring/renderprops";

export default class Spin extends React.Component {
  readonly props: {
    className?: string,
    title?: string,
    style?: any,
    onClick?(): void,
    children?: React.ReactNode,
  };

  readonly state = {
    toggle: false,
  };

  render() {
    return (
      <Spring
        from={{transform: 'rotateY(0deg)'}}
        to={{transform: this.state.toggle ? 'rotateY(180deg)' : 'rotateY(0deg)'}}
      >
      {props => (
        <animated.div
          className={this.props.className}
          style={this.props.style ? {...props,...this.props.style} : props}
          title={this.props.title}
          onMouseEnter={() => {this.setState({toggle: !this.state.toggle})}}
          onClick={this.props.onClick}>
          <Spring
            from={{transform: 'rotateY(0deg)'}}
            to={{transform: this.state.toggle ? 'rotateY(-180deg)' : 'rotateY(0deg)'}}
          >
            {props => (
              <animated.div
                style={props}>
                {this.props.children}
              </animated.div>
            )}
          </Spring>
        </animated.div>
      )}
    </Spring>)

  }
}

(Spin as any).displayName="Spin";