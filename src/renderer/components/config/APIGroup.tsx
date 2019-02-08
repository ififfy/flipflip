import * as React from 'react';

import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleTextInput from "../ui/SimpleTextInput";
import {APIKeys} from "../../Config";

export default class APIGroup extends React.Component {
  readonly props: {
    keys: APIKeys
    onUpdateKeys(keys: APIKeys, fn: (keys: APIKeys) => void): void,
  };

  render() {
    return (
      <ControlGroup title="API Keys" isNarrow={true}>
        <SimpleTextInput
          isEnabled={true}
          label="Default Tumblr API Key"
          value={this.props.keys.defaultTumblr}
          onChange={this.onChangeDefaultTumblr.bind(this)}>
          {" "}
          <button onClick={this.paste.bind(this, this.onChangeDefaultTumblr.bind(this))}>Paste</button>
        </SimpleTextInput>
        <SimpleTextInput
          isEnabled={true}
          label="Overlay Tumblr API Key"
          value={this.props.keys.overlayTumblr}
          onChange={this.onChangeOverlayTumblr.bind(this)}>
          {" "}
          <button onClick={this.paste.bind(this, this.onChangeOverlayTumblr.bind(this))}>Paste</button>
        </SimpleTextInput>
      </ControlGroup>
    )
  }

  paste(fn: Function) {
    (navigator as any).clipboard.readText().then((pastedText: string) => {
      fn(pastedText);
    });
  }

  update(fn: (keys: APIKeys) => void) {
    this.props.onUpdateKeys(this.props.keys, fn);
  }

  onChangeDefaultTumblr(tumblr: string) { this.update((s) => { s.defaultTumblr = tumblr; }); }
  onChangeOverlayTumblr(tumblr: string) { this.update((s) => { s.overlayTumblr = tumblr; }); }
}