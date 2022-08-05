import * as React from "react";
import fontList from "font-list";
import SystemFonts from "system-font-families";

import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  Slider,
  Switch,
  Theme,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import {green, red} from "@mui/material/colors";

import {CancelablePromise} from "../../data/utils";
import CaptionScript, {FontSettingsI} from "../../data/CaptionScript";
import FontOptions from "./FontOptions";

const styles = (theme: Theme) => createStyles({
  bpmProgress: {
    position: 'absolute',
    right: 67,
  },
  tagProgress: {
    position: 'absolute',
    right: 20,
  },
  success: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  failure: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  actions: {
    marginRight: theme.spacing(3),
  },
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
  percentInput: {
    minWidth: theme.spacing(11),
  },
  toggleFont: {
    marginLeft: 'auto',
  },
  fontDivider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  fontProgress: {
    position: 'absolute',
  },
});

class ScriptOptions extends React.Component {
  readonly props: {
    classes: any,
    script: CaptionScript,
    onCancel(): void,
    onFinishEdit(common: CaptionScript): void,
  };

  readonly state = {
    script: this.props.script,
    loadingFonts: true,
    systemFonts: Array<string>(),
  }

  render() {
    const classes = this.props.classes;

    return(
      <Dialog
        open={true}
        onClose={this.props.onCancel.bind(this)}
        aria-describedby="edit-description">
        <DialogContent>
          <Typography variant="h6">Edit script options</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Collapse in={!this.state.script.nextSceneAtEnd}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={this.state.script.stopAtEnd}
                          onChange={this.onSourceBoolInput.bind(this, 'stopAtEnd')}/>
                      }
                      label="Stop at End"/>
                  </Collapse>
                  <Collapse in={!this.state.script.stopAtEnd}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={this.state.script.nextSceneAtEnd}
                          onChange={this.onSourceBoolInput.bind(this, 'nextSceneAtEnd')}/>
                      }
                      label="Next Scene at End"/>
                  </Collapse>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={this.state.script.syncWithAudio}
                        onChange={this.onSourceBoolInput.bind(this, 'syncWithAudio')}/>
                    }
                    label="Sync Timestamp with Audio"/>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" component="div" color="textSecondary">
                Script Opacity: {this.state.script.opacity}%
              </Typography>
              <Slider
                  min={0}
                  max={100}
                  defaultValue={this.state.script.opacity}
                  onChangeCommitted={this.onSliderChange.bind(this, 'opacity')}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v + "%"}
                  aria-labelledby="opacity-slider"/>
            </Grid>
            <Grid item xs={12}>
              <FontOptions
                name={"Blink"}
                options={this.state.script.blink}
                systemFonts={this.state.systemFonts}
                onUpdateOptions={this.onUpdateOptions.bind(this, 'blink')}
                />
              <Divider className={classes.fontDivider}/>
              <FontOptions
                name={"Caption"}
                options={this.state.script.caption}
                systemFonts={this.state.systemFonts}
                onUpdateOptions={this.onUpdateOptions.bind(this, 'caption')}
              />
              <Divider className={classes.fontDivider}/>
              <FontOptions
                name={"Big Caption"}
                options={this.state.script.captionBig}
                systemFonts={this.state.systemFonts}
                onUpdateOptions={this.onUpdateOptions.bind(this, 'captionBig')}
              />
              <Divider className={classes.fontDivider}/>
              <FontOptions
                name={"Count"}
                options={this.state.script.count}
                systemFonts={this.state.systemFonts}
                onUpdateOptions={this.onUpdateOptions.bind(this, 'count')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={this.props.onCancel.bind(this)} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.props.onFinishEdit.bind(this, this.state.script)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  _promise: CancelablePromise = null;
  componentDidMount() {
    // Define system fonts
    if (process.platform == "darwin") {
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
    } else {
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
  }

  componentWillUnmount() {
    if (this._promise != null) {
      this._promise.cancel();
    }
  }

  onUpdateOptions(property: string, fn: (options: FontSettingsI) => void) {
    const script = new CaptionScript(this.state.script);
    const newOptions = JSON.parse(JSON.stringify((script as any)[property]));
    fn(newOptions);
    (script as any)[property] = newOptions;
    this.setState({script: script});
  }

  onSourceBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    switch (key) {
      case 'stopAtEnd':
        if (input.checked) {
          const script = new CaptionScript(this.state.script);
          script.stopAtEnd = true;
          script.nextSceneAtEnd = false;
          this.setState({script: script});
        } else {
          this.changeKey(key, false);
        }
        break;
      case 'nextSceneAtEnd':
        if (input.checked) {
          const script = new CaptionScript(this.state.script);
          script.nextSceneAtEnd = true;
          script.stopAtEnd = false;
          this.setState({script: script});
        } else {
          this.changeKey(key, false);
        }
        break;
      default:
        this.changeKey(key, input.checked);
    }
  }

  onSliderChange(key: string, e: MouseEvent, value: number) {
    this.changeKey(key, value);
  }

  changeKey(key: string, value: any) {
    const script = new CaptionScript(this.state.script);
    (script as any)[key] = value;
    this.setState({script: script});
  }
}

(ScriptOptions as any).displayName="ScriptOptions";
export default withStyles(styles)(ScriptOptions as any);