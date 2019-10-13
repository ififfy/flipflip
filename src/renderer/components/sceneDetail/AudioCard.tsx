import * as React from "react";
import {remote} from "electron";
import clsx from "clsx";
import fileURL from "file-url";

import {
  Card, CardContent, Collapse, createStyles, Divider, Fab, FormControl, FormControlLabel, Grid, IconButton,
  InputAdornment, InputLabel, MenuItem, Select, Slider, Switch, TextField, Theme, Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import FolderIcon from '@material-ui/icons/Folder';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import {TF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import en from "../../data/en";
import Scene from "../../data/Scene";
import Audio from "../library/Audio";

const styles = (theme: Theme) => createStyles({
  fullWidth: {
    width: '100%',
  },
  paddingLeft: {
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(1),
    },
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
  addButton: {
    boxShadow: 'none',
  },
});

class AudioCard extends React.Component {
  readonly props: {
    classes: any,
    playAudio: boolean,
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    const classes = this.props.classes;

    return(
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <FormControlLabel
                    control={
                      <Switch checked={this.props.scene.audioEnabled}
                              onChange={this.onBoolInput.bind(this, 'audioEnabled')}/>
                    }
                    label="Audio Tracks"/>
                </Grid>
                <Grid item>
                  <Collapse in={this.props.scene.audioEnabled}>
                    <Fab
                      className={classes.addButton}
                      onClick={this.onAddAudioTrack.bind(this)}
                      size="small">
                      <AddIcon />
                    </Fab>
                  </Collapse>
                </Grid>
              </Grid>
            </Grid>
            {this.props.scene.audios.map((a) => {
              const audioVolume = typeof a.volume === 'number' ? a.volume : 0;
              const audioSpeed = typeof a.speed === 'number' ? a.speed : 0;
              const tickSinRate = typeof a.tickSinRate === 'number' ? a.tickSinRate : 0;
              const tickBPMMulti = typeof a.tickBPMMulti === 'number' ? a.tickBPMMulti : 0;
              const tickDelay = typeof a.tickDelay === 'number' ? a.tickDelay : 0;
              const tickMinDelay = typeof a.tickMinDelay === 'number' ? a.tickMinDelay : 0;
              const tickMaxDelay = typeof a.tickMaxDelay === 'number' ? a.tickMaxDelay : 0;
              return (
                <React.Fragment key={a.id}>
                  <Grid item xs={12} className={clsx(!this.props.scene.audioEnabled && classes.noPadding)}>
                    <Collapse in={this.props.scene.audioEnabled} className={classes.fullWidth}>
                      <Divider/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} className={clsx(!this.props.scene.audioEnabled && classes.noPadding)}>
                    <Collapse in={this.props.scene.audioEnabled} className={classes.fullWidth}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                          <TextField
                            label="Audio URL"
                            fullWidth
                            placeholder="Paste URL Here"
                            margin="dense"
                            value={a.url}
                            InputProps={{
                              endAdornment:
                                <InputAdornment position="end">
                                  <Tooltip title="Open File">
                                    <IconButton
                                      onClick={this.onOpenFile.bind(this, a.id)}>
                                      <FolderIcon/>
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Remove Audio">
                                    <IconButton
                                      onClick={this.onDeleteAudioTrack.bind(this, a.id)}>
                                      <DeleteIcon color="error"/>
                                    </IconButton>
                                  </Tooltip>
                                </InputAdornment>,
                            }}
                            onChange={this.onAudioInput.bind(this, a.id, 'url')}/>
                        </Grid>
                        {this.props.playAudio && (
                          <Grid item xs={12}>
                            <Typography>Sound Objects and Controls</Typography>
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <Grid container spacing={1} alignItems="center">
                            <Grid item>
                              <VolumeDownIcon />
                            </Grid>
                            <Grid item xs>
                              <Slider value={audioVolume}
                                      onChange={this.onAudioSliderChange.bind(this, a.id, 'volume')}
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
                                    checked={a.tick}
                                    onChange={this.onAudioBoolInput.bind(this, a.id, 'tick')}/>
                                }
                                label="Tick"/>
                            </Grid>
                            <Grid item xs>
                              <Typography id="tick-sin-rate-slider" variant="caption" component="div"
                                          color="textSecondary">
                                Speed {audioSpeed / 10}x
                              </Typography>
                              <Slider
                                min={5}
                                max={40}
                                value={audioSpeed}
                                onChange={this.onAudioSliderChange.bind(this, a.id, 'speed')}
                                aria-labelledby="audio-speed-slider"/>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} className={clsx(!a.tick && classes.noPadding)}>
                          <Collapse in={a.tick}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={4}>
                                <FormControl className={classes.fullWidth}>
                                  <InputLabel>Timing</InputLabel>
                                  <Select
                                    value={a.tickMode}
                                    onChange={this.onAudioInput.bind(this, a.id, 'tickMode')}>
                                    {Object.values(TF).map((tf) =>
                                      <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                                    )}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={8}>
                                <Collapse in={a.tickMode == TF.sin} className={classes.fullWidth}>
                                  <Typography id="tick-sin-rate-slider" variant="caption" component="div"
                                              color="textSecondary">
                                    Wave Rate
                                  </Typography>
                                  <Grid container alignItems="center">
                                    <Grid item xs>
                                      <Slider
                                        min={1}
                                        value={tickSinRate}
                                        onChange={this.onAudioSliderChange.bind(this, a.id, 'tickSinRate')}
                                        aria-labelledby="tick-sin-rate-slider"/>
                                    </Grid>
                                    <Grid item xs={3} className={classes.percentInput}>
                                      <TextField
                                        value={tickSinRate}
                                        onChange={this.onAudioIntInput.bind(this, a.id, 'tickSinRate')}
                                        onBlur={this.blurAudioIntKey.bind(this, a.id, 'tickSinRate')}
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
                                <Collapse in={a.tickMode == TF.bpm} className={classes.fullWidth}>
                                  <Typography id="tick-bpm-multi-slider" variant="caption" component="div"
                                              color="textSecondary">
                                    BPM
                                    Multiplier {a.tickBPMMulti > 0 ? a.tickBPMMulti : "1 / " + (-1 * (a.tickBPMMulti - 2))}x
                                  </Typography>
                                  <Slider
                                    min={-8}
                                    max={10}
                                    value={tickBPMMulti}
                                    onChange={this.onAudioSliderChange.bind(this, a.id, 'tickBPMMulti')}
                                    aria-labelledby="tick-bpm-multi-slider"/>
                                </Collapse>
                                <Collapse in={a.tickMode == TF.constant} className={classes.fullWidth}>
                                  <TextField
                                    variant="outlined"
                                    label="For"
                                    margin="dense"
                                    value={tickDelay}
                                    onChange={this.onAudioIntInput.bind(this, a.id, 'tickDelay')}
                                    onBlur={this.blurAudioIntKey.bind(this, a.id, 'tickDelay')}
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
                        <Grid item xs={12} className={clsx(!a.tick && classes.noPadding)}>
                          <Collapse in={a.tick && (a.tickMode == TF.random || a.tickMode == TF.sin)} className={classes.fullWidth}>
                            <Grid container alignItems="center">
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  variant="outlined"
                                  label="Between"
                                  margin="dense"
                                  value={tickMinDelay}
                                  onChange={this.onAudioIntInput.bind(this, a.id, 'tickMinDelay')}
                                  onBlur={this.blurAudioIntKey.bind(this, a.id, 'tickMinDelay')}
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
                                  onChange={this.onAudioIntInput.bind(this, a.id, 'tickMaxDelay')}
                                  onBlur={this.blurAudioIntKey.bind(this, a.id, 'tickMaxDelay')}
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
                </React.Fragment>
              )}
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  onOpenFile(id: number) {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openFile']});
    if (!result || !result.length) return;
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == id);
    audio.url = fileURL(result[0]);
    this.changeKey('audios', newAudios);
  }

  onDeleteAudioTrack(id: number) {
    const newAudios = this.props.scene.audios;
    newAudios.splice(newAudios.map((a) => a.id).indexOf(id), 1);
    this.changeKey('audios', newAudios);
  }

  onAddAudioTrack() {
    let id = this.props.scene.audios.length + 1;
    this.props.scene.audios.forEach((a) => {
      id = Math.max(a.id + 1, id);
    });
    const newAudios = this.props.scene.audios.concat([new Audio({id: id, url: ""})]);
    this.changeKey('audios', newAudios);
  }

  blurAudioIntKey(id: number, key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.props.scene as any)[key] < min) {
      const newAudios = this.props.scene.audios;
      const audio: any = newAudios.find((a) => a.id == id);
      audio[key] = min === '' ? '' : Number(min);
      this.changeKey('audios', newAudios);
    } else if (max && (this.props.scene as any)[key] > max) {
      const newAudios = this.props.scene.audios;
      const audio: any = newAudios.find((a) => a.id == id);
      audio[key] = max === '' ? '' : Number(max);
      this.changeKey('audios', newAudios);
    }
  }

  onAudioSliderChange(id: number, key: string, e: MouseEvent, value: number) {
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == id);
    audio[key] = value;
    this.changeKey('audios', newAudios);
  }

  onAudioIntInput(id:number, key: string, e: MouseEvent) {
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == id);
    const input = (e.target as HTMLInputElement);
    audio[key] = input.value === '' ? '' : Number(input.value);
    this.changeKey('audios', newAudios);
  }

  onAudioInput(id: number, key: string, e: MouseEvent) {
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == id);
    const input = (e.target as HTMLInputElement);
    audio[key] = input.value;
    this.changeKey('audios', newAudios);
  }

  onAudioBoolInput(id: number, key: string, e: MouseEvent) {
    const newAudios = this.props.scene.audios;
    const audio: any = newAudios.find((a) => a.id == id);
    const input = (e.target as HTMLInputElement);
    audio[key] = input.checked;
    this.changeKey('audios', newAudios);
  }

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }
}

export default withStyles(styles)(AudioCard as any);