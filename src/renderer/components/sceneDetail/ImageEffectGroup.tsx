import * as React from 'react';

import {BT, HTF, VTF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import Scene from "../../data/Scene";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleSliderInput from "../ui/SimpleSliderInput";
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

        <div className="ControlSubgroup">
          <SimpleCheckbox
            text="Cross-fade images"
            isOn={this.props.scene.crossFade}
            onChange={this.changeKey.bind(this, 'crossFade').bind(this)}/>
          {this.props.scene.crossFade && (
            <div className="ControlSubgroup">
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

        <hr/>

        <div className="ControlSubgroup">
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
          <div className="ControlSubgroup">
            <SimpleCheckbox
              text="Zoom/Move Full Duration"
              isOn={this.props.scene.transFull}
              onChange={this.changeKey.bind(this, 'transFull').bind(this)} />
            {!this.props.scene.transFull && (
              <SimpleNumberInput
                label="Zoom/Move Duration (ms)"
                min={0}
                value={this.props.scene.transDuration}
                isEnabled={!this.props.scene.transFull}
                onChange={this.changeKey.bind(this, 'transDuration').bind(this)} />
            )}
          </div>
        )}
      </ControlGroup>
    );
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  onChangeZoomStart(value: number) { this.update((s) => { s.zoomStart = value / 10 }); }

  onChangeZoomEnd(value: number) { this.update((s) => { s.zoomEnd = value / 10 }); }

}
