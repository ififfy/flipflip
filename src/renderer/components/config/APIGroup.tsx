import * as React from 'react';

import {RemoteSettings} from "../../Config";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleTextInput from "../ui/SimpleTextInput";

export default class APIGroup extends React.Component {
  readonly props: {
    settings: RemoteSettings
    activateTumblr(): void,
    nextTumblr(): void,
    clearTumblr(): void,
    activateReddit(): void,
    clearReddit(): void,
    onUpdateSettings(keys: RemoteSettings, fn: (keys: RemoteSettings) => void): void,
  };

  render() {
    const tumblrAuthorized = this.props.settings.tumblrOAuthToken != "" && this.props.settings.tumblrOAuthTokenSecret != "";
    const redditAuthorized = this.props.settings.redditRefreshToken != "";
    const indexOf = this.props.settings.tumblrKeys.indexOf(this.props.settings.tumblrKey);
    return (
      <ControlGroup title="API Keys" isNarrow={true}>
        <div className="ControlSubgroup" style={{display: 'block'}}>
          <div>
            <button onClick={!tumblrAuthorized ? this.props.activateTumblr.bind(this) : this.nop}
                    className={`u-button ${!tumblrAuthorized ? 'u-clickable' : 'u-disabled'}`}>Authorize FlipFlip on Tumblr</button>
            <button onClick={tumblrAuthorized ? this.props.clearTumblr.bind(this) : this.nop}
                    className={`u-button ${tumblrAuthorized ? 'u-clickable' : 'u-disabled'}`}>Clear Tumblr Token</button>
          </div>
          <br/>
          <div>
            <SimpleTextInput
              isEnabled={!tumblrAuthorized}
              label="Tumblr OAuth Consumer Key"
              value={this.props.settings.tumblrKey}
              onChange={this.changeKey.bind(this, 'tumblrKey').bind(this)}>
              {" "}
              <button onClick={this.paste.bind(this, this.changeKey.bind(this, 'tumblrKey').bind(this))}>Paste</button>
            </SimpleTextInput>
            <SimpleTextInput
              isEnabled={!tumblrAuthorized}
              label="Tumblr OAuth Consumer Secret"
              value={this.props.settings.tumblrSecret}
              onChange={this.changeKey.bind(this, 'tumblrSecret').bind(this)}>
              {" "}
              <button onClick={this.paste.bind(this, this.changeKey.bind(this, 'tumblrSecret').bind(this))}>Paste</button>
            </SimpleTextInput>
            {tumblrAuthorized && indexOf !== -1 && (
              <div>
                <span>Using Tumblr API Key {indexOf + 1}</span>
                <button onClick={tumblrAuthorized ? this.props.nextTumblr.bind(this) : this.nop}
                        className={`u-button ${tumblrAuthorized ? 'u-clickable' : 'u-disabled'}`}>Try Next Tumblr Token</button>
              </div>
            )}
          </div>
        </div>
        <hr/>
        <div className="ControlSubgroup">
          <button onClick={!redditAuthorized ? this.props.activateReddit.bind(this) : this.nop}
                  className={`u-button ${!redditAuthorized ? 'u-clickable' : 'u-disabled'}`}>Authorize FlipFlip on Reddit</button>
          <button onClick={redditAuthorized ? this.props.clearReddit.bind(this) : this.nop}
                  className={`u-button ${redditAuthorized ? 'u-clickable' : 'u-disabled'}`}>Clear Reddit Token</button>
        </div>
        <hr/>
        <div className="ControlSubgroup">
          <SimpleTextInput
            label={"Instagram Username"}
            value={this.props.settings.instagramUsername}
            isEnabled={true}
            onChange={this.changeKey.bind(this, 'instagramUsername').bind(this)}/>
          <SimpleTextInput
            label={"Instagram Password"}
            value={this.props.settings.instagramPassword}
            isEnabled={true}
            isPassword={true}
            onChange={this.changeKey.bind(this, 'instagramPassword').bind(this)}/>
        </div>
      </ControlGroup>
    )
  }

  nop() {}

  paste(fn: Function) {
    (navigator as any).clipboard.readText().then((pastedText: string) => {
      fn(pastedText);
    });
  }

  update(fn: (keys: any) => void) {
    this.props.onUpdateSettings(this.props.settings, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }
}