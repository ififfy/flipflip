import React from 'react';
import ProgressBar from 'progressbar.js'

export default class Modal extends React.Component {
  readonly props: {
    total: number,
    current: number,
    message: string,
  };

  readonly state: {
    progress: any
  };

  render() {
    return (
      <div className="ProgressIndicator">
        <div className="ProgressContainer">
          <div className="progress" id="progress"/>
        </div>
      </div>
    );
  }

  componentDidMount() {
    const progress = new ProgressBar.Circle('#progress', {
      color: '#FFFFFF',
      strokeWidth: 2,
      text: {
        value: this.props.message + "<br/>" + this.props.current + " / " + this.props.total,
      },
    });
    this.setState({progress});
    progress.animate((this.props.current + 0.1) / (this.props.total + 0.1));
    progress.setText("<p>" + this.props.message + "</p><p>" + this.props.current + " / " + this.props.total + "</p>");
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return nextProps.current !== this.props.current;
  }

  componentWillReceiveProps(props: any) {
    if (this.state && this.state.progress && props.current != this.props.current) {
      this.state.progress.animate((props.current + 0.1) / (this.props.total + 0.1));
      this.state.progress.setText("<p>" + this.props.message + "</p><p>" + props.current + " / " + this.props.total + "</p>");
    }
  }
};