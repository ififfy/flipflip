import * as React from "react";
import {existsSync} from 'fs';

import {
  Button, Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Tooltip
} from "@material-ui/core";

import {DisplaySettings, GeneralSettings} from "../../data/Config";
import {portablePath} from "../../data/utils";

export default class PlayerBoolCard extends React.Component {
  readonly props: {
    displaySettings: DisplaySettings,
    generalSettings: GeneralSettings,
    onPortableOverride(): void,
    onUpdateDisplaySettings(fn: (settings: DisplaySettings) => void): void,
    onUpdateGeneralSettings(fn: (settings: GeneralSettings) => void): void,
  };

  readonly state = {
    portableDialog: false,
  };

  render() {
    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={this.props.displaySettings.alwaysOnTop}
                      onChange={this.onBoolInput.bind(this, 'alwaysOnTop')}/>
            }
            label="Always On Top"/>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={this.props.displaySettings.showMenu}
                      onChange={this.onBoolInput.bind(this, 'showMenu')}/>
            }
            label="Show Menu"/>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={this.props.displaySettings.fullScreen}
                      onChange={this.onBoolInput.bind(this, 'fullScreen')}/>
            }
            label="Fullscreen"/>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting.">
            <FormControlLabel
              control={
                <Switch checked={this.props.displaySettings.startImmediately}
                        onChange={this.onBoolInput.bind(this, 'startImmediately')}/>
              }
              label="Start Immediately"/>
          </Tooltip>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="Portable Mode will save a copy of your data in the same directory as the FlipFlip executable, as well as the default save path. This needs to be enabled on each machine.">
            <FormControlLabel
              control={
                <Switch checked={this.props.generalSettings.portableMode}
                        onChange={this.onTogglePortable.bind(this)}/>
              }
              label="Portable Mode"/>
          </Tooltip>
        </Grid>
        <Dialog
          open={this.state.portableDialog}
          onClose={this.onToggleDialog.bind(this)}
          aria-describedby="portable-description">
          <DialogContent>
            <DialogContentText id="portable-description">
              Do you want to use the local data on this machine or existing portable data?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onToggleDialog.bind(this)} color="secondary">
              Local data
            </Button>
            <Button onClick={this.onChoosePortable.bind(this)} color="primary">
              Portable data
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    );
  }

  onTogglePortable(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    if (checked && existsSync(portablePath)) {
      // Ask whether to keep local or keep portable
      this.onToggleDialog();
    }
    this.props.onUpdateGeneralSettings((s) => s.portableMode = checked);
  }

  onToggleDialog() {
    this.setState({portableDialog: !this.state.portableDialog});
  }

  onChoosePortable() {
    this.props.onPortableOverride();
    this.onToggleDialog();
  }

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (settings: any) => void) {
    this.props.onUpdateDisplaySettings(fn);
  }
}