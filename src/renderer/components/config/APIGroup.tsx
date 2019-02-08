import * as React from 'react';

import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleTextInput from "../ui/SimpleTextInput";
import {RemoteSettings} from "../../Config";

export default class APIGroup extends React.Component {
  readonly props: {
    settings: RemoteSettings
    onUpdateSettings(keys: RemoteSettings, fn: (keys: RemoteSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="API Keys" isNarrow={true}>
        <div className="ControlSubgroup">
          <SimpleTextInput
            isEnabled={true}
            label="Default Tumblr API Key"
            value={this.props.settings.tumblrDefault}
            onChange={this.onChangeDefaultTumblr.bind(this)}>
            {" "}
            <button onClick={this.paste.bind(this, this.onChangeDefaultTumblr.bind(this))}>Paste</button>
          </SimpleTextInput>
          <SimpleTextInput
            isEnabled={true}
            label="Overlay Tumblr API Key"
            value={this.props.settings.tumblrOverlay}
            onChange={this.onChangeOverlayTumblr.bind(this)}>
            {" "}
            <button onClick={this.paste.bind(this, this.onChangeOverlayTumblr.bind(this))}>Paste</button>
          </SimpleTextInput>
        </div>
        <hr/>
        <div className="ControlSubgroup">
          <SimpleTextInput
              isEnabled={true}
              label="Reddit Client ID"
              value={this.props.settings.redditClientID}
              onChange={this.onChangeRedditClientID.bind(this)}>
            {" "}
            <button onClick={this.paste.bind(this, this.onChangeRedditClientID.bind(this))}>Paste</button>
          </SimpleTextInput>
          <SimpleTextInput
              isEnabled={true}
              label="Reddit Client Secret"
              value={this.props.settings.redditClientSecret}
              onChange={this.onChangeRedditClientSecret.bind(this)}>
            {" "}
            <button onClick={this.paste.bind(this, this.onChangeRedditClientSecret.bind(this))}>Paste</button>
          </SimpleTextInput>
          <SimpleTextInput
              isEnabled={true}
              label="Reddit Username"
              value={this.props.settings.redditUsername}
              onChange={this.onChangeRedditUsername.bind(this)}>
            {" "}
            <button onClick={this.paste.bind(this, this.onChangeRedditUsername.bind(this))}>Paste</button>
          </SimpleTextInput>
          <SimpleTextInput
              isEnabled={true}
              label="Reddit Password"
              value={this.props.settings.redditPassword}
              onChange={this.onChangeRedditPassword.bind(this)}>
            {" "}
            <button onClick={this.paste.bind(this, this.onChangeRedditPassword.bind(this))}>Paste</button>
          </SimpleTextInput>
        </div>
      </ControlGroup>
    )
  }

  paste(fn: Function) {
    (navigator as any).clipboard.readText().then((pastedText: string) => {
      fn(pastedText);
    });
  }

  update(fn: (keys: RemoteSettings) => void) {
    this.props.onUpdateSettings(this.props.settings, fn);
  }

  onChangeDefaultTumblr(tumblr: string) { this.update((s) => { s.tumblrDefault = tumblr; }); }
  onChangeOverlayTumblr(tumblr: string) { this.update((s) => { s.tumblrOverlay = tumblr; }); }

  onChangeRedditClientID(clientID: string) { this.update((s) => { s.redditClientID = clientID; }); }
  onChangeRedditClientSecret(clientSecret: string) { this.update((s) => { s.redditClientSecret = clientSecret; }); }
  onChangeRedditUsername(username: string) { this.update((s) => { s.redditUsername = username; }); }
  onChangeRedditPassword(password: string) { this.update((s) => { s.redditPassword = password; }); }
}