import * as React from 'react';

import {BT} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import Scene from "../../data/Scene";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleColorPicker from "../ui/SimpleColorPicker";
import SimpleNumberInput from "../ui/SimpleNumberInput";

export default class ImageEffectGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Image Effects" isNarrow={true}>
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

        <hr/>

        <div className="ControlSubgroup m-inline">
          <SimpleCheckbox
            text="Cross-fade images"
            isOn={this.props.scene.crossFade}
            onChange={this.changeKey.bind(this, 'crossFade').bind(this)}/>
          {this.props.scene.crossFade && (
            <div className="ControlSubgroup m-inline">
              <SimpleCheckbox
                text="Fade Full Duration"
                isOn={this.props.scene.fadeFull}
                onChange={this.changeKey.bind(this, 'fadeFull').bind(this)} />
              {!this.props.scene.fadeFull && (
                <SimpleNumberInput
                  label="Fade Duration (ms)"
                  min={0}
                  value={this.props.scene.fadeDuration}
                  isEnabled={!this.props.scene.fadeFull}
                  onChange={this.changeKey.bind(this, 'fadeDuration').bind(this)} />
              )}
            </div>
          )}
        </div>
      </ControlGroup>
    );
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

}
