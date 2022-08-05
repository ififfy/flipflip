import * as React from 'react';
import {remote} from "electron";
import rimraf from "rimraf";
import path from "path";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RestoreIcon from "@mui/icons-material/Restore";

import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, InputLabel,
  Link, MenuItem, Select, Typography
} from "@mui/material";

import {convertFromEpoch, getBackups, saveDir, savePath} from "../renderer/data/utils";

export default class ErrorBoundary extends React.Component {
  readonly props: {
    children: React.ReactNode,
    version: string,
    goBack(): void,
    onRestore(backupFile: string): void,
  }

  readonly state = {
    hasError: false,
    error: null as Error,
    info: null as React.ErrorInfo,
    resetCheck: false,
    backupCheck: false,
    backup: (null as {url: string, size: number}),
    backups: Array<{url: string, size: number}>(),
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Display fallback UI
    this.setState({ hasError: true, error: error, info: info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box style={{overflow: "auto", padding: 8, position: "absolute", top: 0, left: 0, bottom: 0, right: 0}} className="Error">
          <Typography component={"h2"} variant={"h2"}>Mistakes were made ಥ﹏ಥ</Typography>
          <Divider/>
          <Typography style={{margin: 10}} component={"h5"} variant={"h5"} color={"error"}>{this.state.error.name}: {this.state.error.message}</Typography>
          <Typography style={{whiteSpace: "pre", marginBottom: 20}} component={"div"} variant={"body2"} color={"error"}>{this.state.info.componentStack.trim().replace(/\s*in (ForwardRef|div)/g, "")}</Typography>
          <Typography component={"h6"} variant={"h6"}>
            Please consider reporting this bug to our <Link href="#" onClick={this.onSubmitIssue.bind(this)} underline="hover">GitHub</Link>
          </Typography>
          <Button
            style={{margin: 10}}
            variant={"contained"}
            size={"large"}
            color={"primary"}
            onClick={this.goBack.bind(this)}
            startIcon={<ArrowBackIcon />}>Go Back</Button>
          <Button
            style={{margin: 10}}
            variant={"contained"}
            size={"large"}
            color={"secondary"}
            onClick={this.backupCheck.bind(this)}
            startIcon={<RestoreIcon />}>Restore Backup</Button>
          <Button
            style={{margin: 10}}
            variant={"contained"}
            size={"large"}
            onClick={this.resetCheck.bind(this)}
            startIcon={<HighlightOffIcon />}>Reset</Button>

          {this.state.resetCheck && (
            <Dialog open={this.state.resetCheck} onClose={this.onCloseDialog.bind(this)}>
              <DialogTitle>Confirm FlipFlip Reset</DialogTitle>
              <DialogContent>
                <DialogContentText>Are you sure you want to <u><b>completely reset FlipFlip</b></u>? This will delete your current data (backups/cache will <b>not</b> be effected).</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                  Cancel
                </Button>
                <Button onClick={this.reset.bind(this)} color="primary">
                  Reset FlipFlip
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {this.state.backupCheck && (
            <Dialog
              open={this.state.backupCheck}
              onClose={this.onCloseDialog.bind(this)}
              aria-labelledby="restore-title"
              aria-describedby="restore-description">
              <DialogTitle id="restore-title">Restore Backup</DialogTitle>
              {this.state.backups.length > 0 && (
                <React.Fragment>
                  <DialogContent>
                    <DialogContentText id="restore-description">
                      Choose a backup to restore from:
                    </DialogContentText>
                    {this.state.backup && (
                      <FormControl variant="standard">
                        <InputLabel>Backups</InputLabel>
                        <Select
                          variant="standard"
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
                </React.Fragment>
              )}
              {this.state.backups.length == 0 && (
                <React.Fragment>
                  <DialogContent>
                    <DialogContentText id="restore-description">
                      You don't have any backups available
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                      Cancel
                    </Button>
                  </DialogActions>
                </React.Fragment>
              )}
            </Dialog>
          )}
        </Box>
      );

    } else {
      return this.props.children;
    }
  }

  clearError() {
    this.setState({
      hasError: false,
      error: null,
      info: null,
      resetCheck: false,
      backupCheck: false,
      backup: null,
      backups: Array<{url: string, size: number}>(),
    });
  }

  goBack() {
    this.clearError();
    this.props.goBack();
  }

  reset() {
    rimraf.sync(savePath);
    remote.getCurrentWindow().reload();
  }

  resetCheck() {
    this.setState({resetCheck: true});
  }

  onCloseDialog() {
    this.setState({resetCheck: false, backupCheck: false});
  }

  backupCheck() {
    const backups = getBackups();
    if (backups.length == 0) {
      this.setState({backupCheck: true, backups: backups, backup: null});
    } else {
      this.setState({backupCheck: true, backups: backups, backup: backups[0]});
    }
  }

  onChangeBackup(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({backup: this.state.backups.find((b) => b.url == input.value)});
  }

  onFinishRestore() {
    this.onCloseDialog();
    try {
      this.props.onRestore(saveDir + path.sep + this.state.backup.url);
      this.clearError();
    } catch (e) {
      console.error(e);
    }
  }

  onSubmitIssue() {
    const componentStack = this.state.info.componentStack.trim().replace(/\s*in (ForwardRef|div)/g, "");
    let title = this.state.error.name + ": " + this.state.error.message;
    let body = "[[Please describe the bug and how to reproduce it]]%0D%0A%0D%0A%0D%0AFlipFlip Version: " +
      this.props.version + "%0D%0A```%0D%0A" +
      this.state.error.name + ": " + this.state.error.message + "%0D%0A" +
      componentStack.replace(/(\r\n|\r|\n)/g, "%0D%0A") + "%0D%0A```";
    const errorComponent = /^\s*in (\w*)/.exec(componentStack);
    if (errorComponent != null) {
      title = errorComponent[1] + " - " + title;
    }
    remote.shell.openExternal("https://github.com/ififfy/flipflip/issues/new?title=" + title + "&body=" + body);
  }
}

(ErrorBoundary as any).displayName="ErrorBoundary";