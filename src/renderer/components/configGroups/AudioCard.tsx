import * as React from "react";

import {
  Collapse, createStyles, Fab, FormControlLabel, Grid, Switch, Theme, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';

import {SceneSettings} from "../../data/Config";
import Audio from "../../data/Audio";
import Scene from "../../data/Scene";
import AudioControl from "../player/AudioControl";

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
    scenePaths?: Array<any>,
    goBack?(): void,
    playNextScene?(): void,
  };

  render() {
    const classes = this.props.classes;

    return(
      <Grid container spacing={2} alignItems="center">
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
              <Collapse in={this.props.scene.audioEnabled}>
                <Fab
                  className={classes.addButton}
                  onClick={this.onAddAudioTrack.bind(this)}
                  size="small">
                  <AddIcon />
                </Fab>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        {this.props.scene.audios && this.props.scene.audios.map((a,i) =>
          <AudioControl
            key={a.id}
            audio={a}
            isFirst={i == 0}
            scene={this.props.scene}
            scenePaths={this.props.scenePaths}
            sidebar={this.props.sidebar}
            startPlaying={this.props.startPlaying}
            onUpdateScene={this.props.onUpdateScene.bind(this)}
            goBack={this.props.goBack}
            playNextScene={this.props.playNextScene}/>
        )}
      </Grid>
    );
  }

  onAddAudioTrack() {
    let id = this.props.scene.audios.length + 1;
    this.props.scene.audios.forEach((a) => {
      id = Math.max(a.id + 1, id);
    });
    const newAudios = this.props.scene.audios.concat([new Audio({id: id, url: ""})]);
    this.changeKey('audios', newAudios);
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