import * as React from "react";
import {clipboard, nativeImage, remote} from "electron";
const {getCurrentWindow, Menu, MenuItem, app} = remote;
import clsx from "clsx";
import fileURL from "file-url";
import fs from "fs";
import wretch from "wretch";

import {
  AppBar, Button, Card, CardActionArea, CardContent, createStyles, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Divider, Drawer, Accordion, AccordionDetails, AccordionSummary, Grid,
  IconButton, Link, Theme, Toolbar, Tooltip, Typography, withStyles, Fab
} from "@material-ui/core";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ForwardIcon from '@material-ui/icons/Forward';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";

import {createMainMenu, createMenuTemplate} from "../../../main/MainMenu";
import {PT, ST} from "../../data/const";
import {getCachePath, urlToPath} from "../../data/utils";
import {getSourceType} from "./Scrapers";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import ChildCallbackHack from "./ChildCallbackHack";
import SceneOptionCard from "../configGroups/SceneOptionCard";
import ImageVideoCard from "../configGroups/ImageVideoCard";
import ZoomMoveCard from "../configGroups/ZoomMoveCard";
import CrossFadeCard from "../configGroups/CrossFadeCard";
import StrobeCard from "../configGroups/StrobeCard";
import AudioCard from "../configGroups/AudioCard";
import TextCard from "../configGroups/TextCard";
import VideoCard from "../configGroups/VideoCard";
import VideoControl from "./VideoControl";
import FadeIOCard from "../configGroups/FadeIOCard";
import PanningCard from "../configGroups/PanningCard";
import Audio from "../../data/Audio";
import SceneGrid from "../../data/SceneGrid";

const drawerWidth = 340;

const hexToRGB = (h: string) => {
  let r = "0", g = "0", b = "0";

  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

    // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return "rgb("+ +r + "," + +g + "," + +b + ", 0.6)";
}

