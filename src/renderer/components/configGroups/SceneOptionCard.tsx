import * as React from "react";
import clsx from "clsx";

import {
  Button, Collapse, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, Divider, Fab, FormControl,
  FormControlLabel, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Slider, Switch, TextField, Theme,
  Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import ListIcon from '@material-ui/icons/List';

import {BT, IT, SDT, TF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import SceneSelect from "./SceneSelect";
import en from "../../data/en";
import Overlay from "../../data/Overlay";
import Scene from "../../data/Scene";
import ColorPicker from "../config/ColorPicker";
import ColorSetPicker from "../config/ColorSetPicker";
import MultiSceneSelect from "./MultiSceneSelect";
import {areWeightsValid} from "../../data/utils";
import Audio from "../../data/Audio";
import SceneGrid from "../../data/SceneGrid";

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
  noTopPadding: {
    paddingTop: '0 !important',
  },
  selectOffset: {
    paddingTop: '10px !important',
    paddingBottom: '0 !important',
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
  backdropTop: {
    zIndex: theme.zIndex.modal + 1,
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid',
  },
  disable: {
    pointerEvents: 'none',
  },
  randomScene: {
    display: 'block',
  },
  selectText: {
    color: theme.palette.text.secondary,
  },
  error: {
    color: theme.palette.error.main,
  },
  noScroll: {
    overflow: 'visible',
  },
  randomSceneDialog: {
    minWidth: 400,
    overflow: 'visible',
  },
  noBPM: {
    float: 'right',
  }
});

class SceneOptionCard extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    allSceneGrids: Array<SceneGrid>,
    scene: Scene | SceneSettings,
    sidebar: boolean,
    tutorial: string,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
    isTagging?: boolean,
  };

  readonly state = {
    randomSceneList: null as Array<number>,
  }

  readonly sinInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;

    const timingSinRate = typeof this.props.scene.timingSinRate === 'number' ? this.props.scene.timingSinRate : 0;
    const timingBPMMulti = typeof this.props.scene.timingBPMMulti === 'number' ? this.props.scene.timingBPMMulti : 0;
    const timingConstant = typeof this.props.scene.timingConstant === 'number' ? this.props.scene.timingConstant : 0;
    const timingMin = typeof this.props.scene.timingMin === 'number' ? this.props.scene.timingMin : 0;
    const timingMax = typeof this.props.scene.timingMax === 'number' ? this.props.scene.timingMax : 0;
    const backForthSinRate = typeof this.props.scene.backForthSinRate === 'number' ? this.props.scene.backForthSinRate : 0;
    const backForthBPMMulti = typeof this.props.scene.backForthBPMMulti === 'number' ? this.props.scene.backForthBPMMulti : 0;
    const backForthConstant = typeof this.props.scene.backForthConstant === 'number' ? this.props.scene.backForthConstant : 0;
    const backForthMin = typeof this.props.scene.backForthMin === 'number' ? this.props.scene.backForthMin : 0;
    const backForthMax = typeof this.props.scene.backForthMax === 'number' ? this.props.scene.backForthMax : 0;
    const backgroundBlur = typeof this.props.scene.backgroundBlur === 'number' ? this.props.scene.backgroundBlur : 0;
    const nextSceneTime = typeof this.props.scene.nextSceneTime === 'number' ? this.props.scene.nextSceneTime : 0;

    const playlists = (this.props.scene.audioPlaylists as {audios: Audio[], shuffle: boolean, repeat: string}[]);
    const hasBPM = !!playlists && playlists.length && playlists[0].audios.length && playlists[0].audios[0].bpm;
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} className={clsx(this.props.tutorial == SDT.timing && classes.highlight)}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} style={{paddingTop: 10}}>
              <FormControl className={classes.fullWidth}>
                <InputLabel>Timing</InputLabel>
                <Select
                  value={this.props.scene.timingFunction}
                  onChange={this.onInput.bind(this, 'timingFunction')}>
                  {[TF.constant, TF.random, TF.sin, TF.bpm].map((tf) => {
                    if (tf == TF.bpm) {
                      return <MenuItem key={tf} value={tf}>
                        {en.get(tf)} {!hasBPM && <Tooltip title={"Missing audio with BPM"}><ErrorOutlineIcon color={'error'} className={classes.noBPM}/></Tooltip>}
                      </MenuItem>
                    } else {
                      return <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                    }
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
              <Collapse in={this.props.scene.timingFunction == TF.sin} className={classes.fullWidth}>
                <Typography id="scene-sin-rate-slider" variant="caption" component="div" color="textSecondary">
                  Wave Rate
                </Typography>
                <Grid container alignItems="center">
                  <Grid item xs>
                    <Slider
                      ref={this.sinInputRef}
                      min={1}
                      defaultValue={timingSinRate}
                      onChangeCommitted={this.onSliderChange.bind(this, 'timingSinRate')}
                      valueLabelDisplay={'auto'}
                      aria-labelledby="scene-sin-rate-slider"/>
                  </Grid>
                  <Grid item xs={3} className={classes.percentInput}>
                    <TextField
                      value={timingSinRate}
                      onChange={this.onIntInput.bind(this, 'timingSinRate')}
                      onBlur={this.blurIntKey.bind(this, 'timingSinRate')}
                      inputProps={{
                        className: classes.endInput,
                        step: 5,
                        min: 0,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'scene-sin-rate-slider',
                      }}/>
                  </Grid>
                </Grid>
              </Collapse>
              <Collapse in={this.props.scene.timingFunction == TF.bpm} className={classes.fullWidth}>
                <Typography id="scene-bpm-multi-slider" variant="caption" component="div" color="textSecondary">
                  BPM Multiplier {this.props.scene.timingBPMMulti / 10}x
                </Typography>
                <Slider
                  min={1}
                  max={100}
                  defaultValue={timingBPMMulti}
                  onChangeCommitted={this.onSliderChange.bind(this, 'timingBPMMulti')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => (v / 10) + "x"}
                  aria-labelledby="scene-bpm-multi-slider"/>
              </Collapse>
              <Collapse in={this.props.scene.timingFunction == TF.constant} className={classes.fullWidth}>
                <TextField
                  variant="outlined"
                  label="For"
                  margin="dense"
                  value={timingConstant}
                  onChange={this.onIntInput.bind(this, 'timingConstant')}
                  onBlur={this.blurIntKey.bind(this, 'timingConstant')}
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
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.scene.timingFunction == TF.random || this.props.scene.timingFunction == TF.sin}
                    className={classes.fullWidth}>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={timingMin}
                  onChange={this.onIntInput.bind(this, 'timingMin')}
                  onBlur={this.blurIntKey.bind(this, 'timingMin')}
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
                  value={timingMax}
                  onChange={this.onIntInput.bind(this, 'timingMax')}
                  onBlur={this.blurIntKey.bind(this, 'timingMax')}
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
        <Grid item xs={12}>
          <Divider/>
        </Grid>
        <Grid item xs={12} className={clsx(this.props.tutorial == SDT.backForth && classes.highlight)}>
          <Grid container alignItems="center">
            <Grid item xs={12}>
              <Tooltip title="Go back and forth between the last two images">
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.backForth}
                            onChange={this.onBoolInput.bind(this, 'backForth')}/>
                  }
                  label="Back/Forth"/>
              </Tooltip>
            </Grid>
          </Grid>
          <Collapse in={this.props.scene.backForth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} style={{paddingTop: 10}}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Back/Forth Timing</InputLabel>
                  <Select
                    value={this.props.scene.backForthTF}
                    onChange={this.onInput.bind(this, 'backForthTF')}>
                    {[TF.constant, TF.random, TF.sin, TF.bpm].map((tf) => {
                      if (tf == TF.bpm) {
                        return <MenuItem key={tf} value={tf}>
                          {en.get(tf)} {!hasBPM && <Tooltip title={"Missing audio with BPM"}><ErrorOutlineIcon color={'error'} className={classes.noBPM}/></Tooltip>}
                        </MenuItem>
                      } else {
                        return <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                      }
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
                <Collapse in={this.props.scene.backForthTF == TF.sin} className={classes.fullWidth}>
                  <Typography id="bf-sin-rate-slider" variant="caption" component="div" color="textSecondary">
                    Wave Rate
                  </Typography>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <Slider
                        ref={this.sinInputRef}
                        min={1}
                        defaultValue={backForthSinRate}
                        onChangeCommitted={this.onSliderChange.bind(this, 'backForthSinRate')}
                        valueLabelDisplay={'auto'}
                        aria-labelledby="bf-sin-rate-slider"/>
                    </Grid>
                    <Grid item xs={3} className={classes.percentInput}>
                      <TextField
                        value={backForthSinRate}
                        onChange={this.onIntInput.bind(this, 'backForthSinRate')}
                        onBlur={this.blurIntKey.bind(this, 'backForthSinRate')}
                        inputProps={{
                          className: classes.endInput,
                          step: 5,
                          min: 0,
                          max: 100,
                          type: 'number',
                          'aria-labelledby': 'bf-sin-rate-slider',
                        }}/>
                    </Grid>
                  </Grid>
                </Collapse>
                <Collapse in={this.props.scene.backForthTF == TF.bpm} className={classes.fullWidth}>
                  <Typography id="bf-bpm-multi-slider" variant="caption" component="div" color="textSecondary">
                    BPM Multiplier {this.props.scene.backForthBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={backForthBPMMulti}
                    onChangeCommitted={this.onSliderChange.bind(this, 'backForthBPMMulti')}
                    valueLabelDisplay={'auto'}
                    valueLabelFormat={(v) => (v / 10) + "x"}
                    aria-labelledby="bf-bpm-multi-slider"/>
                </Collapse>
                <Collapse in={this.props.scene.backForthTF == TF.constant} className={classes.fullWidth}>
                  <TextField
                    variant="outlined"
                    label="Every"
                    margin="dense"
                    value={backForthConstant}
                    onChange={this.onIntInput.bind(this, 'backForthConstant')}
                    onBlur={this.blurIntKey.bind(this, 'backForthConstant')}
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
        <Grid item xs={12} className={clsx(!(this.props.scene.backForth && (this.props.scene.backForthTF == TF.random || this.props.scene.backForthTF == TF.sin)) && classes.noPadding)}>
          <Collapse in={this.props.scene.backForth && (this.props.scene.backForthTF == TF.random || this.props.scene.backForthTF == TF.sin)}
                    className={classes.fullWidth}>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={backForthMin}
                  onChange={this.onIntInput.bind(this, 'backForthMin')}
                  onBlur={this.blurIntKey.bind(this, 'backForthMin')}
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
                  value={backForthMax}
                  onChange={this.onIntInput.bind(this, 'backForthMax')}
                  onBlur={this.blurIntKey.bind(this, 'backForthMax')}
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
        <Grid item xs={12}>
          <Divider/>
        </Grid>
        <Grid item xs={12} className={clsx(this.props.tutorial == SDT.imageSizing && classes.highlight)}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={this.props.sidebar ? 8 : 12} sm={this.props.sidebar ? 8 : 6}>
              <FormControl className={classes.fullWidth}>
                <InputLabel>Image Sizing</InputLabel>
                <Select
                  value={this.props.scene.imageType}
                  onChange={this.onInput.bind(this, 'imageType')}>
                  {Object.values(IT).map((it) =>
                    <MenuItem key={it} value={it}>{en.get(it)}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}/>
            <Grid item xs={this.props.sidebar ? 8 : 12} sm={this.props.sidebar ? 8 : 4}>
              <FormControl className={classes.fullWidth}>
                <InputLabel>Background</InputLabel>
                <Select
                  value={this.props.scene.backgroundType}
                  onChange={this.onInput.bind(this, 'backgroundType')}>
                  {Object.values(BT).map((bt) =>
                    <MenuItem key={bt} value={bt}>{en.get(bt)}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
              <Collapse in={this.props.scene.backgroundType == BT.blur} className={classes.fullWidth}>
                <Typography id="scene-bg-color-slider" variant="caption" component="div" color="textSecondary">
                  Blur: {this.props.scene.backgroundBlur}px
                </Typography>
                <Slider
                  min={0}
                  max={30}
                  defaultValue={backgroundBlur}
                  onChangeCommitted={this.onSliderChange.bind(this, 'backgroundBlur')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v + "px"}
                  aria-labelledby="scene-bg-color-slider"/>
              </Collapse>
              <Collapse in={this.props.scene.backgroundType == BT.color} className={classes.fullWidth}>
                {this.props.scene.backgroundType == BT.color && (
                  <ColorPicker
                    currentColor={this.props.scene.backgroundColor}
                    onChangeColor={this.onInput.bind(this, 'backgroundColor')}/>
                )}
              </Collapse>
              <Collapse in={this.props.scene.backgroundType == BT.colorSet} className={classes.fullWidth}>
                {this.props.scene.backgroundType == BT.colorSet && (
                  <ColorSetPicker
                    currentColors={this.props.scene.backgroundColorSet}
                    onChangeColors={this.onInput.bind(this, 'backgroundColorSet')}/>
                )}
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        {!this.props.isTagging && (
          <React.Fragment>
            <Grid item xs={12}>
              <Divider/>
            </Grid>
            <Grid item xs={12} className={clsx(this.props.tutorial == SDT.nextScene && classes.highlight)}>
              <Grid container spacing={2} alignItems="center">
                <Grid item className={classes.noTopPadding} xs={this.props.scene.nextSceneID == -1 ? 10 : 12}
                      sm={this.props.scene.nextSceneID == -1 ? this.props.sidebar ? 10 : 5 : this.props.sidebar ? 12 : 7}>
                  <Typography className={classes.selectText} variant="caption">Next Scene</Typography>
                  <SceneSelect
                    scene={this.props.scene}
                    allScenes={this.props.allScenes}
                    value={this.props.scene.nextSceneID}
                    includeExtra
                    getSceneName={this.getSceneName.bind(this)}
                    onChange={this.changeIntKey.bind(this, 'nextSceneID')}
                  />
                  <Dialog
                    classes={{paper: classes.randomSceneDialog}}
                    open={this.state.randomSceneList != null}
                    onClose={this.onRandomSceneDialog.bind(this)}
                    aria-describedby="random-scene-description">
                    <DialogContent classes={{root: classes.noScroll}}>
                      <DialogContentText id="random-scene-description">
                        Select which scenes to include:
                      </DialogContentText>
                      <MultiSceneSelect
                        scene={this.props.scene}
                        allScenes={this.props.allScenes}
                        values={this.state.randomSceneList != null ? this.state.randomSceneList : this.props.scene.nextSceneRandoms}
                        getSceneName={this.getSceneName.bind(this)}
                        onChange={this.changeRandomScenes.bind(this)}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.onSelectNone.bind(this)} color="default">
                        Select None
                      </Button>
                      <Button onClick={this.onSelectAll.bind(this)} color="default">
                        Select All
                      </Button>
                    </DialogActions>
                    <DialogActions>
                      <Button onClick={this.onRandomSceneDialog.bind(this)} color="secondary">
                        Cancel
                      </Button>
                      <Button onClick={this.onSaveRandomScene.bind(this)} color="primary">
                        Save
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Grid>
                {this.props.scene.nextSceneID == -1 &&
                <Grid item className={classes.selectOffset}>
                  <Tooltip
                    title={this.props.scene.nextSceneRandoms.length == 0 ? "Select Scenes (EMPTY)" : "Select Scenes"}>
                    <IconButton
                      className={clsx(this.props.scene.nextSceneRandoms.length == 0 && classes.error)}
                      onClick={this.onRandomSceneDialog.bind(this)}>
                      <ListIcon/>
                    </IconButton>
                  </Tooltip>
                </Grid>
                }
                <Grid item className={classes.selectOffset} xs={12} sm={this.props.sidebar ? 12 : 5}>
                  <Collapse in={this.props.scene.nextSceneID != 0 && !this.props.scene.nextSceneAllImages}>
                    <TextField
                      variant="outlined"
                      label="Play after"
                      margin="dense"
                      value={nextSceneTime}
                      onChange={this.onIntInput.bind(this, 'nextSceneTime')}
                      onBlur={this.blurIntKey.bind(this, 'nextSceneTime')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">sec</InputAdornment>,
                      }}
                      inputProps={{
                        min: 0,
                        type: 'number',
                      }}/>
                  </Collapse>
                </Grid>
                <Grid item xs>
                  <Collapse in={this.props.scene.nextSceneID != 0}>
                    <FormControlLabel
                      control={
                        <Switch checked={this.props.scene.nextSceneAllImages}
                                onChange={this.onBoolInput.bind(this, 'nextSceneAllImages')}/>
                      }
                      label="Play After All Images"/>
                  </Collapse>
                </Grid>
                {!this.props.sidebar && (
                  <React.Fragment>
                    <Grid item xs>
                      <Collapse in={this.props.scene.nextSceneID != 0}>
                        <FormControlLabel
                          control={
                            <Switch checked={this.props.scene.persistAudio}
                                    onChange={this.onBoolInput.bind(this, 'persistAudio')}/>
                          }
                          label="Persist Audio"/>
                      </Collapse>
                    </Grid>
                    <Grid item xs>
                      <Collapse in={this.props.scene.nextSceneID != 0}>
                        <FormControlLabel
                          control={
                            <Switch checked={this.props.scene.persistText}
                                    onChange={this.onBoolInput.bind(this, 'persistText')}/>
                          }
                          label="Persist Text Overlay"/>
                      </Collapse>
                    </Grid>
                  </React.Fragment>
                )}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider/>
            </Grid>
            <Grid item xs={12} className={clsx(this.props.tutorial == SDT.overlays && classes.highlight)}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <FormControlLabel
                    control={
                      <Switch checked={this.props.scene.overlayEnabled}
                              onChange={this.onBoolInput.bind(this, 'overlayEnabled')}/>
                    }
                    label="Overlays"/>
                </Grid>
                <Grid item>
                  <Collapse in={this.props.scene.overlayEnabled}>
                    <Fab
                      className={classes.addButton}
                      onClick={this.onAddOverlay.bind(this)}
                      size="small">
                      <AddIcon/>
                    </Fab>
                  </Collapse>
                </Grid>
              </Grid>
            </Grid>
            {this.props.scene.overlays.map((o) => {
                const overlayOpacity = typeof o.opacity === 'number' ? o.opacity : 0;
                const oScene = this.props.allScenes.find((s) => s.id == o.sceneID);
                const regenerate = oScene && oScene.generatorWeights && oScene.regenerate;
                const invalid = regenerate && !areWeightsValid(oScene);
                return (
                  <React.Fragment key={o.id}>
                    <Grid item xs={12} className={clsx(!this.props.scene.overlayEnabled && classes.noPadding)}>
                      <Collapse in={this.props.scene.overlayEnabled} className={classes.fullWidth}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={this.props.sidebar ? 12 : 5}>
                            <Typography className={classes.selectText} variant="caption">Overlay{regenerate ? invalid ? " ✗" : " ⟳" : ""}</Typography>
                            <SceneSelect
                              allScenes={this.props.allScenes}
                              allSceneGrids={this.props.allSceneGrids}
                              value={o.sceneID}
                              getSceneName={this.getSceneName.bind(this)}
                              onChange={this.changeOverlayIntKey.bind(this, o.id, 'sceneID')}
                            />
                          </Grid>
                          <Grid item xs={12} sm={this.props.sidebar ? 12 : 7}>
                            <Typography id="overlay-opacity-slider" variant="caption" component="div"
                                        color="textSecondary">
                              Overlay Opacity: {o.opacity}%
                            </Typography>
                            <Grid container spacing={1} alignItems="center">
                              <Grid item xs>
                                <Slider
                                  min={0}
                                  max={100}
                                  defaultValue={overlayOpacity}
                                  onChangeCommitted={this.onOverlaySliderChange.bind(this, o.id, 'opacity')}
                                  valueLabelDisplay={'auto'}
                                  valueLabelFormat={(v) => v + "%"}
                                  aria-labelledby="overlay-opacity-slider"/>
                              </Grid>
                              <Grid item>
                                <Tooltip title="Remove Overlay">
                                  <IconButton
                                    onClick={this.onRemoveOverlay.bind(this, o.id)}>
                                    <DeleteIcon color="error"/>
                                  </IconButton>
                                </Tooltip>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Collapse>
                    </Grid>
                    <Grid item xs={12} className={clsx(!this.props.scene.overlayEnabled && classes.noPadding)}>
                      <Collapse in={this.props.scene.overlayEnabled} className={classes.fullWidth}>
                        <Divider/>
                      </Collapse>
                    </Grid>
                  </React.Fragment>
                )
              }
            )}
          </React.Fragment>
        )}
      </Grid>
    );
  }

  onAddOverlay() {
    let id = this.props.scene.overlays.length + 1;
    this.props.scene.overlays.forEach((o) => {
      id = Math.max(o.id + 1, id);
    });
    const newOverlays = this.props.scene.overlays.concat([new Overlay({id: id})]);
    this.update((s) => {
      s.overlays = newOverlays
    });
  }

  onRemoveOverlay(id: number) {
    const newOverlays = Array.from(this.props.scene.overlays);
    newOverlays.splice(newOverlays.map((o) => o.id).indexOf(id), 1);
    this.update((s) => {
      s.overlays = newOverlays
    });
  }

  getSceneName(id: string): string {
    if (id === "0") return "None";
    if (id === "-1") return "Random";
    if (id.startsWith('999')) {
      return this.props.allSceneGrids.find((s) => s.id.toString() == id.replace('999', ''))?.name;
    }
    return this.props.allScenes.find((s) => s.id.toString() === id).name;
  }

  onOverlaySliderChange(id: number, key: string, e: MouseEvent, value: number) {
    this.changeOverlayKey(id, key, value);
  }

  changeOverlayKey(id: number, key: string, value: any) {
    this.update((s) => s.overlays.find((o: Overlay) => o.id == id)[key] = value);
  }

  changeOverlayIntKey(id: number, key: string, intString: string) {
    this.changeOverlayKey(id, key, intString === '' ? '' : Number(intString));
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
    if (key == 'timingSinRate') {
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

  changeIntKey(key: string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  onRandomSceneDialog() {
    if (this.state.randomSceneList != null) {
      this.setState({randomSceneList: null});
    } else {
      this.setState({randomSceneList: this.props.scene.nextSceneRandoms});
    }
  }

  changeRandomScenes(sceneIDs: Array<number>) {
    this.setState({randomSceneList: sceneIDs});
  }

  onSelectNone() {
    this.setState({randomSceneList: []});
  }

  onSelectAll() {
    this.setState({randomSceneList: this.props.allScenes.map((s) => s.id)});
  }

  onSaveRandomScene() {
    this.changeKey("nextSceneRandoms", this.state.randomSceneList);
    this.onRandomSceneDialog();
  }
}

(SceneOptionCard as any).displayName="SceneOptionCard";
export default withStyles(styles)(SceneOptionCard as any);