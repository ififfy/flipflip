import * as React from 'react';

import {IF, TK} from '../../const';

import Scene from '../../Scene';
import ControlGroup from './ControlGroup';
import DirectoryPicker from './DirectoryPicker';
import SimpleCheckbox from '../ui/SimpleCheckbox';
import SimpleOptionPicker from '../ui/SimpleOptionPicker';
import SimpleURLInput from "../ui/SimpleURLInput";
import URLModal from './URLModal';
import TimingGroup from "./TimingGroup";
import EffectGroup from "./EffectGroup";

type Props = {
  scene?: Scene,
  allScenes: Array<Scene>,
  autoEdit: boolean,
  goBack(): void,
  onPlay(scene: Scene): void,
  onDelete(scene: Scene): void,
  onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
};

export default class SceneDetail extends React.Component {
  readonly props: Props;
  readonly nameInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  readonly state: {
    isEditingName: boolean,
    isShowingURLModal: boolean,
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {isEditingName: props.autoEdit, isShowingURLModal: false};
  }

  render() {
    return (
      <div className='SceneDetail'>
        {this.state.isShowingURLModal && (
            <URLModal
              onClose={this.closeModals.bind(this)}
              directories={this.props.scene.directories}
              onChangeDirectories={this.onChangeDirectories.bind(this)}
              onChangeTextKind={this.onChangeTextKind.bind(this)}
              onChangeTextSource={this.onChangeTextSource.bind(this)} />
        )}

        <div className="u-button-row">
          <div className="u-abs-center">
            {this.state.isEditingName && (
              <form className="SceneNameForm" onSubmit={this.endEditingName.bind(this)}>
                <input
                  autoFocus
                  type="text"
                  ref={this.nameInputRef}
                  value={this.props.scene.name}
                  onBlur={this.endEditingName.bind(this)}
                  onChange={this.onChangeName.bind(this)} />
              </form>
            )}
            {!this.state.isEditingName && (
              <h2
                className="SceneName u-clickable"
                onClick={this.beginEditingName.bind(this)}>{this.props.scene.name}</h2>
            )}
          </div>

          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
          <div
            className="DeleteButton u-destructive u-button u-clickable"
            onClick={this.props.onDelete.bind(this, this.props.scene)}>
            Delete
          </div>

          <div className="u-button-row-right">
            <div onClick={this.props.scene.directories.length > 0 ? this.play.bind(this) : this.nop.bind(this)} className={`u-clickable u-button ${this.props.scene.directories.length > 0 ? '' : 'u-disabled'}`}>
              Play
            </div>
          </div>
        </div>

        <div className="SceneDetail__Content ControlGroupGroup">
          <TimingGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>

          <EffectGroup
            scene={this.props.scene}
            allScenes={this.props.allScenes}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>

          <ControlGroup title="Images" isNarrow={true}>
            <div className="ControlSubgroup">
              <SimpleOptionPicker
                onChange={this.onChangeImageTypeFilter.bind(this)}
                label="Image Filter"
                value={this.props.scene.imageTypeFilter}
                keys={Object.values(IF)} />
              <SimpleCheckbox
                  text="Play Full GIF animations"
                  isOn={this.props.scene.playFullGif}
                  onChange={this.onChangePlayFullGif.bind(this)} />
            </div>
          </ControlGroup>

          <ControlGroup title="Text" isNarrow={true}>
            <SimpleOptionPicker
              onChange={this.onChangeTextKind.bind(this)}
              label="Source"
              value={this.props.scene.textKind}
              keys={Object.values(TK)} />
            <SimpleURLInput
              isEnabled={true}
              onChange={this.onChangeTextSource.bind(this)}
              label={(() => {
                switch (this.props.scene.textKind) {
                  case TK.hastebin: return "Hastebin ID";
                  case TK.url: return "URL";
                }
              })()}
              value={this.props.scene.textSource} />
          </ControlGroup>

          <ControlGroup title="Audio" isNarrow={true}>
            <SimpleURLInput
              isEnabled={true}
              onChange={this.onChangeAudioURL.bind(this)}
              label="URL"
              value={this.props.scene.audioURL} />
          </ControlGroup>

          <ControlGroup title="Sources" isNarrow={false}>
            <DirectoryPicker
                directories={this.props.scene.directories}
                onImportURL={this.onImportURL.bind(this)}
                onChange={this.onChangeDirectories.bind(this)}/>
          </ControlGroup>

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

  closeModals() {
    this.setState({isShowingURLModal: false});
  }

  play() {
    this.props.onPlay(this.props.scene);
  }

  nop() {

  }

  onImportURL() {
    this.setState({isShowingURLModal: true});
  }

  beginEditingName() {
    this.setState({isEditingName: true});
  }

  endEditingName(e: Event) {
    e.preventDefault();
    this.setState({isEditingName: false});
  }

  update(fn: (scene: Scene) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  onChangeName(e: React.FormEvent<HTMLInputElement>) {
    this.update((s) => { s.name = e.currentTarget.value; });
  }

  onChangeDirectories(directories: Array<string>) { this.update((s) => { s.directories = directories; }); }

  onChangeImageTypeFilter(filter: string) { this.update((s) => { s.imageTypeFilter = filter; }); }

  onChangeTextKind(kind: string) { this.update((s) => { s.textKind = kind; }); }

  onChangeTextSource(textSource: string) { this.update((s) => { s.textSource = textSource; }); }

  onChangePlayFullGif(value: boolean) { this.update((s) => { s.playFullGif = value; }); }

  onChangeAudioURL(value: string) { this.update((s) => { s.audioURL = value; }); }
};