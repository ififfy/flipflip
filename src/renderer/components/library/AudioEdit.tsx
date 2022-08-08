import * as React from "react";
import {remote} from "electron";
import {readFileSync} from "fs";
import clsx from "clsx";
import {parseFile} from "music-metadata";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  Theme,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import DeleteIcon from "@mui/icons-material/Delete";

import {extractMusicMetadata, generateThumbnailFile} from "../../data/utils";
import {isImage} from "../player/Scrapers";
import Audio from "../../data/Audio";

const styles = (theme: Theme) => createStyles({
  input: {
    width: '100%',
    maxWidth: 365,
    marginRight: theme.spacing(4),
  },
  inputShort: {
    width: 75,
  },
  inputFull: {
    width: '100%',
    maxWidth: 530,
  },
  pointer: {
    cursor: 'pointer',
  },
  trackThumb: {
    height: 140,
    width: 140,
    overflow: 'hidden',
    display: 'inline-flex',
    justifyContent: 'center',
    position: 'absolute',
  },
  thumbImage: {
    height: '100%',
  },
  deleteThumbButton: {
    backgroundColor: theme.palette.error.main,
    position: 'absolute',
    bottom: '3%',
    right: '6%',
  },
  deleteIcon: {
    color: theme.palette.error.contrastText,
  },
  audioIcon: {
    height: '100%',
    width: '100%',
  },
  actions: {
    marginRight: theme.spacing(3),
  },
});

class AudioEdit extends React.Component {
  readonly props: {
    classes: any,
    audio: Audio,
    cachePath: string,
    title: string,
    allowSuggestion?: boolean,
    onCancel(): void,
    onFinishEdit(common: Audio): void,
  };

  readonly state = {
    audio: this.props.audio,
  }

  render() {
    const classes = this.props.classes;

    return (
      <Dialog
        open={true}
        onClose={this.props.onCancel.bind(this)}
        aria-describedby="edit-description">
        <DialogContent>
          <Typography variant="h6">{this.props.title}</Typography>
          <TextField
            variant="standard"
            className={classes.input}
            value={this.state.audio.name == null ? "" : this.state.audio.name}
            margin="normal"
            label="Name"
            onChange={this.onEdit.bind(this, 'name')} />
          <div className={clsx(classes.trackThumb, this.state.audio.thumb == null && classes.pointer)} onClick={this.state.audio.thumb == null ? this.loadThumb.bind(this) : this.nop}>
            {this.state.audio.thumb != null && (
              <React.Fragment>
                <IconButton
                  onClick={this.onRemoveThumb.bind(this)}
                  className={classes.deleteThumbButton}
                  edge="end"
                  size="small"
                  aria-label="delete">
                  <DeleteIcon className={classes.deleteIcon} color="inherit"/>
                </IconButton>
                <img className={classes.thumbImage} src={this.state.audio.thumb}/>
              </React.Fragment>
            )}
            {this.state.audio.thumb == null && (
              <AudiotrackIcon className={classes.audioIcon} />
            )}
          </div>
          <TextField
            variant="standard"
            className={classes.input}
            value={this.state.audio.artist == null ? "" : this.state.audio.artist}
            margin="normal"
            label="Artist"
            onChange={this.onEdit.bind(this, 'artist')} />
          <TextField
            variant="standard"
            className={classes.input}
            value={this.state.audio.album == null ? "" : this.state.audio.album}
            margin="normal"
            label="Album"
            onChange={this.onEdit.bind(this, 'album')} />
          <TextField
            variant="standard"
            className={classes.inputShort}
            value={this.state.audio.trackNum == null ? "" : this.state.audio.trackNum}
            margin="normal"
            label="Track #"
            inputProps={{
              min: 0,
              type: 'number',
            }}
            onChange={this.onEditInt.bind(this, 'trackNum')} />
          <TextField
            variant="standard"
            className={classes.inputFull}
            value={this.state.audio.comment == null ? "" : this.state.audio.comment}
            margin="normal"
            label="Comment"
            multiline
            onChange={this.onEdit.bind(this, 'comment')} />
        </DialogContent>
        <DialogActions className={classes.actions}>
          {this.props.allowSuggestion && (
            <Button onClick={this.loadSuggestions.bind(this)}>
              Use Suggestions
            </Button>
          )}
          <Button onClick={this.props.onCancel.bind(this)} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.props.onFinishEdit.bind(this, this.state.audio)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  nop() {}

  onEditInt(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const newAudio = new Audio(this.state.audio);
    (newAudio as any)[key] = parseInt(input.value);
    this.setState({audio: newAudio});
  }

  onEdit(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const newAudio = new Audio(this.state.audio);
    (newAudio as any)[key] = input.value;
    this.setState({audio: newAudio});
  }

  onRemoveThumb(e: MouseEvent) {
    e.preventDefault();
    const newAudio = new Audio(this.state.audio);
    newAudio.thumb = null;
    this.setState({audio: newAudio});
  }

  loadThumb() {
    let iResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
      {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'Image files', extensions: ["gif", "png", "jpeg", "jpg", "webp", "tiff", "svg"]}], properties: ['openFile']});
    if (!iResult) return;
    iResult = iResult.filter((i) => isImage(i, true));
    if (iResult.length > 0) {
      const newAudio = this.state.audio;
      newAudio.thumb = generateThumbnailFile(this.props.cachePath, readFileSync(iResult[0]));
      this.setState({audio: newAudio});
    }
  }

  loadSuggestions() {
    const url = this.state.audio.url;
    parseFile(url)
      .then((metadata: any) => {
        if (metadata) {
          const newAudio = new Audio(this.state.audio);
          extractMusicMetadata(newAudio, metadata, this.props.cachePath);
          this.setState({audio: newAudio});
        }
      })
      .catch((err: any) => {
        console.error("Error reading metadata:", err.message);
      });
  }
}

(AudioEdit as any).displayName="AudioEdit";
export default withStyles(styles)(AudioEdit as any);