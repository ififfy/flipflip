import {remote} from "electron";
import * as React from 'react';
import {existsSync} from "fs";
import rimraf from "rimraf";
import getFolderSize from 'get-folder-size';

import {getCachePath} from "../../utils";
import Config, {CacheSettings} from "../../Config";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleCheckbox from "../ui/SimpleCheckbox";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import SimpleTextInput from "../ui/SimpleTextInput";

export default class CacheGroup extends React.Component {
  readonly props: {
    config: Config,
    onUpdateSettings(settings: CacheSettings, fn: (settings: CacheSettings) => void): void,
  };

  readonly state = {
    cacheSize: "--",
  };

  render() {
    return (
      <ControlGroup title="Caching" isNarrow={true}>
        <SimpleCheckbox
          text="Enable Caching"
          isOn={this.props.config.caching.enabled}
          onChange={this.changeKey.bind(this, 'enabled').bind(this)}>
          <button className={this.props.config.caching.enabled ? '' : 'u-disabled'}
                  onClick={this.props.config.caching.enabled ? this.clearCache.bind(this) : this.nop}>ClearCache
          </button>
        </SimpleCheckbox>
        <SimpleTextInput
          isEnabled={this.props.config.caching.enabled}
          label="Caching Directory"
          value={this.props.config.caching.directory}
          onChange={this.changeKey.bind(this, 'directory').bind(this)}>
          {" "}
          <button className={this.props.config.caching.enabled ? '' : 'u-disabled'}
                  onClick={this.props.config.caching.enabled ? this.pickDirectory.bind(this) : this.nop}>Browse
          </button>
          {" "}
          <button className={this.props.config.caching.enabled ? '' : 'u-disabled'}
                  onClick={this.props.config.caching.enabled ? this.paste.bind(this) : this.nop}>Paste
          </button>
          {" "}
          {this.props.config.caching.directory == "" && (
            <span>You are using the default directory</span>
          )}
        </SimpleTextInput>
        <span>Cache Dir size: {this.state.cacheSize}</span>
        <SimpleNumberInput
          label="Caching Directory Max Size (MB)"
          min={0}
          value={this.props.config.caching.maxSize}
          isEnabled={this.props.config.caching.enabled}
          onChange={this.changeKey.bind(this, 'maxSize').bind(this)}/>
      </ControlGroup>
    );
  }

  nop() {}

  componentDidMount() {
    this.calculateCacheSize();
  }

  calculateCacheSize() {
    const cachePath = getCachePath(null, this.props.config);
    if (existsSync(cachePath)) {
      getFolderSize(getCachePath(null, this.props.config), (err: string, size: number) => {
        if (err) { throw err; }
        const mbSize = (size / 1024 / 1024);
        this.setState({cacheSize:  mbSize.toFixed(2) + "MB"});
      });
    }
  }

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
    this.props.onUpdateSettings(this.props.config.caching, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  clearCache() {
    const cachePath = getCachePath(null, this.props.config);
    if (!confirm("Are you SURE you want to delete " + cachePath + "?")) return;
    rimraf.sync(cachePath);
    this.setState({cacheSize: "--"});
  }
}