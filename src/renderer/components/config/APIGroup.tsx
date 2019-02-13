import * as React from 'react';
import {remote} from "electron";
import http from "http";
import uuidv4 from "uuid/v4";
import wretch from "wretch";

import {RemoteSettings} from "../../Config";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleTextInput from "../ui/SimpleTextInput";

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
            onChange={this.changeKey.bind(this, 'tumblrDefault').bind(this)}>
            {" "}
            <button onClick={this.paste.bind(this, this.changeKey.bind(this, 'tumblrDefault').bind(this))}>Paste</button>
          </SimpleTextInput>
          <SimpleTextInput
            isEnabled={true}
            label="Overlay Tumblr API Key"
            value={this.props.settings.tumblrOverlay}
            onChange={this.changeKey.bind(this, 'tumblrOverlay').bind(this)}>
            {" "}
            <button onClick={this.paste.bind(this, this.changeKey.bind(this, 'tumblrOverlay').bind(this))}>Paste</button>
          </SimpleTextInput>
        </div>
        <hr/>
        <div className="ControlSubgroup">
          <button onClick={this.props.settings.redditRefreshToken == "" ? this.activateReddit.bind(this) : this.nop}
                  className={`u-button ${this.props.settings.redditRefreshToken == "" ? 'u-clickable' : 'u-disabled'}`}>Authorize FlipFlip on Reddit</button>
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

  activateReddit() {
    const clientID = this.props.settings.redditClientID;
    const redirectURI = this.props.settings.redditRedirectURI;
    const userAgent = this.props.settings.redditUserAgent;

    let deviceID = this.props.settings.redditDeviceID;
    if (deviceID == "") {
      deviceID = uuidv4();
      this.changeKey('redditDeviceID', deviceID);
    }

    // Make initial request and open authorization form in browser
    wretch("https://www.reddit.com/api/v1/authorize?client_id=" + clientID + "&response_type=code&state=" + deviceID +
      "&redirect_uri=" + redirectURI + "&duration=permanent&scope=read")
      .post()
      .res(res => {
        remote.shell.openExternal(res.url);
      });

    // Start a server to listen for Reddit OAuth response
    http.createServer((req, res) => {
      // TODO handle access_denied
      // TODO Make sure window gets focus back
      if (req.url.includes("state") && req.url.includes("code")) {
        const args = req.url.replace("\/?", "").split("&");
        // This should be the same as the deviceID
        const state = args[0].substring(6);
        if (state == deviceID) {
          // This is what we use to get our token
          const code = args[1].substring(5);
          wretch("https://www.reddit.com/api/v1/access_token")
            .headers({"User-Agent": userAgent, "Authorization": "Basic " + btoa(clientID + ":")})
            .formData({grant_type: "authorization_code", code: code, redirect_uri: redirectURI})
            .post()
            .json(json => {
              // TODO Show message prompting user to hit OK (or otherwise token won't be saved)
              this.changeKey('redditRefreshToken', json.refresh_token);
            })
        }
      }
      res.end();
      // This will close the server
      req.connection.destroy();
    }).listen(65010);
  }
}