const styles = (theme: Theme) => createStyles({
  hoverBar: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
    opacity: 0,
    height: theme.spacing(5),
    width: '100%',
    ... theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    height: theme.spacing(8),
    marginTop: -theme.spacing(8) - 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarHover: {
    marginTop: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
    flexBasis: '20%',
  },
  headerRight: {
    flexBasis: '20%',
    justifyContent: 'flex-end',
    display: 'flex',
  },
  drawerToolbar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    ...theme.mixins.toolbar,
  },
  drawer: {
    zIndex: theme.zIndex.drawer,
    width: drawerWidth,
    marginLeft: -drawerWidth - 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  drawerHover: {
    marginLeft: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  hoverDrawer: {
    zIndex: theme.zIndex.drawer,
    position: 'absolute',
    opacity: 0,
    width: theme.spacing(5),
    height: '100%',
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: '100vh',
    width: 0,
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperHover: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  tagDrawer: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
  },
  tagDrawerPaper: {
    transform: 'scale(0)',
    transformOrigin: 'bottom left',
    backgroundColor: hexToRGB(theme.palette.background.default),
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  tagDrawerPaperHover: {
    transform: 'scale(1)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  hoverTagDrawer: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
    bottom: 0,
    opacity: 0,
    width: '100%',
    height: theme.spacing(5),
  },
  tagList: {
    padding: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  tag: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  tagContent: {
    padding: theme.spacing(1),
  },
  selectedTag: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  wordWrap: {
    wordWrap: 'break-word',
  },
  backdropTop: {
    zIndex: theme.zIndex.modal + 1,
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid',
  },
  disable: {
    pointerEvents: 'none',
  }
});

class PlayerBars extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    hasStarted: boolean,
    historyPaths: Array<any>,
    historyOffset: number,
    imagePlayerAdvanceHacks: Array<Array<ChildCallbackHack>>,
    imagePlayerDeleteHack: ChildCallbackHack,
    isEmpty: boolean,
    isPlaying: boolean,
    mainVideo: HTMLVideoElement,
    overlayVideos: Array<Array<HTMLVideoElement>>,
    persistAudio: boolean,
    persistText: boolean,
    recentPictureGrid: boolean,
    scene: Scene,
    scenes: Array<Scene>,
    sceneGrids: Array<SceneGrid>,
    title: string,
    tutorial: string,
    goBack(): void,
    historyBack(): void,
    historyForward(): void,
    navigateTagging(offset: number): void,
    onRecentPictureGrid(): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    playNextScene(): void,
    play(): void,
    pause(): void,
    setCurrentAudio(audio: Audio): void,
    allTags?: Array<Tag>,
    tags?: Array<Tag>,
    blacklistFile?(sourceURL: string, fileToBlacklist: string): void,
    goToTagSource?(source: LibrarySource): void,
    goToClipSource?(source: LibrarySource): void,
    playTrack?(url: string): void,
    onPlaying?(position: number, duration: number): void,
    toggleTag?(sourceID: number, tag: Tag): void,
    inheritTags?(sourceID: number): void,
  };

  readonly state = {
    appBarHover: false,
    drawerHover: false,
    tagDrawerHover: false,
    blacklistSource: null as string,
    blacklistFile: null as string,
    deletePath: null as string,
    deleteError: null as string,
  };

  _interval: NodeJS.Timer = null;
  _appBarTimeout: any = null;
  _drawerTimeout: any = null;
  _tagDrawerTimeout: any = null;

  render() {
    const classes = this.props.classes;

    const canGoBack = this.props.historyOffset > -(this.props.historyPaths.length - 1);
    const canGoForward = this.props.historyOffset < 0;
    const tagNames = this.props.tags ? this.props.tags.map((t) => t.name) : [];
    let clipValue = null;
    let clipID: number = null;
    let source = null;
    if (this.props.mainVideo && this.props.mainVideo.hasAttribute("start") && this.props.mainVideo.hasAttribute("end")) {
      clipValue = [parseInt(this.props.mainVideo.getAttribute("start")), parseInt(this.props.mainVideo.getAttribute("end"))]
      clipID = parseInt(this.props.mainVideo.getAttribute("clip"));
      const sourceURL = this.props.mainVideo.getAttribute("source");
      source = this.props.scene.sources.find((s) => s.url == sourceURL);
    }

    return(
      <React.Fragment>
        <div
          className={classes.hoverBar}
          onMouseEnter={this.onMouseEnterAppBar.bind(this)}
          onMouseLeave={this.onMouseLeaveAppBar.bind(this)}/>

        <AppBar
          position="absolute"
          onMouseEnter={this.onMouseEnterAppBar.bind(this)}
          onMouseLeave={this.onMouseLeaveAppBar.bind(this)}
          className={clsx(classes.appBar, (this.props.tutorial == PT.toolbar || !this.props.hasStarted || this.props.isEmpty || this.props.recentPictureGrid || this.state.appBarHover) && classes.appBarHover, this.props.tutorial == PT.toolbar && clsx(classes.backdropTop, classes.highlight))}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip title="Back" placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  onClick={this.props.goBack.bind(this)}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </div>

            <Tooltip title={this.props.title}>
              <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.title}>
                {this.props.title}
              </Typography>
            </Tooltip>

            <div className={classes.headerRight}>
              <Tooltip title="Toggle Fullscreen">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="FullScreen"
                  onClick={this.toggleFull.bind(this)}>
                  <FullscreenIcon fontSize="large"/>
                </IconButton>
              </Tooltip>
              <Divider component="div" orientation="vertical" style={{height: 48, margin: '0 14px 0 3px'}}/>
              <IconButton
                disabled={!canGoBack}
                edge="start"
                color="inherit"
                aria-label="Backward"
                onClick={this.historyBack.bind(this)}>
                <ForwardIcon fontSize="large" style={{transform: 'rotate(180deg)'}}/>
              </IconButton>
              <IconButton
                edge="start"
                color="inherit"
                aria-label={this.props.isPlaying ? "Pause" : "Play"}
                onClick={this.setPlayPause.bind(this, !this.props.isPlaying)}>
                {this.props.isPlaying ? <PauseIcon fontSize="large"/> : <PlayArrowIcon fontSize="large"/>}
              </IconButton>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Forward"
                onClick={this.historyForward.bind(this)}>
                <ForwardIcon fontSize="large" style={canGoForward ? {} : {color: 'rgba(255, 255, 255, 0.3)', backgroundColor: 'transparent'}}/>
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>

        {this.props.hasStarted && !this.props.isEmpty && !this.props.recentPictureGrid && (
          <React.Fragment>
            <div
              className={classes.hoverDrawer}
              onMouseEnter={this.onMouseEnterDrawer.bind(this)}
              onMouseLeave={this.onMouseLeaveDrawer.bind(this)}/>

            <Drawer
              variant="permanent"
              className={clsx(classes.drawer, (this.props.tutorial == PT.sidebar || this.state.drawerHover) && classes.drawerHover)}
              classes={{paper: clsx(classes.drawerPaper, (this.props.tutorial == PT.sidebar || this.state.drawerHover) && classes.drawerPaperHover, this.props.tutorial == PT.toolbar && clsx(classes.backdropTop, classes.highlight))}}
              open={this.props.tutorial == PT.sidebar || this.state.drawerHover}
              onMouseEnter={this.onMouseEnterDrawer.bind(this)}
              onMouseLeave={this.onMouseLeaveDrawer.bind(this)}>
              <div className={classes.drawerToolbar}>
                <Typography variant="h4">
                  Settings
                </Typography>
              </div>

              {!this.props.scene.audioScene && (
                <React.Fragment>
                  {(this.props.mainVideo != null || this.props.overlayVideos.find((a) => a != null) != null) && (
                    <Accordion TransitionProps={{ unmountOnExit: false }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                      >
                        <Typography>Video Controls</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <VideoCard
                          scene={this.props.scene}
                          otherScenes={this.props.scene.overlays.map((o) => this.getScene(o.sceneID))}
                          isPlaying={this.props.isPlaying}
                          mainVideo={this.props.mainVideo}
                          mainClip={source ? source.clips.find((c) => c.id == clipID) : null}
                          mainClipValue={clipValue ? clipValue : null}
                          otherVideos={this.props.overlayVideos}
                          imagePlayerAdvanceHacks={this.props.imagePlayerAdvanceHacks}
                          onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Scene Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <SceneOptionCard
                        sidebar
                        allScenes={this.props.scenes}
                        allSceneGrids={this.props.sceneGrids}
                        isTagging={this.props.tags != null}
                        scene={this.props.scene}
                        onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Image/Video Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ImageVideoCard
                        sidebar
                        isPlayer
                        isConfig={false}
                        scene={this.props.scene}
                        onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Zoom/Move</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ZoomMoveCard
                        sidebar
                        scene={this.props.scene}
                        easingControls={this.props.config.displaySettings.easingControls}
                        onUpdateScene={this.props.onUpdateScene.bind(this)} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Cross-Fade</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <CrossFadeCard
                        sidebar
                        scene={this.props.scene}
                        easingControls={this.props.config.displaySettings.easingControls}
                        onUpdateScene={this.props.onUpdateScene.bind(this)} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Strobe</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <StrobeCard
                        sidebar
                        scene={this.props.scene}
                        easingControls={this.props.config.displaySettings.easingControls}
                        onUpdateScene={this.props.onUpdateScene.bind(this)} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Fade In/Out</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FadeIOCard
                        sidebar
                        scene={this.props.scene}
                        easingControls={this.props.config.displaySettings.easingControls}
                        onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Panning</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <PanningCard
                        sidebar
                        scene={this.props.scene}
                        easingControls={this.props.config.displaySettings.easingControls}
                        onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                    </AccordionDetails>
                  </Accordion>
                </React.Fragment>
              )}

              <Accordion defaultExpanded={this.props.scene.audioScene} TransitionProps={{ unmountOnExit: !this.props.scene.audioEnabled && this.props.scene.nextSceneID === 0 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>Audio Tracks</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <AudioCard
                    sidebar
                    scene={this.props.scene}
                    scenePaths={this.props.historyPaths}
                    startPlaying
                    persist={this.props.persistAudio}
                    onUpdateScene={this.props.onUpdateScene.bind(this)}
                    goBack={this.props.goBack.bind(this)}
                    orderAudioTags={this.orderAudioTags.bind(this)}
                    onPlaying={this.props.onPlaying}
                    playTrack={this.props.playTrack}
                    playNextScene={this.props.playNextScene}
                    setCurrentAudio={this.props.setCurrentAudio.bind(this)}/>
                </AccordionDetails>
              </Accordion>

              {!this.props.scene.audioScene && !this.props.persistText && (
                <Accordion TransitionProps={{ unmountOnExit: true }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>Text Overlay</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextCard
                      sidebar
                      scene={this.props.scene}
                      onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                  </AccordionDetails>
                </Accordion>
              )}
            </Drawer>
          </React.Fragment>
        )}

        {this.props.hasStarted && this.props.allTags && (
          <React.Fragment>
            <div
              className={classes.hoverTagDrawer}
              onMouseEnter={this.onMouseEnterTagDrawer.bind(this)}
              onMouseLeave={this.onMouseLeaveTagDrawer.bind(this)}/>

            <Drawer
              variant="permanent"
              anchor="bottom"
              className={classes.tagDrawer}
              classes={{paper: clsx(classes.tagDrawerPaper, this.state.tagDrawerHover && classes.tagDrawerPaperHover)}}
              open={this.state.tagDrawerHover}
              onMouseEnter={this.onMouseEnterTagDrawer.bind(this)}
              onMouseLeave={this.onMouseLeaveTagDrawer.bind(this)}>
              <Grid container alignItems="center">
                <Grid item xs>
                  <div className={classes.tagList}>
                    {this.props.allTags.map((tag) =>
                      <Card className={clsx(classes.tag, tagNames && tagNames.includes(tag.name) && classes.selectedTag)} key={tag.id}>
                        <CardActionArea onClick={this.props.toggleTag.bind(this, this.props.scene.libraryID, tag)}>
                          <CardContent className={classes.tagContent}>
                            <Typography component="h6" variant="body2">
                              {tag.name}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    )}
                  </div>
                </Grid>
                {(this.props.inheritTags && (!tagNames || tagNames.length == 0) && this.props.scene.sources[0].clips && this.props.scene.sources[0].clips.find((c) => c.tags && c.tags.length > 0) != null) && (
                  <Grid item className={classes.tagButtons}>
                    <Tooltip title="Inherit Clip Tags">
                      <Fab
                        color="primary"
                        size="small"
                        onClick={this.props.inheritTags.bind(this, this.props.scene.libraryID)}>
                        <SystemUpdateAltIcon/>
                      </Fab>
                    </Tooltip>
                  </Grid>
                )}
                <Grid item xs={12}>
                  {this.props.scene.sources.length == 1 && getSourceType(this.props.scene.sources[0].url) == ST.video && (
                    <VideoControl
                      video={this.props.mainVideo}
                      clip={source ? source.clips.find((c) => c.id == clipID) : null}
                      clipValue={clipValue ? clipValue : null}
                      useHotkeys
                      onChangeVolume={() => {}}/>
                  )}
                </Grid>
              </Grid>

            </Drawer>
          </React.Fragment>
        )}

        <Dialog
          open={!!this.state.blacklistFile}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="blacklist-title"
          aria-describedby="blacklist-description">
          <DialogTitle id="blacklist-title">Blacklist File</DialogTitle>
          <DialogContent>
            <DialogContentText id="blacklist-description">
              Are you sure you want to blacklist <Link className={classes.wordWrap} href="#" onClick={this.openLink.bind(this, this.state.blacklistFile)}>{this.state.blacklistFile}</Link> ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishBlacklistFile.bind(this)} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!this.state.deletePath}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="delete-title"
          aria-describedby="delete-description">
          <DialogTitle id="delete-title">Delete File</DialogTitle>
          <DialogContent>
            {this.state.deletePath && (
              <DialogContentText id="delete-description">
                Are you sure you want to delete <Link className={classes.wordWrap} href="#" onClick={this.openLink.bind(this, this.state.deletePath)}>{this.state.deletePath}</Link>
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishDeletePath.bind(this)} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!this.state.deleteError}
          onClose={this.onCloseDialog.bind(this)}
          aria-describedby="delete-error-description">
          <DialogContent>
            <DialogContentText className={classes.wordWrap} id="delete-error-description">
              {this.state.deleteError}
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.setAlwaysOnTop(this.props.config.displaySettings.alwaysOnTop);
    this.setMenuBarVisibility(this.props.config.displaySettings.showMenu);
    this.setFullscreen(this.props.config.displaySettings.fullScreen);

    window.addEventListener('contextmenu', this.showContextMenu, false);
    window.addEventListener('keydown', this.onKeyDown, false);
    if (this.props.tags == null) {
      window.addEventListener('wheel', this.onScroll, false);
    }
    this.buildMenu();
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    this._interval = null;
    clearTimeout(this._appBarTimeout);
    clearTimeout(this._drawerTimeout);
    clearTimeout(this._tagDrawerTimeout);
    this._appBarTimeout = null;
    this._drawerTimeout = null;
    this._tagDrawerTimeout = null;
    createMainMenu(Menu, createMenuTemplate(app));
    window.removeEventListener('contextmenu', this.showContextMenu);
    window.removeEventListener('keydown', this.onKeyDown);
    if (this.props.tags == null) {
      window.removeEventListener('wheel', this.onScroll);
    }
  }

  onScroll = (e: WheelEvent) => {
    if (this.props.recentPictureGrid || !this.props.onUpdateScene || this.state.drawerHover) return;
    const volumeChange = (e.deltaY / 100) * -5;
    let newVolume = parseInt(this.props.scene.videoVolume as any) + volumeChange;
    if (newVolume < 0) {
      newVolume = 0;
    } else if (newVolume > 100) {
      newVolume = 100;
    }
    if (this.props.mainVideo) {
      this.props.mainVideo.volume = newVolume / 100;
    }
    this.props.onUpdateScene(this.props.scene, (s) => s.videoVolume = newVolume);
  }

  getScene(id: number): Scene | SceneGrid {
    if (id == null) return null;
    if (id.toString().startsWith('999')) {
      return this.props.sceneGrids.find((s) => s.id.toString() == id.toString().replace('999',''));
    } else {
      return this.props.scenes.find((s) => s.id == id);
    }
  }

  openLink(url: string) {
    remote.shell.openExternal(url);
  }

  onMouseEnterAppBar() {
    clearTimeout(this._appBarTimeout);
    this.setState({appBarHover: true});
  }

  closeAppBar() {
    this.setState({appBarHover: false});
  }

  onMouseLeaveAppBar() {
    clearTimeout(this._appBarTimeout);
    this._appBarTimeout = setTimeout(this.closeAppBar.bind(this), 1000);
  }

  onMouseEnterDrawer() {
    clearTimeout(this._drawerTimeout);
    this.setState({drawerHover: true});
  }

  closeDrawer() {
    this.setState({drawerHover: false});
  }

  onMouseLeaveDrawer() {
    clearTimeout(this._drawerTimeout);
    this._drawerTimeout = setTimeout(this.closeDrawer.bind(this), 1000);
  }

  onMouseEnterTagDrawer() {
    clearTimeout(this._tagDrawerTimeout);
    this.setState({tagDrawerHover: true});
  }

  closeTagDrawer() {
    this.setState({tagDrawerHover: false});
  }

  onMouseLeaveTagDrawer() {
    clearTimeout(this._tagDrawerTimeout);
    this._tagDrawerTimeout = setTimeout(this.closeTagDrawer.bind(this), 500);
  }

  onCloseDialog() {
    this.setState({blacklistSource: null, blacklistFile: null, deletePath: null, deleteError: null});
  }

  onBlacklistFile(source: string, fileToBlacklist: string) {
    this.setState({blacklistSource: source, blacklistFile: fileToBlacklist});
  }

  onFinishBlacklistFile() {
    this.props.blacklistFile(this.state.blacklistSource, this.state.blacklistFile);
    this.onCloseDialog();
  }

  onDeletePath(path: string) {
    if (fs.existsSync(path)) {
      this.setState({deletePath: path});
    } else {
      this.setState({deletePath: null, deleteError: "This file doesn't exist, cannot delete"});
    }
  }

  onFinishDeletePath() {
    fs.unlink(this.state.deletePath, (err) => {
      if (err) {
        this.setState({deletePath: null, deleteError: "An error ocurred while deleting the file: " + err.message});
        console.error(err);
      } else {
        this.props.imagePlayerDeleteHack.fire();
        this.onCloseDialog();
      }
    });
  }

  toggleFull() {
    this.setFullscreen(!getCurrentWindow().isFullScreen());
    this.setMenuBarVisibility(!getCurrentWindow().isFullScreen());
  }

  historyBack() {
    if (!this.state.drawerHover || document.activeElement.tagName.toLocaleLowerCase() != "input") {
      if (this.props.historyOffset > -(this.props.historyPaths.length - 1)) {
        this.props.historyBack();
      }
    }
  }

  historyForward() {
    if (!this.state.drawerHover || document.activeElement.tagName.toLocaleLowerCase() != "input") {
      if (this.props.historyOffset >= 0) {
        this.props.imagePlayerAdvanceHacks[0][0].fire();
      } else {
        this.props.historyForward();
      }
    }
  }

  setMenuBarVisibility(showMenu: boolean) {
    this.props.config.displaySettings.showMenu = showMenu;
    this.buildMenu();
    getCurrentWindow().setMenuBarVisibility(showMenu);
  }

  setFullscreen(fullScreen: boolean) {
    this.props.config.displaySettings.fullScreen = fullScreen;
    this.buildMenu();
    getCurrentWindow().setFullScreen(fullScreen);
  }

  buildMenu() {
    if (this.props.tutorial != null) return;
    createMainMenu(Menu, createMenuTemplate(app, {
      label: 'Player controls',
      submenu: Array.from(this.getKeyMap().entries()).map(([k, v]) => {
        const [label, accelerator] = v;
        return {
          label,
          accelerator,
          click: (this as any)[k as any].bind(this),
        };
      })
    }));
  }

  showContextMenu = (e: MouseEvent) => {
    if (this.props.tutorial != null) return;
    const contextMenu = new Menu();
    const img = this.props.recentPictureGrid ? e.target : this.props.historyPaths[(this.props.historyPaths.length - 1) + this.props.historyOffset];
    const url = img.src;
    let source = img.getAttribute("source");
    if (/^https?:\/\//g.exec(source) == null) {
      source = urlToPath(fileURL(source));
    }
    const isFile = url.startsWith('file://');
    const path = urlToPath(url);
    const type = getSourceType(source);
    contextMenu.append(new MenuItem({
      label: source,
      click: () => { navigator.clipboard.writeText(source); }
    }));
    contextMenu.append(new MenuItem({
      label: isFile ? path : url,
      click: () => { navigator.clipboard.writeText(isFile ? path : url); }
    }));
    if (url.toLocaleLowerCase().endsWith(".png") || url.toLocaleLowerCase().endsWith(".jpg") || url.toLocaleLowerCase().endsWith(".jpeg")) {
      contextMenu.append(new MenuItem({
        label: 'Copy Image',
        click: () => {
          this.copyImageToClipboard(url);
        }
      }));
    }
    contextMenu.append(new MenuItem({
      label: 'Open Source',
      click: () => { remote.shell.openExternal(source); }
    }));
    contextMenu.append(new MenuItem({
      label: 'Open File',
      click: () => { remote.shell.openExternal(url); }
    }));
    if (this.props.config.caching.enabled && type != ST.local) {
      contextMenu.append(new MenuItem({
        label: 'Open Cached Images',
        click: () => {
          // for some reason windows uses URLs and everyone else uses paths
          if (process.platform === "win32") {
            remote.shell.openExternal(getCachePath(source, this.props.config));
          } else {
            remote.shell.openItem(getCachePath(source, this.props.config));
          }
        }
      }));
    }
    if ((!isFile && type != ST.video && type != ST.playlist) || type == ST.local) {
      contextMenu.append(new MenuItem({
        label: 'Blacklist File',
        click: () => {
          this.onBlacklistFile(source, isFile ? path : url);
        }
      }));
    }
    if (isFile) {
      contextMenu.append(new MenuItem({
        label: 'Reveal',
        click: () => {
          // for some reason windows uses URLs and everyone else uses paths
          if (process.platform === "win32") {
            remote.shell.showItemInFolder(url);
          } else {
            remote.shell.showItemInFolder(path);
          }
        }
      }));
      contextMenu.append(new MenuItem({
        label: 'Delete',
        click: () => {
          this.onDeletePath(path);
        }
      }));
    }
    if (!this.props.tags) {
      contextMenu.append(new MenuItem({
        label: 'Goto Tag Source',
        click: () => {
          this.props.goToTagSource(new LibrarySource({url: source}));
        }
      }));
    }
    if (type == ST.video) {
      contextMenu.append(new MenuItem({
        label: 'Goto Clip Source',
        click: () => {
          this.props.goToClipSource(new LibrarySource({url: source}));
        }
      }));
    }
    if (!this.props.recentPictureGrid) {
      contextMenu.append(new MenuItem({
        label: 'Recent Picture Grid',
        click: () => {
          this.props.onRecentPictureGrid();
        }
      }));
    }
    contextMenu.popup({});
  };

  getKeyMap() {
    const keyMap = new Map<String, Array<string>>([
      ['playPause', ['Play/Pause ' + (this.props.isPlaying ? '(Playing)' : '(Paused)'), 'space']],
      ['historyBack', ['Back in Time', 'left']],
      ['historyForward', ['Forward in Time', 'right']],
      ['navigateBack', ['Go Back to Scene Details', 'escape']],
      ['toggleFullscreen', ['Toggle Fullscreen ' + (this.props.config.displaySettings.fullScreen ? '(On)' : '(Off)'), 'Control+F']],
      ['toggleAlwaysOnTop', ['Toggle Always On Top ' + (this.props.config.displaySettings.alwaysOnTop ? '(On)' : '(Off)'), 'Control+T']],
      ['toggleMenuBarDisplay', ['Toggle Menu Bar ' + (this.props.config.displaySettings.showMenu ? '(On)' : '(Off)'), 'Control+G']],
    ]);

    if (this.props.config.caching.enabled) {
      keyMap.set('onDelete', ['Delete Image', 'Delete']);
    }

    if (!this.props.scene.audioScene && !this.props.scene.scriptScene && this.props.tags != null) {
      keyMap.set('prevSource', ['Previous Source', '[']);
      keyMap.set('nextSource', ['Next Source', ']']);
    }

    return keyMap;
  }

  onKeyDown = (e: KeyboardEvent) => {
    const focus = document.activeElement.tagName.toLocaleLowerCase();
    switch (e.key) {
      case ' ':
        if ((!this.state.drawerHover || focus != "input") && !e.shiftKey) {
          e.preventDefault();
          this.playPause();
        }
        break;
      case 'ArrowLeft':
        if ((!this.state.drawerHover || focus != "input") && !e.shiftKey) {
          e.preventDefault();
          this.historyBack();
        }
        break;
      case 'ArrowRight':
        if ((!this.state.drawerHover || focus != "input") && !e.shiftKey) {
          e.preventDefault();
          this.historyForward();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.navigateBack();
        break;
      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          this.copyImageToClipboard(null);
        }
        break;
      case 'f':
        if (e.ctrlKey) {
          e.preventDefault();
          this.toggleFullscreen();
        }
        break;
      case 't':
        if (e.ctrlKey) {
          e.preventDefault();
          this.toggleAlwaysOnTop();
        }
        break;
      case 'g':
        if (e.ctrlKey) {
          e.preventDefault();
          this.toggleMenuBarDisplay();
        }
        break;
      case 'Delete':
        if (!this.state.drawerHover || focus != "input") {
          if (this.props.config.caching.enabled) {
            e.preventDefault();
            this.onDelete();
          }
        }
        break;
      case '[':
        if (!this.props.scene.audioScene && !this.props.scene.scriptScene && this.props.tags != null) {
          e.preventDefault();
          this.prevSource();
        }
        break;
      case ']':
        if (!this.props.scene.audioScene && !this.props.scene.scriptScene && this.props.tags != null) {
          e.preventDefault();
          this.nextSource();
        }
        break;
    }
  };

  orderAudioTags(audio: Audio) {
    const tagNames = this.props.allTags.map((t: Tag) => t.name);
    // Re-order the tags of the audio we were playing
    audio.tags = audio.tags.sort((a: Tag, b: Tag) => {
      const aIndex = tagNames.indexOf(a.name);
      const bIndex = tagNames.indexOf(b.name);
      if (aIndex < bIndex) {
        return -1;
      } else if (aIndex > bIndex) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  setPlayPause(play: boolean) {
    if (play) {
      this.props.play()
    } else {
      this.props.pause()
    }
    this.buildMenu();
  }

  setAlwaysOnTop(alwaysOnTop: boolean){
    this.props.config.displaySettings.alwaysOnTop = alwaysOnTop;
    this.buildMenu();
    getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
  }

  navigateBack() {
    const window = getCurrentWindow();
    window.setFullScreen(false);
    window.setMenuBarVisibility(true);
    this.props.goBack();
  }

  copyImageToClipboard(sourceURL: string) {
    let url = sourceURL;
    if (!url) {
      url = this.props.historyPaths[(this.props.historyPaths.length - 1) + this.props.historyOffset].src;
    }
    const isFile = url.startsWith('file://');
    const path = urlToPath(url);
    const imagePath = isFile ? path : url;
    if (imagePath.toLocaleLowerCase().endsWith(".png") || imagePath.toLocaleLowerCase().endsWith(".jpg") || imagePath.toLocaleLowerCase().endsWith(".jpeg")) {
      if (isFile) {
        clipboard.writeImage(nativeImage.createFromPath(imagePath));
      } else {
        wretch(imagePath)
          .get()
          .blob(blob => {
            const reader = new FileReader();
            reader.onload = function () {
              if (reader.readyState == 2) {
                const arrayBuffer = reader.result as ArrayBuffer;
                const buffer = Buffer.alloc(arrayBuffer.byteLength);
                const view = new Uint8Array(arrayBuffer);
                for (let i = 0; i < arrayBuffer.byteLength; ++i) {
                  buffer[i] = view[i];
                }
                const bufferImage = nativeImage.createFromBuffer(buffer);
                if (bufferImage.isEmpty()) {
                  clipboard.writeText(imagePath);
                } else {
                  clipboard.writeImage(bufferImage);
                }
              }
            };
            reader.readAsArrayBuffer(blob);
          });
      }
    } else {
      clipboard.writeText(imagePath);
    }
  }

  /* Menu and hotkey options DON'T DELETE */

  onDelete() {
    if (!this.state.drawerHover || document.activeElement.tagName.toLocaleLowerCase() != "input") {
      const img = this.props.historyPaths[(this.props.historyPaths.length - 1) + this.props.historyOffset];
      const url = img.src;
      const isFile = url.startsWith('file://');
      const path = urlToPath(url);
      if (isFile) {
        this.onDeletePath(path);
      }
    }
  }

  playPause() {
    if (!this.state.drawerHover || document.activeElement.tagName.toLocaleLowerCase() != "input") {
      this.setPlayPause(!this.props.isPlaying)
    }
  }

  toggleAlwaysOnTop() {
    this.setAlwaysOnTop(!this.props.config.displaySettings.alwaysOnTop);
  }

  toggleMenuBarDisplay() {
    this.setMenuBarVisibility(!this.props.config.displaySettings.showMenu);
  }

  toggleFullscreen() {
    this.setFullscreen(!this.props.config.displaySettings.fullScreen);
  }

  prevSource() {
    this.props.navigateTagging(-1);
  }

  nextSource() {
    this.props.navigateTagging(1);
  }
}

(PlayerBars as any).displayName="PlayerBars";
export default withStyles(styles)(PlayerBars as any);