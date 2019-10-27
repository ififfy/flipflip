import {remote, webFrame, clipboard, nativeImage} from 'electron';
const {getCurrentWindow, Menu, MenuItem, app} = remote;
import * as React from 'react';
import fs from "fs";
import fileURL from "file-url";
import clsx from "clsx";

import {
  AppBar, Button, Card, CardActionArea, CardContent, CircularProgress, Container, createStyles, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Drawer, ExpansionPanel, ExpansionPanelDetails,
  ExpansionPanelSummary, IconButton, Link, Theme, Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ForwardIcon from '@material-ui/icons/Forward';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import {createMainMenu, createMenuTemplate} from "../../../main/MainMenu";
import {IF, SL, ST} from "../../data/const";
import {getCachePath, getSourceType, urlToPath} from '../../data/utils';
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from '../../data/Scene';
import Tag from "../../data/Tag";
import CaptionProgram from "./CaptionProgram";
import ChildCallbackHack from './ChildCallbackHack';
import HeadlessScenePlayer from './HeadlessScenePlayer';
import Strobe from "./Strobe";
import AudioCard from "../configGroups/AudioCard";
import CrossFadeCard from "../configGroups/CrossFadeCard";
import ImageVideoCard from "../configGroups/ImageVideoCard";
import SceneOptionCard from "../configGroups/SceneOptionCard";
import StrobeCard from "../configGroups/StrobeCard";
import TextCard from "../configGroups/TextCard";
import VideoCard from "../configGroups/VideoCard";
import ZoomMoveCard from "../configGroups/ZoomMoveCard";

const drawerWidth = 340;

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
  appBarSpacer: {
    ...theme.mixins.toolbar
  },
  hoverBar: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
    opacity: 0,
    height: theme.spacing(5),
    width: '100%',
    ... theme.mixins.toolbar,
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
    backgroundColor: theme.palette.background.default,
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
  },
  tag: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  selectedTag: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    zIndex: 10,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing(0),
    position: 'relative',
  },
  player: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  progress: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  progressMessage: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%',
  },
  emptyMessage2: {
    textAlign: 'center',
  },
  startNowButton: {
    marginTop: theme.spacing(1),
  },
  gridRoot: {
    width: '104%',
    height: '104%',
    marginLeft: '-2%',
    marginTop: '-2%',
    overflow: 'hidden',
    position: 'relative',
  },
  wordWrap: {
    wordWrap: 'break-word',
  },
  full: {
    height: '100%',
    width: '100%',
  },
  fill: {
    flexGrow: 1,
  },
  hidden: {
    display: 'none',
  }
});

