import * as React from "react";
import {remote} from "electron";
import wretch from "wretch";
import clsx from "clsx";
import fs from "fs";
import fontList from "font-list";
import SystemFonts from "system-font-families";

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');

import {
  AppBar,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Select,
  Slider,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FolderIcon from '@mui/icons-material/Folder';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import GetAppIcon from '@mui/icons-material/GetApp';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SaveIcon from '@mui/icons-material/Save';

import {CST, MO, RP} from "../../data/const";
import captionProgramDefaults, {CancelablePromise} from "../../data/utils";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import Player from "../player/Player";
import Config from "../../data/Config";
import SceneSelect from "../configGroups/SceneSelect";
import CaptionProgram from "../player/CaptionProgram";
import ChildCallbackHack from "../player/ChildCallbackHack";
import AudioCard from "../configGroups/AudioCard";
import FontOptions from "../library/FontOptions";
import CaptionScript, {FontSettingsI} from "../../data/CaptionScript";
import CodeMirror, {
  booleanSetters,
  colorSetters,
  singleSetters,
  stringSetters,
  timestampRegex,
  tupleSetters
} from "./CodeMirror";
import SceneGrid from "../../data/SceneGrid";

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
    display: 'grid',
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
  hidden: {
    opacity: 0,
  },
  openFileName: {
    marginLeft: 'auto',
    marginTop: theme.spacing(1.5),
    color: (theme.palette.text as any).hint,
  },
  menuDivider: {
    marginLeft: 'auto',
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
  codeMirrorWrapper: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%',
  },
  backdropTop: {
    zIndex: theme.zIndex.modal + 1,
  },
  backdropTopHighlight: {
    zIndex: theme.zIndex.modal + 1,
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid',
  },
  disable: {
    pointerEvents: 'none',
  },
  relative: {
    position: 'relative',
  }
});


