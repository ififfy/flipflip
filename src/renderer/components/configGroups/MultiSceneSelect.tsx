import Select, {components} from "react-select";
import * as React from "react";

import {Checkbox, createStyles,Theme, withStyles} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";

import Scene from "../../data/Scene";

const styles = (theme: Theme) => createStyles({
  select: {
    color: grey[900],
  }
});

class MultiSceneSelect extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene,
    allScenes: Array<Scene>,
    values: Array<number>,
    getSceneName(sceneID: string): void,
    onChange(sceneIDs: Array<number>): void,
  }

  Option = (props: any) => (
    <div>
      <components.Option {...props}>
        <Checkbox className={this.props.classes.select} checked={props.isSelected} onChange={() => null}/>{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
  MultiValue = (props: any) => (
    <components.MultiValue {...props}>
      <span>{props.data.label}</span>
    </components.MultiValue>
  );

  render() {
    const Option = this.Option;
    const MultiValue = this.MultiValue;
    const classes = this.props.classes;
    return (
      <Select
        className={classes.select}
        value={this.props.values.map((id) => {return {label: this.props.getSceneName(id.toString()), value: id}})}
        options={this.props.allScenes.filter((s) => s.id !== this.props.scene.id && s.sources.length > 0).map((s) => s.id.toString()).map((id) => {return {label: this.props.getSceneName(id), value: id}})}
        components={{ Option, MultiValue }}
        isClearable
        isMulti
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        backspaceRemovesValue={false}
        placeholder={"Search scenes ..."}
        onChange={this.onChange.bind(this)} />
    )
  }

  onChange(e: Array<{label: any, value: any}>) {
    this.props.onChange(e.map((v) => v.value));
  }
}

export default withStyles(styles)(MultiSceneSelect as any);