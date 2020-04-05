import * as React from "react";
import rimraf from "rimraf";
import {remote} from "electron";
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import clsx from "clsx";

import {
  Button, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, IconButton,
  InputAdornment, InputLabel, Link, List, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Select, Switch,
  TextField, Theme, Tooltip, Typography, withStyles
} from "@material-ui/core";

import FolderIcon from "@material-ui/icons/Folder";

import {arrayMove, getCachePath, getFileName, getSourceType, getTimestamp, urlToPath} from "../../data/utils";
import {RF, RT, SDT, ST} from "../../data/const";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import SourceListItem from "./SourceListItem";
import Clip from "../../data/Clip";
import en from "../../data/en";

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
});

class SourceList extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    isLibrary: boolean
    library: Array<LibrarySource>,
    sources: Array<LibrarySource>,
    tutorial: string,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onEditBlacklist(sourceURL: string, blacklist: string): void,
    onPlay(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onUpdateSources(sources: Array<LibrarySource>): void,
    systemMessage(message: string): void,
    isSelect?: boolean,
    selected?: Array<string>,
    yOffset?: number,
    onUpdateSelected?(selected: Array<string>): void,
    savePosition?(): void,
  };

  readonly state = {
    cachePath: null as string,
    isEditing: -1,
    mouseX: null as any,
    mouseY: null as any,
    clipMenu: null as LibrarySource,
    blacklistSource: null as string,
    editBlacklist: null as string,
    sourceOptionsType: null as string,
    sourceOptions: null as LibrarySource,
  };

  onSortEnd = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    if (this.props.isLibrary) {
      const oldIndexSource = this.props.sources[oldIndex];
      const newIndexSource = this.props.sources[newIndex];
      const libraryURLs = this.props.library.map((s) => s.url);
      const oldLibraryIndex = libraryURLs.indexOf(oldIndexSource.url);
      const newLibraryIndex = libraryURLs.indexOf(newIndexSource.url);
      let newLibrary = Array.from(this.props.library);
      arrayMove(newLibrary, oldLibraryIndex, newLibraryIndex);
      this.props.onUpdateSources(newLibrary);
    } else {
      let newSources = Array.from(this.props.sources);
      arrayMove(newSources, oldIndex, newIndex);
      this.props.onUpdateSources(newSources);
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
        <Dialog
          open={this.state.cachePath != null}
          onClose={this.onCloseClean.bind(this)}
          aria-describedby="clean-cache-description">
          <DialogContent>
            <DialogContentText id="clean-cache-description">
              Are you SURE you want to delete <Link href="#" onClick={this.openDirectory.bind(this, this.state.cachePath)}>{this.state.cachePath}</Link> ?
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
        <Dialog
          open={this.state.blacklistSource != null}
          onClose={this.onCloseBlacklist.bind(this)}
          aria-describedby="edit-blacklist-description">
          <DialogContent>
            <DialogContentText id="edit-blacklist-description">
              Blacklist ({this.state.blacklistSource})
            </DialogContentText>
            <TextField
              fullWidth
              multiline
              helperText="One URL to blacklist per line"
              value={this.state.editBlacklist}
              margin="dense"
              inputProps={{className: classes.blacklistInput}}
              onChange={this.onChangeBlacklist.bind(this)}
            />
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
                label="Subtitle File"
                fullWidth
                placeholder="Paste URL Here"
                margin="dense"
                value={this.state.sourceOptions.subtitleFile == null ? "" : this.state.sourceOptions.subtitleFile}
                InputProps={{
                  endAdornment:
                    <InputAdornment position="end">
                      <Tooltip title="Open File">
                        <IconButton
                          onClick={this.onOpenSubtitleFile.bind(this)}>
                          <FolderIcon/>
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>,
                }}
                onChange={this.onChangSubtitleFile.bind(this)}
              />
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
              <FormControl className={classes.fullWidth}>
                <InputLabel>Post Order</InputLabel>
                <Select
                  disabled={this.state.sourceOptions.url.includes("/user/") || this.state.sourceOptions.url.includes("/u/")}
                  value={this.state.sourceOptions.redditFunc == null ? RF.hot : this.state.sourceOptions.redditFunc}
                  onChange={this.onChangeRedditFunc.bind(this)}>
                  {Object.values(RF).map((rf) =>
                    <MenuItem key={rf} value={rf}>{en.get(rf)}</MenuItem>
                  )}
                </Select>
              </FormControl>
              {this.state.sourceOptions.redditFunc == RF.top && (
                <Select
                  className={classes.fullWidth}
                  disabled={this.state.sourceOptions.url.includes("/user/") || this.state.sourceOptions.url.includes("/u/")}
                  value={this.state.sourceOptions.redditTime == null ? RT.day : this.state.sourceOptions.redditTime}
                  onChange={this.onChangeRedditTime.bind(this)}>
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
      </React.Fragment>
    )
  }

  componentDidUpdate(props: any) {
    if (this.props.sources.length != props.sources.length &&
      this.props.sources.length > 0 &&
      this.props.sources[0].url == "") {
     this.setState({isEditing: this.props.sources[0].id, urlInput: ""});
    }
  }

  componentWillUnmount() {
    this.savePosition();
  }

  savePosition() {
    if (this.props.savePosition) {
      this.props.savePosition();
    }
  }

  onRemove(source: LibrarySource) {
    const oldSources = this.props.isLibrary ? this.props.library : this.props.sources;
    this.props.onUpdateSources(oldSources.filter((s) => s.id != source.id));
  }

  onToggleSelect(e: MouseEvent) {
    const source = (e.currentTarget as HTMLInputElement).value;
    let newSelected = Array.from(this.props.selected);
    if (newSelected.includes(source)) {
      newSelected.splice(newSelected.indexOf(source), 1)
    } else {
      newSelected.push(source);
    }
    this.props.onUpdateSelected(newSelected);
  }

  onToggleClip(s: LibrarySource, c: Clip) {
    const oldSources = this.props.sources;
    const source = oldSources.find((ls) => ls.id == s.id);
    if (!source.disabledClips) {
      source.disabledClips = [c.id];
    } else if (source.disabledClips.includes(c.id)) {
      source.disabledClips = source.disabledClips.filter((d) => d != c.id);
    } else {
      source.disabledClips = source.disabledClips.concat(c.id);
    }
    this.props.onUpdateSources(oldSources);
  }

  onStartEdit(id: number) {
    this.setState({isEditing: id});
  }

  onEndEdit(newURL: string) {
    const newSources = Array<LibrarySource>();
    let oldSources = this.props.isLibrary ? this.props.library : this.props.sources;
    oldSources = oldSources.map((source: LibrarySource) => {
      const librarySource = this.props.isLibrary ? null : this.props.library.find((s) => s.url == newURL);
      if (source.id == this.state.isEditing) {
        const sourceChanged = source.url != newURL;
        source.offline = sourceChanged ? false: source.offline;
        source.lastCheck = sourceChanged ? null : source.lastCheck;
        source.url = newURL;
        source.tags = librarySource && librarySource.tags ? librarySource.tags : source.tags;
        source.clips = librarySource && librarySource.clips ? librarySource.clips : source.clips;
        source.blacklist = librarySource && librarySource.blacklist ? librarySource.blacklist : source.blacklist;
        source.count = librarySource ? librarySource.count : sourceChanged ? 0 : source.count;
        source.countComplete = librarySource ? librarySource.countComplete : sourceChanged ? false : source.countComplete;
      }
      return source;
    });
    for (let source of oldSources) {
      if (source.url != "") {
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
    this.props.onUpdateSources(newSources);
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

  onCloseDialog() {
    this.setState({menuAnchorEl: null, clipMenu: false});
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
    this.onSetSubtitleFile(result[0]);
  }

  onChangSubtitleFile(e: MouseEvent) {
    this.onSetSubtitleFile((e.target as HTMLInputElement).value);
  }

  onSetSubtitleFile(subtitleFile: string) {
    let sources = this.props.sources;
    let source = sources.find((s) => s.url == this.state.sourceOptions.url);
    source.subtitleFile = subtitleFile;
    this.props.onUpdateSources(sources);
  }

  onChangeRedditFunc(e: MouseEvent) {
    let sources = this.props.sources;
    let source = sources.find((s) => s.url == this.state.sourceOptions.url);
    source.redditFunc = (e.target as HTMLInputElement).value;
    this.props.onUpdateSources(sources);
  }

  onChangeRedditTime(e: MouseEvent) {
    let sources = this.props.sources;
    let source = sources.find((s) => s.url == this.state.sourceOptions.url);
    source.redditTime = (e.target as HTMLInputElement).value;
    this.props.onUpdateSources(sources);
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
        isLibrary={this.props.isLibrary}
        isSelect={this.props.isSelect}
        source={source}
        sources={this.props.sources}
        style={value.style}
        tutorial={this.props.tutorial}
        onClean={this.onClean.bind(this)}
        onClearBlacklist={this.props.onClearBlacklist.bind(this)}
        onClip={this.props.onClip.bind(this)}
        onEditBlacklist={this.onEditBlacklist.bind(this)}
        onEndEdit={this.onEndEdit.bind(this)}
        onOpenClipMenu={this.onOpenClipMenu.bind(this)}
        onPlay={this.props.onPlay.bind(this)}
        onRemove={this.onRemove.bind(this)}
        onSourceOptions={this.onSourceOptions.bind(this)}
        onStartEdit={this.onStartEdit.bind(this)}
        onToggleSelect={this.onToggleSelect.bind(this)}
        onToggleClip={this.onToggleClip.bind(this)}
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

export default withStyles(styles)(SourceList as any);