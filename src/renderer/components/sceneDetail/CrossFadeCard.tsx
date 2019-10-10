import * as React from "react";
import clsx from "clsx";

import {
  Card, CardContent, Collapse, createStyles, FormControl, FormControlLabel, Grid, Input, InputAdornment, InputLabel,
  MenuItem, Select, Slider, Switch, TextField, Theme, Typography, withStyles
} from "@material-ui/core";

import {TF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import Scene from "../../data/Scene";
import en from "../../data/en";

const styles = (theme: Theme) => createStyles({
  fullWidth: {
    width: '100%',
  },
  paddingLeft: {
    paddingLeft: theme.spacing(1),
  },
  paddingTop: {
    paddingTop: `${theme.spacing(2)}px !important`,
  },
});

class CrossFadeCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    const classes = this.props.classes;

    const fadeSinRate = typeof this.props.scene.fadeSinRate === 'number' ? this.props.scene.fadeSinRate : 0;
    const fadeBPMMulti = typeof this.props.scene.fadeBPMMulti === 'number' ? this.props.scene.fadeBPMMulti : 0;
    const fadeDuration = typeof this.props.scene.fadeDuration === 'number' ? this.props.scene.fadeDuration : 0;
    const fadeDurationMin = typeof this.props.scene.fadeDurationMin === 'number' ? this.props.scene.fadeDurationMin : 0;
    const fadeDurationMax = typeof this.props.scene.fadeDurationMax === 'number' ? this.props.scene.fadeDurationMax : 0;
    return(
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={5}>
                  <FormControlLabel
                    control={
                      <Switch checked={this.props.scene.crossFade}
                                onChange={this.onBoolInput.bind(this, 'crossFade')}/>
                    }
                    label="Cross Fade"/>
                </Grid>
                <Grid item xs={7}>
                  <Collapse in={this.props.scene.crossFade} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                    <FormControlLabel
                      disabled={this.props.scene.gridView}
                      control={
                        <Switch
                          checked={this.props.scene.crossFadeAudio}
                          onChange={this.onBoolInput.bind(this, 'crossFadeAudio')}/>
                      }
                      label="Cross-Fade Audio"/>
                  </Collapse>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Collapse in={this.props.scene.crossFade} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4} className={classes.paddingTop}>
                    <FormControl className={classes.fullWidth}>
                      <InputLabel>Fade Timing</InputLabel>
                      <Select
                        value={this.props.scene.fadeTF}
                        onChange={this.onInput.bind(this, 'fadeTF')}>
                        {Object.values(TF).map((tf) =>
                          <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={8}>
                    <Collapse in={this.props.scene.fadeTF == TF.sin} className={classes.fullWidth}>
                      <Typography id="fade-sin-rate-slider">
                        Wave Rate
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={9}>
                          <Slider
                            min={1}
                            value={fadeSinRate}
                            onChange={this.onSliderChange.bind(this, 'fadeSinRate')}
                            aria-labelledby="fade-sin-rate-slider"/>
                        </Grid>
                        <Grid item xs={3}>
                          <Input
                            value={fadeSinRate}
                            margin="dense"
                            onChange={this.onIntInput.bind(this, 'fadeSinRate')}
                            onBlur={this.blurIntKey.bind(this, 'fadeSinRate')}
                            inputProps={{
                              step: 5,
                              min: 1,
                              max: 100,
                              type: 'number',
                              'aria-labelledby': 'fade-sin-rate-slider',
                            }}/>
                        </Grid>
                      </Grid>
                    </Collapse>
                    <Collapse in={this.props.scene.fadeTF == TF.bpm} className={classes.fullWidth}>
                      <Typography id="fade-bpm-multi-slider">
                        BPM Multiplier {this.props.scene.fadeBPMMulti > 0 ? this.props.scene.fadeBPMMulti : "1 / " + (-1 * (this.props.scene.fadeBPMMulti - 2))}x
                      </Typography>
                      <Slider
                        min={-8}
                        max={10}
                        value={fadeBPMMulti}
                        onChange={this.onSliderChange.bind(this, 'fadeBPMMulti')}
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
            <Grid item xs={12}>
              <Collapse in={this.props.scene.crossFade && (this.props.scene.fadeTF == TF.random || this.props.scene.fadeTF == TF.sin)} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
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
                  <Grid item xs={1}>
                    <Typography>
                      and
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      variant="outlined"
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
          </Grid>
        </CardContent>
      </Card>
    );
  }

  blurIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.props.scene as any)[key] < min) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.scene as any)[key] > max) {
      this.changeIntKey(key, max);
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

export default withStyles(styles)(CrossFadeCard as any);
