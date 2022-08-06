import * as React from "react";

import { Collapse, Divider, Fab, FormControlLabel, Grid, Switch, Theme, Tooltip } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AddIcon from '@mui/icons-material/Add';

import {RP} from "../../data/const";
import Scene from "../../data/Scene";
import Audio from "../../data/Audio";
import AudioPlaylist from "../player/AudioPlaylist";
import AudioOptions from "../library/AudioOptions";

const styles = (theme: Theme) => createStyles({
  addButton: {
    boxShadow: 'none',
  },
});

class AudioCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene,
    sidebar: boolean,
    startPlaying: boolean,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    persist?: boolean,
    shorterSeek?: boolean,
    showMsTimestamp?: boolean,
    scenePaths?: Array<any>,
    goBack?(): void,
    onAddTracks?(playlistIndex: number): void,
    onPlay?(source: Audio, displayed: Array<Audio>): void,
    onPlaying?(position: number, duration: number): void,
    orderAudioTags?(audio: Audio): void,
    playTrack?(url: string): void,
    playNextScene?(): void,
    setCurrentAudio?(audio: Audio): void,
    systemMessage?(message: string): void,
  };

  readonly state = {
    sourceOptionsPlaylist: -1,
    sourceOptions: null as Audio,
  }

  render() {
    const classes = this.props.classes;
    return(
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Collapse in={!this.props.persist}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.audioEnabled}
                            onChange={this.onBoolInput.bind(this, 'audioEnabled')}/>
                  }
                  label="Audio Tracks"/>
              </Collapse>
            </Grid>
            <Grid item>
              <Collapse in={this.props.scene.audioEnabled && !this.props.startPlaying}>
                <Tooltip disableInteractive title={"Add Playlist"}>
                  <Fab
                    className={classes.addButton}
                    onClick={this.onAddPlaylist.bind(this)}
                    size="small">
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        {this.props.scene.audioPlaylists.map((playlist, i) =>
          <React.Fragment key={i}>
            <Grid item xs={12}>
              <Collapse in={this.props.scene.audioEnabled || this.props.persist}>
                <AudioPlaylist
                  playlistIndex={i}
                  playlist={playlist}
                  scene={this.props.scene}
                  scenePaths={this.props.scenePaths}
                  shorterSeek={this.props.shorterSeek}
                  showMsTimestamp={this.props.showMsTimestamp}
                  sidebar={this.props.sidebar}
                  startPlaying={this.props.startPlaying}
                  persist={this.props.persist}
                  onAddTracks={this.props.onAddTracks}
                  onSourceOptions={this.onSourceOptions.bind(this)}
                  onUpdateScene={this.props.onUpdateScene.bind(this)}
                  setCurrentAudio={i==0 && this.props.setCurrentAudio ? this.props.setCurrentAudio.bind(this) : undefined}
                  goBack={this.props.goBack}
                  onPlay={this.props.onPlay}
                  onPlaying={this.props.onPlaying}
                  orderAudioTags={this.props.orderAudioTags}
                  playTrack={this.props.playTrack}
                  playNextScene={this.props.playNextScene}
                  systemMessage={this.props.systemMessage}/>
              </Collapse>
            </Grid>
            {i != this.props.scene.audioPlaylists.length-1 && (
              <Grid item xs={12}>
                <Collapse in={this.props.scene.audioEnabled}>
                  <Divider/>
                </Collapse>
              </Grid>
            )}
          </React.Fragment>
        )}
        {this.state.sourceOptions != null && (
          <AudioOptions
            audio={this.state.sourceOptions}
            onCancel={this.onCloseSourceOptions.bind(this)}
            onFinishEdit={this.onFinishSourceOptions.bind(this)}
          />
        )}
      </Grid>
    );
  }

  onFinishSourceOptions(newAudio: Audio) {
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.audioPlaylists[this.state.sourceOptionsPlaylist];
      let editSource = playlist.audios.find((a) => a.id == this.state.sourceOptions.id);
      Object.assign(editSource, newAudio);
    })
    this.onCloseSourceOptions();
  }

  onCloseSourceOptions() {
    this.setState({sourceOptions: null, sourceOptionsPlaylist: -1});
  }

  onSourceOptions(playlistIndex: number, audio: Audio) {
    this.setState({sourceOptions: audio, sourceOptionsPlaylist: playlistIndex});
  }

  onAddPlaylist() {
    this.changeKey('audioPlaylists', this.props.scene.audioPlaylists.concat([{audios: [], shuffle: false, repeat: RP.all}]));
  }

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }
}

(AudioCard as any).displayName="AudioCard";
export default withStyles(styles)(AudioCard as any);