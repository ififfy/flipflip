import * as React from "react";
import Sortable from "react-sortablejs";

import {
  Avatar,
  createStyles,
  IconButton,
  List,
  ListItem,
  ListItemIcon, ListItemSecondaryAction,
  ListItemText,
  Theme, Tooltip,
  withStyles
} from "@material-ui/core";

import AddIcon from "@material-ui/icons/Add";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";

import {arrayMove} from "../../data/utils";
import AudioControl from "./AudioControl";
import Audio from "../../data/Audio";
import Scene from "../../data/Scene";

const styles = (theme: Theme) => createStyles({
  trackList: {
    textAlign: 'center',
  },
  audioList: {
    paddingLeft: 0,
  },
  mediaIcon: {
    width: '100%',
    height: 'auto',
  },
  thumb: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
});

class AudioPlaylist extends React.Component {
  readonly props: {
    classes: any,
    playlistIndex: number,
    audios: Array<Audio>,
    scene: Scene,
    sidebar: boolean,
    startPlaying: boolean,
    onAddTracks(playlistIndex: number): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    scenePaths?: Array<any>,
    goBack?(): void,
    playNextScene?(): void,
    setCurrentAudio?(audio: Audio): void,
  };

  readonly state = {
    currentIndex: 0,
  }

  render() {
    const classes = this.props.classes;

    if (this.props.startPlaying) {
      const audio = this.props.audios[this.state.currentIndex];
      return (
        <React.Fragment>
          <ListItem disableGutters>
            <ListItemIcon>
              <Avatar alt={audio.name} src={audio.thumb} className={classes.thumb}>
                {audio.thumb == null && (
                  <AudiotrackIcon className={classes.mediaIcon}/>
                )}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary={audio.name} />
          </ListItem>
          <AudioControl
            playlistIndex={this.props.playlistIndex}
            audio={audio}
            scene={this.props.scene}
            scenePaths={this.props.scenePaths}
            sidebar={this.props.sidebar}
            startPlaying={this.props.startPlaying}
            onTrackEnd={this.nextTrack.bind(this)}
            onUpdateScene={this.props.onUpdateScene.bind(this)}
            goBack={this.props.goBack}
            playNextScene={this.props.playNextScene}/>
        </React.Fragment>
      );
    } else {
      return (
        <List disablePadding className={classes.trackList}>
          <Sortable
            className={classes.audioList}
            options={{
              animation: 150,
              easing: "cubic-bezier(1, 0, 0, 1)",
            }}
            onChange={(order: any, sortable: any, evt: any) => {
              let newAudios = Array.from(this.props.audios);
              arrayMove(newAudios, evt.oldIndex, evt.newIndex);
              this.props.onUpdateScene(this.props.scene, (s) => {
                s.audioPlaylists[this.props.playlistIndex] = newAudios;
              });
            }}>
            {this.props.audios.map((a, i) =>
              <ListItem key={i}>
                <ListItemIcon>
                  <Avatar alt={a.name} src={a.thumb} className={classes.thumb}>
                    {a.thumb == null && (
                      <AudiotrackIcon className={classes.mediaIcon}/>
                    )}
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={a.name} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={this.removeTrack.bind(this, i)}>
                    <DeleteIcon color={"error"}/>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </Sortable>
          <Tooltip title="Add Tracks">
            <IconButton onClick={this.props.onAddTracks.bind(this, this.props.playlistIndex)}>
              <AddIcon/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Playlist">
            <IconButton onClick={this.removePlaylist.bind(this)}>
              <ClearIcon color={"error"}/>
            </IconButton>
          </Tooltip>
        </List>
      );
    }
  }

  componentDidMount() {
    if (this.props.setCurrentAudio) {
      this.props.setCurrentAudio(this.props.audios[this.state.currentIndex]);
    }
  }

  nextTrack() {
    let nextTrack = this.state.currentIndex + 1;
    if (nextTrack >= this.props.audios.length) {
      nextTrack = 0;
    }
    if (this.props.setCurrentAudio) {
      this.props.setCurrentAudio(this.props.audios[nextTrack]);
    }
    this.setState({currentIndex: nextTrack});
  }

  removePlaylist() {
    this.props.onUpdateScene(this.props.scene, (s) => {
      s.audioPlaylists.splice(this.props.playlistIndex, 1);
    });
  }

  removeTrack(trackIndex: number) {
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.audioPlaylists[this.props.playlistIndex];
      playlist.splice(trackIndex, 1);
    });
  }
}

export default withStyles(styles)(AudioPlaylist as any);