import * as React from "react";

import {
  Button, CircularProgress, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Grid, InputAdornment, TextField, Theme, withStyles
} from "@material-ui/core";

import {getSourceType} from "../player/Scrapers";
import {ST} from "../../data/const";
import Clip from "../../data/Clip";
import LibrarySource from "../../data/LibrarySource";

const styles = (theme: Theme) => createStyles({
  noScroll: {
    overflow: 'visible',
  },
  progress: {
    position: 'absolute',
    right: 20,
  },
});

class BatchClipDialog extends React.Component {
  readonly props: {
    classes: any,
    open: boolean,
    library: Array<LibrarySource>,
    selected: Array<string>,
    onCloseDialog(): void,
    onUpdateLibrary(fn: (library: Array<LibrarySource>) => void): void,
  };

  readonly state = {
    clipOffset: [0, 0],
    creatingClips: false,
  }

  render() {
    const classes = this.props.classes;

    return(
      <Dialog
        open={this.props.open}
        classes={{paper: classes.noScroll}}
        onClose={this.onCloseDialog.bind(this)}
        aria-labelledby="batch-clip-title"
        aria-describedby="batch-clip-description">
        <DialogTitle id="batch-clip-title">Batch Clip</DialogTitle>
        <DialogContent className={classes.noScroll}>
          <DialogContentText id="batch-clip-description">
            Choose offsets for new clips
          </DialogContentText>
          {this.props.open && (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  variant="outlined"
                  label="Skip First"
                  margin="dense"
                  value={this.state.clipOffset[0]}
                  onChange={this.onClipOffset.bind(this, 0)}
                  onBlur={this.blurClipOffset.bind(this, 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: 'number',
                  }}/>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  variant="outlined"
                  label="Skip Last"
                  margin="dense"
                  value={this.state.clipOffset[1]}
                  onChange={this.onClipOffset.bind(this, 1)}
                  onBlur={this.blurClipOffset.bind(this, 1)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: 'number',
                  }}/>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {this.state.creatingClips && <CircularProgress size={34} className={classes.progress} />}
          <Button onClick={this.batchClipFinish.bind(this)} color="primary">
            Create Batch Clips
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  blurClipOffset(index: number, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && this.state.clipOffset[index] < min) {
      this.changeClipOffset(index, min);
    } else if (max && this.state.clipOffset[index] > max) {
      this.changeClipOffset(index, max);
    }
  }

  onClipOffset(index: number, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeClipOffset(index, input.value === '' ? '' : input.value);
  }

  changeClipOffset(index: number, intString: string) {
    const newClipOffset = Array.from(this.state.clipOffset);
    newClipOffset[index] = intString === '' ? 0 : Number(intString);
    this.setState({clipOffset: newClipOffset});
  }

  batchClipFinish() {
    const newLibrary = Array.from(this.props.library);
    let index = -1;
    const errorCallback = (msg: string) => {
      console.error(msg);
      createBatchClips();
    }
    const successCallback = (video: HTMLVideoElement, sourceURL: string) => {
      const source = newLibrary.find((s) => s.url === sourceURL);
      let id = source.clips.length + 1;
      source.clips.forEach((c) => {
        id = Math.max(c.id + 1, id);
      });
      source.clips.push(new Clip({id: id, start: this.state.clipOffset[0] / 1000, end: (video.duration - (this.state.clipOffset[1] / 1000))}));
      createBatchClips();
    }
    const createBatchClips = () => {
      index++;
      if (index == this.props.selected.length) {
        this.props.onUpdateLibrary((l) => {
          for (let sourceURL of this.props.selected) {
            const source = l.find((s) => s.url === sourceURL);
            source.clips = newLibrary.find((s) => s.url === sourceURL).clips;
          }
        })
        this.onCloseDialog();
        return;
      }

      const sourceURL = this.props.selected[index];
      const type = getSourceType(sourceURL);
      if (type == ST.video) {
        const video = document.createElement('video');
        video.onloadeddata = () => {
          successCallback(video, sourceURL);
        };

        video.onerror = video.onabort = (e) => {
          errorCallback("Unable to load video: " + sourceURL);
        };

        video.src = sourceURL;
        video.preload = "auto";
      } else {
        createBatchClips();
      }
    }

    this.setState({creatingClips: true});
    createBatchClips();
  }

  onCloseDialog() {
    this.setState({clipOffset: [0, 0], creatingClips: false});
    this.props.onCloseDialog();
  }
}

(BatchClipDialog as any).displayName="BatchClipDialog";
export default withStyles(styles)(BatchClipDialog as any);