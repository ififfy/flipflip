import * as React from "react";
import clsx from "clsx";
import rimraf from "rimraf";
import {remote} from "electron";
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";

import {
  Avatar, Box, Button, Chip, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Link,
  List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, SvgIcon, TextField, Theme, Typography,
  withStyles
} from "@material-ui/core";

import DeleteIcon from '@material-ui/icons/Delete';

import {arrayMove, getCachePath, getFileName, getSourceType, urlToPath} from "../../data/utils";
import {ST} from "../../data/const";
import Config from "../../data/Config"
import LibrarySource from "../library/LibrarySource";
import Tag from "../library/Tag";
import SourceIcon from "./SourceIcon";

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25vh',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
  },
  deleteIcon: {
    color: theme.palette.error.contrastText,
  },
  oddChild: {
    backgroundColor: (theme.palette.primary as any)["100"],
  },
  evenChild: {
    backgroundColor: (theme.palette.primary as any)["50"],
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
  countChip: {
    marginRight: theme.spacing(1),
  },
  urlField: {
    width: '100%',
    margin: 0,
  },
});

class SourceList extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    sources: Array<LibrarySource>,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource): void,
    onUpdateSources(sources: Array<LibrarySource>): void,
  };

  readonly state = {
    cachePath: null as string,
    isEditing: -1,
  };

  onSortEnd = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    let newSources = Array.from(this.props.sources);
    arrayMove(newSources, oldIndex, newIndex);
    this.props.onUpdateSources(newSources);
  };

  render() {
    const classes = this.props.classes;

    return (
      <AutoSizer>
        {({ height, width } : {height: number, width: number}) => (
          <Box>
            {this.props.sources.length == 0 && (
              <Typography component="h1" variant="h2" color="inherit" noWrap className={classes.emptyMessage}>
                No Sources
              </Typography>
            )}

            <List id="sortable-list" disablePadding>
              <this.SortableVirtualList
                helperContainer={() => document.getElementById("sortable-list")}
                distance={5}
                height={height}
                width={width}
                onSortEnd={this.onSortEnd.bind(this)}/>
            </List>

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
          </Box>
        )}
      </AutoSizer>
    )
  }

  componentDidUpdate(props: any) {
    if (this.props.sources.length != props.sources.length &&
      this.props.sources.length > 0 &&
      this.props.sources[0].url == "") {
     this.setState({isEditing: this.props.sources[0].id});
    }
  }

  onRemove(source: LibrarySource) {
    this.props.onUpdateSources(this.props.sources.filter((s) => s.id != source.id));
  }

  onEdit(sourceID: number, e: Event) {
    e.preventDefault();
    this.setState({isEditing: sourceID});
    // If user left input blank, remove it from list of sources
    // Also prevent user from inputing duplicate source
    // If new entry is a duplicate, make sure we remove the new entry
    const newSources = Array<LibrarySource>();
    for (let source of this.props.sources) {
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
  }

  onEditSource(sourceID: number, e: React.FormEvent<HTMLInputElement>) {
    this.props.onUpdateSources(this.props.sources.map(
      function map(source: LibrarySource) {
        if (source.id == sourceID) {
          source.offline = false;
          source.count = 0;
          source.countComplete = false;
          source.lastCheck = null;
          source.url = e.currentTarget.value;
        }
        return source;
      })
    );
  }

  onClean(source: LibrarySource) {
    const sourceURL = source.url;
    const fileType = getSourceType(sourceURL);
    if (fileType != ST.local) {
      let cachePath;
      if (fileType == ST.video) {
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
      remote.shell.openExternal(cachePath);
    } else {
      remote.shell.openExternal(urlToPath(cachePath));
    }
  }

  SortableVirtualList = sortableContainer(this.VirtualList.bind(this));

  VirtualList(props: any) {
    const { height, width } = props;

    // TODO Make itemSize based on theme.spacing(7)
    return (
      <FixedSizeList
        height={height}
        width={width}
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
    const classes = this.props.classes;
    const index = value.index;
    const source = value.data[index];
    return (
      <div key={source.id} style={value.style} className={index % 2 == 0 ? classes.evenChild : classes.oddChild}>
        <ListItem className={classes.source}>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <SourceIcon url={source.url}/>
            </Avatar>
          </ListItemAvatar>

          <ListItemText classes={{primary: classes.root}}>
            {this.state.isEditing == source.id && (
              <form onSubmit={this.onEdit.bind(this, -1)} className={classes.urlField}>
                <TextField
                  autoFocus
                  fullWidth
                  value={source.url}
                  margin="none"
                  className={classes.urlField}
                  onBlur={this.onEdit.bind(this, -1)}
                  onChange={this.onEditSource.bind(this, source.id)}/>
              </form>
            )}
            {this.state.isEditing != source.id && (
              <React.Fragment>
                <div onClick={this.onEdit.bind(this, source.id)}>
                  {source.url}
                </div>
                {source.tags && source.tags.map((tag: Tag) =>
                  <Chip
                    key={tag.id}
                    className={classes.actionButton}
                    label={tag.name}
                    color="primary"
                    size="small"
                    variant="outlined"/>
                )}
              </React.Fragment>
            )}
          </ListItemText>

          {this.state.isEditing != source.id && (
            <ListItemSecondaryAction className={classes.source}>
              {source.count > 0 && (
                <Chip
                  className={classes.countChip}
                  label={`${source.count}${source.countComplete ? '' : '+'}`}
                  color="primary"
                  size="small"/>
              )}
              {getSourceType(source.url) == ST.video && (
                <IconButton
                  onClick={this.props.onClip.bind(this, source)}
                  className={classes.actionButton}
                  edge="end"
                  size="small"
                  aria-label="clip">
                  <SvgIcon>
                    <path d="M11 21H7V19H11V21M15.5 19H17V21H13V19H13.2L11.8 12.9L9.3 13.5C9.2 14 9 14.4 8.8
                          14.8C7.9 16.3 6 16.7 4.5 15.8C3 14.9 2.6 13 3.5 11.5C4.4 10 6.3 9.6 7.8 10.5C8.2 10.7 8.5
                          11.1 8.7 11.4L11.2 10.8L10.6 8.3C10.2 8.2 9.8 8 9.4 7.8C8 6.9 7.5 5 8.4 3.5C9.3 2 11.2
                          1.6 12.7 2.5C14.2 3.4 14.6 5.3 13.7 6.8C13.5 7.2 13.1 7.5 12.8 7.7L15.5 19M7 11.8C6.3
                          11.3 5.3 11.6 4.8 12.3C4.3 13 4.6 14 5.3 14.4C6 14.9 7 14.7 7.5 13.9C7.9 13.2 7.7 12.2 7
                          11.8M12.4 6C12.9 5.3 12.6 4.3 11.9 3.8C11.2 3.3 10.2 3.6 9.7 4.3C9.3 5 9.5 6 10.3 6.5C11
                          6.9 12 6.7 12.4 6M12.8 11.3C12.6 11.2 12.4 11.2 12.3 11.4C12.2 11.6 12.2 11.8 12.4
                          11.9C12.6 12 12.8 12 12.9 11.8C13.1 11.6 13 11.4 12.8 11.3M21 8.5L14.5 10L15 12.2L22.5
                          10.4L23 9.7L21 8.5M23 19H19V21H23V19M5 19H1V21H5V19Z" />
                  </SvgIcon>
                </IconButton>
              )}
              {source.blacklist && source.blacklist.length > 0 && (
                <IconButton
                  onClick={this.props.onClearBlacklist.bind(this, source.url)}
                  className={classes.actionButton}
                  edge="end"
                  size="small"
                  aria-label="clear blacklist">
                  <SvgIcon>
                    <path d="M2 6V8H14V6H2M2 10V12H11V10H2M14.17 10.76L12.76 12.17L15.59 15L12.76 17.83L14.17
                          19.24L17 16.41L19.83 19.24L21.24 17.83L18.41 15L21.24 12.17L19.83 10.76L17 13.59L14.17
                          10.76M2 14V16H11V14H2Z" />
                  </SvgIcon>
                </IconButton>
              )}
              {this.props.config.caching.enabled && getSourceType(source.url) != ST.local &&
              (getSourceType(source.url) != ST.video || /^https?:\/\//g.exec(source.url) != null) && (
                <React.Fragment>
                  <IconButton
                    onClick={this.onClean.bind(this, source)}
                    className={classes.actionButton}
                    edge="end"
                    size="small"
                    aria-label="clean cache">
                    <SvgIcon>
                      <path d="M19.36 2.72L20.78 4.14L15.06 9.85C16.13 11.39 16.28 13.24 15.38 14.44L9.06
                            8.12C10.26 7.22 12.11 7.37 13.65 8.44L19.36 2.72M5.93 17.57C3.92 15.56 2.69 13.16 2.35
                            10.92L7.23 8.83L14.67 16.27L12.58 21.15C10.34 20.81 7.94 19.58 5.93 17.57Z" />
                    </SvgIcon>
                  </IconButton>
                </React.Fragment>
              )}
              <IconButton
                onClick={this.onRemove.bind(this, source)}
                className={clsx(classes.deleteButton, classes.actionButton)}
                edge="end"
                size="small"
                aria-label="delete">
                <DeleteIcon className={classes.deleteIcon} color="inherit"/>
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      </div>
    )});

  Row(props: any) {
    const { index } = props;
    return (
      <this.SortableItem index={index} value={props}/>
    );
  }
}

export default withStyles(styles)(SourceList as any);