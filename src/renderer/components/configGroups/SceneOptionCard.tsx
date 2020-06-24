import * as React from "react";
import clsx from "clsx";

import {
  Collapse, createStyles, Divider, Fab, FormControl, FormControlLabel, Grid, IconButton,
  InputAdornment, InputLabel, MenuItem, Select, Slider, Switch, TextField, Theme, Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import {BT, IT, SDT, TF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import en from "../../data/en";
import Overlay from "../../data/Overlay";
import Scene from "../../data/Scene";
import ColorPicker from "../config/ColorPicker";
import ColorSetPicker from "../config/ColorSetPicker";

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
  }
});

class SceneOptionCard extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    scene: Scene | SceneSettings,
    sidebar: boolean,
    tutorial: string,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
    isTagging?: boolean,
  };

  readonly sinInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;

    const timingSinRate = typeof this.props.scene.timingSinRate === 'number' ? this.props.scene.timingSinRate : 0;
    const timingBPMMulti = typeof this.props.scene.timingBPMMulti === 'number' ? this.props.scene.timingBPMMulti : 0;
    const timingConstant = typeof this.props.scene.timingConstant === 'number' ? this.props.scene.timingConstant : 0;
    const timingMin = typeof this.props.scene.timingMin === 'number' ? this.props.scene.timingMin : 0;
    const timingMax = typeof this.props.scene.timingMax === 'number' ? this.props.scene.timingMax : 0;
    const backgroundBlur = typeof this.props.scene.backgroundBlur === 'number' ? this.props.scene.backgroundBlur : 0;
    const nextSceneTime = typeof this.props.scene.nextSceneTime === 'number' ? this.props.scene.nextSceneTime : 0;
    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} className={clsx(this.props.tutorial == SDT.timing && classes.highlight)}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} style={{paddingTop: 10}}>
              <FormControl className={classes.fullWidth}>
                <InputLabel>Timing</InputLabel>
                <Select
                  value={this.props.scene.timingFunction}
                  onChange={this.onInput.bind(this, 'timingFunction')}>
                  {[TF.constant, TF.random, TF.sin, TF.bpm].map((tf) =>
                    <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                  )}
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
                  BPM Multiplier {this.props.scene.timingBPMMulti > 0 ? this.props.scene.timingBPMMulti : "1 / " + (-1 * (this.props.scene.timingBPMMulti - 2))}x
                </Typography>
                <Slider
                  min={-8}
                  max={10}
                  defaultValue={timingBPMMulti}
                  onChangeCommitted={this.onSliderChange.bind(this, 'timingBPMMulti')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v > 0 ? v + "x" : "1/" + (-1 * (v - 2)) + "x"}
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
          <Collapse in={this.props.scene.timingFunction == TF.random || this.props.scene.timingFunction == TF.sin} className={classes.fullWidth}>
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
          <Divider />
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
              <Divider />
            </Grid>
            <Grid item xs={12} className={clsx(this.props.tutorial == SDT.nextScene && classes.highlight)}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={this.props.sidebar ? 12 : 7}>
                  <FormControl className={classes.fullWidth}>
                    <InputLabel>Next Scene</InputLabel>
                    <Select
                      value={this.props.scene.nextSceneID}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                          },
                        },
                      }}
                      onChange={this.onInput.bind(this, 'nextSceneID')}>
                      {["0"].concat(this.props.allScenes.filter((s) => s.id !== this.props.scene.id && s.sources.length > 0).map((s) => s.id.toString())).map((id) =>
                        <MenuItem key={id} value={id}>{this.getSceneName(id)}</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={this.props.sidebar ? 12 : 5}>
                  <Collapse in={this.props.scene.nextSceneID != 0}>
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
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider />
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
                      <AddIcon />
                    </Fab>
                  </Collapse>
                </Grid>
              </Grid>
            </Grid>
            {this.props.scene.overlays.map((o) => {
              const overlayOpacity = typeof o.opacity === 'number' ? o.opacity : 0;
              return (
                <React.Fragment key={o.id}>
                  <Grid item xs={12} className={clsx(!this.props.scene.overlayEnabled && classes.noPadding)}>
                    <Collapse in={this.props.scene.overlayEnabled} className={classes.fullWidth}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={this.props.sidebar ? 12 : 5}>
                          <FormControl className={classes.fullWidth}>
                            <InputLabel>Overlay</InputLabel>
                            <Select
                              value={o.sceneID}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 300,
                                  },
                                },
                              }}
                              onChange={this.onOverlayInput.bind(this, o.id, 'sceneID')}>
                              {["0"].concat(this.props.allScenes.filter((s) => s.sources.length > 0).map((s) => s.id.toString())).map((id) =>
                                <MenuItem key={id} value={id}>{this.getSceneName(id)}</MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={this.props.sidebar ? 12 : 7}>
                          <Typography id="overlay-opacity-slider" variant="caption" component="div" color="textSecondary">
                            Overlay Opacity: {o.opacity}%
                          </Typography>
                          <Grid container spacing={1} alignItems="center">
                            <Grid item xs>
                              <Slider
                                min={0}
                                max={99}
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
              )}
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
    this.update((s) => {s.overlays = newOverlays});
  }

  onRemoveOverlay(id: number) {
    const newOverlays = Array.from(this.props.scene.overlays);
    newOverlays.splice(newOverlays.map((o) => o.id).indexOf(id), 1);
    this.update((s) => {s.overlays = newOverlays});
  }

  getSceneName(id: string): string {
    if (id === "0") return "None";
    return this.props.allScenes.filter((s) => s.id.toString() === id)[0].name;
  }

  onOverlaySliderChange(id: number, key: string, e: MouseEvent, value: number) {
    this.changeOverlayKey(id, key, value);
  }

  onOverlayInput(id: number, key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeOverlayKey(id, key, input.value);
  }

  changeOverlayKey(id: number, key: string, value: any) {
    this.update((s) => s.overlays.find((o: Overlay) => o.id == id)[key] = value);
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

  changeIntKey(key:string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }
}

export default withStyles(styles)(SceneOptionCard as any);