import {remote} from "electron";
import * as React from 'react';

import {CacheSettings} from "../../Config";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleTextInput from "../ui/SimpleTextInput";

export default class CacheGroup extends React.Component {
  readonly props: {
    settings: CacheSettings,
    onUpdateSettings(settings: CacheSettings, fn: (settings: CacheSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Caching" isNarrow={true}>
        <SimpleCheckbox
          text="Enable Caching"
          isOn={this.props.settings.enabled}
          onChange={this.changeKey.bind(this, 'enabled').bind(this)}/>
        <SimpleTextInput
          isEnabled={this.props.settings.enabled}
          label="Caching Directory"
          value={this.props.settings.directory}
          onChange={this.changeKey.bind(this, 'directory').bind(this)}>
          {" "}
          <button className={this.props.settings.enabled ? '' : 'u-disabled'}
                  onClick={this.props.settings.enabled ? this.pickDirectory.bind(this) : this.nop}>Browse
          </button>
          {" "}
          <button className={this.props.settings.enabled ? '' : 'u-disabled'}
                  onClick={this.props.settings.enabled ? this.paste.bind(this) : this.nop}>Paste
          </button>
          {" "}
          {this.props.settings.directory == "" && (
            <span>You are using the default directory</span>
          )}
        </SimpleTextInput>
        <SimpleNumberInput
          label="Caching Directory Max Size (MB)"
          min={0}
          value={this.props.settings.maxSize}
          isEnabled={this.props.settings.enabled}
          onChange={this.changeKey.bind(this, 'maxSize').bind(this)}/>
      </ControlGroup>
    );
  }

  nop() {}

  pickDirectory() {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']});
    if (!result) return;
    this.changeKey('directory', result[0]);
  }

  paste() {
    (navigator as any).clipboard.readText().then((pastedText: string) => {
      this.changeKey('directory', pastedText);
    });
  }

  update(fn: (settings: any) => void) {
    this.props.onUpdateSettings(this.props.settings, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }
}