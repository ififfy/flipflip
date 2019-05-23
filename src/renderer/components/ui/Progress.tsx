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

  componentWillReceiveProps(props: any) {
    let progress;
    if (!this.state) {
      progress = new ProgressBar.Circle('#progress', {
        color: '#FFFFFF',
        strokeWidth: 2,
        text: {
          value: props.message + "<br/>" + props.current + " / " + props.total,
        },
        duration: 100,
      });
      this.setState({progress: progress});
    } else {
      progress = this.state.progress;
    }
    progress.animate((props.current + 0.1) / (props.total + 0.1));
    progress.setText("<p>" + props.message + "</p><p>" + props.current + " / " + props.total + "</p>");
  }
};