import * as React from 'react';
import {TOT} from "../../const";

import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleURLInput from "../ui/SimpleURLInput";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import ControlGroup from "./ControlGroup";
import Scene from "../../Scene";
import {SceneSettings} from "../../Config";
import SimpleTextInput from "../ui/SimpleTextInput";
import SimpleColorPicker from "../ui/SimpleColorPicker";

export default class TextGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    isPlayer: boolean,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  readonly state = {
    showFontSettings: false
  };

  render() {
    return (
      <ControlGroup title="Text" isNarrow={true}>
        <div className="ControlSubgroup">
          <SimpleOptionPicker
            onChange={this.onChangeTextKind.bind(this)}
            label="Source"
            value={this.props.scene.textKind}
            keys={Object.values(TOT)} />
          <SimpleURLInput
            isEnabled={true}
            onChange={this.onChangeTextSource.bind(this)}
            label={(() => {
              switch (this.props.scene.textKind) {
                case TOT.hastebin: return "Hastebin ID";
                case TOT.url: return "URL";
              }
            })()}
            value={this.props.scene.textSource} />
          <br/>
        </div>
        {!this.props.isPlayer && (
          <div className="ControlSubgroup">
            <button className="AdvancedButton" onClick={this.toggleFontOptions.bind(this)} >Font Options</button>
          </div>
        )}
        {this.state.showFontSettings && (
          <div>
            <hr/>
            <div className="ControlSubgroup">
              <SimpleNumberInput
                label="Blink Font Size (vmin)"
                value={this.props.scene.blinkFontSize}
                min={0}
                isEnabled={true}
                onChange={this.onChangeBlinkFontSize.bind(this)}/>
              <SimpleTextInput
                label="Blink Font Family"
                value={this.props.scene.blinkFontFamily}
                isEnabled={true}
                onChange={this.onChangeBlinkFontFamily.bind(this)}/>
              <SimpleColorPicker
                label="Blink Color"
                value={this.props.scene.blinkColor}
                onChange={this.onChangeBlinkColor.bind(this)} />
            </div>
            <hr/>
            <div className="ControlSubgroup">
              <SimpleNumberInput
                label="Caption Font Size (vmin)"
                value={this.props.scene.captionFontSize}
                min={0}
                isEnabled={true}
                onChange={this.onChangeCaptionFontSize.bind(this)}/>
              <SimpleTextInput
                label="Caption Font Family"
                value={this.props.scene.captionFontFamily}
                isEnabled={true}
                onChange={this.onChangeCaptionFontFamily.bind(this)}/>
              <SimpleColorPicker
                label="Caption Color"
                value={this.props.scene.captionColor}
                onChange={this.onChangeCaptionColor.bind(this)} />
            </div>
            <hr/>
            <div className="ControlSubgroup">
              <SimpleNumberInput
                label="Big Caption Font Size (vmin)"
                value={this.props.scene.captionBigFontSize}
                min={0}
                isEnabled={true}
                onChange={this.onChangeCaptionBigFontSize.bind(this)}/>
              <SimpleTextInput
                label="Big Caption Font Family"
                value={this.props.scene.captionBigFontFamily}
                isEnabled={true}
                onChange={this.onChangeCaptionBigFontFamily.bind(this)}/>
              <SimpleColorPicker
                label="Big Caption Color"
                value={this.props.scene.captionBigColor}
                onChange={this.onChangeCaptionBigColor.bind(this)} />
            </div>
          </div>
        )}
      </ControlGroup>
    );
  }

  toggleFontOptions() {
    this.setState({showFontSettings: !this.state.showFontSettings});
  }

  update(fn: (scene: Scene | SceneSettings) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  onChangeTextKind(kind: string) { this.update((s) => { s.textKind = kind; }); }
  onChangeTextSource(textSource: string) { this.update((s) => { s.textSource = textSource; }); }

  onChangeBlinkColor(blinkColor: string) { this.update((s) => { s.blinkColor = blinkColor; }); }
  onChangeBlinkFontSize(blinkFontSize: number) { this.update((s) => { s.blinkFontSize = blinkFontSize; }); }
  onChangeBlinkFontFamily(blinkFontFamily: string) { this.update((s) => { s.blinkFontFamily = blinkFontFamily; }); }

  onChangeCaptionColor(captionColor: string) { this.update((s) => { s.captionColor = captionColor; }); }
  onChangeCaptionFontSize(captionFontSize: number) { this.update((s) => { s.captionFontSize = captionFontSize; }); }
  onChangeCaptionFontFamily(captionFontFamily: string) { this.update((s) => { s.captionFontFamily = captionFontFamily; }); }

  onChangeCaptionBigColor(captionBigColor: string) { this.update((s) => { s.captionBigColor = captionBigColor; }); }
  onChangeCaptionBigFontSize(captionBigFontSize: number) { this.update((s) => { s.captionBigFontSize = captionBigFontSize; }); }
  onChangeCaptionBigFontFamily(captionBigFontFamily: string) { this.update((s) => { s.captionBigFontFamily = captionBigFontFamily; }); }

}