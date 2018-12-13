import _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {writeFileSync, mkdirSync} from 'fs';
import path from 'path';

import ScenePicker from './ScenePicker';
import SceneDetail from './SceneDetail';

import {remote} from 'electron';

const saveDir = path.join(remote.app.getPath('appData'), 'flipflip');
mkdirSync(saveDir);
const savePath = path.join(saveDir, 'data.json');
console.log("Saving to", savePath);

type Scene = {
  id: Number,
  name: string,
  directories: Array<String>,
};

class Route {
  kind: String
  value: any

  constructor(kind: String, value: any) {
    this.kind = kind;
    this.value = value;
  }
}

const initialState = {
  scenes: Array<Scene>(),
  route: Array<Route>(),
};

export default class Meta extends React.Component {
  readonly state = initialState

  isRoute(kind: String): Boolean {
    if (this.state.route.length < 1) return false;
    return this.state.route[0].kind === kind;
  }

  scene?(): Scene {
    for (let r of this.state.route.slice().reverse()) {
      if (r.kind == 'scene') {
        return this.state.scenes.find((s) => s.id === r.value);
      }
    }
    return null;
  }

  componentDidMount() {
    setInterval(this.save.bind(this), 500);
  }

  render() {
    return (
      <div className="Meta">
        {this.state.route.length === 0 && (
          <ScenePicker
            scenes={this.state.scenes}
            onAdd={this.onAddScene.bind(this)}
            onSelect={this.onOpenScene.bind(this)} />)}
        {this.isRoute('scene') && (
          <SceneDetail
            scene={this.scene()}
            goBack={this.goBack.bind(this)}
            onChangeName={this.onChangeName.bind(this)}
            onChangeDirectories={this.onChangeDirectories.bind(this)} />)}
      </div>
    )
  }

  save() {
    writeFileSync(savePath, JSON.stringify(this.state), 'utf-8');
  }

  goBack() {
    this.setState({route: this.state.route.splice(-1,1)})
  }

  onAddScene(scene: Scene) {
    this.setState({
      scenes: this.state.scenes.concat([scene]),
      route: [new Route('scene', scene.id)],
    });
  }

  onOpenScene(scene: Scene) {
    this.setState({route: [new Route('scene', scene.id)]});
  }

  onChangeDirectories(scene: Scene, directories: Array<String>) {
    const scenes = this.state.scenes;
    for (let s of scenes) {
      if (s.id == scene.id) {
        s.directories = directories;
      }
    }
    this.setState({scenes: scenes});
  }

  onChangeName(scene: Scene, name: string) {
    const scenes = this.state.scenes;
    for (let s of scenes) {
      if (s.id == scene.id) {
        s.name = name;
      }
    }
    this.setState({scenes: scenes});
  }
};