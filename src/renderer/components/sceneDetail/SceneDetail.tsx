import * as React from "react";
import clsx from "clsx";

import {
  Alert,
  AppBar,
  Backdrop,
  Badge,
  Box,
  Button,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Slide,
  Snackbar,
  SvgIcon,
  Tab,
  Tabs,
  TextField,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import BuildIcon from '@mui/icons-material/Build';
import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CollectionsIcon from '@mui/icons-material/Collections';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import FolderIcon from '@mui/icons-material/Folder';
import HttpIcon from '@mui/icons-material/Http';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import MenuIcon from'@mui/icons-material/Menu';
import MovieIcon from '@mui/icons-material/Movie';
import PhotoFilterIcon from '@mui/icons-material/PhotoFilter';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PublishIcon from '@mui/icons-material/Publish';
import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from '@mui/icons-material/Save';
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SortIcon from '@mui/icons-material/Sort';

import {AF, MO, SDGT, SDT, SF, SS, ST, TT, WF} from "../../data/const";
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
import {applyEffects, areWeightsValid, getEffects, getTimestampValue} from "../../data/utils";
import {getSourceType} from "../player/Scrapers";
import Audio from "../../data/Audio";
import CaptionScript from "../../data/CaptionScript";
import SceneGrid from "../../data/SceneGrid";
import PiwigoDialog from "./PiwigoDialog";
import SourceIcon from "../library/SourceIcon";

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
    right: 190,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  overrideOn: {
    backgroundColor: theme.palette.primary.dark,
  },
  overrideOff: {
    backgroundColor: theme.palette.secondary.dark,
  },
  overrideIgnoreWGButton: {
    margin: 0,
    top: 'auto',
    right: 135,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
    transition: theme.transitions.create('height', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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
  weightButton: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    margin: 0,
    top: 'auto',
    right: 135,
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
  piwigoImportButton: {
    marginBottom: 280,
  },
  removeAllButton: {
    backgroundColor: theme.palette.error.main,
    marginBottom: 280,
  },
  removeAllButtonAlt: {
    marginBottom: 335,
  },
  addButtonClose: {
    marginBottom: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  importBadge:{
    top: 'auto',
    right: 30,
    bottom: 50,
    left: 'auto',
    position: 'fixed',
    zIndex: theme.zIndex.fab + 1,
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
  },
  phraseInput: {
    minWidth: 550,
    minHeight: 100,
  },
  confirmCopy: {
    color: theme.palette.success.main,
    position: 'absolute',
  },
  librarySearch: {
    position: 'absolute',
    right: 95,
  }
});

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />;
}

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
    onDownload(source: LibrarySource): void;
    onEditBlacklist(sourceURL: string, blacklist: string): void,
    onExport(scene: Scene): void,
    onGenerate(scene: Scene | SceneGrid, children?: boolean, force?: boolean): void,
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
    snackbarOpen: false,
    snackbar: null as string,
    snackbarSeverity: null as string,
    sceneEffects: "",
    confirmCopy: false,
    displaySources: Array<LibrarySource>(),
    filters: Array<string>(),
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;
    const piwigoConfigured = this.props.config.remoteSettings.piwigoProtocol != "" &&
      this.props.config.remoteSettings.piwigoHost != "";
    return (
      <div className={classes.root}>

        <AppBar enableColorOnDark position="absolute" className={clsx(classes.appBar, (this.props.tutorial == SDT.title || this.props.tutorial == SDT.play) && classes.backdropTop)}>
          <Toolbar>
            <Tooltip disableInteractive title="Back" placement="right-end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                onClick={this.props.goBack.bind(this)}
                size="large">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>

            {this.state.isEditingName != null && (
              <form onSubmit={this.endEditingName.bind(this)} className={classes.titleField}>
                <TextField
                  variant="standard"
                  autoFocus
                  fullWidth
                  id="title"
                  value={this.state.isEditingName}
                  margin="none"
                  inputProps={{className: classes.titleInput}}
                  onBlur={this.endEditingName.bind(this)}
                  onChange={this.onChangeName.bind(this)} />
              </form>
            )}
            {this.state.isEditingName == null && (
              <React.Fragment>
                <div className={classes.fill}/>
                <Typography component="h1" variant="h4" color="inherit" noWrap
                            className={clsx(classes.title, this.props.scene.name.length == 0 && classes.noTitle, this.props.tutorial == SDT.title && classes.highlight)}
                            onClick={this.beginEditingName.bind(this)}>
                  {this.props.scene.name}
                </Typography>
                <div className={classes.fill}/>
              </React.Fragment>
            )}

            {this.props.scene.openTab == 3 && (
              <div className={classes.librarySearch}>
                <LibrarySearch
                  displaySources={this.state.displaySources}
                  filters={this.state.filters}
                  tags={this.props.tags}
                  placeholder={"Search ..."}
                  isCreatable
                  onlyUsed
                  onUpdateFilters={this.onUpdateFilters.bind(this)}/>
              </div>
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
            <IconButton onClick={this.onToggleDrawer.bind(this)} size="large">
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
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : `Clone ${this.props.scene.generatorWeights ? 'Generator' : 'Scene'}`}>
              <ListItem button onClick={this.props.onCloneScene.bind(this, this.props.scene)} className={clsx((this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <FileCopyIcon />
                </ListItemIcon>
                <ListItemText primary={`Clone ${this.props.scene.generatorWeights ? 'Generator' : 'Scene'}`} />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Scene Effects Import/Export"}>
              <ListItem button onClick={this.onOpenSceneEffectsMenu.bind(this)} className={clsx((this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <SvgIcon viewBox="0 0 488.472 488.472">
                    <path d="m331.351 96.061c-5.963-5.963-15.622-5.963-21.585 0l-305.294 305.294c-5.963 5.963-5.963 15.622 0 21.585l61.059 61.059c2.981 2.981 6.887 4.472 10.793 4.472s7.811-1.491 10.793-4.472l305.293-305.294c5.963-5.963 5.963-15.622 0-21.585 0 0-61.059-61.059-61.059-61.059zm-255.028 355.561-39.473-39.474 207.385-207.385 39.474 39.474c0-.001-207.386 207.385-207.386 207.385zm228.971-228.971-39.474-39.474 54.738-54.738 39.474 39.474z"/>
                    <path d="m213.707 122.118c15.265-30.529 30.529-45.794 61.059-61.059-30.529-15.265-45.794-30.529-61.059-61.059-15.265 30.529-30.531 45.794-61.059 61.059 30.53 15.265 45.794 30.53 61.059 61.059z"/>
                    <path d="m457.942 213.707c-7.632 15.265-15.267 22.897-30.529 30.529 15.265 7.632 22.897 15.265 30.529 30.529 7.632-15.265 15.265-22.897 30.529-30.529-15.264-7.632-22.896-15.265-30.529-30.529z"/>
                    <path d="m457.942 45.795c-22.897-11.449-34.346-22.897-45.794-45.794-11.449 22.897-22.899 34.346-45.794 45.794 22.897 11.449 34.346 22.897 45.794 45.794 11.449-22.897 22.897-34.346 45.794-45.794z"/>
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText primary="Export Scene Effects" />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Export Scene"}>
              <ListItem button onClick={this.props.onExport.bind(this, this.props.scene)} className={clsx((this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <PublishIcon />
                </ListItemIcon>
                <ListItemText primary="Export Scene" />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Restore Defaults"}>
              <ListItem button onClick={this.props.onResetScene.bind(this, this.props.scene)} className={clsx((this.props.tutorial == SDT.options1 || this.props.tutorial == SDT.effects1) && classes.disable)}>
                <ListItemIcon>
                  <RestoreIcon/>
                </ListItemIcon>
                <ListItemText primary={"Restore Defaults"} />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Delete Scene"}>
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
              <Typography component="div">
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
              <Typography component="div">
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
              <Typography component="div">
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
                component="div">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box className={classes.fill}>
                    <SourceList
                      config={this.props.config}
                      library={this.props.library}
                      sources={this.state.displaySources}
                      tutorial={this.props.tutorial == SDGT.final ? null : this.props.tutorial}
                      useWeights={this.props.scene.weightFunction == WF.sources && this.props.scene.useWeights}
                      onClearBlacklist={this.props.onClearBlacklist.bind(this)}
                      onClip={this.props.onClip.bind(this)}
                      onDownload={this.props.onDownload.bind(this)}
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
                component="div">
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

        <Dialog
          open={this.state.openMenu == MO.effects}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="effects-all-title"
          aria-describedby="effects-all-description">
          <DialogTitle id="effects-all-title">Scene Effects Import/Export</DialogTitle>
          <DialogContent>
            <TextField
              variant="standard"
              fullWidth
              multiline
              label="Scene Effects Hash"
              helperText="Copy this hash to share with others, or paste a hash here to import."
              id="phrase"
              value={this.state.sceneEffects}
              margin="dense"
              inputProps={{className: classes.phraseInput}}
              onChange={this.onChangeSceneEffects.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCopySceneEffects.bind(this)} color="secondary">
              {this.state.confirmCopy && <CheckCircleIcon className={classes.confirmCopy}/>}
              Copy to Clipboard
            </Button>
            <Button onClick={this.onApplySceneEffects.bind(this)} color="primary">
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        {this.props.scene.openTab == 3 && (
          <React.Fragment>
            {this.props.scene.sources.length > 0 && (
              <Tooltip disableInteractive title={this.state.filters.length == 0 ? "Remove All Sources" : "Remove These Sources"}  placement="left">
                <Fab
                  className={clsx(classes.addButton, !piwigoConfigured && classes.removeAllButton, piwigoConfigured && classes.removeAllButtonAlt, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
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
              {this.state.filters.length == 0 && (
                <React.Fragment>
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
                </React.Fragment>
              )}
              {this.state.filters.length > 0 && (
                <React.Fragment>
                  <DialogTitle id="remove-all-title">Remove Sources</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="remove-all-description">
                      Are you sure you want to remove these sources from this scene?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={this.onFinishRemoveVisible.bind(this)} color="primary">
                      OK
                    </Button>
                  </DialogActions>
                </React.Fragment>
              )}
            </Dialog>
            {piwigoConfigured &&
              <Tooltip disableInteractive title="From Piwigo"  placement="left">
                <Fab
                  className={clsx(classes.addButton, classes.piwigoImportButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
                  onClick={this.onOpenPiwigoMenu.bind(this)}
                  size="small">
                  <SourceIcon type={ST.piwigo} className={classes.icon} />
                </Fab>
              </Tooltip>
            }
            <Tooltip disableInteractive title="From Library"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.libraryImportButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
                onClick={this.onAddSource.bind(this, AF.library)}
                size="small">
                <LocalLibraryIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title="Local Video/Playlist"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addVideoButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
                onClick={this.onAddSource.bind(this, AF.videos)}
                size="small">
                <MovieIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title="Local Directory"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addDirectoryButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.props.tutorial && classes.disable)}
                onClick={this.onAddSource.bind(this, AF.directory)}
                size="small">
                <FolderIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title="URL"  placement="left">
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

            <PiwigoDialog 
              config={this.props.config}
              open={this.state.openMenu == MO.piwigo}
              onClose={this.onCloseDialog.bind(this)}
              onImportURL={this.onAddSource.bind(this)}
            />

            {this.props.scene.sources.length >= 2 && (
              <React.Fragment>
                {this.props.scene.weightFunction == WF.sources && (
                  <Fab
                    className={classes.weightButton}
                    onClick={this.onToggleWeight.bind(this)}
                    size="medium">
                    <SvgIcon viewBox="0 0 489.183 489.183" fontSize="small">
                      <path d="M487.106,259.27c-2.808-4.906-8.032-7.918-13.678-7.918h-3.219L411.005,56.795c-4.736-15.562-20.915-24.607-36.652-20.492
                              l-104.48,27.322V30.391c0-13.967-11.317-25.284-25.283-25.284c-13.966,0-25.283,11.317-25.283,25.284V76.9l-111.262,28.928
                              c-13.496,3.509-24.215,13.759-28.349,27.077C62.657,187.792,18.954,329.07,18.954,329.07h-3.203c-5.653,0-10.864,3.029-13.67,7.926
                              c-2.807,4.905-2.774,10.938,0.09,15.801c19.045,32.304,54.188,53.99,94.409,53.99c40.22,0,75.354-21.679,94.399-53.99
                              c2.871-4.864,2.913-10.904,0.106-15.81c-2.806-4.905-8.033-7.917-13.679-7.917h-3.217l-61.611-198.008l106.728-28.022V433.51
                              h-75.848c-13.966,0-25.283,11.316-25.283,25.283c0,13.966,11.317,25.282,25.283,25.282h202.263
                              c13.966,0,25.283-11.316,25.283-25.282c0-13.967-11.317-25.283-25.283-25.283h-75.849V89.763l103.881-27.267l-58.78,188.856h-3.202
                              c-5.654,0-10.864,3.029-13.671,7.925c-2.806,4.905-2.772,10.938,0.092,15.803c19.043,32.303,54.186,53.989,94.406,53.989
                              s75.355-21.678,94.398-53.989C489.872,270.216,489.913,264.176,487.106,259.27z M147.714,329.07H45.439l51.142-164.339
                              L147.714,329.07z M341.458,251.353l51.142-164.338l51.134,164.338H341.458z"/>
                    </SvgIcon>
                  </Fab>
                )}
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
                  anchorEl={this.state.menuAnchorEl}
                  keepMounted
                  classes={{paper: classes.sortMenu}}
                  open={this.state.openMenu == MO.sort}
                  onClose={this.onCloseDialog.bind(this)}>
                  {Object.values(SF).filter((sf) => sf != SF.random).map((sf) =>
                    <MenuItem key={sf}>
                      <ListItemText primary={en.get(sf)}/>
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={this.props.onSort.bind(this, this.props.scene, sf, true)}
                          size="large">
                          <ArrowUpwardIcon/>
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={this.props.onSort.bind(this, this.props.scene, sf, false)}
                          size="large">
                          <ArrowDownwardIcon/>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </MenuItem>
                  )}
                  <MenuItem key={SF.random}>
                    <ListItemText primary={en.get(SF.random)}/>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={this.props.onSort.bind(this, this.props.scene, SF.random, true)}
                        size="large">
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
                <Tooltip disableInteractive title="Remove All Rules" placement="top-end">
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
            <Tooltip disableInteractive title={this.props.scene.overrideIgnore ? "Overriding globally ignored tags/types" : "Respecting globally ignored tags/types"} placement="top-end">
              <Fab
                className={clsx(classes.overrideIgnoreWGButton, this.props.scene.overrideIgnore && classes.overrideOn, !this.props.scene.overrideIgnore && classes.overrideOff)}
                onClick={this.onToggleOverrideIgnore.bind(this)}
                size="medium">
                {this.props.scene.overrideIgnore && <FilterListOffIcon className={classes.icon} />}
                {!this.props.scene.overrideIgnore && <FilterListIcon className={classes.icon} />}
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title="Max" placement="top">
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
              anchorEl={this.state.menuAnchorEl}
              keepMounted
              classes={{paper: classes.maxMenu}}
              open={this.state.openMenu == MO.max}
              onClose={this.onCloseDialog.bind(this)}>
              <TextField
                variant="standard"
                label="Max"
                margin="dense"
                value={this.props.scene.generatorMax}
                onChange={this.onIntInput.bind(this, 'generatorMax')}
                onBlur={this.blurIntKey.bind(this, 'generatorMax')}
                inputProps={{
                  min: 1,
                  type: 'number',
                }} />
            </Menu>
            <Tooltip disableInteractive title="Adv Rule"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addDirectoryButton, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.disable))}
                onClick={this.onAddAdvRule.bind(this)}
                size="small">
                <AddCircleOutlineIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title="Simple Rule"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addURLButton, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.highlight))}
                onClick={this.onOpenTagMenu.bind(this)}
                size="small">
                <AddIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title="Generate Sources" placement="top-end">
              <span className={clsx(classes.generateTooltip, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.disable), this.props.tutorial == SDGT.generate && classes.backdropTop)}
                    style={!areWeightsValid(this.props.scene) ? { pointerEvents: "none" } : {}}>
                <Fab
                  disabled={!areWeightsValid(this.props.scene)}
                  className={clsx(classes.addMenuButton, this.props.tutorial == SDGT.generate && classes.highlight)}
                  onClick={this.onGenerate.bind(this)}
                  size="large">
                  <Badge
                    classes={{
                      badge: classes.importBadge
                    }}
                    overlap="circular"
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
              anchorEl={this.state.menuAnchorEl}
              keepMounted
              className={clsx(this.props.tutorial == SDGT.buttons && classes.backdropTop)}
              classes={{paper: clsx(classes.tagMenu, this.props.tutorial == SDGT.buttons && clsx(classes.backdropTop, classes.highlight))}}
              open={this.state.openMenu == MO.simpleRule}
              onClose={this.onCloseDialog.bind(this)}>
              {this.state.openMenu == MO.simpleRule &&
                <LibrarySearch
                  displaySources={this.props.library}
                  filters={this.props.scene.generatorWeights.filter((wg) => !wg.rules).map((wg) => wg.search)}
                  tags={this.props.tags}
                  placeholder={"Search ..."}
                  autoFocus
                  isCreatable
                  fullWidth
                  onlyUsed
                  menuIsOpen
                  controlShouldRenderValue={false}
                  onUpdateFilters={this.onAddRule.bind(this)}/>
              }
            </Menu>
          </React.Fragment>
        )}
        <Snackbar
          open={this.state.snackbarOpen}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          autoHideDuration={5000}
          onClose={this.onCloseSnackbar.bind(this)}
          TransitionComponent={TransitionUp}>
          <Alert onClose={this.onCloseSnackbar.bind(this)} severity={this.state.snackbarSeverity as any}>
            {this.state.snackbar}
          </Alert>
        </Snackbar>
      </div>
    );
  }

  componentDidMount() {
    this.setState({displaySources: this.getDisplaySources()});
    window.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  componentDidUpdate(props: any, state:any) {
    if (state.filters != this.state.filters || props.scene.sources != this.props.scene.sources) {
      this.setState({displaySources: this.getDisplaySources()});
    }
    if (!props.autoEdit && this.props.autoEdit) {
      this.setState({isEditingName: this.props.scene.name});
    }
  }

  onUpdateFilters(filters: Array<string>) {
    this.setState({filters: filters, displaySources: this.getDisplaySources()});
  }

  // Use alt+P to access import modal
  // Use alt+U to toggle highlighting untagged sources
  onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'p' || e.key == 'π')) {
      this.setState({openMenu: this.state.openMenu == MO.urlImport ? null : MO.urlImport});
    }
  };

  onCloseSnackbar() {
    this.setState({snackbarOpen: false});
  }

  onOpenMaxMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.max});
  }

  onPlayScene() {
    if (this.props.tutorial == SDT.play) {
      this.props.onTutorial(SDT.play);
    }

    // Regenerate scene(s) before playback
    this.props.onGenerate(this.props.scene);
    this.props.onPlayScene(this.props.scene);
  }

  onToggleOverrideIgnore() {
    this.changeKey("overrideIgnore", !this.props.scene.overrideIgnore);
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
    this.props.onGenerate(this.props.scene, false, true);
    this.generateCallback();
  }

  generateCallback() {
    if (this.props.scene.sources.length == 0) {
      this.setState({snackbarOpen: true, snackbar: "Sorry, no sources were found for these rules", snackbarSeverity: SS.warning});
      if (this.props.tutorial == SDGT.generate) {
        this.props.onTutorial(SDGT.generateError);
      }
    } else {
      this.setState({snackbarOpen: true, snackbar: "Generated scene with " + this.props.scene.sources.length + " sources", snackbarSeverity: SS.success});
      if (this.props.tutorial == SDGT.generate) {
        this.props.onTutorial(SDGT.generate);
      }
    }
  }

  onAddAdvRule() {
    const wg = new WeightGroup();
    wg.percent = 0;
    wg.type = TT.weight;
    wg.rules = [];
    const generatorWeights = this.props.scene.generatorWeights.concat([wg]);
    this.changeKey('generatorWeights', generatorWeights);
  }

  onAddRule(filters: Array<string>) {
    if (this.props.tutorial == SDGT.buttons) {
      this.props.onTutorial(SDGT.buttons);
      this.onCloseDialog();
    }
    let generatorWeights = this.props.scene.generatorWeights
    for (let search of filters) {
      if (search.length > 0 && generatorWeights.find((wg) => wg.search == search) == null) {
        const wg = new WeightGroup();
        wg.percent = 0;
        wg.type = TT.weight;
        wg.search = search;
        generatorWeights = generatorWeights.concat([wg]);
      }
    }
    this.changeKey('generatorWeights', generatorWeights);
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

  onToggleWeight() {
    this.changeKey('useWeights', !this.props.scene.useWeights);
  }

  onOpenPiwigoMenu() {
    this.setState({openMenu: MO.piwigo});
  }

  onOpenSceneEffectsMenu() {
    this.setState({openMenu: MO.effects, sceneEffects: getEffects(this.props.scene)});
  }

  onCopySceneEffects() {
    navigator.clipboard.writeText(this.state.sceneEffects);
    this.setState({confirmCopy: true});
    setTimeout(() => {this.setState({confirmCopy: false})}, 1000);
  }

  onChangeSceneEffects(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({sceneEffects: input.value});
  }

  onApplySceneEffects() {
    this.props.onUpdateScene(this.props.scene,(s) => {
      applyEffects(s, this.state.sceneEffects);
    })
    this.onCloseDialog();
  }

  onCloseDialog() {
    this.setState({menuAnchorEl: null, openMenu: null, drawerOpen: false, sceneEffects: ""});
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

  onFinishRemoveVisible() {
    const displayIDs = this.state.displaySources.map((s) => s.id);
    this.update((s) => s.sources = s.sources.filter((s: LibrarySource) => !displayIDs.includes(s.id)));
    this.onCloseDialog();
  }

  getDisplaySources() {
    let displaySources = [];
    const filtering = this.state.filters.length > 0;
    if (filtering) {
      for (let source of this.props.scene.sources) {
        let matchesFilter = true;
        let countRegex;
        for (let filter of this.state.filters) {
          if (filter == "<Offline>") { // This is offline filter
            matchesFilter = source.offline;
          } else if (filter == "<Marked>") { // This is a marked filter
            matchesFilter = source.marked;
          } else if (filter == "<Untagged>") { // This is untagged filter
            matchesFilter = source.tags.length === 0;
          } else if (filter == "<Unclipped>") {
            matchesFilter = getSourceType(source.url) == ST.video && source.clips.length === 0;
          } else if ((filter.startsWith("[") || filter.startsWith("-[")) && filter.endsWith("]")) { // This is a tag filter
            if (filter.startsWith("-")) {
              let tag = filter.substring(2, filter.length-1);
              matchesFilter = source.tags.find((t) => t.name == tag) == null;
            } else {
              let tag = filter.substring(1, filter.length-1);
              matchesFilter = source.tags.find((t) => t.name == tag) != null;
            }
          } else if ((filter.startsWith("{") || filter.startsWith("-{")) && filter.endsWith("}")) { // This is a type filter
            if (filter.startsWith("-")) {
              let type = filter.substring(2, filter.length-1);
              matchesFilter = en.get(getSourceType(source.url)) != type;
            } else {
              let type = filter.substring(1, filter.length-1);
              matchesFilter = en.get(getSourceType(source.url)) == type;
            }
          } else if ((countRegex = /^count(\+?)([>=<])(\d*)$/.exec(filter)) != null) {
            const all = countRegex[1] == "+";
            const symbol = countRegex[2];
            const value = parseInt(countRegex[3]);
            const type = getSourceType(source.url);
            const count = type == ST.video ? source.clips.length : source.count;
            const countComplete = type == ST.video ? true : source.countComplete;
            switch (symbol) {
              case "=":
                matchesFilter = (all || countComplete) && count == value;
                break;
              case ">":
                matchesFilter = (all || countComplete) && count > value;
                break;
              case "<":
                matchesFilter = (all || countComplete) && count < value;
                break;
            }
          } else if ((countRegex = /^duration([>=<])([\d:]*)$/.exec(filter)) != null) {
            const symbol = countRegex[1];
            let value;
            if (countRegex[2].includes(":")) {
              value = getTimestampValue(countRegex[2]);
            } else {
              value = parseInt(countRegex[2]);
            }
            const type = getSourceType(source.url);
            if (type == ST.video) {
              if (source.duration == null) {
                matchesFilter = false;
              } else {
                switch (symbol) {
                  case "=":
                    matchesFilter = Math.floor(source.duration) == value;
                    break;
                  case ">":
                    matchesFilter = Math.floor(source.duration) > value;
                    break;
                  case "<":
                    matchesFilter = Math.floor(source.duration) < value;
                    break;
                }
              }
            } else {
              matchesFilter = false;
            }
          } else if ((countRegex = /^resolution([>=<])(\d*)p?$/.exec(filter)) != null) {
            const symbol = countRegex[1];
            const value = parseInt(countRegex[2]);

            const type = getSourceType(source.url);
            if (type == ST.video) {
              if (source.resolution == null) {
                matchesFilter = false;
              } else {
                switch (symbol) {
                  case "=":
                    matchesFilter = source.resolution == value;
                    break;
                  case ">":
                    matchesFilter = source.resolution > value;
                    break;
                  case "<":
                    matchesFilter = source.resolution < value;
                    break;
                }
              }
            } else {
              matchesFilter = false;
            }
          } else if (((filter.startsWith('"') || filter.startsWith('-"')) && filter.endsWith('"')) ||
            ((filter.startsWith('\'') || filter.startsWith('-\'')) && filter.endsWith('\''))) {
            if (filter.startsWith("-")) {
              filter = filter.substring(2, filter.length - 1);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = !regex.test(source.url);
            } else {
              filter = filter.substring(1, filter.length - 1);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = regex.test(source.url);
            }
          } else { // This is a search filter
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = !regex.test(source.url);
            } else {
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = regex.test(source.url);
            }
          }
          if (!matchesFilter) break;
        }
        if (matchesFilter) {
          displaySources.push(source);
        }
      }
    } else {
      displaySources = this.props.scene.sources;
    }
    return displaySources;
  }
}

(SceneDetail as any).displayName="SceneDetail";
export default withStyles(styles)(SceneDetail as any);