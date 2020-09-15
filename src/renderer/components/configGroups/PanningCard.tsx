import * as React from "react";
import clsx from "clsx";

import {
  Collapse, createStyles, Divider, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel,
  MenuItem, Select, Slider, Switch, TextField, Theme, Typography, withStyles
} from "@material-ui/core";

import {HTF, SDT, TF, VTF} from "../../data/const";
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
  },
  noPadding: {
    padding: '0 !important',
  },
});

class PanningCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    sidebar: boolean,
    tutorial: string,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  readonly horizInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  readonly vertInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  readonly sinInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;

    const panSinRate = typeof this.props.scene.panSinRate === 'number' ? this.props.scene.panSinRate : 0;
    const panBPMMulti = typeof this.props.scene.panBPMMulti === 'number' ? this.props.scene.panBPMMulti : 0;
    const panDuration = typeof this.props.scene.panDuration === 'number' ? this.props.scene.panDuration : 0;
    const panDurationMin = typeof this.props.scene.panDurationMin === 'number' ? this.props.scene.panDurationMin : 0;
    const panDurationMax = typeof this.props.scene.panDurationMax === 'number' ? this.props.scene.panDurationMax : 0;
    const horizTransLevel = typeof this.props.scene.panHorizTransLevel === 'number' ? this.props.scene.panHorizTransLevel : 0;
    const horizTransLevelMax = typeof this.props.scene.panHorizTransLevelMax === 'number' ? this.props.scene.panHorizTransLevelMax : 0;
    const horizTransLevelMin = typeof this.props.scene.panHorizTransLevelMin === 'number' ? this.props.scene.panHorizTransLevelMin : 0;
    const vertTransLevel = typeof this.props.scene.panVertTransLevel === 'number' ? this.props.scene.panVertTransLevel : 0;
    const vertTransLevelMax = typeof this.props.scene.panVertTransLevelMax === 'number' ? this.props.scene.panVertTransLevelMax : 0;
    const vertTransLevelMin = typeof this.props.scene.panVertTransLevelMin === 'number' ? this.props.scene.panVertTransLevelMin : 0;
    return(
      <Grid container spacing={this.props.scene.panning ? 2 : 0} alignItems="center" className={clsx(this.props.tutorial != null && classes.disable)}>
        <Grid item xs={12}>
          <Grid container alignItems="center">
            <Grid item xs={11}>
              <FormControlLabel
                control={
                  <Switch checked={this.props.scene.panning}
                          onChange={this.onBoolInput.bind(this, 'panning')}/>
                }
                label="Panning"/>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="button">
                BETA
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.scene.panning} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={!this.props.sidebar && this.props.scene.panHorizTransType != HTF.none ? 5 : 12}>
              <Collapse in={this.props.scene.panning} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Move Horizontally</InputLabel>
                  <Select
                    value={this.props.scene.panHorizTransType}
                    onChange={this.onInput.bind(this, 'panHorizTransType')}>
                    {Object.values(HTF).map((tf) => {
                        switch (tf) {
                          case HTF.left:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} to {en.get(HTF.right)}</MenuItem>
                          case HTF.right:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} to {en.get(HTF.left)}</MenuItem>
                          case HTF.random:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} to Right/Left</MenuItem>
                          default:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                        }
                      }
                    )}
                  </Select>
                </FormControl>
              </Collapse>
            </Grid>
            <Grid item xs={12} sm={!this.props.sidebar && this.props.scene.panHorizTransType != HTF.none ? 7 : 12}
                  className={clsx((!this.props.scene.panning || this.props.scene.panHorizTransType == HTF.none) && classes.noPadding)}>
              <Collapse in={this.props.scene.panning && this.props.scene.panHorizTransType != HTF.none} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.panHorizTransRandom}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'panHorizTransRandom')}/>
                  }
                  label="Randomize"/>
              </Collapse>
            </Grid>
            <Grid item xs={12} className={clsx((!this.props.scene.panning || this.props.scene.panHorizTransType == HTF.none) && classes.noPadding)}>
              <Collapse in={this.props.scene.panning && this.props.scene.panHorizTransType != HTF.none && !this.props.scene.panHorizTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      ref={this.horizInputRef}
                      defaultValue={horizTransLevel}
                      onChangeCommitted={this.onSliderChange.bind(this, 'panHorizTransLevel')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="horiz-trans-level-slider"/>
                  </Grid>
                  <Grid item xs={3} className={classes.percentInput}>
                    <TextField
                      value={horizTransLevel}
                      margin="dense"
                      onChange={this.onIntInput.bind(this, 'panHorizTransLevel')}
                      onBlur={this.blurIntKey.bind(this, 'panHorizTransLevel')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{
                        className: classes.endInput,
                        step: 5,
                        min: 0,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'horiz-trans-level-slider',
                      }} />
                  </Grid>
                </Grid>
              </Collapse>
              <Collapse in={this.props.scene.panning && this.props.scene.panHorizTransType != HTF.none && this.props.scene.panHorizTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography id="horiz-trans-min-slider">
                      Min: {horizTransLevelMin}%
                    </Typography>
                    <Slider
                      defaultValue={horizTransLevelMin}
                      onChangeCommitted={this.onSliderChange.bind(this, 'panHorizTransLevelMin')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="horiz-trans-min-slider"/>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography id="horiz-trans-max-slider">
                      Max: {horizTransLevelMax}%
                    </Typography>
                    <Slider
                      defaultValue={horizTransLevelMax}
                      onChangeCommitted={this.onSliderChange.bind(this, 'panHorizTransLevelMax')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="horiz-trans-max-slider"/>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={clsx(!this.props.scene.panning && classes.noPadding)}>
          <Collapse in={this.props.scene.panning} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={!this.props.sidebar && this.props.scene.panVertTransType != VTF.none ? 5 : 12}>
              <Collapse in={this.props.scene.panning} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Move Vertically</InputLabel>
                  <Select
                    value={this.props.scene.panVertTransType}
                    onChange={this.onInput.bind(this, 'panVertTransType')}>
                    {Object.values(VTF).map((tf) => {
                        switch (tf) {
                          case VTF.up:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} to {en.get(VTF.down)}</MenuItem>
                          case VTF.down:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} to {en.get(VTF.up)}</MenuItem>
                          case VTF.random:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} to Down/Up</MenuItem>
                          default:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                        }
                      }
                    )}
                  </Select>
                </FormControl>
              </Collapse>
            </Grid>
            <Grid item xs={12} sm={!this.props.sidebar && this.props.scene.panVertTransType != VTF.none ? 7 : 12}
                  className={clsx((!this.props.scene.panning || this.props.scene.panVertTransType == VTF.none) && classes.noPadding)}>
              <Collapse in={this.props.scene.panning && this.props.scene.panVertTransType != VTF.none} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.panVertTransRandom}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'panVertTransRandom')}/>
                  }
                  label="Randomize"/>
              </Collapse>
            </Grid>
            <Grid id="test" item xs={12} className={clsx((!this.props.scene.panning || this.props.scene.panVertTransType == VTF.none) && classes.noPadding)}>
              <Collapse in={this.props.scene.panning && this.props.scene.panVertTransType != VTF.none && !this.props.scene.panVertTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      ref={this.vertInputRef}
                      defaultValue={vertTransLevel}
                      onChangeCommitted={this.onSliderChange.bind(this, 'panVertTransLevel')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="vert-trans-level-slider"/>
                  </Grid>
                  <Grid item xs={3} className={classes.percentInput}>
                    <TextField
                      value={vertTransLevel}
                      margin="dense"
                      onChange={this.onIntInput.bind(this, 'panVertTransLevel')}
                      onBlur={this.blurIntKey.bind(this, 'panVertTransLevel')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{
                        className: classes.endInput,
                        step: 5,
                        min: 0,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'vert-trans-level-slider',
                      }} />
                  </Grid>
                </Grid>
              </Collapse>
              <Collapse in={this.props.scene.panning && this.props.scene.panVertTransType != VTF.none && this.props.scene.panVertTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography id="vert-trans-min-slider">
                      Min: {vertTransLevelMin}%
                    </Typography>
                    <Slider
                      defaultValue={vertTransLevelMin}
                      onChangeCommitted={this.onSliderChange.bind(this, 'panVertTransLevelMin')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="vert-trans-min-slider"/>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography id="vert-trans-max-slider">
                      Max: {vertTransLevelMax}%
                    </Typography>
                    <Slider
                      defaultValue={vertTransLevelMax}
                      onChangeCommitted={this.onSliderChange.bind(this, 'panVertTransLevelMax')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="vert-trans-max-slider"/>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={clsx(!this.props.scene.panning && classes.noPadding)}>
          <Collapse in={this.props.scene.panning} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.scene.panning} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} style={{paddingTop: 10}}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Timing</InputLabel>
                  <Select
                    value={this.props.scene.panTF}
                    onChange={this.onInput.bind(this, 'panTF')}>
                    {Object.values(TF).map((tf) =>
                      <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
                <Collapse in={this.props.scene.panning && this.props.scene.panTF == TF.sin} className={classes.fullWidth}>
                  <Typography id="pan-sin-rate-slider" variant="caption" component="div" color="textSecondary">
                    Wave Rate
                  </Typography>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <Slider
                        ref={this.sinInputRef}
                        min={1}
                        defaultValue={panSinRate}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panSinRate')}
                        valueLabelDisplay={'auto'}
                        aria-labelledby="pan-sin-rate-slider"/>
                    </Grid>
                    <Grid item xs={3} className={classes.percentInput}>
                      <TextField
                        value={panSinRate}
                        onChange={this.onIntInput.bind(this, 'panSinRate')}
                        onBlur={this.blurIntKey.bind(this, 'panSinRate')}
                        inputProps={{
                          className: classes.endInput,
                          step: 5,
                          min: 0,
                          max: 100,
                          type: 'number',
                          'aria-labelledby': 'pan-sin-rate-slider',
                        }}/>
                    </Grid>
                  </Grid>
                </Collapse>
                <Collapse in={this.props.scene.panning && this.props.scene.panTF == TF.bpm} className={classes.fullWidth}>
                  <Typography id="pan-bpm-multi-slider" variant="caption" component="div" color="textSecondary">
                    BPM Multiplier {this.props.scene.panBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={panBPMMulti}
                    onChangeCommitted={this.onSliderChange.bind(this, 'panBPMMulti')}
                    valueLabelDisplay={'auto'}
                    valueLabelFormat={(v) => (v / 10) + "x"}
                    aria-labelledby="pan-bpm-multi-slider"/>
                </Collapse>
                <Collapse in={this.props.scene.panning && this.props.scene.panTF == TF.constant} className={classes.fullWidth}>
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={panDuration}
                    onChange={this.onIntInput.bind(this, 'panDuration')}
                    onBlur={this.blurIntKey.bind(this, 'panDuration')}
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
          <Collapse in={this.props.scene.panning && (this.props.scene.panTF == TF.random || this.props.scene.panTF == TF.sin)} className={classes.fullWidth}>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={panDurationMin}
                  onChange={this.onIntInput.bind(this, 'panDurationMin')}
                  onBlur={this.blurIntKey.bind(this, 'panDurationMin')}
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
                  value={panDurationMax}
                  onChange={this.onIntInput.bind(this, 'panDurationMax')}
                  onBlur={this.blurIntKey.bind(this, 'panDurationMax')}
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
    if (key == 'panHorizTransLevel') {
      (this.horizInputRef.current.children.item(1) as any).style.width = value + '%';
      (this.horizInputRef.current.children.item(3) as any).style.left = value + '%';
      this.horizInputRef.current.children.item(3).children.item(0).children.item(0).children.item(0).innerHTML = value;
    } else if (key == 'panVertTransLevel') {
      (this.vertInputRef.current.children.item(1) as any).style.width = value + '%';
      (this.vertInputRef.current.children.item(3) as any).style.left = value + '%';
      this.vertInputRef.current.children.item(3).children.item(0).children.item(0).children.item(0).innerHTML = value;
    } else if (key == 'panSinRate') {
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

export default withStyles(styles)(PanningCard as any);
