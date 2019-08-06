import * as React from 'react';
import InputRange from 'react-input-range';

import {getTimestamp} from "../../data/utils";
import {VC} from "../../data/const";
import SimpleSliderInput from "../ui/SimpleSliderInput";

export default class VideoControl extends React.Component {
  readonly props: {
    video: HTMLVideoElement,
    volume: number,
    mode: string,
    clip?: {min: number, max: number},
    onChangeVolume(volume: number): void,
  };

  readonly state = {
    playing: true,
    update: true,
  };

  _interval: NodeJS.Timer = null;

  render() {
    switch(this.props.mode) {
      case VC.sceneDetail:
        return (
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
              onChange={this.onChangeVolume.bind(this)}/>
            <div
              className="u-small-icon-button">
              <div className="u-volume-up"/>
            </div>
          </div>
        );
      case VC.player:
        return (
          <React.Fragment>
            <div className="VideoSlider">
              <InputRange
                minValue={this.props.video.hasAttribute("start") ? parseInt(this.props.video.getAttribute("start"), 10) : 0}
                maxValue={this.props.video.hasAttribute("end") ? parseInt(this.props.video.getAttribute("end"), 10) : this.props.video.duration}
                value={this.props.video.currentTime}
                formatLabel={(value) => getTimestamp(value)}
                onChange={this.onChangePosition.bind(this)}/>
            </div>
            <div className="VideoControls">
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
                onChange={this.onChangeVolume.bind(this)}/>
              <div
                className="u-small-icon-button">
                <div className="u-volume-up"/>
              </div>
            </div>
          </React.Fragment>
        );
      case VC.sceneClipper:
        return (
          <div className="TrackControls">
            <div className="VideoSlider">
              <InputRange
                minValue={this.props.clip ? this.props.clip.min : 0}
                maxValue={this.props.clip ? this.props.clip.max : this.props.video.duration}
                value={this.props.video.currentTime}
                formatLabel={(value) => getTimestamp(value)}
                onChange={this.onChangePosition.bind(this)}/>
            </div>
            <div className="VideoControls">
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
          </div>
        );
    }
  }

  onPlay() {
    this.setState({playing: true});
    this.props.video.play();
  }

  onPause() {
    this.setState({playing: false});
    this.props.video.pause();
  }

  onChangeVolume(volume: number) {
    this.props.onChangeVolume(volume);
    if (this.props.video) {
      this.props.video.volume = volume / 100;
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

  onChangePosition(position: number) {
    this.props.video.currentTime = position;
  }

  componentDidMount() {
    if (this.props.mode != VC.sceneDetail) {
      this._interval = setInterval(() => {
        // Trigger update to update position slider
        this.setState({update: !this.state.update});
        if (this.props.clip) {
          if (this.props.video.paused && this.state.playing) {
            this.setState({playing: false});
          } else if (!this.props.video.paused && !this.state.playing) {
            this.setState({playing: true});
          }
          if (this.props.video.currentTime < this.props.clip.min ||
              this.props.video.currentTime > this.props.clip.max) {
            this.props.video.currentTime = this.props.clip.min;
          }
        }
      }, 50);
    }
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }
}