import * as React from "react";
import rimraf from "rimraf";
import {remote} from "electron";
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import clsx from "clsx";

import {
  Button, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, Link, List, ListItemSecondaryAction,
  ListItemText, Menu, MenuItem, Switch, Theme, Typography, withStyles
} from "@material-ui/core";

import {arrayMove, getCachePath, getFileName, getSourceType, getTimestamp, urlToPath} from "../../data/utils";
import {SDT, ST} from "../../data/const";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import SourceListItem from "./SourceListItem";
import Clip from "../../data/Clip";

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
  }
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
        source.offline = false;
        source.lastCheck = null;
        source.url = newURL;
        source.tags = librarySource && librarySource.tags ? librarySource.tags : source.tags;
        source.clips = librarySource && librarySource.clips ? librarySource.clips : source.clips;
        source.blacklist = librarySource && librarySource.blacklist ? librarySource.blacklist : source.blacklist;
        source.count = librarySource ? librarySource.count : 0;
        source.countComplete = librarySource ? librarySource.countComplete : false;
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
        onEndEdit={this.onEndEdit.bind(this)}
        onOpenClipMenu={this.onOpenClipMenu.bind(this)}
        onPlay={this.props.onPlay.bind(this)}
        onRemove={this.onRemove.bind(this)}
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