import * as React from "react";
import {remote} from "electron";
import wretch from "wretch";
import clsx from "clsx";
import fs from "fs";
import * as CodeMirror from 'react-codemirror2'

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');

import {
  AppBar, Button, Card, CardContent, Container, createStyles, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Divider, Grid, IconButton, MenuItem, Select, Theme, Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import FolderIcon from '@material-ui/icons/Folder';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import GetAppIcon from '@material-ui/icons/GetApp';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PublishIcon from '@material-ui/icons/Publish';
import SaveIcon from '@material-ui/icons/Save';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';

import {MO} from "../../data/const";
import captionProgramDefaults, {getTimingFromString} from "../../data/utils";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import Player from "../player/Player";
import Config from "../../data/Config";
import SceneSelect from "../configGroups/SceneSelect";
import TextCard from "../configGroups/TextCard";
import CaptionProgram from "../player/CaptionProgram";
import ChildCallbackHack from "../player/ChildCallbackHack";
import AudioCard from "../configGroups/AudioCard";

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  fill: {
    flexGrow: 1,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    ...theme.mixins.toolbar
  },
  backButton: {
    float: 'left',
  },
  title: {
    textAlign: 'center',
    flexGrow: 1,
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    flexWrap: 'nowrap',
  },
  headerLeft: {
    flexBasis: '3%',
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  container: {
    padding: theme.spacing(0),
    display: 'grid',
    gridTemplateColumns: '40% 20% 40%',
    gridTemplateRows: '50% 50%',
  },
  scriptGrid: {
    gridRowStart: 1,
    gridRowEnd: 3,
    display: 'flex',
    flexDirection: 'column',
  },
  scriptArea: {
    alignItems: 'start',
  },
  menuGrid: {
    gridRowStart: 1,
    gridRowEnd: 3,
    display: 'flex',
    flexDirection: 'column',
  },
  menuCard: {
    height: '100%',
    overflowY: 'auto',
  },
  playerGrid: {
    overflow: 'hidden',
    position: 'relative',
  },
  fontGrid: {
    borderWidth: 1,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'none none none solid',
  },
  fontCard: {
    height: '100%',
    overflowY: 'auto',
  },
  menuCardContent: {
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  menuGridButtons: {
    display: 'flex',
    padding: '0 !important',
    marginTop: theme.spacing(1),
  },
  noPaddingTop: {
    paddingTop: '0 !important',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%',
  },
  emptyMessage2: {
    textAlign: 'center',
  },
  errorIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    width: '10em',
    height: '10em',
    zIndex: 3,
  },
  statusMessage: {
    display: 'flex',
    marginLeft: theme.spacing(1),
  },
  errorMessageIcon: {
    marginTop: 3,
    marginRight: theme.spacing(1),
  },
  okIcon: {
    marginTop: 3,
    color: theme.palette.success.main,
  },
  codeMirrorWrapper: {
    overflowY: 'auto',
    height: '100%',
  },
  hidden: {
    opacity: 0,
  },
  openFileName: {
    marginLeft: 'auto',
    marginTop: theme.spacing(1.5),
    color: theme.palette.text.hint,
  },
  actionButton: {
    color: '#FFCB6B',
  },
  setterButton: {
    color: '#F78C6C',
  },
  storeButton: {
    color: '#DECB6B',
  },
  keywordButton: {
    color: '#F07178',
  },
});

const actions = ["blink", "cap", "bigcap", "count", "wait"];
const tupleSetters = ["setBlinkDuration", "setBlinkDelay", "setBlinkGroupDelay", "setCaptionDuration", "setCaptionDelay",
  "setCountDuration", "setCountDelay", "setCountGroupDelay"];
const singleSetters = ["setBlinkWaveRate", "setBlinkBPMMulti", "setBlinkDelayWaveRate", "setBlinkDelayBPMMulti",
  "setBlinkGroupDelayWaveRate", "setBlinkGroupDelayBPMMulti", "setCaptionWaveRate", "setCaptionBPMMulti",
  "setCaptionDelayWaveRate", "setCaptionDelayBPMMulti", "setCountWaveRate", "setCountBPMMulti", "setCountDelayWaveRate",
  "setCountDelayBPMMulti", "setCountGroupDelayWaveRate", "setCountGroupDelayBPMMulti", "setBlinkY", "setCaptionY",
  "setBigCaptionY", "setCountY"];
