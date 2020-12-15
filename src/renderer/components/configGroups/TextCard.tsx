import * as React from "react";
import {remote} from "electron";
import clsx from "clsx";
import fileURL from "file-url";
import fontList from "font-list";

import {
  CircularProgress, Collapse, createStyles, Divider, FormControl, FormControlLabel, Grid, IconButton, InputAdornment,
  InputLabel, MenuItem, Select, Switch, TextField, Theme, Tooltip, withStyles
} from "@material-ui/core";

import FolderIcon from '@material-ui/icons/Folder';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import {SceneSettings} from "../../data/Config";
import {CancelablePromise} from "../../data/utils";
import Scene from "../../data/Scene";
import ColorPicker from "../config/ColorPicker";

const styles = (theme: Theme) => createStyles({
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
  fontDivider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  fontProgress: {
    position: 'absolute',
  },
});

class TextCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    sidebar: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  readonly state = {
    showFonts: false,
    loadingFonts: true,
    systemFonts: Array<string>(),
  };

  render() {
    const classes = this.props.classes;

    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <FormControlLabel
                control={
                  <Switch checked={this.props.scene.textEnabled}
                          onChange={this.onToggleEnable.bind(this)}/>
                }
                label="Text Overlay"/>
                <Collapse in={this.props.scene.textEnabled && !this.props.scene.textNextScene}>
                  <FormControlLabel
                    control={
                      <Switch checked={this.props.scene.textEndStop}
                              size="small"
                              onChange={this.onToggleEndStop.bind(this)}/>
                    }
                    label="Stop at End"/>
                </Collapse>
              <Collapse in={this.props.scene.textEnabled && !this.props.scene.textEndStop}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.textNextScene}
                            size="small"
                            onChange={this.onToggleNextScene.bind(this)}/>
                  }
                  label="Next Scene at End"/>
              </Collapse>
            </Grid>
            <Grid item>
              <Collapse in={this.props.scene.textEnabled}>
                {this.state.loadingFonts && <CircularProgress size={46} className={classes.fontProgress} />}
                <Tooltip title="Toggle Font Options">
                  <IconButton
                    onClick={this.onToggleFontVisiblity.bind(this)}>
                    {this.state.showFonts ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                  </IconButton>
                </Tooltip>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={clsx(!this.props.scene.textEnabled && classes.noPadding)}>
          <Collapse in={this.props.scene.textEnabled} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  label="Script URL"
                  fullWidth
                  placeholder="Paste URL Here"
                  margin="dense"
                  value={this.props.scene.textSource}
                  InputProps={{
                    endAdornment:
                      <InputAdornment position="end">
                        <Tooltip title="Open File">
                          <IconButton
                            onClick={this.onOpenFile.bind(this)}>
                            <FolderIcon/>
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>,
                  }}
                  onChange={this.onInput.bind(this, 'textSource')}/>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        {this.props.scene.textEnabled && this.state.showFonts && (
          <Grid item xs={12} className={clsx((!this.props.scene.textEnabled || !this.state.showFonts) && classes.noPadding)}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={9}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Blink Font</InputLabel>
                  <Select
                    value={this.props.scene.blinkFontFamily}
                    disabled={this.state.systemFonts.length == 0}
                    style={{fontFamily: this.props.scene.blinkFontFamily}}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                    onChange={this.onInput.bind(this, 'blinkFontFamily')}>
                    {this.state.systemFonts.map((f) =>
                      <MenuItem key={f} value={f} style={{fontFamily: f}}>{f}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Size"
                  margin="dense"
                  value={this.props.scene.blinkFontSize}
                  onChange={this.onIntInput.bind(this, 'blinkFontSize')}
                  onBlur={this.blurIntKey.bind(this, 'blinkFontSize')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                  }}
                  inputProps={{
                    min: 1,
                    type: 'number',
                  }}/>
              </Grid>
              <Grid item xs={12}>
                <ColorPicker
                  sidebar={this.props.sidebar}
                  currentColor={this.props.scene.blinkColor}
                  onChangeColor={this.onInput.bind(this, 'blinkColor')}/>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.blinkBorder}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'blinkBorder')}/>
                  }
                  label="Border"/>
              </Grid>
              <Grid item xs={this.props.sidebar ? 12 : 3}>
                <Collapse in={this.props.scene.blinkBorder}>
                  <TextField
                    label="Width"
                    margin="dense"
                    value={this.props.scene.blinkBorderpx}
                    onChange={this.onIntInput.bind(this, 'blinkBorderpx')}
                    onBlur={this.blurIntKey.bind(this, 'blinkBorderpx')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                    inputProps={{
                      min: 1,
                      type: 'number',
                    }}/>
                </Collapse>
              </Grid>
              <Grid item xs={this.props.sidebar ? 12 : 9}>
                <Collapse in={this.props.scene.blinkBorder}>
                  {!this.props.scene.blinkBorder && (<div/>)}
                  {this.props.scene.blinkBorder && (
                    <ColorPicker
                      sidebar={this.props.sidebar}
                      currentColor={this.props.scene.blinkBorderColor}
                      onChangeColor={this.onInput.bind(this, 'blinkBorderColor')}/>
                  )}
                </Collapse>
              </Grid>
            </Grid>
            <Divider className={classes.fontDivider}/>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={9}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Caption Font</InputLabel>
                  <Select
                    value={this.props.scene.captionFontFamily}
                    disabled={this.state.systemFonts.length == 0}
                    style={{fontFamily: this.props.scene.captionFontFamily}}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                    onChange={this.onInput.bind(this, 'captionFontFamily')}>
                    {this.state.systemFonts.map((f) =>
                      <MenuItem key={f} value={f} style={{fontFamily: f}}>{f}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Size"
                  margin="dense"
                  value={this.props.scene.captionFontSize}
                  onChange={this.onIntInput.bind(this, 'captionFontSize')}
                  onBlur={this.blurIntKey.bind(this, 'captionFontSize')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                  }}
                  inputProps={{
                    min: 1,
                    type: 'number',
                  }}/>
              </Grid>
              <Grid item xs={12}>
                <ColorPicker
                  currentColor={this.props.scene.captionColor}
                  onChangeColor={this.onInput.bind(this, 'captionColor')}/>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.captionBorder}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'captionBorder')}/>
                  }
                  label="Border"/>
              </Grid>
              <Grid item xs={this.props.sidebar ? 12 : 3}>
                <Collapse in={this.props.scene.captionBorder}>
                  <TextField
                    label="Width"
                    margin="dense"
                    value={this.props.scene.captionBorderpx}
                    onChange={this.onIntInput.bind(this, 'captionBorderpx')}
                    onBlur={this.blurIntKey.bind(this, 'captionBorderpx')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                    inputProps={{
                      min: 1,
                      type: 'number',
                    }}/>
                </Collapse>
              </Grid>
              <Grid item xs={this.props.sidebar ? 12 : 9}>
                <Collapse in={this.props.scene.captionBorder}>
                  {!this.props.scene.captionBorder && (<div/>)}
                  {this.props.scene.captionBorder && (
                    <ColorPicker
                      sidebar={this.props.sidebar}
                      currentColor={this.props.scene.captionBorderColor}
                      onChangeColor={this.onInput.bind(this, 'captionBorderColor')}/>
                  )}
                </Collapse>
              </Grid>
            </Grid>
            <Divider className={classes.fontDivider}/>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={9}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Big Caption Font</InputLabel>
                  <Select
                    value={this.props.scene.captionBigFontFamily}
                    disabled={this.state.systemFonts.length == 0}
                    style={{fontFamily: this.props.scene.captionBigFontFamily}}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                    onChange={this.onInput.bind(this, 'captionBigFontFamily')}>
                    {this.state.systemFonts.map((f) =>
                      <MenuItem key={f} value={f} style={{fontFamily: f}}>{f}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Size"
                  margin="dense"
                  value={this.props.scene.captionBigFontSize}
                  onChange={this.onIntInput.bind(this, 'captionBigFontSize')}
                  onBlur={this.blurIntKey.bind(this, 'captionBigFontSize')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                  }}
                  inputProps={{
                    min: 1,
                    type: 'number',
                  }}/>
              </Grid>
              <Grid item xs={12}>
                <ColorPicker
                  currentColor={this.props.scene.captionBigColor}
                  onChangeColor={this.onInput.bind(this, 'captionBigColor')}/>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.captionBigBorder}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'captionBigBorder')}/>
                  }
                  label="Border"/>
              </Grid>
              <Grid item xs={this.props.sidebar ? 12 : 3}>
                <Collapse in={this.props.scene.captionBigBorder}>
                  <TextField
                    label="Width"
                    margin="dense"
                    value={this.props.scene.captionBigBorderpx}
                    onChange={this.onIntInput.bind(this, 'captionBigBorderpx')}
                    onBlur={this.blurIntKey.bind(this, 'captionBigBorderpx')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                    inputProps={{
                      min: 1,
                      type: 'number',
                    }}/>
                </Collapse>
              </Grid>
              <Grid item xs={this.props.sidebar ? 12 : 9}>
                <Collapse in={this.props.scene.captionBigBorder}>
                  {!this.props.scene.captionBigBorder && (<div/>)}
                  {this.props.scene.captionBigBorder && (
                    <ColorPicker
                      sidebar={this.props.sidebar}
                      currentColor={this.props.scene.captionBigBorderColor}
                      onChangeColor={this.onInput.bind(this, 'captionBigBorderColor')}/>
                  )}
                </Collapse>
              </Grid>
            </Grid>
            <Divider className={classes.fontDivider}/>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={9}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>Count Font</InputLabel>
                  <Select
                    value={this.props.scene.countFontFamily}
                    disabled={this.state.systemFonts.length == 0}
                    style={{fontFamily: this.props.scene.countFontFamily}}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                    onChange={this.onInput.bind(this, 'countFontFamily')}>
                    {this.state.systemFonts.map((f) =>
                      <MenuItem key={f} value={f} style={{fontFamily: f}}>{f}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Size"
                  margin="dense"
                  value={this.props.scene.countFontSize}
                  onChange={this.onIntInput.bind(this, 'countFontSize')}
                  onBlur={this.blurIntKey.bind(this, 'countFontSize')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                  }}
                  inputProps={{
                    min: 1,
                    type: 'number',
                  }}/>
              </Grid>
              <Grid item xs={12}>
                <ColorPicker
                  currentColor={this.props.scene.countColor}
                  onChangeColor={this.onInput.bind(this, 'countColor')}/>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.countBorder}
                            size="small"
                            onChange={this.onBoolInput.bind(this, 'countBorder')}/>
                  }
                  label="Border"/>
              </Grid>
              <Grid item xs={this.props.sidebar ? 12 : 3}>
                <Collapse in={this.props.scene.countBorder}>
                  <TextField
                    label="Width"
                    margin="dense"
                    value={this.props.scene.countBorderpx}
                    onChange={this.onIntInput.bind(this, 'countBorderpx')}
                    onBlur={this.blurIntKey.bind(this, 'countBorderpx')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                    inputProps={{
                      min: 1,
                      type: 'number',
                    }}/>
                </Collapse>
              </Grid>
              <Grid item xs={this.props.sidebar ? 12 : 9}>
                <Collapse in={this.props.scene.countBorder}>
                  {!this.props.scene.countBorder && (<div/>)}
                  {this.props.scene.countBorder && (
                    <ColorPicker
                      sidebar={this.props.sidebar}
                      currentColor={this.props.scene.countBorderColor}
                      onChangeColor={this.onInput.bind(this, 'countBorderColor')}/>
                  )}
                </Collapse>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  }

  _promise: CancelablePromise = null;
  componentDidMount() {
    // Define system fonts
    this._promise = new CancelablePromise((resolve, reject) => {
      fontList.getFonts().then((res: Array<string>) => {
          res = res.map((r) => {
            if (r.startsWith("\"") && r.endsWith("\"")) {
              return r.substring(1, r.length - 1);
            } else {
              return r;
            }
          })
          if (!this._promise.hasCanceled) {
            this.setState({systemFonts: res, loadingFonts: false});
          }
        },
        (err: string) => {
          console.error(err);
        }
      );
    });
  }

  componentWillUnmount() {
    if (this._promise != null) {
      this._promise.cancel();
    }
  }

  onToggleFontVisiblity() {
    this.setState({showFonts: !this.state.showFonts});
  }

  onOpenFile() {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openFile']});
    if (!result || !result.length) return;
    this.changeKey('textSource', fileURL(result[0]));
  }

  onToggleEnable(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey('textEnabled', input.checked);
  }

  onToggleEndStop(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.update((s) => {
      s.textEndStop = input.checked;
      if (input.checked) {
        s.textNextScene = false;
      }
    });
  }

  onToggleNextScene(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.update((s) => {
      s.textNextScene = input.checked;
      if (input.checked) {
        s.textEndStop = false;
      }
    });
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

  onIntInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value === '' ? '' : Number(input.value));
  }

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  onInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value);
  }

  changeIntKey(key:string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }
}

export default withStyles(styles)(TextCard as any);