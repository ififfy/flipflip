import _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {writeFileSync, mkdirSync, readFileSync, readFile} from 'fs';
import path from 'path';

import Scene from '../Scene';
import ScenePicker from './ScenePicker';
import SceneDetail from './SceneDetail';
import Player from './Player';

import {remote} from 'electron';

class Route {
  kind: string
  value: any

  constructor(init?:Partial<Route>) {
    Object.assign(this, init);
  }
}

let initialState = {
  scenes: Array<Scene>(),
  route: Array<Route>(),
  autoEdit: false,
}

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
  }
  console.log(initialState);
} catch (e) {
  // who cares
}

export default class Meta extends React.Component {
  readonly state = initialState

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
            autoEdit={this.state.autoEdit}
            goBack={this.goBack.bind(this)}
            onDelete={this.onDeleteScene.bind(this)}
            onPlay={this.onPlayScene.bind(this)}
            onChangeName={this.onChangeName.bind(this)}
            onChangeImageTypeFilter={this.onChangeImageTypeFilter.bind(this)}
            onChangeZoomType={this.onChangeZoomType.bind(this)}
            onChangeHastebinID={this.onChangeHastebinID.bind(this)}
            onChangeTimingFunction={this.onChangeTimingFunction.bind(this)}
            onChangeCrossFade={this.onChangeCrossFade.bind(this)}
            onChangeDirectories={this.onChangeDirectories.bind(this)} />)}

        {this.isRoute('play') && (
          <Player
            scene={this.scene()}
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

  onPlayScene(scene: Scene) {
    const newRoute = this.state.route.concat(new Route({kind: 'play', value: scene.id}));
    console.log(newRoute);
    this.setState({route: newRoute});
  }

  editScene(scene: Scene, fn: (scene: Scene) => void) {
    const scenes = this.state.scenes;
    for (let s of scenes) {
      if (s.id == scene.id) {
        fn(s);
      }
    }
    this.setState({scenes: scenes});
  }

  onChangeDirectories(scene: Scene, directories: Array<string>) {
    this.editScene(scene, (s) => {
      s.directories = directories;
    });
  }

  onChangeName(scene: Scene, name: string) {
    this.editScene(scene, (s) => {
      s.name = name;
    });
  }

  onChangeImageTypeFilter(scene: Scene, filter: string) {
    this.editScene(scene, (s) => {
      s.imageTypeFilter = filter; 
    });
  }

  onChangeZoomType(scene: Scene, type: string) {
    this.editScene(scene, (s) => {
      s.zoomType = type;
    });
  }

  onChangeHastebinID(scene: Scene, hbId: string) {
    this.editScene(scene, (s) => {
      s.hastebinID = hbId;
    });
  }

  onChangeTimingFunction(scene: Scene, fnId: string) {
    this.editScene(scene, (s) => {
      s.timingFunction = fnId;
    });
  }

  onChangeCrossFade(scene: Scene, value: boolean) {
    this.editScene(scene, (s) => {
      s.crossFade = value;
    });
  }
};