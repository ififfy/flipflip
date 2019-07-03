import * as React from 'react';

import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import Scene from "../../data/Scene";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import {TF} from "../../data/const";

export default class SceneEffectGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    showAll: boolean
    allScenes: Array<Scene>,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Scene Effects" isNarrow={true}>
        <div className="ControlSubgroup m-inline">
          <SimpleOptionPicker
            onChange={this.changeKey.bind(this, 'timingFunction').bind(this)}
            label="Timing"
            value={this.props.scene.timingFunction}
            keys={Object.values(TF)}/>
          {this.props.scene.timingFunction == TF.constant && (
            <SimpleNumberInput
              isEnabled={this.props.scene.timingFunction === TF.constant}
              onChange={this.changeKey.bind(this, 'timingConstant').bind(this)}
              label="Time between images (ms)"
              value={parseInt(this.props.scene.timingConstant, 10)}
              min={0}/>
          )}
        </div>

        {this.props.showAll && (
          <React.Fragment>
            <hr/>

            <div className="ControlSubgroup m-inline">
              <SimpleOptionPicker
                onChange={this.changeKey.bind(this, 'overlaySceneID').bind(this)}
                label="Overlay scene"
                value={this.props.scene.overlaySceneID.toString()}
                parseKeyFunction={this.getSceneName.bind(this)}
                keys={["0"].concat(this.props.allScenes.filter((s) => s.sources.length > 0).map((s) => s.id.toString()))}/>
              {this.props.scene.overlaySceneID != 0 && (
                <SimpleSliderInput
                  isEnabled={this.props.scene.overlaySceneID != 0}
                  onChange={this.onChangeOverlaySceneOpacity.bind(this)}
                  label={"Overlay opacity: " + (this.props.scene.overlaySceneOpacity * 100).toFixed(0) + '%'}
                  min={1}
                  max={99}
                  value={(this.props.scene.overlaySceneOpacity * 100)}/>
              )}
            </div>

            <hr/>

            <div className="ControlSubgroup  m-inline">
              <SimpleOptionPicker
                onChange={this.changeKey.bind(this, 'nextSceneID').bind(this)}
                label="Next Scene"
                value={this.props.scene.nextSceneID.toString()}
                parseKeyFunction={this.getSceneName.bind(this)}
                keys={["0"].concat(this.props.allScenes.filter((s) => s.id !== this.props.scene.id && s.sources.length > 0).map((s) => s.id.toString()))}/>
              {this.props.scene.nextSceneID != 0 && (
                <SimpleNumberInput
                  label="Time before playing next scene (sec)"
                  min={1}
                  value={this.props.scene.nextSceneTime}
                  isEnabled={this.props.scene.nextSceneID != 0}
                  onChange={this.changeKey.bind(this, 'nextSceneTime').bind(this)}/>
              )}
            </div>
          </React.Fragment>
        )}
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

  onChangeOverlaySceneOpacity(value: number) { this.update((s) => { s.overlaySceneOpacity = value / 100 }); }
}
