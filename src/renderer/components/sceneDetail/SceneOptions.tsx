import * as React from "react";
import clsx from "clsx";

import { Card, CardContent, Grid, Theme } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import {SDT} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import Scene from "../../data/Scene";
import ImageVideoCard from "../configGroups/ImageVideoCard";
import SceneOptionCard from "../configGroups/SceneOptionCard";
import SceneGrid from "../../data/SceneGrid";

const styles = (theme: Theme) => createStyles({
  backdropTop: {
    zIndex: theme.zIndex.modal + 1,
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid',
  },
  disable: {
    pointerEvents: 'none',
  },
  overflow: {
    overflow: "inherit"
  }
});

class SceneOptions extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    allSceneGrids: Array<SceneGrid>,
    scene: Scene | SceneSettings,
    tutorial: string,
    isConfig: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    const classes = this.props.classes;
    const tutorial1 = this.props.tutorial == SDT.optionsLeft ||
      this.props.tutorial == SDT.timing ||
      this.props.tutorial == SDT.backForth ||
      this.props.tutorial == SDT.imageSizing ||
      this.props.tutorial == SDT.nextScene ||
      this.props.tutorial == SDT.overlays;
    const tutorial2 = this.props.tutorial == SDT.optionsRight ||
      this.props.tutorial == SDT.imageOptions ||
      this.props.tutorial == SDT.videoOptions ||
      this.props.tutorial == SDT.weighting ||
      this.props.tutorial == SDT.sordering ||
      this.props.tutorial == SDT.ordering;
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} className={clsx(tutorial1 && clsx(classes.backdropTop, classes.disable))}>
          <Card classes={{root: classes.overflow}} className={clsx(this.props.tutorial == SDT.optionsLeft && classes.highlight)}>
            <CardContent>
              <SceneOptionCard
                allScenes={this.props.allScenes}
                allSceneGrids={this.props.allSceneGrids}
                scene={this.props.scene}
                tutorial={this.props.tutorial}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} className={clsx(tutorial2 && clsx(classes.backdropTop, classes.disable))}>
          <Card className={clsx(this.props.tutorial == SDT.optionsRight && classes.highlight)}>
            <CardContent>
              <ImageVideoCard
                scene={this.props.scene}
                isConfig={this.props.isConfig}
                tutorial={this.props.tutorial}
                onUpdateScene={this.props.onUpdateScene.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

(SceneOptions as any).displayName="SceneOptions";
export default withStyles(styles)(SceneOptions as any);