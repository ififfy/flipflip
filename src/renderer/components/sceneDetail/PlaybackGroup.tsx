import * as React from 'react';

import {TF, WF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import Scene from "../../data/Scene";
import ControlGroup from "./ControlGroup";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleRadioInput from "../ui/SimpleRadioInput";

export default class PlaybackGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    isPlayer: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Playback" isNarrow={true}>
        <SimpleOptionPicker
          onChange={this.changeKey.bind(this, 'timingFunction').bind(this)}
          label="Timing"
          value={this.props.scene.timingFunction}
          keys={Object.values(TF)}/>
        <SimpleNumberInput
          isEnabled={this.props.scene.timingFunction === TF.constant}
          onChange={this.changeKey.bind(this, 'timingConstant').bind(this)}
          label="Time between images (ms)"
          value={parseInt(this.props.scene.timingConstant, 10)}
          min={0}/>
        {!this.props.isPlayer && (
          <SimpleRadioInput
            label={"Weight"}
            groupName={"wf"}
            value={this.props.scene.weightFunction}
            keys={Object.values(WF)}
            onChange={this.changeKey.bind(this, 'weightFunction').bind(this)} />
        )}
        {/*<SimpleCheckbox
          text={"Random Order"}
          isOn={this.props.scene.randomOrder}
          onChange={this.changeKey.bind(this, 'randomOrder').bind(this)} />*/}
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