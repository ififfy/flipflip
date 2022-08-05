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
import CaptionScript from "../../data/CaptionScript";
import ScriptSourceListItem from "./ScriptSourceListItem";
import SceneSelect from "../configGroups/SceneSelect";
import Scene from "../../data/Scene";
import ScriptOptions from "./ScriptOptions";
import {SP} from "../../data/const";

const styles = (theme: Theme) => createStyles({
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%',
  },
  emptyMessage2: {
    textAlign: 'center',
  },
  marginRight: {
    marginRight: theme.spacing(1),
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
  scenePick: {
    height: 410,
  },
});

class ScriptSourceList extends React.Component {
  readonly props: {
    classes: any,
    library: Array<CaptionScript>,
    scenes: Array<Scene>,
    showHelp: boolean,
    sources: Array<CaptionScript>,
    tutorial: string,
    onEditScript(source: CaptionScript): void,
    onPlay(source: CaptionScript, sceneID: number, displayed: Array<CaptionScript>): void,
    onUpdateLibrary(fn: (library: Array<CaptionScript>) => void): void,
    systemMessage(message: string): void,
    specialMode?: string,
    selected?: Array<string>,
    yOffset?: number,
    onUpdateSelected?(selected: Array<string>): void,
    savePosition?(): void,
  };

  readonly state = {
    sourceOptions: null as CaptionScript,
    lastSelected: null as number,
    isEditing: -1,
    mouseX: null as any,
    mouseY: null as any,
    deleteDialog: null as CaptionScript,
    beginPlay: null as CaptionScript,
    playWithScene: null as number,
  };

  onSortEnd = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    this.props.onUpdateLibrary((l) => {
      const oldIndexSource = this.props.sources[oldIndex];
      const newIndexSource = this.props.sources[newIndex];
      const libraryURLs = l.map((s: CaptionScript) => s.url);
      const oldLibraryIndex = libraryURLs.indexOf(oldIndexSource.url);
      const newLibraryIndex = libraryURLs.indexOf(newIndexSource.url);
      arrayMove(l, oldLibraryIndex, newLibraryIndex);
    });
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
                Add new scripts
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
          <ScriptOptions
            script={this.state.sourceOptions}
            onCancel={this.onCloseSourceOptions.bind(this)}
            onFinishEdit={this.onFinishSourceOptions.bind(this)}
          />
        )}
        {this.state.beginPlay != null && (
          <Dialog
            open={true}
            onClose={this.onClosePlayDialog.bind(this)}
            aria-describedby="play-description">
            <DialogContent className={classes.scenePick}>
              <DialogContentText id="play-description">
                Choose a scene to test with:
              </DialogContentText>
              <SceneSelect
                autoFocus
                menuIsOpen
                allScenes={this.props.scenes}
                value={this.state.playWithScene}
                getSceneName={this.getSceneName.bind(this)}
                onChange={this.onChangeScene.bind(this)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.onClosePlayDialog.bind(this)} color="secondary">
                Cancel
              </Button>
              <Button disabled={this.state.playWithScene == null || this.state.playWithScene == 0}
                      onClick={this.onFinishPlay.bind(this)} color="primary">
                Play
              </Button>
            </DialogActions>
          </Dialog>
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

  clearLastSelected() {
    if (!this.state.sourceOptions) {
      this.setState({lastSelected: null});
    }
  }

  onSourceOptions(source: CaptionScript, e: MouseEvent) {
    e.stopPropagation();
    this.setState({sourceOptions: source, lastSelected: source.id});
  }

  onCloseSourceOptions() {
    this.setState({sourceOptions: null});
  }

  onFinishSourceOptions(newScript: CaptionScript) {
    this.props.onUpdateLibrary((a) => {
      let editSource = a.find((a) => a.id == this.state.sourceOptions.id);
      Object.assign(editSource, newScript);
    })
    this.onCloseSourceOptions();
  }

  onDelete(source: CaptionScript) {
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

  onRemove(source: CaptionScript) {
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

  _lastChecked: string = null;
  onToggleSelect(e: MouseEvent) {
    const source = (e.currentTarget as HTMLInputElement).value;
    if (this.props.specialMode == SP.selectSingle) {
      this.props.onUpdateSelected([source]);
    } else {
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
  }

  onStartEdit(id: number) {
    this.setState({isEditing: id});
  }

  onEndEdit(newURL: string) {
    this.props.onUpdateLibrary((l) => {
      const editSource = l.find((s) => s.id == this.state.isEditing);
      editSource.url = newURL;

      const newSources = Array<CaptionScript>();
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
    this.setState({isEditing: -1});
  }

  onCloseDialog() {
    this.setState({menuAnchorEl: null, clipMenu: null});
  }

  onPlay(source: CaptionScript) {
    this.setState({beginPlay: source, playWithScene: 0});
  }

  onClosePlayDialog() {
    this.setState({beginPlay: null, playWithScene: null});
  }

  onFinishPlay() {
    this.props.savePosition();
    try {
      this.props.onPlay(this.state.beginPlay, this.state.playWithScene, this.props.sources);
    } catch (e) {
      this.props.systemMessage("The source " + this.state.beginPlay.url + " isn't in your Library");
    }
  }

  onChangeScene(sceneID: string) {
    this.setState({playWithScene: sceneID});
  }

  getSceneName(id: string): string {
    if (id === "0") return "None";
    return this.props.scenes.find((s) => s.id.toString() === id).name;
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
        itemKey={(index: number, data: any) => data[index].id}
        overscanCount={10}>
        {this.Row.bind(this)}
      </FixedSizeList>
    );
  }

  SortableItem = sortableElement(({value}: {value: {index: number, style: any, data: Array<any>}}) => {
    const index = value.index;
    const source: CaptionScript = value.data[index];
    return (
      <ScriptSourceListItem
        key={index}
        checked={!!this.props.specialMode ? this.props.selected.includes(source.url) : false}
        index={index}
        isEditing={this.state.isEditing}
        specialMode={this.props.specialMode}
        lastSelected={source.id == this.state.lastSelected}
        source={source}
        sources={this.props.sources}
        style={value.style}
        tutorial={this.props.tutorial}
        onDelete={this.onDelete.bind(this)}
        onEditScript={this.props.onEditScript}
        onEndEdit={this.onEndEdit.bind(this)}
        onPlay={this.onPlay.bind(this)}
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

(ScriptSourceList as any).displayName="ScriptSourceList";
export default withStyles(styles)(ScriptSourceList as any);