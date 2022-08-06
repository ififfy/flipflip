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

import {EA, HTF, TF, VTF} from "../../data/const";
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
    easingControls: boolean,
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

    const playlists = (this.props.scene.audioPlaylists as {audios: Audio[], shuffle: boolean, repeat: string}[]);
    const hasBPM = !!playlists && playlists.length && playlists[0].audios.length && playlists[0].audios[0].bpm;
    return (
      <Grid container spacing={this.props.scene.panning ? 2 : 0} alignItems="center" className={clsx(this.props.tutorial != null && classes.disable)}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={this.props.scene.panning}
                      onChange={this.onBoolInput.bind(this, 'panning')}/>
            }
            label="Panning"/>
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
                <FormControl variant="standard" className={classes.fullWidth}>
                  <InputLabel>Move Horizontally</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.panHorizTransType}
                    onChange={this.onInput.bind(this, 'panHorizTransType')}>
                    {Object.values(HTF).map((tf) => {
                        switch (tf) {
                          case HTF.left:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} then {en.get(HTF.right)}</MenuItem>
                          case HTF.right:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} then {en.get(HTF.left)}</MenuItem>
                          case HTF.random:
                            return <MenuItem key={tf} value={tf}>Random</MenuItem>
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
              <Collapse in={this.props.scene.panning && !this.props.scene.panHorizTransImg && this.props.scene.panHorizTransType != HTF.none} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.panHorizTransRandom}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'panHorizTransRandom')}/>
                  }
                  label="Randomize"/>
              </Collapse>
              <Collapse in={this.props.scene.panning && this.props.scene.panHorizTransType != HTF.none} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.panHorizTransImg}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'panHorizTransImg')}/>
                  }
                  label="Use Img Width"/>
              </Collapse>
            </Grid>
            <Grid item xs={12} className={clsx((!this.props.scene.panning || this.props.scene.panHorizTransType == HTF.none) && classes.noPadding)}>
              <Collapse in={this.props.scene.panning && !this.props.scene.panHorizTransImg && this.props.scene.panHorizTransType != HTF.none && !this.props.scene.panHorizTransRandom} className={classes.fullWidth}>
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
                      variant="standard"
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
              <Collapse in={this.props.scene.panning && !this.props.scene.panHorizTransImg && this.props.scene.panHorizTransType != HTF.none && this.props.scene.panHorizTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography>
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
                    <Typography>
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
                <FormControl variant="standard" className={classes.fullWidth}>
                  <InputLabel>Move Vertically</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.panVertTransType}
                    onChange={this.onInput.bind(this, 'panVertTransType')}>
                    {Object.values(VTF).map((tf) => {
                        switch (tf) {
                          case VTF.up:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} then {en.get(VTF.down)}</MenuItem>
                          case VTF.down:
                            return <MenuItem key={tf} value={tf}>{en.get(tf)} then {en.get(VTF.up)}</MenuItem>
                          case VTF.random:
                            return <MenuItem key={tf} value={tf}>Random</MenuItem>
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
              <Collapse in={this.props.scene.panning && !this.props.scene.panVertTransImg && this.props.scene.panVertTransType != VTF.none} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.panVertTransRandom}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'panVertTransRandom')}/>
                  }
                  label="Randomize"/>
              </Collapse>
              <Collapse in={this.props.scene.panning && this.props.scene.panVertTransType != VTF.none} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.panVertTransImg}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'panVertTransImg')}/>
                  }
                  label="Use Img Height"/>
              </Collapse>
            </Grid>
            <Grid id="test" item xs={12} className={clsx((!this.props.scene.panning || this.props.scene.panVertTransType == VTF.none) && classes.noPadding)}>
              <Collapse in={this.props.scene.panning && !this.props.scene.panVertTransImg && this.props.scene.panVertTransType != VTF.none && !this.props.scene.panVertTransRandom} className={classes.fullWidth}>
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
                      variant="standard"
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
              <Collapse in={this.props.scene.panning && !this.props.scene.panVertTransImg && this.props.scene.panVertTransType != VTF.none && this.props.scene.panVertTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography>
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
                    <Typography>
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
                <FormControl variant="standard" className={classes.fullWidth}>
                  <InputLabel>Timing</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.panTF}
                    onChange={this.onInput.bind(this, 'panTF')}>
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
                <Collapse in={this.props.scene.panning && this.props.scene.panTF == TF.sin} className={classes.fullWidth}>
                  <Typography variant="caption" component="div" color="textSecondary">
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
                        variant="standard"
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
                        }} />
                    </Grid>
                  </Grid>
                </Collapse>
                <Collapse in={this.props.scene.panning && this.props.scene.panTF == TF.bpm} className={classes.fullWidth}>
                  <Typography variant="caption" component="div" color="textSecondary">
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
        {this.props.easingControls && (
          <React.Fragment>
            <Grid item xs={12} className={clsx(!this.props.scene.panning && classes.noPadding)}>
              <Collapse in={this.props.scene.panning} className={classes.fullWidth}>
                <Divider />
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Collapse in={this.props.scene.panning} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FormControl variant="standard" className={classes.fullWidth}>
                      <InputLabel>Start Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.panStartEase}
                        onChange={this.onInput.bind(this, 'panStartEase')}>
                        {Object.values(EA).map((rf) =>
                          <MenuItem key={rf} value={rf}>{en.get(rf)}</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.panStartEase == EA.polyIn || this.props.scene.panStartEase == EA.polyOut || this.props.scene.panStartEase == EA.polyInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Exponent: {this.props.scene.panStartExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.panStartExp}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panStartExp')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/2}
                        aria-labelledby="start-exp-slider"/>
                    </Collapse>
                    <Collapse in={this.props.scene.panStartEase == EA.backIn || this.props.scene.panStartEase == EA.backOut || this.props.scene.panStartEase == EA.backInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Overshoot: {this.props.scene.panStartOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.panStartOv}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panStartOv')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/2}
                        aria-labelledby="start-ov-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.panStartEase == EA.elasticIn || this.props.scene.panStartEase == EA.elasticOut || this.props.scene.panStartEase == EA.elasticInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Amplitude: {this.props.scene.panStartAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.panStartAmp}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panStartAmp')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/20}
                        aria-labelledby="start-amp-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.panStartEase == EA.elasticIn || this.props.scene.panStartEase == EA.elasticOut || this.props.scene.panStartEase == EA.elasticInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Period: {this.props.scene.panStartPer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.panStartPer}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panStartPer')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/20}
                        aria-labelledby="start-per-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FormControl variant="standard" className={classes.fullWidth}>
                      <InputLabel>End Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.panEndEase}
                        onChange={this.onInput.bind(this, 'panEndEase')}>
                        {Object.values(EA).map((rf) =>
                          <MenuItem key={rf} value={rf}>{en.get(rf)}</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.panEndEase == EA.polyIn || this.props.scene.panEndEase == EA.polyOut || this.props.scene.panEndEase == EA.polyInOut} className={classes.fullWidth}>
                    <Typography variant="caption" component="div" color="textSecondary">
                        Exponent: {this.props.scene.panEndExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.panEndExp}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panEndExp')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/2}
                        aria-labelledby="end-exp-slider"/>
                    </Collapse>
                    <Collapse in={this.props.scene.panEndEase == EA.backIn || this.props.scene.panEndEase == EA.backOut || this.props.scene.panEndEase == EA.backInOut} className={classes.fullWidth}>
                    <Typography variant="caption" component="div" color="textSecondary">
                        Overshoot: {this.props.scene.panEndOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.panEndOv}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panEndOv')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/2}
                        aria-labelledby="end-ov-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.panEndEase == EA.elasticIn || this.props.scene.panEndEase == EA.elasticOut || this.props.scene.panEndEase == EA.elasticInOut} className={classes.fullWidth}>
                    <Typography variant="caption" component="div" color="textSecondary">
                        Amplitude: {this.props.scene.panEndAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.panEndAmp}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panEndAmp')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/20}
                        aria-labelledby="end-amp-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.panEndEase == EA.elasticIn || this.props.scene.panEndEase == EA.elasticOut || this.props.scene.panEndEase == EA.elasticInOut} className={classes.fullWidth}>
                    <Typography variant="caption" component="div" color="textSecondary">
                        Period: {this.props.scene.panEndPer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.panEndPer}
                        onChangeCommitted={this.onSliderChange.bind(this, 'panEndPer')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/20}
                        aria-labelledby="end-per-slider"/>
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

(PanningCard as any).displayName="PanningCard";
export default withStyles(styles)(PanningCard as any);
