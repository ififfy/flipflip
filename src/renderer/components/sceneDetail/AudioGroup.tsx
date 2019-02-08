import * as React from 'react';

import Scene from "../../Scene";
import ControlGroup from "./ControlGroup";
import SimpleURLInput from "../ui/SimpleURLInput";

export default class AudioGroup extends React.Component {
  readonly props: {
    scene: Scene,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Audio" isNarrow={true}>
        <SimpleURLInput
          isEnabled={true}
          onChange={this.onChangeAudioURL.bind(this)}
          label="URL"
          value={this.props.scene.audioURL}/>
      </ControlGroup>
    );
  }

  update(fn: (scene: Scene) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  onChangeAudioURL(value: string) { this.update((s) => { s.audioURL = value; }); }
}