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

import {EA, HTF, SDT, TF, VTF} from "../../data/const";
import { SceneSettings } from "../../data/Config";
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

class ZoomMoveCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    easingControls: boolean,
    sidebar: boolean,
    tutorial: string,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  readonly horizInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  readonly vertInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  readonly sinInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;

    const enabled = this.props.scene.zoom || this.props.scene.horizTransType != HTF.none || this.props.scene.vertTransType != VTF.none;
    const zoomStart = typeof this.props.scene.zoomStart === 'number' ? this.props.scene.zoomStart : 0;
    const zoomEnd = typeof this.props.scene.zoomEnd === 'number' ? this.props.scene.zoomEnd : 0;
    const zoomStartMax = typeof this.props.scene.zoomStartMax === 'number' ? this.props.scene.zoomStartMax : 0;
    const zoomStartMin = typeof this.props.scene.zoomStartMin === 'number' ? this.props.scene.zoomStartMin : 0;
    const zoomEndMax = typeof this.props.scene.zoomEndMax === 'number' ? this.props.scene.zoomEndMax : 0;
    const zoomEndMin = typeof this.props.scene.zoomEndMin === 'number' ? this.props.scene.zoomEndMin : 0;
    const horizTransLevel = typeof this.props.scene.horizTransLevel === 'number' ? this.props.scene.horizTransLevel : 0;
    const horizTransLevelMax = typeof this.props.scene.horizTransLevelMax === 'number' ? this.props.scene.horizTransLevelMax : 0;
    const horizTransLevelMin = typeof this.props.scene.horizTransLevelMin === 'number' ? this.props.scene.horizTransLevelMin : 0;
    const vertTransLevel = typeof this.props.scene.vertTransLevel === 'number' ? this.props.scene.vertTransLevel : 0;
    const vertTransLevelMax = typeof this.props.scene.vertTransLevelMax === 'number' ? this.props.scene.vertTransLevelMax : 0;
    const vertTransLevelMin = typeof this.props.scene.vertTransLevelMin === 'number' ? this.props.scene.vertTransLevelMin : 0;
    const transSinRate = typeof this.props.scene.transSinRate === 'number' ? this.props.scene.transSinRate : 0;
    const transBPMMulti = typeof this.props.scene.transBPMMulti === 'number' ? this.props.scene.transBPMMulti : 0;
    const transDuration = typeof this.props.scene.transDuration === 'number' ? this.props.scene.transDuration : 0;
    const transDurationMin = typeof this.props.scene.transDurationMin === 'number' ? this.props.scene.transDurationMin : 0;
    const transDurationMax = typeof this.props.scene.transDurationMax === 'number' ? this.props.scene.transDurationMax : 0;

    const playlists = (this.props.scene.audioPlaylists as {audios: Audio[], shuffle: boolean, repeat: string}[]);
    const hasBPM = !!playlists && playlists.length && playlists[0].audios.length && playlists[0].audios[0].bpm;
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} className={clsx(this.props.tutorial != null && this.props.tutorial != SDT.zoom1 && this.props.tutorial != SDT.zoom2 && classes.disable)}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 5}>
              <FormControlLabel
                className={clsx(this.props.tutorial == SDT.zoom1 && classes.highlight)}
                control={
                  <Switch checked={this.props.scene.zoom}
                          onChange={this.onBoolInput.bind(this, 'zoom')}/>
                }
                label="Zoom"/>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 7} className={clsx(this.props.tutorial != null && classes.disable)}>
              <Collapse in={this.props.scene.zoom} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  className={clsx(this.props.tutorial == SDT.zoom1 && classes.disable)}
                  control={
                    <Switch checked={this.props.scene.zoomRandom}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'zoomRandom')}/>
                  }
                  label="Randomize Zoom"/>
              </Collapse>
            </Grid>
          </Grid>
          <Collapse in={this.props.scene.zoom && !this.props.scene.zoomRandom} className={clsx(classes.fullWidth, this.props.tutorial == SDT.zoom2 && classes.highlight)}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <Typography>
                  Zoom Start: {zoomStart}x
                </Typography>
                <Slider
                  min={1}
                  max={50}
                  className={clsx(this.props.tutorial == SDT.zoom2 && zoomStart == 0.8 && classes.disable)}
                  defaultValue={zoomStart * 10}
                  onChangeCommitted={this.onZoomSliderChange.bind(this, 'zoomStart')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v / 10 + "x"}
                  aria-labelledby="zoom-start-slider"/>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <Typography>
                  Zoom End: {zoomEnd}x
                </Typography>
                <Slider
                  min={1}
                  max={50}
                  className={clsx(this.props.tutorial == SDT.zoom2 && zoomEnd == 1.2 && classes.disable)}
                  defaultValue={zoomEnd * 10}
                  onChangeCommitted={this.onZoomSliderChange.bind(this, 'zoomEnd')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v / 10 + "x"}
                  aria-labelledby="zoom-end-slider"/>
              </Grid>
            </Grid>
          </Collapse>
          <Collapse in={this.props.scene.zoom && this.props.scene.zoomRandom} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <Typography>
                  Zoom Start Min: {zoomStartMin}x
                </Typography>
                <Slider
                  min={1}
                  max={50}
                  defaultValue={zoomStartMin * 10}
                  onChangeCommitted={this.onZoomSliderChange.bind(this, 'zoomStartMin')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v / 10 + "x"}
                  aria-labelledby="zoom-start-min-slider"/>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <Typography>
                  Zoom Start Max: {zoomStartMax}x
                </Typography>
                <Slider
                  min={1}
                  max={50}
                  defaultValue={zoomStartMax * 10}
                  onChangeCommitted={this.onZoomSliderChange.bind(this, 'zoomStartMax')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v / 10 + "x"}
                  aria-labelledby="zoom-start-max-slider"/>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <Typography>
                  Zoom End Min: {zoomEndMin}x
                </Typography>
                <Slider
                  min={1}
                  max={50}
                  defaultValue={zoomEndMin * 10}
                  onChangeCommitted={this.onZoomSliderChange.bind(this, 'zoomEndMin')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v / 10 + "x"}
                  aria-labelledby="zoom-end-min-slider"/>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <Typography>
                  Zoom End Max: {zoomEndMax}x
                </Typography>
                <Slider
                  min={1}
                  max={50}
                  defaultValue={zoomEndMax * 10}
                  onChangeCommitted={this.onZoomSliderChange.bind(this, 'zoomEndMax')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v / 10 + "x"}
                  aria-labelledby="zoom-end-max-slider"/>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        <Grid item xs={12} className={clsx(!enabled && classes.noPadding)}>
          <Collapse in={enabled} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12} className={clsx(this.props.tutorial && classes.disable)}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={!this.props.sidebar && this.props.scene.horizTransType != HTF.none ? 5 : 12}>
              <FormControl variant="standard" className={classes.fullWidth}>
                <InputLabel>Move Horizontally</InputLabel>
                <Select
                  variant="standard"
                  value={this.props.scene.horizTransType}
                  onChange={this.onInput.bind(this, 'horizTransType')}>
                  {Object.values(HTF).map((tf) =>
                    <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={!this.props.sidebar && this.props.scene.horizTransType != HTF.none ? 7 : 12}
                  className={clsx(this.props.scene.horizTransType == HTF.none && classes.noPadding)}>
              <Collapse in={this.props.scene.horizTransType != HTF.none} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.horizTransRandom}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'horizTransRandom')}/>
                  }
                  label="Randomize"/>
              </Collapse>
            </Grid>
            <Grid item xs={12} className={clsx(this.props.scene.horizTransType == HTF.none && classes.noPadding)}>
              <Collapse in={this.props.scene.horizTransType != HTF.none && !this.props.scene.horizTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      ref={this.horizInputRef}
                      defaultValue={horizTransLevel}
                      onChangeCommitted={this.onSliderChange.bind(this, 'horizTransLevel')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="horiz-trans-level-slider"/>
                  </Grid>
                  <Grid item xs={3} className={classes.percentInput}>
                    <TextField
                      variant="standard"
                      value={horizTransLevel}
                      margin="dense"
                      onChange={this.onIntInput.bind(this, 'horizTransLevel')}
                      onBlur={this.blurIntKey.bind(this, 'horizTransLevel')}
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
              <Collapse in={this.props.scene.horizTransType != HTF.none && this.props.scene.horizTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography>
                      Min: {horizTransLevelMin}%
                    </Typography>
                    <Slider
                      defaultValue={horizTransLevelMin}
                      onChangeCommitted={this.onSliderChange.bind(this, 'horizTransLevelMin')}
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
                      onChangeCommitted={this.onSliderChange.bind(this, 'horizTransLevelMax')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="horiz-trans-max-slider"/>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={clsx(!enabled && classes.noPadding)}>
          <Collapse in={enabled} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12} className={clsx(this.props.tutorial && classes.disable)}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={!this.props.sidebar && this.props.scene.vertTransType != VTF.none ? 5 : 12}>
              <FormControl variant="standard" className={classes.fullWidth}>
                <InputLabel>Move Vertically</InputLabel>
                <Select
                  variant="standard"
                  value={this.props.scene.vertTransType}
                  onChange={this.onInput.bind(this, 'vertTransType')}>
                  {Object.values(VTF).map((tf) =>
                    <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={!this.props.sidebar && this.props.scene.vertTransType != VTF.none ? 7 : 12}
                  className={clsx(this.props.scene.vertTransType == VTF.none && classes.noPadding)}>
              <Collapse in={this.props.scene.vertTransType != VTF.none} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.vertTransRandom}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'vertTransRandom')}/>
                  }
                  label="Randomize"/>
              </Collapse>
            </Grid>
            <Grid item xs={12} className={clsx(this.props.scene.vertTransType == VTF.none && classes.noPadding)}>
              <Collapse in={this.props.scene.vertTransType != VTF.none && !this.props.scene.vertTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      ref={this.vertInputRef}
                      defaultValue={vertTransLevel}
                      onChangeCommitted={this.onSliderChange.bind(this, 'vertTransLevel')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="vert-trans-level-slider"/>
                  </Grid>
                  <Grid item xs={3} className={classes.percentInput}>
                    <TextField
                      variant="standard"
                      value={vertTransLevel}
                      margin="dense"
                      onChange={this.onIntInput.bind(this, 'vertTransLevel')}
                      onBlur={this.blurIntKey.bind(this, 'vertTransLevel')}
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
              <Collapse in={this.props.scene.vertTransType != VTF.none && this.props.scene.vertTransRandom} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography>
                      Min: {vertTransLevelMin}%
                    </Typography>
                    <Slider
                      defaultValue={vertTransLevelMin}
                      onChangeCommitted={this.onSliderChange.bind(this, 'vertTransLevelMin')}
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
                      onChangeCommitted={this.onSliderChange.bind(this, 'vertTransLevelMax')}
                      valueLabelDisplay={'auto'}
                      valueLabelFormat={(v) => v + '%'}
                      aria-labelledby="vert-trans-max-slider"/>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={clsx(!enabled && classes.noPadding)}>
          <Collapse in={enabled} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12} className={clsx(!enabled && classes.noPadding, this.props.tutorial != null && this.props.tutorial != SDT.zoom3 && classes.disable)}>
          <Collapse in={enabled} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 4}>
                <FormControl
                  variant="standard"
                  className={clsx(classes.fullWidth, this.props.tutorial == SDT.zoom3 && clsx(classes.highlight, classes.backdropTop))}>
                  <InputLabel>Timing</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.transTF}
                    MenuProps={this.props.tutorial == SDT.zoom3 ? { className: classes.backdropTop } : {}}
                    onChange={this.onInput.bind(this, 'transTF')}>
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
                <Collapse in={this.props.scene.transTF == TF.sin} className={classes.fullWidth}>
                  <Typography variant="caption" component="div" color="textSecondary">
                    Wave Rate
                  </Typography>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <Slider
                        ref={this.sinInputRef}
                        min={1}
                        defaultValue={transSinRate}
                        onChangeCommitted={this.onSliderChange.bind(this, 'transSinRate')}
                        valueLabelDisplay={'auto'}
                        aria-labelledby="trans-sin-rate-slider" />
                    </Grid>
                    <Grid item xs={3} className={classes.percentInput}>
                      <TextField
                        variant="standard"
                        value={transSinRate}
                        onChange={this.onIntInput.bind(this, 'transSinRate')}
                        onBlur={this.blurIntKey.bind(this, 'transSinRate')}
                        inputProps={{
                          className: classes.endInput,
                          step: 5,
                          min: 0,
                          max: 100,
                          type: 'number',
                          'aria-labelledby': 'trans-sin-rate-slider',
                        }} />
                    </Grid>
                  </Grid>
                </Collapse>
                <Collapse in={this.props.scene.transTF == TF.bpm} className={classes.fullWidth}>
                  <Typography variant="caption" component="div" color="textSecondary">
                    BPM Multiplier {this.props.scene.transBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={transBPMMulti}
                    onChangeCommitted={this.onSliderChange.bind(this, 'transBPMMulti')}
                    valueLabelDisplay={'auto'}
                    valueLabelFormat={(v) => (v / 10) + "x"}
                    aria-labelledby="trans-bpm-multi-slider" />
                </Collapse>
                <Collapse in={this.props.scene.transTF == TF.constant} className={classes.fullWidth}>
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={transDuration}
                    onChange={this.onIntInput.bind(this, 'transDuration')}
                    onBlur={this.blurIntKey.bind(this, 'transDuration')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                    }}
                    inputProps={{
                      step: 100,
                      min: 0,
                      type: 'number',
                    }} />
                </Collapse>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        <Grid item xs={12} className={clsx(!enabled && classes.noPadding, this.props.tutorial != null && classes.disable, this.props.tutorial == SDT.zoom4 && classes.highlight)}>
          <Collapse in={enabled && (this.props.scene.transTF == TF.random || this.props.scene.transTF == TF.sin)} className={classes.fullWidth}>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={transDurationMin}
                  onChange={this.onIntInput.bind(this, 'transDurationMin')}
                  onBlur={this.blurIntKey.bind(this, 'transDurationMin')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: 'number',
                  }} />
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="and"
                  margin="dense"
                  value={transDurationMax}
                  onChange={this.onIntInput.bind(this, 'transDurationMax')}
                  onBlur={this.blurIntKey.bind(this, 'transDurationMax')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: 'number',
                  }} />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        {this.props.easingControls && (
          <React.Fragment>
            <Grid item xs={12} className={clsx(!enabled && classes.noPadding)}>
              <Collapse in={enabled} className={classes.fullWidth}>
                <Divider />
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Collapse in={enabled} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FormControl variant="standard" className={classes.fullWidth}>
                      <InputLabel>Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.transEase}
                        onChange={this.onInput.bind(this, 'transEase')}>
                        {Object.values(EA).map((rf) =>
                          <MenuItem key={rf} value={rf}>{en.get(rf)}</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.transEase == EA.polyIn || this.props.scene.transEase == EA.polyOut || this.props.scene.transEase == EA.polyInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Exponent: {this.props.scene.transExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.transExp}
                        onChangeCommitted={this.onSliderChange.bind(this, 'transExp')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/2}
                        aria-labelledby="exp-slider"/>
                    </Collapse>
                    <Collapse in={this.props.scene.transEase == EA.backIn || this.props.scene.transEase == EA.backOut || this.props.scene.transEase == EA.backInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Overshoot: {this.props.scene.transOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.transOv}
                        onChangeCommitted={this.onSliderChange.bind(this, 'transOv')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/2}
                        aria-labelledby="ov-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.transEase == EA.elasticIn || this.props.scene.transEase == EA.elasticOut || this.props.scene.transEase == EA.elasticInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Amplitude: {this.props.scene.transAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.transAmp}
                        onChangeCommitted={this.onSliderChange.bind(this, 'transAmp')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v) => v/20}
                        aria-labelledby="amp-slider"/>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse in={this.props.scene.transEase == EA.elasticIn || this.props.scene.transEase == EA.elasticOut || this.props.scene.transEase == EA.elasticInOut} className={classes.fullWidth}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        Period: {this.props.scene.transPer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.transPer}
                        onChangeCommitted={this.onSliderChange.bind(this, 'transPer')}
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

    // Update uncontrolled sliders
    if (key == 'horizTransLevel') {
      (this.horizInputRef.current.children.item(1) as any).style.width = value + '%';
      (this.horizInputRef.current.children.item(3) as any).style.left = value + '%';
      this.horizInputRef.current.children.item(3).children.item(0).children.item(0).children.item(0).innerHTML = value;
    } else if (key == 'vertTransLevel') {
      (this.vertInputRef.current.children.item(1) as any).style.width = value + '%';
      (this.vertInputRef.current.children.item(3) as any).style.left = value + '%';
      this.vertInputRef.current.children.item(3).children.item(0).children.item(0).children.item(0).innerHTML = value;
    } else if (key == 'transSinRate') {
      (this.sinInputRef.current.children.item(1) as any).style.width = value + '%';
      (this.sinInputRef.current.children.item(3) as any).style.left = value + '%';
      this.sinInputRef.current.children.item(3).children.item(0).children.item(0).children.item(0).innerHTML = value;
    }
  }

  onZoomSliderChange(key: string, e: MouseEvent, value: number) {
    this.changeKey(key, value / 10);
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

  changeIntKey(key: string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }
}

(ZoomMoveCard as any).displayName="ZoomMoveCard";
export default withStyles(styles)(ZoomMoveCard as any);