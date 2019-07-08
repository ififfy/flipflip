import * as React from 'react';
import Sound from "react-sound";
import Timeout = NodeJS.Timeout;

import {AT} from "../../data/const";
import Audio from "../library/Audio";
import SoundTick from "./SoundTick";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleURLInput from "../ui/SimpleURLInput";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";

function getTimeStamp(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor(secs % 3600 / 60);
  const seconds = Math.floor(secs % 3600 % 60);
  if (hours > 0) {
    return hours + ":" + (minutes >= 10 ? minutes : "0" + minutes) + ":" + (seconds >= 10 ? seconds : "0" + seconds);
  } else {
    return minutes + ":" + (seconds >= 10 ? seconds : "0" + seconds);
  }
}

export default class AudioControl extends React.Component {
  readonly props: {
    audio: Audio,
    isPlaying: boolean,
    showAll: boolean,
    scenePaths: Array<any>,
    onEditKey(key: string, value: string): void,
  };

  readonly state = {
    playing: this.props.isPlaying,
    position: 0,
    duration: 0,
    tick: false,
  };

  _audio = "";
  _timeout: Timeout = null;

  shouldComponentUpdate(props: any, state: any) {
    let audio = JSON.parse(this._audio);
    return ((audio.url !== props.audio.url) ||
      (audio.volume !== props.audio.volume) ||
      (audio.speed !== props.audio.speed) ||
      (audio.tick !== props.audio.tick) ||
      (audio.tickMode !== props.audio.tickMode) ||
      (audio.tickDelay !== props.audio.tickDelay) ||
      (audio.tickMinDelay !== props.audio.tickMinDelay) ||
      (audio.tickMaxDelay !== props.audio.tickMaxDelay) ||
      (audio.tickSinRate !== props.audio.tickSinRate) ||
      (this.props.scenePaths !== props.scenePaths) ||
      (this.props.isPlaying !== props.isPlaying) ||
      (this.state.playing !== state.playing) ||
      (this.state.position !== state.position) ||
      (this.state.duration !== state.duration) ||
      (this.state.tick !== state.tick));
  }

  componentDidMount() {
    this._audio=JSON.stringify(this.props.audio);
    if (this.props.showAll) {
      this.tickLoop(true);
    }
  }

  componentDidUpdate(props: any) {
    if (props.isPlaying && !this.props.isPlaying) {
      this.onPause();
    }
    if (!props.isPlaying && this.props.isPlaying) {
      this.onPlay();
    }
    let audio = JSON.parse(this._audio);
    if ((this.props.audio.tick && !audio.tick) ||
        (this.props.audio.tick && audio.tickMode == AT.scene && this.props.audio.tickMode != AT.scene)){
      if (this.props.showAll) {
        this.tickLoop(true);
      }
    }
    if (this.props.audio.tick && this.props.audio.tickMode == AT.scene && props.scenePaths && props.scenePaths.length > 0 && props.scenePaths !== this.props.scenePaths) {
      this.setState({tick: !this.state.tick});
    }
    this._audio=JSON.stringify(this.props.audio);
  }

  componentWillUnmount() {
    if(this._timeout != null) {
      clearTimeout(this._timeout);
    }
  }

