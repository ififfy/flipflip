import * as React from "react";
import clsx from "clsx";
import {remote} from "electron";
import {OAuth} from "oauth";
import http from "http";
import uuidv4 from "uuid/v4";
import wretch from "wretch";
import {IgApiClient, IgCheckpointError, IgLoginTwoFactorRequiredError} from "instagram-private-api";

import {
  Avatar, Button, Collapse, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Fab, FormControlLabel, Grid, Link, Radio, RadioGroup, Slide, Snackbar, SnackbarContent, TextField, Theme,
  Tooltip, Typography, withStyles
} from "@material-ui/core";

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import Config, {RemoteSettings} from "../../data/Config";
import {IG, MO, ST, TT} from "../../data/const";
import en from "../../data/en";
import SourceIcon from "../library/SourceIcon";

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  fab: {
    boxShadow: 'none',
  },
  authorized: {
    backgroundColor: theme.palette.primary.main,
  },
  noAuth: {
    backgroundColor: theme.palette.error.main,
  },
  icon: {
    color: theme.palette.primary.contrastText,
  },
  iconAvatar: {
    float: 'right',
    backgroundColor: theme.palette.primary.light,
  },
  title: {
    paddingBottom: theme.spacing(1),
  },
  tumblrFields: {
    paddingTop: theme.spacing(2),
  },
  snackbarIcon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  snackbarMessage: {
    display: 'flex',
    alignItems: 'center',
  },
});

class APICard extends React.Component {
  readonly props: {
    classes: any,
    settings: RemoteSettings,
    onUpdateSettings(fn: (settings: RemoteSettings) => void): void,
    onUpdateConfig(fn: (config: Config) => void): void,
  };

  readonly state = {
    openMenu: null as string,
    menuType: null as string,
    successSnack: null as string,
    errorSnack: null as string,
    server: null as any,
    instagramMode: null as string,
    input1: "",
    input2: "",
    input3: "",
  };

