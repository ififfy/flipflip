import * as React from 'react';
import {CaptionSettings} from "../../Config";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleColorPicker from "../ui/SimpleColorPicker";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleTextInput from "../ui/SimpleTextInput";

export default class CaptionFontGroup extends React.Component {
  readonly props: {
    settings: CaptionSettings
    onUpdateSettings(settings: CaptionSettings, fn: (settings: CaptionSettings) => void): void,
  };

  render() {
    return (
        <ControlGroup title="Caption Font" isNarrow={true}>
          <div className="ControlSubgroup">
            <SimpleNumberInput
              label="Blink Font Size (vmin)"
              value={this.props.settings.blinkFontSize}
              min={0}
              isEnabled={true}
              onChange={this.onChangeBlinkFontSize.bind(this)}/>
            <SimpleTextInput
              label="Blink Font Family"
              value={this.props.settings.blinkFontFamily}
              isEnabled={true}
              onChange={this.onChangeBlinkFontFamily.bind(this)}/>
            <SimpleColorPicker
                label="Blink Color"
                value={this.props.settings.blinkColor}
                onChange={this.onChangeBlinkColor.bind(this)} />
          </div>
          <div className="ControlSubgroup">
            <SimpleNumberInput
                label="Caption Font Size (vmin)"
                value={this.props.settings.captionFontSize}
                min={0}
                isEnabled={true}
                onChange={this.onChangeCaptionFontSize.bind(this)}/>
            <SimpleTextInput
                label="Caption Font Family"
                value={this.props.settings.captionFontFamily}
                isEnabled={true}
                onChange={this.onChangeCaptionFontFamily.bind(this)}/>
            <SimpleColorPicker
                label="Caption Color"
                value={this.props.settings.captionColor}
                onChange={this.onChangeCaptionColor.bind(this)} />
          </div>
          <div className="ControlSubgroup">
            <SimpleNumberInput
                label="Big Caption Font Size (vmin)"
                value={this.props.settings.captionBigFontSize}
                min={0}
                isEnabled={true}
                onChange={this.onChangeCaptionBigFontSize.bind(this)}/>
            <SimpleTextInput
                label="Big Caption Font Family"
                value={this.props.settings.captionBigFontFamily}
                isEnabled={true}
                onChange={this.onChangeCaptionBigFontFamily.bind(this)}/>
            <SimpleColorPicker
                label="Big Caption Color"
                value={this.props.settings.captionBigColor}
                onChange={this.onChangeCaptionBigColor.bind(this)} />
          </div>
        </ControlGroup>
    )
  }

  update(fn: (settings: CaptionSettings) => void) {
    this.props.onUpdateSettings(this.props.settings, fn);
  }

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