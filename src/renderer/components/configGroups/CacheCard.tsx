import * as React from "react";
import clsx from "clsx";
import rimraf from "rimraf";
import {remote} from "electron";
import {existsSync} from "fs";
import getFolderSize from "get-folder-size";

import {
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Switch,
  TextField,
  Theme,
  Tooltip,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import ClearIcon from '@mui/icons-material/Clear';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import Config, {CacheSettings} from "../../data/Config";
import {getCachePath, urlToPath} from "../../data/utils";

const styles = (theme: Theme) => createStyles({
  fullWidth: {
    width: '100%',
  },
  paddingLeft: {
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(1),
    },
  },
});

class CacheCard extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    onUpdateSettings(fn: (settings: CacheSettings) => void): void,
  };

  readonly state = {
    cacheSize: "--",
    clearCacheAlert: false,
  };

  render() {
    const classes = this.props.classes;
    const cachePath = getCachePath(null, this.props.config);
    return (
      <Grid container spacing={this.props.config.caching.enabled ? 2 : 0} alignItems="center">
        <Grid item xs={12}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Tooltip disableInteractive title="When enabled, FlipFlip will store downloaded images in a local directory to improve future performance and reduce the need re-download files.">
                <FormControlLabel
                  control={
                    <Switch checked={this.props.config.caching.enabled}
                            onChange={this.onBoolInput.bind(this, 'enabled')}/>
                  }
                  label="Caching"/>
              </Tooltip>
            </Grid>
            <Grid item>
              <Collapse in={this.props.config.caching.enabled} className={clsx(classes.fullWidth, classes.paddingLeft)}>
                <Tooltip disableInteractive title="Clear Cache">
                  <IconButton
                    edge="start"
                    color="inherit"
                    onClick={this.onClearCache.bind(this)}
                    size="large">
                    <DeleteSweepIcon color="error" />
                  </IconButton>
                </Tooltip>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.config.caching.enabled} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.config.caching.enabled} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <TextField
                  variant="standard"
                  fullWidth
                  label="Caching Directory"
                  placeholder={cachePath}
                  value={this.props.config.caching.directory}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    readOnly: true,
                  }}
                  onClick={this.onCacheDirChange.bind(this)} />
              </Grid>
              <Grid item>
                <Tooltip disableInteractive title="Reset Cache Directory">
                  <IconButton onClick={this.onResetCacheDir.bind(this)} size="large">
                    <ClearIcon color="error"/>
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Tooltip disableInteractive title="The maximum size of the caching directory. After the max is reached, new images won't be kept. Set this to 0 to ignore size.">
                  <TextField
                    variant="standard"
                    label="Max Cache Size"
                    margin="dense"
                    value={this.props.config.caching.maxSize}
                    onChange={this.onIntInput.bind(this, 'maxSize')}
                    onBlur={this.blurIntKey.bind(this, 'maxSize')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                    }}
                    inputProps={{
                      min: 0,
                      type: 'number',
                    }} />
                </Tooltip>
              </Grid>
              <Grid item>
                <Chip
                  label={`Current: ${this.state.cacheSize} MB`}
                  color="primary"
                  variant="outlined"/>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        <Dialog
          open={this.state.clearCacheAlert}
          onClose={this.onCloseClear.bind(this)}
          aria-describedby="clean-cache-description">
          <DialogContent>
            <DialogContentText id="clean-cache-description">
              Are you SURE you want to delete the contents of <Link
              href="#"
              onClick={this.openDirectory.bind(this, cachePath)}
              underline="hover">{cachePath}</Link> ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseClear.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishClearCache.bind(this)} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    );
  }

  componentDidMount() {
    this.calculateCacheSize();
  }

  calculateCacheSize() {
    if (this.props.config.caching.maxSize != 0) {
      const cachePath = getCachePath(null, this.props.config);
      if (existsSync(cachePath)) {
        getFolderSize(getCachePath(null, this.props.config), (err: string, size: number) => {
          if (err) { throw err; }
          const mbSize = (size / 1024 / 1024);
          this.setState({cacheSize: mbSize.toFixed(2)});
        });
      }
    }
  }

  onCloseClear() {
    this.setState({clearCacheAlert: false});
  }

  onClearCache() {
    this.setState({clearCacheAlert: true});
  }

  onFinishClearCache() {
    const cachePath = getCachePath(null, this.props.config);
    rimraf.sync(cachePath);
    this.setState({cacheSize: "--"});
    this.calculateCacheSize();
  }

  onResetCacheDir(e: MouseEvent) {
    e.preventDefault();
    this.changeKey('directory', "");
  }

  onCacheDirChange() {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']});
    if (!result || !result.length) return;
    this.changeKey('directory', result[0]);
  }

  blurIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.props.config.caching as any)[key] < min) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.config.caching as any)[key] > max) {
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

  openDirectory(cachePath: string) {
    if (process.platform === "win32") {
      this.openExternalURL(cachePath);
    } else {
      this.openExternalURL(urlToPath(cachePath));
    }
  }

  openExternalURL(url: string) {
    remote.shell.openExternal(url);
  }
}

(CacheCard as any).displayName="CacheCard";
export default withStyles(styles)(CacheCard as any);