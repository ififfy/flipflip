import * as React from 'react';

import {TF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import Scene from "../../data/Scene";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleSliderInput from "../ui/SimpleSliderInput";

export default class CrossFadeGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Cross Fade" isNarrow={true}>
        <div className="ControlSubgroup m-inline">
          <SimpleCheckbox
            text="Cross-fade images"
            isOn={this.props.scene.crossFade}
            onChange={this.changeKey.bind(this, 'crossFade').bind(this)}/>
          {this.props.scene.crossFade && (
            <div className="ControlSubgroup m-inline">
              {!this.props.scene.gridView && (
                <SimpleCheckbox
                  text="Cross-fade audio"
                  isOn={this.props.scene.crossFadeAudio}
                  onChange={this.changeKey.bind(this, 'crossFadeAudio').bind(this)}/>
              )}
              <div style={{display: 'flex'}}>
                <SimpleOptionPicker
                  onChange={this.changeKey.bind(this, 'fadeTF').bind(this)}
                  label="Fade Length"
                  value={this.props.scene.fadeTF}
                  keys={Object.values(TF)}/>
                {this.props.scene.fadeTF == TF.sin && (
                  <div>
                    <SimpleSliderInput
                      label={`Wave Rate: ${this.props.scene.fadeSinRate}`}
                      min={1}
                      max={100}
                      value={this.props.scene.fadeSinRate}
                      isEnabled={true}
                      onChange={this.changeKey.bind(this, 'fadeSinRate').bind(this)}/>
                  </div>
                )}
                {this.props.scene.fadeTF == TF.bpm && (
                  <div>
                    <SimpleSliderInput
                      label={`BPM Multiplier: ${this.props.scene.fadeBPMMulti > 0 ? this.props.scene.fadeBPMMulti : "1 / " + (-1 * (this.props.scene.fadeBPMMulti - 2))}`}
                      min={-8}
                      max={10}
                      value={this.props.scene.fadeBPMMulti}
                      isEnabled={true}
                      onChange={this.changeKey.bind(this, 'fadeBPMMulti').bind(this)}/>
                  </div>
                )}
              </div>
              <div className="TimingControlGroup">
                {this.props.scene.fadeTF == TF.constant && (
                  <div>
                    For
                    <SimpleNumberInput
                      label=""
                      value={this.props.scene.fadeDuration}
                      isEnabled={true}
                      min={0}
                      onChange={this.changeKey.bind(this, 'fadeDuration').bind(this)}/>
                    ms
                  </div>
                )}
                {(this.props.scene.fadeTF == TF.random || this.props.scene.fadeTF == TF.sin) && (
                  <div>
                    Between
                    <SimpleNumberInput
                      label=""
                      value={this.props.scene.fadeDurationMin}
                      isEnabled={true}
                      min={0}
                      onChange={this.changeKey.bind(this, 'fadeDurationMin').bind(this)}/>
                    ms and
                    <SimpleNumberInput
                      label=""
                      value={this.props.scene.fadeDurationMax}
                      isEnabled={true}
                      min={0}
                      onChange={this.changeKey.bind(this, 'fadeDurationMax').bind(this)}/>
                    ms
                  </div>
                )}
              </div>
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
    if (["fadeDuration", "fadeDurationMin", "fadeDurationMax", "fadeSinRate", "fadeBPMMulti"].includes(key)) {
      this.update((s) => s[key] = parseInt(value, 10));
    } else {
      this.update((s) => s[key] = value);
    }
  }

}
