import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {remote} from 'electron';

type Scene = {
  id: Number,
  name: string,
  directories: Array<String>,
};

type Props = {
  scene?: Scene,
  goBack(): void,
  onChangeName(scene: Scene, name: String): void,
  onChangeDirectories(scene: Scene, directories: Array<String>): void,
};

export default class SceneDetail extends React.Component {
  readonly props: Props

  readonly state: {
    isEditingName: Boolean
  }

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {isEditingName: false};
  }

  render() {
    return (
      <div className='SceneDetail'>
        <div className="BackButton u-clickable" onClick={this.props.goBack}>Back</div>
        {this.state.isEditingName && (
          <form className="SceneNameForm" onSubmit={this.endEditingName.bind(this)}>
            <input
              type="text"
              value={this.props.scene.name}
              onChange={this.onChangeName.bind(this)} />
          </form>
        )}
        {!this.state.isEditingName && (
          <h1
            className="SceneName u-clickable"
            onClick={this.beginEditingName.bind(this)}>{this.props.scene.name}</h1>
        )}
      </div>
    )
  }

  beginEditingName() {
    this.setState({isEditingName: true});
  }

  endEditingName(e: Event) {
    e.preventDefault();
    this.setState({isEditingName: false});
  }

  onChangeName(e: React.FormEvent<HTMLInputElement>) {
    const scene = this.props.scene;
    if (!scene) return;
    this.props.onChangeName(scene, e.currentTarget.value);
  }
};