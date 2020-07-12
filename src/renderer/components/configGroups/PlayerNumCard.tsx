import * as React from "react";

import {Grid, InputAdornment, TextField, Tooltip} from "@material-ui/core";

import {DisplaySettings} from "../../data/Config";

export default class PlayerNumCard extends React.Component {
  readonly props: {
    settings: DisplaySettings,
    onUpdateSettings(fn: (settings: DisplaySettings) => void): void,
  };

  render() {
    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Tooltip title="Images under this size (width or height) will be skipped">
            <TextField
              label="Min Image Size"
              margin="dense"
              value={this.props.settings.minImageSize}
              onChange={this.onIntInput.bind(this, 'minImageSize')}
              onBlur={this.blurIntKey.bind(this, 'minImageSize')}
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                type: 'number',
              }}/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="Videos under this size (width or height) will be skipped">
            <TextField
              label="Min Video Size"
              margin="dense"
              value={this.props.settings.minVideoSize}
              onChange={this.onIntInput.bind(this, 'minVideoSize')}
              onBlur={this.blurIntKey.bind(this, 'minVideoSize')}
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                type: 'number',
              }}/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="The maximum number of images/videos to queue up for rendering. Reduce this number to reduce memory usage and improve performance.">
            <TextField
              label="Max in Memory"
              margin="dense"
              value={this.props.settings.maxInMemory}
              onChange={this.onIntInput.bind(this, 'maxInMemory')}
              onBlur={this.blurIntKey.bind(this, 'maxInMemory')}
              inputProps={{
                min: 0,
                type: 'number',
              }}/>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="The maximum number of simulatenous images/videos loading. Increase this number to load sources faster. Reduce this number to improve display performance.">
            <TextField
              label="Max Loading at Once"
              margin="dense"
              value={this.props.settings.maxLoadingAtOnce}
              onChange={this.onIntInput.bind(this, 'maxLoadingAtOnce')}
              onBlur={this.blurIntKey.bind(this, 'maxLoadingAtOnce')}
              inputProps={{
                min: 0,
                type: 'number',
              }}/>
          </Tooltip>
        </Grid>
      </Grid>
    );
  }

  blurIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.props.settings as any)[key] < min) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.settings as any)[key] > max) {
      this.changeIntKey(key, max);
    }
  }

  onIntInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value === '' ? '' : Number(input.value));
  }

  changeIntKey(key:string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (settings: any) => void) {
    this.props.onUpdateSettings(fn);
  }
}