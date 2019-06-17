import * as React from 'react';

import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import Scene from "../../data/Scene";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleColorPicker from "../ui/SimpleColorPicker";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import {SL} from "../../data/const";
import SimpleSliderInput from "../ui/SimpleSliderInput";

export default class StrobeGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Strobe" isNarrow={true}>
        <div className="ControlSubgroup">
          <SimpleCheckbox
            text="Strobe"
            isOn={this.props.scene.strobe}
            onChange={this.changeKey.bind(this, 'strobe').bind(this)} />
          {this.props.scene.strobe && (
            <SimpleCheckbox
              text="Add Delay"
              isOn={this.props.scene.strobePulse}
              onChange={this.changeKey.bind(this, 'strobePulse').bind(this)} />
          )}
          {this.props.scene.strobe && (
            <div className="ControlSubgroup">
              <SimpleColorPicker
                onChange={this.changeKey.bind(this, 'strobeColor').bind(this)}
                label="Color"
                value={this.props.scene.strobeColor} />
              <SimpleNumberInput
                label={"Strobe Time (ms)"}
                value={this.props.scene.strobeTime}
                min={0}
                isEnabled={this.props.scene.strobe}
                onChange={this.changeKey.bind(this, 'strobeTime').bind(this)} />
              {this.props.scene.strobePulse && (
                <SimpleNumberInput
                  label={"Strobe Delay (ms)"}
                  value={this.props.scene.strobeDelay}
                  min={0}
                  isEnabled={this.props.scene.strobe}
                  onChange={this.changeKey.bind(this, 'strobeDelay').bind(this)} />
              )}
              <SimpleOptionPicker
                label="Strobe Layer"
                value={this.props.scene.strobeLayer}
                keys={Object.values(SL)}
                onChange={this.changeKey.bind(this, 'strobeLayer').bind(this)}/>
              {this.props.scene.strobeLayer == SL.bottom && (
                <SimpleSliderInput
                  isEnabled={this.props.scene.strobeLayer == SL.bottom}
                  onChange={this.onChangeStrobeOpacity.bind(this)}
                  label={"Strobe opacity: " + (this.props.scene.strobeOpacity * 100).toFixed(0) + '%'}
                  min={0}
                  max={100}
                  value={this.props.scene.strobeOpacity * 100}/>
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

  onChangeStrobeOpacity(value: number) { this.update((s) => { s.strobeOpacity = value / 100 }); }
}
