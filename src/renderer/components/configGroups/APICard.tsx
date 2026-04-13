import * as React from "react";
import clsx from "clsx";
import uuidv4 from "uuid/v4";
import wretch from "wretch";

import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slide,
  Snackbar,
  Switch,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import Config, { RemoteSettings } from "../../../common/Config";
import { MO, SS, ST } from "../../../common/const";
import en from "../../../common/en";
import SourceIcon from "../library/SourceIcon";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    fab: {
      boxShadow: "none",
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
      float: "right",
      backgroundColor: theme.palette.primary.light,
    },
    title: {
      paddingBottom: theme.spacing(1),
    },
    tumblrFields: {
      paddingTop: theme.spacing(2),
    },
    center: {
      textAlign: "center",
    },
    middleInput: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  });

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />;
}

interface APICardProps {
  classes: any;
  settings: RemoteSettings;
  onUpdateSettings(fn: (settings: RemoteSettings) => void): void;
  onUpdateConfig(fn: (config: Config) => void): void;
}

class APICard extends React.Component<APICardProps> {
  readonly props: APICardProps;

  readonly state: {
    openMenu: string;
    menuType: string;
    snackbarOpen: boolean;
    snackbar: string;
    snackbarSeverity: string;
    input1: string;
    input2: string;
    input3: string;
    input4: string;
  };

  constructor(props: APICardProps) {
    super(props);

    this.state = {
      openMenu: null as string,
      menuType: null as string,
      snackbarOpen: false,
      snackbar: null as string,
      snackbarSeverity: null as string,
      input1: "",
      input2: "",
      input3: "",
      input4: "",
    };
  }

  render() {
    const classes = this.props.classes;
    const tumblrAuthorized =
      this.props.settings.tumblrOAuthToken != "" &&
      this.props.settings.tumblrOAuthTokenSecret != "";
    const redditAuthorized = this.props.settings.redditRefreshToken != "";
    const hydrusConfigured = this.props.settings.hydrusAPIKey != "";
    const piwigoConfigured =
      this.props.settings.piwigoProtocol != "" &&
      this.props.settings.piwigoHost != "" &&
      this.props.settings.piwigoUsername != "" &&
      this.props.settings.piwigoPassword != "";
    const indexOf = this.props.settings.tumblrKeys.indexOf(
      this.props.settings.tumblrKey,
    );
    const menuType = this.state.menuType
      ? en.get(this.state.menuType)[0].toUpperCase() +
        en.get(this.state.menuType).slice(1)
      : "";
    let menuTypeSignOut = null;
    switch (this.state.menuType) {
      case ST.tumblr:
        menuTypeSignOut = this.onFinishClearTumblr.bind(this);
        break;
      case ST.reddit:
        menuTypeSignOut = this.onFinishClearReddit.bind(this);
        break;
      case ST.hydrus:
        menuTypeSignOut = this.onFinishClearHydrus.bind(this);
        break;
      case ST.piwigo:
        menuTypeSignOut = this.onFinishClearPiwigo.bind(this);
        break;
    }
    return (
      <React.Fragment>
        <Typography align="center" className={classes.title}>
          API Sign In
        </Typography>

        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item>
            <Tooltip
              disableInteractive
              title={
                tumblrAuthorized
                  ? "Authorized: Click to Sign Out of Tumblr"
                  : "Unauthorized: Click to Authorize Tumblr"
              }
              placement="top-end"
            >
              <Fab
                className={clsx(
                  classes.fab,
                  tumblrAuthorized ? classes.authorized : classes.noAuth,
                )}
                onClick={
                  tumblrAuthorized
                    ? this.onClearTumblr.bind(this)
                    : this.onAuthTumblr.bind(this)
                }
                size="large"
              >
                <SourceIcon className={classes.icon} type={ST.tumblr} />
              </Fab>
            </Tooltip>
          </Grid>
          {/*<Grid item>
            <Tooltip disableInteractive title={redditAuthorized ? "Authorized: Click to Sign Out of Reddit" : "Unauthorized: Click to Authorize Reddit"}  placement="top-end">
              <Fab
                className={clsx(classes.fab, redditAuthorized ? classes.authorized : classes.noAuth)}
                onClick={redditAuthorized ? this.onClearReddit.bind(this) : this.onAuthReddit.bind(this)}
                size="large">
                <SourceIcon className={classes.icon} type={ST.reddit}/>
              </Fab>
            </Tooltip>
          </Grid>*/}
          <Grid item>
            <Tooltip
              disableInteractive
              title={
                hydrusConfigured
                  ? "Configured: Click to Remove Hydrus Configuration"
                  : "Unauthorized: Click to Configure Hydrus"
              }
              placement="top-end"
            >
              <Fab
                className={clsx(
                  classes.fab,
                  hydrusConfigured ? classes.authorized : classes.noAuth,
                )}
                onClick={
                  hydrusConfigured
                    ? this.onClearHydrus.bind(this)
                    : this.onAuthHydrus.bind(this)
                }
                size="large"
              >
                <SourceIcon className={classes.icon} type={ST.hydrus} />
              </Fab>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip
              disableInteractive
              title={
                piwigoConfigured
                  ? "Configured: Click to Remove Piwigo Configuration"
                  : "Unauthorized: Click to Configure Piwigo"
              }
              placement="top-end"
            >
              <Fab
                className={clsx(
                  classes.fab,
                  piwigoConfigured ? classes.authorized : classes.noAuth,
                )}
                onClick={
                  piwigoConfigured
                    ? this.onClearPiwigo.bind(this)
                    : this.onAuthPiwigo.bind(this)
                }
                size="large"
              >
                <SourceIcon className={classes.icon} type={ST.piwigo} />
              </Fab>
            </Tooltip>
          </Grid>
          <Grid item xs={12} className={classes.center}>
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.settings.silenceTumblrAlert}
                  disabled={!tumblrAuthorized}
                  onChange={this.onBoolInput.bind(this, "silenceTumblrAlert")}
                />
              }
              label="Silence Tumblr Throttle Alert"
            />
          </Grid>
        </Grid>

