import * as React from "react";
import Sound from "react-sound";
import clsx from "clsx";
import Timeout = NodeJS.Timeout;

import { Collapse, Grid, IconButton, Slider, Theme, Tooltip, Typography } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import Forward10Icon from '@mui/icons-material/Forward10';
import Forward5Icon from '@mui/icons-material/Forward5';
import Replay10Icon from '@mui/icons-material/Replay10';
import Replay5Icon from '@mui/icons-material/Replay5';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import {getMsRemainder, getTimestamp} from "../../data/utils";
import {RP, TF} from "../../data/const";
import Audio from "../../data/Audio";
import SoundTick from "./SoundTick";

const styles = (theme: Theme) => createStyles({
  fullWidth: {
    width: '100%',
  },
  noPadding: {
    padding: '0 !important',
  },
  noTransition: {
    transition: 'unset',
  }
});

function getTimestampFromMs(ms: number): string {
  const secs = Math.floor(ms / 1000);
  return getTimestamp(secs);
}

class AudioControl extends React.Component {
  readonly props: {
    classes: any,
    audio: Audio,
    audioEnabled: boolean,
    singleTrack: boolean,
    lastTrack: boolean,
    repeat: string,
    scenePaths: Array<any>,
    startPlaying: boolean,
    shorterSeek?: boolean,
    showMsTimestamp?: boolean,
    onAudioSliderChange(e: MouseEvent, value: number): void,
    nextTrack?(): void,
    prevTrack?(): void,
    goBack?(): void,
    onPlaying?(position: number, duration: number): void,
    playTrack?(url: string): void,
    playNextScene?(): void,
  };

  readonly state = {
    playing: this.props.startPlaying,
    position: 0,
    duration: 0,
    tick: false,
  };

