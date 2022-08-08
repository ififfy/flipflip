import * as React from "react";
import {IncomingMessage} from "electron";
import clsx from "clsx";
import {analyze} from "web-audio-beat-detector";
import { parseFile } from 'music-metadata';
import {existsSync, readFileSync} from "fs";
import request from "request";

import {
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  SvgIcon,
  Switch,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import {green, red} from "@mui/material/colors";

import {toArrayBuffer} from "../../data/utils";
import {RP, TF} from "../../data/const";
import en from "../../data/en";
import Audio from "../../data/Audio";
import AudioControl from "../player/AudioControl";

const styles = (theme: Theme) => createStyles({
  bpmProgress: {
    position: 'absolute',
    right: 67,
  },
  tagProgress: {
    position: 'absolute',
    right: 20,
  },
  success: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  failure: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  actions: {
    marginRight: theme.spacing(3),
  },
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

class AudioOptions extends React.Component {
  readonly props: {
    classes: any,
    audio: Audio,
    onCancel(): void,
    onFinishEdit(common: Audio): void,
  };
  
  readonly state = {
    audio: this.props.audio,
    loadingBPM: false,
    successBPM: false,
    errorBPM: false,
    loadingTag: false,
    successTag: false,
    errorTag: false,
  }

  render() {
    const classes = this.props.classes;

    return (
      <Dialog
        open={true}
        onClose={this.props.onCancel.bind(this)}
        aria-describedby="edit-description">
        <DialogContent>
          <Typography variant="h6">Edit song options</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <TextField
                variant="standard"
                fullWidth
                value={this.state.audio.url}
                margin="normal"
                label="URL"
                onChange={this.onSourceInput.bind(this, 'url')} />
            </Grid>
            <Grid item xs={12}>
              <AudioControl
                audio={this.state.audio}
                audioEnabled={true}
                singleTrack={true}
                lastTrack={true}
                repeat={RP.one}
                scenePaths={[]}
                startPlaying={false}
                onAudioSliderChange={this.onSourceSliderChange.bind(this, 'volume')}/>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Collapse in={!this.state.audio.tick && !this.state.audio.nextSceneAtEnd}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={this.state.audio.stopAtEnd}
                          onChange={this.onSourceBoolInput.bind(this, 'stopAtEnd')}/>
                      }
                      label="Stop at End"/>
                  </Collapse>
                  <Collapse in={!this.state.audio.tick && !this.state.audio.stopAtEnd}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={this.state.audio.nextSceneAtEnd}
                          onChange={this.onSourceBoolInput.bind(this, 'nextSceneAtEnd')}/>
                      }
                      label="Next Scene at End"/>
                  </Collapse>
                  <Collapse in={!this.state.audio.stopAtEnd && !this.state.audio.nextSceneAtEnd}>
                    <FormControlLabel
                      control={
                        <Tooltip disableInteractive title={"Repeat track at particular interval"}>
                          <Switch
                            size="small"
                            checked={this.state.audio.tick}
                            onChange={this.onSourceBoolInput.bind(this, 'tick')}/>
                        </Tooltip>
                      }
                      label="Tick"/>
                  </Collapse>
                </Grid>
                <Divider component="div" orientation="vertical" style={{height: 48}}/>
                <Grid item xs>
                  <Grid container>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        label="BPM"
                        margin="dense"
                        value={this.state.audio.bpm}
                        onChange={this.onSourceIntInput.bind(this, 'bpm')}
                        onBlur={this.blurSourceIntKey.bind(this, 'bpm')}
                        InputProps={{
                          endAdornment:
                            <InputAdornment position="end">
                              <Tooltip disableInteractive title="Detect BPM">
                                <IconButton
                                  className={clsx(this.state.successBPM && classes.success, this.state.errorBPM && classes.failure)}
                                  onClick={this.onDetectBPM.bind(this)}
                                  size="large">
                                  {this.state.successBPM ? <CheckIcon/> :
                                    this.state.errorBPM ? <ErrorOutlineIcon/> :
                                      <SvgIcon viewBox="0 0 24 24" fontSize="small">
                                        <path
                                          d="M12,1.75L8.57,2.67L4.07,19.5C4.06,19.5 4,19.84 4,20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20C20,19.84 19.94,19.5 19.93,19.5L15.43,2.67L12,1.75M10.29,4H13.71L17.2,17H13V12H11V17H6.8L10.29,4M11,5V9H10V11H14V9H13V5H11Z"/>
                                      </SvgIcon>
                                  }
                                </IconButton>
                              </Tooltip>
                              {this.state.loadingBPM && <CircularProgress size={34} className={classes.bpmProgress} />}
                              <Tooltip disableInteractive title="Read BPM Metadata">
                                <IconButton
                                  className={clsx(this.state.successTag && classes.success, this.state.errorTag && classes.failure)}
                                  onClick={this.onReadBPMTag.bind(this)}
                                  size="large">
                                  {this.state.successTag ? <CheckIcon/> :
                                    this.state.errorTag ? <ErrorOutlineIcon/> :
                                      <AudiotrackIcon/>
                                  }
                                </IconButton>
                              </Tooltip>
                              {this.state.loadingTag && <CircularProgress size={34} className={classes.tagProgress} />}
                            </InputAdornment>,
                        }}
                        inputProps={{
                          min: 0,
                          type: 'number',
                        }}/>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" component="div"
                                  color="textSecondary">
                        Speed {this.state.audio.speed / 10}x
                      </Typography>
                      <Slider
                        min={5}
                        max={40}
                        defaultValue={this.state.audio.speed}
                        onChangeCommitted={this.onSourceSliderChange.bind(this, 'speed')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/10 + "x"}
                        aria-labelledby="audio-speed-slider"/>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} className={clsx(!this.state.audio.tick && classes.noPadding)}>
              <Collapse in={this.state.audio.tick} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl variant="standard" className={classes.fullWidth}>
                      <InputLabel>Timing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.state.audio.tickMode}
                        onChange={this.onSourceInput.bind(this, 'tickMode')}>
                        {Object.values(TF).map((tf) => {
                          return <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Collapse in={this.state.audio.tickMode == TF.sin} className={classes.fullWidth}>
                      <Typography variant="caption" component="div"
                                  color="textSecondary">
                        Wave Rate
                      </Typography>
                      <Grid container alignItems="center">
                        <Grid item xs>
                          <Slider
                            min={1}
                            defaultValue={this.state.audio.tickSinRate}
                            onChangeCommitted={this.onSourceSliderChange.bind(this, 'tickSinRate')}
                            valueLabelDisplay={'auto'}
                            aria-labelledby="tick-sin-rate-slider"/>
                        </Grid>
                        <Grid item xs={3} className={classes.percentInput}>
                          <TextField
                            variant="standard"
                            value={this.state.audio.tickSinRate}
                            onChange={this.onSourceIntInput.bind(this, 'tickSinRate')}
                            onBlur={this.blurSourceIntKey.bind(this, 'tickSinRate')}
                            inputProps={{
                              className: classes.endInput,
                              step: 5,
                              min: 0,
                              max: 100,
                              type: 'number',
                              'aria-labelledby': 'tick-sin-rate-slider',
                            }} />
                        </Grid>
                      </Grid>
                    </Collapse>
                    <Collapse in={this.state.audio.tickMode == TF.bpm} className={classes.fullWidth}>
                      <Typography variant="caption" component="div"
                                  color="textSecondary">
                        BPM
                        Multiplier {this.state.audio.tickBPMMulti > 0 ? this.state.audio.tickBPMMulti : "1 / " + (-1 * (this.state.audio.tickBPMMulti - 2))}x
                      </Typography>
                      <Slider
                        min={-8}
                        max={10}
                        defaultValue={this.state.audio.tickBPMMulti}
                        onChangeCommitted={this.onSourceSliderChange.bind(this, 'tickBPMMulti')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v > 0 ? v + "x" : "1/" + (-1 * (v - 2)) + "x"}
                        aria-labelledby="tick-bpm-multi-slider"/>
                    </Collapse>
                    <Collapse in={this.state.audio.tickMode == TF.constant} className={classes.fullWidth}>
                      <TextField
                        variant="outlined"
                        label="For"
                        margin="dense"
                        value={this.state.audio.tickDelay}
                        onChange={this.onSourceIntInput.bind(this, 'tickDelay')}
                        onBlur={this.blurSourceIntKey.bind(this, 'tickDelay')}
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
            <Grid item xs={12} className={clsx(!this.state.audio.tick && classes.noPadding)}>
              <Collapse in={this.state.audio.tick && (this.state.audio.tickMode == TF.random || this.state.audio.tickMode == TF.sin)} className={classes.fullWidth}>
                <Grid container alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      label="Between"
                      margin="dense"
                      value={this.state.audio.tickMinDelay}
                      onChange={this.onSourceIntInput.bind(this, 'tickMinDelay')}
                      onBlur={this.blurSourceIntKey.bind(this, 'tickMinDelay')}
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
                      value={this.state.audio.tickMaxDelay}
                      onChange={this.onSourceIntInput.bind(this, 'tickMaxDelay')}
                      onBlur={this.blurSourceIntKey.bind(this, 'tickMaxDelay')}
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
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={this.props.onCancel.bind(this)} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.props.onFinishEdit.bind(this, this.state.audio)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  onSourceInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value);
  }

  onSourceSliderChange(key: string, e: MouseEvent, value: number) {
    this.changeKey(key, value);
  }

  onSourceIntInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value === '' ? '' : Number(input.value));
  }

  blurSourceIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.state.audio as any)[key] < min) {
      this.changeKey(key, min === '' ? '' : Number(min));
    } else if (max && (this.state.audio as any)[key] > max) {
      this.changeKey(key, max === '' ? '' : Number(max));
    }
  }

  onSourceBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    switch (key) {
      case 'tick':
        if (input.checked) {
          const audio = new Audio(this.state.audio);
          audio.tick = true;
          audio.stopAtEnd = false;
          audio.nextSceneAtEnd = false;
          this.setState({audio: audio});
        } else {
          this.changeKey(key, false);
        }
        break;
      case 'stopAtEnd':
        if (input.checked) {
          const audio = new Audio(this.state.audio);
          audio.stopAtEnd = true;
          audio.tick = false;
          audio.nextSceneAtEnd = false;
          this.setState({audio: audio});
        } else {
          this.changeKey(key, false);
        }
        break;
      case 'nextSceneAtEnd':
        if (input.checked) {
          const audio = new Audio(this.state.audio);
          audio.nextSceneAtEnd = true;
          audio.tick = false;
          audio.stopAtEnd = false;
          this.setState({audio: audio});
        } else {
          this.changeKey(key, false);
        }
    }
  }

  changeKey(key: string, value: any) {
    const audio = new Audio(this.state.audio);
    (audio as any)[key] = value;
    this.setState({audio: audio});
  }

  onReadBPMTag() {
    if (this.state.audio.url && !this.state.loadingTag) {
      this.setState({loadingTag: true});
      parseFile(this.state.audio.url)
        .then((metadata: any) => {
          if (metadata && metadata.common && metadata.common.bpm) {
            this.changeKey('bpm', metadata.common.bpm);
            this.setState({loadingTag: false, successTag: true});
            setTimeout(() => {this.setState({successTag: false})}, 3000);
          } else {
            this.setState({loadingTag: false, errorTag: true});
            setTimeout(() => {this.setState({errorTag: false})}, 3000);
          }
        })
        .catch((err: any) => {
          console.error("Error reading metadata:", err.message);
          this.setState({loadingTag: false, errorTag: true});
          setTimeout(() => {this.setState({errorTag: false})}, 3000);
        });
    }
  }

  onDetectBPM() {
    const bpmError = () => {
      this.setState({loadingBPM: false, errorBPM: true});
      setTimeout(() => {
        this.setState({errorBPM: false})
      }, 3000);
    }

    const detectBPM = (data: ArrayBuffer) => {
      const maxByteSize = 200000000;
      if (data.byteLength < maxByteSize) {
        let context = new AudioContext();
        context.decodeAudioData(data, (buffer) => {
          analyze(buffer)
            .then((tempo: number) => {
              this.changeKey('bpm', tempo.toFixed(2));
              this.setState({loadingBPM: false, successBPM: true});
              setTimeout(() => {
                this.setState({successBPM: false})
              }, 3000);
            })
            .catch((err: any) => {
              console.error("Error analyzing");
              console.error(err);
              bpmError();
            });
        }, (err) => {
          console.error(err);
          bpmError();
        });
      } else {
        console.error("'" + this.props.audio.url + "' is too large to decode");
        bpmError();
      }
    }

    if (this.state.audio.url && !this.state.loadingBPM) {
      this.setState({loadingBPM: true});
      try {
        const url = this.state.audio.url;
        if (existsSync(url)) {
          detectBPM(toArrayBuffer(readFileSync(url)));
        } else {
          request.get({url, encoding: null}, function (err: Error, res: IncomingMessage, body: Buffer) {
            if (err) {
              console.error(err);
              bpmError();
              return;
            }
            detectBPM(toArrayBuffer(body));
          });
        }
      } catch (e) {
        console.error(e);
        bpmError();
      }
    }
  }
}

(AudioOptions as any).displayName="AudioOptions";
export default withStyles(styles)(AudioOptions as any);