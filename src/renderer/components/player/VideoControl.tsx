import * as React from "react";

import { Grid, IconButton, Slider, Theme, Tooltip, Typography } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import Forward5Icon from '@mui/icons-material/Forward5';
import Forward10Icon from '@mui/icons-material/Forward10';
import Forward30Icon from '@mui/icons-material/Forward30';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import Replay5Icon from '@mui/icons-material/Replay5';
import Replay10Icon from '@mui/icons-material/Replay10';
import Replay30Icon from '@mui/icons-material/Replay30';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SpeedIcon from '@mui/icons-material/Speed';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';


import {getTimestamp} from "../../data/utils";
import Clip from "../../data/Clip";

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  timeSlider: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  valueLabel: {
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
    top: 2
  },
  noTransition: {
    transition: 'unset',
  }
});

class VideoControl extends React.Component {
  readonly props: {
    classes: any,
    video: HTMLVideoElement,
    useHotkeys?: boolean,
    player?: boolean,
    volume?: any,
    clip?: Clip,
    clipValue?: Array<number>,
    clips?: Array<Clip>,
    skip?: number,
    onChangeVolume(volume: number): void,
    onChangeSpeed?(speed: number): void,
    nextTrack?(): void,
  };

  readonly state = {
    playing: true,
    update: true,
    marks: Array<{value: number, label: string}>(),
    showSpeed: false,
  };

