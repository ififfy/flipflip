import * as React from "react";

import {createStyles, Theme, withStyles} from "@material-ui/core";

import Scene from "../../data/Scene";
import SceneEffectGroup from "./SceneEffectGroup";
import ImageVideoGroup from "./ImageVideoGroup";

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
      <React.Fragment>
        <SceneEffectGroup
          scene={this.props.scene}
          isTagging={false}
          isConfig={false}
          allScenes={this.props.allScenes}
          onSetupGrid={this.props.onSetupGrid.bind(this)}
          onUpdateScene={this.props.onUpdateScene.bind(this)} />

        <ImageVideoGroup
          scene={this.props.scene}
          isPlayer={false}
          onUpdateScene={this.props.onUpdateScene.bind(this)}/>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(SceneOptions as any);