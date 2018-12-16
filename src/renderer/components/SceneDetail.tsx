import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {remote} from 'electron';

import Scene from '../Scene';
import DirectoryPicker from './DirectoryPicker';
import ScenePicker from './ScenePicker';

type Props = {
  scene?: Scene,
  autoEdit: boolean,
  goBack(): void,
  onChangeName(scene: Scene, name: String): void,
  onChangeDirectories(scene: Scene, directories: Array<String>): void,
  onDelete(scene: Scene): void,
};

export default class SceneDetail extends React.Component {
  readonly props: Props
  readonly nameInputRef: React.RefObject<HTMLInputElement> = React.createRef()

  readonly state: {
    isEditingName: boolean,
  }

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {isEditingName: props.autoEdit};
  }

  render() {
    return (
      <div className='SceneDetail'>
        <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        <div
          className="DeleteButton u-destructive u-button u-clickable"
          onClick={this.props.onDelete.bind(this, this.props.scene)}>
          Delete
        </div>
        {this.state.isEditingName && (
          <form className="SceneNameForm" onSubmit={this.endEditingName.bind(this)}>
            <input
              type="text"
              ref={this.nameInputRef}
              value={this.props.scene.name}
              onChange={this.onChangeName.bind(this)} />
          </form>
        )}
        {!this.state.isEditingName && (
          <h1
            className="SceneName u-clickable"
            onClick={this.beginEditingName.bind(this)}>{this.props.scene.name}</h1>
        )}

        <DirectoryPicker
          directories={this.props.scene.directories}
          onChange={this.onChangeDirectories.bind(this)} />
      </div>
    )
  }

  componentDidMount() {
    if (this.nameInputRef.current) {
      this.nameInputRef.current.select();
      this.nameInputRef.current.focus();
    }
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

  onChangeDirectories(directories: Array<String>) {
    this.props.onChangeDirectories(this.props.scene, directories);
  }
};