const stringSetters = ["setBlinkTF", "setBlinkDelayTF", "setBlinkGroupDelayTF", "setCaptionTF", "setCaptionDelayTF",
  "setCountTF", "setCountDelayTF", "setCountGroupDelayTF"];
const storers = ["storephrase", "storePhrase"];
const keywords = ["$RANDOM_PHRASE", "$TAG_PHRASE"];
const timestampRegex = /^((\d?\d:)?\d?\d:\d\d(\.\d\d?\d?)?|\d?\d(\.\d\d?\d?)?)$/;

(function(mod) {
  mod(require("codemirror/lib/codemirror"));
})(function(CodeMirror: any) {
  CodeMirror.defineMode('flipflip', function() {

    let words: any = {};
    function define(style: any, dict: any) {
      for(let i = 0; i < dict.length; i++) {
        words[dict[i]] = style;
      }
    }

    CodeMirror.registerHelper("hintWords", "flipflip", actions.concat(tupleSetters, singleSetters, stringSetters, keywords, storers));

    define('atom', tupleSetters);
    define('atom', singleSetters);
    define('atom', stringSetters);
    define('variable', keywords);
    define('variable-3', storers);
    define('builtin', actions);

    function parse(stream: any, state: any) {
      if (stream.eatSpace()) return rt(null, state, stream);

      let sol = stream.sol();
      const ch = stream.next();

      if (ch === '#' && sol) {
        stream.skipToEnd();
        return "comment";
      }

      let command = null;
      let timestamp = false;

      if (state.tokens.length > 0) {
        if (timestampRegex.exec(state.tokens[0]) != null) {
          timestamp = true;
          if (state.tokens.length > 1) {
            command = state.tokens[1];
          } else {
            sol = true;
          }
        } else {
          command = state.tokens[0];
        }
      }

      if (ch === "/" && command == "blink") {
        state.tokens.push(ch);
        return rt("operator", state, stream);
      }
      if (ch === "\\" && !stream.eol() && /n/.test(stream.peek()) && !sol && (command == "blink" || command == "cap" || command == "bigcap")) {
        stream.next();
        state.tokens.push(ch);
        return rt("operator", state, stream);
      }

      if (ch === "$" && command != null && command.toLowerCase() == "storephrase") {
        stream.next();
        if(stream.eol() || /\s/.test(stream.peek())) {
          state.tokens.push(stream.current());
          return rt("number", state, stream);
        }
      }

      if (/\d/.test(ch) && sol && !timestamp) {
        // Timestamp
        stream.eatWhile(/[\d:.]/);
        if(stream.eol() || !/\w/.test(stream.peek())) {
          const timestamp = stream.current();
          state.tokens.push(timestamp);
          if (timestampRegex.exec(timestamp) != null) {
            return rt("number", state, stream);
          } else {
            return rt("error", state, stream);
          }
        }
      }

      if (/[-\d]/.test(ch) && (command == "count" || command == "wait" ||
        tupleSetters.includes(command) || singleSetters.includes(command))) {
        // Number parameter
        stream.eatWhile(/\d/);
        if(stream.eol() || !/\w/.test(stream.peek())) {
          state.tokens.push(stream.current());
          if (((command == "count" || tupleSetters.includes(command)) && state.tokens.length > 3) ||
            ((command == "wait" || singleSetters.includes(command)) && state.tokens.length > 2)) {
            return rt("error", state, stream);
          }
          return rt("number", state, stream);
        }
      }
      stream.eatWhile(/[\d\w-]/);
      const cur = stream.current();
      stream.eatSpace();
      if (sol && words.hasOwnProperty(cur) && !keywords.includes(cur)) {
        // Command at start of line
        state.tokens.push(cur);
        return rt(words[cur], state, stream);
      } else if (!sol && command == "blink" && (keywords.includes(cur) || /^\$\d$/.exec(cur) != null)) {
        // Keyword in blink command
        state.tokens.push(cur);
        if ((state.tokens.length == (timestamp ? 3 : 2) || state.tokens[state.tokens.length - 2] == "/") && (stream.eol() || /\//.test(stream.peek()))) {
          if (cur == "$RANDOM_PHRASE" && !state.storedPhrases.has(0)) {
            return rt("error", state, stream);
          } else {
            const registerRegex = /^\$(\d)$/.exec(cur);
            if (registerRegex != null) {
              if (!state.storedPhrases.has(parseInt(registerRegex[1]))) {
                return rt("error", state, stream);
              } else {
                return rt("variable", state, stream);
              }
            }
          }
          return rt(words[cur], state, stream);
        } else {
          return rt("string", state, stream);
        }
      } else if (!sol && (command == "cap" || command == "bigcap") && (keywords.includes(cur) || /^\$\d$/.exec(cur) != null)) {
        // Keyword in a cap or bigcap command
        state.tokens.push(cur);
        if (state.tokens.length == (timestamp ? 3 : 2) && stream.eol()) {
          if (cur == "$RANDOM_PHRASE" && !state.storedPhrases.has(0)) {
            return rt("error", state, stream);
          } else {
            const registerRegex = /^\$(\d)$/.exec(cur);
            if (registerRegex != null) {
              if (!state.storedPhrases.has(parseInt(registerRegex[1]))) {
                return rt("error", state, stream);
              } else {
                return rt("variable", state, stream);
              }
            }
          }
          return rt(words[cur], state, stream);
        } else {
          return rt("string", state, stream);
        }
      } else if (!sol && state.tokens.length > 0) {
        // String Parameter
        state.tokens.push(cur);
        if (command == "blink" && cur == "/") {
          return rt("operator", state, stream);
        } else if (command == "count" || command == "wait"
          || tupleSetters.includes(command) || singleSetters.includes(command)) {
          return rt("error", state, stream);
        } else if (stringSetters.includes(command)) {
          const tf = getTimingFromString(cur);
          return rt(tf == null ? "error" : "variable", state, stream);
        }
        return rt("string", state, stream);
      } else {
        return rt("error", state, stream);
      }
    }

    function rt(type: string, state: any, stream: any) {
      if (stream.eol()) {
        if (state.tokens.length > 0 && state.tokens[0].toLowerCase() == "storephrase") {
          const registerRegex = /^\$(\d)$/.exec(state.tokens[1]);
          if (registerRegex != null) {
            if (state.tokens.length > 1) {
              state.storedPhrases.set(parseInt(registerRegex[1]), true);
              state.storedPhrases.set(0, true);
            }
          } else {
            state.storedPhrases.set(0, true);
          }
        }
        state.tokens = new Array<string>();
      }
      return type;
    }

    return {
      startState: function() {return {tokens: new Array<string>(), storedPhrases: new Map<number, boolean>()};},
      token: function(stream: any, state: any) {
        return parse(stream, state);
      },
    };
  });
});

class CaptionScriptor extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    scenes: Array<Scene>,
    theme: Theme,
    getTags(source: string): Array<Tag>,
    goBack(): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  readonly state = {
    captionScript: "",
    scene: null as Scene,
    error: null as string,
    fullscreen: false,
    sceneChanged: false,
    scriptChanged: false,
    loadFromSceneError: false,
    openFile: null as string,
    openMenu: null as string,
    captionProgramJumpToHack: new ChildCallbackHack(),
  };

  render() {
    const classes = this.props.classes;

    const loadFromScene = this.state.scene != null && this.state.scene.textSource != null &&
      this.state.scene.textSource != "" && this.state.scene.textSource != this.state.openFile;
    const saveToScene = this.state.scene != null &&
      (this.state.sceneChanged || (this.state.openFile != null && this.state.openFile != this.state.scene.textSource));

    let menuName, menuThen;
    switch(this.state.openMenu) {
      case MO.error:
        menuName="Back";
        menuThen=this.props.goBack;
        break;
      case MO.new:
        menuName="New";
        menuThen=this.onConfirmNew.bind(this);
        break;
      case MO.open:
        menuName="Open";
        menuThen=this.onConfirmOpen.bind(this);
        break;
      case MO.load:
        menuName="Load From Scene";
        menuThen=this.onConfirmLoadFromScene.bind(this);
        break;
    }

    let getTimestamp = undefined;
    if (this.state.scene && this.state.scene.audioEnabled) {
      getTimestamp = this.getTimestamp.bind(this);
    }

    return(
      <div className={classes.root}>
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip title="Back" placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  className={classes.backButton}
                  onClick={this.goBack.bind(this)}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </div>

            <Typography component="h1" variant="h4" color="inherit" noWrap
                        className={classes.title}>
              {this.state.openFile == null ? "Caption Scriptor" : this.state.openFile}
            </Typography>

            <Tooltip title={this.state.fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <span style={this.state.scene == null ? { pointerEvents: "none" } : {}}>
                <IconButton
                  disabled={this.state.scene == null}
                  edge="start"
                  color="inherit"
                  aria-label={this.state.fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  onClick={this.onFullscreen.bind(this)}>
                  {this.state.fullscreen ? <FullscreenExitIcon fontSize="large"/> : <FullscreenIcon fontSize="large"/>}
                </IconButton>
              </span>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />

          <div className={clsx(classes.root, classes.fill)}>
            <Container maxWidth={false} className={classes.container}>
              <div className={clsx(classes.scriptGrid, this.state.fullscreen && classes.hidden)}
                   id={'script-field'}>
                {this.state.error != null && (
                  <div className={classes.statusMessage}>
                    <ErrorOutlineIcon className={classes.errorMessageIcon} color="error" />
                    <Typography component="div" variant="h5" color="error">
                      {this.state.error}
                    </Typography>
                  </div>
                )}
                {this.state.error == null && this.state.captionScript.length > 0 && (
                  <div className={classes.statusMessage}>
                    <CheckCircleOutlineIcon className={classes.okIcon}/>
                  </div>
                )}
                {this.state.captionScript.length == 0 && (
                  <div className={classes.statusMessage}>
                    <Typography component="div" variant="subtitle1" color="textPrimary">
                      Paste or type your script here.
                    </Typography>
                  </div>
                )}
                <CodeMirror.Controlled
                  className={classes.codeMirrorWrapper}
                  value={this.state.captionScript}
                  autoScroll={false}
                  options={{
                    mode: 'flipflip',
                    theme: 'material',
                    lineNumbers: true,
                    lineWrapping: true,
                    viewportMargin: Infinity,
                  }}
                  onBeforeChange={this.onBeforeChangeScript.bind(this)}
                  onGutterClick={this.onGutterClick.bind(this)}
                />
              </div>
              <div className={clsx(classes.menuGrid, this.state.fullscreen && classes.hidden)}>
                <Card className={classes.menuCard}>
                  <CardContent className={classes.menuCardContent}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} className={classes.menuGridButtons}>
                        <Tooltip title="New">
                          <IconButton onClick={this.onNew.bind(this)}>
                            <InsertDriveFileIcon/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open">
                          <IconButton onClick={this.onOpen.bind(this)}>
                            <FolderIcon/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Save">
                          <span style={!this.state.scriptChanged ? { pointerEvents: "none" } : {}}>
                            <IconButton disabled={!this.state.scriptChanged} onClick={this.onSave.bind(this)}>
                              <SaveIcon/>
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Save As">
                          <IconButton onClick={this.onSaveAs.bind(this)}>
                            <SaveOutlinedIcon/>
                          </IconButton>
                        </Tooltip>
                        <Divider orientation="vertical" flexItem />
                        <Tooltip title="Load From Scene">
                          <span style={!loadFromScene ? { pointerEvents: "none" } : {}}>
                            <IconButton disabled={!loadFromScene} onClick={this.onLoadFromScene.bind(this)}>
                              {this.state.loadFromSceneError ? <ErrorOutlineIcon color={"error"}/> : <GetAppIcon/>}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Save To Scene">
                          <span style={!saveToScene ? { pointerEvents: "none" } : {}}>
                            <IconButton disabled={!saveToScene} onClick={this.onSaveToScene.bind(this)}>
                              <PublishIcon/>
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12} className={classes.noPaddingTop}>
                        <Divider variant={"fullWidth"}/>
                      </Grid>
                      <Grid item xs={12}>
                        {this.state.scene == null && (
                          <Typography component="div" variant="subtitle1" color="textPrimary">
                            Select a Scene to start testing
                          </Typography>
                        )}
                        <SceneSelect
                          scene={null}
                          allScenes={this.props.scenes}
                          value={this.state.scene ? this.state.scene.id : 0}
                          getSceneName={this.getSceneName.bind(this)}
                          onChange={this.onChangeScene.bind(this)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant={"h5"}>Actions</Typography>
                          </Grid>
                          <Grid item>
                            <Tooltip title={"For each <TEXT> between slashes, show text for blinkDuration ms, then wait blinkDelay ms. When they are all done, wait blinkGroupDelay ms."}>
                              <Button className={classes.actionButton} onClick={this.onAddBlink.bind(this)} variant="outlined">blink</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title={"Show smaller <TEXT> for captionDuration ms, then wait captionDelay ms."}>
                              <Button className={classes.actionButton} onClick={this.onAddCap.bind(this)} variant="outlined">cap</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title={"Show bigger <TEXT> for captionDuration ms, then wait captionDelay ms."}>
                              <Button className={classes.actionButton} onClick={this.onAddBigCap.bind(this)} variant="outlined">bigcap</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title={"Count from <START> to <END> (<START> and <END> are whole numbers). Display each number for countDuration ms, then wait countDelay ms. When they are all done, wait countGroupDelay ms."}>
                              <Button className={classes.actionButton} onClick={this.onAddCount.bind(this)} variant="outlined">count</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title={"Wait <MILLISECONDS> ms"}>
                              <Button className={classes.actionButton} onClick={this.onAddWait.bind(this)} variant="outlined">wait</Button>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider variant={"fullWidth"}/>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant={"h5"}>Setters</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Select
                              fullWidth
                              value={""}
                              onChange={this.onAddSetter.bind(this)}>>
                              <MenuItem key={"all"} value={"all"}>Insert All</MenuItem>
                              <Divider/>
                              {tupleSetters.map((s) =>
                                <MenuItem className={classes.setterButton} key={s} value={s}>{s}</MenuItem>
                              )}
                              <Divider/>
                              {stringSetters.map((s) =>
                                <MenuItem className={classes.setterButton} key={s} value={s}>{s}</MenuItem>
                              )}
                              <Divider/>
                              {singleSetters.map((s) =>
                                <MenuItem className={classes.setterButton} key={s} value={s}>{s}</MenuItem>
                              )}
                            </Select>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider variant={"fullWidth"}/>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant={"h5"}>Special</Typography>
                          </Grid>
                          <Grid item>
                            <Tooltip title={"Stores a phrase to be used with $RANDOM_PHRASE"}>
                              <Button className={classes.storeButton} onClick={this.onAddStorePhrase.bind(this)} variant="outlined">storePhrase</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title={"When running, is replaced with a random stored phrase"}>
                              <Button className={classes.keywordButton} onClick={this.onAddString.bind(this, "$RANDOM_PHRASE")} variant="outlined">$RANDOM_PHRASE</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title={"When running, is replaced with a random tag phrase based on the current source"}>
                              <Button className={classes.keywordButton} onClick={this.onAddString.bind(this, "$TAG_PHRASE")} variant="outlined">$TAG_PHRASE</Button>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <div className={classes.fill}/>
                    {this.state.scene && (
                      <AudioCard
                        sidebar
                        startPlaying
                        shorterSeek
                        showMsTimestamp
                        scene={this.state.scene}
                        onPlaying={this.onPlaying.bind(this)}
                        onUpdateScene={this.onUpdateScene.bind(this)}/>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className={classes.playerGrid}>
                {this.state.scene && (
                  <Player
                    config={this.props.config}
                    scene={this.state.scene}
                    gridView={!this.state.fullscreen}
                    captionScript={this.state.captionScript}
                    captionScale={this.state.fullscreen ? 1 : 0.35}
                    scenes={this.props.scenes}
                    theme={this.props.theme}
                    getTags={this.props.getTags.bind(this)}
                    goBack={this.props.goBack.bind(this)}
                    onCaptionError={this.onError.bind(this)}
                    onUpdateScene={this.onUpdateScene.bind(this)}
                    captionProgramJumpToHack={this.state.captionProgramJumpToHack}
                    tutorial={null}
                    getCurrentTimestamp={getTimestamp}
                    cache={() => {}}
                    setCount={() => {}}
                    systemMessage={() => {}}
                  />
                )}
                {this.state.error != null && (
                  <ErrorOutlineIcon className={classes.errorIcon} color="error" />
                )}
                {!this.state.scene && this.state.captionScript.length > 0 && (
                  <CaptionProgram
                    blinkColor={"#FFFFFF"}
                    blinkFontSize={5}
                    blinkFontFamily={"Arial Black,Arial Bold,Gadget,sans-serif"}
                    blinkBorder={false}
                    blinkBorderpx={2}
                    blinkBorderColor={"#000000"}
                    captionColor={"#FFFFFF"}
                    captionFontSize={2}
                    captionFontFamily={"Helvetica Neue,Helvetica,Arial,sans-serif"}
                    captionBorder={false}
                    captionBorderpx={1}
                    captionBorderColor={"#000000"}
                    captionBigColor={"#FFFFFF"}
                    captionBigFontSize={3}
                    captionBigFontFamily={"Arial Black,Arial Bold,Gadget,sans-serif"}
                    captionBigBorder={false}
                    captionBigBorderpx={1}
                    captionBigBorderColor={"#000000"}
                    countColor={"#FFFFFF"}
                    countFontSize={3}
                    countFontFamily={"Arial Black,Arial Bold,Gadget,sans-serif"}
                    countBorder={false}
                    countBorderpx={1}
                    countBorderColor={"#000000"}
                    url={null}
                    script={this.state.captionScript}
                    textEndStop={false}
                    textNextScene={false}
                    getTags={this.props.getTags.bind(this)}
                    goBack={this.props.goBack.bind(this)}
                    playNextScene={() => {}}
                    timeToNextFrame={null}
                    currentAudio={null}
                    currentImage={null}
                    jumpToHack={this.state.captionProgramJumpToHack}
                    onError={this.onError.bind(this)}/>
                )}
              </div>
              <div className={clsx(classes.fontGrid, this.state.fullscreen && classes.hidden)}>
                  <Card className={classes.fontCard}>
                    <CardContent>
                      {this.state.scene != null && (
                      <TextCard
                        onlyFontOptions
                        scene={this.state.scene}
                        onUpdateScene={this.onUpdateScene.bind(this)}/>
                      )}
                    </CardContent>
                  </Card>
              </div>
            </Container>
          </div>
        </main>

        <Dialog
          open={this.state.openMenu != null}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="back-title"
          aria-describedby="back-description">
          <DialogTitle id="back-title">Save Changes?</DialogTitle>
          <DialogContent>
            <DialogContentText id="back-description">
              You have unsaved changes. Would you like to save?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={menuThen} color="inherit">
              {menuName} - Don't Save
            </Button>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onSaveThen.bind(this, menuThen)} color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  nop() {}

  _currentTimestamp: number = null;
  onPlaying(position: number, duration: number) {
    this._currentTimestamp = position;
  }
  getTimestamp() {
    return this._currentTimestamp;
  }

  onCloseDialog() {
    this.setState({openMenu: null, drawerOpen: false});
  }

  componentDidMount() {
    this._currentTimestamp = 0;
    window.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    this._currentTimestamp = null;
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape' && this.state.fullscreen) {
      this.onFullscreen();
    }
  };

  onNew() {
    if (this.state.scriptChanged) {
      this.setState({openMenu: MO.new});
    } else {
      this.onConfirmNew();
    }
  }

  onConfirmNew() {
    this.onCloseDialog();
    this.setState({openFile: null, captionScript: "", error: null, scriptChanged: false,});
  }

  onOpen() {
    if (this.state.scriptChanged) {
      this.setState({openMenu: MO.open});
    } else {
      this.onConfirmOpen();
    }
  }

  onConfirmOpen() {
    this.onCloseDialog();
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
      {
        filters: [{name: 'All Files (*.*)', extensions: ['*']}, {name: 'Text Document', extensions: ['txt']}],
        properties: ['openFile']
      });
    if (!result || !result.length) return;
    const url = result[0];
    wretch(url)
      .get()
      .text(data => {
        this.setState({captionScript: data, openFile: url, scriptChanged: false});
      });
  }

  onSaveThen(then: () => void) {
    if (this.onSave()) {
      then();
    }
}

  onSave() {
    if (this.state.openFile == null) {
      return this.onSaveAs();
    } else {
      fs.writeFileSync(this.state.openFile, this.state.captionScript);
      this.setState({scriptChanged: false});
      return true;
    }
  }

  onSaveAs() {
    remote.dialog.showSaveDialog(remote.getCurrentWindow(),
      {filters: [{name: 'Text Document', extensions: ['txt']}], defaultPath: this.state.openFile}, (filePath) => {
        if (filePath != null) {
          fs.writeFileSync(filePath, this.state.captionScript);
          this.setState({openFile: filePath, scriptChanged: false});
          return true;
        } else {
          return false;
        }
      });
  }

  onLoadFromScene() {
    if (this.state.scene == null || this.state.scene.textSource == "" ||
      this.state.scene.textSource == this.state.openFile || this.state.loadFromSceneError)  return;

    if (this.state.scriptChanged) {
      this.setState({openMenu: MO.load});
    } else {
      this.onConfirmLoadFromScene();
    }
  }

  onConfirmLoadFromScene() {
    const error = (error: any) => {
      console.error(error);
      this.setState({loadFromSceneError: true});
      setTimeout(() => {this.setState({loadFromSceneError: false});}, 3000);
    }

    this.onCloseDialog();
    const url = this.state.scene.textSource;
    wretch(url)
      .get()
      .badRequest(error)
      .unauthorized(error)
      .forbidden(error)
      .notFound(error)
      .timeout(error)
      .internalError(error)
      .fetchError(error)
      .error(503, error)
      .text(data => {
        this.setState({captionScript: data, openFile: url, scriptChanged: false,});
      });
  }

  onSaveToScene() {
    if (this.state.scene == null) return;

    if (this.state.openFile == null) {
      this.onSaveAs();
    }
    this.props.onUpdateScene(this.state.scene, (scene) => {
      scene.textSource = this.state.openFile;
      scene.blinkFontFamily = this.state.scene.blinkFontFamily;
      scene.blinkFontSize = this.state.scene.blinkFontSize;
      scene.blinkColor = this.state.scene.blinkColor;
      scene.blinkBorder = this.state.scene.blinkBorder;
      scene.blinkBorderpx = this.state.scene.blinkBorderpx;
      scene.blinkBorderColor = this.state.scene.blinkBorderColor;
      scene.captionFontFamily = this.state.scene.captionFontFamily;
      scene.captionFontSize = this.state.scene.captionFontSize;
      scene.captionColor = this.state.scene.captionColor;
      scene.captionBorder = this.state.scene.captionBorder;
      scene.captionBorderpx = this.state.scene.captionBorderpx;
      scene.captionBorderColor = this.state.scene.captionBorderColor;
      scene.captionBigFontFamily = this.state.scene.captionBigFontFamily;
      scene.captionBigFontSize = this.state.scene.captionBigFontSize;
      scene.captionBigColor = this.state.scene.captionBigColor;
      scene.captionBigBorder = this.state.scene.captionBigBorder;
      scene.captionBigBorderpx = this.state.scene.captionBigBorderpx;
      scene.captionBigBorderColor = this.state.scene.captionBigBorderColor;
      scene.countFontFamily = this.state.scene.countFontFamily;
      scene.countFontSize = this.state.scene.countFontSize;
      scene.countColor = this.state.scene.countColor;
      scene.countBorder = this.state.scene.countBorder;
      scene.countBorderpx = this.state.scene.countBorderpx;
      scene.countBorderColor = this.state.scene.countBorderColor;
    });
    this.setState({sceneChanged: false});
  }

  onFullscreen() {
    if (this.state.scene != null) {
      this.setState({fullscreen: !this.state.fullscreen});
    } else {
      this.setState({fullscreen: false});
    }
  }

  onError(e: string) {
    this.setState({error: e});
  }

  onBeforeChangeScript(editor: any, data: any, value: any)  {
    const newValue = value;
    if (this.state.captionScript != newValue) {
      this.setState({captionScript: newValue, error: null, scriptChanged: true});
    }
  }

  onGutterClick(editor: any, clickedLine: number) {
    let lineNum = clickedLine - 1;
    const lines = this.state.captionScript.split('\n');
    for (let l = 0; l < clickedLine; l++) {
      const line = lines[l];
      if (line.trim().length == 0 || line[0] == '#' || line.toLowerCase().startsWith("storephrase ") ||
        timestampRegex.exec(line.split(" ")[0]) != null) lineNum--;
    }
    lineNum = Math.max(lineNum, 0);
    this.state.captionProgramJumpToHack.args = [lineNum];
    this.state.captionProgramJumpToHack.fire();
  }

  onChangeScene(sceneID: number) {
    if (sceneID == 0) {
      this.setState({scene: null, sceneChanged: false});
      return;
    }
    const scene = JSON.parse(JSON.stringify(this.props.scenes.find((s) => s.id == sceneID)));
    scene.overlayEnabled = false;
    scene.audioEnabled = false;
    scene.videoVolume = 0;
    scene.textEnabled = true;
    this.setState({scene: scene, sceneChanged: false});
  }

  getSceneName(id: string): string {
    if (id === "0") return "None";
    return this.props.scenes.find((s) => s.id.toString() === id).name;
  }

  onUpdateScene(scene: Scene, fn: (scene: Scene) => void) {
    const newScene = JSON.parse(JSON.stringify(scene))
    fn(newScene);
    this.setState({scene: newScene, sceneChanged: true});
  }

  goBack() {
    if (this.state.scriptChanged) {
      this.setState({openMenu: MO.error});
    } else {
      this.props.goBack();
    }
  }

  saveGoBack() {
    this.onSave();
    this.props.goBack();
  }

  onAddBlink() {
    this.onAddString("blink <TEXT> / <TEXT> / <TEXT>", true);
  }

  onAddCap() {
    this.onAddString("cap <TEXT>", true);
  }

  onAddBigCap() {
    this.onAddString("bigcap <TEXT>", true);
  }

  onAddCount() {
    this.onAddString("count <START> <END>", true);
  }

  onAddWait() {
    this.onAddString("wait <MILLISECONDS>", true);
  }

  onAddStorePhrase() {
    this.onAddString("storePhrase <TEXT>", true);
  }

  addAllSetters() {
    let newScript = this.state.captionScript;
    const lines = newScript.split('\n');
    if (lines.length == 0 || lines[lines.length - 1].length > 0) {
      newScript += "\n";
    }
    for (let setter of tupleSetters) {
      let property = setter.replace("set", "");
      property = property.charAt(0).toLowerCase() + property.slice(1);
      const defaultVal = (captionProgramDefaults as any)[property];
      newScript += setter + " " + defaultVal[0] + " " + defaultVal[1] + "\n";
    }
    newScript += "\n";
    for (let setter of stringSetters) {
      newScript += setter + " constant\n";
    }
    newScript += "\n";
    for (let setter of singleSetters) {
      let property = setter.replace("set", "");
      property = property.charAt(0).toLowerCase() + property.slice(1);
      const defaultVal = (captionProgramDefaults as any)[property];
      newScript += setter + " " + defaultVal + "\n";
    }
    this.setState({captionScript: newScript});
  }

  onAddSetter(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    if (input.value == "all") {
      this.addAllSetters();
    } else {
      const setter = input.value;
      if (tupleSetters.includes(setter)) {
        this.onAddTupleSetter(setter);
      } else if (singleSetters.includes(setter)) {
        this.onAddSingleSetter(setter);
      } else if (stringSetters.includes(setter)) {
        this.onAddStringSetter(setter);
      }
    }
  }

  onAddSingleSetter(setter: string) {
    let property = setter.replace("set", "");
    property = property.charAt(0).toLowerCase() + property.slice(1);
    const defaultVal = (captionProgramDefaults as any)[property];
    this.onAddString(setter + " " + defaultVal, true);
  }

  onAddTupleSetter(setter: string) {
    let property = setter.replace("set", "");
    property = property.charAt(0).toLowerCase() + property.slice(1);
    const defaultVal = (captionProgramDefaults as any)[property];
    this.onAddString(setter + " " + defaultVal[0] + " " + defaultVal[1], true);
  }

  onAddStringSetter(setter: string) {
    this.onAddString(setter + " constant", true);
  }

  onAddString(string: string, newLine = false) {
    let newScript = this.state.captionScript;
    if (newLine == true) {
      const lines = newScript.split('\n');
      if (lines.length == 0 || lines[lines.length - 1].length > 0) {
        newScript += "\n";
      }
    }
    newScript += string;
    this.setState({captionScript: newScript});
  }
}

export default withStyles(styles)(CaptionScriptor as any);