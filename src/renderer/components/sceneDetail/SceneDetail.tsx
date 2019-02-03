import * as React from 'react';

import {IF, TK} from '../../const';

import Scene from '../../Scene';
import ControlGroup from './ControlGroup';
import SourcePicker from './SourcePicker';
import SimpleCheckbox from '../ui/SimpleCheckbox';
import SimpleOptionPicker from '../ui/SimpleOptionPicker';
import SimpleURLInput from "../ui/SimpleURLInput";
import TimingGroup from "./TimingGroup";
import EffectGroup from "./EffectGroup";
import LibrarySource from "../library/LibrarySource";

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
      <div className="SceneDetail"  onKeyDown={this.secretHotkey.bind(this)} tabIndex={0}>

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
            <div onClick={this.props.scene.sources.length > 0 ? this.play.bind(this) : this.nop.bind(this)} className={`u-clickable u-button ${this.props.scene.sources.length > 0 ? '' : 'u-disabled'}`}>
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

          <div className="ControlGroup m-wide">
            <div className="ControlGroup__Title">Sources</div>
            <SourcePicker
              sources={this.props.scene.sources}
              emptyMessage="You haven't added any sources to this Scene yet."
              removeAllMessage="Are you sure you want to remove all sources from this scene?"
              removeAllConfirm="Ok"
              onUpdateSources={this.onChangeSources.bind(this)}
            />
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

  nop() {

  }

  toggleURLImportModal() {
    this.setState({isShowingURLModal: !this.state.isShowingURLModal});
  }

  // Use alt+P to access import modal
  secretHotkey(e: KeyboardEvent) {
    if (e.altKey && e.key=='p') {
      this.toggleURLImportModal();
    }
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

  onChangeSources(sources: Array<LibrarySource>) { this.update((s) => { s.sources = sources; }); }

  onChangeImageTypeFilter(filter: string) { this.update((s) => { s.imageTypeFilter = filter; }); }

  onChangeTextKind(kind: string) { this.update((s) => { s.textKind = kind; }); }

  onChangeTextSource(textSource: string) { this.update((s) => { s.textSource = textSource; }); }

  onChangePlayFullGif(value: boolean) { this.update((s) => { s.playFullGif = value; }); }

  onChangeAudioURL(value: string) { this.update((s) => { s.audioURL = value; }); }
};