import * as React from 'react';

import {RemoteSettings} from "../../data/Config";
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
    activateTwitter(): void,
    clearTwitter(): void,
    checkInstagram(): void,
    onUpdateSettings(keys: RemoteSettings, fn: (keys: RemoteSettings) => void): void,
  };

  render() {
    const tumblrAuthorized = this.props.settings.tumblrOAuthToken != "" && this.props.settings.tumblrOAuthTokenSecret != "";
    const redditAuthorized = this.props.settings.redditRefreshToken != "";
    const twitterAuthorized = this.props.settings.twitterAccessTokenKey != "" && this.props.settings.twitterAccessTokenSecret != "";
    const instagramConfigured = this.props.settings.instagramUsername != "" && this.props.settings.instagramPassword != "";
    const indexOf = this.props.settings.tumblrKeys.indexOf(this.props.settings.tumblrKey);
    return (
      <ControlGroup title="API Keys" isNarrow={true}>
        <div className="ControlSubgroup" style={{display: 'block'}}>
          <div>
            <button onClick={!tumblrAuthorized ? this.props.activateTumblr.bind(this) : this.nop}
                    className={`u-button ${!tumblrAuthorized ? 'u-clickable' : 'u-disabled'}`}>Authorize FlipFlip on Tumblr</button>
            {" "}
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
            </SimpleTextInput>
            <SimpleTextInput
              isEnabled={!tumblrAuthorized}
              label="Tumblr OAuth Consumer Secret"
              value={this.props.settings.tumblrSecret}
              onChange={this.changeKey.bind(this, 'tumblrSecret').bind(this)}>
            </SimpleTextInput>
            {tumblrAuthorized && indexOf !== -1 && (
              <div>
                <p>Using Tumblr API Key {indexOf + 1}</p>
                <button onClick={tumblrAuthorized ? this.props.nextTumblr.bind(this) : this.nop}
                        className={`u-button ${tumblrAuthorized ? 'u-clickable' : 'u-disabled'}`}>Try Next Tumblr Token</button>
              </div>
            )}
          </div>
        </div>
        <hr/>
        <div className="ControlSubgroup">
          <div>
            <button onClick={!redditAuthorized ? this.props.activateReddit.bind(this) : this.nop}
                    className={`u-button ${!redditAuthorized ? 'u-clickable' : 'u-disabled'}`}>Authorize FlipFlip on Reddit</button>
            {" "}
            <button onClick={redditAuthorized ? this.props.clearReddit.bind(this) : this.nop}
                    className={`u-button ${redditAuthorized ? 'u-clickable' : 'u-disabled'}`}>Clear Reddit Token</button>
          </div>
        </div>
        <hr/>
        <div className="ControlSubgroup">
          <div>
            <button onClick={!twitterAuthorized ? this.props.activateTwitter.bind(this) : this.nop}
                    className={`u-button ${!twitterAuthorized ? 'u-clickable' : 'u-disabled'}`}>Authorize FlipFlip on Twitter</button>
            {" "}
            <button onClick={twitterAuthorized ? this.props.clearTwitter.bind(this) : this.nop}
                    className={`u-button ${twitterAuthorized ? 'u-clickable' : 'u-disabled'}`}>Clear Twitter Token</button>
          </div>
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
          <button onClick={instagramConfigured ? this.props.checkInstagram.bind(this) : this.nop}
                  className={`u-button ${instagramConfigured ? 'u-clickable' : 'u-disabled'}`}>Check Instagram Login</button>
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