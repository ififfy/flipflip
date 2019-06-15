import {remote} from 'electron';
import * as React from 'react';
import wretch from 'wretch';
import Sortable from "sortablejs";

import {SF} from "../data/const";
import {arrayMove, getRandomListItem} from "../data/utils";
import Scene from '../data/Scene';
import SimpleOptionPicker from "./ui/SimpleOptionPicker";

class ScenePickerItem extends React.Component {
  readonly props: {
    scene: Scene,
    onSelect(scene: Scene): void,
    onMouseEnter?(e: MouseEvent): void,
  };

  render() {
    return (
      <div
        className={`ScenePickerItem u-clickable u-draggable ${this.props.scene.tagWeights || this.props.scene.sceneWeights ? 'm-generator' : ''}`}
        onClick={this.onClick.bind(this)}
        onMouseEnter={this.props.onMouseEnter ? this.props.onMouseEnter.bind(this) : this.nop}>
        <div className="ScenePickerItem__Title">
          {this.props.scene.name}
        </div>
      </div>
    );
  }

  onClick() {
    this.props.onSelect(this.props.scene);
  }

  nop() {}
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
    version: string,
    libraryCount: number,
    canGenerate: boolean,
    onAdd(): void,
    onImport(): void,
    onSelect(scene: Scene): void,
    onOpenLibrary(): void,
    onGenerate(): void,
    onConfig(): void,
    onUpdateScenes(scenes: Array<Scene>): void,
  };

  readonly state = {
    newVersion: "",
    newVersionLink: "",
  };

  _jiggling = Array<any>();

  render() {
    return (
      <div className="ScenePicker">
        <div className="About">
          <div className="Header">
            <div className="u-float-right">
              <SimpleOptionPicker
                label=""
                value="Sort"
                disableFirst={true}
                keys={["Sort"].concat([SF.alphaA, SF.alphaD, SF.dateA, SF.dateD, SF.type])}
                onChange={this.onSort.bind(this)}
              />
              {this.props.scenes.length > 1 && (
                <div
                  className="u-icon-button"
                  title="Play a random scene"
                  style={{verticalAlign: '-4px'}}
                  onClick={this.onRandom.bind(this)}
                  onMouseEnter={this.jiggle.bind(this)}>
                  <div className="u-random"/>
                </div>
              )}
              <div
                className="u-small-icon-button"
                title="Import a scene from a file"
                onClick={this.props.onImport.bind(this)}
                onMouseEnter={this.jiggle.bind(this)}>
                <div className="u-down-arrow"/>
              </div>
              <div
                className="u-small-icon-button"
                title="Preferences"
                onClick={this.props.onConfig.bind(this)}
                onMouseEnter={this.jiggle.bind(this)}>
                <div className="u-config"/>
              </div>
            </div>
            <h1>FlipFlip</h1>
            <small>
              v{this.props.version}
              {this.state.newVersion != "" && (
                <span>
                  &nbsp;&nbsp;(New Version!&nbsp;
                  <a onClick={this.openGitRelease.bind(this)} href="#">
                    {this.state.newVersion}
                  </a>)
                </span>
              )}
            </small>
          </div>

          <div><Link url="https://github.com/ififfy/flipflip/wiki/FlipFlip-User-Manual">User manual</Link></div>

          <div>
            <Link url="https://github.com/ififfy/flipflip/issues">Report a problem or suggest an improvement</Link>
          </div>

          <div>
            If you like FlipFlip, drop us a line on <a href="https://www.reddit.com/r/flipflip">Reddit</a> and tell us
            about how you're using it. :-)
          </div>
        </div>

        <div className="ScenePicker__Buttons">
          <div
            className="ScenePicker__LibraryButton u-clickable"
            onClick={this.props.onOpenLibrary}
            onMouseEnter={this.jiggle.bind(this)}>
            Library {this.props.libraryCount > 0 ? '(' + this.props.libraryCount + ' Sources)' : ''}
          </div>
          <div
            className={`ScenePicker__GenerateSceneButton ${this.props.canGenerate ? 'u-clickable' : 'u-disabled'}`}
            onClick={this.props.canGenerate ? this.props.onGenerate.bind(this) : this.nop}
            onMouseEnter={this.jiggle.bind(this)}>
            + Add Scene Generator
          </div>
          <div
            className="ScenePicker__AddSceneButton u-clickable"
            onClick={this.props.onAdd.bind(this)}
            onMouseEnter={this.jiggle.bind(this)}>
            + Add Scene
          </div>
        </div>

        <hr/>

        <div className="ScenePicker__Scenes" id="scenes">
          {this.props.scenes.map((scene) =>
            <ScenePickerItem
              key={`${scene.id}`} scene={scene}
              onSelect={this.props.onSelect}
              onMouseEnter={this.jiggle.bind(this)}/>
          )}
        </div>
      </div>
    );
  }

  nop() {}

  onEnd(evt: any) {
    let newScenes = this.props.scenes;
    arrayMove(newScenes, evt.oldIndex, evt.newIndex);
    this.props.onUpdateScenes(newScenes);
  }

  componentDidMount() {
    if (this.props.scenes.length > 0) {
      Sortable.create(document.getElementById('scenes'), {
        animation: 150,
        easing: "cubic-bezier(1, 0, 0, 1)",
        draggable: ".u-draggable",
        onEnd: this.onEnd.bind(this),
      });
    }

    wretch("https://api.github.com/repos/ififfy/flipflip/releases")
      .get()
      .json(json => {
        const newestRelease = json[0];
        const releaseVersion = newestRelease.tag_name.replace("v", "").replace(".", "").replace(".", "");
        if (parseInt(releaseVersion, 10) > parseInt(this.props.version.replace(".", "").replace(".", ""), 10)) {
          this.setState({
            newVersion: newestRelease.tag_name,
            newVersionLink: newestRelease.html_url,
          });
        }
      });
  }

  openGitRelease() {
    remote.shell.openExternal(this.state.newVersionLink);
  }

  onRandom() {
    this.props.onSelect(getRandomListItem(this.props.scenes));
  }

  jiggle(e: MouseEvent) {
    const target = e.currentTarget;
    if (!this._jiggling.includes(target)) {
      if (target instanceof HTMLDivElement && !target.className.includes("u-disabled")) {
        target.className = target.className + " u-jiggle";
        this._jiggling.push(target);
        setTimeout(this.stopJiggling.bind(this, target), 300);
      }
    }
  }

  stopJiggling(et: EventTarget) {
    if (et instanceof HTMLDivElement) {
      et.className = et.className.replace(" u-jiggle", "");
      this._jiggling.splice(this._jiggling.indexOf(et), 1);
    }
  }

  onSort(algorithm: string) {
    switch (algorithm) {
      case SF.alphaA:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          if (aName < bName) {
            return -1;
          } else if (aName > bName) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.alphaD:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          if (aName > bName) {
            return -1;
          } else if (aName < bName) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.dateA:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          if (a.id < b.id) {
            return -1;
          } else if (a.id > b.id) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.dateD:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          } else if (a.id < b.id) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.type:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          if (!(a.tagWeights || a.sceneWeights) && (b.tagWeights || b.sceneWeights)) {
            return -1;
          } else if ((a.tagWeights || a.sceneWeights) && !(b.tagWeights || b.sceneWeights)) {
            return 1;
          } else {
            const aName = a.name.toLowerCase();
            const bName = a.name.toLowerCase();
            if (aName < bName) {
              return -1;
            } else if (a.name > b.name) {
              return 1;
            } else {
              return 0;
            }
          }
        }));
        break;
    }
  }
};