import * as React from "react";
import Sound from "react-sound";
import clsx from "clsx";
import {remote} from "electron";
import fileURL from "file-url";
import * as mm from "music-metadata";
import Timeout = NodeJS.Timeout;

import {
  Collapse, createStyles, Divider, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputLabel,
  MenuItem, Select, Slider, Switch, TextField, Theme, Tooltip, Typography, withStyles
} from "@material-ui/core";

import DeleteIcon from '@material-ui/icons/Delete';
import FolderIcon from '@material-ui/icons/Folder';
import Forward10Icon from '@material-ui/icons/Forward10';
import Replay10Icon from '@material-ui/icons/Replay10';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import {getTimestamp, urlToPath} from "../../data/utils";
import {SceneSettings} from "../../data/Config";
import {TF} from "../../data/const";
import en from "../../data/en";
import Scene from "../../data/Scene";
import Audio from "../library/Audio";
import SoundTick from "./SoundTick";

const styles = (theme: Theme) => createStyles({
  fullWidth: {
    width: '100%',
  },
  noPadding: {
    padding: '0 !important',
  },
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0,
  },
  percentInput: {
    minWidth: theme.spacing(11),
  },
});

function getTimestampFromMs(ms: number): string {
  const secs = Math.floor(ms / 1000);
  return getTimestamp(secs);
}

