import * as React from 'react';

import Scene from "../../data/Scene";
import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import VideoControl from "../player/VideoControl";
import SimpleCheckbox from "../ui/SimpleCheckbox";

export default class VideoGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    overlayScenes?: Array<Scene>,
    isPlaying?: boolean,
    mainVideo?: HTMLVideoElement,
    overlayVideos?: Array<HTMLVideoElement>,
    isPlayer: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Video Controls" isNarrow={true}>
        <div className="ControlSubgroup VideoControlGroup m-inline">
          <SimpleCheckbox
            text={"Start Videos At Random Timestamp"}
            isOn={this.props.scene.randomVideoStart}
            onChange={this.changeKey.bind(this, 'randomVideoStart', this.props.scene).bind(this)} />
          <SimpleCheckbox
            text={"Continue Videos From Last Timestamp"}
            isOn={this.props.scene.continueVideo}
            onChange={this.changeKey.bind(this, 'continueVideo', this.props.scene).bind(this)} />
          {(this.props.mainVideo || !this.props.isPlayer) && (
            <React.Fragment>
              <h4>Scene Video</h4>
              <VideoControl
                video={this.props.mainVideo}
                showAll={this.props.isPlayer}
                volume={this.props.scene.videoVolume}
                onChangeVolume={this.changeKey.bind(this, 'videoVolume', this.props.scene).bind(this)}/>
            </React.Fragment>
          )}
          {this.props.overlayVideos && this.props.overlayVideos.map((overlayVideo, index) => {
            if (overlayVideo == null) return <React.Fragment key={index}/>;
            const indexOf = this.props.overlayVideos.map((v) => v == null ? v : v.src).indexOf(overlayVideo.src);
            if (this.props.overlayScenes[indexOf] == null) return <React.Fragment key={index}/>;
            return (
              <React.Fragment key={index}>
                <h4>{this.props.overlayScenes[indexOf].name} Video</h4>
                <VideoControl
                  video={overlayVideo}
                  showAll={this.props.isPlayer}
                  volume={this.props.overlayScenes[indexOf].videoVolume}
                  onChangeVolume={this.changeKey.bind(this, 'videoVolume', this.props.overlayScenes[indexOf]).bind(this)}/>
              </React.Fragment>
            );}
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