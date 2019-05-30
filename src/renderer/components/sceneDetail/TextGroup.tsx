import * as React from 'react';
import SystemFonts from 'system-font-families';

import {TOT} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import Scene from "../../data/Scene";
import ControlGroup from "./ControlGroup";
import SimpleColorPicker from "../ui/SimpleColorPicker";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleTextInput from "../ui/SimpleTextInput";
import SimpleURLInput from "../ui/SimpleURLInput";

export default class TextGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  readonly state = {
    showFontSettings: false,
    systemFonts: Array<string>(),
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
        <div className="ControlSubgroup">
          <button className="AdvancedButton" onClick={this.toggleFontOptions.bind(this)}>Font Options</button>
        </div>
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
              <SimpleColorPicker
                label="Blink Color"
                value={this.props.scene.blinkColor}
                onChange={this.changeKey.bind(this, 'blinkColor').bind(this)}/>
              {this.state.systemFonts.length > 0 && (
                <div className="SimpleOptionPicker">
                  <label>Blink Font Family</label>
                  <select
                    value={this.props.scene.blinkFontFamily}
                    onChange={this.changeKeyOnEvent.bind(this, 'blinkFontFamily').bind(this)}
                    style={{fontFamily: this.props.scene.blinkFontFamily, height: '1.5rem'}}>
                    {this.state.systemFonts.map((b) =>
                      <option value={b} key={b} style={{fontFamily: b}}>{b}</option>
                    )}
                  </select>
                </div>
              )}
              {this.state.systemFonts.length == 0 && (
                <SimpleTextInput
                  label="Blink Font Family"
                  value={this.props.scene.blinkFontFamily}
                  isEnabled={true}
                  onChange={this.changeKey.bind(this, 'blinkFontFamily').bind(this)}/>
              )}
            </div>
            <hr/>
            <div className="ControlSubgroup">
              <SimpleNumberInput
                label="Caption Font Size (vmin)"
                value={this.props.scene.captionFontSize}
                min={0}
                isEnabled={true}
                onChange={this.changeKey.bind(this, 'captionFontSize').bind(this)}/>
              <SimpleColorPicker
                label="Caption Color"
                value={this.props.scene.captionColor}
                onChange={this.changeKey.bind(this, 'captionColor').bind(this)}/>
              {this.state.systemFonts.length > 0 && (
                <div className="SimpleOptionPicker">
                  <label>Caption Font Family</label>
                  <select
                    value={this.props.scene.captionFontFamily}
                    onChange={this.changeKeyOnEvent.bind(this, 'captionFontFamily').bind(this)}
                    style={{fontFamily: this.props.scene.captionFontFamily, height: '1.5rem'}}>
                    {this.state.systemFonts.map((b) =>
                      <option value={b} key={b} style={{fontFamily: b}}>{b}</option>
                    )}
                  </select>
                </div>
              )}
              {this.state.systemFonts.length == 0 && (
                <SimpleTextInput
                  label="Caption Font Family"
                  value={this.props.scene.captionFontFamily}
                  isEnabled={true}
                  onChange={this.changeKey.bind(this, 'captionFontFamily').bind(this)}/>
              )}
            </div>
            <hr/>
            <div className="ControlSubgroup">
              <SimpleNumberInput
                label="Big Caption Font Size (vmin)"
                value={this.props.scene.captionBigFontSize}
                min={0}
                isEnabled={true}
                onChange={this.changeKey.bind(this, 'captionBigFontSize').bind(this)}/>
              <SimpleColorPicker
                label="Big Caption Color"
                value={this.props.scene.captionBigColor}
                onChange={this.changeKey.bind(this, 'captionBigColor').bind(this)}/>
              {this.state.systemFonts.length > 0 && (
                <div className="SimpleOptionPicker">
                  <label>Big Caption Font Family</label>
                  <select
                    value={this.props.scene.captionBigFontFamily}
                    onChange={this.changeKeyOnEvent.bind(this, 'captionBigFontFamily').bind(this)}
                    style={{fontFamily: this.props.scene.captionBigFontFamily, height: '1.5rem'}}>
                    {this.state.systemFonts.map((b) =>
                      <option value={b} key={b} style={{fontFamily: b}}>{b}</option>
                    )}
                  </select>
                </div>
              )}
              {this.state.systemFonts.length == 0 && (
                <SimpleTextInput
                  label="Big Caption Font Family"
                  value={this.props.scene.captionBigFontFamily}
                  isEnabled={true}
                  onChange={this.changeKey.bind(this, 'captionBigFontFamily').bind(this)}/>
              )}
            </div>
            <hr/>
            <div className="ControlSubgroup">
              <SimpleNumberInput
                label="Count Font Size (vmin)"
                value={this.props.scene.countFontSize}
                min={0}
                isEnabled={true}
                onChange={this.changeKey.bind(this, 'countFontSize').bind(this)}/>
              <SimpleColorPicker
                label="Count Color"
                value={this.props.scene.countColor}
                onChange={this.changeKey.bind(this, 'countColor').bind(this)}/>
              {this.state.systemFonts.length > 0 && (
                <div className="SimpleOptionPicker">
                  <label>Count Font Family</label>
                  <select
                    value={this.props.scene.countFontFamily}
                    onChange={this.changeKeyOnEvent.bind(this, 'countFontFamily').bind(this)}
                    style={{fontFamily: this.props.scene.countFontFamily, height: '1.5rem'}}>
                    {this.state.systemFonts.map((b) =>
                      <option value={b} key={b} style={{fontFamily: b}}>{b}</option>
                    )}
                  </select>
                </div>
              )}
              {this.state.systemFonts.length == 0 && (
                <SimpleTextInput
                  label="Count Font Family"
                  value={this.props.scene.countFontFamily}
                  isEnabled={true}
                  onChange={this.changeKey.bind(this, 'countFontFamily').bind(this)}/>
              )}
            </div>
          </div>
        )}
      </ControlGroup>
    );
  }

  componentDidMount() {
    // Define system fonts
    new SystemFonts().getFonts().then(
      (res: Array<string>) => {
        this.setState({systemFonts: res});
      },
      (err: string) => {
        console.error(err);
      }
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

  changeKeyOnEvent(key: string, value: any) {
    this.update((s) => s[key] = value.currentTarget.value);
  }
}