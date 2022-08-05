import * as React from "react";

import {Card, CardContent, Grid} from "@mui/material";

import Scene from "../../data/Scene";
import AudioCard from "../configGroups/AudioCard";
import TextCard from "../configGroups/TextCard";
import {SceneSettings} from "../../data/Config";
import Audio from "../../data/Audio";
import CaptionScript from "../../data/CaptionScript";

export default class AudioTextEffects extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    onAddScript(playlistIndex: number): void,
    onAddTracks(playlistIndex: number): void,
    onPlayAudio(source: Audio, displayed: Array<Audio>): void,
    onPlayScript(source: CaptionScript, sceneID: number, displayed: Array<CaptionScript>): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    systemMessage(message: string): void,
  };

  render() {
    return(
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <AudioCard
                scene={this.props.scene}
                startPlaying={false}
                onAddTracks={this.props.onAddTracks.bind(this)}
                onPlay={this.props.onPlayAudio}
                onUpdateScene={this.props.onUpdateScene.bind(this)}
                systemMessage={this.props.systemMessage}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <TextCard
                scene={this.props.scene}
                onAddScript={this.props.onAddScript.bind(this)}
                onPlay={this.props.onPlayScript}
                onUpdateScene={this.props.onUpdateScene.bind(this)}
                systemMessage={this.props.systemMessage}/>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

(AudioTextEffects as any).displayName="AudioTextEffects";