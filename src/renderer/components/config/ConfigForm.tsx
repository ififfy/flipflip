import * as React from "react";
import * as fs from "fs";
import uuidv4 from "uuid/v4";
import wretch from "wretch";
import {OAuth} from 'oauth';
import {remote} from "electron";
import {IgApiClient, IgCheckpointError, IgLoginTwoFactorRequiredError} from "instagram-private-api";
import http from "http";

import Config, {CacheSettings, DisplaySettings, RemoteSettings, SceneSettings} from "../../data/Config";
import {getRandomIndex} from "../../data/utils";
import Scene from "../../data/Scene";
import APIGroup from "./APIGroup";
import CacheGroup from "./CacheGroup";
import BackupGroup from "./BackupGroup";
import DisplayGroup from "./DisplayGroup";
import ImageEffectGroup from "../sceneDetail/ImageEffectGroup";
import SceneEffectGroup from "../sceneDetail/SceneEffectGroup";
import ImageGroup from "../sceneDetail/ImageGroup";
import TextGroup from "../sceneDetail/TextGroup";
import StrobeGroup from "../sceneDetail/StrobeGroup";
import ZoomMoveGroup from "../sceneDetail/ZoomMoveGroup";
import VideoGroup from "../sceneDetail/VideoGroup";
import SimpleTextInput from "../ui/SimpleTextInput";
import Modal from "../ui/Modal";
import AudioGroup from "../sceneDetail/AudioGroup";

export default class ConfigForm extends React.Component {
  readonly props: {
    config: Config,
    scenes: Array<Scene>,
    goBack(): void,
    updateConfig(config: Config): void,
    onDefault(): void,
    onBackup(alert: boolean): boolean,
    onRestore(backupFile: string): void,
    onClean(): void,
  };

  readonly state = {
    config: JSON.parse(JSON.stringify(this.props.config)), // Make a copy
    modalTitle: "",
    modalMessages: new Array<string>(),
    modalFunction: Function(),
    instagramModal: false,
    instagramInput: "",
    changeMade: false,
  };

