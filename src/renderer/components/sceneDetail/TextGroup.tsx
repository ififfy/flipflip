import * as React from 'react';
import {TOT} from "../../const";

import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleURLInput from "../ui/SimpleURLInput";
import ControlGroup from "./ControlGroup";
import Scene from "../../Scene";
import {SceneSettings} from "../../Config";

export default class TextGroup extends React.Component {
  readonly props: {
    scene?: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Text" isNarrow={true}>
        <SimpleOptionPicker
          onChange={this.onChangeTextKind.bind(this)}
          label="Source"
          value={this.props.scene.textKind}
          keys={Object.values(TOT)} />
        <SimpleURLInput
          isEnabled={true}
          onChange={this.onChangeTextSource.bind(this)}
          label={(() => {
            switch (this.props.scene.textKind) {
              case TOT.hastebin: return "Hastebin ID";
              case TOT.url: return "URL";
            }
          })()}
          value={this.props.scene.textSource} />
      </ControlGroup>
    );
  }

  update(fn: (scene: Scene | SceneSettings) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  onChangeTextKind(kind: string) { this.update((s) => { s.textKind = kind; }); }

  onChangeTextSource(textSource: string) { this.update((s) => { s.textSource = textSource; }); }

}