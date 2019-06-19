import * as React from 'react';

import {IF, WF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import Scene from "../../data/Scene";
import ControlGroup from "./ControlGroup";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleRadioInput from "../ui/SimpleRadioInput";

export default class ImageGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    isPlayer: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Images" isNarrow={true}>
        <div className="ControlSubgroup  m-inline">
          {!this.props.isPlayer && (
            <SimpleOptionPicker
              onChange={this.changeKey.bind(this, 'imageTypeFilter').bind(this)}
              label="Image Filter"
              value={this.props.scene.imageTypeFilter}
              keys={Object.values(IF)}/>
          )}
          {!this.props.isPlayer && this.props.scene.imageTypeFilter != IF.stills && (
            <SimpleCheckbox
              text="Play Full GIF animations"
              isOn={this.props.scene.playFullGif}
              onChange={this.changeKey.bind(this, 'playFullGif').bind(this)}/>
          )}
        </div>
        <div className="ControlSubgroup m-inline">
          {!this.props.isPlayer && (
            <SimpleRadioInput
              label={"Weight"}
              groupName={"wf"}
              value={this.props.scene.weightFunction}
              keys={Object.values(WF)}
              onChange={this.changeKey.bind(this, 'weightFunction').bind(this)} />
          )}
          <SimpleCheckbox
            text={"Randomize"}
            isOn={this.props.scene.randomize}
            onChange={this.changeKey.bind(this, 'randomize').bind(this)} />
          <SimpleCheckbox
            text={"Show All Images Before Looping"}
            isOn={this.props.scene.forceAll}
            onChange={this.changeKey.bind(this, 'forceAll').bind(this)} />
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