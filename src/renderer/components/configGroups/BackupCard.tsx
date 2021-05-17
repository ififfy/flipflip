import * as React from "react";
import path from "path";
import clsx from "clsx";

import {
  Button, Chip, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl,
  FormControlLabel, Grid, InputAdornment, InputLabel, MenuItem, Select, Slide, Snackbar, SnackbarContent, Switch,
  TextField, Theme, Tooltip, withStyles
} from "@material-ui/core";

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import ErrorIcon from '@material-ui/icons/Error';
import RestoreIcon from '@material-ui/icons/Restore';
import SaveIcon from '@material-ui/icons/Save';

import {convertFromEpoch, getBackups, saveDir} from "../../data/utils";
import {MO} from "../../data/const";
import {GeneralSettings} from "../../data/Config";

const styles = (theme: Theme) => createStyles({
  buttonGrid: {
    textAlign: 'center',
  },
  chipGrid: {
    paddingTop: theme.spacing(1),
  },
  hideXS: {
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    },
  },
  showXS: {
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    },
  },
  snackbarIcon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  snackbarMessage: {
    display: 'flex',
    alignItems: 'center',
  },
  backupDays: {
    width: theme.spacing(16),
  }
});

class BackupCard extends React.Component {
  readonly props: {
    classes: any,
    settings: GeneralSettings,
    onBackup(): void,
    onClean(): void,
    onRestore(backupFile: string): void,
    onUpdateSettings(fn: (settings: GeneralSettings) => void): void,
  };

  readonly state = {
    backups: Array<{url: string, size: number}>(),
    backup: (null as {url: string, size: number}),
    openMenu: null as string,
    restoreSnack: false,
    backupSnack: false,
    cleanSnack: false,
    errorSnack: null as any,
  };

