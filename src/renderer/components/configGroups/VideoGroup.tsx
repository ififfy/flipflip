import * as React from 'react';

import {VC} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import Scene from "../../data/Scene";
import ControlGroup from "../ui/ControlGroup";
import VideoControl from "../player/VideoControl";

export default class VideoGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    mode: string,
    otherScenes?: Array<Scene>,
    isPlaying?: boolean,
    mainVideo?: HTMLVideoElement,
    otherVideos?: Array<HTMLVideoElement>,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    if (!this.props.mainVideo && (!this.props.otherVideos || !this.props.otherVideos.find((v) => v != null)) && this.props.mode == VC.player) return <div/>;
    return (
      <ControlGroup title="Video Controls" isNarrow={true}>
        <div className="ControlSubgroup VideoControlGroup m-inline">
          {this.props.mainVideo && (
            <React.Fragment>
              <h4>Scene Video</h4>
              <VideoControl
                video={this.props.mainVideo}
                mode={this.props.mode}
                volume={this.props.scene.videoVolume}
                onChangeVolume={this.changeKey.bind(this, 'videoVolume', this.props.scene).bind(this)}/>
            </React.Fragment>
          )}
          {this.props.otherVideos && this.props.otherVideos.map((otherVideo, index) => {
            if (otherVideo == null) return <React.Fragment key={index}/>;
            const indexOf = this.props.otherVideos.map((v) => v == null ? v : v.src).indexOf(otherVideo.src);
            if (this.props.otherScenes[indexOf] == null) return <React.Fragment key={index}/>;
            return (
              <React.Fragment key={index}>
                <h4>{this.props.otherScenes[indexOf].name} Video</h4>
                <VideoControl
                  video={otherVideo}
                  mode={this.props.mode}
                  onChangeVolume={this.props.mainVideo ? this.changeKey.bind(this, 'videoVolume', this.props.otherScenes[indexOf]).bind(this) : this.nop}/>
              </React.Fragment>
            );}
          )}
        </div>
      </ControlGroup>
    )
  }

  nop() {}

  update(scene: Scene, fn: (scene: any) => void) {
    this.props.onUpdateScene(scene, fn);
  }

  changeKey(key: string, scene: Scene,  value: any) {
    this.update(scene, (s) => s[key] = value);
  }

}