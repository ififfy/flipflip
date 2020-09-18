import * as React from "react";
import {IncomingMessage, remote} from "electron";
import {existsSync, readFileSync, unlinkSync} from "fs";
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import * as mm from "music-metadata";
import clsx from "clsx";

import {
  Button, CircularProgress, Collapse,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText, Divider, FormControl, FormControlLabel, Grid,
  IconButton, InputAdornment, InputLabel,
  List, MenuItem, Select, Slider, SvgIcon, Switch, TextField,
  Theme, Tooltip,
  Typography,
  withStyles
} from "@material-ui/core";


import DeleteIcon from "@material-ui/icons/Delete";

import {arrayMove, generateThumbnailFile, isImage, toArrayBuffer, urlToPath} from "../../data/utils";
import Audio from "../../data/Audio";
import AudioSourceListItem from "./AudioSourceListItem";
import SourceIcon from "./SourceIcon";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import CheckIcon from "@material-ui/icons/Check";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import {TF} from "../../data/const";
import en from "../../data/en";
import {analyze} from "web-audio-beat-detector";
import request from "request";
import {green, red} from "@material-ui/core/colors";
import Playlist from "../../data/Playlist";

const styles = (theme: Theme) => createStyles({
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%',
  },
  emptyMessage2: {
    textAlign: 'center',
  },
  backdropTop: {
    zIndex: theme.zIndex.modal + 1,
  },
  trackThumb: {
    height: 140,
    width: 140,
    overflow: 'hidden',
    display: 'inline-flex',
    justifyContent: 'center',
    position: 'absolute',
  },
  pointer: {
    cursor: 'pointer',
  },
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
  bpmProgress: {
    position: 'absolute',
    right: 67,
  },
  tagProgress: {
    position: 'absolute',
    right: 20,
  },
  success: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  failure: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  fullWidth: {
    width: '100%',
  },
  noPadding: {
    padding: '0 !important',
  },
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0,
  },
  percentInput: {
    minWidth: theme.spacing(11),
  },
});

class AudioSourceList extends React.Component {
  readonly props: {
    classes: any,
    cachePath: string,
    isSelect: boolean,
    selected: Array<string>,
    sources: Array<Audio>,
    yOffset: number,
    playlist?: string,
    onClickAlbum(album: string): void,
    onClickArtist(artist: string): void,
    onPlay(source: Audio, displayed: Array<Audio>): void,
    onUpdateSelected(selected: Array<string>): void,
    onUpdateLibrary(fn: (library: Array<Audio>) => void): void,
    onUpdatePlaylists(fn: (playlists: Array<Playlist>) => void): void,
    savePosition(): void,
    systemMessage(message: string): void,
  };

  readonly state = {
    sourceOptions: null as Audio,
    deleteDialog: null as Audio,
    sourceEdit: null as Audio,
    loadingBPM: false,
    successBPM: false,
    errorBPM: false,
    loadingTag: false,
    successTag: false,
    errorTag: false,
  };