class AudioControl extends React.Component {
  readonly props: {
    classes: any,
    audio: Audio,
    detectBPM: boolean,
    scene: Scene,
    scenePaths: Array<any>,
    startPlaying: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
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
    const audioSpeed = typeof audio.speed === 'number' ? audio.speed : 0;
    const tickSinRate = typeof audio.tickSinRate === 'number' ? audio.tickSinRate : 0;
    const tickBPMMulti = typeof audio.tickBPMMulti === 'number' ? audio.tickBPMMulti : 0;
    const tickDelay = typeof audio.tickDelay === 'number' ? audio.tickDelay : 0;
    const tickMinDelay = typeof audio.tickMinDelay === 'number' ? audio.tickMinDelay : 0;
    const tickMaxDelay = typeof audio.tickMaxDelay === 'number' ? audio.tickMaxDelay : 0;
    return(
      <React.Fragment key={audio.id}>
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
        <Grid item xs={12} className={clsx(!this.props.scene.audioEnabled && classes.noPadding)}>
          <Collapse in={this.props.scene.audioEnabled} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  label="Audio URL"
                  fullWidth
                  placeholder="Paste URL Here"
                  margin="dense"
                  value={audio.url}
                  InputProps={{
                    endAdornment:
                      <InputAdornment position="end">
                        <Tooltip title="Open File">
                          <IconButton
                            onClick={this.onOpenFile.bind(this)}>
                            <FolderIcon/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Audio">
                          <IconButton
                            onClick={this.onDeleteAudioTrack.bind(this)}>
                            <DeleteIcon color="error"/>
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>,
                  }}
                  onChange={this.onAudioInput.bind(this, 'url')}/>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1} alignItems="center" justify="center">
                  <Grid item xs={12} sm>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Typography id="strobe-opacity-slider" variant="caption" component="div" color="textSecondary">
                          {getTimestampFromMs(this.state.position)}
                        </Typography>
                      </Grid>
                      <Grid item xs>
                      <Slider
                        value={this.state.position}
                        max={this.state.duration}
                        onChange={this.onChangePosition.bind(this)}/>
                      </Grid>
                      <Grid item>
                        <Typography id="strobe-opacity-slider" variant="caption" component="div" color="textSecondary">
                          {getTimestampFromMs(this.state.duration)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Jump Back">
                      <IconButton
                        onClick={this.onBack.bind(this)}>
                        <Replay10Icon />
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
                        <Forward10Icon />
                      </IconButton>
                    </Tooltip>
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
                            onChange={this.onAudioSliderChange.bind(this, 'volume')}
                            aria-labelledby="audio-volume-slider" />
                  </Grid>
                  <Grid item>
                    <VolumeUpIcon />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={audio.tick}
                          onChange={this.onAudioBoolInput.bind(this, 'tick')}/>
                      }
                      label="Tick"/>
                  </Grid>
                  <Divider component="div" orientation="vertical" style={{height: 48}}/>
                  <Grid item xs>
                    <Typography id="tick-sin-rate-slider" variant="caption" component="div"
                                color="textSecondary">
                      Speed {audioSpeed / 10}x
                    </Typography>
                    <Slider
                      min={5}
                      max={40}
                      value={audioSpeed}
                      onChange={this.onAudioSliderChange.bind(this, 'speed')}
                      aria-labelledby="audio-speed-slider"/>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} className={clsx(!audio.tick && classes.noPadding)}>
                <Collapse in={audio.tick} className={classes.fullWidth}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl className={classes.fullWidth}>
                        <InputLabel>Timing</InputLabel>
                        <Select
                          value={audio.tickMode}
                          onChange={this.onAudioInput.bind(this, 'tickMode')}>
                          {Object.values(TF).map((tf) =>
                            <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Collapse in={audio.tickMode == TF.sin} className={classes.fullWidth}>
                        <Typography id="tick-sin-rate-slider" variant="caption" component="div"
                                    color="textSecondary">
                          Wave Rate
                        </Typography>
                        <Grid container alignItems="center">
                          <Grid item xs>
                            <Slider
                              min={1}
                              value={tickSinRate}
                              onChange={this.onAudioSliderChange.bind(this, 'tickSinRate')}
                              aria-labelledby="tick-sin-rate-slider"/>
                          </Grid>
                          <Grid item xs={3} className={classes.percentInput}>
                            <TextField
                              value={tickSinRate}
                              onChange={this.onAudioIntInput.bind(this, 'tickSinRate')}
                              onBlur={this.blurAudioIntKey.bind(this, 'tickSinRate')}
                              inputProps={{
                                className: classes.endInput,
                                step: 5,
                                min: 0,
                                max: 100,
                                type: 'number',
                                'aria-labelledby': 'tick-sin-rate-slider',
                              }}/>
                          </Grid>
                        </Grid>
                      </Collapse>
                      <Collapse in={audio.tickMode == TF.bpm} className={classes.fullWidth}>
                        <Typography id="tick-bpm-multi-slider" variant="caption" component="div"
                                    color="textSecondary">
                          BPM
                          Multiplier {audio.tickBPMMulti > 0 ? audio.tickBPMMulti : "1 / " + (-1 * (audio.tickBPMMulti - 2))}x
                        </Typography>
                        <Slider
                          min={-8}
                          max={10}
                          value={tickBPMMulti}
                          onChange={this.onAudioSliderChange.bind(this, 'tickBPMMulti')}
                          aria-labelledby="tick-bpm-multi-slider"/>
                      </Collapse>
                      <Collapse in={audio.tickMode == TF.constant} className={classes.fullWidth}>
                        <TextField
                          variant="outlined"
                          label="For"
                          margin="dense"
                          value={tickDelay}
                          onChange={this.onAudioIntInput.bind(this, 'tickDelay')}
                          onBlur={this.blurAudioIntKey.bind(this, 'tickDelay')}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                          }}
                          inputProps={{
                            step: 100,
                            min: 0,
                            type: 'number',
                          }}/>
                      </Collapse>
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
              <Grid item xs={12} className={clsx(!audio.tick && classes.noPadding)}>
                <Collapse in={audio.tick && (audio.tickMode == TF.random || audio.tickMode == TF.sin)} className={classes.fullWidth}>
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant="outlined"
                        label="Between"
                        margin="dense"
                        value={tickMinDelay}
                        onChange={this.onAudioIntInput.bind(this, 'tickMinDelay')}
                        onBlur={this.blurAudioIntKey.bind(this, 'tickMinDelay')}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                        }}
                        inputProps={{
                          step: 100,
                          min: 0,
                          type: 'number',
                        }}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant="outlined"
                        label="and"
                        margin="dense"
                        value={tickMaxDelay}
                        onChange={this.onAudioIntInput.bind(this, 'tickMaxDelay')}
                        onBlur={this.blurAudioIntKey.bind(this, 'tickMaxDelay')}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                        }}
                        inputProps={{
                          step: 100,
                          min: 0,
                          type: 'number',
                        }}/>
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        <Grid item xs={12} className={clsx(!this.props.scene.audioEnabled && classes.noPadding)}>
          <Collapse in={this.props.scene.audioEnabled} className={classes.fullWidth}>
            <Divider/>
          </Collapse>
        </Grid>
      </React.Fragment>
    );
  }

  _audio = "";
  _timeout: Timeout = null;
  componentDidMount() {
    this._audio=JSON.stringify(this.props.audio);
    if (this.props.startPlaying) {
      this.tickLoop(true);
    }
    this.detectBPM();
  }

  componentDidUpdate(props: any) {
    let audio = JSON.parse(this._audio);
    if ((this.props.audio.tick && !audio.tick) ||
      (this.props.audio.tick && audio.tickMode == TF.scene && this.props.audio.tickMode != TF.scene)){
      if (this.props.startPlaying) {
        this.tickLoop(true);
      }
    }
    if (this.props.audio.tick && this.props.audio.tickMode == TF.scene && props.scenePaths && props.scenePaths.length > 0 && props.scenePaths !== this.props.scenePaths) {
      this.setState({tick: !this.state.tick});
    }
    if (this.props.audio.url != audio.url || this.props.detectBPM != props.detectBPM) {
      this.detectBPM();
    }
    this._audio=JSON.stringify(this.props.audio);
  }

  componentWillUnmount() {
    if(this._timeout != null) {
      clearTimeout(this._timeout);
    }
  }

  detectBPM() {
    if (this.props.detectBPM) {
      mm.parseFile(urlToPath(this.props.audio.url))
        .then((metadata: any) => {
          if (metadata && metadata.common && metadata.common.bpm) {
            this.changeKey('bpm', metadata.common.bpm);
          }
        })
        .catch((err: any) => {
          console.error("Error reading metadata:", err.message);
        });
    }
  }

  tickLoop(starting: boolean = false) {
    if (!starting) {
      this.setState({tick: !this.state.tick});
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
      }
      if (timeout != null) {
        this._timeout = setTimeout(this.tickLoop.bind(this), timeout);
        return
      }
    }
    this._timeout = null;
  }

  onOpenFile() {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openFile']});
    if (!result || !result.length) return;
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == this.props.audio.id);
    audio.url = fileURL(result[0]);
    this.changeKey('audios', newAudios);
  }

  onDeleteAudioTrack() {
    const newAudios = this.props.scene.audios;
    newAudios.splice(newAudios.map((a) => a.id).indexOf(this.props.audio.id), 1);
    this.changeKey('audios', newAudios);
  }

  onChangePosition(e: MouseEvent, value: number) {
    console.log(value);
    this.setState({position: value});
  }

  blurAudioIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.props.scene as any)[key] < min) {
      const newAudios = this.props.scene.audios;
      const audio: any = newAudios.find((a) => a.id == this.props.audio.id);
      audio[key] = min === '' ? '' : Number(min);
      this.changeKey('audios', newAudios);
    } else if (max && (this.props.scene as any)[key] > max) {
      const newAudios = this.props.scene.audios;
      const audio: any = newAudios.find((a) => a.id == this.props.audio.id);
      audio[key] = max === '' ? '' : Number(max);
      this.changeKey('audios', newAudios);
    }
  }

  onAudioSliderChange(key: string, e: MouseEvent, value: number) {
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == this.props.audio.id);
    audio[key] = value;
    this.changeKey('audios', newAudios);
  }

  onAudioIntInput(key: string, e: MouseEvent) {
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == this.props.audio.id);
    const input = (e.target as HTMLInputElement);
    audio[key] = input.value === '' ? '' : Number(input.value);
    this.changeKey('audios', newAudios);
  }

  onAudioInput(key: string, e: MouseEvent) {
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == this.props.audio.id);
    const input = (e.target as HTMLInputElement);
    audio[key] = input.value;
    this.changeKey('audios', newAudios);
  }

  onAudioBoolInput(key: string, e: MouseEvent) {
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == this.props.audio.id);
    const input = (e.target as HTMLInputElement);
    audio[key] = input.checked;
    this.changeKey('audios', newAudios);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
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

  onPlay() {
    this.setState({playing: true});
  }

  onPause() {
    this.setState({playing: false});
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
}

export default withStyles(styles)(AudioControl as any);