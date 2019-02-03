import * as React from 'react';

import {remote} from 'electron';
import Scene from '../Scene';
import Sortable from "sortablejs";
import {array_move} from "../utils";

class ScenePickerItem extends React.Component {
  readonly props: { scene: Scene, onSelect(scene: Scene): void };

  render() {
    return (
      <div
          className={`ScenePickerItem u-clickable u-draggable ${this.props.scene.tagWeights ? 'm-generator' : ''}`}
          onClick={this.onClick.bind(this)}>
        <div className="ScenePickerItem__Title">
          {this.props.scene.name}
        </div>
      </div>
    );
  }

  onClick() {
    this.props.onSelect(this.props.scene);
  }
}

class Link extends React.Component {
  readonly props: {
    url: string,
    onClick?(): void,
    children?: React.ReactNode,
  };

  render() {
    return <a href={this.props.url} onClick={this.onClick.bind(this)}>{this.props.children}</a>
  }

  onClick(e: Event) {
    e.preventDefault();
    if (this.props.onClick) {
      this.props.onClick();
    } else {
      remote.shell.openExternal(this.props.url);
    }
  }
}

export default class ScenePicker extends React.Component {
  readonly props: {
    scenes: Array<Scene>,
    canGenerate: boolean,
    onAdd(): void,
    onSelect(scene: Scene): void,
    onOpenLibrary(): void,
    onGenerate(): void,
    onUpdateScenes(scenes: Array<Scene>): void,
  };

  render() {
    return (
      <div className="ScenePicker">
        <div className="About">
          <h1>FlipFlip</h1>

          <p><Link url="https://github.com/ififfy/flipflip/wiki/FlipFlip-User-Manual">User manual</Link></p>

          <p>
            <Link url="https://github.com/ififfy/flipflip/issues">Report a problem or suggest an improvement</Link>
          </p>

          <p>
            If you like FlipFlip, drop me a line at <a href="mailto:ififfy@mm.st">ififfy@mm.st</a> and tell me
            about how you're using it. :-)
          </p>
        </div>

        <div className="ScenePicker__Buttons">
          <div className="ScenePicker__LibraryButton u-clickable" onClick={this.props.onOpenLibrary}>
            Library
          </div>
          <div className={`ScenePicker__GenerateSceneButton ${this.props.canGenerate ? 'u-clickable' : 'u-disabled'}`} onClick={this.props.canGenerate ? this.props.onGenerate.bind(this) : this.nop}>
            + Add Scene Generator
          </div>
          <div className={`ScenePicker__AddSceneButton ${this.props.canGenerate ? 'u-clickable' : 'u-disabled'}`} onClick={this.props.canGenerate ? this.props.onAdd.bind(this) : this.nop}>
            + Add Scene
          </div>
        </div>

        <hr/>

        <div className="ScenePicker__Scenes" id="scenes" >
          {this.props.scenes.map((scene) =>
            <ScenePickerItem key={`${scene.id}`} scene={scene} onSelect={this.props.onSelect} />
          )}
        </div>
      </div>
    );
  }

  nop () {}

  onEnd(evt: any) {
    let newScenes = this.props.scenes;
    array_move(newScenes, evt.oldIndex, evt.newIndex);
    this.props.onUpdateScenes(newScenes);
  }

  componentDidMount() {
    if (this.props.scenes.length == 0) return;
    Sortable.create(document.getElementById('scenes'), {
      animation: 150,
      easing: "cubic-bezier(1, 0, 0, 1)",
      draggable: ".u-draggable",
      onEnd: this.onEnd.bind(this),
    });
  }
};