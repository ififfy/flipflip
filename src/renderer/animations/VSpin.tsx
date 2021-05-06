import * as React from 'react';
import {Spring, animated} from "react-spring/renderprops";

export default class VSpin extends React.Component {
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
        from={{transform: 'rotateX(0deg)'}}
        to={{transform: this.state.toggle ? 'rotateX(360deg)' : 'rotateX(0deg)'}}
      >
      {props => (
        <animated.div
          className={this.props.className}
          style={this.props.style ? {...props,...this.props.style} : props}
          title={this.props.title}
          onMouseEnter={() => {this.setState({toggle: !this.state.toggle})}}
          onClick={this.props.onClick}>
          {this.props.children}
        </animated.div>
      )}
    </Spring>)

  }
}

(VSpin as any).displayName="VSpin";