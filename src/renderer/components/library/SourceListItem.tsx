import * as React from "react";
import clsx from "clsx";
import {existsSync} from "fs";
import * as path from "path";
import {remote} from "electron";

import {
  Badge,
  Checkbox,
  Chip,
  Fab,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  SvgIcon,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';

import {getCachePath, getTimestamp, urlToPath} from "../../data/utils";
import {getFileName, getSourceType} from "../player/Scrapers";
import {SDT, ST} from "../../data/const";
import Tag from "../../data/Tag";
import SourceIcon from "./SourceIcon";
import LibrarySource from "../../data/LibrarySource";
import Config from "../../data/Config";
import {grey} from "@mui/material/colors";

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  oddChild: {
    backgroundColor: theme.palette.mode == 'light' ? (theme.palette.primary as any)["100"] : grey[900],
    '&:hover': {
      backgroundColor: theme.palette.mode == 'light' ? (theme.palette.primary as any)["200"] : '#080808',
    },
  },
  evenChild: {
    backgroundColor: theme.palette.mode == 'light' ? (theme.palette.primary as any)["50"] : theme.palette.background.default,
    '&:hover': {
      backgroundColor: theme.palette.mode == 'light' ? (theme.palette.primary as any)["200"] : '#080808',
    },
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none',
  },
  markedSource: {
    backgroundColor: theme.palette.secondary.main,
  },
  sourceIcon: {
    color: theme.palette.primary.contrastText,
  },
  sourceMarkedIcon: {
    color: theme.palette.secondary.contrastText,
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
  },
  deleteIcon: {
    color: theme.palette.error.contrastText,
  },
  errorIcon: {
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.contrastText,
    borderRadius: '50%',
  },
  importBadge:{
    zIndex: theme.zIndex.fab + 1,
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
  countChip: {
    userSelect: 'none',
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  fullTag: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  simpleTag: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  urlField: {
    width: '100%',
    margin: 0,
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid',
  },
  disable: {
    pointerEvents: 'none',
  },
  noUserSelect: {
    userSelect: 'none',
  },
});

class SourceListItem extends React.Component {
  readonly props: {
    classes: any,
    checked: boolean,
    config: Config,
    index: number,
    isEditing: number,
    isLibrary: boolean,
    isSelect: boolean,
    source: LibrarySource,
    sources: Array<LibrarySource>,
    style: any,
    tutorial: string,
    useWeights?: boolean,
    onClean(source: LibrarySource): void,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource, displaySources: Array<LibrarySource>): void,
    onDelete(source: LibrarySource): void;
    onDownload(source: LibrarySource): void;
    onEditBlacklist(source: LibrarySource): void,
    onEndEdit(newURL: string): void,
    onOpenClipMenu(source: LibrarySource): void,
    onOpenWeightMenu(source: LibrarySource): void,
    onPlay(source: LibrarySource, displaySources: Array<LibrarySource>): void,
    onRemove(source: LibrarySource): void,
    onSourceOptions(source: LibrarySource): void,
    onStartEdit(id: number): void,
    onToggleSelect(): void,
    savePosition(): void,
    systemMessage(message: string): void,
  };

  readonly state = {
    urlInput: this.props.source.url,
  };

  render() {
    const classes = this.props.classes;
    const sourceType = getSourceType(this.props.source.url);
    return (
      <div style={this.props.style}
           className={clsx(this.props.index % 2 == 0 ? classes.evenChild : classes.oddChild,
             this.props.tutorial == SDT.source && classes.highlight,
             this.props.tutorial && classes.disable)}>
        <ListItem>
          {this.props.isSelect && (
            <Checkbox value={this.props.source.url} onChange={this.props.onToggleSelect.bind(this)}
                      checked={this.props.checked}/>
          )}
          <ListItemAvatar>
            <Badge
              classes={{
                badge: classes.importBadge
              }}
              invisible={!this.props.source.offline}
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              badgeContent={<OfflineBoltIcon className={classes.errorIcon} />}>
              <Tooltip disableInteractive title={
                <div>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click: Library Tagging
                  <br/>
                  Shift+Click: Open Source
                  <br/>
                  &nbsp;&nbsp;Ctrl+Click: {sourceType == ST.video ? 'Reveal File' : 'Open Cache'}
                  {(sourceType != ST.local && sourceType != ST.video && sourceType != ST.piwigo && sourceType != ST.hydrus && sourceType != ST.nimja) &&
                    <React.Fragment>
                      <br/>
                      &nbsp;&nbsp;&nbsp;Alt+Click: Download Source
                    </React.Fragment>
                  }
                </div>
              }>
                <Fab
                  size="small"
                  onClick={this.onSourceIconClick.bind(this)}
                  className={clsx(classes.avatar, this.props.source.marked && classes.markedSource, this.props.tutorial == SDT.sourceAvatar && classes.highlight)}>
                  <SourceIcon url={this.props.source.url} className={clsx(classes.sourceIcon, this.props.source.marked && classes.sourceMarkedIcon)}/>
                </Fab>
                </Tooltip>
            </Badge>
          </ListItemAvatar>

          <ListItemText classes={{primary: classes.root}}>
            {this.props.isEditing == this.props.source.id && (
              <form onSubmit={this.onEndEdit.bind(this)} className={classes.urlField}>
                <TextField
                  variant="standard"
                  autoFocus
                  fullWidth
                  value={this.state.urlInput}
                  margin="none"
                  className={classes.urlField}
                  onBlur={this.onEndEdit.bind(this)}
                  onChange={this.onEditSource.bind(this)} />
              </form>
            )}
            {this.props.isEditing != this.props.source.id && (
              <React.Fragment>
                <Typography
                  noWrap
                  className={clsx(classes.noUserSelect, this.props.tutorial == SDT.sourceTitle && classes.highlight)}
                  onClick={this.onStartEdit.bind(this, this.props.source)}>
                  {this.props.source.url}
                </Typography>
                {this.props.source.tags && this.props.source.tags.map((tag: Tag) =>
                  <React.Fragment key={tag.id}>
                    <Chip
                      className={clsx(classes.noUserSelect, classes.actionButton, classes.fullTag, this.props.tutorial == SDT.sourceTags && classes.highlight)}
                      label={tag.name}
                      color="primary"
                      size="small"
                      variant="outlined"/>
                    <Chip
                      className={clsx(classes.noUserSelect, classes.actionButton, classes.simpleTag, this.props.tutorial == SDT.sourceTags && classes.highlight)}
                      label={this.getSimpleTag(tag.name)}
                      color="primary"
                      size="small"
                      variant="outlined"/>
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </ListItemText>

          {this.props.isEditing != this.props.source.id && (
            <ListItemSecondaryAction className={clsx(classes.source, this.props.tutorial == SDT.sourceButtons && classes.highlight)}>
              {this.props.useWeights && (
                <React.Fragment>
                  <Chip
                    className={classes.countChip}
                    clickable
                    label={!!this.props.source.weight ? this.props.source.weight : "1"}
                    color="default"
                    size="small"
                    onClick={this.props.onOpenWeightMenu.bind(this, this.props.source)}/>
                </React.Fragment>
              )}
              {(sourceType == ST.video && this.props.source.duration) && (
                <Chip
                  className={classes.countChip}
                  label={getTimestamp(this.props.source.duration)}
                  color="secondary"
                  size="small"/>
              )}
              {(sourceType == ST.video && !!this.props.source.resolution) && (
                <Chip
                  className={classes.countChip}
                  label={`${this.props.source.resolution}p`}
                  color="secondary"
                  size="small"/>
              )}
              {(this.props.source.count > 0 && sourceType != ST.video) && (
                <Chip
                  className={clsx(classes.countChip, this.props.tutorial == SDT.sourceCount && classes.highlight)}
                  label={`${this.props.source.count}${this.props.source.countComplete ? '' : '+'}`}
                  color="primary"
                  size="small"/>
              )}
              {(!this.props.isLibrary && this.props.source.clips && this.props.source.clips.length > 0 && sourceType == ST.video) && (
                <Chip
                  className={classes.countChip}
                  label={(this.props.source.disabledClips ? this.props.source.clips.filter((c) => !this.props.source.disabledClips.includes(c.id)) : this.props.source.clips).length + "/" + this.props.source.clips.length}
                  onClick={this.props.onOpenClipMenu.bind(this, this.props.source)}
                  color="primary"
                  size="small"/>
              )}
              {(this.props.isLibrary && this.props.source.clips && this.props.source.clips.length > 0 && sourceType == ST.video) && (
                <Chip
                  className={classes.countChip}
                  label={this.props.source.clips.length}
                  color="primary"
                  size="small"/>
              )}
              {(sourceType == ST.local || sourceType == ST.video || sourceType == ST.twitter || sourceType == ST.reddit) && (
                <IconButton
                  onClick={this.props.onSourceOptions.bind(this, this.props.source)}
                  className={classes.actionButton}
                  edge="end"
                  size="small"
                  aria-label="options">
                  <BuildIcon/>
                </IconButton>
              )}
              {sourceType == ST.video && (
                <IconButton
                  onClick={this.onClip.bind(this)}
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
              {this.props.source.blacklist && this.props.source.blacklist.length > 0 && (
                <IconButton
                  onClick={this.onClickBlacklist.bind(this)}
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
              {this.props.config.caching.enabled && sourceType != ST.local &&
              ((sourceType != ST.video && sourceType != ST.playlist)
                || /^https?:\/\//g.exec(this.props.source.url) != null) && (
                <React.Fragment>
                  <IconButton
                    onClick={this.props.onClean.bind(this, this.props.source)}
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
                onClick={this.props.onRemove.bind(this, this.props.source)}
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
    );
  }

  getSimpleTag(tagName: string) {
    tagName = tagName.replace( /[a-z]/g, '' ).replace( /\s/g, '' );
    return tagName;
  }

  onSourceIconClick(e: MouseEvent) {
    const sourceURL = this.props.source.url;
    const sourceType = getSourceType(sourceURL);
    if (e.shiftKey && e.ctrlKey && e.altKey) {
      this.props.onDelete(this.props.source);
    } else if (e.shiftKey && !e.ctrlKey && !e.altKey) {
      this.openExternalURL(sourceURL);
    } else if (!e.shiftKey && !e.ctrlKey && e.altKey) {
      // If local source, still catch keypress, but don't do anything
      if (sourceType != ST.local && sourceType != ST.video && sourceType != ST.piwigo && sourceType != ST.hydrus && sourceType != ST.nimja) {
        this.props.onDownload(this.props.source);
      }
    } else if (!e.shiftKey && e.ctrlKey && !e.altKey) {
      const fileType = getSourceType(sourceURL);
      let cachePath;
      if (fileType == ST.video || fileType == ST.playlist) {
        if (existsSync(getCachePath(sourceURL, this.props.config) + getFileName(sourceURL))) {
          cachePath = getCachePath(sourceURL, this.props.config);
        } else if (existsSync(sourceURL)) {
          remote.shell.showItemInFolder(sourceURL);
        }
      } else {
        cachePath = getCachePath(sourceURL, this.props.config);
      }
      if (cachePath) {
        this.openDirectory(cachePath);
      }
    } else if (!e.shiftKey && !e.ctrlKey) {
      this.props.savePosition();
      try {
        this.props.onPlay(this.props.source, this.props.sources);
      } catch (e) {
        this.props.systemMessage("The source " + sourceURL + " isn't in your Library");
      }
    }
  }

  onClip() {
    this.props.savePosition();
    this.props.onClip(this.props.source, this.props.sources);
  }

  onClickBlacklist(e: MouseEvent) {
    if (e.shiftKey) {
      this.props.onClearBlacklist(this.props.source.url);
    } else {
      this.props.onEditBlacklist(this.props.source);
    }
  }

  onStartEdit(s: LibrarySource) {
    this.props.onStartEdit(s.id);
  }

  onEditSource(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({urlInput: input.value});
  }

  onEndEdit() {
    this.props.onEndEdit(this.state.urlInput);
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
}

(SourceListItem as any).displayName="SourceListItem";
export default withStyles(styles)(SourceListItem as any);