import * as React from "react";
import {remote} from "electron";

import {
  Button, Collapse, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl,
  InputLabel, MenuItem, Select, TextField, Theme, withStyles
} from "@material-ui/core";

import {GT} from "../../data/const";

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  rootInput: {
    marginLeft: theme.spacing(2),
    flexGrow: 1,
  },
});

class URLDialog extends React.Component {
  readonly props: {
    classes: any,
    open: boolean,
    onClose(): void,
    onImportURL(type: string, e: MouseEvent, ...args: any[]): void,
  };

  readonly state = {
    importType: GT.tumblr,
    importURL: "",
    rootDir: "",
  };

  render() {
    const classes = this.props.classes;
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose.bind(this)}
        aria-labelledby="url-import-title"
        aria-describedby="url-import-description">
        <DialogTitle id="url-import-title">Import URL</DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-all-description">
            Paste a gooninator URL and choose how to import the sources:
          </DialogContentText>
          <TextField
            label="Gooninator URL"
            fullWidth
            placeholder="Paste URL Here"
            margin="dense"
            value={this.state.importURL}
            onChange={this.onURLChange.bind(this)}/>
          <div className={classes.root}>
            <FormControl>
              <InputLabel>Import as</InputLabel>
              <Select
                value={this.state.importType}
                onChange={this.onTypeChange.bind(this)}>
                <MenuItem value={GT.tumblr}>Tumblr Blogs</MenuItem>
                <MenuItem value={GT.local}>Local Directories</MenuItem>
              </Select>
            </FormControl>
            <Collapse className={classes.rootInput} in={this.state.importType == GT.local}>
              <TextField
                fullWidth
                label="Parent Directory"
                value={this.state.rootDir}
                InputProps={{readOnly: true}}
                onClick={this.onRootChange.bind(this)}/>
            </Collapse>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose.bind(this)} color="secondary">
            Cancel
          </Button>
          <Button
            disabled={!this.state.importURL.match("^https?://") || (this.state.importType == GT.local && this.state.rootDir.length == 0)}
            onClick={this.onImportURL.bind(this)}
            color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  onTypeChange(e: MouseEvent) {
    const type = (e.target as HTMLInputElement).value;
    this.setState({importType: type});
  }

  onURLChange(e: MouseEvent) {
    const type = (e.target as HTMLInputElement).value;
    this.setState({importURL: type});
  }

  onRootChange() {
    let result = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {properties: ['openDirectory']});
    if (!result || !result.length) return;
    this.setState({rootDir: result[0]});
  }

  onImportURL() {
    this.props.onImportURL(this.state.importType, null, this.state.importURL, this.state.rootDir);
    this.props.onClose();
  }
}

export default withStyles(styles)(URLDialog as any);