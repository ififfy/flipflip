import * as React from "react";
import { Spring, animated } from "react-spring/renderprops";

interface VSpinProps {
  className?: string;
  title?: string;
  style?: any;
  onClick?(): void;
  children?: React.ReactNode;
}

export default class VSpin extends React.Component<VSpinProps> {
  readonly props: VSpinProps;

  readonly state: {
    toggle: boolean;
  };

  constructor(props: VSpinProps) {
    super(props);

    this.state = {
      toggle: false,
    };
  }

  render() {
    return (
      <Spring
        from={{ transform: "rotateX(0deg)" }}
        to={{
          transform: this.state.toggle ? "rotateX(360deg)" : "rotateX(0deg)",
        }}
      >
        {(props) => (
          <animated.div
            className={this.props.className}
            style={this.props.style ? { ...props, ...this.props.style } : props}
            title={this.props.title}
            onMouseEnter={() => {
              this.setState({ toggle: !this.state.toggle });
            }}
            onClick={this.props.onClick}
          >
            {this.props.children}
          </animated.div>
        )}
      </Spring>
    );
  }
}

(VSpin as any).displayName = "VSpin";
