import * as React from "react";
import clsx from "clsx";

import {
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Switch,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import {EA, SDT, TF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import en from "../../data/en";
import Scene from "../../data/Scene";
import Audio from "../../data/Audio";

const styles = (theme: Theme) => createStyles({
  fullWidth: {
    width: '100%',
  },
  paddingLeft: {
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(1),
    },
  },
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0,
  },
  percentInput: {
    minWidth: theme.spacing(11),
  },
  backdropTop: {
    zIndex: `${theme.zIndex.modal + 1} !important` as any,
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid',
  },
  disable: {
    pointerEvents: 'none',
  }
});

class CrossFadeCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    easingControls: boolean,
    sidebar: boolean,
    tutorial: string,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  readonly sinInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;

    const fadeSinRate = typeof this.props.scene.fadeSinRate === 'number' ? this.props.scene.fadeSinRate : 0;
    const fadeBPMMulti = typeof this.props.scene.fadeBPMMulti === 'number' ? this.props.scene.fadeBPMMulti : 0;
    const fadeDuration = typeof this.props.scene.fadeDuration === 'number' ? this.props.scene.fadeDuration : 0;
    const fadeDurationMin = typeof this.props.scene.fadeDurationMin === 'number' ? this.props.scene.fadeDurationMin : 0;
    const fadeDurationMax = typeof this.props.scene.fadeDurationMax === 'number' ? this.props.scene.fadeDurationMax : 0;

    const playlists = (this.props.scene.audioPlaylists as {audios: Audio[], shuffle: boolean, repeat: string}[]);
    const hasBPM = !!playlists && playlists.length && playlists[0].audios.length && playlists[0].audios[0].bpm;
    return (
      <Grid container spacing={this.props.scene.crossFade ? 2 : 0} alignItems="center">
        <Grid item xs={12}  className={clsx(this.props.tutorial != null && this.props.tutorial != SDT.fade1 && classes.disable)}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 5}>
              <FormControlLabel
                className={clsx(this.props.tutorial == SDT.fade1 && classes.highlight)}
                control={
                  <Switch checked={this.props.scene.crossFade}
                            onChange={this.onBoolInput.bind(this, 'crossFade')}/>
                }
                label="Cross-Fade"/>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 7}>
              <Collapse in={this.props.scene.crossFade} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.crossFadeAudio}
                      size="small"
                      onChange={this.onBoolInput.bind(this, 'crossFadeAudio')}/>
                  }
                  label="Cross-Fade Audio"/>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.scene.crossFade} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12} className={clsx(this.props.tutorial != null && classes.disable, this.props.tutorial == SDT.fade2 && classes.highlight)}>
          <Collapse in={this.props.scene.crossFade} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} style={{paddingTop: 10}}>
                <FormControl variant="standard" className={classes.fullWidth}>
                  <InputLabel>Timing</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.fadeTF}
                    onChange={this.onInput.bind(this, 'fadeTF')}>
                    {Object.values(TF).map((tf) => {
                      if (tf == TF.bpm) {
                        return <MenuItem key={tf} value={tf}>
                          {en.get(tf)} {!hasBPM && <Tooltip disableInteractive title={"Missing audio with BPM"}><ErrorOutlineIcon color={'error'} className={classes.noBPM}/></Tooltip>}
                        </MenuItem>
                      } else {
                        return <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                      }
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
                <Collapse in={this.props.scene.fadeTF == TF.sin} className={classes.fullWidth}>
                  <Typography variant="caption" component="div" color="textSecondary">
                    Wave Rate
                  </Typography>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <Slider
                        ref={this.sinInputRef}
                        min={1}
                        defaultValue={fadeSinRate}
                        onChangeCommitted={this.onSliderChange.bind(this, 'fadeSinRate')}
                        valueLabelDisplay={'auto'}
                        aria-labelledby="fade-sin-rate-slider"/>
                    </Grid>
                    <Grid item xs={3} className={classes.percentInput}>
                      <TextField
                        variant="standard"
                        value={fadeSinRate}
                        onChange={this.onIntInput.bind(this, 'fadeSinRate')}
                        onBlur={this.blurIntKey.bind(this, 'fadeSinRate')}
                        inputProps={{
                          className: classes.endInput,
                          step: 5,
                          min: 0,
                          max: 100,
                          type: 'number',
                          'aria-labelledby': 'fade-sin-rate-slider',
                        }} />
                    </Grid>
                  </Grid>
                </Collapse>
                <Collapse in={this.props.scene.fadeTF == TF.bpm} className={classes.fullWidth}>
                  <Typography variant="caption" component="div" color="textSecondary">
                    BPM Multiplier {this.props.scene.fadeBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={fadeBPMMulti}
                    onChangeCommitted={this.onSliderChange.bind(this, 'fadeBPMMulti')}
                    valueLabelDisplay={'auto'}
                    valueLabelFormat={(v) => (v / 10) + "x"}
                    aria-labelledby="fade-bpm-multi-slider"/>
                </Collapse>
                <Collapse in={this.props.scene.fadeTF == TF.constant} className={classes.fullWidth}>
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={fadeDuration}
                    onChange={this.onIntInput.bind(this, 'fadeDuration')}
                    onBlur={this.blurIntKey.bind(this, 'fadeDuration')}
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
        <Grid item xs={12} className={clsx(this.props.tutorial != null && classes.disable)}>
          <Collapse in={this.props.scene.crossFade && (this.props.scene.fadeTF == TF.random || this.props.scene.fadeTF == TF.sin)} className={classes.fullWidth}>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={fadeDurationMin}
                  onChange={this.onIntInput.bind(this, 'fadeDurationMin')}
                  onBlur={this.blurIntKey.bind(this, 'fadeDurationMin')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: 'number',
                  }}/>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="and"
                  margin="dense"
                  value={fadeDurationMax}
                  onChange={this.onIntInput.bind(this, 'fadeDurationMax')}
                  onBlur={this.blurIntKey.bind(this, 'fadeDurationMax')}
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
        {this.props.easingControls && (
          <React.Fragment>
            <Grid item xs={12} className={clsx(!this.props.scene.crossFade && classes.noPadding)}>
              <Collapse in={this.props.scene.crossFade} className={classes.fullWidth}>
                <Divider />
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Collapse in={this.props.scene.crossFade} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FormControl variant="standard" className={classes.fullWidth}>
                      <InputLabel>Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.fadeEase}
                        onChange={this.onInput.bind(this, 'fadeEase')}>
                        {Object.values(EA).map((rf) =>
                          <MenuItem key={rf} value={rf}>{en.get(rf)}</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.fadeEase == EA.polyIn || this.props.scene.fadeEase == EA.polyOut || this.props.scene.fadeEase == EA.polyInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Exponent: {this.props.scene.fadeExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.fadeExp}
                        onChangeCommitted={this.onSliderChange.bind(this, 'fadeExp')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/2}
                        aria-labelledby="exp-slider"/>
                    </Collapse>
                    <Collapse in={this.props.scene.fadeEase == EA.backIn || this.props.scene.fadeEase == EA.backOut || this.props.scene.fadeEase == EA.backInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Overshoot: {this.props.scene.fadeOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.fadeOv}
                        onChangeCommitted={this.onSliderChange.bind(this, 'fadeOv')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/2}
                        aria-labelledby="ov-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.fadeEase == EA.elasticIn || this.props.scene.fadeEase == EA.elasticOut || this.props.scene.fadeEase == EA.elasticInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Amplitude: {this.props.scene.fadeAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.fadeAmp}
                        onChangeCommitted={this.onSliderChange.bind(this, 'fadeAmp')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/20}
                        aria-labelledby="amp-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.fadeEase == EA.elasticIn || this.props.scene.fadeEase == EA.elasticOut || this.props.scene.fadeEase == EA.elasticInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Period: {this.props.scene.fadePer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.fadePer}
                        onChangeCommitted={this.onSliderChange.bind(this, 'fadePer')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/20}
                        aria-labelledby="per-slider"/>
                    </Collapse>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    );
  }

  blurIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    let value = (e.currentTarget as any).value;
    if (min && (this.props.scene as any)[key] < min) {
      value = min;
      this.changeIntKey(key, min);
    } else if (max && (this.props.scene as any)[key] > max) {
      value = max;
      this.changeIntKey(key, max);
    }

    // Update uncontrolled slider
    if (key == 'fadeSinRate') {
      (this.sinInputRef.current.children.item(1) as any).style.width = value + '%';
      (this.sinInputRef.current.children.item(3) as any).style.left = value + '%';
      this.sinInputRef.current.children.item(3).children.item(0).children.item(0).children.item(0).innerHTML = value;
    }
  }

  onSliderChange(key: string, e: MouseEvent, value: number) {
    this.changeKey(key, value);
  }

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  onIntInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value === '' ? '' : Number(input.value));
  }

  onInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeIntKey(key:string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }
}

(CrossFadeCard as any).displayName="CrossFadeCard";
export default withStyles(styles)(CrossFadeCard as any);
