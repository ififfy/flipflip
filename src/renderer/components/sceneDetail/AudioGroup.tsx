import * as React from 'react';

import Scene from "../../data/Scene";
import ControlGroup from "./ControlGroup";
import AudioControl from "../player/AudioControl";
import Audio from "../library/Audio";

export default class AudioGroup extends React.Component {
  readonly props: {
    scene: Scene,
    scenePaths?: Array<any>,
    isPlaying?: boolean,
    isPlayer: boolean,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Audio" isNarrow={true}>
        <div className="ControlSubgroup AudioControlGroup m-inline">
          <h4 style={{float: 'left'}}>Scene Audio</h4>
          <div className="u-small-icon-button u-clickable"
               style={{float: 'right'}}
               onClick={this.onAdd.bind(this)}
               title="Add Audio">
            <div className="u-add"/>
          </div>
          <div style={{clear: 'both'}}>
            {this.props.scene.audios.map((a, i) =>
              <React.Fragment
                key={a.id}>
                <div className="u-small-icon-button u-clickable"
                     style={{float: 'right'}}
                     onClick={this.onRemove.bind(this, a.id)}
                     title="Remove Audio">
                  <div className="u-delete"/>
                </div>
                <AudioControl
                  audio={a}
                  showAll={this.props.isPlayer}
                  isPlaying={this.props.isPlaying}
                  scenePaths={this.props.scenePaths}
                  onEditKey={this.onEditKey.bind(this, a.id)}/>
                {i != this.props.scene.audios.length - 1 && (
                  <hr/>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
      </ControlGroup>
    );
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  onEditKey(id: number, key: string, value: string) {
    const newAudios = Array.from(this.props.scene.audios);
    const audio: any = newAudios.find((a) => a.id == id);
    if (["volume", "speed", "tickDelay", "tickMinDelay", "tickMaxDelay"].includes(key)) {
      audio[key] = parseInt(value, 10);
    } else {
      audio[key] = value;
    }
    this.update((s) => {s.audios = newAudios});
  }

  onAdd() {
    let id = this.props.scene.audios.length + 1;
    this.props.scene.audios.forEach((a) => {
      id = Math.max(a.id + 1, id);
    });
    const newAudios = this.props.scene.audios.concat([new Audio({id: id, url: "", volume: 100})]);
    this.update((s) => {s.audios = newAudios});
  }

  onRemove(id: number) {
    const newAudios = Array.from(this.props.scene.audios);
    newAudios.splice(newAudios.map((a) => a.id).indexOf(id), 1);
    this.update((s) => {s.audios = newAudios});
  }
}