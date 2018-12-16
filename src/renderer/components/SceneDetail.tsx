import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {remote} from 'electron';

import Scene from '../Scene';
import DirectoryPicker from './DirectoryPicker';
import SimpleOptionPicker from './SimpleOptionPicker';
import TIMING_FUNCTIONS from '../TIMING_FUNCTIONS';

type Props = {
  scene?: Scene,
  autoEdit: boolean,
  goBack(): void,
  onPlay(scene: Scene): void,
  onChangeName(scene: Scene, name: string): void,
  onChangeImageTypeFilter(scene: Scene, filter: string): void,
  onChangeTimingFunction(scene: Scene, fnId: string): void,
  onChangeDirectories(scene: Scene, directories: Array<string>): void,
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
        <div className="u-button-row">
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
          <div
            className="DeleteButton u-destructive u-button u-clickable"
            onClick={this.props.onDelete.bind(this, this.props.scene)}>
            Delete
          </div>
        </div>

        <div className="SceneDetail__Content">
          <div className="SceneDetail__Options">
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

            <form className="SceneOptionsForm">
              <SimpleOptionPicker
                onChange={this.props.onChangeTimingFunction.bind(this, this.props.scene)}
                label="Timing"
                value={this.props.scene.timingFunction}
                keys={Array.from(TIMING_FUNCTIONS.keys()).map((s) => s.toString())} />
              <SimpleOptionPicker
                onChange={this.props.onChangeImageTypeFilter.bind(this, this.props.scene)}
                label="Image filter"
                value={this.props.scene.imageTypeFilter}
                keys={['any', 'gifs', 'stills']} />
            </form>

            <div onClick={this.play.bind(this)} className="SceneDetail__PlayButton u-clickable u-button">
              Play
            </div>
          </div>

          <div className='SceneDetail__Sources'>
            <h2>Sources:</h2>
            <DirectoryPicker
              directories={this.props.scene.directories}
              onChange={this.onChangeDirectories.bind(this)} />
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    if (this.nameInputRef.current) {
      this.nameInputRef.current.select();
      this.nameInputRef.current.focus();
    }
  }

  play() {
    this.props.onPlay(this.props.scene);
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

  onChangeDirectories(directories: Array<string>) {
    this.props.onChangeDirectories(this.props.scene, directories);
  }
};