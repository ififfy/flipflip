import * as React from 'react';
import InputRange from "react-input-range";

import {BT, VC} from "../../data/const";
import {getTimestamp, getTimestampValue} from "../../data/utils";
import ImageView from "./ImageView";
import VideoControl from "./VideoControl";
import LibrarySource from "../library/LibrarySource";
import Clip from "../library/Clip";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleTextInput from "../ui/SimpleTextInput";
import Scene from "../../data/Scene";

export default class VideoClipper extends React.Component {
  readonly props: {
    source: LibrarySource,
    videoVolume: number,
    onUpdateClips(url: string, clips: Array<Clip>): void,
    goBack(): void,
    cache(video: HTMLVideoElement): void,
  };

  readonly state = {
    scene: new Scene(),
    video: null as HTMLVideoElement,
    isEditing: -1,
    isEditingValue: null as {min: number, max: number},
    isEditingStartText: "",
    isEditingEndText: "",
  };

  render() {
    return (
      <div className="VideoClipper">
        <div className="u-button-row">
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack.bind(this)}>Back</div>
          <div className="VolumeControl u-button-row-right" style={{marginTop: '-4px'}}>
            <div
              className="u-small-icon-button">
              <div className="u-volume-down"/>
            </div>
            <SimpleSliderInput
              label=""
              min={0}
              max={100}
              value={this.state.scene.videoVolume}
              isEnabled={true}
              onChange={this.onChangeVolume.bind(this)} />
            <div
              className="u-small-icon-button">
              <div className="u-volume-up"/>
            </div>
          </div>
        </div>
        {this.state.video && (
          <React.Fragment>
            <ImageView
              image={this.state.video}
              scene={this.state.scene}
              timeToNextFrame={0}
              fitParent={true}
              hasStarted={true}
              onLoaded={this.nop}
              setVideo={this.nop}/>
            <div className="VideoClipper__Clipper">
              {this.state.isEditing == -1 && (
                <div className="VideoClipper__Buttons">
                  {this.props.source.clips && (
                    <div className="VideoClipper__ClipList">
                      {this.props.source.clips.map((c) =>
                        <div className="VideoClipper__Clip u-button u-clickable"
                             key={c.id}
                             onClick={this.onEdit.bind(this, c)}>
                          {c.id}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="VideoClipper__Add u-button u-clickable"
                       onClick={this.onAdd.bind(this)}>
                    + Add New Clip
                  </div>
                </div>
              )}
              {this.state.isEditing != -1 && (
                <div className="TrackControls">
                  <div className="VideoSlider">
                    <InputRange
                      draggableTrack
                      minValue={0}
                      maxValue={this.state.video.duration}
                      value={this.state.isEditingValue}
                      formatLabel={(value) => getTimestamp(value)}
                      onChange={this.onChangeValue.bind(this)}/>
                  </div>
                  <div className="TrackInputs"
                       style={{maxWidth: this.state.isEditing == 0 ?  '14.5rem': '17.5rem'}}>
                    <SimpleTextInput
                      label="Start"
                      value={this.state.isEditingStartText}
                      isEnabled={true}
                      onChange={this.onChangeStartText.bind(this)}/>
                    <SimpleTextInput
                      label="End"
                      value={this.state.isEditingEndText}
                      isEnabled={true}
                      onChange={this.onChangeEndText.bind(this)}/>
                    <div
                      className="u-button u-icon-button u-clickable"
                      title="Save"
                      onClick={this.onSave.bind(this)}>
                      <div className="u-save"/>
                    </div>
                    {this.state.isEditing > 0 && (
                      <div
                        className="u-button u-icon-button u-clickable"
                        title="Delete"
                        onClick={this.onRemove.bind(this)}>
                        <div className="u-delete"/>
                      </div>
                    )}
                    <div
                      className="u-button u-icon-button u-clickable"
                      title="Cancel"
                      onClick={this.onCancel.bind(this)}>
                      <div className="u-back"/>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <VideoControl
                  video={this.state.video}
                  mode={VC.sceneClipper}
                  volume={this.state.scene.videoVolume}
                  clip={this.state.isEditingValue}
                  onChangeVolume={this.onChangeVolume.bind(this)}/>
              </div>
            </div>
          </React.Fragment>
        )}
        {!this.state.video && (
          <div className="ProgressIndicator">
          <h1>Loading...</h1>
        </div>
        )}
      </div>
    )
  }

  nop() {}

  componentDidMount() {
    const scene = this.state.scene;
    scene.backgroundType = BT.color;
    scene.backgroundColor = "#010101";
    scene.videoVolume = this.props.videoVolume;
    this.setState({scene: scene});

    let video = document.createElement('video');

    video.onerror = () => {
      console.error("Error loading " + this.props.source.url);
    };

    video.onloadeddata = () => {
      this.props.cache(video);
      this.setState({video: video});
    };

    video.src = this.props.source.url;
    video.preload = "auto";
    video.loop = true;
    video.load();
  }

  onAdd() {
    this.setState({
      isEditing: 0,
      isEditingValue: {min: 0, max: this.state.video.duration},
      isEditingStartText: getTimestamp(0),
      isEditingEndText: getTimestamp(this.state.video.duration),
    });
  }

  onEdit(clip: Clip) {
    this.setState({
      isEditing: clip.id,
      isEditingValue: {min: clip.start, max: clip.end},
      isEditingStartText: getTimestamp(clip.start),
      isEditingEndText: getTimestamp(clip.end),
    });
  }

  onCancel() {
    this.closeEdit();
  }

  onSave() {
    const source = this.props.source;
    let clip = source.clips.find((c) => c.id == this.state.isEditing);
    if (clip) {
      clip.start = this.state.isEditingValue.min;
      clip.end = this.state.isEditingValue.max;
    } else {
      const newClip = new Clip();
      let id = source.clips.length + 1;
      source.clips.forEach((c) => {
        id = Math.max(c.id + 1, id);
      });
      newClip.id = id;
      newClip.start = this.state.isEditingValue.min;
      newClip.end = this.state.isEditingValue.max;
      source.clips.push(newClip);
    }
    this.props.onUpdateClips(source.url, source.clips);
    this.closeEdit();
  }

  onRemove() {
    if (this.state.isEditing > 0) {
      const source = this.props.source;
      source.clips = source.clips.filter((c) => c.id !== this.state.isEditing);
      source.clips.forEach((c) => {
        if (c.id > this.state.isEditing) {
          c.id = c.id - 1;
        }
      });
      this.props.onUpdateClips(source.url, source.clips);
    }
    this.closeEdit();
  }

  closeEdit() {
    this.setState({
      isEditing: -1,
      isEditingValue: null,
      isEditingStartText: "",
      isEditingEndText: "",
    });
  }

  onChangeVolume(volume: number) {
    const scene = this.state.scene;
    scene.videoVolume = volume;
    this.setState({scene: scene});
    if (this.state.video) {
      this.state.video.volume = volume / 100;
    }
  }

  onChangeValue(value: {min: number, max: number}) {
    let min = value.min;
    let max = value.max;
    if (min < 0) min = 0;
    if (max < 0) max = 0;
    if (min > this.state.video.duration) min = this.state.video.duration;
    if (max > this.state.video.duration) max = this.state.video.duration;

    if (this.state.video.paused) {
      if (value.min != this.state.isEditingValue.min) {
        this.state.video.currentTime = min;
      } else if (value.max != this.state.isEditingValue.max) {
        this.state.video.currentTime = max;
      }
    } else {
      if (this.state.video.currentTime < min) {
        this.state.video.currentTime = min;
      } else if (this.state.video.currentTime > max) {
        this.state.video.currentTime = max;
      }
    }

    this.setState({
      isEditingValue: {min: min, max: max},
      isEditingStartText: getTimestamp(min),
      isEditingEndText: getTimestamp(max),
    });
  }

  onChangeStartText(value: string) {
    this.setState({isEditingStartText: value});
    let timestampValue = getTimestampValue(value);
    if (timestampValue) {
      this.onChangeValue({min: timestampValue, max: this.state.isEditingValue.max});
    }
  }

  onChangeEndText(value: string) {
    this.setState({isEditingEndText: value});
    let timestampValue = getTimestampValue(value);
    if (timestampValue) {
      this.onChangeValue({min: this.state.isEditingValue.min, max: timestampValue});
    }
  }
}