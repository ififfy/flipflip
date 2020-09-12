import Select from "react-select";
import * as React from "react";

import {createStyles, Theme, withStyles} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";

import Scene from "../../data/Scene";

const styles = (theme: Theme) => createStyles({
  searchSelect: {
    minWidth: 200,
    maxWidth: `calc(100% - ${theme.spacing(7)}px)`,
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
    scene: Scene,
    allScenes: Array<Scene>,
    value: number,
    getSceneName(sceneID: string): void,
    onChange(sceneID: number): void,
    onRandomSceneDialog?(): void,
  }

  render() {
    const classes = this.props.classes;
    let defaults = ["0"];
    if (this.props.onRandomSceneDialog) {
      defaults = ["0", "-1"];
    }
    return (
      <Select
        className={classes.select}
        value={{label: this.props.getSceneName(this.props.value.toString()), value: this.props.value}}
        options={defaults.concat(this.props.allScenes.filter((s) => s.id !== this.props.scene.id && s.sources.length > 0).map((s) => s.id.toString())).map((id) => {return {label: this.props.getSceneName(id), value: id}})}
        backspaceRemovesValue={false}
        onChange={this.onChange.bind(this)} />
    )
  }

  onChange(e: {label: any, value: any}) {
    this.props.onChange(e.value);
  }
}

export default withStyles(styles)(SceneSelect as any);