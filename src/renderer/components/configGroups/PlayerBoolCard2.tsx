import * as React from "react";
import {existsSync} from 'fs';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  Grid,
  Switch,
  Tooltip
} from "@mui/material";

import {GeneralSettings} from "../../data/Config";
import {portablePath} from "../../data/utils";

export default class PlayerBoolCard2 extends React.Component {
  readonly props: {
    generalSettings: GeneralSettings,
    onPortableOverride(): void,
    onUpdateGeneralSettings(fn: (settings: GeneralSettings) => void): void,
  };

  readonly state = {
    portableDialog: false,
  };

  render() {
    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Tooltip disableInteractive title={<div>Prioritizing performance will smooth image effects, but may dramatically increase load times.<br/>Prioritizing loading will decrease load times, but may result in jittery effects during playback</div>}>
            <FormControlLabel
              control={
                <Switch checked={this.props.generalSettings.prioritizePerformance}
                        onChange={this.onBoolInput.bind(this, 'prioritizePerformance')}/>
              }
              label={this.props.generalSettings.prioritizePerformance ? "Prioritize Performance" : "Prioritize Loading"}/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="If disabled, no prompt will appear to confirm Scene deletion">
            <FormControlLabel
              control={
                <Switch checked={this.props.generalSettings.confirmSceneDeletion}
                        onChange={this.onBoolInput.bind(this, 'confirmSceneDeletion')}/>
              }
              label="Confirm Scene Deletion"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="If disabled, no prompt will appear to confirm blacklisting a file">
            <FormControlLabel
              control={
                <Switch checked={this.props.generalSettings.confirmBlacklist}
                        onChange={this.onBoolInput.bind(this, 'confirmBlacklist')}/>
              }
              label="Confirm Blacklist"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="If disabled, no prompt will appear to confirm File deletion">
            <FormControlLabel
              control={
                <Switch checked={this.props.generalSettings.confirmFileDeletion}
                        onChange={this.onBoolInput.bind(this, 'confirmFileDeletion')}/>
              }
              label="Confirm File Deletion"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="Portable Mode will save a copy of your data in the same directory as the FlipFlip executable, as well as the default save path. This needs to be enabled on each machine.">
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
            <Tooltip disableInteractive title="If on, data will only be saved in the same directory as the FlipFlip executable, and not at the default save path.">
              <FormControlLabel
                control={
                  <Switch checked={this.props.generalSettings.disableLocalSave}
                          onChange={this.onBoolInput.bind(this, 'disableLocalSave')}/>
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
    this.changeKey('portableMode', checked);
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
    this.props.onUpdateGeneralSettings(fn);
  }
}

(PlayerBoolCard2 as any).displayName="PlayerBoolCard2";