  render() {
    return (
      <div className="Config">
        <div className="u-button-row">
          <div className="u-abs-center">
            <h2 className="Config__ConfigHeader">Preferences</h2>
          </div>
          <div className="u-button-row-right">
            <div className="Config__DefaultButton u-destructive u-button u-clickable"
                 onClick={this.props.onDefault.bind(this)}>
              Reset to Defaults
            </div>
            <div className="Config__Apply u-button u-clickable"
                 onClick={this.applyConfig.bind(this)}>
              Apply
            </div>
            <div className="Config__OK u-button u-clickable"
                 onClick={this.onOK.bind(this)}>
              OK
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.goBack.bind(this)}>Back</div>
        </div>

        <div className="Config__Content ControlGroupGroup">
          <SceneEffectGroup
            scene={this.state.config.defaultScene}
            showAll={true}
            allScenes={this.props.scenes}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)} />

          <ImageEffectGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)} />

          <ZoomMoveGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)} />

          <StrobeGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)} />

          <ImageGroup
            scene={this.state.config.defaultScene}
            isPlayer={false}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <AudioGroup
            scene={this.state.config.defaultScene}
            isPlayer={false}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <VideoGroup
            scene={this.state.config.defaultScene}
            isPlayer={false}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <TextGroup
            scene={this.state.config.defaultScene}
            onUpdateScene={this.onUpdateDefaultScene.bind(this)}/>

          <DisplayGroup
            settings={this.state.config.displaySettings}
            onUpdateSettings={this.onUpdateDisplaySettings.bind(this)}/>

          <CacheGroup
            config={this.state.config}
            onUpdateSettings={this.onUpdateCachingSettings.bind(this)}/>

          <APIGroup
            settings={this.state.config.remoteSettings}
            activateTumblr={this.showActivateTumblrNotice.bind(this)}
            nextTumblr={this.activateTumblr.bind(this)}
            clearTumblr={this.clearTumblr.bind(this)}
            activateReddit={this.showActivateRedditNotice.bind(this)}
            clearReddit={this.clearReddit.bind(this)}
            activateTwitter={this.showActivateTwitterNotice.bind(this)}
            clearTwitter={this.clearTwitter.bind(this)}
            checkInstagram={this.checkInstagram.bind(this)}
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
            {this.state.instagramModal && (
              <SimpleTextInput
                label=""
                value={this.state.instagramInput}
                isEnabled={true}
                onChange={this.onChangeInstagramInput.bind(this)} />
            )}
            <div className="u-button u-float-right" onClick={this.state.modalFunction.bind(this)}>
              Ok
            </div>
          </Modal>
        )}
      </div>
    )
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.config !== props.config) {
      this.setState({config: JSON.parse(JSON.stringify(this.props.config))});
    }
  }

  goBack() {
    if (this.state.changeMade) {
      alert("Be sure to press OK if you want to save your changes");
      this.setState({changeMade: false});
    } else {
      this.props.goBack();
    }
  }

  onChangeInstagramInput(input: string) {
    this.setState({instagramInput: input});
  }

  showActivateTumblrNotice() {
    const messages = Array<string>();
    messages.push("You are about to be directed to Tumblr.com to authorize FlipFlip. You should only have to do this once.");
    messages.push("FlipFlip provides a few public keys for use, but we recommend registering your own app at https://www.tumblr.com/oauth/apps and using your own keys. Refer to the FlipFlip documentation for more complete instructions.");
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

  showActivateTwitterNotice() {
    const messages = Array<string>();
    messages.push("You are about to be directed to Twitter.com to authorize FlipFlip. You should only have to do this once.");
    messages.push("This is used for finding images on user profiles and for importing your following.");
    messages.push("FlipFlip does not store any user information or make any changes to your account.");
    this.setState({modalTitle: "Authorize FlipFlip on Twitter", modalMessages: messages, modalFunction: this.activateTwitter });
  }

  clearTumblr() {
    const newConfig = this.state.config;
    const newPropsConfig = this.props.config;
    newConfig.remoteSettings.tumblrKey = "";
    newPropsConfig.remoteSettings.tumblrKey = "";
    newConfig.remoteSettings.tumblrSecret = "";
    newPropsConfig.remoteSettings.tumblrSecret = "";
    newConfig.remoteSettings.tumblrOAuthToken = "";
    newPropsConfig.remoteSettings.tumblrOAuthToken = "";
    newConfig.remoteSettings.tumblrOAuthTokenSecret = "";
    newPropsConfig.remoteSettings.tumblrOAuthTokenSecret = "";
    this.setState({config: newConfig});
    this.props.updateConfig(newPropsConfig);
  }

  clearReddit() {
    const newConfig = this.state.config;
    const newPropsConfig = this.props.config;
    newConfig.remoteSettings.redditRefreshToken = "";
    newPropsConfig.remoteSettings.redditRefreshToken = "";
    this.setState({config: newConfig});
    this.props.updateConfig(newPropsConfig);
  }

  clearTwitter() {
    const newConfig = this.state.config;
    const newPropsConfig = this.props.config;
    newConfig.remoteSettings.twitterAccessTokenKey = "";
    newPropsConfig.remoteSettings.twitterAccessTokenKey = "";
    newConfig.remoteSettings.twitterAccessTokenSecret = "";
    newPropsConfig.remoteSettings.twitterAccessTokenSecret = "";
    this.setState({config: newConfig});
    this.props.updateConfig(newPropsConfig);
  }

  closeModal() {
    this.setState({modalTitle: "", instagramModal: false, modalMessages: Array<string>(), modalFunction: null});
  }

  // This should only validate data REQUIRED for FlipFlip to work
  validate(): Array<string> {
    let errorMessages = Array<string>();
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
    this.setState({config: newConfig, changeMade: true});
  }

  onUpdateDisplaySettings(keys: DisplaySettings, fn: (keys: DisplaySettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.displaySettings);
    this.setState({config: newConfig, changeMade: true});
  }

  onUpdateCachingSettings(settings: CacheSettings, fn: (settings: CacheSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.caching);
    this.setState({config: newConfig, changeMade: true});
  }

  onUpdateRemoteSettings(keys: RemoteSettings, fn: (keys: RemoteSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.remoteSettings);
    this.setState({config: newConfig, changeMade: true});
  }

  _ig: IgApiClient = null;
  checkInstagram() {
    this._ig = new IgApiClient();
    this._ig.state.generateDevice(this.state.config.remoteSettings.instagramUsername);
    this._ig.account.login(this.state.config.remoteSettings.instagramUsername, this.state.config.remoteSettings.instagramPassword).then((loggedInUser) => {
      const newMessages = Array<string>();
      newMessages.push("Login to Instagram successful, you should be able to use these sources.");
      this.setState({modalTitle: "Success!", modalMessages: newMessages, modalFunction: this.closeModal});
      this._ig = null;
    }).catch((e) => {
      if (e instanceof IgLoginTwoFactorRequiredError) {
        const newMessages = Array<string>();
        newMessages.push("Enter your two-factor authentication code to confirm login:");
        this.setState({modalTitle: "Instagram 2FA", instagramModal: true, modalMessages: newMessages, modalFunction: this.tfaInstagram.bind(this, e.response.body.two_factor_info.two_factor_identifier)});
      } else if (e instanceof IgCheckpointError) {
        this._ig.challenge.auto(true).then(() => {
          const newMessages = Array<string>();
          newMessages.push("Please verify your account to continue: (check your email)");
          this.setState({modalTitle: "Checkpoint", instagramModal: true, modalMessages: newMessages, modalFunction: this.checkpointInstagram.bind(this)});
        });
      } else {
        alert(e);
        console.error(e);
        this._ig = null;
      }
    });
  }

  tfaInstagram(tfaIdentifier: any) {
    this.closeModal();
    this._ig.account.twoFactorLogin({
      twoFactorIdentifier: tfaIdentifier,
      verificationMethod: '1',
      trustThisDevice: '1',
      username: this.state.config.remoteSettings.instagramUsername,
      verificationCode: this.state.instagramInput,
    }).then(() => {
      const newMessages = Array<string>();
      newMessages.push("Login to Instagram successful, you should be able to use these sources.");
      this.setState({modalTitle: "Success!", instagramInput: "", modalMessages: newMessages, modalFunction: this.closeModal});
      this._ig = null;
    }).catch((e) => {
      alert(e);
      console.error(e);
      this._ig = null;
    });
  }

  checkpointInstagram() {
    this.closeModal();
    this._ig.challenge.sendSecurityCode(this.state.instagramInput).then(() => {
      const newMessages = Array<string>();
      newMessages.push("Login to Instagram successful, you should be able to use these sources.");
      this.setState({modalTitle: "Success!", instagramInput: "", modalMessages: newMessages, modalFunction: this.closeModal});
      this._ig = null;
    }).catch((e) => {
      alert(e);
      console.error(e);
      this._ig = null;
    });
  }

  activateTumblr() {
    this.closeModal();

    // Tumblr endpoints
    const authorizeUrl = 'https://www.tumblr.com/oauth/authorize';
    const requestTokenUrl = 'https://www.tumblr.com/oauth/request_token';
    const accessTokenUrl = 'https://www.tumblr.com/oauth/access_token';

    // Default to user's own key
    let tumblrKey = this.props.config.remoteSettings.tumblrKey;
    let tumblrSecret = this.props.config.remoteSettings.tumblrSecret;
    const indexOfKey = this.props.config.remoteSettings.tumblrKeys.indexOf(tumblrKey);
    const indexOfSecret = this.props.config.remoteSettings.tumblrSecrets.indexOf(tumblrSecret);
    if (tumblrKey == "" || tumblrSecret == "") {
      // If user has no key, pick random one
      let randomIndex = getRandomIndex(this.props.config.remoteSettings.tumblrKeys);
      tumblrKey = this.props.config.remoteSettings.tumblrKeys[randomIndex];
      tumblrSecret = this.props.config.remoteSettings.tumblrSecrets[randomIndex];
    } else if (indexOfKey == indexOfSecret && indexOfKey != -1) {
      // Else if user has one of our keys, move to the next one
      let newIndex = indexOfKey + 1;
      if (newIndex == this.props.config.remoteSettings.tumblrKeys.length) {
        newIndex = 0;
      }
      tumblrKey = this.props.config.remoteSettings.tumblrKeys[newIndex];
      tumblrSecret = this.props.config.remoteSettings.tumblrSecrets[newIndex];
    }

    const oauth = new OAuth(
      requestTokenUrl,
      accessTokenUrl,
      tumblrKey,
      tumblrSecret,
      '1.0A',
      'http://localhost:65010',
      'HMAC-SHA1'
    );

    let sharedSecret = "";

    oauth.getOAuthRequestToken((err: {statusCode: number, data: string}, token: string, secret: string) => {
      if (err) {
        console.error(err.statusCode + " - " + err.data);
        const newMessages = Array<string>();
        newMessages.push("Error: " + err.statusCode + " - " + err.data);
        this.setState({modalTitle: "Failed", modalMessages: newMessages, modalFunction: this.closeModal});
        return;
      }

      sharedSecret = secret;
      remote.shell.openExternal(authorizeUrl + '?oauth_token=' + token);
    });

    // Start a server to listen for Tumblr OAuth response
    const server = http.createServer((req, res) => {
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
              config.remoteSettings.tumblrKey = tumblrKey;
              config.remoteSettings.tumblrSecret = tumblrSecret;
              config.remoteSettings.tumblrOAuthToken = token;
              config.remoteSettings.tumblrOAuthTokenSecret = secret;
              this.props.updateConfig(config);

              // Also update state (so our config doesn't get overridden if other changes are saved)
              const newConfig = this.state.config;
              newConfig.remoteSettings.tumblrKey = tumblrKey;
              newConfig.remoteSettings.tumblrSecret = tumblrSecret;
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
              remote.getCurrentWindow().show();

              // This closes the server
              server.close();
              req.connection.destroy();
            }
          );
        } else {
          const newMessages = Array<string>();
          newMessages.push("Error: Access Denied");
          this.setState({modalTitle: "Failed", modalMessages: newMessages, modalFunction: this.closeModal});

          // This closes the server
          server.close();
          req.connection.destroy();
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
    const server = http.createServer((req, res) => {
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
                remote.getCurrentWindow().show();

                // This closes the server
                server.close();
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

          // This closes the server
          server.close();
          req.connection.destroy();
        }
      }
      res.end();
    }).listen(65010);
  }

  activateTwitter() {
    this.closeModal();
    // Twitter endpoints
    const authorizeUrl = 'https://api.twitter.com/oauth/authorize';
    const requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    const accessTokenUrl = 'https://api.twitter.com/oauth/access_token';

    // Default to user's own key
    const consumerKey = this.props.config.remoteSettings.twitterConsumerKey;
    const consumerSecret = this.props.config.remoteSettings.twitterConsumerSecret;

    const oauth = new OAuth(
      requestTokenUrl,
      accessTokenUrl,
      consumerKey,
      consumerSecret,
      '1.0A',
      'http://localhost:65010',
      'HMAC-SHA1'
    );

    let sharedSecret = "";

    oauth.getOAuthRequestToken((err: {statusCode: number, data: string}, token: string, secret: string) => {
      if (err) {
        console.error(err.statusCode + " - " + err.data);
        const newMessages = Array<string>();
        newMessages.push("Error: " + err.statusCode + " - " + err.data);
        this.setState({modalTitle: "Failed", modalMessages: newMessages, modalFunction: this.closeModal});
        return;
      }

      sharedSecret = secret;
      remote.shell.openExternal(authorizeUrl + '?oauth_token=' + token);
    });

    // Start a server to listen for Twitter OAuth response
    const server = http.createServer((req, res) => {
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
              config.remoteSettings.twitterAccessTokenKey = token;
              config.remoteSettings.twitterAccessTokenSecret = secret;
              this.props.updateConfig(config);

              // Also update state (so our config doesn't get overridden if other changes are saved)
              const newConfig = this.state.config;
              newConfig.remoteSettings.twitterAccessTokenKey = token;
              newConfig.remoteSettings.twitterAccessTokenSecret = secret;
              const newMessages = Array<string>();
              newMessages.push("Twitter is now activated.");
              this.setState({
                config: newConfig,
                modalTitle: "Success!",
                modalMessages: newMessages,
                modalFunction: this.closeModal
              });
              remote.getCurrentWindow().show();

              // This closes the server
              server.close();
              req.connection.destroy();
            }
          );
        } else {
          const newMessages = Array<string>();
          newMessages.push("Error: Access Denied");
          this.setState({modalTitle: "Failed", modalMessages: newMessages, modalFunction: this.closeModal});

          // This closes the server
          server.close();
          req.connection.destroy();
        }
      }
      res.end();
    }).listen(65010);
  }
}