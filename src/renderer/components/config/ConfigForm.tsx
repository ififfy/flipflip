import * as React from "react";
import * as fs from "fs";

import Config, {CacheSettings, RemoteSettings, SceneSettings} from "../../Config";
import Scene from "../../Scene";
import APIGroup from "./APIGroup";
import CacheGroup from "./CacheGroup";
import EffectGroup from "../sceneDetail/EffectGroup";
import ImageGroup from "../sceneDetail/ImageGroup";
import TextGroup from "../sceneDetail/TextGroup";
import TimingGroup from "../sceneDetail/TimingGroup";
import Modal from "../ui/Modal";

export default class Library extends React.Component {
  readonly props: {
    config: Config,
    scenes: Array<Scene>,
    goBack(): void,
    updateConfig(config: Config): void,
    onDefault(): void,
  };

  readonly state = {
    errorMessages: new Array<string>(),
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
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <EffectGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}
            allScenes={this.props.scenes}/>

          <ImageGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <TextGroup
            scene={this.state.config.defaultScene}
            isPlayer={false}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <CacheGroup
            config={this.state.config}
            onUpdateSettings={this.onUpdateCachingSettings.bind(this)}/>

          <APIGroup
            settings={this.state.config.remoteSettings}
            onUpdateSettings={this.onUpdateRemoteSettings.bind(this)}/>
        </div>

        {this.state.errorMessages.length > 0 && (
          <Modal onClose={this.onErrorClose.bind(this)} title="Error">
            {this.state.errorMessages.map((m) =>
              <p key={(m as any) as number}>{m}</p>
            )}
            <div className="u-button u-float-right" onClick={this.onErrorClose.bind(this)}>
              Ok
            </div>
          </Modal>
        )}
      </div>
    )
  }

  onErrorClose() {
    this.setState({errorMessages: Array<string>()});
  }

  validate(): Array<string> {
    let errorMessages = Array<string>();
    // Validate any data:
    if (this.state.config.remoteSettings.tumblrDefault.length != 50) {
      errorMessages.push("Invalid Default Tumblr API Key");
    }
    if (this.state.config.remoteSettings.tumblrOverlay.length != 50) {
      errorMessages.push("Invalid Overlay Tumblr API Key");
    }
    if (isNaN(parseInt(this.state.config.caching.maxSize))) {
      errorMessages.push("Invalid Cache Size");
    }
    if (this.state.config.caching.directory != "" &&
      !fs.existsSync(this.state.config.caching.directory)) {
      errorMessages.push("Invalid Cache Directory");
    }
    return errorMessages;
  }

  onOK() {
    if (this.applyConfig()) this.props.goBack();
  }

  applyConfig(): boolean {
    const errorMessages = this.validate();
    if (errorMessages.length == 0) {
      this.props.updateConfig(this.state.config);
      return true;
    } else {
      this.setState({errorMessages: errorMessages});
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