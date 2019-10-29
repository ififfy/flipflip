import * as React from "react";

import {Card, CardContent, createStyles, Grid, Theme, withStyles} from "@material-ui/core";

import Scene from "../../data/Scene";
import AudioCard from "../configGroups/AudioCard";
import TextCard from "../configGroups/TextCard";
import {SceneSettings} from "../../data/Config";

const styles = (theme: Theme) => createStyles({});

class AudioTextEffects extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    tutorial: string,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return(
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <AudioCard
                scene={this.props.scene}
                startPlaying={false}
                goBack={this.nop.bind(this)}
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

  nop() {}
}

export default withStyles(styles)(AudioTextEffects as any);