import * as React from 'react';
import {animated, Transition} from "react-spring/renderprops";

export default class Strobe extends React.Component {
  readonly props: {
    className?: string,
    duration: number,
    pulse: boolean,
    delay: number,
    color: string,
    opacity: number,
  };

  readonly state = {
    toggleStrobe: false,
  };

  _strobeInterval: NodeJS.Timer = null;
  _strobeDelay = 0;

  render() {
    return (
      <Transition
        reset
        unique
        items={this.state.toggleStrobe}
        config={{duration: this.props.duration}}
        from={{ backgroundColor: this.props.color, opacity: this.props.opacity}}
        enter={{ opacity: 0 }}
        leave={{ opacity: 0 }} >
        {toggle => props => <animated.div className={this.props.className ? this.props.className : "Strobe u-fill-container"} style={props}/>}
      </Transition>
    )
  }

  componentDidMount() {
    this._strobeInterval = setInterval(() => {
      this.setState({toggleStrobe: !this.state.toggleStrobe})
    }, this.props.pulse ? this.props.delay : this.props.duration);
  }

  componentDidUpdate() {
    const strobeDelay = this.props.pulse ? this.props.delay : this.props.duration;
    if (strobeDelay != this._strobeDelay) {
      clearInterval(this._strobeInterval);
      this._strobeDelay = strobeDelay;
      this._strobeInterval = setInterval(() => {
        this.setState({toggleStrobe: !this.state.toggleStrobe})
      }, this._strobeDelay);
    }
  }

  componentWillUnmount() {
    clearInterval(this._strobeInterval);
    this._strobeInterval = null;
  }
}