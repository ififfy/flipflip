import * as React from "react";

import {
  Collapse,
  FormControlLabel,
  Grid,
  Switch,
  Tooltip
} from "@mui/material";

import {DisplaySettings} from "../../data/Config";

export default class PlayerBoolCard extends React.Component {
  readonly props: {
    displaySettings: DisplaySettings,
    onUpdateDisplaySettings(fn: (settings: DisplaySettings) => void): void,
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
          <Tooltip disableInteractive title="If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting.">
            <FormControlLabel
              control={
                <Switch checked={this.props.displaySettings.startImmediately}
                        onChange={this.onBoolInput.bind(this, 'startImmediately')}/>
              }
              label="Start Immediately"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="If enabled, clicking the currently playing image will advance to the next image.">
            <FormControlLabel
              control={
                <Switch checked={this.props.displaySettings.clickToProgress}
                        onChange={this.onBoolInput.bind(this, 'clickToProgress')}/>
              }
              label="Click to Progress"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12} style={this.props.displaySettings.clickToProgress ? {paddingLeft: 40} : {padding: 0}}>
          <Collapse in={this.props.displaySettings.clickToProgress}>
            <Tooltip disableInteractive title="If enabled, clicking will advance even during Scene playback. If disabled, clicking will only advance while Scene playback is paused.">
              <FormControlLabel
                control={
                  <Switch checked={this.props.displaySettings.clickToProgressWhilePlaying}
                          onChange={this.onBoolInput.bind(this, 'clickToProgressWhilePlaying')}
                          size="small"/>
                }
                label="While Playing"/>
            </Tooltip>
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="If enabled, additional controls for controlling 'easing' will be available in the Effect section.">
            <FormControlLabel
              control={
                <Switch checked={this.props.displaySettings.easingControls}
                        onChange={this.onBoolInput.bind(this, 'easingControls')}/>
              }
              label="Show Adv Easing Controls"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="If enabled, track information will appear during playback whenever a new audio track starts.">
            <FormControlLabel
              control={
                <Switch checked={this.props.displaySettings.audioAlert}
                        onChange={this.onBoolInput.bind(this, 'audioAlert')}/>
              }
              label="Show Audio Info"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="If enabled, cloned/mirrored grid cells will use a copy of the actual video file, instead of a canvas. This may improve video framerate, but will remove absolute synchronization">
            <FormControlLabel
              control={
                <Switch checked={this.props.displaySettings.cloneGridVideoElements}
                        onChange={this.onBoolInput.bind(this, 'cloneGridVideoElements')}/>
              }
              label="Clone Grid Videos Directly"/>
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
    this.props.onUpdateDisplaySettings(fn);
  }

}

(PlayerBoolCard as any).displayName="PlayerBoolCard";