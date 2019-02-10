import * as React from 'react';

import {IF} from "../../const";
import {SceneSettings} from "../../Config";
import Scene from "../../Scene";
import ControlGroup from "./ControlGroup";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";

export default class ImageGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Images" isNarrow={true}>
        <div className="ControlSubgroup">
          <SimpleOptionPicker
            onChange={this.changeKey.bind(this, 'imageTypeFilter').bind(this)}
            label="Image Filter"
            value={this.props.scene.imageTypeFilter}
            keys={Object.values(IF)}/>
          <SimpleCheckbox
            text="Play Full GIF animations"
            isOn={this.props.scene.playFullGif}
            onChange={this.changeKey.bind(this, 'playFullGif').bind(this)}/>
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