import * as React from 'react';
import {HTF, VTF, ZF, BT} from "../../const";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import ControlGroup from "./ControlGroup";
import Scene from "../../Scene";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleTextInput from "../ui/SimpleTextInput";
import SimpleColorPicker from "../ui/SimpleColorPicker";

export default class EffectGroup extends React.Component {
  readonly props: {
    scene: Scene,
    allScenes?: Array<Scene>,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Effects" isNarrow={true}>
        <SimpleCheckbox
          text="Cross-fade images"
          isOn={this.props.scene.crossFade}
          onChange={this.onChangeCrossFade.bind(this)} />

        
          <SimpleOptionPicker
            onChange={this.onChangeBackgroundType.bind(this)}
            label="Background"
            value={this.props.scene.backgroundType}
            keys={Object.values(BT)} />

          {this.props.scene.backgroundType==BT.color &&
          <SimpleColorPicker 
            isEnabled={this.props.scene.backgroundType== BT.color}
            onChange={this.onChangeBackgroundColor.bind(this)}
            label=""
            value={this.props.scene.backgroundColor.toString()} />
          }
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
          {this.props.allScenes != null && (
            <SimpleOptionPicker
              onChange={this.onChangeOverlaySceneID.bind(this)}
              label="Overlay scene"
              value={this.props.scene.overlaySceneID.toString()}
              getLabel={this.getSceneName.bind(this)}
              keys={["0"].concat(this.props.allScenes.map((s) => s.id.toString()))} />)}
          {(this.props.allScenes != null || this.props.scene.overlaySceneID != 0) && (
            <SimpleSliderInput
              isEnabled={this.props.scene.overlaySceneID != 0}
              onChange={this.onChangeOverlaySceneOpacity.bind(this)}
              label={"Overlay opacity: " + (this.props.scene.overlaySceneOpacity * 100).toFixed(0) + '%'}
              min={1}
              max={99}
              value={(this.props.scene.overlaySceneOpacity * 100).toString()} />)}
        </div>
      </ControlGroup>
    );
  }

  getSceneName(id: string): string {
    if (id === "0") return "None";
    return this.props.allScenes.filter((s) => s.id.toString() === id)[0].name;
  }

  update(fn: (scene: Scene) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  onChangeCrossFade(value: boolean) { this.update((s) => { s.crossFade = value; }); }

  onChangeZoomType(type: string) { this.update((s) => { s.zoomType = type; }); }

  onChangeEffectLevel(level: number) { this.update((s) => { s.effectLevel = level; }); }

  onChangeHorizTransType(type: string) { this.update((s) => { s.horizTransType = type; }); }

  onChangeVertTransType(type: string) { this.update((s) => { s.vertTransType = type; }); }

  onChangeOverlaySceneOpacity(value: string) { this.update((s) => { s.overlaySceneOpacity = parseInt(value, 10) / 100; }); }

  onChangeOverlaySceneID(id: string) { this.update((s) => { s.overlaySceneID = parseInt(id, 10); }); }

  onChangeBackgroundColor(type: string) { this.update((s) => { s.backgroundColor = type; }); }

  onChangeBackgroundType(type: string) { this.update((s) => { s.backgroundType = type; }); }
}
