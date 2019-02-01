import * as React from 'react';

import {remote} from 'electron';
import Scene from '../Scene';

class ScenePickerItem extends React.Component {
  readonly props: { scene: Scene, onSelect(scene: Scene): void };

  render() {
    return (
      <div
          className="ScenePickerItem u-clickable"
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
    onAdd(sources: []): void,
    onSelect(scene: Scene): void,
    onOpenLibrary(): void,
    canGenerate: boolean,
    onGenerate(): void,
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

        <div className="ScenePicker__Scenes">
          {this.props.scenes.map((scene) =>
            <ScenePickerItem key={`${scene.id}`} scene={scene} onSelect={this.props.onSelect} />
          )}
          <div key="add" className="ScenePickerItem u-clickable" onClick={this.onAdd.bind(this)}>
            <div className="ScenePickerItem__Title">
              + Add scene
            </div>
          </div>
          <div key="generate"
               className={`ScenePickerItem ${this.props.canGenerate ? 'u-clickable' : 'u-disabled'}`}
               onClick={this.props.canGenerate ? this.props.onGenerate.bind(this) : this.nop}>
            <div className="ScenePickerItem__Title">
              + Generate scene
            </div>
          </div>
        </div>

        <div className="ScenePicker__Library">
          <div className="ScenePicker__LibraryButton u-clickable" onClick={this.props.onOpenLibrary}>
            Library
          </div>
        </div>
      </div>
    );
  }

  nop () {}

  onAdd() {
    this.props.onAdd([]);
  }
};