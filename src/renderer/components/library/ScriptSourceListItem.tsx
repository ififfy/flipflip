import * as React from "react";
import clsx from "clsx";
import {existsSync} from "fs";
import {remote} from "electron";

import {
  Checkbox,
  Chip,
  Fab,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Radio,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';

import {urlToPath} from "../../data/utils";
import Tag from "../../data/Tag";
import SourceIcon from "./SourceIcon";
import CaptionScript from "../../data/CaptionScript";
import {grey} from "@mui/material/colors";
import {SP} from "../../data/const";
import EditIcon from "@mui/icons-material/Edit";

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
  actionButton: {
    marginLeft: theme.spacing(1),
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
  noUserSelect: {
    userSelect: 'none',
  },
});

class ScriptSourceListItem extends React.Component {
  readonly props: {
    classes: any,
    checked: boolean,
    index: number,
    isEditing: number,
    specialMode: string,
    lastSelected: boolean,
    source: CaptionScript,
    style: any,
    tutorial: string,
    onDelete(source: CaptionScript): void;
    onEditScript(source: CaptionScript): void,
    onEndEdit(newURL: string): void,
    onPlay(source: CaptionScript): void,
    onRemove(source: CaptionScript): void,
    onSourceOptions(source: CaptionScript): void,
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
    return (
      <div style={this.props.style}
           className={clsx(this.props.index % 2 == 0 ? classes.evenChild : classes.oddChild, this.props.lastSelected && classes.lastSelected)}>
        <ListItem>
          {(this.props.specialMode == SP.batchTag || this.props.specialMode == SP.select) && (
            <Checkbox value={this.props.source.url} onChange={this.props.onToggleSelect.bind(this)}
                      checked={this.props.checked}/>
          )}
          {this.props.specialMode == SP.selectSingle && (
            <Radio value={this.props.source.url} onChange={this.props.onToggleSelect.bind(this)}
                      checked={this.props.checked}/>
          )}
          <ListItemAvatar>
            <Tooltip disableInteractive title={
              <div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click: Library Tagging
                <br/>
                Shift+Click: Open Source
                <br/>
                &nbsp;&nbsp;Ctrl+Click: Reveal File
              </div>
            }>
              <Fab
                size="small"
                onClick={this.onSourceIconClick.bind(this)}
                className={clsx(classes.avatar, this.props.source.marked && classes.markedSource)}>
                <SourceIcon url={this.props.source.url} className={clsx(classes.sourceIcon, this.props.source.marked && classes.sourceMarkedIcon)}/>
              </Fab>
            </Tooltip>
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
                  className={classes.noUserSelect}
                  onClick={this.onStartEdit.bind(this, this.props.source)}>
                  {this.props.source.url}
                </Typography>
                {this.props.source.tags && this.props.source.tags.map((tag: Tag) =>
                  <React.Fragment key={tag.id}>
                    <Chip
                      className={clsx(classes.noUserSelect, classes.actionButton, classes.fullTag)}
                      label={tag.name}
                      color="primary"
                      size="small"
                      variant="outlined"/>
                    <Chip
                      className={clsx(classes.noUserSelect, classes.actionButton, classes.simpleTag)}
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
            <ListItemSecondaryAction className={classes.source}>
              {!this.props.specialMode && (
                <IconButton
                  onClick={this.props.onEditScript.bind(this, this.props.source)}
                  className={classes.actionButton}
                  edge="end"
                  size="small"
                  aria-label="edit">
                  <EditIcon/>
                </IconButton>
              )}
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

  getSimpleTag(tagName: string) {
    tagName = tagName.replace( /[a-z]/g, '' ).replace( /\s/g, '' );
    return tagName;
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
      this.props.onPlay(this.props.source);
    }
  }

  onStartEdit(s: CaptionScript) {
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

(ScriptSourceListItem as any).displayName="ScriptSourceListItem";
export default withStyles(styles)(ScriptSourceListItem as any);