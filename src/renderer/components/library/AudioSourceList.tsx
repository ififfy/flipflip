import * as React from "react";
import {unlinkSync} from "fs";
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  List,
  Theme,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import {arrayMove} from "../../data/utils";
import Audio from "../../data/Audio";
import Playlist from "../../data/Playlist";
import AudioSourceListItem from "./AudioSourceListItem";
import AudioEdit from "./AudioEdit";
import AudioOptions from "./AudioOptions";

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
  }
});

class AudioSourceList extends React.Component {
  readonly props: {
    classes: any,
    cachePath: string,
    isSelect: boolean,
    selected: Array<string>,
    showHelp: boolean,
    sources: Array<Audio>,
    yOffset: number,
    tutorial: string,
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
    lastSelected: null as number,
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
          {this.props.showHelp && (
            <React.Fragment>
              <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.arrowMessage}>
                Add new tracks
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
            <List id="sortable-list" disablePadding onClick={this.clearLastSelected.bind(this)}>
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
        {this.state.sourceOptions != null && (
          <AudioOptions
            audio={this.state.sourceOptions}
            onCancel={this.onCloseSourceOptions.bind(this)}
            onFinishEdit={this.onFinishSourceOptions.bind(this)}
            />
        )}
        {this.state.sourceEdit != null && (
          <AudioEdit
            audio={this.state.sourceEdit}
            cachePath={this.props.cachePath}
            title={"Edit song info"}
            allowSuggestion
            onCancel={this.onCloseSourceEditDialog.bind(this)}
            onFinishEdit={this.onFinishSourceEdit.bind(this)}/>
        )}
      </React.Fragment>
    )
  }

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

  shouldComponentUpdate(props: any, state: any): boolean {
    return this.props.isSelect != props.isSelect ||
      this.props.playlist != props.playlist ||
      this.props.selected != props.selected ||
      this.props.sources != props.sources ||
      this.props.tutorial != props.tutorial ||
      this.state.sourceOptions != state.sourceOptions ||
      this.state.deleteDialog != state.deleteDialog ||
      this.state.sourceEdit != state.sourceEdit ||
      this.state.lastSelected != state.lastSelected;
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
      this.props.onUpdateSelected(this.props.selected.filter((url) => url != source.url));
      this.props.onUpdateLibrary((l) => {
        l.forEach((s, index) => {
          if (s.id == source.id) {
            l.splice(index, 1);
            return;
          }
        });
      });
      this.props.onUpdatePlaylists((pl) => {
        pl.forEach((playlist, pIndex) => {
          playlist.audios.forEach((a, index) => {
            if (a == source.id) {
              playlist.audios.splice(index, 1);
              return;
            }
          });
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

  clearLastSelected() {
    if (!this.state.sourceEdit && !this.state.sourceOptions) {
      this.setState({lastSelected: null});
    }
  }

  onEditSource(audio: Audio, e: MouseEvent) {
    e.stopPropagation();
    this.setState({sourceEdit: new Audio(audio), lastSelected: audio.id});
  }

  onCloseSourceEditDialog() {
    this.setState({sourceEdit: null});
  }

  onSourceOptions(source: Audio, e: MouseEvent) {
    e.stopPropagation();
    this.setState({sourceOptions: source, lastSelected: source.id});
  }

  onCloseSourceOptions() {
    this.setState({sourceOptions: null});
  }

  onCloseDialog() {
    this.setState({menuAnchorEl: null, clipMenu: null});
  }

  onFinishSourceEdit(newAudio: Audio) {
    this.props.onUpdateLibrary((a) => {
      let editSource = a.find((a) => a.id == this.state.sourceEdit.id);
      Object.assign(editSource, newAudio);
    })
    this.onCloseSourceEditDialog();
  }

  onFinishSourceOptions(newAudio: Audio) {
    this.props.onUpdateLibrary((a) => {
      let editSource = a.find((a) => a.id == this.state.sourceOptions.id);
      Object.assign(editSource, newAudio);
    })
    this.onCloseSourceOptions();
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
        lastSelected={source.id == this.state.lastSelected}
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

(AudioSourceList as any).displayName="AudioSourceList";
export default withStyles(styles)(AudioSourceList as any);