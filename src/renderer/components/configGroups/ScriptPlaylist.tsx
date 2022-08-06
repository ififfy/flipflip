import * as React from "react";
import Sortable from "react-sortablejs";
import {existsSync} from "fs";
import {remote} from "electron";

import {
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Theme,
  Tooltip,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AddIcon from "@mui/icons-material/Add";
import BuildIcon from "@mui/icons-material/Build";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import ShuffleIcon from '@mui/icons-material/Shuffle';

import {arrayMove} from "../../data/utils";
import {RP} from "../../data/const";
import Scene from "../../data/Scene";
import SourceIcon from "../library/SourceIcon";
import CaptionScript from "../../data/CaptionScript";

const styles = (theme: Theme) => createStyles({
  scriptList: {
    paddingLeft: 0,
  },
  thumb: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  playlistAction: {
    textAlign: 'center',
  },
  left: {
    float: 'left',
    paddingLeft: theme.spacing(2),
  },
  right: {
    float: 'right',
    paddingRight: theme.spacing(2),
  },
  scriptThumb: {
    height: 40,
    width: 40,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  listAvatar: {
    width: 56,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none',
  },
  sourceIcon: {
    color: theme.palette.primary.contrastText,
  },
});

class ScriptPlaylist extends React.Component {
  readonly props: {
    classes: any,
    playlistIndex: number,
    playlist: { scripts: Array<CaptionScript>, shuffle: boolean, repeat: string },
    scene: Scene,
    onAddScript(playlistIndex: number): void,
    onPlay(source: CaptionScript, sceneID: number, displaySources: Array<CaptionScript>): void,
    onSourceOptions(script: CaptionScript): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    systemMessage(message: string): void,
  };

  render() {
    const classes = this.props.classes;

    return (
      <List disablePadding>
        <Sortable
          className={classes.scriptList}
          options={{
            animation: 150,
            easing: "cubic-bezier(1, 0, 0, 1)",
          }}
          onChange={(order: any, sortable: any, evt: any) => {
            let newScripts = Array.from(this.props.playlist.scripts);
            arrayMove(newScripts, evt.oldIndex, evt.newIndex);
            this.props.onUpdateScene(this.props.scene, (s) => {
              s.scriptPlaylists[this.props.playlistIndex].scripts = newScripts;
            });
          }}>
          {this.props.playlist.scripts.map((s, i) =>
            <ListItem key={i}>
              <ListItemAvatar className={classes.listAvatar}>
                  <Tooltip disableInteractive placement={'bottom'}
                           title={
                               <div>
                                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click: Library Tagging
                                 <br/>
                                 Shift+Click: Open Source
                                 <br/>
                                 &nbsp;&nbsp;Ctrl+Click: Reveal File}
                               </div>
                           }>
                    <div onClick={this.onSourceIconClick.bind(this, s)} className={classes.scriptThumb}>
                      <Fab
                        size="small"
                        className={classes.avatar}>
                        <SourceIcon url={s.url} className={classes.sourceIcon}/>
                      </Fab>
                    </div>
                  </Tooltip>
              </ListItemAvatar>
              <ListItemText primary={s.url} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={this.props.onSourceOptions.bind(this, this.props.playlistIndex, s)}
                  size="large">
                  <BuildIcon/>
                </IconButton>
                <IconButton edge="end" onClick={this.removeScript.bind(this, i)} size="large">
                  <DeleteIcon color={"error"}/>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )}
        </Sortable>
        <div className={classes.playlistAction}>
          <div className={classes.left}>
            <Tooltip disableInteractive title={"Shuffle " + (this.props.playlist.shuffle ? "(On)" : "(Off)")}>
              <IconButton onClick={this.toggleShuffle.bind(this)} size="large">
                <ShuffleIcon color={this.props.playlist.shuffle ? "primary" : undefined}/>
              </IconButton>
            </Tooltip>
            <Tooltip disableInteractive title={"Repeat " + (this.props.playlist.repeat == RP.none ? "(Off)" : this.props.playlist.repeat == RP.all ? "(All)" : "(One)")}>
              <IconButton onClick={this.changeRepeat.bind(this)} size="large">
                {this.props.playlist.repeat == RP.none && (
                  <RepeatIcon />
                )}
                {this.props.playlist.repeat == RP.all && (
                  <RepeatIcon color={"primary"}/>
                )}
                {this.props.playlist.repeat == RP.one && (
                  <RepeatOneIcon color={"primary"} />
                )}
              </IconButton>
            </Tooltip>
          </div>
          <Tooltip disableInteractive title="Add Tracks">
            <IconButton
              onClick={this.props.onAddScript.bind(this, this.props.playlistIndex)}
              size="large">
              <AddIcon/>
            </IconButton>
          </Tooltip>
          <div className={classes.right}>
            <Tooltip disableInteractive title="Remove Playlist">
              <IconButton onClick={this.removePlaylist.bind(this)} size="large">
                <ClearIcon color={"error"}/>
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </List>
    );
  }

  onSourceIconClick(script: CaptionScript, e: MouseEvent) {
    const sourceURL = script.url;
    if (e.shiftKey && !e.ctrlKey) {
      this.openExternalURL(sourceURL);
    } else if (!e.shiftKey && e.ctrlKey) {
      if (existsSync(sourceURL)) {
        remote.shell.showItemInFolder(sourceURL);
      }
    } else if (!e.shiftKey && !e.ctrlKey && this.props.systemMessage) {
      try {
        this.props.onPlay(script, this.props.scene.id, this.props.playlist.scripts);
      } catch (e) {
        this.props.systemMessage("The source " + sourceURL + " isn't in your Library");
      }
    }
  }

  openExternalURL(url: string) {
    remote.shell.openExternal(url);
  }

  toggleShuffle() {
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.scriptPlaylists[this.props.playlistIndex];
      playlist.shuffle = !playlist.shuffle;
    });
  }

  changeRepeat() {
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.scriptPlaylists[this.props.playlistIndex];
      const repeat = playlist.repeat;
      switch (repeat) {
        case RP.none:
          playlist.repeat = RP.all;
          break;
        case RP.all:
          playlist.repeat = RP.one;
          break;
        case RP.one:
          playlist.repeat = RP.none;
          break;
      }
    });
  }

  removePlaylist() {
    this.props.onUpdateScene(this.props.scene, (s) => {
      s.scriptPlaylists.splice(this.props.playlistIndex, 1);
    });
  }

  removeScript(scriptIndex: number) {
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.scriptPlaylists[this.props.playlistIndex];
      playlist.scripts.splice(scriptIndex, 1);
    });
  }
}

(ScriptPlaylist as any).displayName="ScriptPlaylist";
export default withStyles(styles)(ScriptPlaylist as any);