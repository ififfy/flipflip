import * as React from "react";
import Sortable from "react-sortablejs";

import {
  Avatar, Chip,
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
import BuildIcon from "@material-ui/icons/Build";
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";
import RepeatIcon from '@material-ui/icons/Repeat';
import RepeatOneIcon from '@material-ui/icons/RepeatOne';
import ShuffleIcon from '@material-ui/icons/Shuffle';

import {arrayMove, getTimestamp, randomizeList} from "../../data/utils";
import {RP} from "../../data/const";
import AudioControl from "./AudioControl";
import Audio from "../../data/Audio";
import Scene from "../../data/Scene";

const styles = (theme: Theme) => createStyles({
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
});

class AudioPlaylist extends React.Component {
  readonly props: {
    classes: any,
    playlistIndex: number,
    playlist: { audios: Array<Audio>, shuffle: boolean, repeat: string },
    scene: Scene,
    sidebar: boolean,
    startPlaying: boolean,
    onAddTracks(playlistIndex: number): void,
    onSourceOptions(audio: Audio): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    shorterSeek?: boolean,
    showMsTimestamp?: boolean,
    scenePaths?: Array<any>,
    goBack?(): void,
    orderAudioTags?(audio: Audio): void,
    onPlaying?(position: number, duration: number): void,
    playTrack?(url: string): void,
    playNextScene?(): void,
    setCurrentAudio?(audio: Audio): void,
  };

  readonly state = {
    currentIndex: this.props.playlistIndex == 0 ? this.props.scene.audioStartIndex : 0,
    playingAudios: Array<Audio>(),
  }

  render() {
    const classes = this.props.classes;

    if (this.props.startPlaying) {
      let audio = this.state.playingAudios[this.state.currentIndex];
      if (!audio) audio = this.props.playlist.audios[this.state.currentIndex];
      if (!audio) return <div/>;
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
            audio={audio}
            audioEnabled={this.props.scene.audioEnabled}
            singleTrack={this.state.playingAudios.length == 1}
            lastTrack={this.state.currentIndex == this.state.playingAudios.length - 1}
            repeat={this.props.playlist.repeat}
            scenePaths={this.props.scenePaths}
            shorterSeek={this.props.shorterSeek}
            showMsTimestamp={this.props.showMsTimestamp}
            startPlaying={this.props.startPlaying}
            playTrack={this.props.playTrack}
            nextTrack={this.nextTrack.bind(this)}
            prevTrack={this.prevTrack.bind(this)}
            onPlaying={this.props.onPlaying}
            onAudioSliderChange={this.onAudioSliderChange.bind(this)}
            goBack={this.props.goBack}
            playNextScene={this.props.playNextScene}/>
          <div className={classes.playlistAction}>
            <Tooltip title={"Shuffle " + (this.props.playlist.shuffle ? "(On)" : "(Off)")}>
              <IconButton onClick={this.toggleShuffle.bind(this)}>
                <ShuffleIcon color={this.props.playlist.shuffle ? "primary" : undefined}/>
              </IconButton>
            </Tooltip>
            <Tooltip title={"Repeat " + (this.props.playlist.repeat == RP.none ? "(Off)" : this.props.playlist.repeat == RP.all ? "(All)" : "(One)")}>
              <IconButton onClick={this.changeRepeat.bind(this)}>
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
        </React.Fragment>
      );
    } else {
      return (
        <List disablePadding>
          <Sortable
            className={classes.audioList}
            options={{
              animation: 150,
              easing: "cubic-bezier(1, 0, 0, 1)",
            }}
            onChange={(order: any, sortable: any, evt: any) => {
              let newAudios = Array.from(this.props.playlist.audios);
              arrayMove(newAudios, evt.oldIndex, evt.newIndex);
              this.props.onUpdateScene(this.props.scene, (s) => {
                s.audioPlaylists[this.props.playlistIndex].audios = newAudios;
              });
            }}>
            {this.props.playlist.audios.map((a, i) =>
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
                  <Chip
                    label={getTimestamp(a.duration)}
                    color='default'
                    size='small'
                    variant='outlined'/>
                  <IconButton edge="end" onClick={this.props.onSourceOptions.bind(this, this.props.playlistIndex, a)}>
                    <BuildIcon/>
                  </IconButton>
                  <IconButton edge="end" onClick={this.removeTrack.bind(this, i)}>
                    <DeleteIcon color={"error"}/>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </Sortable>
          <div className={classes.playlistAction}>
            <div className={classes.left}>
              <Tooltip title={"Shuffle " + (this.props.playlist.shuffle ? "(On)" : "(Off)")}>
                <IconButton onClick={this.toggleShuffle.bind(this)}>
                  <ShuffleIcon color={this.props.playlist.shuffle ? "primary" : undefined}/>
                </IconButton>
              </Tooltip>
              <Tooltip title={"Repeat " + (this.props.playlist.repeat == RP.none ? "(Off)" : this.props.playlist.repeat == RP.all ? "(All)" : "(One)")}>
                <IconButton onClick={this.changeRepeat.bind(this)}>
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
            <Tooltip title="Add Tracks">
              <IconButton onClick={this.props.onAddTracks.bind(this, this.props.playlistIndex)}>
                <AddIcon/>
              </IconButton>
            </Tooltip>
            <div className={classes.right}>
              <Chip
                label={getTimestamp(this.props.playlist.audios.reduce((total, a) => total + a.duration, 0))}
                color='default'
                size='small'
                variant='outlined'/>
              <Tooltip title="Remove Playlist">
                <IconButton onClick={this.removePlaylist.bind(this)}>
                  <ClearIcon color={"error"}/>
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </List>
      );
    }
  }

  componentDidMount() {
    if (this.props.setCurrentAudio) {
      this.props.setCurrentAudio(this.props.playlist.audios[this.state.currentIndex]);
    }
    if (this.props.playlistIndex == 0 && this.props.scene.audioScene) {
      window.addEventListener('keydown', this.onKeyDown, false);
    }
    if (this.props.startPlaying) {
      let audios = this.props.playlist.audios;
      if (this.props.playlist.shuffle) {
        audios = randomizeList(Array.from(audios));
      }
      this.setState({playingAudios: audios});
    }
  }

  componentWillUnmount() {
    if (this.props.playlistIndex == 0 && this.props.scene.audioScene) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case '[':
        e.preventDefault();
        this.props.orderAudioTags(this.props.playlist.audios[this.state.currentIndex]);
        this.prevTrack();
        break;
      case ']':
        e.preventDefault();
        this.props.orderAudioTags(this.props.playlist.audios[this.state.currentIndex]);
        this.nextTrack();
        break;
    }
  }

  prevTrack() {
    let prevTrack = this.state.currentIndex - 1;
    if (prevTrack < 0) {
      prevTrack = this.props.playlist.audios.length - 1;
    }
    if (this.props.setCurrentAudio) {
      this.props.setCurrentAudio(this.props.playlist.audios[prevTrack]);
    }
    this.setState({currentIndex: prevTrack});
  }

  nextTrack() {
    let nextTrack = this.state.currentIndex + 1;
    if (nextTrack >= this.props.playlist.audios.length) {
      nextTrack = 0;
    }
    if (this.props.setCurrentAudio) {
      this.props.setCurrentAudio(this.props.playlist.audios[nextTrack]);
    }
    this.setState({currentIndex: nextTrack});
  }

  toggleShuffle() {
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.audioPlaylists[this.props.playlistIndex];
      playlist.shuffle = !playlist.shuffle;
    });
  }

  changeRepeat() {
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.audioPlaylists[this.props.playlistIndex];
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
      s.audioPlaylists.splice(this.props.playlistIndex, 1);
    });
  }

  removeTrack(trackIndex: number) {
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.audioPlaylists[this.props.playlistIndex];
      playlist.audios.splice(trackIndex, 1);
    });
  }

  onAudioSliderChange(e: MouseEvent, value: number) {
    this.props.onUpdateScene(this.props.scene, (s) => s.audioPlaylists[this.props.playlistIndex].audios.find((a: Audio) => a.id == this.state.playingAudios[this.state.currentIndex].id).volume = value);
  }
}

export default withStyles(styles)(AudioPlaylist as any);