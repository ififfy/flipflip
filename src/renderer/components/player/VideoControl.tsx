import * as React from 'react';
import SimpleSliderInput from "../ui/SimpleSliderInput";

function getTimeStamp(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor(secs % 3600 / 60);
  const seconds = Math.floor(secs % 3600 % 60);
  if (hours > 0) {
    return hours + ":" + (minutes >= 10 ? minutes : "0" + minutes) + ":" + (seconds >= 10 ? seconds : "0" + seconds);
  } else {
    return minutes + ":" + (seconds >= 10 ? seconds : "0" + seconds);
  }
}

export default class VideoControl extends React.Component {
  readonly props: {
    video: HTMLVideoElement,
    showAll: boolean,
    volume: number,
    onChangeVolume(volume: number): void,
  };

  readonly state = {
    playing: true,
  };

  render() {
    return(
      <React.Fragment>
        {this.props.showAll && (
          <React.Fragment>
            <div>
              <span style={{float: 'right'}}>{getTimeStamp(this.props.video.duration)}</span>
              <SimpleSliderInput
                label={getTimeStamp(this.props.video.currentTime)}
                value={this.props.video.currentTime}
                min={0}
                max={this.props.video.duration}
                isEnabled={true}
                onChange={this.onChangePosition.bind(this)}/>
            </div>
            <div>
              <div
                className="u-button u-icon-button u-clickable"
                title="Back"
                onClick={this.onBack.bind(this)}>
                <div className="u-media-back"/>
              </div>
              {!this.state.playing && (
                <div
                  className="u-button u-icon-button u-clickable"
                  title="Play"
                  style={{margin: "0 5px"}}
                  onClick={this.onPlay.bind(this)}>
                  <div className="u-media-play"/>
                </div>
              )}
              {this.state.playing && (
                <div
                  className="u-button u-icon-button u-clickable"
                  title="Pause"
                  style={{margin: "0 5px"}}
                  onClick={this.onPause.bind(this)}>
                  <div className="u-media-pause"/>
                </div>
              )}
              <div
                className="u-button u-icon-button u-clickable"
                title="Forward"
                onClick={this.onForward.bind(this)}>
                <div className="u-media-forward"/>
              </div>
            </div>
          </React.Fragment>
        )}
        <div className="VolumeControl">
          <div
            className="u-small-icon-button">
            <div className="u-volume-down"/>
          </div>
          <SimpleSliderInput
            label=""
            min={0}
            max={100}
            value={this.props.volume}
            isEnabled={true}
            onChange={this.onChangeVolume.bind(this)} />
          <div
            className="u-small-icon-button">
            <div className="u-volume-up"/>
          </div>
        </div>
      </React.Fragment>
    );
  }

  onPlay() {
    this.setState({playing: true});
    this.props.video.play();
  }

  onPause() {
    this.setState({playing: false});
    this.props.video.pause();
  }

  onChangeVolume(volume: string) {
    this.props.onChangeVolume(parseInt(volume, 10));
    if (this.props.video) {
      this.props.video.volume = parseInt(volume, 10) / 100;
    }
  }

  onBack() {
    let position = this.props.video.currentTime - 15;
    if (position < 0) {
      position = 0;
    }
    this.onChangePosition(position);
  }

  onForward() {
    let position = this.props.video.currentTime + 15;
    if (position > this.props.video.duration) {
      position = this.props.video.duration;
    }
    this.onChangePosition(position);
  }

  onChangePosition(position: any) {
    this.setState({position: parseInt(position, 10)});
    this.props.video.currentTime = parseInt(position, 10);
  }
}