class CaptionScriptor extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    openScript: CaptionScript,
    scenes: Array<Scene>,
    sceneGrids: Array<SceneGrid>,
    theme: Theme,
    tutorial: string,
    onAddFromLibrary(): void,
    getTags(source: string): Array<Tag>,
    goBack(): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    onUpdateLibrary(fn: (library: Array<CaptionScript>) => void): void,
  };

  readonly state = {
    captionScript: new CaptionScript({script: ""}),
    sceneScripts: null as Array<CaptionScript>,
    selectScript: "",
    scene: null as Scene,
    error: null as string,
    fullscreen: false,
    sceneChanged: false,
    scriptChanged: false,
    loadFromSceneError: false,
    openMenu: null as string,
    menuAnchorEl: null as any,
    captionProgramJumpToHack: new ChildCallbackHack(),
    codeMirrorAddHack: new ChildCallbackHack(),
    codeMirrorOverwriteHack: new ChildCallbackHack(),
    systemFonts: Array<string>(),
  };

  render() {
    const classes = this.props.classes;

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
      case MO.openLocal:
        menuName="Open";
        menuThen=this.onConfirmOpen.bind(this);
        break;
      case MO.openLibrary:
        menuName="Open";
        menuThen=this.onConfirmOpenFromLibrary.bind(this);
        break;
      case MO.load:
        menuName = "Load From Scene";
        menuThen = this.onOpenScriptSelect.bind(this)
        break;
    }

    let getTimestamp = undefined;
    if (this.state.scene && this.state.scene.audioEnabled) {
      getTimestamp = this.getTimestamp.bind(this);
    }

    return (
      <div className={classes.root}>
        <AppBar enableColorOnDark position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip disableInteractive title="Back" placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  className={classes.backButton}
                  onClick={this.goBack.bind(this)}
                  size="large">
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </div>

            <Typography component="h1" variant="h4" color="inherit" noWrap
                        className={classes.title}>
              {this.state.captionScript.url ? this.state.captionScript.url : "Caption Scriptor"}
            </Typography>

            <Tooltip disableInteractive title={this.state.fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <span style={this.state.scene == null ? { pointerEvents: "none" } : {}}>
                <IconButton
                  disabled={this.state.scene == null}
                  edge="start"
                  color="inherit"
                  aria-label={this.state.fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  onClick={this.onFullscreen.bind(this)}
                  size="large">
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
                {this.state.error == null && this.state.captionScript.script && this.state.captionScript.script.length > 0 && (
                  <div className={classes.statusMessage}>
                    <CheckCircleOutlineIcon className={classes.okIcon}/>
                  </div>
                )}
                {(!this.state.captionScript.script || this.state.captionScript.script.length == 0) && (
                  <div className={classes.statusMessage}>
                    <Typography component="div" variant="subtitle1" color="textPrimary">
                      Paste or type your script here.
                    </Typography>
                  </div>
                )}
                <CodeMirror
                  className={this.props.tutorial == CST.code ? classes.backdropTopHighlight : classes.codeMirrorWrapper}
                  onGutterClick={this.onGutterClick.bind(this)}
                  onUpdateScript={this.onUpdateScript.bind(this)}
                  addHack={this.state.codeMirrorAddHack}
                  overwriteHack={this.state.codeMirrorOverwriteHack}
                />
              </div>
              <div className={clsx(classes.menuGrid, this.state.fullscreen && classes.hidden)}>
                <Card className={classes.menuCard}>
                  <CardContent className={classes.menuCardContent}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} className={clsx(classes.menuGridButtons,
                        this.props.tutorial == CST.menu && classes.backdropTopHighlight,
                        this.props.tutorial == CST.menu && classes.disable)}>
                        <Tooltip disableInteractive title="New">
                          <IconButton onClick={this.onNew.bind(this)} size="large">
                            <InsertDriveFileIcon/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip disableInteractive title="Open">
                          <IconButton onClick={this.onOpenMenu.bind(this)} size="large">
                            <FolderIcon/>
                          </IconButton>
                        </Tooltip>
                        <Menu
                          id="open-menu"
                          elevation={1}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                          anchorEl={this.state.menuAnchorEl}
                          keepMounted
                          open={this.state.openMenu == MO.open}
                          onClose={this.onCloseDialog.bind(this)}>
                          <MenuItem onClick={this.onOpen.bind(this)}>Open File</MenuItem>
                          <MenuItem onClick={this.onOpenFromLibrary.bind(this)}>Open From Library</MenuItem>
                        </Menu>
                        <Tooltip disableInteractive title="Save">
                          <IconButton onClick={this.onSaveMenu.bind(this)} size="large">
                            <SaveIcon/>
                          </IconButton>
                        </Tooltip>
                        <Menu
                          id="save-menu"
                          elevation={1}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                          anchorEl={this.state.menuAnchorEl}
                          keepMounted
                          open={this.state.openMenu == MO.save}
                          onClose={this.onCloseDialog.bind(this)}>
                          <MenuItem disabled={!this.state.scriptChanged || (this.state.captionScript.url && this.state.captionScript.url.startsWith("http"))} onClick={this.onSave.bind(this)}>Save</MenuItem>
                          <MenuItem onClick={this.onSaveAs.bind(this)}>Save As</MenuItem>
                          <MenuItem disabled={!this.state.captionScript.url} onClick={this.onSaveToLibrary.bind(this)}>Save To Library</MenuItem>
                        </Menu>
                        <Divider orientation="vertical" flexItem className={classes.menuDivider} />
                        <Tooltip disableInteractive title="Load From Scene">
                          <span style={this.state.sceneScripts == null || !this.state.sceneScripts.length ? { pointerEvents: "none" } : {}}>
                            <IconButton
                              disabled={this.state.sceneScripts == null || !this.state.sceneScripts.length}
                              onClick={this.onLoadFromScene.bind(this)}
                              size="large">
                              {this.state.loadFromSceneError ? <ErrorOutlineIcon color={"error"}/> : <GetAppIcon/>}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12} className={clsx(classes.noPaddingTop, this.props.tutorial == CST.menu && classes.backdropTop)}>
                        <Divider variant={"fullWidth"}/>
                      </Grid>
                      <Grid item xs={12} className={clsx(this.props.tutorial == CST.menu && classes.backdropTopHighlight,
                        this.props.tutorial == CST.menu && classes.disable)}>
                        {this.state.scene == null && (
                          <Typography component="div" variant="subtitle1" color="textPrimary">
                            Select a Scene to start testing
                          </Typography>
                        )}
                        <SceneSelect
                          allScenes={this.props.scenes}
                          value={this.state.scene ? this.state.scene.id : 0}
                          getSceneName={this.getSceneName.bind(this)}
                          onChange={this.onChangeScene.bind(this)}
                        />
                      </Grid>
                      <Grid item xs={12} className={clsx(this.props.tutorial == CST.actions && classes.backdropTopHighlight
                        , this.props.tutorial == CST.actions && classes.disable)}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant={"h5"}>Actions</Typography>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"For each <TEXT> between slashes, show text for blinkDuration ms, then wait blinkDelay ms. When they are all done, wait blinkGroupDelay ms."}>
                              <Button className={classes.actionButton} onClick={this.onAddBlink.bind(this)} variant="outlined">blink</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"Show smaller <TEXT> for captionDuration ms, then wait captionDelay ms."}>
                              <Button className={classes.actionButton} onClick={this.onAddCap.bind(this)} variant="outlined">cap</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"Show bigger <TEXT> for captionDuration ms, then wait captionDelay ms."}>
                              <Button className={classes.actionButton} onClick={this.onAddBigCap.bind(this)} variant="outlined">bigcap</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"Count from <START> to <END> (<START> and <END> are whole numbers). Display each number for countDuration ms, then wait countDelay ms. When they are all done, wait countGroupDelay ms."}>
                              <Button className={classes.actionButton} onClick={this.onAddCount.bind(this)} variant="outlined">count</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"Wait <MILLISECONDS> ms"}>
                              <Button className={classes.actionButton} onClick={this.onAddWait.bind(this)} variant="outlined">wait</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"Advance to the next image"}>
                              <Button className={classes.actionButton} onClick={this.onAddAdvance.bind(this)} variant="outlined">advance</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"Play audio <ALIAS> at volume <VOLUME>"}>
                              <Button className={classes.actionButton} onClick={this.onAddPlayAudio.bind(this)} variant="outlined">playAudio</Button>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} className={clsx(this.props.tutorial == CST.actions && classes.backdropTop)}>
                        <Divider variant={"fullWidth"}/>
                      </Grid>
                      <Grid item xs={12} className={clsx(this.props.tutorial == CST.actions && classes.backdropTopHighlight, this.props.tutorial == CST.actions && classes.disable)}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant={"h5"}>Setters</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Select
                              variant="standard"
                              fullWidth
                              value={""}
                              onChange={this.onAddSetter.bind(this)}>
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
                              <Divider/>
                              {booleanSetters.map((s) =>
                                <MenuItem className={classes.setterButton} key={s} value={s}>{s}</MenuItem>
                              )}
                              {colorSetters.map((s) =>
                                  <MenuItem className={classes.setterButton} key={s} value={s}>{s}</MenuItem>
                              )}
                            </Select>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} className={clsx(this.props.tutorial == CST.actions && classes.backdropTop)}>
                        <Divider variant={"fullWidth"}/>
                      </Grid>
                      <Grid item xs={12} className={clsx(this.props.tutorial == CST.actions && classes.backdropTopHighlight, this.props.tutorial == CST.actions && classes.disable)}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant={"h5"}>Special</Typography>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"Stores an audio file to be used with playAudio"}>
                              <Button className={classes.storeButton} onClick={this.onAddStoreAudio.bind(this)} variant="outlined">storeAudio</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"Stores a phrase to be used with $RANDOM_PHRASE"}>
                              <Button className={classes.storeButton} onClick={this.onAddStorePhrase.bind(this)} variant="outlined">storePhrase</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"When running, is replaced with a random stored phrase"}>
                              <Button className={classes.keywordButton} onClick={this.onAddString.bind(this, "$RANDOM_PHRASE")} variant="outlined">$RANDOM_PHRASE</Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip disableInteractive title={"When running, is replaced with a random tag phrase based on the current source"}>
                              <Button className={classes.keywordButton} onClick={this.onAddString.bind(this, "$TAG_PHRASE")} variant="outlined">$TAG_PHRASE</Button>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider variant={"fullWidth"}/>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="inherit">
                          See <Link
                          href="#"
                          onClick={this.openLink.bind(this, "https://ififfy.github.io/flipflip/#/caption_script")}
                          underline="hover">documentation</Link> for help.
                        </Typography>
                      </Grid>
                    </Grid>
                    <div className={classes.fill}/>
                    {this.state.scene && !this.state.fullscreen && (
                      <AudioCard
                        sidebar
                        startPlaying
                        shorterSeek
                        showMsTimestamp
                        scene={this.state.scene}
                        onPlaying={this.onPlaying.bind(this)}
                        onUpdateScene={this.onUpdateScene.bind(this)}/>
                    )}
                    <Typography variant="caption" component="div" color="textSecondary">
                      Script Opacity: {this.state.captionScript.opacity}%
                    </Typography>
                    <Slider
                        min={0}
                        max={100}
                        defaultValue={this.state.captionScript.opacity}
                        onChangeCommitted={this.onSliderChange.bind(this, 'opacity')}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v: any) => v + "%"}
                        aria-labelledby="opacity-slider"/>
                  </CardContent>
                </Card>
              </div>
              <div className={clsx(classes.playerGrid, this.props.tutorial == CST.player && classes.backdropTopHighlight)}>
                {this.state.scene && (
                  <Player
                    config={this.props.config}
                    scene={this.state.scene}
                    gridView={!this.state.fullscreen}
                    captionScale={this.state.fullscreen ? 1 : 0.3753}
                    scenes={this.props.scenes}
                    sceneGrids={this.props.sceneGrids}
                    theme={this.props.theme}
                    getTags={this.props.getTags.bind(this)}
                    goBack={this.props.goBack.bind(this)}
                    onCaptionError={this.onError.bind(this)}
                    onUpdateScene={this.onUpdateScene.bind(this)}
                    captionProgramJumpToHack={this.state.captionProgramJumpToHack}
                    tutorial={null}
                    getCurrentTimestamp={this.state.fullscreen ? undefined : getTimestamp}
                    cache={() => {}}
                    setCount={() => {}}
                    systemMessage={() => {}}
                  />
                )}
                {this.state.error != null && (
                  <ErrorOutlineIcon className={classes.errorIcon} color="error" />
                )}
                {!this.state.scene && this.state.captionScript.script && this.state.captionScript.script.length > 0 && (
                  <div className={clsx(!this.state.fullscreen && classes.relative)}>
                    <CaptionProgram
                      captionScript={this.state.captionScript}
                      repeat={RP.one}
                      scale={0.35}
                      singleTrack={true}
                      getTags={this.props.getTags.bind(this)}
                      goBack={this.props.goBack.bind(this)}
                      playNextScene={() => {}}
                      timeToNextFrame={null}
                      currentAudio={null}
                      currentImage={null}
                      jumpToHack={this.state.captionProgramJumpToHack}
                      onError={this.onError.bind(this)}/>
                  </div>
                )}
              </div>
              <div className={clsx(classes.fontGrid, this.state.fullscreen && classes.hidden, this.props.tutorial == CST.fonts && classes.backdropTopHighlight)}>
                <Card className={classes.fontCard}>
                  <CardContent>
                    <Grid item xs={12}>
                      <FontOptions
                        name={"Blink"}
                        options={this.state.captionScript.blink}
                        systemFonts={this.state.systemFonts}
                        onUpdateOptions={this.onUpdateOptions.bind(this, 'blink')}
                      />
                      <Divider className={classes.fontDivider}/>
                      <FontOptions
                        name={"Caption"}
                        options={this.state.captionScript.caption}
                        systemFonts={this.state.systemFonts}
                        onUpdateOptions={this.onUpdateOptions.bind(this, 'caption')}
                      />
                      <Divider className={classes.fontDivider}/>
                      <FontOptions
                        name={"Big Caption"}
                        options={this.state.captionScript.captionBig}
                        systemFonts={this.state.systemFonts}
                        onUpdateOptions={this.onUpdateOptions.bind(this, 'captionBig')}
                      />
                      <Divider className={classes.fontDivider}/>
                      <FontOptions
                        name={"Count"}
                        options={this.state.captionScript.count}
                        systemFonts={this.state.systemFonts}
                        onUpdateOptions={this.onUpdateOptions.bind(this, 'count')}
                      />
                    </Grid>
                  </CardContent>
                </Card>
              </div>
            </Container>
          </div>
        </main>

        <Dialog
          open={this.state.openMenu == MO.select}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="load-title"
          aria-describedby="load-description">
          <DialogTitle id="load-title">Load From Scene</DialogTitle>
          <DialogContent>
            <DialogContentText id="load-description">
              Choose a script to load:
            </DialogContentText>
            <Select
              variant="standard"
              fullWidth
              value={this.state.selectScript}
              onChange={this.onChangeSelectScript.bind(this)}>
              {this.state.sceneScripts && this.state.sceneScripts.map((s, i) => 
                <MenuItem key={i} value={s.url}>{s.url}</MenuItem>
              )}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button disabled={!this.state.selectScript.length} onClick={this.onConfirmLoadFromScene.bind(this)} color="primary">
              Load Script
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!menuName && !!menuThen}
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

  _currentTimestamp: number = null;
  onPlaying(position: number, duration: number) {
    this._currentTimestamp = position;
  }
  getTimestamp() {
    return this._currentTimestamp;
  }

  onCloseDialog() {
    this.setState({openMenu: null, menuAnchorEl: null, drawerOpen: false, selectScript: ""});
  }

  _promise: CancelablePromise = null;
  componentDidMount() {
    this._currentTimestamp = 0;
    window.addEventListener('keydown', this.onKeyDown, false);
    // Define system fonts
    if (process.platform == "darwin") {
      this._promise = new CancelablePromise((resolve, reject) => {
        new SystemFonts().getFonts().then((res: Array<string>) => {
            if (!this._promise.hasCanceled) {
              this.setState({systemFonts: res});
            }
          },
          (err: string) => {
            console.error(err);
          }
        );
      });
    } else {
      this._promise = new CancelablePromise((resolve, reject) => {
        fontList.getFonts().then((res: Array<string>) => {
            res = res.map((r) => {
              if (r.startsWith("\"") && r.endsWith("\"")) {
                return r.substring(1, r.length - 1);
              } else {
                return r;
              }
            })
            if (!this._promise.hasCanceled) {
              this.setState({systemFonts: res});
            }
          },
          (err: string) => {
            console.error(err);
          }
        );
      });
    }
    if (this.props.openScript) {
      if (this.props.openScript.script) {
        this.state.codeMirrorOverwriteHack.args = [this.props.openScript.script];
        this.state.codeMirrorOverwriteHack.fire();
        this.setState({captionScript: this.props.openScript, scriptChanged: false});
      } else {
        wretch(this.props.openScript.url)
          .get()
          .text(data => {
            this.state.codeMirrorOverwriteHack.args = [data];
            this.state.codeMirrorOverwriteHack.fire();
            this.setState({captionScript: this.props.openScript, scriptChanged: false});
          });
      }
    }
  }

  componentWillUnmount() {
    this._currentTimestamp = null;
    window.removeEventListener('keydown', this.onKeyDown);
    if (this._promise != null) {
      this._promise.cancel();
    }
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
    this.setState({captionScript: new CaptionScript({script: ""}), error: null, scriptChanged: false});
    this.state.codeMirrorOverwriteHack.args = [""];
    this.state.codeMirrorOverwriteHack.fire();
  }

  onOpenMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.open});
  }

  onOpen() {
    this.onCloseDialog();
    if (this.state.scriptChanged) {
      this.setState({openMenu: MO.openLocal});
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
        this.state.codeMirrorOverwriteHack.args = [data];
        this.state.codeMirrorOverwriteHack.fire();
        this.setState({captionScript: new CaptionScript({url: url}), scriptChanged: false});
      });
  }

  onOpenFromLibrary() {
    this.onCloseDialog();
    if (this.state.scriptChanged) {
      this.setState({openMenu: MO.openLibrary});
    } else {
      this.onConfirmOpenFromLibrary();
    }
  }

  onConfirmOpenFromLibrary() {
    this.onCloseDialog();
    this.props.onAddFromLibrary();
  }

  onSaveThen(then: () => void) {
    if (this.onSave()) {
      then();
    }
  }

  onSaveMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.save});
  }

  onSave() {
    this.onCloseDialog();
    if (!this.state.captionScript.url) {
      return this.onSaveAs();
    } else {
      if (!this.state.captionScript.url.startsWith("http")) {
        fs.writeFileSync(this.state.captionScript.url, this.state.captionScript.script);
        this.setState({scriptChanged: false});
        return true;
      } else {
        return false;
      }
    }
  }

  onSaveAs() {
    this.onCloseDialog();
    remote.dialog.showSaveDialog(remote.getCurrentWindow(),
      {filters: [{name: 'Text Document', extensions: ['txt']}], defaultPath: this.state.captionScript.url}, (filePath) => {
        if (filePath != null) {
          fs.writeFileSync(filePath, this.state.captionScript.script);
          const setURL = (script: CaptionScript) => {
            script.url = filePath;
            return script;
          }
          this.setState({captionScript: setURL(this.state.captionScript), scriptChanged: false});
          return true;
        } else {
          return false;
        }
      });
  }

    onSaveToLibrary() {
    this.onCloseDialog();
    this.onSave();
    this.props.onUpdateLibrary((library) => {
      const script = library.find((s) => s.url == this.state.captionScript.url);
      if (script) {
        script.blink = this.state.captionScript.blink;
        script.caption = this.state.captionScript.caption;
        script.captionBig = this.state.captionScript.captionBig;
        script.count = this.state.captionScript.count;
      } else {
        let id = library.length + 1;
        library.forEach((s) => {
          id = Math.max(s.id + 1, id);
        });
        const newScript = JSON.parse(JSON.stringify(this.state.captionScript));
        newScript.id = id;
        newScript.script = null;
        library.push(newScript);
      }
    })
  }

  onLoadFromScene() {
    if (!this.state.sceneScripts.length || this.state.loadFromSceneError)  return;
    if (this.state.scriptChanged) {
      this.setState({openMenu: MO.load});
    } else {
      this.onOpenScriptSelect();
    }
  }

  onOpenScriptSelect() {
    const defScript = this.state.sceneScripts != null && this.state.sceneScripts.length ? this.state.sceneScripts[0].url : "";
    this.setState({openMenu: MO.select, selectScript: defScript});
  }

  onChangeSelectScript(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({selectScript: input.value});
  }

  onConfirmLoadFromScene() {
    const error = (error: any) => {
      console.error(error);
      this.setState({loadFromSceneError: true});
      setTimeout(() => {this.setState({loadFromSceneError: false});}, 3000);
    }

    const script = JSON.parse(JSON.stringify(this.state.sceneScripts.find((s) => s.url == this.state.selectScript)));
    this.onCloseDialog();
    wretch(script.url)
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
        this.state.codeMirrorOverwriteHack.args = [data];
        this.state.codeMirrorOverwriteHack.fire();
        this.setState({captionScript: script, scriptChanged: false});
      });
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

  onUpdateScript(script: string, changed = false) {
    const newScript = JSON.parse(JSON.stringify(this.state.captionScript));
    newScript.blink = this.state.captionScript.blink;
    newScript.caption = this.state.captionScript.caption;
    newScript.captionBig = this.state.captionScript.captionBig;
    newScript.count = this.state.captionScript.count;
    newScript.script = script;
    if (this.state.scene) {
      const newScene = JSON.parse(JSON.stringify(this.state.scene));
      newScene.scriptPlaylists = [{scripts: [newScript], shuffle: false, repeat: RP.one}];
      this.setState({scene: newScene, captionScript: newScript, error: null, scriptChanged: changed ? true : this.state.scriptChanged});
    } else {
      this.setState({captionScript: newScript, error: null, scriptChanged: changed ? true : this.state.scriptChanged});
    }
  }

  onGutterClick(editor: any, clickedLine: number) {
    let lineNum = clickedLine - 1;
    const lines = this.state.captionScript.script.split('\n');
    for (let l = 0; l < clickedLine; l++) {
      const line = lines[l];
      if (line.trim().length == 0 || line[0] == '#' || line.toLowerCase().startsWith("storephrase ") ||
        line.toLowerCase().startsWith("storeaudio ") ||
        timestampRegex.exec(line.split(" ")[0]) != null) lineNum--;
    }
    lineNum = Math.max(lineNum, 0);
    this.state.captionProgramJumpToHack.args = [lineNum];
    this.state.captionProgramJumpToHack.fire();
  }

  onChangeScene(sceneID: number) {
    if (sceneID == 0) {
      this.setState({scene: null, sceneScripts: null, sceneChanged: false});
      return;
    }
    const scene = JSON.parse(JSON.stringify(this.props.scenes.find((s) => s.id == sceneID)));
    const originalPlaylists = scene.scriptPlaylists;
    scene.audioEnabled = false;
    scene.videoVolume = 0;
    scene.textEnabled = true;
    scene.scriptPlaylists = [{scripts: [this.state.captionScript], shuffle: false, repeat: RP.one}];
    const originalScripts = new Array<CaptionScript>();
    for (let playlist of originalPlaylists) {
      for (let script of playlist.scripts) {
        originalScripts.push(script);
      }
    }
    this.setState({scene: scene, sceneScripts: originalScripts, sceneChanged: false});
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
    if (this.state.fullscreen) {
      this.onFullscreen();
    } else if (this.state.scriptChanged) {
      this.setState({openMenu: MO.error});
    } else {
      this.props.goBack();
    }
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

  onAddAdvance() {
    this.onAddString("advance", true);
  }

  onAddPlayAudio() {
    this.onAddString("playAudio <ALIAS> <VOLUME>", true);
  }

  onAddStorePhrase() {
    this.onAddString("storePhrase <TEXT>", true);
  }

  onAddStoreAudio() {
    this.onAddString("storeAudio <PATH> <ALIAS>", true);
  }

  addAllSetters() {
    let addString = "";
    for (let setter of tupleSetters) {
      let property = setter.replace("set", "");
      property = property.charAt(0).toLowerCase() + property.slice(1);
      const defaultVal = (captionProgramDefaults as any)[property];
      addString += setter + " " + defaultVal[0] + " " + defaultVal[1] + "\n";
    }
    addString += "\n";
    for (let setter of stringSetters) {
      addString += setter + " constant\n";
    }
    addString += "\n";
    for (let setter of singleSetters) {
      let property = setter.replace("set", "");
      property = property.charAt(0).toLowerCase() + property.slice(1);
      const defaultVal = (captionProgramDefaults as any)[property];
      addString += setter + " " + defaultVal + "\n";
    }
    addString += "\n";
    for (let setter of booleanSetters) {
      addString += setter + " false\n";
    }
    for (let setter of colorSetters) {
      addString += setter + " 0 #FFFFFF\n";
    }
    this.onAddString(addString, true);
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
      } else if (booleanSetters.includes(setter)) {
        this.onAddBooleanSetter(setter);
      } else if (colorSetters.includes(setter)) {
        this.onAddColorSetter(setter);
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

  onAddBooleanSetter(setter: string) {
    this.onAddString(setter + " false", true);
  }

  onAddColorSetter(setter: string) {
    this.onAddString(setter + " 0 #FFFFFF", true);
  }

  onAddString(string: string, newLine = false) {
    this.state.codeMirrorAddHack.args = [string, newLine];
    this.state.codeMirrorAddHack.fire();
  }

  onUpdateOptions(property: string, fn: (options: FontSettingsI) => void) {
    const script = JSON.parse(JSON.stringify(this.state.captionScript));
    const newOptions = JSON.parse(JSON.stringify((script as any)[property]));
    fn(newOptions);
    (script as any)[property] = newOptions;
    if (this.state.scene) {
      const newScene = JSON.parse(JSON.stringify(this.state.scene));
      newScene.scriptPlaylists = [{scripts: [script], shuffle: false, repeat: RP.one}];
      this.setState({scene: newScene, captionScript: script, error: null, scriptChanged: true});
    } else {
      this.setState({captionScript: script, error: null, scriptChanged: true});
    }
  }

  onSliderChange(key: string, e: MouseEvent, value: number) {
    const script = JSON.parse(JSON.stringify(this.state.captionScript));
    (script as any)[key] = value;
    if (this.state.scene) {
      const newScene = JSON.parse(JSON.stringify(this.state.scene));
      newScene.scriptPlaylists = [{scripts: [script], shuffle: false, repeat: RP.one}];
      this.setState({scene: newScene, captionScript: script, error: null, scriptChanged: true});
    } else {
      this.setState({captionScript: script});
    }
  }

  openLink(url: string) {
    remote.shell.openExternal(url);
  }
}

(CaptionScriptor as any).displayName="CaptionScriptor";
export default withStyles(styles)(CaptionScriptor as any);