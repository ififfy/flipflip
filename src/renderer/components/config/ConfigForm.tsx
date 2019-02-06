import * as React from "react";

import Scene from "../../Scene";
import Config, {SceneSettings} from "../../Config";
import TimingGroup from "../sceneDetail/TimingGroup";
import EffectGroup from "../sceneDetail/EffectGroup";
import TextGroup from "../sceneDetail/TextGroup";
import ImageGroup from "../sceneDetail/ImageGroup";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleTextInput from "../ui/SimpleTextInput";
import {remote} from "electron";
import fileURL from "file-url";

export default class Library extends React.Component {
  readonly props: {
    config: Config,
    scenes: Array<Scene>,
    goBack(): void,
    updateConfig(config: Config): void,
    onDefault(): void,
  };

  readonly state = {
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
            onUpdateScene={this.onUpdateDefaultScene.bind(this)} />

          {/* TODO Implement caching and uncomment this
          <ControlGroup title="Caching" isNarrow={true}>
            <SimpleTextInput
                isEnabled={true}
                label={"Caching Directory"}
                value={this.state.config.cachingDir}
                onChange={this.onUpdateCachingDir.bind(this)}>
              {" "}
              <button onClick={this.pickDirectory.bind(this)}>Browse</button>
            </SimpleTextInput>
          </ControlGroup>*/}
        </div>
      </div>
    )
  }

  onOK() {
    this.applyConfig();
    this.props.goBack();
  }

  applyConfig() {
    this.props.updateConfig(this.state.config);
  }

  pickDirectory() {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']});
    if (!result || !result.length) return;
    this.onUpdateCachingDir(fileURL(result[0]));
  }

  onUpdateDefaultScene(settings: SceneSettings, fn: (settings: SceneSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.defaultScene);
    this.setState({config: newConfig});
  }

  onUpdateCachingDir(cachingDir: string) {
    const newConfig = this.state.config;
    newConfig.cachingDir = cachingDir;
    this.setState({config: newConfig});
  }

}