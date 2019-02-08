import * as React from "react";

import Scene from "../../Scene";
import Config, {RemoteSettings, CacheSettings, SceneSettings} from "../../Config";
import TimingGroup from "../sceneDetail/TimingGroup";
import EffectGroup from "../sceneDetail/EffectGroup";
import TextGroup from "../sceneDetail/TextGroup";
import ImageGroup from "../sceneDetail/ImageGroup";
import Modal from "../ui/Modal";
import CacheGroup from "./CacheGroup";
import APIGroup from "./APIGroup";
import * as fs from "fs";

export default class Library extends React.Component {
  readonly props: {
    config: Config,
    scenes: Array<Scene>,
    goBack(): void,
    updateConfig(config: Config): void,
    onDefault(): void,
  };

  readonly state = {
    errorMessage: "",
    config: JSON.parse(JSON.stringify(this.props.config)), // Make a copy
  };

  render() {
    return (
      <div className="Config">
        <div className="u-button-row">
          <div className="u-abs-center">
            <h2 className="Config__ConfigHeader">Config</h2>
          </div>
          <div className="u-button-row-right">
            <div className="Config__Apply u-button u-clickable"
                onClick={this.applyConfig.bind(this)}>
              Apply
            </div>
            <div className="Config__OK u-button u-clickable"
                onClick={this.onOK.bind(this)}>
              OK
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
          <div className="DefaultButton u-destructive u-button u-clickable"
              onClick={this.props.onDefault.bind(this)}>
            Reset to Defaults
          </div>
        </div>

        <div className="Config__Content ControlGroupGroup">
          <TimingGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)} />

          <EffectGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}
            allScenes={this.props.scenes} />

          <ImageGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)} />

          <TextGroup
            scene={this.state.config.defaultScene}
            isPlayer={false}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)} />

          <CacheGroup
            settings={this.state.config.caching}
            onUpdateSettings={this.onUpdateCachingSettings.bind(this)} />

          <APIGroup
            settings={this.state.config.remoteSettings}
            onUpdateSettings={this.onUpdateRemoteSettings.bind(this)} />
        </div>

        {this.state.errorMessage != "" && (
          <Modal onClose={this.onErrorClose.bind(this)} title="Error">
            <p dangerouslySetInnerHTML={{__html: this.state.errorMessage}}/>
            <div className="u-button u-float-right" onClick={this.onErrorClose.bind(this)}>
              Ok
            </div>
          </Modal>
        )}
      </div>
    )
  }

  onErrorClose() {
    this.setState({errorMessage: ""});
  }

  validate(): string {
    let errorMessage = "";
    // Validate any data:
    if (this.state.config.remoteSettings.tumblrDefault.length != 50) {
      errorMessage += "Invalid Default Tumblr API Key<br/>"
    }
    if (this.state.config.remoteSettings.tumblrOverlay.length != 50) {
      errorMessage += "Invalid Overlay Tumblr API Key<br/>"
    }
    if (isNaN(parseInt(this.state.config.caching.maxSize))) {
      errorMessage += "Invalid Cache Size<br/>"
    }
    if (this.state.config.caching.directory != "" &&
        !fs.existsSync(this.state.config.caching.directory)) {
      errorMessage += "Invalid Cache Directory<br/>"
    }
    return errorMessage;
  }

  onOK() {
    if (this.applyConfig()) this.props.goBack();
  }

  applyConfig(): boolean {
    const errorMessage = this.validate();
    if (errorMessage.length == 0) {
      this.props.updateConfig(this.state.config);
      return true;
    } else {
      this.setState({errorMessage: errorMessage});
      return false;
    }
  }

  onUpdateDefaultScene(settings: SceneSettings, fn: (settings: SceneSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.defaultScene);
    this.setState({config: newConfig});
  }

  onUpdateCachingSettings(settings: CacheSettings, fn: (settings: CacheSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.caching);
    this.setState({config: newConfig});
  }

  onUpdateRemoteSettings(keys: RemoteSettings, fn: (keys: RemoteSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.remoteSettings);
    this.setState({config: newConfig});
  }

}