  render() {
    const playing = this.state.playing
      ? (Sound as any).status.PLAYING
      : (Sound as any).status.PAUSED;
    return (
      <React.Fragment>
        <SimpleURLInput
          isEnabled={true}
          onChange={this.props.onEditKey.bind(this, 'url')}
          label="URL"
          value={this.props.audio.url}/>
        {this.props.showAll && (
          <React.Fragment>
            {this.props.audio.tick && (
              <SoundTick
                url={this.props.audio.url}
                playing={playing}
                speed={this.props.audio.speed / 10}
                volume={this.props.audio.volume}
                tick={this.state.tick}
              />
            )}
            {!this.props.audio.tick && (
              <Sound
                url={this.props.audio.url}
                playStatus={playing}
                playbackRate={this.props.audio.speed / 10}
                loop={true}
                autoLoad={true}
                volume={this.props.audio.volume}
                position={this.state.position}
                onPlaying={this.onPlaying.bind(this)}
              />
            )}
            <div>
              <span style={{float: 'right'}}>{getTimeStamp(this.state.duration)}</span>
              <SimpleSliderInput
                label={getTimeStamp(this.state.position)}
                value={this.state.position}
                min={0}
                max={this.state.duration}
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
            <SimpleSliderInput
              label={`Speed: ${this.props.audio.speed / 10}x`}
              min={5} max={40}
              value={this.props.audio.speed}
              isEnabled={true}
              onChange={this.props.onEditKey.bind(this, 'speed')}/>
          </React.Fragment>
        )}
        <div className="TickGroup">
          <div>
            <SimpleCheckbox
              text="Tick"
              isOn={this.props.audio.tick}
              onChange={this.props.onEditKey.bind(this, 'tick')}/>
            {this.props.audio.tick && (
              <SimpleOptionPicker
                label=""
                value={this.props.audio.tickMode}
                keys={Object.values(AT)}
                onChange={this.props.onEditKey.bind(this, 'tickMode').bind(this)} />
            )}
            {this.props.audio.tick && this.props.audio.tickMode == AT.sin && (
              <div>
                <SimpleSliderInput
                  label={`Wave Rate: ${this.props.audio.tickSinRate}`}
                  min={1}
                  max={100}
                  value={this.props.audio.tickSinRate}
                  isEnabled={true}
                  onChange={this.props.onEditKey.bind(this, 'tickSinRate')}/>
              </div>
            )}
          </div>
          {this.props.audio.tick && this.props.audio.tickMode == AT.constant && (
            <div>
              Every
              <SimpleNumberInput
                label=""
                value={this.props.audio.tickDelay}
                isEnabled={true}
                min={0}
                onChange={this.props.onEditKey.bind(this, 'tickDelay')}/>
              ms
            </div>
          )}
          {this.props.audio.tick && (this.props.audio.tickMode == AT.random || this.props.audio.tickMode == AT.sin) && (
            <div>
              Between
              <SimpleNumberInput
                label=""
                value={this.props.audio.tickMinDelay}
                isEnabled={true}
                min={0}
                onChange={this.props.onEditKey.bind(this, 'tickMinDelay')}/>
              ms and
              <SimpleNumberInput
                label=""
                value={this.props.audio.tickMaxDelay}
                isEnabled={true}
                min={0}
                onChange={this.props.onEditKey.bind(this, 'tickMaxDelay')}/>
              ms
            </div>
          )}
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
            value={this.props.audio.volume}
            isEnabled={true}
            onChange={this.props.onEditKey.bind(this, 'volume')} />
          <div
            className="u-small-icon-button">
            <div className="u-volume-up"/>
          </div>
        </div>
      </React.Fragment>
    )
  }

  tickLoop(starting: boolean = false) {
    if (!starting) {
      this.setState({tick: !this.state.tick});
    }
    if (this.props.audio.tick) {
      let timeout: number = null;
      switch (this.props.audio.tickMode) {
        case AT.random:
          timeout = Math.floor(Math.random() * (this.props.audio.tickMaxDelay - this.props.audio.tickMinDelay + 1)) + this.props.audio.tickMinDelay;
          break;
        case AT.sin:
          const sinRate = (Math.abs(this.props.audio.tickSinRate - 100) + 2) * 1000;
          timeout = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.audio.tickMaxDelay - this.props.audio.tickMinDelay + 1)) + this.props.audio.tickMinDelay;
          break;
        case AT.constant:
          timeout = this.props.audio.tickDelay;
          break;
      }
      if (timeout != null) {
        this._timeout = setTimeout(this.tickLoop.bind(this), timeout);
        return
      }
    }
    this._timeout = null;
  }

  onPlay() {
    this.setState({playing: true});
  }

  onPause() {
    this.setState({playing: false});
  }

  onPlaying(soundData: any) {
    let position = this.state.position;
    let duration = this.state.duration;
    if (soundData.position) {
      position = soundData.position;
    }
    if (soundData.duration) {
      duration = soundData.duration;
    }
    this.setState({position: position, duration: duration})
  }

  onBack() {
    let position = this.state.position - 15000;
    if (position < 0) {
      position = 0;
    }
    this.setState({position: position});
  }

  onForward() {
    let position = this.state.position + 15000;
    if (position > this.state.duration) {
      position = this.state.duration;
    }
    this.setState({position: position});
  }

  onChangePosition(position: string) {
    this.setState({position: parseInt(position, 10)});
  }
}