        <Dialog
          open={this.state.openMenu == MO.signOut}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="sign-out-title"
          aria-describedby="sign-out-description"
        >
          <DialogTitle id="sign-out-title">
            {menuType} Sign Out
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={this.state.menuType} />
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="sign-out-description">
              You are already authorized for {menuType}. Are you sure you want
              to sign out?
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
          open={
            this.state.openMenu == MO.signIn && this.state.menuType == ST.tumblr
          }
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="sign-in-title"
          aria-describedby="sign-in-description"
        >
          <DialogTitle id="sign-in-title">
            Tumblr Sign In
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.tumblr} />
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="sign-in-description">
              You are about to be directed to{" "}
              <Link
                href="#"
                onClick={this.openLink.bind(this, "https://www.tumblr.com")}
                underline="hover"
              >
                Tumblr.com
              </Link>{" "}
              to authorize FlipFlip. You should only have to do this once.
              Tumblr has no Read-Only mode, so read <i>and</i> write access are
              requested. FlipFlip does not store any user information or make
              any changes to your account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={this.onFinishAuthTumblr.bind(this)}
              color="primary"
            >
              Authorize FlipFlip on Tumblr
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={
            this.state.openMenu == MO.new && this.state.menuType == ST.tumblr
          }
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="tumblr-title"
          aria-describedby="tumblr-description"
        >
          <DialogTitle id="tumblr-title">
            Tumblr API Key
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.tumblr} />
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="tumblr-description">
              FlipFlip provides a few public keys for use, but we recommend
              registering and using your own on{" "}
              <Link
                href="#"
                onClick={this.openLink.bind(
                  this,
                  "https://www.tumblr.com/oauth/apps",
                )}
                underline="hover"
              >
                Tumblr OAuth
              </Link>
              . Refer to the{" "}
              <Link
                href="#"
                onClick={this.openLink.bind(
                  this,
                  "https://ififfy.github.io/flipflip/#/tumblr_api",
                )}
                underline="hover"
              >
                FlipFlip documentation
              </Link>{" "}
              for complete instructions.
            </DialogContentText>
            <div className={classes.root}>
              <div>
                <DialogContentText>Choose a key:</DialogContentText>
                <RadioGroup
                  value={indexOf + 1}
                  onChange={this.onTumblrKeyInput.bind(this)}
                >
                  {[""]
                    .concat(Object.values(this.props.settings.tumblrKeys))
                    .map((tk, i) => (
                      <FormControlLabel
                        key={i}
                        value={i}
                        control={<Radio />}
                        label={i == 0 ? "Use Your Key" : "Public Key " + i}
                      />
                    ))}
                </RadioGroup>
              </div>
              <div className={classes.tumblrFields}>
                <TextField
                  variant="standard"
                  fullWidth
                  margin="dense"
                  label="Tumblr OAuth Consumer Key"
                  value={this.state.input1}
                  onChange={this.onInput1.bind(this)}
                />
                <TextField
                  variant="standard"
                  fullWidth
                  margin="dense"
                  label="Tumblr OAuth Consumer Secret"
                  value={this.state.input2}
                  onChange={this.onInput2.bind(this)}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.input1.length != 50 || this.state.input2.length != 50
              }
              onClick={this.onContinueAuthTumblr.bind(this)}
              color="primary"
            >
              Authorize FlipFlip on Tumblr
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={
            this.state.openMenu == MO.signIn && this.state.menuType == ST.reddit
          }
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="sign-in-title"
          aria-describedby="sign-in-description"
        >
          <DialogTitle id="sign-in-title">
            Reddit Sign In
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.reddit} />
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="sign-in-description">
              You are about to be directed to{" "}
              <Link
                href="#"
                onClick={this.openLink.bind(this, "https://www.reddit.com")}
                underline="hover"
              >
                Reddit.com
              </Link>{" "}
              to authorize FlipFlip. You should only have to do this once.
              FlipFlip does not store any user information or make any changes
              to your account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={this.onFinishAuthReddit.bind(this)}
              color="primary"
            >
              Authorize FlipFlip on Reddit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={
            this.state.openMenu == MO.signIn && this.state.menuType == ST.hydrus
          }
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="hydrus-title"
          aria-describedby="hydrus-description"
        >
          <DialogTitle id="hydrus-title">
            Hyrdus Configuration
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.hydrus} />
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="hydrus-description">
              FlipFlip does not store any user information or make changes to
              the Hydrus server. Your configured information is stored locally
              on your computer and is never shared with anyone or sent to any
              server (besides Hydrus, obviously).
            </DialogContentText>
            <FormControl variant="standard" margin="dense">
              <InputLabel>Protocol</InputLabel>
              <Select
                variant="standard"
                value={this.state.input1}
                onChange={this.onInput1.bind(this)}
              >
                <MenuItem key={"http"} value={"http"}>
                  http
                </MenuItem>
                <MenuItem key={"https"} value={"https"}>
                  https
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              variant="standard"
              className={classes.middleInput}
              margin="dense"
              label="Hydrus Domain"
              value={this.state.input2}
              onChange={this.onInput2.bind(this)}
            />
            <TextField
              variant="standard"
              margin="dense"
              label="Hydrus Port"
              value={this.state.input3}
              onChange={this.onInput3.bind(this)}
            />
            <TextField
              variant="standard"
              fullWidth
              margin="dense"
              label="Hydrus API Key"
              value={this.state.input4}
              onChange={this.onInput4.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.input1.length == 0 ||
                this.state.input2.length == 0 ||
                this.state.input3.length == 0 ||
                this.state.input4.length == 0
              }
              onClick={this.onFinishAuthHydrus.bind(this)}
              color="primary"
            >
              Configure Hydrus
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={
            this.state.openMenu == MO.signIn && this.state.menuType == ST.piwigo
          }
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="piwigo-title"
          aria-describedby="piwigo-description"
        >
          <DialogTitle id="piwigo-title">
            Piwigo Configuration
            <Avatar className={classes.iconAvatar}>
              <SourceIcon className={classes.icon} type={ST.piwigo} />
            </Avatar>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="piwigo-description">
              FlipFlip does not store any user information or make changes to
              the Piwigo server. Your configured information is stored locally
              on your computer and is never shared with anyone or sent to any
              server (besides Piwigo, obviously).
            </DialogContentText>
            <FormControl variant="standard" margin="dense">
              <InputLabel>Protocol</InputLabel>
              <Select
                variant="standard"
                value={this.state.input1}
                onChange={this.onInput1.bind(this)}
              >
                <MenuItem key={"http"} value={"http"}>
                  http
                </MenuItem>
                <MenuItem key={"https"} value={"https"}>
                  https
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              variant="standard"
              className={classes.middleInput}
              margin="dense"
              label="Piwigo Host"
              value={this.state.input2}
              onChange={this.onInput2.bind(this)}
            />
            <TextField
              variant="standard"
              fullWidth
              margin="dense"
              label="Username"
              value={this.state.input3}
              onChange={this.onInput3.bind(this)}
            />
            <TextField
              variant="standard"
              fullWidth
              margin="dense"
              label="Password"
              type="password"
              value={this.state.input4}
              onChange={this.onInput4.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.input1.length == 0 || this.state.input2.length == 0
              }
              onClick={this.onFinishAuthPiwigo.bind(this)}
              color="primary"
            >
              Configure Piwigo
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={this.state.snackbarOpen}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          autoHideDuration={20000}
          onClose={this.onCloseSnack.bind(this)}
          TransitionComponent={TransitionUp}
        >
          <Alert
            onClose={this.onCloseSnack.bind(this)}
            severity={this.state.snackbarSeverity as any}
          >
            {this.state.snackbar}
          </Alert>
        </Snackbar>
      </React.Fragment>
    );
  }

  onClearTumblr() {
    this.setState({ openMenu: MO.signOut, menuType: ST.tumblr });
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
    this.setState({ openMenu: MO.signOut, menuType: ST.reddit });
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

  onClearHydrus() {
    this.setState({ openMenu: MO.signOut, menuType: ST.hydrus });
  }

  onFinishClearHydrus() {
    // Update props
    this.props.onUpdateConfig((c) => {
      c.remoteSettings.hydrusProtocol = "http";
      c.remoteSettings.hydrusDomain = "localhost";
      c.remoteSettings.hydrusPort = "45869";
      c.remoteSettings.hydrusAPIKey = "";
    });
    // Update state
    this.props.onUpdateSettings((s) => {
      s.hydrusProtocol = "http";
      s.hydrusDomain = "localhost";
      s.hydrusPort = "45869";
      s.hydrusAPIKey = "";
    });
    this.onCloseDialog();
  }

  onClearPiwigo() {
    this.setState({ openMenu: MO.signOut, menuType: ST.piwigo });
  }

  onFinishClearPiwigo() {
    // Update props
    this.props.onUpdateConfig((c) => {
      c.remoteSettings.piwigoProtocol = "http";
      c.remoteSettings.piwigoHost = "";
      c.remoteSettings.piwigoUsername = "";
      c.remoteSettings.piwigoPassword = "";
    });
    // Update state
    this.props.onUpdateSettings((s) => {
      s.piwigoProtocol = "http";
      s.piwigoHost = "";
      s.piwigoUsername = "";
      s.piwigoPassword = "";
    });
    this.onCloseDialog();
  }

  onAuthTumblr() {
    this.setState({
      openMenu: MO.new,
      menuType: ST.tumblr,
      input1: this.props.settings.tumblrKey,
      input2: this.props.settings.tumblrSecret,
    });
  }

  onContinueAuthTumblr() {
    // Update state
    this.props.onUpdateSettings((s) => {
      s.tumblrKey = this.state.input1;
      s.tumblrSecret = this.state.input2;
    });
    this.setState({ openMenu: MO.signIn, menuType: ST.tumblr });
  }

  onTumblrKeyInput(e: MouseEvent) {
    const input = e.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (value == 0) {
      this.changeKey("tumblrKey", "");
      this.changeKey("tumblrSecret", "");
      this.setState({ input1: "", input2: "" });
    } else {
      const indexOf = value - 1;
      this.changeKey("tumblrKey", this.props.settings.tumblrKeys[indexOf]);
      this.changeKey(
        "tumblrSecret",
        this.props.settings.tumblrSecrets[indexOf],
      );
      this.setState({
        input1: this.props.settings.tumblrKeys[indexOf],
        input2: this.props.settings.tumblrSecrets[indexOf],
      });
    }
  }

  onAuthReddit() {
    this.setState({ openMenu: MO.signIn, menuType: ST.reddit });
  }

  onAuthHydrus() {
    this.setState({
      openMenu: MO.signIn,
      menuType: ST.hydrus,
      input1: this.props.settings.hydrusProtocol,
      input2: this.props.settings.hydrusDomain,
      input3: this.props.settings.hydrusPort,
      input4: this.props.settings.hydrusAPIKey,
    });
  }

  onAuthPiwigo() {
    this.setState({
      openMenu: MO.signIn,
      menuType: ST.piwigo,
      input1: this.props.settings.piwigoProtocol,
      input2: this.props.settings.piwigoHost,
      input3: this.props.settings.piwigoUsername,
      input4: this.props.settings.piwigoPassword,
    });
  }

  onCloseDialog() {
    this.setState({
      openMenu: null,
      menuType: null,
      input1: "",
      input2: "",
      input3: "",
      input4: "",
    });
  }

  openLink(url: string) {
    window.ipc.openExternal(url);
  }

  onCloseSnack() {
    this.setState({ snackbarOpen: false });
  }

  onInput1(e: MouseEvent) {
    const input = e.target as HTMLInputElement;
    this.setState({ input1: input.value });
  }

  onInput2(e: MouseEvent) {
    const input = e.target as HTMLInputElement;
    this.setState({ input2: input.value });
  }

  onInput3(e: MouseEvent) {
    const input = e.target as HTMLInputElement;
    this.setState({ input3: input.value });
  }

  onInput4(e: MouseEvent) {
    const input = e.target as HTMLInputElement;
    this.setState({ input4: input.value });
  }

  onBoolInput(key: string, e: MouseEvent) {
    const input = e.target as HTMLInputElement;
    const checked = input.checked;
    this.props.onUpdateSettings((s) => (s[key] = checked));
    this.props.onUpdateConfig((s) => (s.remoteSettings[key] = checked));
  }

  changeKey(key: string, value: any) {
    this.update((s) => (s[key] = value));
  }

  update(fn: (settings: any) => void) {
    this.props.onUpdateSettings(fn);
  }

  onFinishAuthTumblr() {
    this.onCloseDialog();

    const { tumblrKey, tumblrSecret } = this.props.settings;
    window.ipc.tumblrAuthRequest(tumblrKey, tumblrSecret);
    window.ipc.onTumblrAuthResponse((response) => {
      if (response.error != null) {
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + response.error,
          snackbarSeverity: SS.error,
        });
      }
      if (response.success != null) {
        const { token, secret } = response.success;
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

        this.setState({
          snackbarOpen: true,
          snackbar: "Tumblr is now activated",
          snackbarSeverity: SS.success,
        });
      }
    });
  }

  onFinishAuthReddit() {
    this.onCloseDialog();
    const clientID = this.props.settings.redditClientID;
    const userAgent = this.props.settings.redditUserAgent;

    let deviceID = this.props.settings.redditDeviceID;
    if (deviceID == "") {
      deviceID = uuidv4();
    }

    window.ipc.redditAuthRequest(userAgent, clientID, deviceID);
    window.ipc.onRedditAuthResponse((response) => {
      if (response.error != null) {
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + response.error,
          snackbarSeverity: SS.error,
        });
      }
      if (response.success != null) {
        this.props.onUpdateConfig((c) => {
          c.remoteSettings.redditDeviceID = deviceID;
          c.remoteSettings.redditRefreshToken = response.success.token;
        });
        // Update state
        this.props.onUpdateSettings((s) => {
          s.redditDeviceID = deviceID;
          s.redditRefreshToken = response.success.token;
        });

        this.setState({
          snackbarOpen: true,
          snackbar: "Reddit is now activated",
          snackbarSeverity: SS.success,
        });
      }
    });
  }

  onFinishAuthHydrus() {
    wretch(
      this.state.input1 +
        "://" +
        this.state.input2 +
        ":" +
        this.state.input3 +
        "/session_key",
    )
      .headers({ "Hydrus-Client-API-Access-Key": this.state.input4 })
      .get()
      .setTimeout(5000)
      .notFound((e) => {
        console.error(e);
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + e.message,
          snackbarSeverity: SS.error,
        });
      })
      .internalError((e) => {
        console.error(e);
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + e.message,
          snackbarSeverity: SS.error,
        });
      })
      .json((json) => {
        if (json.session_key) {
          // Update props
          this.props.onUpdateConfig((c) => {
            c.remoteSettings.hydrusProtocol = this.state.input1;
            c.remoteSettings.hydrusDomain = this.state.input2;
            c.remoteSettings.hydrusPort = this.state.input3;
            c.remoteSettings.hydrusAPIKey = this.state.input4;
          });
          // Update state
          this.props.onUpdateSettings((s) => {
            s.hydrusProtocol = this.state.input1;
            s.hydrusDomain = this.state.input2;
            s.hydrusPort = this.state.input3;
            s.hydrusAPIKey = this.state.input4;
          });
          this.setState({
            snackbarOpen: true,
            snackbar: "Hydrus is configured",
            snackbarSeverity: SS.success,
          });
          this.onCloseDialog();
        } else {
          console.error("Invalid response from Hydrus server");
          this.setState({
            snackbarOpen: true,
            snackbar: "Invalid response from Hydrus server",
            snackbarSeverity: SS.error,
          });
        }
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + e.message,
          snackbarSeverity: SS.error,
        });
      });
  }

  onFinishAuthPiwigo() {
    let reqURL =
      this.state.input1 +
      "://" +
      this.state.input2 +
      (this.state.input2.endsWith("/") ? "" : "/") +
      "ws.php?format=json";

    if (!this.state.input3) {
      reqURL += "&method=reflection.getMethodList";
    }

    let req = wretch(reqURL);
    if (this.state.input3) {
      req = req.formUrl({
        method: "pwg.session.login",
        username: this.state.input3,
        password: this.state.input4,
      });
    }

    req
      .post()
      .setTimeout(5000)
      .notFound((e) => {
        console.error(e);
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + e.message,
          snackbarSeverity: SS.error,
        });
      })
      .internalError((e) => {
        console.error(e);
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + e.message,
          snackbarSeverity: SS.error,
        });
      })
      .json((json) => {
        if (json.stat == "ok") {
          this.props.onUpdateConfig((c) => {
            c.remoteSettings.piwigoProtocol = this.state.input1;
            c.remoteSettings.piwigoHost = this.state.input2;
            c.remoteSettings.piwigoUsername = this.state.input3;
            c.remoteSettings.piwigoPassword = this.state.input4;
          });
          // Update state
          this.props.onUpdateSettings((s) => {
            s.piwigoProtocol = this.state.input1;
            s.piwigoHost = this.state.input2;
            s.piwigoUsername = this.state.input3;
            s.piwigoPassword = this.state.input4;
          });
          this.setState({
            snackbarOpen: true,
            snackbar: "Piwigo is configured",
            snackbarSeverity: SS.success,
          });
          this.onCloseDialog();
        } else {
          console.error("Invalid response from Piwigo server");
          this.setState({
            snackbarOpen: true,
            snackbar: "Invalid response from Piwigo server",
            snackbarSeverity: SS.error,
          });
        }
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + e.message,
          snackbarSeverity: SS.error,
        });
      });
  }
}

(APICard as any).displayName = "APICard";
export default withStyles(styles)(APICard as any);
