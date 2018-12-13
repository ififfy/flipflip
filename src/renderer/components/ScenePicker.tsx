import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {remote} from 'electron';

type Scene = {
  id: Number,
  name: string,
  directories: Array<String>,
};

class ScenePickerItem extends React.Component {
  readonly props: { scene: Scene, onSelect(scene: Scene): void }

  render() {
    return (
      <div className="ScenePickerItem u-clickable" onClick={this.onClick.bind(this)}>
        {this.props.scene.name}
      </div>
    );
  }

  onClick() {
    this.props.onSelect(this.props.scene);
  }
}

export default class ScenePicker extends React.Component {
  readonly props: {
    scenes: Array<Scene>,
    onAdd(scene: Scene): void,
    onSelect(scene: Scene): void,
  }

  render() {
    return (
      <div className="ScenePicker">
        {this.props.scenes.map((scene) => <ScenePickerItem scene={scene} onSelect={this.props.onSelect} />)}
        <div className="ScenePickerItem u-clickable" onClick={this.onAdd.bind(this)}>New scene</div>
      </div>
    );
  }

  onAdd() {
    const id = (this.props.scenes.length > 0
      ? this.props.scenes[this.props.scenes.length - 1].id
      : 1);
    this.props.onAdd({
      id: id,
      name: "New scene",
      directories: []});
  }
};