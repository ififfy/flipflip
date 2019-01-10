import * as React from 'react';

import {IF, TF, ZF, TK, HTF, VTF} from '../../const';

import Scene from '../../Scene';
import DirectoryPicker from './DirectoryPicker';
import SimpleCheckbox from '../ui/SimpleCheckbox';
import SimpleOptionPicker from '../ui/SimpleOptionPicker';
import SimpleTextInput from '../ui/SimpleTextInput';
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleURLInput from "../ui/SimpleURLInput";
import URLModal from './URLModal';

type Props = {
  scene?: Scene,
  allScenes: Array<Scene>,
  autoEdit: boolean,
  goBack(): void,
  onPlay(scene: Scene): void,
  onDelete(scene: Scene): void,
  onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
};

class ControlGroup extends React.Component {
  readonly props: {
    title: string,
    isNarrow: boolean,
    children: React.ReactNode,
  };

  render() {
    return (
      <form
          className={`ControlGroup ${this.props.isNarrow ? 'm-narrow' : 'm-wide'}`}
          onSubmit={this.preventDefault.bind(this)}>
        <div className="ControlGroup__Title">{this.props.title}</div>
        {this.props.children}
      </form>
    );
  }

  preventDefault(e: Event) {
    e.preventDefault();
    return;
  }
}

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
            <div onClick={this.play.bind(this)} className="u-clickable u-button">
              Play
            </div>
          </div>
        </div>

        <div className="SceneDetail__Content ControlGroupGroup">
          <ControlGroup title="Sources" isNarrow={false}>
            <DirectoryPicker
              directories={this.props.scene.directories}
              onImportURL={this.onImportURL.bind(this)}
              onChange={this.onChangeDirectories.bind(this)}/>
          </ControlGroup>
        
          <ControlGroup title="Timing" isNarrow={true}>
            <SimpleOptionPicker
              onChange={this.onChangeTimingFunction.bind(this)}
              label="Timing"
              value={this.props.scene.timingFunction}
              keys={Object.values(TF)} />
            <SimpleTextInput
              isEnabled={this.props.scene.timingFunction === TF.constant}
              onChange={this.onChangeTimingConstant.bind(this)}
              label="Time between images (ms)"
              value={this.props.scene.timingConstant.toString()} />
          </ControlGroup>

          <ControlGroup title="Effects" isNarrow={true}>

            <SimpleCheckbox
              text="Cross-fade images"
              isOn={this.props.scene.crossFade}
              onChange={this.onChangeCrossFade.bind(this)} />

            <div className="ControlSubgroup">
              <SimpleOptionPicker
                onChange={this.onChangeZoomType.bind(this)}
                label="Zoom Type"
                value={this.props.scene.zoomType}
                keys={Object.values(ZF)} />
              <SimpleSliderInput
                  isEnabled={true}
                  onChange={this.onChangeEffectLevel.bind(this)}
                  label={"Effect Length: " + this.props.scene.effectLevel + "s"}
                  min={1}
                  max={20}
                  value={this.props.scene.effectLevel.toString()} />
              <SimpleOptionPicker
                  onChange={this.onChangeHorizTransType.bind(this)}
                  label="Translate Horizontally"
                  value={this.props.scene.horizTransType}
                  keys={Object.values(HTF)} />
              <SimpleOptionPicker
                  onChange={this.onChangeVertTransType.bind(this)}
                  label="Translate Vertically"
                  value={this.props.scene.vertTransType}
                  keys={Object.values(VTF)} />
            </div>

            <div className="ControlSubgroup">
              <SimpleOptionPicker
                onChange={this.onChangeOverlaySceneID.bind(this)}
                label="Overlay scene"
                value={this.props.scene.overlaySceneID.toString()}
                getLabel={this.getSceneName.bind(this)}
                keys={["0"].concat(this.props.allScenes.map((s) => s.id.toString()))} />
              <SimpleSliderInput
                isEnabled={this.props.scene.overlaySceneID != 0}
                onChange={this.onChangeOverlaySceneOpacity.bind(this)}
                label={"Overlay opacity: " + (this.props.scene.overlaySceneOpacity * 100).toFixed(0) + '%'}
                min={1}
                max={100}
                value={(this.props.scene.overlaySceneOpacity * 100).toString()} />
            </div>
          </ControlGroup>

          <ControlGroup title="Images" isNarrow={true}>
            <SimpleOptionPicker
              onChange={this.onChangeImageTypeFilter.bind(this)}
              label="Image Filter"
              value={this.props.scene.imageTypeFilter}
              keys={Object.values(IF)} />
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

  getSceneName(id: string): string {
    if (id === "0") return "none";
    return this.props.allScenes.filter((s) => s.id.toString() === id)[0].name;
  }

  play() {
    this.props.onPlay(this.props.scene);
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

  onChangeOverlaySceneOpacity(value: string) {
    this.update((s) => { s.overlaySceneOpacity = parseInt(value, 10) / 100; });
  }

  onChangeImageTypeFilter(filter: string) { this.update((s) => { s.imageTypeFilter = filter; }); }

  onChangeZoomType(type: string) { this.update((s) => { s.zoomType = type; }); }

  onChangeEffectLevel(level: number) { this.update((s) => { s.effectLevel = level; }); }

  onChangeHorizTransType(type: string) { this.update((s) => { s.horizTransType = type; }); }

  onChangeVertTransType(type: string) { this.update((s) => { s.vertTransType = type; }); }

  onChangeOverlaySceneID(id: string) { this.update((s) => { s.overlaySceneID = parseInt(id, 10); }); }

  onChangeTextKind(kind: string) { this.update((s) => { s.textKind = kind; }); }

  onChangeTextSource(textSource: string) { this.update((s) => { s.textSource = textSource; }); }

  onChangeTimingFunction(fnId: string) { this.update((s) => { s.timingFunction = fnId; }); }

  onChangeTimingConstant(constant: string) { this.update((s) => { s.timingConstant = constant; }); }

  onChangeCrossFade(value: boolean) { this.update((s) => { s.crossFade = value; }); }

  onChangeAudioURL(value: string) { this.update((s) => { s.audioURL = value; }); }
};