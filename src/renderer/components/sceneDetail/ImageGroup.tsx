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
            onChange={this.onChangeImageTypeFilter.bind(this)}
            label="Image Filter"
            value={this.props.scene.imageTypeFilter}
            keys={Object.values(IF)}/>
          <SimpleCheckbox
            text="Play Full GIF animations"
            isOn={this.props.scene.playFullGif}
            onChange={this.onChangePlayFullGif.bind(this)}/>
        </div>
      </ControlGroup>
    );
  }

  update(fn: (scene: Scene | SceneSettings) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  onChangeImageTypeFilter(filter: string) { this.update((s) => { s.imageTypeFilter = filter; }); }

  onChangePlayFullGif(value: boolean) { this.update((s) => { s.playFullGif = value; }); }
}