  render() {
    const classes = this.props.classes;
    const audio = this.props.audio;
    const playing = this.state.playing
      ? (Sound as any).status.PLAYING
      : (Sound as any).status.PAUSED;

    const audioVolume = typeof audio.volume === 'number' ? audio.volume : 0;
    let msRemainder = undefined;
    if (this.props.showMsTimestamp) {
      msRemainder = getMsRemainder(this.state.position);
      if (msRemainder == ".000") {
        msRemainder = undefined;
      }
    }
    return (
      <React.Fragment key={audio.id}>
        {this.props.audioEnabled && this.props.audio.tick && this.state.playing && (
          <SoundTick
            url={this.props.audio.url}
            playing={playing}
            speed={this.props.audio.speed / 10}
            volume={this.props.audio.volume}
            tick={this.state.tick}
            onPlaying={this.onPlaying.bind(this)}
            onError={this.onError.bind(this)}
            onFinishedPlaying={this.onFinishedPlaying.bind(this)}
          />
        )}
        {this.props.audioEnabled && !this.props.audio.tick && (
          <Sound
            url={this.props.audio.url}
            playStatus={playing}
            playbackRate={this.props.audio.speed / 10}
            volume={this.props.audio.volume}
            position={this.state.position}
            onPlaying={this.onPlaying.bind(this)}
            onError={this.onError.bind(this)}
            onFinishedPlaying={this.onFinishedPlaying.bind(this)}
          />
        )}
        <Grid item xs={12} className={clsx(!this.props.audioEnabled && classes.noPadding)}>
          <Collapse in={this.props.audioEnabled} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Grid container spacing={1} alignItems="center" justifyContent="center">
                  <Grid item xs={12} sm={12}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Typography variant="caption" component="div" color="textSecondary">
                          {getTimestampFromMs(this.state.position)}
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Slider
                          valueLabelDisplay={msRemainder ? "auto" : "off"}
                          valueLabelFormat={msRemainder}
                          value={this.state.position}
                          classes={{
                            thumb: classes.noTransition,
                            track: classes.noTransition,
                          }}
                          max={this.state.duration}
                          onChange={this.onChangePosition.bind(this)}/>
                      </Grid>
                      <Grid item>
                        <Typography variant="caption" component="div" color="textSecondary">
                          {getTimestampFromMs(this.state.duration)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    {this.props.prevTrack && (
                      <Tooltip disableInteractive title="Prev Track">
                        <IconButton onClick={this.props.prevTrack.bind(this)} size="large">
                          <SkipPreviousIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip disableInteractive title="Jump Back">
                      <IconButton onClick={this.onBack.bind(this)} size="large">
                        {this.props.shorterSeek ? <Replay5Icon /> : <Replay10Icon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip disableInteractive title={this.state.playing ? "Pause" : "Play"}>
                      <IconButton
                        onClick={this.state.playing ? this.onPause.bind(this) : this.onPlay.bind(this)}
                        size="large">
                        {this.state.playing ? <PauseIcon/> : <PlayArrowIcon/>}
                      </IconButton>
                    </Tooltip>
                    <Tooltip disableInteractive title="Jump Forward">
                      <IconButton onClick={this.onForward.bind(this)} size="large">
                        {this.props.shorterSeek ? <Forward5Icon /> : <Forward10Icon />}
                      </IconButton>
                    </Tooltip>
                    {this.props.nextTrack && (
                      <Tooltip disableInteractive title="Next Track">
                        <IconButton onClick={this.props.nextTrack.bind(this)} size="large">
                          <SkipNextIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <VolumeDownIcon />
                  </Grid>
                  <Grid item xs>
                    <Slider value={audioVolume}
                            onChange={this.onAudioSliderChange.bind(this)}
                            aria-labelledby="audio-volume-slider" />
                  </Grid>
                  <Grid item>
                    <VolumeUpIcon />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </React.Fragment>
    );
  }

  _timeout: Timeout = null;
  _queueNextTrack = false;
  componentDidMount() {
    if (this.state.playing) {
      this.tickLoop(true);
    }
    this._queueNextTrack = false;
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.audio.url != props.audio.url) {
      this.setState({position: 0, duration: 0});
    }
    if ((this.props.audio.tick && !props.audio.tick) ||
      (this.props.audio.tick && props.audio.tickMode == TF.scene && this.props.audio.tickMode != TF.scene)){
      this.tickLoop(true);
    }
    if (this.state.playing != state.playing) {
      if (this.state.playing && this.props.audio.tick && this.props.audio.tickMode != TF.scene) {
        this.tickLoop(true)
      } else {
        clearTimeout(this._timeout);
      }
    }
    if (this.props.audio.tick && this.props.audio.tickMode == TF.scene && props.scenePaths && props.scenePaths.length > 0 && props.scenePaths !== this.props.scenePaths) {
      if (this._queueNextTrack) {
        this._queueNextTrack = false;
        this.props.nextTrack();
        this.setState({tick: !this.state.tick, position: 0, duration: 0});
      } else {
        this.setState({tick: !this.state.tick});
      }
    }
  }

  componentWillUnmount() {
    if(this._timeout != null) {
      clearTimeout(this._timeout);
    }
    this._queueNextTrack = null;
  }

  tickLoop(starting: boolean = false) {
    if (!starting) {
      if (this._queueNextTrack) {
        this._queueNextTrack = false;
        this.props.nextTrack();
        this.setState({tick: !this.state.tick, position: 0, duration: 0});
      } else {
        this.setState({tick: !this.state.tick});
      }
    }
    if (this.props.audio.tick) {
      let timeout: number = null;
      switch (this.props.audio.tickMode) {
        case TF.random:
          timeout = Math.floor(Math.random() * (this.props.audio.tickMaxDelay - this.props.audio.tickMinDelay + 1)) + this.props.audio.tickMinDelay;
          break;
        case TF.sin:
          const sinRate = (Math.abs(this.props.audio.tickSinRate - 100) + 2) * 1000;
          timeout = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.audio.tickMaxDelay - this.props.audio.tickMinDelay + 1)) + this.props.audio.tickMinDelay;
          break;
        case TF.constant:
          timeout = this.props.audio.tickDelay;
          break;
        case TF.bpm:
          const bpmMulti = this.props.audio.tickBPMMulti / 10;
          timeout = 60000 / (this.props.audio.bpm * bpmMulti);
          // If we cannot parse this, default to 1s
          if (!timeout) {
            timeout = 1000;
          }
          break;
      }
      if (timeout != null) {
        this._timeout = setTimeout(this.tickLoop.bind(this), timeout);
        return
      }
    }
    this._timeout = null;
  }

  onChangePosition(e: MouseEvent, value: number) {
    this.setState({position: value});
  }

  onAudioSliderChange(e: MouseEvent, value: number) {
    this.props.audio.volume = value;
    this.props.onAudioSliderChange(e, value);
  }

  onFinishedPlaying() {
    // Increment play count upon finish
    if (this.props.playTrack) {
      this.props.playTrack(this.props.audio.url);
    }

    if (this.props.audio.stopAtEnd && this.props.goBack) {
      this.props.goBack();
    } else if (this.props.audio.nextSceneAtEnd && this.props.playNextScene) {
      this.props.playNextScene();
      this.setState({position: 0, duration: 0});
    } else {
      if (this.props.repeat == RP.all) {
        if (this.props.audio.tick) {
          this._queueNextTrack = true;
        } else {
          if (this.props.singleTrack) {
            this.setState({position: 1});
          } else {
            this.props.nextTrack();
            this.setState({position: 0, duration: 0});
          }
        }
      } else if (this.props.repeat == RP.one) {
        this.setState({position: 1});
      } else if (this.props.repeat == RP.none) {
        if (!this.props.lastTrack) {
          if (this.props.audio.tick) {
            this._queueNextTrack = true;
          } else {
            this.props.nextTrack();
            this.setState({position: 0, duration: 0});
          }
        } else {
          this.setState({playing: false});
        }
      }
    }
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
    if (this.props.onPlaying) {
      this.props.onPlaying(position, duration)
    }
    this.setState({position: position , duration: duration});
  }

  onError(errorCode: number, description: string) {
    console.error(errorCode + " - " + description);
  }

  onPlay() {
    this.setState({playing: true});
  }

  onPause() {
    this.setState({playing: false});
  }

  onBack() {
    const amount = this.props.shorterSeek ? 5000 : 10000;
    let position = this.state.position - amount;
    if (position < 0) {
      position = 0;
    }
    this.setState({position: position});
  }

  onForward() {
    const amount = this.props.shorterSeek ? 5000 : 10000;
    let position = this.state.position + amount;
    if (position > this.state.duration) {
      position = this.state.duration;
    }
    this.setState({position: position});
  }
}

(AudioControl as any).displayName="AudioControl";
export default withStyles(styles)(AudioControl as any);