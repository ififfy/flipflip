import {createStyles, Theme, withStyles} from "@material-ui/core";
import * as React from "react";
import Scene from "../../data/Scene";
import {SceneSettings} from "../../data/Config";

const styles = (theme: Theme) => createStyles({});

class SceneGenerator extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return(
      <div/>
    );
  }
}

export default withStyles(styles)(SceneGenerator as any);