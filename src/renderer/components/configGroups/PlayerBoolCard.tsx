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
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="If enabled, additional controls for controlling 'easing' will be available in the Effect section.">
            <FormControlLabel
              control={
                <Switch checked={this.props.displaySettings.easingControls}
                        onChange={this.onBoolInput.bind(this, 'easingControls')}/>
              }
              label="Show Adv Easing Controls"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="If enabled, track information will appear during playback whenever a new audio track starts.">
            <FormControlLabel
              control={
                <Switch checked={this.props.displaySettings.audioAlert}
                        onChange={this.onBoolInput.bind(this, 'audioAlert')}/>
              }
              label="Show Audio Info"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Divider/>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="If disabled, no prompt will appear to confirm Scene deletion">
            <FormControlLabel
              control={
                <Switch checked={this.props.generalSettings.confirmSceneDeletion}
                        onChange={this.onGBoolInput.bind(this, 'confirmSceneDeletion')}/>
              }
              label="Confirm Scene Deletion"/>
          </Tooltip>
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
        {this.props.generalSettings.portableMode && (
          <Grid item xs={12}>
            <Tooltip title="If on, data will only be saved in the same directory as the FlipFlip executable, and not at the default save path.">
              <FormControlLabel
                control={
                  <Switch checked={this.props.generalSettings.disableLocalSave}
                          onChange={this.onGBoolInput.bind(this, 'disableLocalSave')}/>
                }
                label="Disable Local Saves"/>
            </Tooltip>
          </Grid>
        )}
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
    this.changeGKey('portableMode', checked);
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

  onGBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeGKey(key, checked);
  }

  changeGKey(key: string, value: any) {
    this.gUpdate((s) => s[key] = value);
  }

  gUpdate(fn: (settings: any) => void) {
    this.props.onUpdateGeneralSettings(fn);
  }
}

(PlayerBoolCard as any).displayName="PlayerBoolCard";