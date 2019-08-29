import * as React from 'react';

import {SL, TF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import Scene from "../../data/Scene";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleColorPicker from "../ui/SimpleColorPicker";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
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
        </div>
        {this.props.scene.strobe && (
          <div className="ControlSubgroup m-inline">
            <div className="ControlSubgroup m-inline">
              <SimpleOptionPicker
                label="Strobe Layer"
                value={this.props.scene.strobeLayer}
                keys={Object.values(SL)}
                onChange={this.changeKey.bind(this, 'strobeLayer').bind(this)}/>
              {this.props.scene.strobeLayer != SL.image && (
                <SimpleColorPicker
                  onChange={this.changeKey.bind(this, 'strobeColor').bind(this)}
                  label="Strobe Color"
                  value={this.props.scene.strobeColor} />
              )}
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
            <hr/>
            <div className="ControlSubgroup m-inline">
              <div style={{display: 'flex'}}>
                <SimpleOptionPicker
                  onChange={this.changeKey.bind(this, 'strobeTF').bind(this)}
                  label="Strobe Length"
                  value={this.props.scene.strobeTF}
                  keys={Object.values(TF)}/>
                {this.props.scene.strobeTF == TF.sin && (
                  <div>
                    <SimpleSliderInput
                      label={`Wave Rate: ${this.props.scene.strobeSinRate}`}
                      min={1}
                      max={100}
                      value={this.props.scene.strobeSinRate}
                      isEnabled={true}
                      onChange={this.changeKey.bind(this, 'strobeSinRate').bind(this)}/>
                  </div>
                )}
              </div>
              <div className="TimingControlGroup">
                {this.props.scene.strobeTF == TF.constant && (
                  <div>
                    For
                    <SimpleNumberInput
                      label=""
                      value={this.props.scene.strobeTime}
                      isEnabled={true}
                      min={0}
                      onChange={this.changeKey.bind(this, 'strobeTime').bind(this)}/>
                    ms
                  </div>
                )}
                {(this.props.scene.strobeTF == TF.random || this.props.scene.strobeTF == TF.sin) && (
                  <div>
                    Between
                    <SimpleNumberInput
                      label=""
                      value={this.props.scene.strobeTimeMin}
                      isEnabled={true}
                      min={0}
                      onChange={this.changeKey.bind(this, 'strobeTimeMin').bind(this)}/>
                    ms and
                    <SimpleNumberInput
                      label=""
                      value={this.props.scene.strobeTimeMax}
                      isEnabled={true}
                      min={0}
                      onChange={this.changeKey.bind(this, 'strobeTimeMax').bind(this)}/>
                    ms
                  </div>
                )}
              </div>
              {this.props.scene.strobePulse && (
                <React.Fragment>
                  <hr/>
                  <div style={{display: 'flex'}}>
                    <SimpleOptionPicker
                      onChange={this.changeKey.bind(this, 'strobeDelayTF').bind(this)}
                      label="Delay Length"
                      value={this.props.scene.strobeDelayTF}
                      keys={Object.values(TF)}/>
                    {this.props.scene.strobeDelayTF == TF.sin && (
                      <div>
                        <SimpleSliderInput
                          label={`Wave Rate: ${this.props.scene.strobeDelaySinRate}`}
                          min={1}
                          max={100}
                          value={this.props.scene.strobeDelaySinRate}
                          isEnabled={true}
                          onChange={this.changeKey.bind(this, 'strobeDelaySinRate').bind(this)}/>
                      </div>
                    )}
                  </div>
                  <div className="TimingControlGroup">
                    {this.props.scene.strobeDelayTF == TF.constant && (
                      <div>
                        For
                        <SimpleNumberInput
                          label=""
                          value={this.props.scene.strobeDelay}
                          isEnabled={true}
                          min={0}
                          onChange={this.changeKey.bind(this, 'strobeDelay').bind(this)}/>
                        ms
                      </div>
                    )}
                    {(this.props.scene.strobeDelayTF == TF.random || this.props.scene.strobeDelayTF == TF.sin) && (
                      <div>
                        Between
                        <SimpleNumberInput
                          label=""
                          value={this.props.scene.strobeDelayMin}
                          isEnabled={true}
                          min={0}
                          onChange={this.changeKey.bind(this, 'strobeDelayMin').bind(this)}/>
                        ms and
                        <SimpleNumberInput
                          label=""
                          value={this.props.scene.strobeDelayMax}
                          isEnabled={true}
                          min={0}
                          onChange={this.changeKey.bind(this, 'strobeDelayMax').bind(this)}/>
                        ms
                      </div>
                    )}
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        )}
      </ControlGroup>
    );
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeKey(key: string, value: any) {
    if (["strobeSinRate", "strobeTime", "strobeTimeMin", "strobeTimeMax", "strobeDelaySinRate", "strobeDelay", "strobeDelayMin", "strobeDelayMax"].includes(key)) {
      this.update((s) => s[key] = parseInt(value, 10));
    } else {
      this.update((s) => s[key] = value);
    }
  }

  onChangeStrobeOpacity(value: number) { this.update((s) => { s.strobeOpacity = value / 100 }); }
}
