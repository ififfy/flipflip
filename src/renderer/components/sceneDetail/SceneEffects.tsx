import * as React from "react";

import {createStyles, Grid, Theme, withStyles} from "@material-ui/core";

import Scene from "../../data/Scene";
import CrossFadeCard from "./CrossFadeCard";
import ZoomMoveCard from "./ZoomMoveCard";
import StrobeCard from "./StrobeCard";
import AudioCard from "./AudioCard";
import TextCard from "./TextCard";

const styles = (theme: Theme) => createStyles({});

class SceneEffects extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <CrossFadeCard
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)}
          />
        </Grid>

        <Grid item xs={4}>
          <ZoomMoveCard/>
          {/*<ZoomMoveGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)} />*/}
        </Grid>

        <Grid item xs={4}>
          <StrobeCard/>
          {/*<StrobeGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)} />*/}
        </Grid>

        <Grid item xs={4}>
          <AudioCard/>
          {/*<AudioGroup
            scene={this.props.scene}
            isPlayer={false}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>*/}
        </Grid>

        <Grid item xs={4}>
          <TextCard/>
          {/*<TextGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>*/}
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(SceneEffects as any);