import * as React from "react";

import { Grid, Typography} from "@mui/material";

import {getSourceType} from "../player/Scrapers";
import {ST} from "../../data/const";
import Clip from "../../data/Clip";
import Scene from "../../data/Scene";
import VideoControl from "../player/VideoControl";
import ChildCallbackHack from "../player/ChildCallbackHack";
import SceneGrid from "../../data/SceneGrid";

export default class VideoCard extends React.Component {
  readonly props: {
    scene: Scene,
    otherScenes: Array<Scene | SceneGrid>,
    isPlaying: boolean,
    mainVideo: HTMLVideoElement,
    mainClip: Clip,
    mainClipValue: Array<number>,
    otherVideos: Array<Array<HTMLVideoElement>>,
    imagePlayerAdvanceHacks: Array<Array<ChildCallbackHack>>,
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
                useHotkeys
                video={this.props.mainVideo}
                volume={this.props.scene.videoVolume}
                clip={this.props.mainClip}
                clipValue={this.props.mainClipValue}
                nextTrack={() => {this.props.imagePlayerAdvanceHacks[0][0].fire()}}
                onChangeSpeed={this.changeKey.bind(this, 'videoSpeed', this.props.scene).bind(this)}
                onChangeVolume={this.changeKey.bind(this, 'videoVolume', this.props.scene).bind(this)}/>
            </React.Fragment>
          )}
        </Grid>
        {this.props.otherVideos && this.props.otherVideos.map((otherVideoList, listIndex) =>
          <React.Fragment key={listIndex}>
            {otherVideoList.map((otherVideo, index) => {
              if (otherVideo == null) return <React.Fragment key={index}/>;
              if (this.props.otherScenes[listIndex] == null) return <React.Fragment key={index}/>;
              const sourceURL = otherVideo.getAttribute("source");
              let otherVideoTitle;
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
              let clipValue = null;
              let clipID: number = null;
              let source = null;
              if (otherVideo.hasAttribute("start") && otherVideo.hasAttribute("end")) {
                clipValue = [parseFloat(otherVideo.getAttribute("start")), parseFloat(otherVideo.getAttribute("end"))]
                clipID = parseInt(otherVideo.getAttribute("clip"));
                if (this.props.otherScenes[listIndex] instanceof Scene) {
                  source = (this.props.otherScenes[listIndex] as Scene).sources.find((s) => s.url == sourceURL);
                }
              }
              return (
                <Grid item xs={12} key={index}>
                  <Typography>{this.props.otherScenes[listIndex].name} Video:</Typography>
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
                    nextTrack={() => {
                      this.props.imagePlayerAdvanceHacks[listIndex + 1][index].fire()
                    }}
                    onChangeSpeed={this.nop}
                    onChangeVolume={this.nop}/>
                </Grid>
              );
            })}
          </React.Fragment>
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

(VideoCard as any).displayName="VideoCard";