  onSortEnd = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    if (this.props.playlist) {
      this.props.onUpdatePlaylists((pl) => {
        const playlist = pl.find((p) => p.name == this.props.playlist);
        const oldIndexSource = this.props.sources[oldIndex];
        const newIndexSource = this.props.sources[newIndex];
        const oldPlaylistIndex = playlist.audios.indexOf(oldIndexSource.id);
        const newPlaylistIndex = playlist.audios.indexOf(newIndexSource.id);
        arrayMove(playlist.audios, oldPlaylistIndex, newPlaylistIndex);
      });
    } else {
      this.props.onUpdateLibrary((l) => {
        const oldIndexSource = this.props.sources[oldIndex];
        const newIndexSource = this.props.sources[newIndex];
        const libraryURLs = l.map((s: Audio) => s.url);
        const oldLibraryIndex = libraryURLs.indexOf(oldIndexSource.url);
        const newLibraryIndex = libraryURLs.indexOf(newIndexSource.url);
        arrayMove(l, oldLibraryIndex, newLibraryIndex);
      });
    }
  };

  render() {
    const classes = this.props.classes;

    if (this.props.sources.length == 0) {
      return (
        <React.Fragment>
          <Typography component="h1" variant="h3" color="inherit" noWrap className={classes.emptyMessage}>
            乁( ◔ ౪◔)「
          </Typography>
          <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.emptyMessage2}>
            Nothing here
          </Typography>
        </React.Fragment>

      );
    }

    return (
      <React.Fragment>
        <AutoSizer>
          {({ height, width } : {height: number, width: number}) => (
            <List id="sortable-list" disablePadding>
              <this.SortableVirtualList
                helperContainer={() => document.getElementById("sortable-list")}
                distance={5}
                height={height}
                width={width}
                onSortEnd={this.onSortEnd.bind(this)}/>
            </List>
          )}
        </AutoSizer>
        {this.state.deleteDialog != null && (
          <Dialog
            open={this.state.deleteDialog != null}
            onClose={this.onCloseDeleteDialog.bind(this)}
            aria-describedby="delete-description">
            <DialogContent>
              <DialogContentText id="delete-description">
                Are you sure you want to delete {this.state.deleteDialog.url}?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.onCloseDeleteDialog.bind(this)} color="secondary">
                Cancel
              </Button>
              <Button onClick={this.onFinishDelete.bind(this)} color="primary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {this.state.sourceOptions != null && (
          <Dialog
            open={this.state.sourceOptions != null}
            onClose={this.onCloseSourceOptions.bind(this)}
            aria-describedby="edit-description">
            <DialogContent>
              <Typography variant="h6">Edit song options</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <VolumeDownIcon />
                    </Grid>
                    <Grid item xs>
                      <Slider value={this.state.sourceOptions.volume}
                              onChange={this.onSourceSliderChange.bind(this, 'volume')}
                              aria-labelledby="audio-volume-slider" />
                    </Grid>
                    <Grid item>
                      <VolumeUpIcon />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Collapse in={!this.state.sourceOptions.tick && !this.state.sourceOptions.nextSceneAtEnd}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={this.state.sourceOptions.stopAtEnd}
                              onChange={this.onSourceBoolInput.bind(this, 'stopAtEnd')}/>
                          }
                          label="Stop at End"/>
                      </Collapse>
                      <Collapse in={!this.state.sourceOptions.tick && !this.state.sourceOptions.stopAtEnd}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={this.state.sourceOptions.nextSceneAtEnd}
                              onChange={this.onSourceBoolInput.bind(this, 'nextSceneAtEnd')}/>
                          }
                          label="Next Scene at End"/>
                      </Collapse>
                      <Collapse in={!this.state.sourceOptions.stopAtEnd && !this.state.sourceOptions.nextSceneAtEnd}>
                        <FormControlLabel
                          control={
                            <Tooltip title={"Repeat track at particular interval"}>
                              <Switch
                                size="small"
                                checked={this.state.sourceOptions.tick}
                                onChange={this.onSourceBoolInput.bind(this, 'tick')}/>
                            </Tooltip>
                          }
                          label="Tick"/>
                      </Collapse>
                    </Grid>
                    <Divider component="div" orientation="vertical" style={{height: 48}}/>
                    <Grid item xs>
                      <Grid container>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            label="BPM"
                            margin="dense"
                            value={this.state.sourceOptions.bpm}
                            onChange={this.onSourceIntInput.bind(this, 'bpm')}
                            onBlur={this.blurSourceIntKey.bind(this, 'bpm')}
                            InputProps={{
                              endAdornment:
                                <InputAdornment position="end">
                                  <Tooltip title="Detect BPM">
                                    <IconButton
                                      className={clsx(this.state.successBPM && classes.success, this.state.errorBPM && classes.failure)}
                                      onClick={this.onDetectBPM.bind(this)}>
                                      {this.state.successBPM ? <CheckIcon/> :
                                        this.state.errorBPM ? <ErrorOutlineIcon/> :
                                          <SvgIcon viewBox="0 0 24 24" fontSize="small">
                                            <path
                                              d="M12,1.75L8.57,2.67L4.07,19.5C4.06,19.5 4,19.84 4,20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20C20,19.84 19.94,19.5 19.93,19.5L15.43,2.67L12,1.75M10.29,4H13.71L17.2,17H13V12H11V17H6.8L10.29,4M11,5V9H10V11H14V9H13V5H11Z"/>
                                          </SvgIcon>
                                      }
                                    </IconButton>
                                  </Tooltip>
                                  {this.state.loadingBPM && <CircularProgress size={34} className={classes.bpmProgress} />}
                                  <Tooltip title="Read BPM Metadata">
                                    <IconButton
                                      className={clsx(this.state.successTag && classes.success, this.state.errorTag && classes.failure)}
                                      onClick={this.onReadBPMTag.bind(this)}>
                                      {this.state.successTag ? <CheckIcon/> :
                                        this.state.errorTag ? <ErrorOutlineIcon/> :
                                          <AudiotrackIcon/>
                                      }
                                    </IconButton>
                                  </Tooltip>
                                  {this.state.loadingTag && <CircularProgress size={34} className={classes.tagProgress} />}
                                </InputAdornment>,
                            }}
                            inputProps={{
                              min: 0,
                              type: 'number',
                            }}/>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography id="audio-speed-slider" variant="caption" component="div"
                                      color="textSecondary">
                            Speed {this.state.sourceOptions.speed / 10}x
                          </Typography>
                          <Slider
                            min={5}
                            max={40}
                            defaultValue={this.state.sourceOptions.speed}
                            onChangeCommitted={this.onSourceSliderChange.bind(this, 'speed')}
                            valueLabelDisplay={'auto'}
                            valueLabelFormat={(v) => v/10 + "x"}
                            aria-labelledby="audio-speed-slider"/>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} className={clsx(!this.state.sourceOptions.tick && classes.noPadding)}>
                  <Collapse in={this.state.sourceOptions.tick} className={classes.fullWidth}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <FormControl className={classes.fullWidth}>
                          <InputLabel>Timing</InputLabel>
                          <Select
                            value={this.state.sourceOptions.tickMode}
                            onChange={this.onSourceInput.bind(this, 'tickMode')}>
                            {Object.values(TF).map((tf) => {
                              return <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>;
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Collapse in={this.state.sourceOptions.tickMode == TF.sin} className={classes.fullWidth}>
                          <Typography id="tick-sin-rate-slider" variant="caption" component="div"
                                      color="textSecondary">
                            Wave Rate
                          </Typography>
                          <Grid container alignItems="center">
                            <Grid item xs>
                              <Slider
                                min={1}
                                defaultValue={this.state.sourceOptions.tickSinRate}
                                onChangeCommitted={this.onSourceSliderChange.bind(this, 'tickSinRate')}
                                valueLabelDisplay={'auto'}
                                aria-labelledby="tick-sin-rate-slider"/>
                            </Grid>
                            <Grid item xs={3} className={classes.percentInput}>
                              <TextField
                                value={this.state.sourceOptions.tickSinRate}
                                onChange={this.onSourceIntInput.bind(this, 'tickSinRate')}
                                onBlur={this.blurSourceIntKey.bind(this, 'tickSinRate')}
                                inputProps={{
                                  className: classes.endInput,
                                  step: 5,
                                  min: 0,
                                  max: 100,
                                  type: 'number',
                                  'aria-labelledby': 'tick-sin-rate-slider',
                                }}/>
                            </Grid>
                          </Grid>
                        </Collapse>
                        <Collapse in={this.state.sourceOptions.tickMode == TF.bpm} className={classes.fullWidth}>
                          <Typography id="tick-bpm-multi-slider" variant="caption" component="div"
                                      color="textSecondary">
                            BPM
                            Multiplier {this.state.sourceOptions.tickBPMMulti > 0 ? this.state.sourceOptions.tickBPMMulti : "1 / " + (-1 * (this.state.sourceOptions.tickBPMMulti - 2))}x
                          </Typography>
                          <Slider
                            min={-8}
                            max={10}
                            defaultValue={this.state.sourceOptions.tickBPMMulti}
                            onChangeCommitted={this.onSourceSliderChange.bind(this, 'tickBPMMulti')}
                            valueLabelDisplay={'auto'}
                            valueLabelFormat={(v) => v > 0 ? v + "x" : "1/" + (-1 * (v - 2)) + "x"}
                            aria-labelledby="tick-bpm-multi-slider"/>
                        </Collapse>
                        <Collapse in={this.state.sourceOptions.tickMode == TF.constant} className={classes.fullWidth}>
                          <TextField
                            variant="outlined"
                            label="For"
                            margin="dense"
                            value={this.state.sourceOptions.tickDelay}
                            onChange={this.onSourceIntInput.bind(this, 'tickDelay')}
                            onBlur={this.blurSourceIntKey.bind(this, 'tickDelay')}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                            }}
                            inputProps={{
                              step: 100,
                              min: 0,
                              type: 'number',
                            }}/>
                        </Collapse>
                      </Grid>
                    </Grid>
                  </Collapse>
                </Grid>
                <Grid item xs={12} className={clsx(!this.state.sourceOptions.tick && classes.noPadding)}>
                  <Collapse in={this.state.sourceOptions.tick && (this.state.sourceOptions.tickMode == TF.random || this.state.sourceOptions.tickMode == TF.sin)} className={classes.fullWidth}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <TextField
                          variant="outlined"
                          label="Between"
                          margin="dense"
                          value={this.state.sourceOptions.tickMinDelay}
                          onChange={this.onSourceIntInput.bind(this, 'tickMinDelay')}
                          onBlur={this.blurSourceIntKey.bind(this, 'tickMinDelay')}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                          }}
                          inputProps={{
                            step: 100,
                            min: 0,
                            type: 'number',
                          }}/>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          variant="outlined"
                          label="and"
                          margin="dense"
                          value={this.state.sourceOptions.tickMaxDelay}
                          onChange={this.onSourceIntInput.bind(this, 'tickMaxDelay')}
                          onBlur={this.blurSourceIntKey.bind(this, 'tickMaxDelay')}
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
                  </Collapse>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        )}
        {this.state.sourceEdit != null && (
          <Dialog
            open={this.state.sourceEdit != null}
            onClose={this.onCloseSourceEditDialog.bind(this)}
            aria-describedby="edit-description">
            <DialogContent>
              <Typography variant="h6">Edit song info</Typography>
              {this.state.sourceEdit.url.startsWith("http") && (
                <TextField
                  className={classes.input}
                  value={this.state.sourceEdit.url}
                  margin="normal"
                  label="URL"
                  onChange={this.onEditSourceInfo.bind(this, 'URL')}/>
              )}
              <TextField
                className={classes.input}
                value={this.state.sourceEdit.name}
                margin="normal"
                label="Name"
                onChange={this.onEditSourceInfo.bind(this, 'name')}/>
              <div className={clsx(classes.trackThumb, this.state.sourceEdit.thumb == null && classes.pointer)} onClick={this.state.sourceEdit.thumb == null ? this.loadThumb.bind(this) : this.nop}>
                {this.state.sourceEdit.thumb != null && (
                  <React.Fragment>
                    <IconButton
                      onClick={this.onRemoveThumb.bind(this)}
                      className={classes.deleteThumbButton}
                      edge="end"
                      size="small"
                      aria-label="delete">
                      <DeleteIcon className={classes.deleteIcon} color="inherit"/>
                    </IconButton>
                    <img className={classes.thumbImage} src={this.state.sourceEdit.thumb}/>
                  </React.Fragment>
                )}
                {this.state.sourceEdit.thumb == null && (
                  <SourceIcon url={this.state.sourceEdit.url} className={classes.audioIcon}/>
                )}
              </div>
              <TextField
                className={classes.input}
                value={this.state.sourceEdit.artist}
                margin="normal"
                label="Artist"
                onChange={this.onEditSourceInfo.bind(this, 'artist')}/>
              <TextField
                className={classes.input}
                value={this.state.sourceEdit.album}
                margin="normal"
                label="Album"
                onChange={this.onEditSourceInfo.bind(this, 'album')}/>
              {/*<TextField
                className={classes.inputShort}
                value={this.state.sourceEdit.trackNum}
                margin="normal"
                label="Track #"
                inputProps={{
                  min: 0,
                  type: 'number',
                }}
                onChange={this.onEditSourceInfo.bind(this, 'trackNum')}/>*/}
              <TextField
                className={classes.inputFull}
                value={this.state.sourceEdit.comment}
                margin="normal"
                label="Comment"
                multiline
                onChange={this.onEditSourceInfo.bind(this, 'comment')}/>
            </DialogContent>
            <DialogActions className={classes.actions}>
              <Button onClick={this.loadSuggestions.bind(this)} color="default">
                Use Suggestions
              </Button>
              <Button onClick={this.onCloseSourceEditDialog.bind(this)} color="secondary">
                Cancel
              </Button>
              <Button onClick={this.onFinishSourceEdit.bind(this)} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </React.Fragment>
    )
  }

  nop() {}

  componentDidMount() {
    addEventListener('keydown', this.onKeyDown, false);
    addEventListener('keyup', this.onKeyUp, false);
    this._shiftDown = false;
    this._lastChecked = null;
  }

  componentWillUnmount() {
    removeEventListener('keydown', this.onKeyDown);
    addEventListener('keyup', this.onKeyUp);
    this._shiftDown = null;
    this._lastChecked = null;
    this.savePosition();
  }

  _shiftDown = false;
  onKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Shift') this._shiftDown = true;
  }
  onKeyUp = (e: KeyboardEvent) => {
    if (e.key == 'Shift') this._shiftDown = false;
  }

  savePosition() {
    if (this.props.savePosition) {
      this.props.savePosition();
    }
  }

  onDelete(source: Audio) {
    this.setState({deleteDialog: source});
  }

  onCloseDeleteDialog() {
    this.setState({deleteDialog: null});
  }

  onFinishDelete() {
    unlinkSync(this.state.deleteDialog.url);
    this.onRemove(this.state.deleteDialog);
    this.onCloseDeleteDialog();
  }

  onRemove(source: Audio) {
    if (this.props.playlist) {
      this.props.onUpdatePlaylists((pl) => {
        const playlist = pl.find((p) => p.name == this.props.playlist);
        playlist.audios.forEach((a, index) => {
          if (a == source.id) {
            playlist.audios.splice(index, 1);
            return;
          }
        });
      });
    } else {
      this.props.onUpdateLibrary((l) => {
        l.forEach((s, index) => {
          if (s.id == source.id) {
            l.splice(index, 1);
            return;
          }
        });
      });
    }
  }

  _lastChecked: string = null;
  onToggleSelect(e: MouseEvent) {
    const source = (e.currentTarget as HTMLInputElement).value;
    let newSelected = Array.from(this.props.selected);
    if (newSelected.includes(source)) {
      newSelected.splice(newSelected.indexOf(source), 1)
    } else {
      if (this.props.sources.map((s) => s.url).includes(this._lastChecked) && this._shiftDown) {
        let start = false;
        for (let s of this.props.sources) {
          if (start && (s.url == source || s.url == this._lastChecked)) {
            break;
          }
          if (start) {
            newSelected.push(s.url);
          }
          if (!start && (s.url == source || s.url == this._lastChecked)) {
            start = true;
          }
        }
      }
      newSelected.push(source);
    }
    this._lastChecked = source;
    this.props.onUpdateSelected(newSelected);
  }

  onEditSource(audio: Audio) {
    this.setState({sourceEdit: new Audio(audio)})
  }

  onEditSourceInfo(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const newAudio = new Audio(this.state.sourceEdit);
    (newAudio as any)[key] = input.value;
    this.setState({sourceEdit: newAudio});
  }

  onCloseSourceEditDialog() {
    this.setState({sourceEdit: null});
  }

  onFinishSourceEdit() {
    this.props.onUpdateLibrary((a) => {
      let editSource = a.find((a) => a.id == this.state.sourceEdit.id);
      Object.assign(editSource, this.state.sourceEdit);

    })
    this.onCloseSourceEditDialog();
  }

  loadThumb() {
    let iResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
      {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'Image files', extensions: ["gif", "png", "jpeg", "jpg", "webp", "tiff", "svg"]}], properties: ['openFile']});
    if (!iResult) return;
    iResult = iResult.filter((i) => isImage(i, true));
    if (iResult.length > 0) {
      const newAudio = this.state.sourceEdit;
      newAudio.thumb = generateThumbnailFile(this.props.cachePath, readFileSync(iResult[0]));
      this.setState({sourceEdit: newAudio});
    }
  }

  loadSuggestions() {
    const url = this.state.sourceEdit.url;
    mm.parseFile(url)
      .then((metadata: any) => {
        if (metadata) {
          const newAudio = new Audio(this.state.sourceEdit);
          if (metadata.common) {
            newAudio.name = metadata.common.title;
            newAudio.album = metadata.common.album;
            newAudio.artist = metadata.common.artist;
            if (metadata.common.picture && metadata.common.picture.length > 0) {
              newAudio.thumb = generateThumbnailFile(this.props.cachePath, metadata.common.picture[0].data);
            }
          }
          if (metadata.format) {
            newAudio.duration = metadata.format.duration;
          }
          this.setState({sourceEdit: newAudio});
        }
      })
      .catch((err: any) => {
        console.error("Error reading metadata:", err.message);
      });
  }

  onRemoveThumb(e: MouseEvent) {
    e.preventDefault();
    const newAudio = new Audio(this.state.sourceEdit);
    newAudio.thumb = null;
    this.setState({sourceEdit: newAudio});
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

  onCloseDialog() {
    this.setState({menuAnchorEl: null, clipMenu: null});
  }

  onReadBPMTag() {
    if (this.state.sourceOptions.url && !this.state.loadingTag) {
      this.setState({loadingTag: true});
      mm.parseFile(this.state.sourceOptions.url)
        .then((metadata: any) => {
          if (metadata && metadata.common && metadata.common.bpm) {
            this.changeKey('bpm', metadata.common.bpm);
            this.setState({loadingTag: false, successTag: true});
            setTimeout(() => {this.setState({successTag: false})}, 3000);
          } else {
            this.setState({loadingTag: false, errorTag: true});
            setTimeout(() => {this.setState({errorTag: false})}, 3000);
          }
        })
        .catch((err: any) => {
          console.error("Error reading metadata:", err.message);
          this.setState({loadingTag: false, errorTag: true});
          setTimeout(() => {this.setState({errorTag: false})}, 3000);
        });
    }
  }

  onDetectBPM() {
    const bpmError = () => {
      this.setState({loadingBPM: false, errorBPM: true});
      setTimeout(() => {
        this.setState({errorBPM: false})
      }, 3000);
    }

    const detectBPM = (data: ArrayBuffer) => {
      let context = new AudioContext();
      context.decodeAudioData(data, (buffer) => {
        analyze(buffer)
          .then((tempo: number) => {
            this.changeKey('bpm', tempo.toFixed(2));
            this.setState({loadingBPM: false, successBPM: true});
            setTimeout(() => {
              this.setState({successBPM: false})
            }, 3000);
          })
          .catch((err: any) => {
            console.error("Error analyzing");
            console.error(err);
            bpmError();
          });
      }, (err) => {
        console.error(err);
        bpmError();
      });
    }

    if (this.state.sourceOptions.url && !this.state.loadingBPM) {
      this.setState({loadingBPM: true});
      try {
        const url = this.state.sourceOptions.url;
        if (existsSync(url)) {
          detectBPM(toArrayBuffer(readFileSync(url)));
        } else {
          request.get({url, encoding: null}, function (err: Error, res: IncomingMessage, body: Buffer) {
            if (err) {
              console.error(err);
              bpmError();
              return;
            }
            detectBPM(toArrayBuffer(body));
          });
        }
      } catch (e) {
        console.error(e);
        bpmError();
      }
    }

  }

  onCloseSourceOptions() {
    this.setState({sourceOptions: null});
  }

  onSourceOptions(source: Audio) {
    this.setState({sourceOptions: source});
  }

  onSourceInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value);
  }

  onSourceSliderChange(key: string, e: MouseEvent, value: number) {
    this.changeKey(key, value);
  }

  onSourceIntInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value === '' ? '' : Number(input.value));
  }

  blurSourceIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.state.sourceOptions as any)[key] < min) {
      this.changeKey(key, min === '' ? '' : Number(min));
    } else if (max && (this.state.sourceOptions as any)[key] > max) {
      this.changeKey(key, max === '' ? '' : Number(max));
    }
  }

  onSourceBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    switch (key) {
      case 'tick':
        if (input.checked) {
          this.props.onUpdateLibrary((l) => {
            const audio = l.find((a: Audio) => a.id == this.state.sourceOptions.id);
            audio.tick = true;
            audio.stopAtEnd = false;
            audio.nextSceneAtEnd = false;
            this.setState({sourceOptions: audio});
          });
        } else {
          this.changeKey(key, false);
        }
        break;
      case 'stopAtEnd':
        if (input.checked) {
          this.props.onUpdateLibrary((l) => {
            const audio = l.find((a: Audio) => a.id == this.state.sourceOptions.id);
            audio.stopAtEnd = true;
            audio.tick = false;
            audio.nextSceneAtEnd = false;
            this.setState({sourceOptions: audio});
          });
        } else {
          this.changeKey(key, false);
        }
        break;
      case 'nextSceneAtEnd':
        if (input.checked) {
          this.props.onUpdateLibrary((l) => {
            const audio = l.find((a: Audio) => a.id == this.state.sourceOptions.id);
            audio.nextSceneAtEnd = true;
            audio.tick = false;
            audio.stopAtEnd = false;
            this.setState({sourceOptions: audio});
          });
        } else {
          this.changeKey(key, false);
        }
    }
  }

  changeKey(key: string, value: any) {
    this.props.onUpdateLibrary((l) => {
      const source = l.find((s) => s.url == this.state.sourceOptions.url);
      (source as any)[key] = value;
      this.setState({sourceOptions: source});
    });
  }

  SortableVirtualList = sortableContainer(this.VirtualList.bind(this));

  VirtualList(props: any) {
    const { height, width } = props;

    return (
      <FixedSizeList
        height={height}
        width={width}
        initialScrollOffset={this.props.yOffset ? this.props.yOffset : 0}
        itemSize={56}
        itemCount={this.props.sources.length}
        itemData={this.props.sources}
        itemKey={(index: number, data: any) => index}
        overscanCount={10}>
        {this.Row.bind(this)}
      </FixedSizeList>
    );
  }

  SortableItem = sortableElement(({value}: {value: {index: number, style: any, data: Array<any>}}) => {
    const index = value.index;
    const source: Audio = value.data[index];
    return (
      <AudioSourceListItem
        key={index}
        checked={this.props.isSelect ? this.props.selected.includes(source.url) : false}
        index={index}
        isSelect={this.props.isSelect}
        source={source}
        sources={this.props.sources}
        style={value.style}
        onClickAlbum={this.props.onClickAlbum.bind(this)}
        onClickArtist={this.props.onClickArtist.bind(this)}
        onDelete={this.onDelete.bind(this)}
        onEditSource={this.onEditSource.bind(this)}
        onPlay={this.props.onPlay.bind(this)}
        onRemove={this.onRemove.bind(this)}
        onSourceOptions={this.onSourceOptions.bind(this)}
        onToggleSelect={this.onToggleSelect.bind(this)}
        savePosition={this.savePosition.bind(this)}
        systemMessage={this.props.systemMessage.bind(this)}
      />
    )});

  Row(props: any) {
    const { index } = props;
    return (
      <this.SortableItem index={index} value={props}/>
    );
  }
}

export default withStyles(styles)(AudioSourceList as any);