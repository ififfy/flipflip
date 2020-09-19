import * as React from 'react';
import Sound from "react-sound";

export default class SoundTick extends React.Component {
  readonly props: {
    url: string,
    playing: any,
    speed: number,
    volume: number,
    tick: boolean,
    onPlaying(soundData: any): void,
    onError(errorCode: number, description: string): void,
    onFinishedPlaying(): void,
  };

  shouldComponentUpdate(props: any) {
    return this.props.tick !== props.tick;
  }

  render() {
    return (
      <Sound
        url={this.props.url}
        playStatus={this.props.playing}
        playbackRate={this.props.speed}
        autoLoad
        loop={false}
        volume={this.props.volume}
        onPlaying={this.props.onPlaying.bind(this)}
        onError={this.props.onError.bind(this)}
        onFinishedPlaying={this.props.onFinishedPlaying.bind(this)}
        playFromPosition={this.props.tick ? 0 : 1}/>
    );
  }
}