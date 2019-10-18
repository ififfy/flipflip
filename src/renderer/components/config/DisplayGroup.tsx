import * as React from 'react';

import {DisplaySettings} from "../../data/Config";
import ControlGroup from "../ui/ControlGroup";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleNumberInput from "../ui/SimpleNumberInput";

export default class DisplayGroup extends React.Component {
  readonly props: {
    settings: DisplaySettings,
    onUpdateSettings(keys: DisplaySettings, fn: (keys: DisplaySettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Player Settings" isNarrow={true}>
        <div className="ControlSubgroup m-inline">
          <SimpleCheckbox
            text={"Always on Top"}
            isOn={this.props.settings.alwaysOnTop}
            onChange={this.changeKey.bind(this, 'alwaysOnTop').bind(this)}/>
          <SimpleCheckbox
            text={"Show Menu"}
            isOn={this.props.settings.showMenu}
            onChange={this.changeKey.bind(this, 'showMenu').bind(this)}/>
          <SimpleCheckbox
            text={"Fullscreen"}
            isOn={this.props.settings.fullScreen}
            onChange={this.changeKey.bind(this, 'fullScreen').bind(this)}/>
          <SimpleCheckbox
            text={"Start Immediately"}
            isOn={this.props.settings.startImmediately}
            onChange={this.changeKey.bind(this, 'startImmediately').bind(this)}/>
        </div>
        <hr/>
        <div className="ControlSubgroup m-inline">
          <SimpleNumberInput
            label={"Min Image Size (px)"}
            value={this.props.settings.minImageSize}
            isEnabled={true}
            min={0}
            onChange={this.changeKey.bind(this, 'minImageSize').bind(this)}/>
          <SimpleNumberInput
            label={"Min Video Size (px)"}
            value={this.props.settings.minVideoSize}
            isEnabled={true}
            min={0}
            onChange={this.changeKey.bind(this, 'minVideoSize').bind(this)}/>
          <SimpleNumberInput
            label={"Max in Memory"}
            value={this.props.settings.maxInMemory}
            isEnabled={true}
            min={0}
            onChange={this.changeKey.bind(this, 'maxInMemory').bind(this)}/>
          <SimpleNumberInput
            label={"Max Loading at Once"}
            value={this.props.settings.maxLoadingAtOnce}
            isEnabled={true}
            min={0}
            onChange={this.changeKey.bind(this, 'maxLoadingAtOnce').bind(this)}/>
          <SimpleNumberInput
            label={"Max in History"}
            value={this.props.settings.maxInHistory}
            isEnabled={true}
            min={0}
            onChange={this.changeKey.bind(this, 'maxInHistory').bind(this)}/>
        </div>
      </ControlGroup>
    )
  }

  nop() {}

  update(fn: (keys: any) => void) {
    this.props.onUpdateSettings(this.props.settings, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }
}