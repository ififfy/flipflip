import * as React from "react";
import clsx from "clsx";
import {existsSync} from "fs";
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
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import {getTimestamp} from "../../data/utils";
import Tag from "../../data/Tag";
import {grey} from "@mui/material/colors";
import Audio from "../../data/Audio";
import SourceIcon from "./SourceIcon";

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
  lastSelected: {
    backgroundColor: theme.palette.mode == 'light' ? (theme.palette.primary as any)["200"] : '#0F0F0F',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none',
  },
  listAvatar: {
    width: 56,
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
  actionButton: {
    marginLeft: theme.spacing(1),
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
  trackThumb: {
    height: 40,
    width: 40,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  thumbImage: {
    height: '100%',
  },
  trackName: {
    maxWidth: 500,
    minWidth: 250,
    width: '100%',
    userSelect: 'none',
  },
  trackDuration: {
    width: 75,
    textAign: 'end',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(3),
    userSelect: 'none',
  },
  artistContainer: {
    minWidth: 225,
  },
  trackArtist: {
    display: 'inline-block',
    userSelect: 'none',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  albumContainer: {
    minWidth: 225,
  },
  trackAlbum: {
    userSelect: 'none',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  bigTooltip: {
    fontSize: "medium",
    maxWidth: 500,
  },
  tagChips: {
    textAlign: 'center',
  },
  listItem: {
    paddingRight: 110,
  }
});

class AudioSourceListItem extends React.Component {
  readonly props: {
    classes: any,
    checked: boolean,
    index: number,
    isSelect: boolean,
    lastSelected: boolean,
    source: Audio,
    sources: Array<Audio>,
    style: any,
    onClickAlbum(album: string): void,
    onClickArtist(artist: string): void,
    onDelete(source: Audio): void;
    onEditSource(source: Audio): void;
    onPlay(source: Audio, displaySources: Array<Audio>): void,
    onRemove(source: Audio): void,
    onSourceOptions(source: Audio): void,
    onToggleSelect(): void,
    savePosition(): void,
    systemMessage(message: string): void,
  };

  readonly state = {
    urlInput: this.props.source.url,
  };

  render() {
    const classes = this.props.classes;
    return(
      <div style={this.props.style}
           className={clsx(this.props.index % 2 == 0 ? classes.evenChild : classes.oddChild, this.props.lastSelected && classes.lastSelected)}>
        <ListItem classes={{root: classes.listItem}}>
          {this.props.isSelect && (
            <Checkbox value={this.props.source.url} onChange={this.props.onToggleSelect.bind(this)}
                      checked={this.props.checked}/>
          )}
          <Badge
            anchorOrigin={{vertical: 'top', horizontal: 'left'}}
            variant={"dot"}
            invisible={!this.props.source.marked}
            overlap="rectangular"
            color="secondary">
            <ListItemAvatar className={classes.listAvatar}>
              <Badge
                invisible={!this.props.source.trackNum}
                max={999}
                overlap="rectangular"
                color="primary"
                badgeContent={this.props.source.trackNum}>
                <Tooltip disableInteractive placement={this.props.source.comment ? 'right' : 'bottom'}
                         classes={this.props.source.comment ? {tooltip: classes.bigTooltip} : null}
                         arrow={!!this.props.source.comment || this.props.source.tags.length > 0}
                         title={
                  this.props.source.comment || this.props.source.tags.length > 0 ?
                    <div>
                      {this.props.source.comment}
                      {this.props.source.comment && this.props.source.tags.length > 0 && (<br/>)}
                      <div className={classes.tagChips}>
                        {this.props.source.tags && this.props.source.tags.map((tag: Tag) =>
                          <React.Fragment key={tag.id}>
                            <Chip
                              label={tag.name}
                              color="primary"
                              size="small"/>
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                      :
                    <div>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click: Library Tagging
                      <br/>
                      Shift+Click: Open Source
                      <br/>
                      &nbsp;&nbsp;Ctrl+Click: Reveal File}
                    </div>
                }>
                  <div onClick={this.onSourceIconClick.bind(this)} className={classes.trackThumb}>
                    {this.props.source.thumb != null && (
                      <img className={classes.thumbImage} src={this.props.source.thumb}/>
                    )}
                    {this.props.source.thumb == null && (
                      <Fab
                        size="small"
                        className={clsx(classes.avatar, this.props.source.marked && classes.markedSource)}>
                        <SourceIcon url={this.props.source.url} className={clsx(classes.sourceIcon, this.props.source.marked && classes.sourceMarkedIcon)}/>
                      </Fab>
                    )}
                  </div>
                </Tooltip>
              </Badge>
            </ListItemAvatar>
          </Badge>

          <ListItemText classes={{primary: classes.root}}>
            <Typography noWrap className={classes.trackName}>
              {this.props.source.name}
            </Typography>
            <Typography className={classes.trackDuration}>
              {getTimestamp(this.props.source.duration)}
            </Typography>
            <div className={classes.artistContainer} onClick={this.props.onClickArtist.bind(this, this.props.source.artist)}>
              <Typography noWrap className={classes.trackArtist}>
                {this.props.source.artist}
              </Typography>
            </div>
            <div className={classes.albumContainer} onClick={this.props.onClickAlbum.bind(this, this.props.source.album)}>
              <Typography className={classes.trackAlbum}>
                {this.props.source.album}
              </Typography>
            </div>
          </ListItemText>

          {this.props.source.id && (
            <ListItemSecondaryAction>
              {this.props.source.playedCount > 0 && (
                <Chip
                  label={this.props.source.playedCount}
                  color="primary"
                  size="small"/>
              )}
              <IconButton
                onClick={this.props.onEditSource.bind(this, this.props.source)}
                className={classes.actionButton}
                edge="end"
                size="small"
                aria-label="edit">
                <EditIcon/>
              </IconButton>
              <IconButton
                onClick={this.props.onSourceOptions.bind(this, this.props.source)}
                className={classes.actionButton}
                edge="end"
                size="small"
                aria-label="options">
                <BuildIcon/>
              </IconButton>
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

  onSourceIconClick(e: MouseEvent) {
    const sourceURL = this.props.source.url;
    if (e.shiftKey && e.ctrlKey && e.altKey) {
      this.props.onDelete(this.props.source);
    } else if (e.shiftKey && !e.ctrlKey) {
      this.openExternalURL(sourceURL);
    } else if (!e.shiftKey && e.ctrlKey) {
      if (existsSync(sourceURL)) {
        remote.shell.showItemInFolder(sourceURL);
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

  openExternalURL(url: string) {
    remote.shell.openExternal(url);
  }
}

(AudioSourceListItem as any).displayName="AudioSourceListItem";
export default withStyles(styles)(AudioSourceListItem as any);