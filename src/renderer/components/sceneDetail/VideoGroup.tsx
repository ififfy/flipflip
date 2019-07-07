import * as React from 'react';

import Scene from "../../data/Scene";
import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import VideoControl from "../player/VideoControl";
import SimpleCheckbox from "../ui/SimpleCheckbox";

export default class VideoGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    overlayScene?: Scene,
    isPlaying?: boolean,
    mainVideo?: HTMLVideoElement,
    overlayVideo?: HTMLVideoElement,
    isPlayer: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    if (!this.props.mainVideo && !this.props.overlayVideo && this.props.isPlayer) return <div/>;
    return (
      <ControlGroup title="Video Controls" isNarrow={true}>
        <div className="ControlSubgroup VideoControlGroup m-inline">
          {(this.props.mainVideo || !this.props.isPlayer) && (
            <React.Fragment>
              <h4>Scene Video</h4>
              {!this.props.scene.playFullVideo && (
                <React.Fragment>
                  <SimpleCheckbox
                    text={"Start Videos At Random Timestamp"}
                    isOn={this.props.scene.randomVideoStart}
                    onChange={this.changeKey.bind(this, 'randomVideoStart').bind(this)} />
                  <SimpleCheckbox
                    text={"Continue Videos From Last Timestamp"}
                    isOn={this.props.scene.continueVideo}
                    onChange={this.changeKey.bind(this, 'continueVideo').bind(this)} />
                </React.Fragment>
              )}
              <VideoControl
                video={this.props.mainVideo}
                showAll={this.props.isPlayer}
                volume={this.props.scene.videoVolume}
                onChangeVolume={this.changeKey.bind(this, 'videoVolume', this.props.scene).bind(this)}/>
            </React.Fragment>
          )}
          {this.props.overlayVideo && (
            <React.Fragment>
              <h4>Overlay Video</h4>
              <VideoControl
                video={this.props.overlayVideo}
                showAll={this.props.isPlayer}
                volume={this.props.overlayScene.videoVolume}
                onChangeVolume={this.changeKey.bind(this, 'videoVolume', this.props.overlayScene).bind(this)}/>
            </React.Fragment>
          )}
        </div>
      </ControlGroup>
    )
  }

  update(scene: Scene, fn: (scene: any) => void) {
    this.props.onUpdateScene(scene, fn);
  }

  changeKey(key: string, scene: Scene,  value: any) {
    this.update(scene, (s) => s[key] = value);
  }

}