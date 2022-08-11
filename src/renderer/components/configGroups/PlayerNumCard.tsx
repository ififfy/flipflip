import * as React from "react";

import {Grid, InputAdornment, TextField, Theme, Tooltip, Typography} from "@mui/material";

import {DisplaySettings} from "../../data/Config";
import LibrarySearch from "../library/LibrarySearch";
import LibrarySource from "../../data/LibrarySource";
import Tag from "../../data/Tag";
import {withStyles} from "@mui/styles";
import createStyles from "@mui/styles/createStyles";

const styles = (theme: Theme) => createStyles({
  grey: {
    color: theme.palette.text.secondary,
  }
});

class PlayerNumCard extends React.Component {
  readonly props: {
    classes: any,
    library: Array<LibrarySource>,
    tags: Array<Tag>,
    settings: DisplaySettings,
    onUpdateSettings(fn: (settings: DisplaySettings) => void): void,
  };

  render() {
    const classes = this.props.classes;
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Tooltip disableInteractive title="Images under this size (width or height) will be skipped">
            <TextField
              variant="standard"
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
              }} />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="Videos under this size (width or height) will be skipped">
            <TextField
              variant="standard"
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
              }} />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="The maximum number of images/videos to keep in player history. Reduce this number to reduce memory usage and improve performance.">
            <TextField
              variant="standard"
              label="Max in History"
              margin="dense"
              value={this.props.settings.maxInHistory}
              onChange={this.onIntInput.bind(this, 'maxInHistory')}
              onBlur={this.blurIntKey.bind(this, 'maxInHistory')}
              inputProps={{
                min: 0,
                type: 'number',
              }} />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="The maximum number of images/videos to queue up for rendering. Reduce this number to reduce memory usage and improve performance.">
            <TextField
              variant="standard"
              label="Max in Memory"
              margin="dense"
              value={this.props.settings.maxInMemory}
              onChange={this.onIntInput.bind(this, 'maxInMemory')}
              onBlur={this.blurIntKey.bind(this, 'maxInMemory')}
              inputProps={{
                min: 0,
                type: 'number',
              }} />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive title="The maximum number of simultaneous images/videos loading. Increase this number to load sources faster. Reduce this number to improve display performance.">
            <TextField
              variant="standard"
              label="Max Loading at Once"
              margin="dense"
              value={this.props.settings.maxLoadingAtOnce}
              onChange={this.onIntInput.bind(this, 'maxLoadingAtOnce')}
              onBlur={this.blurIntKey.bind(this, 'maxLoadingAtOnce')}
              inputProps={{
                min: 0,
                type: 'number',
              }} />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip disableInteractive placement={"top"} title="The following tags/types will be ignored when using a Scene Generator. This setting overrides any generator rules.">
            <div>
              <Typography variant="caption" className={classes.grey}>Ignored Tags/Types</Typography>
              <LibrarySearch
                displaySources={this.props.library}
                filters={this.props.settings.ignoredTags}
                tags={this.props.tags}
                isClearable
                onlyTagsAndTypes
                showCheckboxes
                withBrackets
                hideSelectedOptions={false}
                onUpdateFilters={this.onSelectTags.bind(this)}/>
            </div>
          </Tooltip>
        </Grid>
      </Grid>
    );
  }

  onSelectTags(selectedTags: Array<string>) {
    this.changeKey('ignoredTags', selectedTags);
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

(PlayerNumCard as any).displayName="PlayerNumCard";
export default withStyles(styles)(PlayerNumCard as any);