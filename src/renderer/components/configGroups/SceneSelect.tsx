import Select from "react-select";
import * as React from "react";

import { Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import {grey} from "@mui/material/colors";

import Scene from "../../data/Scene";
import SceneGrid from "../../data/SceneGrid";
import {areWeightsValid} from "../../data/utils";

const styles = (theme: Theme) => createStyles({
  searchSelect: {
    minWidth: 200,
    maxWidth: `calc(100% - ${theme.spacing(7)})`,
    maxHeight: theme.mixins.toolbar.minHeight,
    color: grey[900],
  },
  select: {
    color: grey[900],
  }
});


class SceneSelect extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    value: number,
    allSceneGrids?: Array<SceneGrid>,
    scene?: Scene,
    menuIsOpen?: boolean,
    autoFocus?: boolean,
    includeExtra?: boolean
    onlyExtra?: boolean
    getSceneName(sceneID: string): string,
    onChange(sceneID: number): void,
  }

  render() {
    const classes = this.props.classes;
    let defaults = [this.props.onlyExtra ? "-1" : "0"];
    if (this.props.includeExtra) {
      defaults = ["0", "-1"];
    }
    const scenes = this.props.allScenes.filter((s) => (!this.props.scene || s.id !== this.props.scene.id) && (s.sources.length > 0 || (s.regenerate && areWeightsValid(s)))).map((s) => s.id.toString());
    let idList = defaults.concat(scenes);
    if (this.props.allSceneGrids) {
      idList = idList.concat(this.props.allSceneGrids.map((s) => "999" + s.id));
    }
    const options = idList.map((id) => {return{label: this.props.getSceneName(id), value: id}}).filter((o) => o.label != "library_scene_temp");
    return (
      <Select
        className={classes.select}
        value={{label: this.props.getSceneName(this.props.value.toString()), value: this.props.value}}
        options={options}
        backspaceRemovesValue={false}
        menuIsOpen={this.props.menuIsOpen}
        autoFocus={this.props.autoFocus}
        onChange={this.onChange.bind(this)} />
    )
  }

  onChange(e: {label: any, value: any}) {
    this.props.onChange(e.value);
  }
}

(SceneSelect as any).displayName="SceneSelect";
export default withStyles(styles)(SceneSelect as any);