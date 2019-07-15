import * as React from 'react';

import {HTF, TF, VTF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import Scene from "../../data/Scene";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleNumberInput from "../ui/SimpleNumberInput";

export default class ZoomMoveGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Zoom/Move" isNarrow={true}>
        <div className="ControlSubgroup m-inline">
          <SimpleCheckbox
            text="Zoom"
            isOn={this.props.scene.zoom}
            onChange={this.changeKey.bind(this, 'zoom').bind(this)} />
          {this.props.scene.zoom && (
            <div className="ControlSubgroup">
              <SimpleSliderInput
                isEnabled={this.props.scene.zoom}
                onChange={this.onChangeZoomStart.bind(this)}
                label={"Zoom Start: " + this.props.scene.zoomStart}
                min={1}
                max={50}
                value={this.props.scene.zoomStart*10}/>
              <SimpleSliderInput
                isEnabled={this.props.scene.zoom}
                onChange={this.onChangeZoomEnd.bind(this)}
                label={"Zoom End: " + this.props.scene.zoomEnd}
                min={1}
                max={50}
                value={this.props.scene.zoomEnd*10}/>
            </div>
          )}
        </div>

        <div className="ControlSubgroup">
          <SimpleOptionPicker
            onChange={this.changeKey.bind(this, 'horizTransType').bind(this)}
            label="Move Horizontally"
            value={this.props.scene.horizTransType}
            keys={Object.values(HTF)}/>
          {this.props.scene.horizTransType != HTF.none && (
            <SimpleSliderInput
              isEnabled={this.props.scene.horizTransType != HTF.none}
              onChange={this.changeKey.bind(this, 'horizTransLevel').bind(this)}
              label={this.props.scene.horizTransLevel + "%"}
              min={1}
              max={100}
              value={this.props.scene.horizTransLevel}/>
          )}
        </div>
        <div className="ControlSubgroup">
          <SimpleOptionPicker
            onChange={this.changeKey.bind(this, 'vertTransType').bind(this)}
            label="Move Vertically"
            value={this.props.scene.vertTransType}
            keys={Object.values(VTF)}/>
          {this.props.scene.vertTransType != VTF.none && (
            <SimpleSliderInput
              isEnabled={this.props.scene.vertTransType != VTF.none}
              onChange={this.changeKey.bind(this, 'vertTransLevel').bind(this)}
              label={this.props.scene.vertTransLevel + "%"}
              min={1}
              max={100}
              value={this.props.scene.vertTransLevel}/>
          )}
        </div>

        {(this.props.scene.zoom || this.props.scene.horizTransType != HTF.none || this.props.scene.vertTransType != VTF.none) && (
          <div className="ControlSubgroup m-inline">
            <div style={{display: 'flex'}}>
              <SimpleOptionPicker
                onChange={this.changeKey.bind(this, 'transTF').bind(this)}
                label="Transition Length"
                value={this.props.scene.transTF}
                keys={Object.values(TF)}/>
              {this.props.scene.transTF == TF.sin && (
                <div>
                  <SimpleSliderInput
                    label={`Wave Rate: ${this.props.scene.transSinRate}`}
                    min={1}
                    max={100}
                    value={this.props.scene.transSinRate}
                    isEnabled={true}
                    onChange={this.changeKey.bind(this, 'transSinRate').bind(this)}/>
                </div>
              )}
            </div>
            <div className="TimingControlGroup">
              {this.props.scene.transTF == TF.constant && (
                <div>
                  For
                  <SimpleNumberInput
                    label=""
                    value={this.props.scene.transDuration}
                    isEnabled={true}
                    min={0}
                    onChange={this.changeKey.bind(this, 'transDuration').bind(this)}/>
                  ms
                </div>
              )}
              {(this.props.scene.transTF == TF.random || this.props.scene.transTF == TF.sin) && (
                <div>
                  Between
                  <SimpleNumberInput
                    label=""
                    value={this.props.scene.transDurationMin}
                    isEnabled={true}
                    min={0}
                    onChange={this.changeKey.bind(this, 'transDurationMin').bind(this)}/>
                  ms and
                  <SimpleNumberInput
                    label=""
                    value={this.props.scene.transDurationMax}
                    isEnabled={true}
                    min={0}
                    onChange={this.changeKey.bind(this, 'transDurationMax').bind(this)}/>
                  ms
                </div>
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
    if (["zoomStart", "zoomEnd", "horizTransLevel", "vertTransLevel", "transDuration", "transDurationMin", "transDurationMax", "transSinRate"].includes(key)) {
      this.update((s) => s[key] = parseInt(value, 10));
    } else {
      this.update((s) => s[key] = value);
    }
  }

  onChangeZoomStart(value: number) { this.update((s) => { s.zoomStart = value / 10 }); }

  onChangeZoomEnd(value: number) { this.update((s) => { s.zoomEnd = value / 10 }); }

}
