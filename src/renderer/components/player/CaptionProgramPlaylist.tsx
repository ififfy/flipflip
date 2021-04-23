import * as React from "react";

import {randomizeList} from "../../data/utils";
import Audio from "../../data/Audio";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import CaptionProgram from "./CaptionProgram";
import ChildCallbackHack from "./ChildCallbackHack";
import CaptionScript from "../../data/CaptionScript";
import {RP} from "../../data/const";

export default class CaptionProgramPlaylist extends React.Component {
  readonly props: {
    playlistIndex: number,
    playlist: { scripts: Array<CaptionScript>, shuffle: boolean, repeat: string },
    currentAudio: Audio
    currentImage: HTMLImageElement | HTMLVideoElement,
    scale: number,
    scene: Scene,
    timeToNextFrame: number,
    getTags(source: string, clipID?: string): Array<Tag>,
    goBack(): void,
    orderScriptTags(script: CaptionScript): void,
    playNextScene(): void,
    jumpToHack?: ChildCallbackHack,
    persist?: boolean,
    advance?(): void,
    getCurrentTimestamp?(): number,
    onError?(e: string): void,
    systemMessage?(message: string): void,
  };

  readonly state = {
    currentIndex: this.props.playlistIndex == 0 ? this.props.scene.scriptStartIndex : 0,
    playingScripts: Array<CaptionScript>(),
  }

  render() {
    let script = this.state.playingScripts[this.state.currentIndex];
    if (!script) script = this.props.playlist.scripts[this.state.currentIndex];
    if (!script) return <div/>;
    return (
      <CaptionProgram
        captionScript={script}
        repeat={this.props.playlist.repeat}
        scale={this.props.scale}
        singleTrack={this.state.playingScripts.length == 1}
        getTags={this.props.getTags}
        goBack={this.props.goBack}
        playNextScene={this.props.playNextScene}
        nextTrack={this.nextTrack.bind(this)}
        currentAudio={this.props.currentAudio}
        getCurrentTimestamp={this.props.getCurrentTimestamp}
        timeToNextFrame={this.props.timeToNextFrame}
        currentImage={this.props.currentImage}
        jumpToHack={this.props.jumpToHack}
        advance={this.props.advance}
        onError={this.props.onError}/>
    );
  }

  componentDidUpdate(props: any) {
    if (!this.props.persist && this.props.playlist !== props.playlist) {
      this.restart();
    }
  }

  componentDidMount() {
    if (this.props.playlistIndex == 0 && this.props.scene.scriptScene) {
      window.addEventListener('keydown', this.onKeyDown, false);
    }
    this.restart();
  }

  restart() {
    let scripts = this.props.playlist.scripts;
    if (this.props.playlist.shuffle) {
      scripts = randomizeList(Array.from(scripts));
    }
    this.setState({playingScripts: scripts});
  }

  componentWillUnmount() {
    if (this.props.playlistIndex == 0 && this.props.scene.scriptScene) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case '[':
        e.preventDefault();
        this.props.orderScriptTags(this.props.playlist.scripts[this.state.currentIndex]);
        this.prevTrack();
        break;
      case ']':
        e.preventDefault();
        this.props.orderScriptTags(this.props.playlist.scripts[this.state.currentIndex]);
        this.nextTrack();
        break;
    }
  }

  prevTrack() {
    let prevTrack = this.state.currentIndex - 1;
    if (prevTrack < 0) {
      prevTrack = this.props.playlist.scripts.length - 1;
    }
    this.setState({currentIndex: prevTrack});
  }

  nextTrack() {
    let nextTrack = this.state.currentIndex + 1;
    if (nextTrack >= this.props.playlist.scripts.length) {
      if (this.props.playlist.repeat == RP.none) {
        nextTrack = this.props.playlist.scripts.length;
      } else {
        nextTrack = 0;
      }
    }
    this.setState({currentIndex: nextTrack});
  }
}