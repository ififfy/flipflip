import * as React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Theme,
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import { AF } from "../../../common/const";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    rootInput: {
      marginLeft: theme.spacing(2),
      flexGrow: 1,
    },
    urlInput: {
      minWidth: 550,
      minHeight: 300,
      whiteSpace: "nowrap",
      overflowX: "hidden",
      overflowY: "auto !important" as any,
    },
  });

interface URLDialogProps {
  classes: any;
  open: boolean;
  onClose(): void;
  onImportURL(type: string, e: MouseEvent, ...args: any[]): void;
}

class URLDialog extends React.Component<URLDialogProps> {
  readonly props: URLDialogProps;

  readonly state: {
    importURLs: string;
  };

  constructor(props: URLDialogProps) {
    super(props);

    this.state = {
      importURLs: "",
    };
  }

  render() {
    const classes = this.props.classes;
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose.bind(this)}
        aria-labelledby="url-import-title"
        aria-describedby="url-import-description"
      >
        <DialogTitle id="url-import-title">
          Add Multiple URL Sources
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-all-description">
            Paste URLs to add as sources, one per line:
          </DialogContentText>
          <TextField
            variant="standard"
            label="Source URLs"
            fullWidth
            multiline
            margin="dense"
            value={this.state.importURLs}
            inputProps={{ className: classes.urlInput }}
            onChange={this.onURLChange.bind(this)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose.bind(this)} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.onImportURL.bind(this)} color="primary">
            Add Sources
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  onURLChange(e: MouseEvent) {
    const type = (e.target as HTMLInputElement).value;
    this.setState({ importURLs: type });
  }

  onImportURL() {
    this.props.onImportURL(AF.list, null, this.state.importURLs);
    this.setState({ importURLs: "" });
    this.props.onClose();
  }
}

(URLDialog as any).displayName = "URLDialog";
export default withStyles(styles)(URLDialog as any);