  render() {
    const classes = this.props.classes;
    const hasBackup = this.state.backups.length > 0;
    return(
      <React.Fragment>
        <Grid container spacing={2} alignItems="center" justify="center" className={classes.chipGrid}>
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <FormControlLabel
              control={
                <Switch checked={this.props.settings.autoBackup}
                        onChange={this.onBoolInput.bind(this, 'autoBackup')}/>
              }
              label="Auto Backup"/>
          </Grid>
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <TextField
              className={classes.backupDays}
              disabled={!this.props.settings.autoBackup}
              variant="outlined"
              label="Every"
              margin="dense"
              value={this.props.settings.autoBackupDays}
              onChange={this.onIntInput.bind(this, 'autoBackupDays')}
              onBlur={this.blurIntKey.bind(this, 'autoBackupDays')}
              InputProps={{
                endAdornment: <InputAdornment position="end">Days</InputAdornment>,
              }}
              inputProps={{
                min: 1,
                type: 'number',
              }}/>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" justify="center" className={classes.chipGrid}>
          <Tooltip title="If enabled, backups will be automatically cleaned up. This algorithm will keep 1 backup for
           each of the configured periods.">
            <Grid item xs={"auto"} className={classes.buttonGrid}>
              <FormControlLabel
                control={
                  <Switch checked={this.props.settings.autoCleanBackup}
                          onChange={this.onBoolInput.bind(this, 'autoCleanBackup')}/>
                }
                label="Auto Clean"/>
            </Grid>
          </Tooltip>
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <TextField
              className={classes.backupDays}
              disabled={!this.props.settings.autoCleanBackup}
              variant="outlined"
              label="Keep Last"
              margin="dense"
              value={this.props.settings.autoCleanBackupDays}
              onChange={this.onIntInput.bind(this, 'autoCleanBackupDays')}
              onBlur={this.blurIntKey.bind(this, 'autoCleanBackupDays')}
              InputProps={{
                endAdornment: <InputAdornment position="end">Days</InputAdornment>,
              }}
              inputProps={{
                min: 1,
                type: 'number',
              }}/>
          </Grid>
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <TextField
              className={classes.backupDays}
              disabled={!this.props.settings.autoCleanBackup}
              variant="outlined"
              label="Keep Last"
              margin="dense"
              value={this.props.settings.autoCleanBackupWeeks}
              onChange={this.onIntInput.bind(this, 'autoCleanBackupWeeks')}
              onBlur={this.blurIntKey.bind(this, 'autoCleanBackupWeeks')}
              InputProps={{
                endAdornment: <InputAdornment position="end">Weeks</InputAdornment>,
              }}
              inputProps={{
                min: 1,
                type: 'number',
              }}/>
          </Grid>
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <TextField
              className={classes.backupDays}
              disabled={!this.props.settings.autoCleanBackup}
              variant="outlined"
              label="Keep Last"
              margin="dense"
              value={this.props.settings.autoCleanBackupMonths}
              onChange={this.onIntInput.bind(this, 'autoCleanBackupMonths')}
              onBlur={this.blurIntKey.bind(this, 'autoCleanBackupMonths')}
              InputProps={{
                endAdornment: <InputAdornment position="end">Months</InputAdornment>,
              }}
              inputProps={{
                min: 1,
                type: 'number',
              }}/>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" justify="center">
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={this.onBackup.bind(this)}
              startIcon={<SaveIcon />}
            >
              Backup Data
            </Button>
          </Grid>
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              disabled={!hasBackup}
              onClick={this.onRestore.bind(this)}
              startIcon={<RestoreIcon />}
            >
              Restore Backup
            </Button>
          </Grid>
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="inherit"
              size="large"
              disabled={this.state.backups.length <= 1}
              onClick={this.onClean.bind(this)}
              startIcon={<DeleteIcon />}
            >
              Clean Backups
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" justify="center" className={classes.chipGrid}>
          <Grid item xs={"auto"} className={classes.buttonGrid}>
            <Chip
              label={`Backups: ${hasBackup ? this.state.backups.length : "--"}`}
              color="primary"
              variant="outlined"/>
          </Grid>
          <Grid item xs={"auto"} className={clsx(classes.buttonGrid, classes.hideXS)}>
            <Chip
              label={`Latest: ${hasBackup ? convertFromEpoch(this.state.backups[0].url) + " (" + Math.round(this.state.backups[0].size / 1000) + " KB)" : "--"}`}
              color="secondary"
              variant="outlined"/>
          </Grid>
          <Grid item xs={"auto"} className={clsx(classes.buttonGrid, classes.showXS)}>
            <Chip
              label={`Latest: ${hasBackup ? convertFromEpoch(this.state.backups[0].url) : "--"}`}
              color="secondary"
              variant="outlined"/>
          </Grid>
        </Grid>
        <Dialog
          open={this.state.openMenu == MO.deleteAlert}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="remove-all-title"
          aria-describedby="remove-all-description">
          <DialogTitle id="remove-all-title">Clean backups</DialogTitle>
          <DialogContent>
            {this.props.settings.autoCleanBackup && (
              <DialogContentText id="remove-all-description">
                You are about to clean your backups. Backups will be retained according to your Auto Clean
                configuration. A record will be kept for each of the
                last: {this.props.settings.autoCleanBackupDays} Days, {this.props.settings.autoCleanBackupWeeks} Weeks, {this.props.settings.autoCleanBackupMonths} Months.
              </DialogContentText>
            )}
            {!this.props.settings.autoCleanBackup && (
              <React.Fragment>
                <DialogContentText id="remove-all-description">
                  You are about to clean your backups. How many of the most recent backups would you like to retain?
                </DialogContentText>
                {this.props.settings.cleanRetain != null && (
                  <TextField
                    variant="outlined"
                    label="Keep Last"
                    margin="dense"
                    value={this.props.settings.cleanRetain}
                    onChange={this.onIntInput.bind(this, 'cleanRetain')}
                    onBlur={this.blurIntKey.bind(this, 'cleanRetain')}
                    inputProps={{
                      min: 1,
                      type: 'number',
                    }}/>
                )}
              </React.Fragment>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishClean.bind(this)} color="primary">
              Continue
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openMenu == MO.restore}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="restore-title"
          aria-describedby="restore-description">
          <DialogTitle id="restore-title">Restore Backup</DialogTitle>
          <DialogContent>
            <DialogContentText id="restore-description">
              Choose a backup to restore from:
            </DialogContentText>
            {this.state.backup && (
              <FormControl>
                <InputLabel>Backups</InputLabel>
                <Select
                  value={this.state.backup.url}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                  onChange={this.onChangeBackup.bind(this)}>
                  {this.state.backups.map((b) =>
                    <MenuItem value={b.url} key={b.url}>{convertFromEpoch(b.url)} ({Math.round(b.size / 1000)} KB)</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishRestore.bind(this)} color="primary">
              Restore
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={this.state.restoreSnack}
          autoHideDuration={5000}
          onClose={this.onCloseRestoreSnack.bind(this)}
          TransitionComponent={(props) => <Slide {...props} direction="up"/>}>
          <SnackbarContent
            message={
              <span className={classes.snackbarMessage}>
                  <CheckCircleIcon color="secondary" className={classes.snackbarIcon}/>
                  Restore succes!
              </span>
            }
          />
        </Snackbar>
        <Snackbar
          open={this.state.backupSnack}
          autoHideDuration={5000}
          onClose={this.onCloseBackupSnack.bind(this)}
          TransitionComponent={(props) => <Slide {...props} direction="up"/>}>
          <SnackbarContent
            message={
              <span className={classes.snackbarMessage}>
                  <CheckCircleIcon color="primary" className={classes.snackbarIcon}/>
                  Backup succes!
              </span>
            }
          />
        </Snackbar>
        <Snackbar
          open={this.state.cleanSnack}
          autoHideDuration={5000}
          onClose={this.onCloseCleanSnack.bind(this)}
          TransitionComponent={(props) => <Slide {...props} direction="up"/>}>
          <SnackbarContent
            message={
              <span className={classes.snackbarMessage}>
                  <CheckCircleIcon color="inherit" className={classes.snackbarIcon}/>
                  Clean succes!
              </span>
            }
          />
        </Snackbar>
        <Snackbar
          open={!!this.state.errorSnack}
          autoHideDuration={10000}
          onClose={this.onCloseErrorSnack.bind(this)}
          TransitionComponent={(props) => <Slide {...props} direction="up"/>}>
          <SnackbarContent
            message={
              <span className={classes.snackbarMessage}>
                  <ErrorIcon color="error" className={classes.snackbarIcon}/>
                  Error: {this.state.errorSnack ? this.state.errorSnack.message : ""}
              </span>
            }
          />
        </Snackbar>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.refreshBackups();
  }

  refreshBackups() {
    this.setState({backups: getBackups()});
  }

  onChangeBackup(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({backup: this.state.backups.find((b) => b.url == input.value)});
  }

  onBackup() {
    try {
      this.props.onBackup();
      this.setState({backupSnack: true});
    } catch (e) {
      this.setState({errorSnack: e});
    }
    this.refreshBackups();
  }

  onClean() {
    this.setState({backup: this.state.backups[0], openMenu: MO.deleteAlert});
  }

  onFinishClean() {
    this.onCloseDialog();
    try {
      this.props.onClean();
      this.setState({cleanSnack: true});
    } catch (e) {
      this.setState({errorSnack: e});
    }
    this.refreshBackups();
  }

  onRestore() {
    this.setState({backup: this.state.backups[0], openMenu: MO.restore});
  }

  onFinishRestore() {
    this.onCloseDialog();
    try {
      this.props.onRestore(saveDir + path.sep + this.state.backup.url);
      this.setState({restoreSnack: true});
    } catch (e) {
      this.setState({errorSnack: e});
    }
  }

  onCloseRestoreSnack() {
    this.setState({restoreSnack: false});
  }

  onCloseBackupSnack() {
    this.setState({backupSnack: false});
  }

  onCloseCleanSnack() {
    this.setState({cleanSnack: false});
  }

  onCloseErrorSnack() {
    this.setState({errorSnack: null});
  }

  onCloseDialog() {
    this.setState({openMenu: null});
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

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateSettings(fn);
  }
}

(BackupCard as any).displayName="BackupCard";
export default withStyles(styles)(BackupCard as any);