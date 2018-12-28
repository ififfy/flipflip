import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {remote} from 'electron';
import Scene from '../Scene';

class ScenePickerItem extends React.Component {
  readonly props: { scene: Scene, onSelect(scene: Scene): void }

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
  }

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
    onAdd(scene: Scene): void,
    onSelect(scene: Scene): void,
  }

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
            <ScenePickerItem key={`${scene.id}`} scene={scene} onSelect={this.props.onSelect
          } />)}
          <div key="add" className="ScenePickerItem u-clickable" onClick={this.onAdd.bind(this)}>
            <div className="ScenePickerItem__Title">
              + Add scene
            </div>
          </div>
        </div>
      </div>
    );
  }

  onAdd() {
    let id = this.props.scenes.length + 1;
    this.props.scenes.forEach((s) => {
      id = Math.max(s.id + 1, id);
    })
    this.props.onAdd(new Scene({
      id: id,
      name: "New scene",
      directories: []}));
  }
};