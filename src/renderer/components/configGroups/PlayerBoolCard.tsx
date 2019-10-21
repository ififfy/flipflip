import * as React from "react";

import {createStyles, FormControlLabel, Grid, Switch, Theme, Tooltip, withStyles} from "@material-ui/core";

import {DisplaySettings} from "../../data/Config";

const styles = (theme: Theme) => createStyles({});

class PlayerBoolCard extends React.Component {
  readonly props: {
    classes: any,
    settings: DisplaySettings,
    onUpdateSettings(fn: (settings: DisplaySettings) => void): void,
  };

  render() {
    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={this.props.settings.alwaysOnTop}
                      onChange={this.onBoolInput.bind(this, 'alwaysOnTop')}/>
            }
            label="Always On Top"/>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={this.props.settings.showMenu}
                      onChange={this.onBoolInput.bind(this, 'showMenu')}/>
            }
            label="Show Menu"/>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={this.props.settings.fullScreen}
                      onChange={this.onBoolInput.bind(this, 'fullScreen')}/>
            }
            label="Fullscreen"/>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting.">
            <FormControlLabel
              control={
                <Switch checked={this.props.settings.startImmediately}
                        onChange={this.onBoolInput.bind(this, 'startImmediately')}/>
              }
              label="Start Immediately"/>
          </Tooltip>
        </Grid>
      </Grid>
    );
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
    this.props.onUpdateSettings(fn);
  }
}

export default withStyles(styles)(PlayerBoolCard as any);