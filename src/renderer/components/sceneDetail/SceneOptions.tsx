import * as React from "react";

import {createStyles, Grid, Theme, withStyles} from "@material-ui/core";

import Scene from "../../data/Scene";
import SceneEffectCard from "./SceneEffectCard";
import ImageVideoCard from "./ImageVideoCard";

const styles = (theme: Theme) => createStyles({});

class SceneOptions extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    scene: Scene,
    onSetupGrid(scene: Scene): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    return (
      <Grid container spacing={2}>

        <Grid item xs={12} md={6}>
          <SceneEffectCard
            allScenes={this.props.allScenes}
            scene={this.props.scene}
            onSetupGrid={this.props.onSetupGrid.bind(this)}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>
        </Grid>

        <Grid item xs={12} md={6}>
          <ImageVideoCard
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(SceneOptions as any);