class Player extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    scene: Scene,
    scenes: Array<Scene>,
    cache(i: HTMLImageElement | HTMLVideoElement): void,
    getTags(source: string): Array<Tag>,
    goBack(): void,
    setCount(sourceURL: string, count: number, countComplete: boolean): void,
    systemMessage(message: string): void,
    allTags?: Array<Tag>,
    gridView?: boolean,
    tags?: Array<Tag>,
    blacklistFile?(sourceURL: string, fileToBlacklist: string): void,
    goToTagSource?(source: LibrarySource): void,
    navigateTagging?(offset: number): void,
    nextScene?(): void,
    onUpdateScene?(scene: Scene, fn: (scene: Scene) => void): void,
    toggleTag?(sourceID: number, tag: Tag): void,
  };

  readonly state = {
    canStart: false,
    hasStarted: false,
    isMainLoaded: false,
    areOverlaysLoaded: Array<boolean>(this.getValidOverlays().length).fill(false),
    isEmpty: false,
    isPlaying: true,
    total: 0,
    progress: 0,
    progressMessage: this.props.scene.sources.length > 0 ? this.props.scene.sources[0].url : "",
    startTime: null as Date,
    historyOffset: 0,
    historyPaths: Array<any>(),
    imagePlayerAdvanceHack: new ChildCallbackHack(),
    imagePlayerDeleteHack: new ChildCallbackHack(),
    mainVideo: null as HTMLVideoElement,
    overlayVideos: Array<HTMLVideoElement>(this.getValidOverlays().length).fill(null),
    timeToNextFrame: null as number,
    appBarHover: false,
    drawerHover: false,
    tagDrawerHover: false,
    blacklistSource: null as LibrarySource,
    blacklistFile: null as string,
    deletePath: null as string,
    deleteError: null as string,
  };

  _interval: NodeJS.Timer = null;
  _toggleStrobe = false;
  _appBarTimeout: any = null;
  _drawerTimeout: any = null;
  _tagDrawerTimeout: any = null;

  render() {
    const classes = this.props.classes;
    const canGoBack = this.state.historyOffset > -(this.state.historyPaths.length - 1);
    const canGoForward = this.state.historyOffset < 0;
    const tagNames = this.props.tags ? this.props.tags.map((t) => t.name) : [];
    const validOverlays = this.getValidOverlays();
    const nextScene = this.getScene(this.props.scene.nextSceneID);
    const showCaptionProgram = (
      this.props.scene.textEnabled &&
      this.props.scene.textSource &&
      this.props.scene.textSource.length &&
      this.state.isPlaying &&
      this.state.hasStarted);
    const showStrobe = this.props.scene.strobe && this.state.hasStarted && this.state.isPlaying &&
      (this.props.scene.strobeLayer == SL.top || this.props.scene.strobeLayer == SL.bottom);

    return (
      <div className={clsx(classes.root, this.props.gridView && classes.gridRoot)}>
        {showStrobe && (
          <Strobe
            zIndex={5}
            toggleStrobe={this._toggleStrobe}
            timeToNextFrame={this.state.timeToNextFrame}
            scene={this.props.scene}
          />
        )}
        {!this.state.hasStarted && !this.state.isEmpty && (
          <main className={classes.content}>
            <Container maxWidth={false} className={clsx(classes.container, classes.progress)}>
              <CircularProgress
                size={300}
                value={Math.round((this.state.progress / this.state.total) * 100)}
                variant="static"/>
                <div className={clsx(classes.progress, classes.progressMessage)}>
                  <Typography component="h1" variant="h6" color="inherit" noWrap>
                    {this.state.progress} / {this.state.total}
                  </Typography>
                  <Typography component="h1" variant="h5" color="inherit" noWrap>
                    {this.state.progressMessage}
                  </Typography>
                  {this.state.canStart && (
                    <Button
                      className={classes.startNowButton}
                      variant="contained"
                      color="secondary"
                      onClick={this.start.bind(this, this.state.canStart, true)}>
                      Start Now
                    </Button>
                  )}
                </div>
            </Container>
          </main>
        )}
        {this.state.isEmpty && (
          <main className={classes.content}>
            <div className={classes.appBarSpacer}/>
            <Container maxWidth={false} className={classes.container}>
              <Typography component="h1" variant="h3" color="inherit" noWrap className={classes.emptyMessage}>
                (ಥ﹏ಥ)
              </Typography>
              <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.emptyMessage2}>
                I couldn't find anything
              </Typography>
            </Container>
          </main>
        )}

        <div className={clsx(!this.props.gridView && classes.player, !this.state.hasStarted && classes.hidden)}>
          <HeadlessScenePlayer
            config={this.props.config}
            scene={this.props.scene}
            nextScene={nextScene}
            opacity={1}
            gridView={this.props.gridView}
            isPlaying={this.state.isPlaying}
            hasStarted={this.state.hasStarted}
            strobeLayer={this.props.scene.strobe ? this.props.scene.strobeLayer : null}
            historyOffset={this.state.historyOffset}
            advanceHack={this.state.imagePlayerAdvanceHack}
            deleteHack={this.state.imagePlayerDeleteHack}
            setHistoryOffset={this.setHistoryOffset.bind(this)}
            setHistoryPaths={this.setHistoryPaths.bind(this)}
            finishedLoading={this.setMainLoaded.bind(this)}
            firstImageLoaded={this.setMainCanStart.bind(this)}
            setProgress={this.setProgress.bind(this)}
            setVideo={this.setMainVideo.bind(this)}
            setCount={this.props.setCount.bind(this)}
            cache={this.props.cache.bind(this)}
            setTimeToNextFrame={this.setTimeToNextFrame.bind(this)}
            systemMessage={this.props.systemMessage.bind(this)}
          />

          {this.props.scene.overlayEnabled && validOverlays.length > 0 &&
           !this.state.isEmpty && validOverlays.map((overlay, index) => {
            let showProgress = this.state.isMainLoaded && !this.state.hasStarted;
            if (showProgress) {
              for (let x=0; x < index; x++) {
                if (!this.state.areOverlaysLoaded[x]) {
                  showProgress = false;
                  break;
                }
              }
            }
            return (
              <HeadlessScenePlayer
                key={overlay.id}
                config={this.props.config}
                scene={this.getScene(overlay.sceneID)}
                opacity={overlay.opacity / 100}
                gridView={this.props.gridView}
                isPlaying={this.state.isPlaying && !this.state.isEmpty}
                hasStarted={this.state.hasStarted}
                historyOffset={0}
                setHistoryOffset={this.nop}
                setHistoryPaths={this.nop}
                finishedLoading={this.setOverlayLoaded.bind(this, index)}
                firstImageLoaded={this.nop}
                setProgress={showProgress ? this.setProgress.bind(this) : this.nop}
                setVideo={this.setOverlayVideo.bind(this, index)}
                setCount={this.props.setCount.bind(this)}
                cache={this.props.cache.bind(this)}
                systemMessage={this.props.systemMessage.bind(this)}
              />
            );}
          )}
        </div>

        {showCaptionProgram && (
          <CaptionProgram
            blinkColor={this.props.scene.blinkColor}
            blinkFontSize={this.props.scene.blinkFontSize}
            blinkFontFamily={this.props.scene.blinkFontFamily}
            captionColor={this.props.scene.captionColor}
            captionFontSize={this.props.scene.captionFontSize}
            captionFontFamily={this.props.scene.captionFontFamily}
            captionBigColor={this.props.scene.captionBigColor}
            captionBigFontSize={this.props.scene.captionBigFontSize}
            captionBigFontFamily={this.props.scene.captionBigFontFamily}
            countColor={this.props.scene.countColor}
            countFontSize={this.props.scene.countFontSize}
            countFontFamily={this.props.scene.countFontFamily}
            url={this.props.scene.textSource}
            textEndStop={this.props.scene.textEndStop}
            getTags={this.props.getTags.bind(this)}
            goBack={this.props.goBack.bind(this)}
            currentSource={this.state.historyPaths.length > 0 ? this.state.historyPaths[0].getAttribute("source") : null}/>
        )}

        {!this.props.gridView && (
          <React.Fragment>
            <div
              className={classes.hoverBar}
              onMouseEnter={this.onMouseEnterAppBar.bind(this)}
              onMouseLeave={this.onMouseLeaveAppBar.bind(this)}/>

            <AppBar
              position="absolute"
              onMouseEnter={this.onMouseEnterAppBar.bind(this)}
              onMouseLeave={this.onMouseLeaveAppBar.bind(this)}
              className={clsx(classes.appBar, (!this.state.hasStarted || this.state.isEmpty || this.state.appBarHover) && classes.appBarHover)}>
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

                <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.title}>
                  {this.props.tags ? this.props.scene.sources[0].url : this.props.scene.name}
                </Typography>

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
                    aria-label={this.state.isPlaying ? "Pause" : "Play"}
                    onClick={this.setPlayPause.bind(this, !this.state.isPlaying)}>
                    {this.state.isPlaying ? <PauseIcon fontSize="large"/> : <PlayArrowIcon fontSize="large"/>}
                  </IconButton>
                  <IconButton
                    disabled={!canGoForward}
                    edge="start"
                    color="inherit"
                    aria-label="Forward"
                    onClick={this.historyForward.bind(this)}>
                    <ForwardIcon fontSize="large"/>
                  </IconButton>
                </div>
              </Toolbar>
            </AppBar>

            {this.state.hasStarted && !this.state.isEmpty && (
              <React.Fragment>
                <div
                  className={classes.hoverDrawer}
                  onMouseEnter={this.onMouseEnterDrawer.bind(this)}
                  onMouseLeave={this.onMouseLeaveDrawer.bind(this)}/>

                <Drawer
                  variant="permanent"
                  className={clsx(classes.drawer, this.state.drawerHover && classes.drawerHover)}
                  classes={{paper: clsx(classes.drawerPaper, this.state.drawerHover && classes.drawerPaperHover)}}
                  open={this.state.drawerHover}
                  onMouseEnter={this.onMouseEnterDrawer.bind(this)}
                  onMouseLeave={this.onMouseLeaveDrawer.bind(this)}>
                  <div className={classes.drawerToolbar}>
                    <Typography variant="h4">
                      Settings
                    </Typography>
                  </div>

                  {this.props.scene.imageTypeFilter != IF.stills && (
                    <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                      <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                      >
                        <Typography>Video Controls</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <VideoCard
                          scene={this.props.scene}
                          otherScenes={this.getValidOverlays().map((o) => this.getScene(o.sceneID))}
                          isPlaying={this.state.isPlaying}
                          mainVideo={this.state.mainVideo}
                          otherVideos={this.state.overlayVideos}
                          onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  )}

                  <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Scene Options</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <SceneOptionCard
                        sidebar
                        allScenes={this.props.scenes}
                        isTagging={this.props.tags != null}
                        scene={this.props.scene}
                        onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Image/Video Options</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <ImageVideoCard
                        sidebar
                        isPlayer
                        scene={this.props.scene}
                        onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Zoom/Move</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <ZoomMoveCard
                        sidebar
                        scene={this.props.scene}
                        onUpdateScene={this.props.onUpdateScene.bind(this)} />
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Cross-Fade</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <CrossFadeCard
                        sidebar
                        scene={this.props.scene}
                        onUpdateScene={this.props.onUpdateScene.bind(this)} />
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Strobe</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <StrobeCard
                        sidebar
                        scene={this.props.scene}
                        onUpdateScene={this.props.onUpdateScene.bind(this)} />
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel TransitionProps={{ unmountOnExit: this.props.scene.audioEnabled }}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Audio Tracks</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <AudioCard
                        sidebar
                        scene={this.props.scene}
                        scenePaths={this.state.historyPaths}
                        startPlaying={true}
                        goBack={this.props.goBack.bind(this)}
                        onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Text Overlay</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <TextCard
                        sidebar
                        scene={this.props.scene}
                        onUpdateScene={this.props.onUpdateScene.bind(this)}/>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </Drawer>
              </React.Fragment>
            )}

            {this.state.hasStarted && this.props.allTags && (
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
                  <div className={classes.tagList}>
                    {this.props.allTags.map((tag) =>
                      <Card className={clsx(classes.tag, tagNames && tagNames.includes(tag.name) && classes.selectedTag)} key={tag.id}>
                        <CardActionArea onClick={this.props.toggleTag.bind(this, this.props.scene.libraryID, tag)}>
                          <CardContent>
                            <Typography component="h6" variant="body2">
                              {tag.name}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    )}
                  </div>

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
        )}
      </div>
    );
  }

  nextSceneLoop() {
    if (this.props.scene.nextSceneID === 0) {
      clearInterval(this._interval);
    }
    if (this.state.isPlaying && this.state.startTime != null &&
      Math.round(Math.abs(new Date().getTime() - this.state.startTime.getTime()) / 1000) >= this.props.scene.nextSceneTime) {
      this.setState({startTime: null});
      this.props.nextScene();
    } else if (!this.state.isPlaying && this.state.startTime) {
      const startTime = this.state.startTime;
      startTime.setTime(startTime.getTime() + 1000);
      this.setState({startTime: startTime});
    }
  }

  componentDidUpdate(props: any, state: any) {
    if (props.scene.id !== this.props.scene.id) {
      if (this.props.tags) {
        this.setState({startTime: new Date()});
      } else {
        this.setState({hasStarted: true, startTime: new Date()});
      }
    }
  }

  componentDidMount() {
    this.setAlwaysOnTop(this.props.config.displaySettings.alwaysOnTop);
    this.setMenuBarVisibility(this.props.config.displaySettings.showMenu);
    this.setFullscreen(this.props.config.displaySettings.fullScreen);

    if (!this.props.gridView) {
      window.addEventListener('contextmenu', this.showContextMenu, false);
      window.addEventListener('keydown', this.onKeyDown, false);
      this.buildMenu();
      this._interval = setInterval(() => this.nextSceneLoop(), 1000);
    }
  }

  buildMenu() {
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

  componentWillUnmount() {
    clearInterval(this._interval);
    clearTimeout(this._appBarTimeout);
    this._appBarTimeout = null;
    this._drawerTimeout = null;
    this._tagDrawerTimeout = null;
    this._interval = null;
    getCurrentWindow().setAlwaysOnTop(false);
    getCurrentWindow().setFullScreen(false);
    if (!this.props.gridView) {
      createMainMenu(Menu, createMenuTemplate(app));
      window.removeEventListener('contextmenu', this.showContextMenu);
      window.removeEventListener('keydown', this.onKeyDown);
    }
    // Clear ALL the available browser caches
    global.gc();
    webFrame.clearCache();
    remote.getCurrentWindow().webContents.session.clearCache(() => {});
  }

  nop() {}

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

  setProgress(total: number, current: number, message: string) {
    this.setState({total: total, progress: current, progressMessage: message});
  }

  showContextMenu = () => {
    const contextMenu = new Menu();
    const img = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.state.historyOffset];
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
            remote.shell.openExternal(urlToPath(getCachePath(source, this.props.config)));
          }
        }
      }));
    }
    if ((!isFile && type != ST.video) || type == ST.local) {
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
    contextMenu.popup({});
  };

  getValidOverlays() {
    return this.props.scene.overlays.filter((o) => {
      if (o.sceneID == 0) return false;
      const getO = this.getScene(o.sceneID);
      return (getO != null && getO.sources.length > 0);
    });
  }

  setMainCanStart() {
    if (!this.state.canStart) {
      this.setState({canStart: true, isEmpty: false});
      this.start(true);
    }
  }

  setMainLoaded(empty: boolean) {
    if (empty) {
      this.setState({isEmpty: empty});
    } else {
      this.setState({isMainLoaded: true});
      this.play();
    }
  }

  setOverlayLoaded(index: number, empty: boolean) {
    const newAOL = this.state.areOverlaysLoaded;
    newAOL[index] = true;
    this.setState({areOverlaysLoaded: newAOL});
    this.play();
  }

  setTimeToNextFrame(ttnf: number) {
    this._toggleStrobe = !this._toggleStrobe;
    this.setState({timeToNextFrame: ttnf});
  }

  setMainVideo(video: HTMLVideoElement) {
    this.setState({mainVideo: video});
  }

  setOverlayVideo(index: number, video: HTMLVideoElement) {
    const newOV = this.state.overlayVideos;
    newOV[index] = video;
    this.setState({overlayVideos: newOV});
  }

  start(canStart: boolean, force = false) {
    const isLoaded = !force && (this.state.isMainLoaded && (!this.props.scene.overlayEnabled || this.getValidOverlays().length == 0 || this.state.areOverlaysLoaded.find((b) => !b) == null));
    if (force || (canStart && (isLoaded || this.props.config.displaySettings.startImmediately))) {
      this.setState({hasStarted: true, isLoaded: true, startTime: this.state.startTime ?  this.state.startTime : new Date()});
    } else {
      this.setState({isLoaded: isLoaded});
    }
  }

  play() {
    this.setState({isPlaying: true, historyOffset: 0});
    this.start(this.state.canStart);
  }

  pause() {
    this.setState({isPlaying: false});
  }

  setPlayPause(play: boolean) {
    if (play) {
      this.play()
    } else {
      this.pause()
    }
    this.buildMenu();
  }

  historyBack() {
    if (!this.state.drawerHover || document.activeElement.tagName.toLocaleLowerCase() != "input") {
      if (this.state.historyOffset > -(this.state.historyPaths.length - 1)) {
        this.setState({
          isPlaying: false,
          historyOffset: this.state.historyOffset - 1,
        });
      }
    }
  }

  historyForward() {
    if (!this.state.drawerHover || document.activeElement.tagName.toLocaleLowerCase() != "input") {
      if (this.state.historyOffset >= 0) {
        this.state.imagePlayerAdvanceHack.fire();
      } else {
        this.setState({
          isPlaying: false,
          historyOffset: this.state.historyOffset + 1,
        });
      }
    }
  }

  onCloseDialog() {
    this.setState({blacklistSource: null, blacklistFile: null, deletePath: null, deleteError: null});
  }

  onBlacklistFile(source: string, fileToBlacklist: string) {
    this.setState({blacklistSource: source, blacklistFile: fileToBlacklist});
  }

  onFinishBlacklistFile(source: string, fileToBlacklist: string) {
    this.props.blacklistFile(source, fileToBlacklist);
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
        this.state.imagePlayerDeleteHack.fire();
        this.onCloseDialog();
      }
    });
  }

  openLink(url: string) {
    remote.shell.openExternal(url);
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
      url = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.state.historyOffset].src;
    }
    const isFile = url.startsWith('file://');
    const path = urlToPath(url);
    const imagePath = isFile ? path : url;
    if (imagePath.toLocaleLowerCase().endsWith(".png") || imagePath.toLocaleLowerCase().endsWith(".jpg") || imagePath.toLocaleLowerCase().endsWith(".jpeg")) {
      clipboard.writeImage(nativeImage.createFromPath(imagePath));
    }
  }

  setHistoryPaths(paths: Array<any>) {
    this.setState({historyPaths: paths});
  }

  setHistoryOffset(offset: number) {
    this.setState({historyOffset: offset});
  }

  setAlwaysOnTop(alwaysOnTop: boolean){
    this.props.config.displaySettings.alwaysOnTop = alwaysOnTop;
    this.buildMenu();
    getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
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

  toggleFull() {
    this.setFullscreen(!getCurrentWindow().isFullScreen());
    this.setMenuBarVisibility(!getCurrentWindow().isFullScreen());
  }

  getScene(id: number): Scene {
    return this.props.scenes.find((s) => s.id == id);
  }

  getKeyMap() {
    const keyMap = new Map<String, Array<string>>([
      ['playPause', ['Play/Pause ' + (this.state.isPlaying ? '(Playing)' : '(Paused)'), 'space']],
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

    if (this.props.tags != null) {
      keyMap.set('prevSource', ['Previous Source', '[']);
      keyMap.set('nextSource', ['Next Source', ']']);
    }

    return keyMap;
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
  onKeyDown = (e: KeyboardEvent) => {
    const focus = document.activeElement.tagName.toLocaleLowerCase();
    switch (e.key) {
      case ' ':
        if (!this.state.drawerHover || focus != "input") {
          e.preventDefault();
          this.playPause();
        }
        break;
      case 'ArrowLeft':
        if (!this.state.drawerHover || focus != "input") {
          e.preventDefault();
          this.historyBack();
        }
        break;
      case 'ArrowRight':
        if (!this.state.drawerHover || focus != "input") {
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
        if (this.props.tags != null) {
          e.preventDefault();
          this.prevSource();
        }
        break;
      case ']':
        if (this.props.tags != null) {
          e.preventDefault();
          this.nextSource();
        }
        break;
    }
  };

  /* Menu and hotkey options DON'T DELETE */

  onDelete() {
    if (!this.state.drawerHover || document.activeElement.tagName.toLocaleLowerCase() != "input") {
      const img = this.state.historyPaths[(this.state.historyPaths.length - 1) + this.state.historyOffset];
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
      this.setPlayPause(!this.state.isPlaying)
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
    this.navigateTagging(-1);
  }

  nextSource() {
    this.navigateTagging(1);
  }

  navigateTagging(offset: number) {
    this.setState({
      canStart: false,
      hasStarted: false,
      isMainLoaded: false,
      isEmpty: false,
      historyOffset: 0,
      historyPaths: Array<any>(),
      total: 0,
      progress: 0,
      progressMessage: this.props.scene.sources.length > 0 ? this.props.scene.sources[0].url : "",
    });
    this.props.navigateTagging(offset);
  }
}

export default withStyles(styles)(Player as any);