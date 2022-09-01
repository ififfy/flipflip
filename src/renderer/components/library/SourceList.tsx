import * as React from "react";
import rimraf from "rimraf";
import {existsSync, unlinkSync} from "fs";
import {remote} from "electron";
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import clsx from "clsx";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  List,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Switch,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import FolderIcon from "@mui/icons-material/Folder";

import {arrayMove, getCachePath, getTimestamp, urlToPath} from "../../data/utils";
import {getFileName, getSourceType} from "../player/Scrapers";
import {RF, RT, SDT, ST} from "../../data/const";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import SourceListItem from "./SourceListItem";
import Clip from "../../data/Clip";
import en from "../../data/en";
import Scene from "../../data/Scene";

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
  marginRight: {
    marginRight: theme.spacing(1),
  },
  blacklistInput: {
    minWidth: 200,
    minHeight: 100,
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    overflowY: 'auto !important' as any,
  },
  fullWidth: {
    width: '100%',
  },
  wordWrap: {
    wordWrap: 'break-word',
  },
  arrow: {
    position: 'absolute',
    bottom: 20,
    right: 35,
    fontSize: 220,
    transform: 'rotateY(0deg) rotate(45deg)'
  },
  arrowMessage: {
    position: 'absolute',
    bottom: 260,
    right: 160,
  },
  weightMenu: {
    width: theme.spacing(10)
  }
});

