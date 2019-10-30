import * as React from "react";

import {createStyles, Grid, IconButton, Slider, Theme, Tooltip, withStyles} from "@material-ui/core";
import ValueLabel from "@material-ui/core/Slider/ValueLabel";

import Forward10Icon from '@material-ui/icons/Forward10';
import Replay10Icon from '@material-ui/icons/Replay10';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';


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
});

const StyledValueLabel = withStyles((theme: Theme) => createStyles({
  offset: {
    top: -5,
    left: 'calc(-50% + 8px)',
    fontSize: '1rem',
  },
  circle: {
    width: theme.spacing(1),
    height: theme.spacing(1),
    backgroundColor: 'transparent',
  },
  label: {
    color: theme.palette.text.primary,
  }
}))(ValueLabel as any);

class VideoControl extends React.Component {
  readonly props: {
    classes: any,
    video: HTMLVideoElement,
    player?: boolean,
    volume?: any,
    clip?: Array<number>,
    clips?: Array<Clip>,
      onChangeVolume(volume: number): void,
  };

  readonly state = {
    playing: true,
    update: true,
    marks: Array<{value: number, label: string}>(),
  };

  render() {
    const classes = this.props.classes;
    return (
      <Grid container spacing={1} alignItems="center" justify={this.props.player ? "center" : "flex-start"}>
        <Grid item xs={this.props.player ? 12 : true} className={classes.timeSlider}>
          <Slider
            min={this.props.clip ? this.props.clip[0] : 0}
            max={this.props.clip ? this.props.clip[1] : this.props.video.duration}
            color={this.props.clip ? "secondary" : "primary"}
            value={this.props.video.currentTime}
            ValueLabelComponent={(props) => <StyledValueLabel {...props}/>}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => getTimestamp(value)}
            marks={this.state.marks}
            onChange={this.onChangePosition.bind(this)}/>
        </Grid>
        <Grid item>
          <Grid container alignItems="center">
            <Grid item xs={12} style={{textAlign: 'center'}}>
              <Tooltip title="Jump Back">
                <IconButton
                  onClick={this.onBack.bind(this)}>
                  <Replay10Icon/>
                </IconButton>
              </Tooltip>
              <Tooltip title={this.state.playing ? "Pause" : "Play"}>
                <IconButton
                  onClick={this.state.playing ? this.onPause.bind(this) : this.onPlay.bind(this)}>
                  {this.state.playing ? <PauseIcon/> : <PlayArrowIcon/>}
                </IconButton>
              </Tooltip>
              <Tooltip title="Jump Forward">
                <IconButton
                  onClick={this.onForward.bind(this)}>
                  <Forward10Icon/>
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item>
                  <VolumeDownIcon/>
                </Grid>
                <Grid item xs>
                  <Slider value={this.props.volume ? parseInt(this.props.volume) : this.props.video.volume * 100}
                          onChange={this.onChangeVolume.bind(this)} />
                </Grid>
                <Grid item>
                  <VolumeUpIcon/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  _interval: any = null;
  componentDidMount() {
    this._interval = setInterval(() => {
      if (!this.props.video.paused) {
        this.triggerUpdate();
      }
      if (this.props.clip) {
        if (this.props.video.paused && this.state.playing) {
          this.setState({playing: false});
        } else if (!this.props.video.paused && !this.state.playing) {
          this.setState({playing: true});
        }
        if (this.props.video.currentTime < this.props.clip[0] ||
          this.props.video.currentTime > this.props.clip[1]) {
          this.props.video.currentTime = this.props.clip[0];
        }
      }
    }, 50);
    this.setState({marks: this.getMarks()});
  }

  componentDidUpdate(props: any) {
    // If the clip/video has changed, or we don't have the expected number of marks
    if (this.props.clip != props.clip || this.props.video != props.video ||
      (this.props.clips && this.state.marks.length !=
        (this.props.clip ? 2 : this.props.clips.length + 2))) {
      this.setState({marks: this.getMarks()});
    }
  }

  componentWillUnmount() {
    clearInterval(this._interval);
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
    this.props.onChangeVolume(volume);
    if (this.props.video) {
      this.props.video.volume = volume / 100;
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
    let position = this.props.video.currentTime - 10;
    if (position < 0) {
      position = 0;
    }
    this.onChangePosition(null, position);
  }

  onForward() {
    let position = this.props.video.currentTime + 10;
    if (position > this.props.video.duration) {
      position = this.props.video.duration;
    }
    this.onChangePosition(null, position);
  }

  getMarks(): Array<{value: number, label: string}> {
    const min = this.props.clip ?  this.props.clip[0] : 0;
    const max = this.props.clip ? this.props.clip[1] : this.props.video.duration;
    const marks = [{value: min, label: getTimestamp(min)}, {value: max, label: getTimestamp(max)}];
    if (!this.props.clip && this.props.clips) {
      for (let clip of this.props.clips) {
        marks.push({value: clip.start, label: clip.id.toString()})
      }
    }
    return marks;
  }
}

export default withStyles(styles)(VideoControl as any);