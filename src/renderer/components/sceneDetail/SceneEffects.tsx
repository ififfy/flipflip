import * as React from "react";

import {Card, CardContent, createStyles, Grid, Theme, withStyles} from "@material-ui/core";

import Scene from "../../data/Scene";
import AudioCard from "../configGroups/AudioCard";
import CrossFadeCard from "../configGroups/CrossFadeCard";
import StrobeCard from "../configGroups/StrobeCard";
import TextCard from "../configGroups/TextCard";
import ZoomMoveCard from "../configGroups/ZoomMoveCard";

const styles = (theme: Theme) => createStyles({});

class SceneEffects extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    return(
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <ZoomMoveCard
                scene={this.props.scene}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <CrossFadeCard
                scene={this.props.scene}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <StrobeCard
                scene={this.props.scene}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <AudioCard
                scene={this.props.scene}
                startPlaying={false}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <TextCard
                scene={this.props.scene}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(SceneEffects as any);