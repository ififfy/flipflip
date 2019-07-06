import * as React from 'react';
import Sound from "react-sound";

export default class SoundTick extends React.Component {
  readonly props: {
    url: string,
    playing: any,
    speed: number,
    volume: number,
    tick: boolean,
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
        autoLoad={true}
        loop={false}
        volume={this.props.volume}
        playFromPosition={0}/>
    );
  }
}