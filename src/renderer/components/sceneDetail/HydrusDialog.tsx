import * as React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Theme,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import { AF } from "../../../common/const";
import LibrarySearch from "../library/LibrarySearch";

const styles = (theme: Theme) =>
  createStyles({
    noScroll: {
      overflow: "visible",
    },
  });

interface HydrusDialogProps {
  config: any;
  tags: any;
  classes: any;
  open: boolean;
  onClose(): void;
  onImportURL(type: string, e: MouseEvent, ...args: any[]): void;
}

class HydrusDialog extends React.Component<HydrusDialogProps> {
  readonly props: HydrusDialogProps;

  readonly state: {
    selectedTags: string[];
  };

  constructor(props: HydrusDialogProps) {
    super(props);

    this.state = {
      selectedTags: [],
    };
  }

  render() {
    const classes = this.props.classes;
    return (
      <Dialog
        classes={{ paper: classes.noScroll }}
        open={this.props.open}
        onClose={this.props.onClose.bind(this)}
        fullWidth={true}
        aria-labelledby="url-import-title"
        aria-describedby="url-import-description"
      >
        <DialogTitle id="url-import-title">
          Create a New Hydrus Source
        </DialogTitle>
        <DialogContent className={classes.noScroll}>
          <DialogContentText id="batch-tag-description">
            Choose or create tags to add to Hydrus URL
          </DialogContentText>
          <LibrarySearch
            displaySources={[]}
            filters={this.state.selectedTags}
            tags={this.props.tags}
            placeholder={"Add Tags"}
            isClearable
            isCreatable
            onlyTags
            showCheckboxes
            hideSelectedOptions={false}
            onUpdateFilters={this.onSelectTags.bind(this)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose.bind(this)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={this.createAPICall.bind(this)}
            disabled={
              this.state.selectedTags && this.state.selectedTags.length == 0
            }
            color="primary"
          >
            Create Source
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  onSelectTags(selectedTags: Array<string>) {
    selectedTags = selectedTags.map((tag) => {
      if (tag.startsWith("[") && tag.endsWith("]")) {
        tag = tag.substring(1, tag.length - 1);
      }

      return tag;
    });

    this.setState({ selectedTags });
  }

  onClose() {
    this.setState({ selectedTags: [] });
    this.props.onClose();
  }

  createAPICall(e: MouseEvent) {
    const { selectedTags } = this.state;
    let url = `${this.makeURL()}?tags=${encodeURIComponent(JSON.stringify(selectedTags))}`;

    this.setState({ selectedTags: [] });
    this.props.onImportURL(AF.url, e, [url]);
  }

  makeURL() {
    const { hydrusProtocol, hydrusDomain, hydrusPort } =
      this.props.config.remoteSettings;
    return (
      hydrusProtocol +
      "://" +
      hydrusDomain +
      ":" +
      hydrusPort +
      "/get_files/search_files"
    );
  }
}

(HydrusDialog as any).displayName = "HydrusDialog";
export default withStyles(styles)(HydrusDialog as any);
