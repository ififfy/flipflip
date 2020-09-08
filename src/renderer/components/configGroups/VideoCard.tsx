import * as React from "react";

import { Grid, Typography} from "@material-ui/core";

import {getSourceType} from "../../data/utils";
import {ST} from "../../data/const";
import Clip from "../../data/Clip";
import Scene from "../../data/Scene";
import VideoControl from "../player/VideoControl";

export default class VideoCard extends React.Component {
  readonly props: {
    scene: Scene,
    otherScenes?: Array<Scene>,
    isPlaying?: boolean,
    mainVideo?: HTMLVideoElement,
    mainClip?: Clip,
    mainClipValue?: Array<number>,
    otherVideos?: Array<HTMLVideoElement>,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  render() {
    let mainVideoTitle = ""
    if (this.props.mainVideo) {
      const source = this.props.mainVideo.getAttribute("source");
      const sourceType = getSourceType(source);
      if (sourceType == ST.video) {
        if (source.startsWith("http")) {
          mainVideoTitle = source.substring(source.lastIndexOf("/") + 1);
        } else {
          mainVideoTitle = source.substring(source.lastIndexOf("\\") + 1);
        }
      } else {
        mainVideoTitle = this.props.mainVideo.src;
        mainVideoTitle = mainVideoTitle.substring(mainVideoTitle.lastIndexOf("/") + 1);
      }
    }
    return(
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          {this.props.mainVideo && (
            <React.Fragment>
              <Typography>Scene Video:</Typography>
              <Typography
                variant="body2"
                style={{whiteSpace: "normal"}}>
                {mainVideoTitle}
              </Typography>
              <VideoControl
                player
                video={this.props.mainVideo}
                volume={this.props.scene.videoVolume}
                clip={this.props.mainClip}
                clipValue={this.props.mainClipValue}
                onChangeVolume={this.changeKey.bind(this, 'videoVolume', this.props.scene).bind(this)}/>
            </React.Fragment>
          )}
        </Grid>
        {this.props.otherVideos && this.props.otherVideos.map((otherVideo, index) => {
          if (otherVideo == null) return <React.Fragment key={index}/>;
          const indexOf = this.props.otherVideos.map((v) => v == null ? v : v.src).indexOf(otherVideo.src);
          if (this.props.otherScenes[indexOf] == null) return <React.Fragment key={index}/>;
          const sourceURL = otherVideo.getAttribute("source");
          let otherVideoTitle = ""
          if (this.props.mainVideo) {
            const sourceType = getSourceType(sourceURL);
            if (sourceType == ST.video) {
              if (sourceURL.startsWith("http")) {
                otherVideoTitle = sourceURL.substring(sourceURL.lastIndexOf("/") + 1);
              } else {
                otherVideoTitle = sourceURL.substring(sourceURL.lastIndexOf("\\") + 1);
              }
            } else {
              otherVideoTitle = otherVideo.src;
              otherVideoTitle = otherVideoTitle.substring(otherVideoTitle.lastIndexOf("/") + 1);
            }
          }
          let clipValue = null;
          let clipID: number = null;
          let source = null;
          if (otherVideo.hasAttribute("start") && otherVideo.hasAttribute("end")) {
            clipValue = [parseInt(otherVideo.getAttribute("start")), parseInt(otherVideo.getAttribute("end"))]
            clipID = parseInt(otherVideo.getAttribute("clip"));
            source = this.props.otherScenes[indexOf].sources.find((s) => s.url == sourceURL);
          }
          return (
            <Grid item xs={12} key={index}>
              <Typography>{this.props.otherScenes[indexOf].name} Video:</Typography>
              <Typography
                variant="body2"
                style={{whiteSpace: "normal"}}>
                {otherVideoTitle}
              </Typography>
              <VideoControl
                  video={otherVideo}
                  clip={source ? source.clips.find((c) => c.id == clipID) : null}
                  clipValue={clipValue ? clipValue : null}
                  player
                  onChangeVolume={this.props.mainVideo ? this.changeKey.bind(this, 'videoVolume', this.props.otherScenes[indexOf]).bind(this) : this.nop}/>
            </Grid>
          );}
        )}
      </Grid>
    );
  }

  nop() {}

  changeKey(key: string, scene: Scene,  value: any) {
    this.update(scene, (s) => s[key] = value);
  }

  update(scene: Scene, fn: (scene: any) => void) {
    this.props.onUpdateScene(scene, fn);
  }
}