  render() {
    if (this.props.video == null) return <Grid container spacing={1} alignItems="center" justifyContent={this.props.player ? "center" : "flex-start"}/>;
    const classes = this.props.classes;
    return (
      <Grid container spacing={1} alignItems="center" justifyContent={this.props.player ? "center" : "flex-start"}>
        <Grid item xs={this.props.player ? 12 : true} className={classes.timeSlider}>
          <Slider
            min={this.props.clipValue ? this.props.clipValue[0] : 0}
            max={this.props.clipValue ? this.props.clipValue[1] : this.props.video.duration}
            color={this.props.clipValue ? "secondary" : "primary"}
            value={this.props.video.currentTime}
            classes={{
              valueLabel: classes.valueLabel,
              thumb: classes.noTransition,
              track: classes.noTransition,
            }}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => getTimestamp(value)}
            marks={this.state.marks}
            onChange={this.onChangePosition.bind(this)}/>
        </Grid>
        <Grid item>
          <Grid container alignItems="center">
            <Grid item xs={12} style={{textAlign: 'center'}}>
              {this.props.nextTrack && this.state.showSpeed && (
                <Tooltip disableInteractive title="Show Volume Controls">
                  <IconButton onClick={this.onSwapSlider.bind(this)} size="large">
                    <VolumeUpIcon />
                  </IconButton>
                </Tooltip>
              )}
              {this.props.nextTrack && !this.state.showSpeed && (
                <Tooltip disableInteractive title="Show Speed Controls">
                  <IconButton onClick={this.onSwapSlider.bind(this)} size="large">
                    <SpeedIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip disableInteractive title="Jump Back">
                <IconButton onClick={this.onBack.bind(this)} size="large">
                  {(this.props.skip == 5) && (<Replay5Icon/>)}
                  {(!this.props.skip || this.props.skip == 10) && (<Replay10Icon/>)}
                  {(this.props.skip == 30) && (<Replay30Icon/>)}
                  {(this.props.skip == 60) && (<FastRewindIcon/>)}
                  {(this.props.skip == 120) && (<FastRewindIcon/>)}
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
                  {(this.props.skip == 5) && (<Forward5Icon/>)}
                  {(!this.props.skip || this.props.skip == 10) && (<Forward10Icon/>)}
                  {(this.props.skip == 30) && (<Forward30Icon/>)}
                  {(this.props.skip == 60) && (<FastForwardIcon/>)}
                  {(this.props.skip == 120) && (<FastForwardIcon/>)}
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
            <Grid item xs={12}>
              {this.state.showSpeed && (
                <React.Fragment>
                  <Typography variant="caption" component="div" color="textSecondary">
                    Video Speed {this.props.video.playbackRate}x
                  </Typography>
                  <Slider
                    min={1}
                    max={40}
                    defaultValue={this.props.video.playbackRate * 10}
                    onChangeCommitted={this.onChangeSpeed.bind(this)}
                    valueLabelDisplay={'auto'}
                    valueLabelFormat={(v) => v/10 + "x"}
                    aria-labelledby="video-speed-slider"/>
                </React.Fragment>
              )}
              {!this.state.showSpeed && (
                <Grid container spacing={1}>
                  <Grid item>
                    <VolumeDownIcon/>
                  </Grid>
                  <Grid item xs>
                    <Slider value={this.props.volume ? parseInt(this.props.volume) : this.props.video.volume * 100}
                            onChange={this.onChangeVolume.bind(this)}
                            marks={this.props.clip && this.props.clip.volume != null ? [{value: this.props.clip.volume, label: "↑"}] : []}/>
                  </Grid>
                  <Grid item>
                    <VolumeUpIcon/>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  _interval: any = null;
  componentDidMount() {
    this._interval = setInterval(() => {
      if (!this.props.video) return;
      if (!this.props.video.paused) {
        this.triggerUpdate();
      }
      if (this.props.clipValue) {
        if (this.props.video.paused && this.state.playing) {
          this.setState({playing: false});
        } else if (!this.props.video.paused && !this.state.playing) {
          this.setState({playing: true});
        }
        if (this.props.video.currentTime < this.props.clipValue[0] ||
          this.props.video.currentTime > this.props.clipValue[1]) {
          if (this.props.video.onended) {
            this.props.video.onended(null);
          }
          this.props.video.currentTime = this.props.clipValue[0];
        }
      }
    }, 50);
    this.setState({marks: this.getMarks()});
    if (this.props.useHotkeys) {
      if (this.props.player) {
        window.addEventListener('keydown', this.onPlayerKeyDown, false);
      } else {
        window.addEventListener('keydown', this.onKeyDown, false);
      }
    }
  }

  componentDidUpdate(props: any) {
    // If the clip/video has changed, or we don't have the expected number of marks
    if (this.props.clipValue != props.clipValue || this.props.video != props.video ||
      (this.props.clips && this.state.marks.length !=
        (this.props.clipValue ? 2 : this.props.clips.length + 2))) {
      this.setState({marks: this.getMarks()});
    }
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    if (this.props.useHotkeys) {
      if (this.props.player) {
        window.removeEventListener('keydown', this.onPlayerKeyDown);
      } else {
        window.removeEventListener('keydown', this.onKeyDown);
      }
    }
  }

  onSwapSlider() {
    this.setState({showSpeed: !this.state.showSpeed});
  }

  triggerUpdate() {
    this.setState({update: !this.state.update});
  }

  onChangePosition(e: MouseEvent, position: number) {
    this.props.video.currentTime = position;
    if (this.props.video.paused) {
      this.triggerUpdate();
    }
  }

  onChangeVolume(e: MouseEvent, volume: number) {
    if (volume > 100) {
      volume = 100;
    }
    if (volume < 0) {
      volume = 0;
    }
    this.props.onChangeVolume(volume);
    if (this.props.video) {
      this.props.video.volume = volume / 100;
      this.triggerUpdate();
    }
  }

  onChangeSpeed(e: MouseEvent, speed: number) {
    this.props.onChangeSpeed(speed);
    if (this.props.video) {
      this.props.video.playbackRate = speed / 10;
      this.triggerUpdate();
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

  onBack() {
    let skip = !!this.props.skip ? this.props.skip : 10;
    let position = this.props.video.currentTime - skip;
    if (position < 0) {
      position = 0;
    }
    this.onChangePosition(null, position);
  }

  onForward() {
    let skip = !!this.props.skip ? this.props.skip : 10;
    let position = this.props.video.currentTime + skip;
    if (position > this.props.video.duration) {
      position = this.props.video.duration;
    }
    this.onChangePosition(null, position);
  }

  getMarks(): Array<{value: number, label: string}> {
    if (!this.props.video) return [];
    const min = this.props.clipValue ?  this.props.clipValue[0] : 0;
    const max = this.props.clipValue ? this.props.clipValue[1] : this.props.video.duration;
    const marks = [{value: min, label: getTimestamp(min)}, {value: max, label: getTimestamp(max)}];
    if (!this.props.clipValue && this.props.clips) {
      this.props.clips.forEach((clip, index) => {
        marks.push({value: clip.start, label: (index+1).toString()})
      })
    }
    return marks;
  }

  onKeyDown = (e: KeyboardEvent) => {
    const focus = document.activeElement.tagName.toLocaleLowerCase();
    switch (e.key) {
      case ' ':
        e.preventDefault();
        this.state.playing ? this.onPause() : this.onPlay();
        break;
      case 'ArrowUp':
        if (e.ctrlKey) {
          e.preventDefault();
          this.onChangeVolume(null,(this.props.video.volume * 100) + 5);
        }
        break;
      case 'ArrowDown':
        if (e.ctrlKey) {
          e.preventDefault();
          this.onChangeVolume(null,(this.props.video.volume * 100) - 5);
        }
        break;
      case 'ArrowLeft':
        if (focus != "input") {
          e.preventDefault();
          this.onBack();
        }
        break;
      case 'ArrowRight':
        if (focus != "input") {
          e.preventDefault();
          this.onForward();
        }
        break;
    }
  };

  onPlayerKeyDown = (e: KeyboardEvent) => {
    const focus = document.activeElement.tagName.toLocaleLowerCase();
    if (e.shiftKey) {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          this.state.playing ? this.onPause() : this.onPlay();
          break;
        case 'ArrowUp':
          if (e.ctrlKey) {
            e.preventDefault();
            this.onChangeVolume(null,(this.props.video.volume * 100) + 5);
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey) {
            e.preventDefault();
            this.onChangeVolume(null,(this.props.video.volume * 100) - 5);
          }
          break;
        case 'ArrowLeft':
          if (focus != "input") {
            e.preventDefault();
            this.onBack();
          }
          break;
        case 'ArrowRight':
          if (focus != "input") {
            e.preventDefault();
            this.onForward();
          }
          break;
      }
    }
  };
}

(VideoControl as any).displayName="VideoControl";
export default withStyles(styles)(VideoControl as any);