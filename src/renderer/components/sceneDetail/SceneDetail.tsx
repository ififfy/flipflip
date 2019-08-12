import * as React from 'react';

import {IF, OF, VC, WF} from "../../data/const";
import Scene from '../../data/Scene';
import SourcePicker from './SourcePicker';
import AudioGroup from "./AudioGroup";
import ImageEffectGroup from "./ImageEffectGroup";
import SceneEffectGroup from "./SceneEffectGroup";
import ImageGroup from "./ImageGroup";
import TextGroup from "./TextGroup";
import VideoGroup from "./VideoGroup";
import LibrarySource from "../library/LibrarySource";
import Config from "../../data/Config";
import StrobeGroup from "./StrobeGroup";
import ZoomMoveGroup from "./ZoomMoveGroup";
import Jiggle from "../../animations/Jiggle";

export default class SceneDetail extends React.Component {
  readonly nameInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  readonly props: {
    scene: Scene,
    allScenes: Array<Scene>,
    config: Config,
    autoEdit: boolean,
    goBack(): void,
    onExport(scene: Scene): void,
    onPlay(scene: Scene): void,
    onDelete(scene: Scene): void,
    setupGrid(scene: Scene): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    onOpenLibraryImport(scene: Scene): void,
    onClip(source: LibrarySource): void,
    blacklistFile(sourceURL: string, fileToBlacklist: string): void,
    saveScene(): void,
  };

  readonly state = {
    isEditingName: this.props.autoEdit,
    isShowingURLModal: false,
  };

  render() {
    return (
      <div className="SceneDetail" onKeyDown={this.secretHotkey.bind(this)}>

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
                  onChange={this.onChangeName.bind(this)}/>
              </form>
            )}
            {!this.state.isEditingName && (
              <h2
                className="SceneName u-clickable"
                onClick={this.beginEditingName.bind(this)}>{this.props.scene.name}</h2>
            )}
          </div>

          <div style={{float: 'left'}}>
            <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
            <div
              className="DeleteButton u-destructive u-button u-clickable"
              onClick={this.props.onDelete.bind(this, this.props.scene)}>
              Delete
            </div>
          </div>

          <Jiggle
            bounce={false}
            className="ExportButton u-button u-icon-button u-clickable"
            title="Export Scene"
            onClick={this.props.onExport.bind(this, this.props.scene)}>
            <div className="u-export"/>
          </Jiggle>

          <div className="u-button-row-right">
            {(this.props.scene.tagWeights || this.props.scene.sceneWeights) && (
              <div onClick={this.props.saveScene.bind(this)} className="SaveButton u-clickable u-button">
                Save as New Scene
              </div>
            )}
            <Jiggle
              bounce={false}
              onClick={this.props.scene.sources.length > 0 ? this.play.bind(this) : this.nop.bind(this)}
              title="Play"
              className={`u-icon-button u-clickable u-button ${this.props.scene.sources.length > 0 ? '' : 'u-disabled'}`}>
              <div className="u-play"/>
            </Jiggle>
          </div>
        </div>

        <div className="SceneDetail__Content ControlGroupGroup">
          <SceneEffectGroup
            scene={this.props.scene}
            isTagging={false}
            isConfig={false}
            allScenes={this.props.allScenes}
            onSetupGrid={this.props.setupGrid.bind(this)}
            onUpdateScene={this.props.onUpdateScene.bind(this)} />

          <ImageEffectGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)} />

          <ZoomMoveGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)} />

          <StrobeGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)} />

          <ImageGroup
            scene={this.props.scene}
            isPlayer={false}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>

          <AudioGroup
            scene={this.props.scene}
            isPlayer={false}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>

          {this.props.scene.imageTypeFilter != IF.stills && (
            <VideoGroup
              scene={this.props.scene}
              mode={VC.sceneDetail}
              onUpdateScene={this.props.onUpdateScene.bind(this)}/>
          )}

          <TextGroup
            scene={this.props.scene}
            onUpdateScene={this.props.onUpdateScene.bind(this)}/>

          <div className="ControlGroup m-wide">
            <div className="ControlGroup__Title">{`Sources (${this.props.scene.sources.length})`}</div>
            <SourcePicker
              sources={this.props.scene.sources}
              config={this.props.config}
              yOffset={0}
              filters={[]}
              selected={[]}
              emptyMessage="You haven't added any sources to this Scene yet."
              removeAllMessage="Are you sure you want to remove all sources from this scene?"
              removeAllConfirm="Ok"
              isSelect={false}
              isBatchTag={false}
              onUpdateSources={this.onChangeSources.bind(this)}
              onClip={this.props.onClip}
              onBlacklistFile={this.props.blacklistFile}
              onOpenLibraryImport={this.props.onOpenLibraryImport.bind(this, this.props.scene)}
              onChangeTextKind={this.changeKey.bind(this, 'textKind').bind(this)}
              onChangeTextSource={this.changeKey.bind(this, 'textSource').bind(this)} />
          </div>
        </div>
      </div>
    )
  }

  nop() {}

  componentDidMount() {
    if (this.nameInputRef.current) {
      this.nameInputRef.current.select();
      this.nameInputRef.current.focus();
    }
  }

  play() {
    this.props.onPlay(this.props.scene);
  }

  toggleURLImportModal() {
    this.setState({isShowingURLModal: !this.state.isShowingURLModal});
  }

  // Use alt+P to access import modal
  secretHotkey(e: KeyboardEvent) {
    if (e.altKey && e.key == 'p') {
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

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  onChangeName(e: React.FormEvent<HTMLInputElement>) { this.update((s) => { s.name = e.currentTarget.value; }); }

  onChangeSources(sources: Array<LibrarySource>) {
    if (this.props.scene.orderFunction == OF.strict && (sources.length > 1 && this.props.scene.weightFunction == WF.sources)) {
      this.update((s) => {
        s.sources = sources;
        s.orderFunction = OF.ordered;
        return s;
      })
    } else {
      this.update((s) => {
        s.sources = sources;
      });
    }
  }

};