  render() {
    const classes = this.props.classes;
    const tumblrAuthorized = this.props.settings.tumblrOAuthToken != "" && this.props.settings.tumblrOAuthTokenSecret != "";
    const redditAuthorized = this.props.settings.redditRefreshToken != "";
    const twitterAuthorized = this.props.settings.twitterAccessTokenKey != "" && this.props.settings.twitterAccessTokenSecret != "";
    const instagramConfigured = this.props.settings.instagramUsername != "" && this.props.settings.instagramPassword != "";
    const indexOf = this.props.settings.tumblrKeys.indexOf(this.props.settings.tumblrKey);
    const menuType = this.state.menuType ? en.get(this.state.menuType)[0].toUpperCase() + en.get(this.state.menuType).slice(1) : "";
    let menuTypeSignOut = null;
    switch (this.state.menuType) {
      case ST.tumblr:
        menuTypeSignOut = this.onFinishClearTumblr.bind(this);
        break;
      case ST.reddit:
        menuTypeSignOut = this.onFinishClearReddit.bind(this);
        break;
      case ST.twitter:
        menuTypeSignOut = this.onFinishClearTwitter.bind(this);
        break;
      case ST.instagram:
        menuTypeSignOut = this.onFinishClearInstagram.bind(this);
        break;
    }
    return(
      <React.Fragment>
        <Typography align="center" className={classes.title}>API Sign In</Typography>

        <Grid container spacing={2} alignItems="center" justify="center">
          <Grid item>
            <Tooltip title={tumblrAuthorized ? "Authorized: Click to Sign Out of Tumblr" : "Unauthorized: Click to Authorize Tumblr"}  placement="top-end">
              <Fab
                className={clsx(classes.fab, tumblrAuthorized ? classes.authorized : classes.noAuth)}
                onClick={tumblrAuthorized ? this.onClearTumblr.bind(this) : this.onAuthTumblr.bind(this)}
                size="large">
                <SourceIcon className={classes.icon} type={ST.tumblr}/>
              </Fab>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={redditAuthorized ? "Authorized: Click to Sign Out of Reddit" : "Unauthorized: Click to Authorize Reddit"}  placement="top-end">
              <Fab
                className={clsx(classes.fab, redditAuthorized ? classes.authorized : classes.noAuth)}
                onClick={redditAuthorized ? this.onClearReddit.bind(this) : this.onAuthReddit.bind(this)}
                size="large">
                <SourceIcon className={classes.icon} type={ST.reddit}/>
              </Fab>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={twitterAuthorized ? "Authorized: Click to Sign Out of Twitter" : "Unauthorized: Click to Authorize Twitter"}  placement="top-end">
              <Fab
                className={clsx(classes.fab, twitterAuthorized ? classes.authorized : classes.noAuth)}
                onClick={twitterAuthorized ? this.onClearTwitter.bind(this) : this.onAuthTwitter.bind(this)}
                size="large">
                <SourceIcon className={classes.icon} type={ST.twitter}/>
              </Fab>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={instagramConfigured ? "Authorized: Click to Sign Out of Instagram" : "Unauthorized: Click to Authorize Instragram"}  placement="top-end">
              <Fab
                className={clsx(classes.fab, instagramConfigured ? classes.authorized : classes.noAuth)}
                onClick={instagramConfigured ? this.onClearInstagram.bind(this) : this.onAuthInstagram.bind(this)}
                size="large">
                <SourceIcon className={classes.icon} type={ST.instagram}/>
              </Fab>
            </Tooltip>
          </Grid>
        </Grid>

        <Dialog
          open={this.state.openMenu == MO.signOut}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="sign-out-title"
          aria-describedby="sign-out-description">
          <DialogTitle id="sign-out-title">
            {menuType} Sign Out
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={this.state.menuType}/>
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="sign-out-description">
              You are already authorized for {menuType}. Are you sure you want to sign out?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={menuTypeSignOut} color="primary">
              Sign Out
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.openMenu == MO.signIn && this.state.menuType == ST.tumblr}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="sign-in-title"
          aria-describedby="sign-in-description">
          <DialogTitle id="sign-in-title">
            Tumblr Sign In
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.tumblr}/>
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="sign-in-description">
              You are about to be directed to <Link href="#" onClick={this.openLink.bind(this, "https://www.tumblr.com")}>Tumblr.com</Link> to
              authorize FlipFlip. You should only have to do this once. Tumblr has no Read-Only mode, so read <i>and</i> write
              access are requested. FlipFlip does not store any user information or make any changes to your account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishAuthTumblr.bind(this)} color="primary">
              Authorize FlipFlip on Tumblr
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.openMenu == MO.new && this.state.menuType == ST.tumblr}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="tumblr-title"
          aria-describedby="tumblr-description">
          <DialogTitle id="tumblr-title">
            Tumblr API Key
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.tumblr}/>
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="tumblr-description">
              FlipFlip provides a few public keys for use, but we recommend registering and using your own
              on <Link href="#" onClick={this.openLink.bind(this, "https://www.tumblr.com/oauth/apps")}>Tumblr OAuth</Link>.
              Refer to the <Link href="#" onClick={this.openLink.bind(this, "https://ififfy.github.io/flipflip/#/tumblr_api")}>FlipFlip documentation</Link> for
              complete instructions.
            </DialogContentText>
            <div className={classes.root}>
              <div>
                <DialogContentText>
                  Choose a key:
                </DialogContentText>
                <RadioGroup
                  value={indexOf + 1}
                  onChange={this.onTumblrKeyInput.bind(this)}>
                  {[""].concat(Object.values(this.props.settings.tumblrKeys)).map((tk, i) =>
                    <FormControlLabel key={i} value={i} control={<Radio />} label={i == 0 ? "Use Your Key" : "Public Key " + i} />
                  )}
                </RadioGroup>
              </div>
              <div className={classes.tumblrFields}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Tumblr OAuth Consumer Key"
                  value={this.state.input1}
                  onChange={this.onInput1.bind(this)}/>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Tumblr OAuth Consumer Secret"
                  value={this.state.input2}
                  onChange={this.onInput2.bind(this)}/>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button
              disabled={this.state.input1.length != 50 || this.state.input2.length != 50}
              onClick={this.onContinueAuthTumblr.bind(this)} color="primary">
              Authorize FlipFlip on Tumblr
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.openMenu == MO.signIn && this.state.menuType == ST.reddit}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="sign-in-title"
          aria-describedby="sign-in-description">
          <DialogTitle id="sign-in-title">
            Reddit Sign In
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.reddit}/>
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="sign-in-description">
              You are about to be directed to <Link href="#" onClick={this.openLink.bind(this, "https://www.reddit.com")}>Reddit.com</Link> to
              authorize FlipFlip. You should only have to do this once. FlipFlip does not store any user information
              or make any changes to your account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishAuthReddit.bind(this)} color="primary">
              Authorize FlipFlip on Reddit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.openMenu == MO.signIn && this.state.menuType == ST.twitter}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="sign-in-title"
          aria-describedby="sign-in-description">
          <DialogTitle id="sign-in-title">
            Twitter Sign In
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.twitter}/>
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="sign-in-description">
              You are about to be directed to <Link href="#" onClick={this.openLink.bind(this, "https://www.twitter.com")}>Twitter.com</Link> to
              authorize FlipFlip. You should only have to do this once. FlipFlip does not store any user information
              or make any changes to your account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishAuthTwitter.bind(this)} color="primary">
              Authorize FlipFlip on Twitter
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.openMenu == MO.signIn && this.state.menuType == ST.instagram}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="instagram-title"
          aria-describedby="instagram-description">
          <DialogTitle id="instagram-title">
            Instagram Sign In
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.instagram}/>
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="instagram-description">
              FlipFlip does not store any user information or make changes to your account. Your login information is
              stored locally on your computer and is never shared with anyone or sent to any server (besides Instagram, obviously).
            </DialogContentText>
            <TextField
              fullWidth
              disabled={this.state.instagramMode != null}
              margin="dense"
              label="Instagram Username"
              value={this.state.input1}
              onChange={this.onInput1.bind(this)}/>
            <TextField
              fullWidth
              disabled={this.state.instagramMode != null}
              margin="dense"
              label="Instagram Password"
              type="password"
              value={this.state.input2}
              onChange={this.onInput2.bind(this)}/>
            <Collapse in={this.state.instagramMode == IG.tfa}>
              <DialogContentText id="instagram-description">
                Enter your two-factor authentication code to confirm login:
              </DialogContentText>
              <TextField
                fullWidth
                margin="dense"
                label="Instagram 2FA"
                value={this.state.input3}
                onChange={this.onInput3.bind(this)}/>
            </Collapse>
            <Collapse in={this.state.instagramMode == IG.checkpoint}>
              <DialogContentText id="instagram-description">
                Please verify your account to continue: (check your email)
              </DialogContentText>
              <TextField
                fullWidth
                margin="dense"
                label="Instagram Checkpoint"
                value={this.state.input3}
                onChange={this.onInput3.bind(this)}/>
            </Collapse>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            {this.state.instagramMode == IG.tfa && (
              <Button
                disabled={this.state.input3.length == 0}
                onClick={this.onTFAInstagram.bind(this)} color="primary">
                Authorize FlipFlip on Instagram
              </Button>
            )}
            {this.state.instagramMode == IG.checkpoint && (
              <Button
                disabled={this.state.input3.length == 0}
                onClick={this.onCheckpointInstagram.bind(this)} color="primary">
                Authorize FlipFlip on Instagram
              </Button>
            )}
            {this.state.instagramMode == null && (
              <Button
                disabled={this.state.input1.length == 0 || this.state.input2.length == 0}
                onClick={this.onFinishAuthInstagram.bind(this)} color="primary">
                Authorize FlipFlip on Instagram
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!this.state.successSnack}
          autoHideDuration={20000}
          onClose={this.onCloseSnack.bind(this)}
          TransitionComponent={(props) => <Slide {...props} direction="up"/>}>
          <SnackbarContent
            message={
              <span className={classes.snackbarMessage}>
                  <CheckCircleIcon color="inherit" className={classes.snackbarIcon}/>
                  {this.state.successSnack}
              </span>
            }
          />
        </Snackbar>

        <Snackbar
          open={!!this.state.errorSnack}
          autoHideDuration={20000}
          onClose={this.onCloseErrorSnack.bind(this)}
          TransitionComponent={(props) => <Slide {...props} direction="up"/>}>
          <SnackbarContent
            message={
              <span className={classes.snackbarMessage}>
                  <ErrorIcon color="error" className={classes.snackbarIcon}/>
                  Error: {this.state.errorSnack}
              </span>
            }
          />
        </Snackbar>
      </React.Fragment>
    );
  }

  onClearTumblr() {
    this.setState({openMenu: MO.signOut, menuType: ST.tumblr});
  }

  onFinishClearTumblr() {
    // Update props
    this.props.onUpdateConfig((c) => {
      c.remoteSettings.tumblrOAuthToken = "";
      c.remoteSettings.tumblrOAuthTokenSecret = "";
    });
    // Update state
    this.props.onUpdateSettings((s) => {
      s.tumblrOAuthToken = "";
      s.tumblrOAuthTokenSecret = "";
    });
    this.onCloseDialog();
  }

  onClearReddit() {
    this.setState({openMenu: MO.signOut, menuType: ST.reddit});
  }

  onFinishClearReddit() {
    // Update props
    this.props.onUpdateConfig((c) => {
      c.remoteSettings.redditRefreshToken = "";
    });
    // Update state
    this.props.onUpdateSettings((s) => {
      s.redditRefreshToken = "";
    });
    this.onCloseDialog();
  }

  onClearTwitter() {
    this.setState({openMenu: MO.signOut, menuType: ST.twitter});
  }

  onFinishClearTwitter() {
    // Update props
    this.props.onUpdateConfig((c) => {
      c.remoteSettings.twitterAccessTokenKey = "";
      c.remoteSettings.twitterAccessTokenSecret = "";
    });
    // Update state
    this.props.onUpdateSettings((s) => {
      s.twitterAccessTokenKey = "";
      s.twitterAccessTokenSecret = "";
    });
    this.onCloseDialog();
  }

  onClearInstagram() {
    this.setState({openMenu: MO.signOut, menuType: ST.instagram});
  }

  onFinishClearInstagram() {
    // Update props
    this.props.onUpdateConfig((c) => {
      c.remoteSettings.instagramPassword = "";
    });
    // Update state
    this.props.onUpdateSettings((s) => {
      s.instagramPassword = "";
    });
    this.onCloseDialog();
  }

  onAuthTumblr() {
    this.setState({
      openMenu: MO.new,
      menuType: ST.tumblr,
      input1: this.props.settings.tumblrKey,
      input2: this.props.settings.tumblrSecret
    });
  }

  onContinueAuthTumblr() {
    // Update state
    this.props.onUpdateSettings((s) => {
      s.tumblrKey = this.state.input1;
      s.tumblrSecret = this.state.input2;
    });
    this.setState({openMenu: MO.signIn, menuType: ST.tumblr});
  }

  onTumblrKeyInput(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const value = parseInt(input.value);
    if (value == 0) {
      this.changeKey('tumblrKey', "");
      this.changeKey('tumblrSecret', "");
      this.setState({input1: "", input2: ""});
    } else {
      const indexOf = value-1;
      this.changeKey('tumblrKey', this.props.settings.tumblrKeys[indexOf]);
      this.changeKey('tumblrSecret', this.props.settings.tumblrSecrets[indexOf]);
      this.setState({input1: this.props.settings.tumblrKeys[indexOf], input2: this.props.settings.tumblrSecrets[indexOf]});
    }
  }

  onAuthReddit() {
    this.setState({openMenu: MO.signIn, menuType: ST.reddit});
  }

  onAuthTwitter() {
    this.setState({openMenu: MO.signIn, menuType: ST.twitter});
  }

  onAuthInstagram() {
    this.setState({openMenu: MO.signIn, menuType: ST.instagram, input1: this.props.settings.instagramUsername, input2: this.props.settings.instagramPassword});
  }

  onCloseDialog() {
    this.setState({openMenu: null, menuType: null, input1: "", input2: "", input3: "", instagramMode: null});
  }

  openLink(url: string) {
    remote.shell.openExternal(url);
  }

  closeServer() {
    const server = this.state.server;
    if (server) {
      server.close();
      this.setState({server: null});
    }
  }

  onCloseSnack() {
    this.setState({successSnack: null});
  }

  onCloseErrorSnack() {
    this.setState({errorSnack: null});
  }

  onInput1(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({input1: input.value});
  }

  onInput2(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({input2: input.value});
  }

  onInput3(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({input3: input.value});
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (settings: any) => void) {
    this.props.onUpdateSettings(fn);
  }

  onFinishAuthTumblr() {
    this.onCloseDialog();
    this.closeServer();

    // Tumblr endpoints
    const authorizeUrl = 'https://www.tumblr.com/oauth/authorize';
    const requestTokenUrl = 'https://www.tumblr.com/oauth/request_token';
    const accessTokenUrl = 'https://www.tumblr.com/oauth/access_token';

    let tumblrKey = this.props.settings.tumblrKey;
    let tumblrSecret = this.props.settings.tumblrSecret;

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
        this.setState({errorSnack: "Error: " + err.statusCode + " - " + err.data});
        this.closeServer();
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
            (err: any, token: string, secret: string) => {
              if (err) {
                console.error("Validation failed with error", err);
                this.setState({errorSnack: "Error: " + err.statusCode + " - " + err.data});
                this.closeServer();
                req.connection.destroy();
                res.end();
                return;
              }

              // Update props
              this.props.onUpdateConfig((c) => {
                c.remoteSettings.tumblrKey = tumblrKey;
                c.remoteSettings.tumblrSecret = tumblrSecret;
                c.remoteSettings.tumblrOAuthToken = token;
                c.remoteSettings.tumblrOAuthTokenSecret = secret;
              });
              // Update state
              this.props.onUpdateSettings((s) => {
                s.tumblrOAuthToken = token;
                s.tumblrOAuthTokenSecret = secret;
              });

              this.setState({successSnack: "Tumblr is now activated"});
              remote.getCurrentWindow().show();
              this.closeServer();
              req.connection.destroy();
            }
          );
        } else {
          this.setState({errorSnack: "Error: Access Denied"});
          this.closeServer();
          req.connection.destroy();
        }
      }
      res.end();
    }).listen(65010);

    this.setState({server: server});
  }

  onFinishAuthReddit() {
    this.onCloseDialog();
    this.closeServer();
    const clientID = this.props.settings.redditClientID;
    const userAgent = this.props.settings.redditUserAgent;

    let deviceID = this.props.settings.redditDeviceID;
    if (deviceID == "") {
      deviceID = uuidv4();
    }

    // Make initial request and open authorization form in browser
    wretch("https://www.reddit.com/api/v1/authorize?client_id=" + clientID + "&response_type=code&state=" + deviceID +
      "&redirect_uri=http://localhost:65010&duration=permanent&scope=read,mysubreddits,history")
      .post()
      .res(res => {
        remote.shell.openExternal(res.url);
      })
      .catch(e => {
        console.error(e);
        this.setState({errorSnack: "Error: " + e.message});
        this.closeServer();
        return;
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
                // Update props
                this.props.onUpdateConfig((c) => {
                  c.remoteSettings.redditDeviceID = deviceID;
                  c.remoteSettings.redditRefreshToken = json.refresh_token;
                });
                // Update state
                this.props.onUpdateSettings((s) => {
                  s.redditDeviceID = deviceID;
                  s.redditRefreshToken = json.refresh_token;
                });

                this.setState({successSnack: "Reddit is now activated"});
                remote.getCurrentWindow().show();
                this.closeServer();
                req.connection.destroy();
              })
              .catch(e => {
                console.error(e);
                this.setState({errorSnack: "Error: " + e.message});
                this.closeServer();
                req.connection.destroy();
                res.end();
                return;
              });
          }
        } else if (req.url.includes("state") && req.url.includes("error")) {
          const args = req.url.replace("\/?", "").split("&");
          // This should be the same as the deviceID
          const state = args[0].substring(6);
          if (state == deviceID) {
            const error = args[1].substring(6);
            console.error(error);
            this.setState({errorSnack: "Error: " + error});
          }

          this.closeServer();
          req.connection.destroy();
        }
      }
      res.end();
    }).listen(65010);

    this.setState({server: server});
  }

  onFinishAuthTwitter() {
    this.onCloseDialog();
    this.closeServer();

    // Twitter endpoints
    const authorizeUrl = 'https://api.twitter.com/oauth/authorize';
    const requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    const accessTokenUrl = 'https://api.twitter.com/oauth/access_token';

    const consumerKey = this.props.settings.twitterConsumerKey;
    const consumerSecret = this.props.settings.twitterConsumerSecret;

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
        this.setState({errorSnack: "Error: " + err.statusCode + " - " + err.data});
        this.closeServer();
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
            (err: any, token: string, secret: string) => {
              if (err) {
                console.error("Validation failed with error", err);
                this.setState({errorSnack: "Error: " + err.statusCode + " - " + err.data});
                this.closeServer();
                req.connection.destroy();
                res.end();
                return;
              }

              // Update props
              this.props.onUpdateConfig((c) => {
                c.remoteSettings.twitterAccessTokenKey = token;
                c.remoteSettings.twitterAccessTokenSecret = secret;
              });
              // Update state
              this.props.onUpdateSettings((s) => {
                s.twitterAccessTokenKey = token;
                s.twitterAccessTokenSecret = secret;
              });

              this.setState({successSnack: "Twitter is now activated"});
              remote.getCurrentWindow().show();
              this.closeServer();
              req.connection.destroy();
            }
          );
        } else {
          this.setState({errorSnack: "Error: Access Denied"});
          this.closeServer();
          req.connection.destroy();
        }
      }
      res.end();
    }).listen(65010);

    this.setState({server: server});
  }

  _ig: IgApiClient = null;
  _tfa: any = null;
  onFinishAuthInstagram() {
    this._ig = new IgApiClient();
    this._tfa = null;
    this._ig.state.generateDevice(this.state.input1);
    this._ig.account.login(this.state.input1, this.state.input2).then((loggedInUser) => {
      // Update props
      this.props.onUpdateConfig((c) => {
        c.remoteSettings.instagramUsername = this.state.input1;
        c.remoteSettings.instagramPassword = this.state.input2;
      });
      // Update state
      this.props.onUpdateSettings((s) => {
        s.instagramUsername = this.state.input1;
        s.instagramPassword = this.state.input2;
      });
      this.setState({successSnack: "Instagram is activated"});
      this.onCloseDialog();
      this._ig = null;
    }).catch((e) => {
      if (e instanceof IgLoginTwoFactorRequiredError) {
        this.setState({instagramMode: IG.tfa});
        this._tfa = e.response.body.two_factor_info.two_factor_identifier;
      } else if (e instanceof IgCheckpointError) {
        this._ig.challenge.auto(true).then(() => {
          this.setState({instagramMode: IG.checkpoint});
        });
      } else {
        this.onCloseDialog();
        console.error(e);
        this.setState({errorSnack: e.message});
        this._ig = null;
      }
    });
  }

  onTFAInstagram() {
    this._ig.account.twoFactorLogin({
      twoFactorIdentifier: this._tfa,
      verificationMethod: '1',
      trustThisDevice: '1',
      username: this.props.settings.instagramUsername,
      verificationCode: this.state.input3,
    }).then(() => {
      // Update props
      this.props.onUpdateConfig((c) => {
        c.remoteSettings.instagramUsername = this.state.input1;
        c.remoteSettings.instagramPassword = this.state.input2;
      });
      // Update state
      this.props.onUpdateSettings((s) => {
        s.instagramUsername = this.state.input1;
        s.instagramPassword = this.state.input2;
      });
      this.setState({successSnack: "Instagram is activated"});
      this.onCloseDialog();
      this._ig = null;
      this._tfa = null;
    }).catch((e) => {
      this.onCloseDialog();
      console.error(e);
      this.setState({errorSnack: e.message});
      this._ig = null;
      this._tfa = null;
    });
  }

  onCheckpointInstagram() {
    this._ig.challenge.sendSecurityCode(this.state.input3).then(() => {
      // Update props
      this.props.onUpdateConfig((c) => {
        c.remoteSettings.instagramUsername = this.state.input1;
        c.remoteSettings.instagramPassword = this.state.input2;
      });
      // Update state
      this.props.onUpdateSettings((s) => {
        s.instagramUsername = this.state.input1;
        s.instagramPassword = this.state.input2;
      });
      this.setState({successSnack: "Instagram is activated"});
      this.onCloseDialog();
      this._ig = null;
    }).catch((e) => {
      this.onCloseDialog();
      console.error(e);
      this.setState({errorSnack: e.message});
      this._ig = null;
    });
  }
}

export default withStyles(styles)(APICard as any);