import * as React from "react";
import {remote} from "electron";
import clsx from "clsx";
import fileURL from "file-url";
import SystemFonts from "system-font-families";

import {
  Card, CardContent, Collapse, createStyles, Divider, FormControl, FormControlLabel, Grid, IconButton, InputAdornment,
  InputLabel, MenuItem, Select, Switch, TextField, Theme, Tooltip, withStyles
} from "@material-ui/core";

import FolderIcon from '@material-ui/icons/Folder';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import {SceneSettings} from "../../data/Config";
import {CancelablePromise} from "../../data/utils";
import Scene from "../../data/Scene";
import ColorPicker from "../ui/ColorPicker";

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
  }
});

class TextCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  readonly state = {
    showFonts: false,
    systemFonts: Array<string>(),
  };

  render() {
    const classes = this.props.classes;

    return(
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <FormControlLabel
                    control={
                      <Switch checked={this.props.scene.textEnabled}
                              onChange={this.onBoolInput.bind(this, 'textEnabled')}/>
                    }
                    label="Text Overlay"/>
                </Grid>
                {this.state.systemFonts.length > 0 && (
                  <Grid item>
                    <Collapse in={this.props.scene.textEnabled}>
                      <Tooltip title="Toggle Font Options">
                        <IconButton
                          onClick={this.onToggleFontVisiblity.bind(this)}>
                          {this.state.showFonts ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                        </IconButton>
                      </Tooltip>
                    </Collapse>
                  </Grid>
                )}
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
            <Grid item xs={12} className={clsx((!this.props.scene.textEnabled || !this.state.showFonts) && classes.noPadding)}>
              <Collapse in={this.props.scene.textEnabled && this.state.showFonts} className={classes.fullWidth}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <FormControl className={classes.fullWidth}>
                      <InputLabel>Blink Font</InputLabel>
                      <Select
                        value={this.props.scene.blinkFontFamily}
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
                  <Grid item xs={4}>
                    <TextField
                      label="Size"
                      margin="dense"
                      value={this.props.scene.blinkFontSize}
                      onChange={this.onIntInput.bind(this, 'blinkFontSize')}
                      onBlur={this.blurIntKey.bind(this, 'blinkFontSize')}
                      inputProps={{
                        min: 1,
                        type: 'number',
                      }}/>
                  </Grid>
                  <Grid item xs={12}>
                    <ColorPicker
                      currentColor={this.props.scene.blinkColor}
                      onChangeColor={this.onInput.bind(this, 'blinkColor')}/>
                  </Grid>
                </Grid>
                <Divider className={classes.fontDivider}/>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <FormControl className={classes.fullWidth}>
                      <InputLabel>Caption Font</InputLabel>
                      <Select
                        value={this.props.scene.captionFontFamily}
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
                  <Grid item xs={4}>
                    <TextField
                      label="Size"
                      margin="dense"
                      value={this.props.scene.captionFontSize}
                      onChange={this.onIntInput.bind(this, 'captionFontSize')}
                      onBlur={this.blurIntKey.bind(this, 'captionFontSize')}
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
                </Grid>
                <Divider className={classes.fontDivider}/>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <FormControl className={classes.fullWidth}>
                      <InputLabel>Big Caption Font</InputLabel>
                      <Select
                        value={this.props.scene.captionBigFontFamily}
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
                  <Grid item xs={4}>
                    <TextField
                      label="Size"
                      margin="dense"
                      value={this.props.scene.captionBigFontSize}
                      onChange={this.onIntInput.bind(this, 'captionBigFontSize')}
                      onBlur={this.blurIntKey.bind(this, 'captionBigFontSize')}
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
                </Grid>
                <Divider className={classes.fontDivider}/>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <FormControl className={classes.fullWidth}>
                      <InputLabel>Count Font</InputLabel>
                      <Select
                        value={this.props.scene.countFontFamily}
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
                  <Grid item xs={4}>
                    <TextField
                      label="Size"
                      margin="dense"
                      value={this.props.scene.countFontSize}
                      onChange={this.onIntInput.bind(this, 'countFontSize')}
                      onBlur={this.blurIntKey.bind(this, 'countFontSize')}
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
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  _promise: CancelablePromise = null;
  componentDidMount() {
    // Define system fonts
    this._promise = new CancelablePromise((resolve, reject) => {
      new SystemFonts().getFonts().then((res: Array<string>) => {
          if (!this._promise.hasCanceled) {
            this.setState({systemFonts: res});
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

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
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