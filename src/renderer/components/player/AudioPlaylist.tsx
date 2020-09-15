import * as React from "react";

import {createStyles, Theme, withStyles} from "@material-ui/core";

import AudioControl from "./AudioControl";
import Audio from "../../data/Audio";
import Scene from "../../data/Scene";
import {SceneSettings} from "../../data/Config";

const styles = (theme: Theme) => createStyles({});

class AudioPlaylist extends React.Component {
  readonly props: {
    classes: any,
    playlistIndex: number,
    audios: Array<Audio>,
    scene: Scene,
    sidebar: boolean,
    startPlaying: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
    scenePaths?: Array<any>,
    goBack?(): void,
    playNextScene?(): void,
  };

  readonly state = {
    currentIndex: 0,
  }

  render() {
    const classes = this.props.classes;

    if (this.props.startPlaying) {
      return (
        <AudioControl
          key={this.props.audios[this.state.currentIndex].id}
          playlistIndex={this.props.playlistIndex}
          audio={this.props.audios[this.state.currentIndex]}
          scene={this.props.scene}
          scenePaths={this.props.scenePaths}
          sidebar={this.props.sidebar}
          startPlaying={this.props.startPlaying}
          onUpdateScene={this.props.onUpdateScene.bind(this)}
          goBack={this.props.goBack}
          playNextScene={this.props.playNextScene}/>
      );
    } else {
      return (
        <React.Fragment>
          {this.props.audios.map((a, i) =>
            <AudioControl
              key={a.id}
              audio={a}
              playlistIndex={this.props.playlistIndex}
              scene={this.props.scene}
              scenePaths={this.props.scenePaths}
              sidebar={this.props.sidebar}
              startPlaying={this.props.startPlaying}
              onUpdateScene={this.props.onUpdateScene.bind(this)}
              goBack={this.props.goBack}
              playNextScene={this.props.playNextScene}/>
          )}
        </React.Fragment>
      );
    }
  }
}

export default withStyles(styles)(AudioPlaylist as any);