import * as React from "react";
import clsx from "clsx";

import {
  Collapse, createStyles, Divider, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel,
  MenuItem, Select, Slider, Switch, TextField, Theme, Typography, withStyles
} from "@material-ui/core";

import {SDT, TF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import en from "../../data/en";
import Scene from "../../data/Scene";

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

class FadeIOCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    sidebar: boolean,
    tutorial: string,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  readonly sinInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;

    const fadeSinRate = typeof this.props.scene.fadeIOSinRate === 'number' ? this.props.scene.fadeIOSinRate : 0;
    const fadeBPMMulti = typeof this.props.scene.fadeIOBPMMulti === 'number' ? this.props.scene.fadeIOBPMMulti : 0;
    const fadeDuration = typeof this.props.scene.fadeIODuration === 'number' ? this.props.scene.fadeIODuration : 0;
    const fadeDurationMin = typeof this.props.scene.fadeIODurationMin === 'number' ? this.props.scene.fadeIODurationMin : 0;
    const fadeDurationMax = typeof this.props.scene.fadeIODurationMax === 'number' ? this.props.scene.fadeIODurationMax : 0;
    return(
      <Grid container spacing={this.props.scene.fadeInOut ? 2 : 0} alignItems="center">
        <Grid item xs={12} className={clsx(this.props.tutorial != null && this.props.tutorial != SDT.fade1 && classes.disable)}>
          <Grid container alignItems="center">
            <Grid item xs={11}>
              <FormControlLabel
                className={clsx(this.props.tutorial == SDT.fade1 && classes.highlight)}
                control={
                  <Switch checked={this.props.scene.fadeInOut}
                          onChange={this.onBoolInput.bind(this, 'fadeInOut')}/>
                }
                label="Fade In/Out"/>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="button">
                BETA
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.scene.fadeInOut} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12} className={clsx(this.props.tutorial != null && classes.disable, this.props.tutorial == SDT.fade2 && classes.highlight)}>
          <Collapse in={this.props.scene.fadeInOut} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} style={{paddingTop: 10}}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Timing</InputLabel>
                  <Select
                    value={this.props.scene.fadeIOTF}
                    onChange={this.onInput.bind(this, 'fadeIOTF')}>
                    {Object.values(TF).map((tf) =>
                      <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
                <Collapse in={this.props.scene.fadeIOTF == TF.sin} className={classes.fullWidth}>
                  <Typography id="fadeio-sin-rate-slider" variant="caption" component="div" color="textSecondary">
                    Wave Rate
                  </Typography>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <Slider
                        ref={this.sinInputRef}
                        min={1}
                        defaultValue={fadeSinRate}
                        onChangeCommitted={this.onSliderChange.bind(this, 'fadeIOSinRate')}
                        valueLabelDisplay={'auto'}
                        aria-labelledby="fadeio-sin-rate-slider"/>
                    </Grid>
                    <Grid item xs={3} className={classes.percentInput}>
                      <TextField
                        value={fadeSinRate}
                        onChange={this.onIntInput.bind(this, 'fadeIOSinRate')}
                        onBlur={this.blurIntKey.bind(this, 'fadeIOSinRate')}
                        inputProps={{
                          className: classes.endInput,
                          step: 5,
                          min: 0,
                          max: 100,
                          type: 'number',
                          'aria-labelledby': 'fadeio-sin-rate-slider',
                        }}/>
                    </Grid>
                  </Grid>
                </Collapse>
                <Collapse in={this.props.scene.fadeIOTF == TF.bpm} className={classes.fullWidth}>
                  <Typography id="fadeio-bpm-multi-slider" variant="caption" component="div" color="textSecondary">
                    BPM Multiplier {this.props.scene.fadeIOBPMMulti > 0 ? this.props.scene.fadeIOBPMMulti : "1 / " + (-1 * (this.props.scene.fadeIOBPMMulti - 2))}x
                  </Typography>
                  <Slider
                    min={-8}
                    max={10}
                    defaultValue={fadeBPMMulti}
                    onChangeCommitted={this.onSliderChange.bind(this, 'fadeIOBPMMulti')}
                    valueLabelDisplay={'auto'}
                    valueLabelFormat={(v) => v > 0 ? v + "x" : "1/" + (-1 * (v - 2)) + "x"}
                    aria-labelledby="fadeio-bpm-multi-slider"/>
                </Collapse>
                <Collapse in={this.props.scene.fadeIOTF == TF.constant} className={classes.fullWidth}>
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={fadeDuration}
                    onChange={this.onIntInput.bind(this, 'fadeIODuration')}
                    onBlur={this.blurIntKey.bind(this, 'fadeIODuration')}
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
          <Collapse in={this.props.scene.fadeInOut && (this.props.scene.fadeIOTF == TF.random || this.props.scene.fadeIOTF == TF.sin)} className={classes.fullWidth}>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={fadeDurationMin}
                  onChange={this.onIntInput.bind(this, 'fadeIODurationMin')}
                  onBlur={this.blurIntKey.bind(this, 'fadeIODurationMin')}
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
                  onChange={this.onIntInput.bind(this, 'fadeIODurationMax')}
                  onBlur={this.blurIntKey.bind(this, 'fadeIODurationMax')}
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
    if (key == 'fadeIOSinRate') {
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

export default withStyles(styles)(FadeIOCard as any);
