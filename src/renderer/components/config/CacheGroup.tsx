import * as React from 'react';
import {remote} from "electron";

import {CacheSettings} from "../../Config";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleTextInput from "../ui/SimpleTextInput";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleNumberInput from "../ui/SimpleNumberInput";

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
          onChange={this.onChangeEnabled.bind(this)}/>
        <SimpleTextInput
          isEnabled={this.props.settings.enabled}
          label="Caching Directory"
          value={this.props.settings.directory}
          onChange={this.onChangeDirectory.bind(this)} >
          {" "}
          <button className={this.props.settings.enabled ? '' : 'u-disabled'} onClick={this.props.settings.enabled ? this.pickDirectory.bind(this) : this.nop}>Browse</button>
          {" "}
          <button className={this.props.settings.enabled ? '' : 'u-disabled'} onClick={this.props.settings.enabled ? this.paste.bind(this) : this.nop}>Paste</button>
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
          onChange={this.onChangeMaxSize.bind(this)}/>
      </ControlGroup>
    );
  }

  nop() {}

  pickDirectory() {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(),{properties: ['openDirectory']});
    if (!result) return;
    this.onChangeDirectory(result[0]);
  }

  paste() {
    (navigator as any).clipboard.readText().then((pastedText: string) => {
      this.onChangeDirectory(pastedText);
    });
  }

  update(fn: (settings: CacheSettings) => void) {
    this.props.onUpdateSettings(this.props.settings, fn);
  }

  onChangeEnabled(enabled: boolean) { this.update((s) => { s.enabled = enabled; }); }

  onChangeDirectory(directory: string) { this.update((s) => { s.directory = directory; }); }

  onChangeMaxSize(maxSize: number) { this.update((s) => { s.maxSize = maxSize; }); }
}