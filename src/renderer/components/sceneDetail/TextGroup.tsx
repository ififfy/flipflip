import * as React from 'react';

import {TOT} from "../../const";
import {SceneSettings} from "../../Config";
import Scene from "../../Scene";
import ControlGroup from "./ControlGroup";
import SimpleColorPicker from "../ui/SimpleColorPicker";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleTextInput from "../ui/SimpleTextInput";
import SimpleURLInput from "../ui/SimpleURLInput";

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
            onChange={this.changeKey.bind(this, 'textKind').bind(this)}
            label="Source"
            value={this.props.scene.textKind}
            keys={Object.values(TOT)}/>
          <SimpleURLInput
            isEnabled={true}
            onChange={this.changeKey.bind(this, 'textSource').bind(this)}
            label={(() => {
              switch (this.props.scene.textKind) {
                case TOT.hastebin:
                  return "Hastebin ID";
                case TOT.url:
                  return "URL";
              }
            })()}
            value={this.props.scene.textSource}/>
          <br/>
        </div>
        {!this.props.isPlayer && (
          <div className="ControlSubgroup">
            <button className="AdvancedButton" onClick={this.toggleFontOptions.bind(this)}>Font Options</button>
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
                onChange={this.changeKey.bind(this, 'blinkFontSize').bind(this)}/>
              <SimpleTextInput
                label="Blink Font Family"
                value={this.props.scene.blinkFontFamily}
                isEnabled={true}
                onChange={this.changeKey.bind(this, 'blinkFontFamily').bind(this)}/>
              <SimpleColorPicker
                label="Blink Color"
                value={this.props.scene.blinkColor}
                onChange={this.changeKey.bind(this, 'blinkColor').bind(this)}/>
            </div>
            <hr/>
            <div className="ControlSubgroup">
              <SimpleNumberInput
                label="Caption Font Size (vmin)"
                value={this.props.scene.captionFontSize}
                min={0}
                isEnabled={true}
                onChange={this.changeKey.bind(this, 'captionFontSize').bind(this)}/>
              <SimpleTextInput
                label="Caption Font Family"
                value={this.props.scene.captionFontFamily}
                isEnabled={true}
                onChange={this.changeKey.bind(this, 'captionFontFamily').bind(this)}/>
              <SimpleColorPicker
                label="Caption Color"
                value={this.props.scene.captionColor}
                onChange={this.changeKey.bind(this, 'captionColor').bind(this)}/>
            </div>
            <hr/>
            <div className="ControlSubgroup">
              <SimpleNumberInput
                label="Big Caption Font Size (vmin)"
                value={this.props.scene.captionBigFontSize}
                min={0}
                isEnabled={true}
                onChange={this.changeKey.bind(this, 'captionBigFontSize').bind(this)}/>
              <SimpleTextInput
                label="Big Caption Font Family"
                value={this.props.scene.captionBigFontFamily}
                isEnabled={true}
                onChange={this.changeKey.bind(this, 'captionBigFontFamily').bind(this)}/>
              <SimpleColorPicker
                label="Big Caption Color"
                value={this.props.scene.captionBigColor}
                onChange={this.changeKey.bind(this, 'captionBigColor').bind(this)}/>
            </div>
          </div>
        )}
      </ControlGroup>
    );
  }

  toggleFontOptions() {
    this.setState({showFontSettings: !this.state.showFontSettings});
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }
}