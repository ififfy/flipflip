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
        {this.props.scene.name}
      </div>
    );
  }

  onClick() {
    this.props.onSelect(this.props.scene);
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
        <div className="ScenePicker__Scenes">
          {this.props.scenes.map((scene) =>
            <ScenePickerItem key={`${scene.id}`} scene={scene} onSelect={this.props.onSelect
          } />)}
          <div key="add" className="ScenePickerItem u-clickable" onClick={this.onAdd.bind(this)}>+ Add scene</div>
        </div>

        <div className="About">
          <h1>FlipFlip</h1>

          <p>
            This program displays random images from your hard drive on a timer. Click
            'Add Scene' to the left, add some directories, and press Play!
          </p>

          <p>
            While the slideshow is playing, you can press Space to pause, and use the
            arrow keys to move through the history. Press Cmd+Ctrl+F to fullscreen.
          </p>

          <p>
            Each time the image changes, one of the directories is chosen randomly, then
            one image inside that directory is chosen randomly.
          </p>

          <h2>To do</h2>
          
          <p>
            Will probably get to these:
            <ul>
              <li>Let you choose images randomly from all images, instead of by directory first</li>
              <li>Zooming effect</li>
            </ul>
          </p>
          
          <p>
            May or may not get to these:
            <ul>
              <li>Text scripts</li>
              <li>Loading images from the internet</li>
            </ul>
          </p>

        </div>
      </div>
    );
  }

  onAdd() {
    const id = this.props.scenes.length + 1;
    this.props.onAdd(new Scene({
      id: id,
      name: "New scene",
      directories: []}));
  }
};