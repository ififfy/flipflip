import * as React from 'react';

import {writeFileSync, mkdirSync, readFileSync, readFile} from 'fs';
import path from 'path';

import Library from './library/Library';
import Scene from '../Scene';
import ScenePicker from './ScenePicker';
import SceneDetail from './sceneDetail/SceneDetail';
import Player from './player/Player';

import {remote} from 'electron';

class Route {
  kind: string;
  value: any;

  constructor(init?:Partial<Route>) {
    Object.assign(this, init);
  }
}

let initialState = {
  scenes: Array<Scene>(),
  route: Array<Route>(),
  autoEdit: false,
};

const saveDir = path.join(remote.app.getPath('appData'), 'flipflip');
try {
  mkdirSync(saveDir);
} catch (e) {
  // who cares
}
const savePath = path.join(saveDir, 'data.json');
console.log("Saving to", savePath);

try {
  const data = JSON.parse(readFileSync(savePath, 'utf-8'));
  initialState = {
    autoEdit: data.autoEdit,
    scenes: data.scenes.map((s: any) => new Scene(s)),
    route: data.route.map((s: any) => new Route(s)),
  };
  console.log(initialState);
} catch (e) {
  // who cares
}

export default class Meta extends React.Component {
  readonly state = initialState;

  isRoute(kind: string): Boolean {
    if (this.state.route.length < 1) return false;
    return this.state.route[this.state.route.length - 1].kind === kind;
  }

  scene?(): Scene {
    for (let r of this.state.route.slice().reverse()) {
      if (r.kind == 'scene') {
        return this.state.scenes.find((s) => s.id === r.value);
      }
    }
    return null;
  }

  overlayScene?(): Scene {
    if (!this.scene()) return null;
    if (!this.scene().overlaySceneID) return null;
    return this.state.scenes.filter((s) => {
      return s.id === this.scene().overlaySceneID;
    })[0];
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
            onSelect={this.onOpenScene.bind(this)}
            onOpenLibrary={this.onOpenLibrary.bind(this)}/>)}

        {this.isRoute('library') && (
          <Library
            goBack={this.goBack.bind(this)}
          />
        )}

        {this.isRoute('scene') && (
          <SceneDetail
            scene={this.scene()}
            allScenes={this.state.scenes}
            autoEdit={this.state.autoEdit}
            goBack={this.goBack.bind(this)}
            onDelete={this.onDeleteScene.bind(this)}
            onPlay={this.onPlayScene.bind(this)}
            onUpdateScene={this.onUpdateScene.bind(this)} />)}

        {this.isRoute('play') && (
          <Player
            scene={this.scene()}
            onUpdateScene={this.onUpdateScene.bind(this)}
            overlayScene={this.overlayScene()}
            goBack={this.goBack.bind(this)} />
        )}
      </div>
    )
  }

  save() {
    writeFileSync(savePath, JSON.stringify(this.state), 'utf-8');
  }

  goBack() {
    const newRoute = this.state.route;
    this.state.route.pop();
    this.setState({route: newRoute, autoEdit: false});
  }

  onAddScene(scene: Scene) {
    this.setState({
      scenes: this.state.scenes.concat([scene]),
      route: [new Route({kind: 'scene', value: scene.id})],
      autoEdit: true,
    });
  }

  onDeleteScene(scene: Scene) {
    this.setState({
      scenes: this.state.scenes.filter((s) => s.id != scene.id),
      route: [],
    });
  }

  onOpenScene(scene: Scene) {
    this.setState({route: [new Route({kind: 'scene', value: scene.id})]});
  }

  onOpenLibrary() {
    this.setState({route: [new Route({kind: 'library'})]});
  }

  onPlayScene(scene: Scene) {
    const newRoute = this.state.route.concat(new Route({kind: 'play', value: scene.id}));
    console.log(newRoute);
    this.setState({route: newRoute});
  }

  onUpdateScene(scene: Scene, fn: (scene: Scene) => void) {
    const scenes = this.state.scenes;
    for (let s of scenes) {
      if (s.id == scene.id) {
        fn(s);
      }
    }
    this.setState({scenes: scenes});
  }
};