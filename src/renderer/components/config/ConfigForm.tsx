import * as React from "react";
import * as fs from "fs";
import uuidv4 from "uuid/v4";
import wretch from "wretch";
import {OAuth} from 'oauth';
import {remote} from "electron";
import http from "http";

import Config, {CacheSettings, RemoteSettings, SceneSettings} from "../../Config";
import Scene from "../../Scene";
import APIGroup from "./APIGroup";
import CacheGroup from "./CacheGroup";
import EffectGroup from "../sceneDetail/EffectGroup";
import ImageGroup from "../sceneDetail/ImageGroup";
import TextGroup from "../sceneDetail/TextGroup";
import TimingGroup from "../sceneDetail/TimingGroup";
import Modal from "../ui/Modal";
import BackupGroup from "./BackupGroup";

export default class ConfigForm extends React.Component {
  readonly props: {
    config: Config,
    scenes: Array<Scene>,
    goBack(): void,
    updateConfig(config: Config): void,
    onDefault(): void,
    onBackup(): void,
    onRestore(backupFile: string): void,
    onClean(): void,
    onClearReddit(): void,
    onClearTumblr(): void,
  };

  readonly state = {
    modalTitle: "",
    modalMessages: new Array<string>(),
    modalFunction: Function(),
    config: JSON.parse(JSON.stringify(this.props.config)), // Make a copy
  };

