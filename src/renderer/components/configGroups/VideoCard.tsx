import * as React from "react";

import {createStyles, Grid, Theme, Typography, withStyles} from "@material-ui/core";

import Scene from "../../data/Scene";
import VideoControl from "../player/VideoControl";

const styles = (theme: Theme) => createStyles({});

class VideoCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene,
    otherScenes?: Array<Scene>,
    isPlaying?: boolean,
    mainVideo?: HTMLVideoElement,
    otherVideos?: Array<HTMLVideoElement>,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Typography>Scene Video</Typography>
          <VideoControl
            video={this.props.mainVideo}
            player
            volume={this.props.scene.videoVolume}
            onChangeVolume={this.changeKey.bind(this, 'videoVolume', this.props.scene).bind(this)}/>
        </Grid>
        {this.props.otherVideos && this.props.otherVideos.map((otherVideo, index) => {
          if (otherVideo == null) return <React.Fragment key={index}/>;
          const indexOf = this.props.otherVideos.map((v) => v == null ? v : v.src).indexOf(otherVideo.src);
          if (this.props.otherScenes[indexOf] == null) return <React.Fragment key={index}/>;
          return (
            <Grid item xs={12} key={index}>
              <Typography>{this.props.otherScenes[indexOf].name} Video</Typography>
              <VideoControl
                  video={otherVideo}
                  player
                  onChangeVolume={this.props.mainVideo ? this.changeKey.bind(this, 'videoVolume', this.props.otherScenes[indexOf]).bind(this) : this.nop}/>
            </Grid>
          );}
        )}
      </Grid>
    );
  }

  nop() {}

  changeKey(key: string, scene: Scene,  value: any) {
    this.update(scene, (s) => s[key] = value);
  }

  update(scene: Scene, fn: (scene: any) => void) {
    this.props.onUpdateScene(scene, fn);
  }
}

export default withStyles(styles)(VideoCard as any);