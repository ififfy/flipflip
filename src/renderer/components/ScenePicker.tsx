import { remote, ipcRenderer } from 'electron';
import * as React from 'react';
import wretch from 'wretch';
import Sortable from "react-sortablejs";

import {IPC, SF} from "../data/const";
import {getRandomListItem} from "../data/utils";
import Scene from '../data/Scene';
import Config from "../data/Config";
import SimpleOptionPicker from "./ui/SimpleOptionPicker";
import Jiggle from "../animations/Jiggle";
import VSpin from "../animations/VSpin";
import Modal from "./ui/Modal";
import SimpleCheckbox from "./ui/SimpleCheckbox";

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
    config: Config,
    version: string,
    libraryCount: number,
    canGenerate: boolean,
    onAdd(): void,
    onImport(): void,
    onSelect(scene: Scene): void,
    onOpenLibrary(): void,
    onGenerate(): void,
    onConfig(): void,
    onUpdateConfig(config: Config): void,
    onUpdateScenes(scenes: Array<Scene>): void,
  };

  readonly state = {
    newVersion: "",
    newVersionLink: "",
    isFirstWindow: false,
    showNewWindowWarning: false,
    hideFutureWarnings: false,
  };

  render() {
    return (
      <div className="ScenePicker">
        <div className="About">
          <div className="Header">
            <div className="u-float-right">
              {this.state.isFirstWindow && (
                <SimpleOptionPicker
                  label=""
                  value="Sort"
                  disableFirst={true}
                  keys={["Sort"].concat([SF.alphaA, SF.alphaD, SF.dateA, SF.dateD, SF.type])}
                  onChange={this.onSort.bind(this)}
                />
              )}
              {this.state.isFirstWindow && this.props.scenes.length > 1 && (
                <Jiggle
                  bounce={false}
                  className="u-small-icon-button"
                  title="New Window"
                  onClick={this.onNewWindow.bind(this)}>
                  <div className="u-new"/>
                </Jiggle>
              )}
              {this.props.scenes.length > 1 && (
                <Jiggle
                  bounce={false}
                  className="u-icon-button"
                  title="Play a random scene"
                  style={{verticalAlign: '-4px'}}
                  onClick={this.onRandom.bind(this)}>
                  <div className="u-random"/>
                </Jiggle>
              )}
              {this.state.isFirstWindow && (
                <React.Fragment>
                  <Jiggle
                    bounce={false}
                    className="u-small-icon-button"
                    title="Import a scene from a file"
                    onClick={this.props.onImport.bind(this)}>
                    <div className="u-down-arrow"/>
                  </Jiggle>
                  <Jiggle
                    bounce={false}
                    className="u-small-icon-button"
                    title="Preferences"
                    onClick={this.props.onConfig.bind(this)}>
                    <div className="u-config"/>
                  </Jiggle>
                </React.Fragment>
              )}
            </div>
            <div className="Logo">
              <VSpin>
                <div className="u-logo"/>
              </VSpin>
              <div className="LogoTest">
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
            </div>
          </div>

          {this.state.isFirstWindow && (
            <React.Fragment>
              <div>
                <Link url="https://ififfy.github.io/flipflip/#/">User manual</Link>
              </div>

              <div>
                <Link url="https://github.com/ififfy/flipflip/issues">Report a problem or suggest an improvement</Link>
              </div>

              <div>
                If you like FlipFlip, drop us a line on <a href="https://www.reddit.com/r/flipflip">Reddit</a> and tell us
                about how you're using it. :-)
              </div>
            </React.Fragment>
          )}
          {!this.state.isFirstWindow && (
            <h4>
              Changes made in this form will not be saved.
            </h4>
          )}
        </div>

        {this.state.isFirstWindow && (
          <div className="ScenePicker__Buttons">
            <Jiggle
              bounce={false}
              className="ScenePicker__LibraryButton u-clickable"
              onClick={this.props.onOpenLibrary}>
              Library {this.props.libraryCount > 0 ? '(' + this.props.libraryCount + ' Sources)' : ''}
            </Jiggle>
            <Jiggle
              bounce={true}
              className={`ScenePicker__GenerateSceneButton ${this.props.canGenerate ? 'u-clickable' : 'u-disabled'}`}
              onClick={this.props.canGenerate ? this.props.onGenerate.bind(this) : this.nop}>
              + Add Scene Generator
            </Jiggle>
            <Jiggle
              bounce={true}
              className="ScenePicker__AddSceneButton u-clickable"
              onClick={this.props.onAdd.bind(this)}>
              + Add Scene
            </Jiggle>
          </div>
        )}

        <hr/>
        <Sortable
          className="ScenePicker__Scenes"
          options={{
            animation: 150,
            easing: "cubic-bezier(1, 0, 0, 1)",
          }}
          onChange={(newScenes: any) => {
            this.props.onUpdateScenes(newScenes);
          }}>
          {this.props.scenes.map((scene) =>
            <Jiggle key={scene.id} bounce={true}>
              <ScenePickerItem
                scene={scene}
                onSelect={this.props.onSelect}/>
            </Jiggle>
          )}
        </Sortable>

        {this.state.showNewWindowWarning && (
          <Modal title="!!! WARNING !!!">
            <div>Only changes made in the main window (this window) will be saved.</div>
            <br/>
            <div style={{float: 'left'}}>
              <SimpleCheckbox
                text="Don't show again"
                isOn={this.state.hideFutureWarnings}
                onChange={() => {this.setState({hideFutureWarnings: !this.state.hideFutureWarnings})}}/>
            </div>
            <div className="u-button u-float-right" onClick={this.newWindow.bind(this)}>
              OK
            </div>
          </Modal>
        )}
      </div>
    );
  }

  nop() {}

  onNewWindow() {
    if (!this.props.config.newWindowAlerted) {
      this.setState({showNewWindowWarning: true});
    } else {
      this.newWindow();
    }
  }

  newWindow() {
    if (this.state.showNewWindowWarning) {
      this.setState({showNewWindowWarning: false});

      if (this.state.hideFutureWarnings) {
        let newConfig = this.props.config;
        newConfig.newWindowAlerted = true;
        this.props.onUpdateConfig(newConfig);
      }
    }
    ipcRenderer.send(IPC.newWindow);
  }

  componentDidMount() {
    if (remote.getCurrentWindow().id == 1) {
      this.setState({isFirstWindow: true});
      wretch("https://api.github.com/repos/ififfy/flipflip/releases")
        .get()
        .json(json => {
          const newestReleaseTag = json[0].tag_name;
          const newestReleaseURL = json[0].html_url;
          let releaseVersion = newestReleaseTag.replace("v", "").replace(".", "").replace(".", "");
          let releaseBetaVersion = -1;
          if (releaseVersion.includes("-")) {
            const releaseSplit = releaseVersion.split("-");
            releaseVersion = releaseSplit[0];
            const betaString = releaseSplit[1];
            const betaNumber = betaString.replace("beta", "");
            if (betaNumber == "") {
              releaseBetaVersion = 0;
            } else {
              releaseBetaVersion = parseInt(betaNumber, 10);
            }
          }
          let thisVersion = this.props.version.replace(".", "").replace(".", "");
          let thisBetaVersion = -1;
          if (thisVersion.includes("-")) {
            const releaseSplit = thisVersion.split("-");
            thisVersion = releaseSplit[0];
            const betaString = releaseSplit[1];
            const betaNumber = betaString.replace("beta", "");
            if (betaNumber == "") {
              thisBetaVersion = 0;
            } else {
              thisBetaVersion = parseInt(betaNumber, 10);
            }
          }
          if (parseInt(releaseVersion, 10) > parseInt(thisVersion, 10)) {
            this.setState({
              newVersion: newestReleaseTag,
              newVersionLink: newestReleaseURL,
            })
          } else if (parseInt(releaseVersion, 10) == parseInt(thisVersion, 10)) {
            if ((releaseBetaVersion == -1 && thisBetaVersion >= 0) ||
              releaseBetaVersion > thisBetaVersion) {
              this.setState({
                newVersion: newestReleaseTag,
                newVersionLink: newestReleaseURL,
              })
            }
          }
        })
        .catch((e) => console.error(e));
    }
  }

  openGitRelease() {
    remote.shell.openExternal(this.state.newVersionLink);
  }

  onRandom() {
    this.props.onSelect(getRandomListItem(this.props.scenes));
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