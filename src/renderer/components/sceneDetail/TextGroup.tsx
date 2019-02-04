import * as React from 'react';
import {TK} from "../../const";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleURLInput from "../ui/SimpleURLInput";
import ControlGroup from "./ControlGroup";
import Scene from "../../Scene";

export default class TextGroup extends React.Component {
  readonly props: {
    scene?: Scene,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Text" isNarrow={true}>
        <SimpleOptionPicker
          onChange={this.onChangeTextKind.bind(this)}
          label="Source"
          value={this.props.scene.textKind}
          keys={Object.values(TK)} />
        <SimpleURLInput
          isEnabled={true}
          onChange={this.onChangeTextSource.bind(this)}
          label={(() => {
            switch (this.props.scene.textKind) {
              case TK.hastebin: return "Hastebin ID";
              case TK.url: return "URL";
            }
          })()}
          value={this.props.scene.textSource} />
      </ControlGroup>
    );
  }

  update(fn: (scene: Scene) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  onChangeTextKind(kind: string) { this.update((s) => { s.textKind = kind; }); }

  onChangeTextSource(textSource: string) { this.update((s) => { s.textSource = textSource; }); }

}