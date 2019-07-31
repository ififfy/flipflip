import React from 'react';
import ProgressBar from 'progressbar.js'

export default class Progress extends React.Component {
  readonly props: {
    total: number,
    current: number,
    message: string,
    children?: React.ReactNode,
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
        {this.props.children}
      </div>
    );
  }

  componentDidUpdate(props: any, state: any) {
    let progress;
    if (!this.state) {
      progress = new ProgressBar.Circle('#progress', {
        color: '#FFFFFF',
        strokeWidth: 2,
        text: {
          value: this.props.message + "<br/>" + this.props.current + " / " + this.props.total,
        },
        duration: 100,
      });
      this.setState({progress: progress});
    } else {
      progress = this.state.progress;
    }
    progress.animate((this.props.current + 0.1) / (this.props.total + 0.1));
    progress.setText("<p>" + this.props.message + "</p><p>" + this.props.current + " / " + this.props.total + "</p>");
  }
};