  render() {
    return (
      <div className="Config">
        <div className="u-button-row">
          <div className="u-abs-center">
            <h2 className="Config__ConfigHeader">Config</h2>
          </div>
          <div className="u-button-row-right">
            <div className="Config__Apply u-button u-clickable"
                 onClick={this.applyConfig.bind(this)}>
              Apply
            </div>
            <div className="Config__OK u-button u-clickable"
                 onClick={this.onOK.bind(this)}>
              OK
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
          <div className="DefaultButton u-destructive u-button u-clickable"
               onClick={this.props.onDefault.bind(this)}>
            Reset to Defaults
          </div>
        </div>

        <div className="Config__Content ControlGroupGroup">
          <TimingGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <EffectGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}
            allScenes={this.props.scenes}/>

          <ImageGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <TextGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <CacheGroup
            config={this.state.config}
            onUpdateSettings={this.onUpdateCachingSettings.bind(this)}/>

          <APIGroup
            settings={this.state.config.remoteSettings}
            activateTumblr={this.showActivateTumblrNotice.bind(this)}
            clearTumblr={this.props.onClearTumblr.bind(this)}
            activateReddit={this.showActivateRedditNotice.bind(this)}
            clearReddit={this.props.onClearReddit.bind(this)}
            onUpdateSettings={this.onUpdateRemoteSettings.bind(this)}/>

          <BackupGroup
            backup={this.props.onBackup.bind(this)}
            restore={this.props.onRestore.bind(this)}
            clean={this.props.onClean.bind(this)} />
        </div>

        {this.state.modalMessages.length > 0 && (
          <Modal onClose={this.closeModal.bind(this)} title={this.state.modalTitle}>
            {this.state.modalMessages.map((m) =>
              <p key={(m as any) as number}>{m}</p>
            )}
            <div className="u-button u-float-right" onClick={this.state.modalFunction.bind(this)}>
              Ok
            </div>
          </Modal>
        )}
      </div>
    )
  }

  componentWillReceiveProps(props: any) {
    if (props.config != this.state.config) {
      this.setState({config: props.config});
    }
  }

  showActivateTumblrNotice() {
    const messages = Array<string>();
    messages.push("You are about to be directed to Tumblr.com to authorize FlipFlip. You should only have to do this once. You do not need to do this to use Tumblr sources.");
    messages.push("Tumblr has no Read-Only mode, so read AND write access are requested.");
    messages.push("FlipFlip does not store any user information or make any changes to your account.");
    this.setState({modalTitle: "Authorize FlipFlip on Tumblr", modalMessages: messages, modalFunction: this.activateTumblr });
  }

  showActivateRedditNotice() {
    const messages = Array<string>();
    messages.push("You are about to be directed to Reddit.com to authorize FlipFlip. You should only have to do this once.");
    messages.push("This is used for finding images on subreddits and user accounts as well as importing your subscriptions.");
    messages.push("FlipFlip does not store any user information or make any changes to your account.");
    this.setState({modalTitle: "Authorize FlipFlip on Reddit", modalMessages: messages, modalFunction: this.activateReddit });
  }

  closeModal() {
    this.setState({modalTitle: "", modalMessages: Array<string>(), modalFunction: null});
  }

  // This should only validate data REQUIRED for FlipFlip to work
  validate(): Array<string> {
    let errorMessages = Array<string>();
    // Validate any data:
    if (isNaN(parseInt(this.state.config.caching.maxSize))) {
      errorMessages.push("Invalid Cache Size");
    }
    if (this.state.config.caching.directory != "" &&
      !fs.existsSync(this.state.config.caching.directory)) {
      errorMessages.push("Invalid Cache Directory");
    }
    return errorMessages;
  }

  onOK() {
    if (this.applyConfig()) this.props.goBack();
  }

  applyConfig(): boolean {
    const errorMessages = this.validate();
    if (errorMessages.length == 0) {
      this.props.updateConfig(this.state.config);
      return true;
    } else {
      this.setState({modalTitle: "Error", modalMessages: errorMessages, modalFunction: this.closeModal});
      return false;
    }
  }

  onUpdateDefaultScene(settings: SceneSettings, fn: (settings: SceneSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.defaultScene);
    this.setState({config: newConfig});
  }

  onUpdateCachingSettings(settings: CacheSettings, fn: (settings: CacheSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.caching);
    this.setState({config: newConfig});
  }

  onUpdateRemoteSettings(keys: RemoteSettings, fn: (keys: RemoteSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.remoteSettings);
    this.setState({config: newConfig});
  }

  activateTumblr() {
    this.closeModal();

    // Tumblr endpoints
    const authorizeUrl = 'https://www.tumblr.com/oauth/authorize';
    const requestTokenUrl = 'https://www.tumblr.com/oauth/request_token';
    const accessTokenUrl = 'https://www.tumblr.com/oauth/access_token';

    const oauth = new OAuth(
      requestTokenUrl,
      accessTokenUrl,
      this.props.config.remoteSettings.tumblrKey,
      this.props.config.remoteSettings.tumblrSecret,
      '1.0A',
      'http://localhost:65010',
      'HMAC-SHA1'
    );

    let sharedSecret = "";

    oauth.getOAuthRequestToken((err: string, token: string, secret: string) => {
      if (err) {
        console.error("Failed with error" + err);
        const newMessages = Array<string>();
        newMessages.push("Error: " + err);
        this.setState({modalTitle: "Failed", modalMessages: newMessages, modalFunction: this.closeModal});
        return;
      }

      sharedSecret = secret;
      remote.shell.openExternal(authorizeUrl + '?oauth_token=' + token);
    });

    // Start a server to listen for Tumblr OAuth response
    http.createServer((req, res) => {
      // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
      const html = "<html><body><h1>Please return to FlipFlip</h1></body></html>";
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write(html);

      if (!req.url.endsWith("favicon.ico")) {
        if (req.url.includes("oauth_token") && req.url.includes("oauth_verifier")) {
          const args = req.url.replace("\/?", "").split("&");
          const oauthToken = args[0].substring(12);
          const oauthVerifier = args[1].substring(15);

          oauth.getOAuthAccessToken(
            oauthToken,
            sharedSecret,
            oauthVerifier,
            (err: string, token: string, secret: string) => {
              if (err) {
                console.error("Validation failed with error", err);
                const newMessages = Array<string>();
                newMessages.push("Error: " + err);
                this.setState({modalTitle: "Failed", modalMessages: newMessages, modalFunction: this.closeModal});
                return;
              }

              // Use prop here and not state, we strictly want to update oauthToken and oauthVerifier
              const config = this.props.config;
              config.remoteSettings.tumblrOAuthToken = token;
              config.remoteSettings.tumblrOAuthTokenSecret = secret;
              this.props.updateConfig(config);

              // Also update state (so our config doesn't get overridden if other changes are saved)
              const newConfig = this.state.config;
              newConfig.remoteSettings.tumblrOAuthToken = token;
              newConfig.remoteSettings.tumblrOAuthTokenSecret = secret;
              const newMessages = Array<string>();
              newMessages.push("Tumblr is now activated.");
              this.setState({
                config: newConfig,
                modalTitle: "Success!",
                modalMessages: newMessages,
                modalFunction: this.closeModal
              });

              // This closes the server
              req.connection.destroy();
            }
          );
        } else {
          const newMessages = Array<string>();
          newMessages.push("Error: Access Denied");
          this.setState({modalTitle: "Failed", modalMessages: newMessages, modalFunction: this.closeModal});
        }
      }
      res.end();
    }).listen(65010);
  }

  activateReddit() {
    this.closeModal();
    const clientID = this.props.config.remoteSettings.redditClientID;
    const userAgent = this.props.config.remoteSettings.redditUserAgent;

    let deviceID = this.props.config.remoteSettings.redditDeviceID;
    if (deviceID == "") {
      deviceID = uuidv4();
    }

    // Make initial request and open authorization form in browser
    wretch("https://www.reddit.com/api/v1/authorize?client_id=" + clientID + "&response_type=code&state=" + deviceID +
      "&redirect_uri=http://localhost:65010&duration=permanent&scope=read,mysubreddits,history")
      .post()
      .res(res => {
        remote.shell.openExternal(res.url);
      });

    // Start a server to listen for Reddit OAuth response
    http.createServer((req, res) => {
      // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
      const html = "<html><body><h1>Please return to FlipFlip</h1></body></html>";
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write(html);

      if (!req.url.endsWith("favicon.ico")) {
        if (req.url.includes("state") && req.url.includes("code")) {
          const args = req.url.replace("\/?", "").split("&");
          // This should be the same as the deviceID
          const state = args[0].substring(6);
          if (state == deviceID) {
            // This is what we use to get our token
            const code = args[1].substring(5);
            wretch("https://www.reddit.com/api/v1/access_token")
              .headers({"User-Agent": userAgent, "Authorization": "Basic " + btoa(clientID + ":")})
              .formData({grant_type: "authorization_code", code: code, redirect_uri: "http://localhost:65010"})
              .post()
              .json(json => {
                // Use prop here and not state, we strictly want to update refreshToken and deviceID
                const config = this.props.config;
                config.remoteSettings.redditDeviceID = deviceID;
                config.remoteSettings.redditRefreshToken = json.refresh_token;
                this.props.updateConfig(config);

                // Also update state (so our config doesn't get overridden if other changes are saved)
                const newConfig = this.state.config;
                newConfig.remoteSettings.redditDeviceID = deviceID;
                newConfig.remoteSettings.redditRefreshToken = json.refresh_token;
                const newMessages = Array<string>();
                newMessages.push("Reddit is now activated.");
                this.setState({
                  config: newConfig,
                  modalTitle: "Success!",
                  modalMessages: newMessages,
                  modalFunction: this.closeModal,
                });

                // This closes the server
                req.connection.destroy();
              });
          }
        } else if (req.url.includes("state") && req.url.includes("error")) {
          const args = req.url.replace("\/?", "").split("&");
          // This should be the same as the deviceID
          const state = args[0].substring(6);
          if (state == deviceID) {
            const error = args[1].substring(6);
            const newMessages = Array<string>();
            newMessages.push("Error: " + error);
            this.setState({modalTitle: "Failed", modalMessages: newMessages, modalFunction: this.closeModal});
          }
        }
      }
      res.end();
    }).listen(65010);
  }
}