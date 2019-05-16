import * as React from 'react';
import {BT, HTF, VTF, ZF} from "../../const";

import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import ControlGroup from "./ControlGroup";
import Scene from "../../Scene";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleColorPicker from "../ui/SimpleColorPicker";
import {SceneSettings} from "../../Config";
import SimpleNumberInput from "../ui/SimpleNumberInput";

export default class EffectGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    allScenes: Array<Scene>,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Effects" isNarrow={true}>
        <SimpleCheckbox
          text="Cross-fade images"
          isOn={this.props.scene.crossFade}
          onChange={this.changeKey.bind(this, 'crossFade').bind(this)}/>

        <div className="ControlSubgroup">
          <SimpleOptionPicker
            onChange={this.changeKey.bind(this, 'backgroundType').bind(this)}
            label="Background"
            value={this.props.scene.backgroundType}
            keys={Object.values(BT)}/>
          {this.props.scene.backgroundType == BT.color && (
            <SimpleColorPicker
              onChange={this.changeKey.bind(this, 'backgroundColor').bind(this)}
              label="Color"
              value={this.props.scene.backgroundColor}/>
          )}
        </div>

        <SimpleCheckbox
          text="Strobe"
          isOn={this.props.scene.strobe}
          onChange={this.changeKey.bind(this, 'strobe').bind(this)} />
        {this.props.scene.strobe && (
          <div className="ControlSubgroup">
            <SimpleColorPicker
              onChange={this.changeKey.bind(this, 'strobeColor').bind(this)}
              label="Color"
              value={this.props.scene.strobeColor} />
            <SimpleSliderInput
              label={"Timing: " + this.props.scene.strobeTime + "ms"}
              min={1} max={300}
              value={this.props.scene.strobeTime}
              isEnabled={true}
              onChange={this.changeKey.bind(this, 'strobeTime').bind(this)} />
            <SimpleCheckbox
              text="Overlay Strobe"
              isOn={this.props.scene.strobeOverlay}
              onChange={this.changeKey.bind(this, 'strobeOverlay').bind(this)} />
          </div>
        )}

        <div className="ControlSubgroup">
          <SimpleOptionPicker
            onChange={this.changeKey.bind(this, 'zoomType').bind(this)}
            label="Zoom Type"
            value={this.props.scene.zoomType}
            keys={Object.values(ZF)}/>
          <SimpleSliderInput
            isEnabled={true}
            onChange={this.changeKey.bind(this, 'effectLevel').bind(this)}
            label={"Effect Length: " + this.props.scene.effectLevel + "s"}
            min={1}
            max={20}
            value={this.props.scene.effectLevel}/>
          <SimpleOptionPicker
            onChange={this.changeKey.bind(this, 'horizTransType').bind(this)}
            label="Translate Horizontally"
            value={this.props.scene.horizTransType}
            keys={Object.values(HTF)}/>
          <SimpleOptionPicker
            onChange={this.changeKey.bind(this, 'vertTransType').bind(this)}
            label="Translate Vertically"
            value={this.props.scene.vertTransType}
            keys={Object.values(VTF)}/>
        </div>

        <div className="ControlSubgroup">
          <SimpleOptionPicker
            onChange={this.onChangeOverlaySceneID.bind(this)}
            label="Overlay scene"
            value={this.props.scene.overlaySceneID.toString()}
            parseKeyFunction={this.getSceneName.bind(this)}
            keys={["0"].concat(this.props.allScenes.map((s) => s.id.toString()))}/>)}
          <SimpleSliderInput
            isEnabled={this.props.scene.overlaySceneID != 0}
            onChange={this.onChangeOverlaySceneOpacity.bind(this)}
            label={"Overlay opacity: " + (this.props.scene.overlaySceneOpacity * 100).toFixed(0) + '%'}
            min={1}
            max={99}
            value={(this.props.scene.overlaySceneOpacity * 100)}/>
          <SimpleOptionPicker
            onChange={this.onChangeNextSceneID.bind(this)}
            label="Next Scene"
            value={this.props.scene.nextSceneID.toString()}
            parseKeyFunction={this.getSceneName.bind(this)}
            keys={["0"].concat(this.props.allScenes.filter((s) => s.id != this.props.scene.id).map((s) => s.id.toString()))}/>)}
          <SimpleNumberInput
            label="Time before playing next scene (sec)"
            min={0}
            value={this.props.scene.nextSceneTime}
            isEnabled={this.props.scene.nextSceneID != 0}
            onChange={this.onChangeNextSceneTime.bind(this)}/>
        </div>
      </ControlGroup>
    );
  }

  getSceneName(id: string): string {
    if (id === "0") return "None";
    return this.props.allScenes.filter((s) => s.id.toString() === id)[0].name;
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  onChangeOverlaySceneOpacity(value: string) { this.update((s) => { s.overlaySceneOpacity = parseInt(value, 10) / 100; }); }

  onChangeOverlaySceneID(id: string) { this.update((s) => { s.overlaySceneID = parseInt(id, 10); }); }

  onChangeNextSceneTime(value: string) { this.update((s) => { s.nextSceneTime = parseInt(value, 10); }); }

  onChangeNextSceneID(id: string) { this.update((s) => { s.nextSceneID = parseInt(id, 10); }); }
}
