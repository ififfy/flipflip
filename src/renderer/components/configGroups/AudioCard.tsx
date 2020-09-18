import * as React from "react";

import {
  Collapse, createStyles, Divider, Fab, FormControlLabel, Grid, Switch, Theme, Tooltip, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';

import {SceneSettings} from "../../data/Config";
import Scene from "../../data/Scene";
import AudioPlaylist from "../player/AudioPlaylist";

const styles = (theme: Theme) => createStyles({
  addButton: {
    boxShadow: 'none',
  },
});

class AudioCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    sidebar: boolean,
    startPlaying: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
    onAddTracks?(playlistIndex: number): void,
    scenePaths?: Array<any>,
    goBack?(): void,
    playNextScene?(): void,
  };

  render() {
    const classes = this.props.classes;
    return(
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <FormControlLabel
                control={
                  <Switch checked={this.props.scene.audioEnabled}
                          onChange={this.onBoolInput.bind(this, 'audioEnabled')}/>
                }
                label="Audio Tracks"/>
            </Grid>
            <Grid item>
              <Collapse in={this.props.scene.audioEnabled && !this.props.startPlaying}>
                <Tooltip title={"Add Playlist"}>
                  <Fab
                    className={classes.addButton}
                    onClick={this.onAddAudioTrack.bind(this)}
                    size="small">
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        {this.props.scene.audioPlaylists.map((a, i) =>
          <Grid item xs={12} key={i}>
            <Collapse in={this.props.scene.audioEnabled}>
              <AudioPlaylist
                playlistIndex={i}
                audios={a}
                scene={this.props.scene}
                scenePaths={this.props.scenePaths}
                sidebar={this.props.sidebar}
                startPlaying={this.props.startPlaying}
                onAddTracks={this.props.onAddTracks}
                onUpdateScene={this.props.onUpdateScene.bind(this)}
                goBack={this.props.goBack}
                playNextScene={this.props.playNextScene}/>
              {i != this.props.scene.audioPlaylists.length-1 && (
                <Divider/>
              )}
            </Collapse>
          </Grid>
        )}
      </Grid>
    );
  }

  onAddAudioTrack() {
    this.changeKey('audioPlaylists', this.props.scene.audioPlaylists.concat([[]]));
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

export default withStyles(styles)(AudioCard as any);