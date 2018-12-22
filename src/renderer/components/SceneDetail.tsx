import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {remote} from 'electron';
import {IF, TF, ZF} from '../const';

import Scene from '../Scene';
import DirectoryPicker from './DirectoryPicker';
import SimpleOptionPicker from './SimpleOptionPicker';
import SimpleTextInput from './SimpleTextInput';
import SimpleSliderInput from "./SimpleSliderInput";
import TIMING_FUNCTIONS from '../TIMING_FUNCTIONS';

type Props = {
  scene?: Scene,
  autoEdit: boolean,
  goBack(): void,
  onPlay(scene: Scene): void,
  onChangeName(scene: Scene, name: string): void,
  onChangeImageTypeFilter(scene: Scene, filter: string): void,
  onChangeZoomType(scene: Scene, type: string): void,
  onChangeZoomLevel(scene: Scene, level: number): void,
  onChangeHastebinID(scene: Scene, hbId: string): void,
  onChangeTimingFunction(scene: Scene, fnId: string): void,
  onChangeTimingConstant(scene: Scene, constant: string): void,
  onChangeDirectories(scene: Scene, directories: Array<string>): void,
  onChangeCrossFade(scene: Scene, value: boolean): void,
  onDelete(scene: Scene): void,
};

class Checkbox extends React.Component {
  readonly props: {
    text: string,
    isOn: boolean,
    onChange: (isOn: boolean) => void,
  }

  render() {
    return (
      <label className="Checkbox">
        <input type="checkbox"
          value={this.props.text}
          checked={this.props.isOn} 
          onChange={this.onToggle.bind(this)}
          /> {this.props.text}
      </label>
    )
  }

  onToggle() {
    this.props.onChange(!this.props.isOn);
  }
}

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
                keys={Object.values(TF)} />
              {this.props.scene.timingFunction === TF.constant && (
                <SimpleTextInput
                  onChange={this.props.onChangeTimingConstant.bind(this, this.props.scene)}
                  label="Time between images (ms)"
                  value={this.props.scene.timingConstant.toString()} />
              )}
              <SimpleOptionPicker
                onChange={this.props.onChangeImageTypeFilter.bind(this, this.props.scene)}
                label="Image Filter"
                value={this.props.scene.imageTypeFilter}
                keys={Object.values(IF)} />
              <SimpleOptionPicker
                onChange={this.props.onChangeZoomType.bind(this, this.props.scene)}
                label="Zoom Type"
                value={this.props.scene.zoomType}
                keys={Object.values(ZF)} />
              {this.props.scene.zoomType != ZF.none && (
                <SimpleSliderInput
                  onChange={this.props.onChangeZoomLevel.bind(this, this.props.scene)}
                  label={"Zoom Length: " + this.props.scene.zoomLevel + "s"}
                  min={1}
                  max={20}
                  value={this.props.scene.zoomLevel.toString()} />
              )}
              <SimpleTextInput
                  onChange={this.props.onChangeHastebinID.bind(this, this.props.scene)}
                  label="Hastebin ID"
                  value={this.props.scene.hastebinID} />
              <Checkbox
                text="Cross-fade images"
                isOn={this.props.scene.crossFade}
                onChange={this.onChangeCrossFade.bind(this)} />
            </form>

            <div onClick={this.play.bind(this)} className="SceneDetail__PlayButton u-clickable u-button">
              Play
            </div>
          </div>

          <div className='SceneDetail__Sources'>
            <h2>Sources:</h2>
            <DirectoryPicker
              directories={this.props.scene.directories}
              onChange={this.onChangeDirectories.bind(this)}
              onChangeHastebinID={this.onChangeHastebinID.bind(this)}/>
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

  onChangeHastebinID(hbID: string) {
    this.props.onChangeHastebinID(this.props.scene, hbID);
  }

  onChangeCrossFade(value: boolean) {
    this.props.onChangeCrossFade(this.props.scene, value);
  }
};