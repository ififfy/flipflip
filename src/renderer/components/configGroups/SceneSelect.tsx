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
    allScenes: Array<Scene>,
    value: number,
    scene?: Scene,
    menuIsOpen?: boolean,
    autoFocus?: boolean,
    includeExtra?: boolean
    onlyExtra?: boolean
    getSceneName(sceneID: string): void,
    onChange(sceneID: number): void,
  }

  render() {
    const classes = this.props.classes;
    let defaults = [this.props.onlyExtra ? "-1" : "0"];
    if (this.props.includeExtra) {
      defaults = ["0", "-1"];
    }
    return (
      <Select
        className={classes.select}
        value={{label: this.props.getSceneName(this.props.value.toString()), value: this.props.value}}
        options={defaults.concat(this.props.allScenes.filter((s) => (!this.props.scene || s.id !== this.props.scene.id) && s.sources.length > 0).map((s) => s.id.toString())).map((id) => {return {label: this.props.getSceneName(id), value: id}})}
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

export default withStyles(styles)(SceneSelect as any);