class SourceList extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    library: Array<LibrarySource>,
    showHelp: boolean,
    sources: Array<LibrarySource>,
    tutorial: string,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onDownload(source: LibrarySource): void;
    onEditBlacklist(sourceURL: string, blacklist: string): void,
    onPlay(source: LibrarySource, displayed: Array<LibrarySource>): void,
    systemMessage(message: string): void,
    isSelect?: boolean,
    selected?: Array<string>,
    yOffset?: number,
    useWeights?: boolean,
    onUpdateLibrary?(fn: (library: Array<LibrarySource>) => void): void,
    onUpdateScene?(fn: (scene: Scene) => void): void,
    onUpdateSelected?(selected: Array<string>): void,
    savePosition?(): void,
  };

  readonly state = {
    cachePath: null as string,
    isEditing: -1,
    mouseX: null as any,
    mouseY: null as any,
    clipMenu: null as LibrarySource,
    weightMenu: null as LibrarySource,
    blacklistSource: null as string,
    editBlacklist: null as string,
    sourceOptionsType: null as string,
    sourceOptions: null as LibrarySource,
    deleteDialog: null as LibrarySource,
  };

  onSortEnd = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    if (this.props.onUpdateLibrary) {
      this.props.onUpdateLibrary((l) => {
        const oldIndexSource = this.props.sources[oldIndex];
        const newIndexSource = this.props.sources[newIndex];
        const libraryURLs = l.map((s: LibrarySource) => s.url);
        const oldLibraryIndex = libraryURLs.indexOf(oldIndexSource.url);
        const newLibraryIndex = libraryURLs.indexOf(newIndexSource.url);
        arrayMove(l, oldLibraryIndex, newLibraryIndex);
      });
    } else if (this.props.onUpdateScene) {
      this.props.onUpdateScene((s) => {
        arrayMove(s.sources, oldIndex, newIndex);
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
          {this.props.showHelp && (
            <React.Fragment>
              <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.arrowMessage}>
                Add new sources
              </Typography>
              <div className={classes.arrow}>
                →
              </div>
            </React.Fragment>
          )}
        </React.Fragment>

      );
    }

    return (
      <React.Fragment>
        <AutoSizer>
          {({ height, width } : {height: number, width: number}) => (
            <List id="sortable-list" disablePadding
                  className={clsx((this.props.tutorial == SDT.source ||
                    this.props.tutorial == SDT.sourceAvatar ||
                    this.props.tutorial == SDT.sourceTitle ||
                    this.props.tutorial == SDT.sourceTags ||
                    this.props.tutorial == SDT.sourceCount ||
                    this.props.tutorial == SDT.sourceButtons) && classes.backdropTop)}>
              <this.SortableVirtualList
                helperContainer={() => document.getElementById("sortable-list")}
                distance={5}
                height={height}
                width={width}
                onSortEnd={this.onSortEnd.bind(this)}/>
            </List>
          )}
        </AutoSizer>
        <Menu
          id="clip-menu"
          elevation={1}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.mouseY !== null && this.state.mouseX !== null
              ? { top: this.state.mouseY, left: this.state.mouseX }
              : undefined
          }
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          open={!!this.state.clipMenu}
          onClose={this.onCloseDialog.bind(this)}>
          {!!this.state.clipMenu && this.state.clipMenu.clips.map((c, index) =>
            <MenuItem key={c.id}>
              <ListItemText primary={"(" + (index+1) + ") " + getTimestamp(c.start) + " - " + getTimestamp(c.end)} className={classes.marginRight}/>
              <ListItemSecondaryAction>
                <Switch
                  size="small"
                  checked={!this.state.clipMenu.disabledClips || !this.state.clipMenu.disabledClips.includes(c.id)}
                  onChange={this.onToggleClip.bind(this, this.state.clipMenu, c)} />
              </ListItemSecondaryAction>
            </MenuItem>
          )}
        </Menu>
        <Menu
          id="weight-menu"
          classes={{paper: classes.weightMenu}}
          elevation={1}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.mouseY !== null && this.state.mouseX !== null
              ? { top: this.state.mouseY, left: this.state.mouseX }
              : undefined
          }
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          open={!!this.state.weightMenu}
          onClose={this.onCloseDialog.bind(this)}>
          <MenuItem >
            <TextField
              variant="standard"
              margin="dense"
              value={!!this.state.weightMenu ? !!this.state.weightMenu.weight ? this.state.weightMenu.weight : 1 : 1}
              onChange={this.onWeightInput.bind(this)}
              onBlur={this.blurWeight.bind(this)}
              inputProps={{
                min: 1,
                type: 'number',
              }} />
          </MenuItem>
        </Menu>
        {this.state.cachePath != null && (
          <Dialog
            open={true}
            onClose={this.onCloseClean.bind(this)}
            aria-describedby="clean-cache-description">
            <DialogContent>
              <DialogContentText id="clean-cache-description">
                Are you SURE you want to delete <Link
                className={classes.wordWrap}
                href="#"
                onClick={this.openDirectory.bind(this, this.state.cachePath)}
                underline="hover">{this.state.cachePath}</Link> ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.onCloseClean.bind(this)} color="secondary">
                Cancel
              </Button>
              <Button onClick={this.onFinishClean.bind(this)} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <Dialog
          open={this.state.blacklistSource != null}
          onClose={this.onCloseBlacklist.bind(this)}
          aria-describedby="edit-blacklist-description">
          <DialogContent>
            <DialogContentText id="edit-blacklist-description">
              Blacklist ({this.state.blacklistSource})
            </DialogContentText>
            <TextField
              variant="standard"
              fullWidth
              multiline
              helperText="One URL to blacklist per line"
              value={this.state.editBlacklist}
              margin="dense"
              inputProps={{className: classes.blacklistInput}}
              onChange={this.onChangeBlacklist.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseBlacklist.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishBlacklist.bind(this)} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        {this.state.sourceOptionsType == ST.local && (
          <Dialog
            open={this.state.sourceOptionsType == ST.local}
            onClose={this.onCloseSourceOptions.bind(this)}
            aria-describedby="local-options-description">
            <DialogContent>
              <DialogContentText id="local-options-description">
                Directory Options ({this.state.sourceOptions.url})
              </DialogContentText>
              <FormControlLabel
                control={
                  <Tooltip disableInteractive title={"Enable this to treat directories directly inside this one as their own individual sources"}>
                    <Switch checked={this.state.sourceOptions.dirOfSources}
                            onChange={this.onSourceBoolInput.bind(this, 'dirOfSources')}/>
                  </Tooltip>
                }
                label="Treat Inner Directories as Sources"/>
            </DialogContent>
          </Dialog>
        )}
        {this.state.sourceOptionsType == ST.video && (
          <Dialog
            open={this.state.sourceOptionsType == ST.video}
            onClose={this.onCloseSourceOptions.bind(this)}
            aria-describedby="video-options-description">
            <DialogContent>
              <DialogContentText id="video-options-description">
                Video Options ({this.state.sourceOptions.url})
              </DialogContentText>
              <TextField
                variant="standard"
                label="Subtitle File"
                fullWidth
                placeholder="Paste URL Here"
                margin="dense"
                value={this.state.sourceOptions.subtitleFile == null ? "" : this.state.sourceOptions.subtitleFile}
                InputProps={{
                  endAdornment:
                    <InputAdornment position="end">
                      <Tooltip disableInteractive title="Open File">
                        <IconButton onClick={this.onOpenSubtitleFile.bind(this)} size="large">
                          <FolderIcon/>
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>,
                }}
                onChange={this.onSourceInput.bind(this, 'subtitleFile')} />
            </DialogContent>
          </Dialog>
        )}
        {this.state.sourceOptionsType == ST.reddit && (
          <Dialog
            open={this.state.sourceOptionsType == ST.reddit}
            onClose={this.onCloseSourceOptions.bind(this)}
            aria-describedby="reddit-options-description">
            <DialogContent>
              <DialogContentText id="reddit-options-description">
                Reddit Options ({this.state.sourceOptions.url})
              </DialogContentText>
              <FormControl variant="standard" className={classes.fullWidth}>
                <InputLabel>Post Order</InputLabel>
                <Select
                  variant="standard"
                  disabled={this.state.sourceOptions.url.includes("/user/") || this.state.sourceOptions.url.includes("/u/")}
                  value={this.state.sourceOptions.redditFunc == null ? RF.hot : this.state.sourceOptions.redditFunc}
                  onChange={this.onSourceInput.bind(this, 'redditFunc')}>
                  {Object.values(RF).map((rf) =>
                    <MenuItem key={rf} value={rf}>{en.get(rf)}</MenuItem>
                  )}
                </Select>
              </FormControl>
              {this.state.sourceOptions.redditFunc == RF.top && (
                <Select
                  variant="standard"
                  className={classes.fullWidth}
                  disabled={this.state.sourceOptions.url.includes("/user/") || this.state.sourceOptions.url.includes("/u/")}
                  value={this.state.sourceOptions.redditTime == null ? RT.day : this.state.sourceOptions.redditTime}
                  onChange={this.onSourceInput.bind(this, 'redditTime')}>
                  {Object.values(RT).map((rt) =>
                    <MenuItem key={rt} value={rt}>{en.get(rt)}</MenuItem>
                  )}
                </Select>
              )}
              {(this.state.sourceOptions.url.includes("/user/") || this.state.sourceOptions.url.includes("/u/")) &&
              <DialogContentText>This only applies to subreddits, not user profiles</DialogContentText>}
            </DialogContent>
          </Dialog>
        )}
        {this.state.sourceOptionsType == ST.twitter && (
          <Dialog
            open={this.state.sourceOptionsType == ST.twitter}
            onClose={this.onCloseSourceOptions.bind(this)}
            aria-describedby="twitter-options-description">
            <DialogContent>
              <DialogContentText id="twitter-options-description">
                Twitter Options ({this.state.sourceOptions.url})
              </DialogContentText>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={this.state.sourceOptions.includeReplies}
                    onChange={this.onSourceBoolInput.bind(this, 'includeReplies')}/>
                }
                label="Include Replies"/>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={this.state.sourceOptions.includeRetweets}
                    onChange={this.onSourceBoolInput.bind(this, 'includeRetweets')}/>
                }
                label="Include Retweets"/>
            </DialogContent>
          </Dialog>
        )}
        {this.state.deleteDialog != null && (
          <Dialog
            open={true}
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
      </React.Fragment>
    );
  }

  componentDidMount() {
    addEventListener('keydown', this.onKeyDown, false);
    addEventListener('keyup', this.onKeyUp, false);
    this._shiftDown = false;
    this._lastChecked = null;
  }

  componentDidUpdate(props: any) {
    if (this.props.sources.length != props.sources.length &&
      this.props.sources.length > 0 &&
      this.props.sources[0].url == "") {
     this.setState({isEditing: this.props.sources[0].id, urlInput: ""});
    }
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

  onDelete(source: LibrarySource) {
    const fileType = getSourceType(source.url);
    if ((fileType == ST.local || fileType == ST.video || fileType == ST.playlist || fileType == ST.list) && existsSync(source.url)) {
      this.setState({deleteDialog: source});
    }
  }

  onCloseDeleteDialog() {
    this.setState({deleteDialog: null});
  }

  onFinishDelete() {
    const fileType = getSourceType(this.state.deleteDialog.url);
    if (fileType == ST.local) {
      rimraf.sync(this.state.deleteDialog.url);
    } else if (fileType == ST.video || fileType == ST.playlist || fileType == ST.list) {
      unlinkSync(this.state.deleteDialog.url);
    }
    this.onRemove(this.state.deleteDialog);
    this.onCloseDeleteDialog();
  }

  onRemove(source: LibrarySource) {
    if (this.props.onUpdateScene) {
      this.props.onUpdateScene((s) => s.sources = s.sources.filter((s) => s.id != source.id));
    } else if (this.props.onUpdateLibrary) {
      this.props.onUpdateSelected(this.props.selected.filter((url) => url != source.url));
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

  blurWeight(e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && this.state.weightMenu.weight < min) {
      this.changeWeight(min);
    } else if (max && this.state.weightMenu.weight > max) {
      this.changeWeight(max);
    }
  }

  onWeightInput(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeWeight(input.value === '' ? 1 : Number(input.value));
  }

  changeWeight(intString: number) {
    this.props.onUpdateScene((scene) => {
      const source = scene.sources.find((ls) => ls.id == this.state.weightMenu.id);
      source.weight = intString;
      this.setState({weightMenu: source});
    });
  }

  onToggleClip(s: LibrarySource, c: Clip) {
    this.props.onUpdateScene((scene) => {
      const source = scene.sources.find((ls) => ls.id == s.id);
      if (!source.disabledClips) {
        source.disabledClips = [c.id];
      } else if (source.disabledClips.includes(c.id)) {
        source.disabledClips = source.disabledClips.filter((d: number) => d != c.id);
      } else {
        source.disabledClips = source.disabledClips.concat(c.id);
      }
      this.setState({clipMenu: source});
    });
  }

  onStartEdit(id: number) {
    this.setState({isEditing: id});
  }

  onEndEdit(newURL: string) {
    if (this.props.onUpdateScene) {
      this.props.onUpdateScene((s) => {
        const editSource = s.sources.find((s) => s.id == this.state.isEditing);
        const librarySource = this.props.library.find((s) => s.url == newURL);
        const sourceChanged = editSource.url != newURL;
        editSource.offline = sourceChanged ? false: editSource.offline;
        editSource.lastCheck = sourceChanged ? null : editSource.lastCheck;
        editSource.url = newURL;
        editSource.tags = librarySource && librarySource.tags ? librarySource.tags : editSource.tags;
        editSource.clips = librarySource && librarySource.clips ? librarySource.clips : editSource.clips;
        editSource.blacklist = librarySource && librarySource.blacklist ? librarySource.blacklist : editSource.blacklist;
        editSource.count = librarySource ? librarySource.count : sourceChanged ? 0 : editSource.count;
        editSource.countComplete = librarySource ? librarySource.countComplete : sourceChanged ? false : editSource.countComplete;
        editSource.duration = librarySource ? librarySource.duration : sourceChanged ? null : editSource.duration;
        editSource.resolution = librarySource ? librarySource.resolution : sourceChanged ? null : editSource.resolution;

        const newSources = Array<LibrarySource>();
        for (let source of s.sources) {
          if (/^\s*$/.exec(source.url) == null) {
            if (!newSources.map((s) => s.url).includes(source.url)) {
              newSources.push(source);
            } else {
              for (let existingSource of newSources) {
                if (existingSource.url == source.url) {
                  if (existingSource.id > source.id) {
                    newSources[newSources.indexOf(existingSource)] = source;
                  }
                  break;
                }
              }
            }
          }
        }
        s.sources = newSources;
      });
    } else if (this.props.onUpdateLibrary) {
      this.props.onUpdateLibrary((l) => {
        const editSource = l.find((s) => s.id == this.state.isEditing);
        const sourceChanged = editSource.url != newURL;
        editSource.offline = sourceChanged ? false : editSource.offline;
        editSource.lastCheck = sourceChanged ? null : editSource.lastCheck;
        editSource.url = newURL;
        editSource.count = sourceChanged ? 0 : editSource.count;
        editSource.countComplete = sourceChanged ? false : editSource.countComplete;
        editSource.duration = sourceChanged ? null : editSource.duration;
        editSource.resolution = sourceChanged ? null : editSource.resolution;

        const newSources = Array<LibrarySource>();
        for (let source of l) {
          if (/^\s*$/.exec(source.url) == null) {
            if (!newSources.map((s) => s.url).includes(source.url)) {
              newSources.push(source);
            } else {
              for (let existingSource of newSources) {
                if (existingSource.url == source.url) {
                  if (existingSource.id > source.id) {
                    newSources[newSources.indexOf(existingSource)] = source;
                  }
                  break;
                }
              }
            }
          }
        }
        l.splice(0, l.length);
        Array.prototype.push.apply(l, [].concat(newSources));
      });
    }
    this.setState({isEditing: -1});
  }

  onClean(source: LibrarySource) {
    const sourceURL = source.url;
    const fileType = getSourceType(sourceURL);
    if (fileType != ST.local) {
      let cachePath;
      if (fileType == ST.video || fileType == ST.playlist) {
        cachePath = getCachePath(sourceURL, this.props.config) + getFileName(sourceURL);
      } else {
        cachePath = getCachePath(sourceURL, this.props.config);
      }
      this.setState({cachePath: cachePath});
    }
  }

  onFinishClean() {
    rimraf.sync(this.state.cachePath);
    this.onCloseClean();
  }

  onCloseClean() {
    this.setState({cachePath: null});
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

  onOpenClipMenu(source: LibrarySource, e: MouseEvent) {
    this.setState({mouseX: e.clientX, mouseY: e.clientY, clipMenu: source});
  }

  onOpenWeightMenu(source: LibrarySource, e: MouseEvent) {
    this.setState({mouseX: e.clientX, mouseY: e.clientY, weightMenu: source});
  }

  onCloseDialog() {
    this.setState({menuAnchorEl: null, clipMenu: null, weightMenu: null});
  }

  onCloseBlacklist() {
    this.setState({blacklistSource: null, editBlacklist: null});
  }

  onFinishBlacklist() {
    this.props.onEditBlacklist(this.state.blacklistSource, this.state.editBlacklist);
    this.onCloseBlacklist();
  }

  onChangeBlacklist(e: MouseEvent) {
    this.setState({editBlacklist: (e.currentTarget as HTMLInputElement).value});
  }

  onEditBlacklist(source: LibrarySource) {
    this.setState({blacklistSource: source.url, editBlacklist: source.blacklist.join("\n")});
  }

  onCloseSourceOptions() {
    this.setState({sourceOptions: null, sourceOptionsType: null});
  }

  onSourceOptions(source: LibrarySource) {
    this.setState({sourceOptions: source, sourceOptionsType: getSourceType(source.url)});
  }

  onOpenSubtitleFile() {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'Web Video Text Tracks (WebVTT)', extensions: ['vtt']}], properties: ['openFile']});
    if (!result || !result.length) return;
    this.changeKey('subtitleFile', result[0]);
  }

  onSourceInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value);
  }

  onSourceBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  changeKey(key: string, value: any) {
    if (this.props.onUpdateScene) {
      this.props.onUpdateScene((s) => {
        const source = s.sources.find((s) => s.url == this.state.sourceOptions.url);
        (source as any)[key] = value;
        this.setState({sourceOptions: source});
      });
    } else if (this.props.onUpdateLibrary) {
      this.props.onUpdateLibrary((l) => {
        const source = l.find((s) => s.url == this.state.sourceOptions.url);
        (source as any)[key] = value;
        this.setState({sourceOptions: source});
      });
    }
  }

  SortableVirtualList = sortableContainer(this.VirtualList.bind(this));

  VirtualList(props: any) {
    const { height, width } = props;

    return (
      <FixedSizeList
        height={this.props.tutorial ? 60 : height}
        width={width}
        initialScrollOffset={this.props.yOffset ? this.props.yOffset : 0}
        itemSize={56}
        itemCount={this.props.tutorial ? 1 : this.props.sources.length}
        itemData={this.props.tutorial ? [this.props.sources[0]] : this.props.sources}
        itemKey={(index: number, data: any) => data[index].id}
        overscanCount={10}>
        {this.Row.bind(this)}
      </FixedSizeList>
    );
  }

  SortableItem = sortableElement(({value}: {value: {index: number, style: any, data: Array<any>}}) => {
    const index = value.index;
    const source: LibrarySource = value.data[index];
    return (
      <SourceListItem
        key={source.id}
        checked={this.props.isSelect ? this.props.selected.includes(source.url) : false}
        config={this.props.config}
        index={index}
        isEditing={this.state.isEditing}
        isLibrary={!!this.props.onUpdateLibrary}
        isSelect={this.props.isSelect}
        source={source}
        sources={this.props.sources}
        style={value.style}
        tutorial={this.props.tutorial}
        useWeights={this.props.useWeights}
        onClean={this.onClean.bind(this)}
        onClearBlacklist={this.props.onClearBlacklist.bind(this)}
        onClip={this.props.onClip.bind(this)}
        onDelete={this.onDelete.bind(this)}
        onDownload={this.props.onDownload.bind(this)}
        onEditBlacklist={this.onEditBlacklist.bind(this)}
        onEndEdit={this.onEndEdit.bind(this)}
        onOpenClipMenu={this.onOpenClipMenu.bind(this)}
        onOpenWeightMenu={this.onOpenWeightMenu.bind(this)}
        onPlay={this.props.onPlay.bind(this)}
        onRemove={this.onRemove.bind(this)}
        onSourceOptions={this.onSourceOptions.bind(this)}
        onStartEdit={this.onStartEdit.bind(this)}
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

(SourceList as any).displayName="SourceList";
export default withStyles(styles)(SourceList as any);