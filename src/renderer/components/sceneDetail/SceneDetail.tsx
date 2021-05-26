import * as React from "react";
import clsx from "clsx";

import {
  AppBar, Backdrop, Badge, Box, Button, Collapse, Container, createStyles, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Divider, Drawer, Fab, IconButton, ListItem, ListItemIcon, ListItemSecondaryAction,
  ListItemText, Menu, MenuItem, Slide, Snackbar, SnackbarContent, Tab, Tabs, TextField, Theme, Toolbar, Tooltip,
  Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import BuildIcon from '@material-ui/icons/Build';
import CachedIcon from '@material-ui/icons/Cached';
import CollectionsIcon from '@material-ui/icons/Collections';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import FolderIcon from '@material-ui/icons/Folder';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import MenuIcon from'@material-ui/icons/Menu';
import MovieIcon from '@material-ui/icons/Movie';
import PhotoFilterIcon from '@material-ui/icons/PhotoFilter';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import PublishIcon from '@material-ui/icons/Publish';
import RestoreIcon from "@material-ui/icons/Restore";
import SaveIcon from '@material-ui/icons/Save';
import ShuffleIcon from "@material-ui/icons/Shuffle";
import SortIcon from '@material-ui/icons/Sort';
import WarningIcon from '@material-ui/icons/Warning';

import {AF, MO, SB, SDGT, SDT, SF, ST, TT} from "../../data/const";
import en from "../../data/en";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import WeightGroup from "../../data/WeightGroup";
import SceneEffects from "./SceneEffects";
import SceneGenerator from "./SceneGenerator";
import SceneOptions from "./SceneOptions";
import URLDialog from "./URLDialog";
import LibrarySearch from "../library/LibrarySearch";
import SourceList from "../library/SourceList";
import AudioTextEffects from "./AudioTextEffects";
import {areWeightsValid} from "../../data/utils";
import Audio from "../../data/Audio";
import CaptionScript from "../../data/CaptionScript";
import SceneGrid from "../../data/SceneGrid";

const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacerWrapper: {
    ...theme.mixins.toolbar,
  },
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    ...theme.mixins.toolbar,
  },
  title: {
    textAlign: 'center',
  },
  titleField: {
    width: '100%',
    margin: 0,
  },
  titleInput: {
    color: theme.palette.primary.contrastText,
    textAlign: 'center',
    fontSize: theme.typography.h4.fontSize,
  },
  noTitle: {
    width: '33%',
    height: theme.spacing(7),
  },
  drawer: {
    position: 'absolute',
  },
  drawerSpacer: {
    minWidth: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      minWidth: theme.spacing(9),
    },
  },
  drawerButton: {
    backgroundColor: theme.palette.primary.main,
    minHeight: theme.spacing(6),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  drawerIcon: {
    color: theme.palette.primary.contrastText,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: '100vh',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  container: {
    height: '100%',
    padding: theme.spacing(0),
    overflowY: 'auto',
  },
  sourcesSection: {
    height: '100%',
  },
  tabPanel: {
    display: 'flex',
    height: '100%',
  },
  tab: {
    width: drawerWidth,
    height: theme.spacing(12),
    transition: theme.transitions.create(['width', 'margin', 'background', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      opacity: 1,
      transition: theme.transitions.create(['background', 'opacity'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
  },
  tabClose: {
    minWidth: 0,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  optionsTab: {
    ariaControls: 'vertical-tabpanel-0',
  },
  effectsTab: {
    ariaControls: 'vertical-tabpanel-1',
  },
  audioTextTab: {
    ariaControls: 'vertical-tabpanel-2',
  },
  sourcesTab: {
    ariaControls: 'vertical-tabpanel-3',
  },
  generateTab: {
    ariaControls: 'vertical-tabpanel-4',
  },
  deleteItem: {
    color: theme.palette.error.main,
  },
  removeAllWGButton: {
    backgroundColor: theme.palette.error.main,
    margin: 0,
    top: 'auto',
    right: 135,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  generateTooltip: {
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
    borderRadius: '50%',
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  addMenuButton: {
    backgroundColor: theme.palette.primary.dark,
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  sortMenuButton: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    margin: 0,
    top: 'auto',
    right: 80,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    margin: 0,
    top: 'auto',
    right: 28,
    bottom: 25,
    left: 'auto',
    position: 'fixed',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  addURLButton: {
    marginBottom: 60
  },
  addDirectoryButton: {
    marginBottom: 115
  },
  addVideoButton: {
    marginBottom: 170
  },
  libraryImportButton: {
    marginBottom: 225,
  },
  removeAllButton: {
    backgroundColor: theme.palette.error.main,
    marginBottom: 280,
  },
  addButtonClose: {
    marginBottom: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  icon: {
    color: theme.palette.primary.contrastText,
  },
  playButton: {
    boxShadow: 'none',
  },
  maxMenu: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    width: 100,
  },
  sortMenu: {
    width: 200,
  },
  tagMenu: {
    minHeight: 365,
    minWidth: 250,
  },
  fill: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.modal,
    height: '100%',
    width: '100%',
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
  backdropTop: {
    zIndex: `${theme.zIndex.modal + 1} !important` as any,
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

class SceneDetail extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    allSceneGrids: Array<SceneGrid>,
    autoEdit: boolean,
    config: Config,
    library: Array<LibrarySource>,
    scene: Scene,
    tags: Array<Tag>,
    tutorial: string,
    goBack(): void,
    onAddSource(scene: Scene, type: string, ...args: any[]): void,
    onAddScript(playlistIndex: number): void,
    onAddTracks(playlistIndex: number): void,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onCloneScene(scene: Scene): void,
    onDelete(scene: Scene): void,
    onEditBlacklist(sourceURL: string, blacklist: string): void,
    onExport(scene: Scene): void,
    onGenerate(scenes: Array<Scene>): void,
    onPlayScene(scene: Scene): void,
    onPlay(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onPlayAudio(source: Audio, displayed: Array<Audio>): void,
    onPlayScript(source: CaptionScript, sceneID: number, displayed: Array<CaptionScript>): void,
    onResetScene(scene: Scene): void,
    onSaveAsScene(scene: Scene): void,
    onSort(scene: Scene, algorithm: string, ascending: boolean): void,
    onTutorial(tutorial: string): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    systemMessage(message: string): void,
  };

  readonly state = {
    isEditingName: this.props.autoEdit ? this.props.scene.name : null as string,
    drawerOpen: false,
    menuAnchorEl: null as any,
    openMenu: null as string,
    snackbar: null as string,
    snackbarType: null as string,
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;
    return (
      <div className={classes.root}>

        <AppBar position="absolute" className={clsx(classes.appBar, (this.props.tutorial == SDT.title || this.props.tutorial == SDT.play) && classes.backdropTop)}>
          <Toolbar>
            <Tooltip title="Back" placement="right-end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                onClick={this.props.goBack.bind(this)}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>

            {this.state.isEditingName != null && (
              <form onSubmit={this.endEditingName.bind(this)} className={classes.titleField}>
                <TextField
                  autoFocus
                  fullWidth
                  id="title"
                  value={this.state.isEditingName}
                  margin="none"
                  inputProps={{className: classes.titleInput}}
                  onBlur={this.endEditingName.bind(this)}
                  onChange={this.onChangeName.bind(this)}
                />
              </form>
            )}
            {this.state.isEditingName == null && (
              <React.Fragment>
                <div className={classes.fill}/>
                <Typography component="h1" variant="h4" color="inherit" noWrap
                            className={clsx(classes.title, this.props.scene.name.length == 0 && classes.noTitle, this.props.tutorial == SDT.title && classes.highlight)} onClick={this.beginEditingName.bind(this)}>
                  {this.props.scene.name}
                </Typography>
                <div className={classes.fill}/>
              </React.Fragment>
            )}

            <Fab
              className={clsx(classes.playButton, this.props.tutorial == SDT.play && classes.highlight)}
              disabled={this.props.scene.sources.length == 0 && (!this.props.scene.regenerate || !areWeightsValid(this.props.scene))}
              color="secondary"
              aria-label="Play"
              onClick={this.onPlayScene.bind(this)}>
              <PlayCircleOutlineIcon fontSize="large"/>
            </Fab>
          </Toolbar>
        </AppBar>

        <Drawer
          className={clsx(classes.drawer, (this.state.drawerOpen || this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.backdropTop)}
          variant="permanent"
          classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)}}
          open={this.state.drawerOpen}>
          <div className={clsx(!open && classes.appBarSpacerWrapper)}>
            <Collapse in={!open}>
              <div className={classes.appBarSpacer} />
            </Collapse>
          </div>

          <ListItem className={classes.drawerButton}>
            <IconButton onClick={this.onToggleDrawer.bind(this)}>
              <MenuIcon className={classes.drawerIcon}/>
            </IconButton>
          </ListItem>

          <Divider />

          <div>
            <Tabs
              orientation="vertical"
              value={this.props.scene.openTab}
              onChange={this.onChangeTab.bind(this)}
              aria-label="scene detail tabs"
              className={classes.tabs}>
              <Tab id="vertical-tab-0"
                   aria-controls="vertical-tabpanel-0"
                   icon={<BuildIcon/>} label={open ? "Options" : ""}
                   className={clsx(classes.tab, classes.optionsTab, !open && classes.tabClose, this.props.tutorial == SDT.options1 && classes.highlight, this.props.tutorial == SDT.effects1 && classes.disable)}/>
              <Tab id="vertical-tab-1"
                   aria-controls="vertical-tabpanel-1"
                   icon={<PhotoFilterIcon/>} label={open ? "Effects" : ""}
                   className={clsx(classes.tab, classes.effectsTab, !open && classes.tabClose, this.props.tutorial == SDT.options1 && classes.disable, this.props.tutorial == SDT.effects1 && classes.highlight)}/>
              <Tab id="vertical-tab-2"
                   aria-controls="vertical-tabpanel-2"
                   icon={<AudiotrackIcon/>} label={open ? "Audio/Text" : ""}
                   className={clsx(classes.tab, classes.audioTextTab, !open && classes.tabClose, this.props.tutorial == SDT.options1 && classes.disable, (this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}/>
              <Tab id="vertical-tab-3"
                   aria-controls="vertical-tabpanel-3"
                   icon={<CollectionsIcon/>} label={open ? `Sources (${this.props.scene.sources.length})` : ""}
                   className={clsx(classes.tab, classes.sourcesTab, !open && classes.tabClose, (this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}/>
              {this.props.scene.generatorWeights && (
                <Tab id="vertical-tab-4"
                     aria-controls="vertical-tabpanel-4"
                     icon={<LocalOfferIcon/>} label={open ? `Generate (${this.props.scene.generatorWeights.length})` : ""}
                     className={clsx(classes.tab, classes.generateTab, !open && classes.tabClose)}/>
              )}
            </Tabs>
          </div>
          <div className={classes.fill}/>

          <div>
            {this.props.scene.generatorWeights && (
              <ListItem button onClick={this.props.onSaveAsScene.bind(this, this.props.scene)} className={clsx((this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <SaveIcon />
                </ListItemIcon>
                <ListItemText primary="Save as Scene" />
              </ListItem>
            )}
            <Tooltip title={this.state.drawerOpen ? "" : `Clone ${this.props.scene.generatorWeights ? 'Generator' : 'Scene'}`}>
              <ListItem button onClick={this.props.onCloneScene.bind(this, this.props.scene)} className={clsx((this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <FileCopyIcon />
                </ListItemIcon>
                <ListItemText primary={`Clone ${this.props.scene.generatorWeights ? 'Generator' : 'Scene'}`} />
              </ListItem>
            </Tooltip>
            <Tooltip title={this.state.drawerOpen ? "" : "Export Scene"}>
              <ListItem button onClick={this.props.onExport.bind(this, this.props.scene)} className={clsx((this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <PublishIcon />
                </ListItemIcon>
                <ListItemText primary="Export Scene" />
              </ListItem>
            </Tooltip>
            <Tooltip title={this.state.drawerOpen ? "" : "Restore Defaults"}>
              <ListItem button onClick={this.props.onResetScene.bind(this, this.props.scene)} className={clsx((this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <RestoreIcon/>
                </ListItemIcon>
                <ListItemText primary={"Restore Defaults"} />
              </ListItem>
            </Tooltip>
            <Tooltip title={this.state.drawerOpen ? "" : "Delete Scene"}>
              <ListItem button onClick={this.onDeleteScene.bind(this, this.props.scene)}
                        className={clsx(classes.deleteItem, (this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <DeleteForeverIcon color="error"/>
                </ListItemIcon>
                <ListItemText primary="Delete Scene" />
              </ListItem>
            </Tooltip>
            <Dialog
              open={this.state.openMenu == MO.deleteAlert}
              onClose={this.onCloseDialog.bind(this)}
              aria-labelledby="delete-title"
              aria-describedby="delete-description">
              <DialogTitle id="Delete-title">Delete '{this.props.scene.name}'</DialogTitle>
              <DialogContent>
                <DialogContentText id="delete-description">
                  Are you sure you want to delete {this.props.scene.name}?
                  It will be automatically removed from all overlays/grids.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                  Cancel
                </Button>
                <Button onClick={this.onFinishDeleteScene.bind(this)} color="primary">
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </Drawer>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth={false} className={classes.container}>

            {this.props.scene.openTab === 0 && (
              <Typography
                component="div"
                role="tabpanel"
                hidden={this.props.scene.openTab !== 0}
                id="vertical-tabpanel-0"
                aria-labelledby="vertical-tab-0">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <SceneOptions
                      allScenes={this.props.allScenes}
                      allSceneGrids={this.props.allSceneGrids}
                      scene={this.props.scene}
                      tutorial={this.props.tutorial}
                      onUpdateScene={this.props.onUpdateScene.bind(this)} />
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.scene.openTab === 1 && (
              <Typography
                component="div"
                role="tabpanel"
                hidden={this.props.scene.openTab !== 1}
                id="vertical-tabpanel-1"
                aria-labelledby="vertical-tab-1">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <SceneEffects
                      easingControls={this.props.config.displaySettings.easingControls}
                      scene={this.props.scene}
                      tutorial={this.props.tutorial}
                      onUpdateScene={this.props.onUpdateScene.bind(this)} />
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.scene.openTab === 2 && (
              <Typography
                component="div"
                role="tabpanel"
                hidden={this.props.scene.openTab !== 2}
                id="vertical-tabpanel-2"
                aria-labelledby="vertical-tab-2">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <AudioTextEffects
                      scene={this.props.scene}
                      onPlayAudio={this.props.onPlayAudio.bind(this)}
                      onPlayScript={this.props.onPlayScript.bind(this)}
                      onAddTracks={this.props.onAddTracks.bind(this)}
                      onAddScript={this.props.onAddScript.bind(this)}
                      onUpdateScene={this.props.onUpdateScene.bind(this)}
                      systemMessage={this.props.systemMessage.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.scene.openTab === 3 && (
              <Typography
                className={clsx(this.props.scene.openTab === 3 && classes.sourcesSection)}
                component="div"
                role="tabpanel"
                hidden={this.props.scene.openTab !== 3}
                id="vertical-tabpanel-3"
                aria-labelledby="vertical-tab-3">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box className={classes.fill}>
                    <SourceList
                      config={this.props.config}
                      library={this.props.library}
                      sources={this.props.scene.sources}
                      tutorial={this.props.tutorial == SDGT.final ? null : this.props.tutorial}
                      onClearBlacklist={this.props.onClearBlacklist.bind(this)}
                      onClip={this.props.onClip.bind(this)}
                      onEditBlacklist={this.props.onEditBlacklist.bind(this)}
                      onPlay={this.props.onPlay.bind(this)}
                      onUpdateScene={this.update.bind(this)}
                      systemMessage={this.props.systemMessage.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.scene.generatorWeights && this.props.scene.openTab === 4 && (
              <Typography
                className={clsx(this.props.scene.openTab === 4 && classes.generateSection)}
                component="div"
                role="tabpanel"
                hidden={this.props.scene.openTab !== 4}
                id="vertical-tabpanel-4"
                aria-labelledby="vertical-tab-4">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={1} className={classes.fill}>
                    <SceneGenerator
                      library={this.props.library}
                      scene={this.props.scene}
                      tags={this.props.tags}
                      tutorial={this.props.tutorial}
                      onTutorial={this.props.onTutorial.bind(this)}
                      onUpdateScene={this.props.onUpdateScene.bind(this)} />
                  </Box>
                </div>
              </Typography>
            )}

          </Container>
        </main>

        <Backdrop
          className={classes.backdrop}
          onClick={this.onCloseDialog.bind(this)}
          open={!this.props.tutorial && (this.state.openMenu == MO.new || this.state.drawerOpen)} />

        {this.props.scene.openTab == 3 && (
          <React.Fragment>
            {this.props.scene.sources.length > 0 && (
              <Tooltip title="Remove All Sources"  placement="left">
                <Fab
                  className={clsx(classes.addButton, classes.removeAllButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
                  onClick={this.onRemoveAll.bind(this)}
                  size="small">
                  <DeleteSweepIcon className={classes.icon} />
                </Fab>
              </Tooltip>
            )}
            <Dialog
              open={this.state.openMenu == MO.removeAllAlert}
              onClose={this.onCloseDialog.bind(this)}
              aria-labelledby="remove-all-title"
              aria-describedby="remove-all-description">
              <DialogTitle id="remove-all-title">Remove All Sources</DialogTitle>
              <DialogContent>
                <DialogContentText id="remove-all-description">
                  Are you sure you want to remove all sources from this scene?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                  Cancel
                </Button>
                <Button onClick={this.onFinishRemoveAll.bind(this)} color="primary">
                  OK
                </Button>
              </DialogActions>
            </Dialog>
            <Tooltip title="From Library"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.libraryImportButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
                onClick={this.onAddSource.bind(this, AF.library)}
                size="small">
                <LocalLibraryIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Local Video/Playlist"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addVideoButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
                onClick={this.onAddSource.bind(this, AF.videos)}
                size="small">
                <MovieIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Local Directory"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addDirectoryButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
                onClick={this.onAddSource.bind(this, AF.directory)}
                size="small">
                <FolderIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="URL"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addURLButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.openMenu != MO.new && classes.addButtonClose, this.props.tutorial == SDT.add2 && classes.highlight)}
                onClick={this.onAddSource.bind(this, AF.url)}
                size="small">
                <HttpIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Fab
              className={clsx(classes.addMenuButton, this.state.openMenu == MO.new && classes.backdropTop, (this.props.tutorial == SDT.add1 || this.props.tutorial == SDT.add2) && classes.backdropTop, this.props.tutorial == SDT.add1 && classes.highlight)}
              onClick={this.onToggleNewMenu.bind(this)}
              size="large">
              <AddIcon className={classes.icon} />
            </Fab>

            <URLDialog
              open={this.state.openMenu == MO.urlImport}
              onImportURL={this.onAddSource.bind(this)}
              onClose={this.onCloseDialog.bind(this)}
            />
            {this.props.scene.sources.length >= 2 && (
              <React.Fragment>
                <Fab
                  className={classes.sortMenuButton}
                  aria-haspopup="true"
                  aria-controls="sort-menu"
                  aria-label="Sort Sources"
                  onClick={this.onOpenSortMenu.bind(this)}
                  size="medium">
                  <SortIcon className={classes.icon} />
                </Fab>
                <Menu
                  id="sort-menu"
                  elevation={1}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  getContentAnchorEl={null}
                  anchorEl={this.state.menuAnchorEl}
                  keepMounted
                  classes={{paper: classes.sortMenu}}
                  open={this.state.openMenu == MO.sort}
                  onClose={this.onCloseDialog.bind(this)}>
                  {Object.values(SF).filter((sf) => sf != SF.random).map((sf) =>
                    <MenuItem key={sf}>
                      <ListItemText primary={en.get(sf)}/>
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={this.props.onSort.bind(this, this.props.scene, sf, true)}>
                          <ArrowUpwardIcon/>
                        </IconButton>
                        <IconButton edge="end" onClick={this.props.onSort.bind(this, this.props.scene, sf, false)}>
                          <ArrowDownwardIcon/>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </MenuItem>
                  )}
                  <MenuItem key={SF.random}>
                    <ListItemText primary={en.get(SF.random)}/>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={this.props.onSort.bind(this, this.props.scene, SF.random, true)}>
                        <ShuffleIcon/>
                      </IconButton>
                    </ListItemSecondaryAction>
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        {this.props.scene.openTab == 4 && (
          <React.Fragment>
            {this.props.scene.generatorWeights.length > 0 && (
              <React.Fragment>
                <Tooltip title="Remove All Rules" placement="top-end">
                  <Fab
                    className={classes.removeAllWGButton}
                    onClick={this.onRemoveAll.bind(this)}
                    size="small">
                    <DeleteSweepIcon className={classes.icon} />
                  </Fab>
                </Tooltip>
                <Dialog
                  open={this.state.openMenu == MO.removeAllAlert}
                  onClose={this.onCloseDialog.bind(this)}
                  aria-labelledby="remove-all-title"
                  aria-describedby="remove-all-description">
                  <DialogTitle id="remove-all-title">Delete Rules</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="remove-all-description">
                      Are you sure you want to remove all rules?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={this.onFinishRemoveAllRules.bind(this)} color="primary">
                      OK
                    </Button>
                  </DialogActions>
                </Dialog>
              </React.Fragment>
            )}
            <Tooltip title="Max" placement="top">
              <Fab
                className={clsx(classes.sortMenuButton, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.disable))}
                onClick={this.onOpenMaxMenu.bind(this)}
                size="medium">
                {this.props.scene.generatorMax}
              </Fab>
            </Tooltip>
            <Menu
              id="max-menu"
              elevation={1}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              getContentAnchorEl={null}
              anchorEl={this.state.menuAnchorEl}
              keepMounted
              classes={{paper: classes.maxMenu}}
              open={this.state.openMenu == MO.max}
              onClose={this.onCloseDialog.bind(this)}>
              <TextField
                label="Max"
                margin="dense"
                value={this.props.scene.generatorMax}
                onChange={this.onIntInput.bind(this, 'generatorMax')}
                onBlur={this.blurIntKey.bind(this, 'generatorMax')}
                inputProps={{
                  min: 1,
                  type: 'number',
                }}/>
            </Menu>
            <Tooltip title="Adv Rule"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addDirectoryButton, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.disable))}
                onClick={this.onAddAdvWG.bind(this)}
                size="small">
                <AddCircleOutlineIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Simple Rule"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addURLButton, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.highlight))}
                onClick={this.onOpenTagMenu.bind(this)}
                size="small">
                <AddIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Generate Sources" placement="top-end">
              <span className={clsx(classes.generateTooltip, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.disable), this.props.tutorial == SDGT.generate && classes.backdropTop)}
                    style={!areWeightsValid(this.props.scene) ? { pointerEvents: "none" } : {}}>
                <Fab
                  disabled={!areWeightsValid(this.props.scene)}
                  className={clsx(classes.addMenuButton, this.props.tutorial == SDGT.generate && classes.highlight)}
                  onClick={this.onGenerate.bind(this)}
                  size="large">
                  <Badge
                    color="secondary"
                    max={100}
                    invisible={areWeightsValid(this.props.scene)}
                    badgeContent={this.getRemainingPercent()}>
                    <CachedIcon className={classes.icon} />
                  </Badge>
                </Fab>
              </span>
            </Tooltip>
            <Menu
              elevation={1}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              getContentAnchorEl={null}
              anchorEl={this.state.menuAnchorEl}
              keepMounted
              className={clsx(this.props.tutorial == SDGT.buttons && classes.backdropTop)}
              classes={{paper: clsx(classes.tagMenu, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.highlight))}}
              open={this.state.openMenu == MO.simpleRule}
              onClose={this.onCloseDialog.bind(this)}>
              {this.state.openMenu == MO.simpleRule &&
                <LibrarySearch
                  displaySources={this.props.library}
                  filters={this.props.scene.generatorWeights.filter((wg) => !wg.rules).map((wg) => wg.name)}
                  tags={this.props.tags}
                  placeholder={"Search ..."}
                  autoFocus
                  onlyTagsAndTypes
                  onlyUsed
                  menuIsOpen
                  controlShouldRenderValue={false}
                  onUpdateFilters={this.onAddSimpleWG.bind(this)}/>
              }
            </Menu>
          </React.Fragment>
        )}
        <Snackbar
          open={!!this.state.snackbar}
          autoHideDuration={5000}
          ClickAwayListenerProps={{mouseEvent: false}}
          onClose={this.onCloseSnackbar.bind(this)}
          TransitionComponent={(props) => <Slide {...props} direction="up"/>}>
          <SnackbarContent
            message={
              <span className={classes.snackbarMessage}>
                {this.state.snackbarType == SB.warning && (
                  <WarningIcon color="inherit" className={classes.snackbarIcon}/>
                )}
                {this.state.snackbar}
              </span>
            }
          />
        </Snackbar>
      </div>
    )
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  componentDidUpdate(props: any) {
    if (!props.autoEdit && this.props.autoEdit) {
      this.setState({isEditingName: this.props.scene.name});
    }
  }

  // Use alt+P to access import modal
  // Use alt+U to toggle highlighting untagged sources
  onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'p' || e.key == 'π')) {
      this.setState({openMenu: this.state.openMenu == MO.urlImport ? null : MO.urlImport});
    }
  };

  onCloseSnackbar() {
    this.setState({snackbar: null, snackbarType: null});
  }

  onOpenMaxMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.max});
  }

  onPlayScene() {
    if (this.props.tutorial == SDT.play) {
      this.props.onTutorial(SDT.play);
    }

    // Regenerate scene(s) before playback
    const generateScenes: Array<Scene> = []
    if (this.props.scene.regenerate && areWeightsValid(this.props.scene)) {
      generateScenes.push(this.props.scene);
    }
    if (this.props.scene.overlayEnabled) {
      for (let overlay of this.props.scene.overlays) {
        if (overlay.sceneID.toString().startsWith('999')) {
          const id = overlay.sceneID.toString().replace('999', '');
          const oScene = this.props.allSceneGrids.find((s) => s.id.toString() == id);
          for (let row of oScene.grid) {
            for (let sceneID of row) {
              const gScene = this.props.allScenes.find((s) => s.id == sceneID);
              if (gScene && gScene.generatorWeights && gScene.regenerate && areWeightsValid(gScene)) {
                generateScenes.push(gScene);
              }
            }
          }
        } else {
          const oScene = this.props.allScenes.find((s) => s.id == overlay.sceneID);
          if (oScene && oScene.generatorWeights && oScene.regenerate && areWeightsValid(oScene)) {
            generateScenes.push(oScene);
          }
        }
      }
    }
    if (generateScenes.length > 0) {
      this.props.onGenerate(generateScenes);
    }

    this.props.onPlayScene(this.props.scene);
  }

  getRemainingPercent(): number {
    let remaining = 100;
    for (let wg of this.props.scene.generatorWeights) {
      if (wg.type == TT.weight) {
        remaining = remaining - wg.percent;
      }
    }
    return remaining;
  }

  onGenerate() {
    this.props.onGenerate([this.props.scene]);
    this.generateCallback();
  }

  generateCallback() {
    if (this.props.scene.sources.length == 0) {
      this.setState({snackbar: "Sorry, no sources were found for these rules", snackbarType: SB.warning});
      if (this.props.tutorial == SDGT.generate) {
        this.props.onTutorial(SDGT.generateError);
      }
    } else {
      this.onChangeTab(null, 3);
      if (this.props.tutorial == SDGT.generate) {
        this.props.onTutorial(SDGT.generate);
      }
    }
  }

  onAddAdvWG() {
    const wg = new WeightGroup();
    wg.name = "Empty Adv Rule";
    wg.percent = 0;
    wg.type = TT.weight;
    wg.rules = [];
    const generatorWeights = this.props.scene.generatorWeights.concat([wg]);
    this.changeKey('generatorWeights', generatorWeights);
  }

  onAddSimpleWG(filters: Array<string>) {
    if (this.props.tutorial == SDGT.buttons) {
      this.props.onTutorial(SDGT.buttons);
      this.onCloseDialog();
    }
    const tagName = filters[filters.length - 1];
    let tag = this.props.tags.find((t) => t.name == tagName)
    if (tag == null) {
      const maxID = this.props.tags.reduce(
        (max, t) => (t.id > max ? t.id : max),
        this.props.tags[0] ? this.props.tags[0].id : 1
      );
      tag = new Tag({id: maxID+1, name: tagName, typeTag: true});
    }
    if (tag) {
      const wg = new WeightGroup();
      wg.name = tag.name;
      wg.percent = 0;
      wg.type = TT.weight;
      wg.tag = tag;
      const generatorWeights = this.props.scene.generatorWeights.concat([wg]);
      this.changeKey('generatorWeights', generatorWeights);
    }
  }

  onFinishRemoveAllRules() {
    this.changeKey('generatorWeights', []);
  }

  onOpenTagMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.simpleRule});
  }

  onAddSource(addFunction: string, e: MouseEvent, ...args: any[]) {
    this.onCloseDialog();
    if (this.props.tutorial == SDT.add2) {
      this.props.onTutorial(SDT.add2);
      this.props.onAddSource(this.props.scene, "tutorial");
    } else if (addFunction == AF.videos && e.shiftKey) {
        this.props.onAddSource(this.props.scene, AF.videoDir, ...args);
    } else {
      this.props.onAddSource(this.props.scene, addFunction, ...args);
    }
  }

  onToggleDrawer() {
    this.setState({drawerOpen: !this.state.drawerOpen});
  }

  onToggleNewMenu() {
    if (this.props.tutorial == SDT.add1) {
      this.props.onTutorial(SDT.add1);
    }
    this.setState({openMenu: this.state.openMenu == MO.new ? null : MO.new});
  }

  onOpenSortMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.sort});
  }

  onCloseDialog() {
    this.setState({menuAnchorEl: null, openMenu: null, drawerOpen: false});
  }

  onChangeTab(e: any, newTab: number) {
    if (this.props.tutorial == SDT.options1) {
      this.props.onTutorial(SDT.options1);
      this.setState({drawerOpen: false});
    }
    if (this.props.tutorial == SDT.effects1) {
      this.props.onTutorial(SDT.effects1);
      this.setState({drawerOpen: false});
    }
    this.changeKey('openTab', newTab);
  }

  blurIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.props.scene as any)[key] < min) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.scene as any)[key] > max) {
      this.changeIntKey(key, max);
    }
  }

  changeIntKey(key:string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  onIntInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value === '' ? '' : Number(input.value));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  beginEditingName() {
    this.setState({isEditingName: this.props.scene.name});
  }

  endEditingName(e: Event) {
    e.preventDefault();
    this.changeKey('name', this.state.isEditingName);
    this.setState({isEditingName: null});
  }

  onChangeName(e: React.FormEvent<HTMLInputElement>) {
    this.setState({isEditingName:  e.currentTarget.value});
  }

  onDeleteScene() {
    if (this.props.config.generalSettings.confirmSceneDeletion) {
      this.setState({openMenu: MO.deleteAlert});
    } else {
      this.props.onDelete(this.props.scene);
    }
  }

  onFinishDeleteScene() {
    this.props.onDelete(this.props.scene);
  }

  onRemoveAll() {
    this.setState({openMenu: MO.removeAllAlert});
  }

  onFinishRemoveAll() {
    this.update((s) => s.sources = []);
    this.onCloseDialog();
  }
}

(SceneDetail as any).displayName="SceneDetail";
export default withStyles(styles)(SceneDetail as any);