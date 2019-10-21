import * as React from "react";

import {Card, CardContent, createStyles, Grid, Theme, withStyles} from "@material-ui/core";

import Scene from "../../data/Scene";
import ImageVideoCard from "../configGroups/ImageVideoCard";
import SceneOptionCard from "../configGroups/SceneOptionCard";
import {SceneSettings} from "../../data/Config";

const styles = (theme: Theme) => createStyles({});

class SceneOptions extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SceneOptionCard
                allScenes={this.props.allScenes}
                scene={this.props.scene}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <ImageVideoCard
                scene={this.props.scene}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(SceneOptions as any);