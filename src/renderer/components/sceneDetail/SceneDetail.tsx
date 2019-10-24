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
import BuildIcon from '@material-ui/icons/Build';
import CachedIcon from '@material-ui/icons/Cached';
import CollectionsIcon from '@material-ui/icons/Collections';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import FolderIcon from '@material-ui/icons/Folder';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import MenuIcon from'@material-ui/icons/Menu';
import MovieIcon from '@material-ui/icons/Movie';
import PhotoFilterIcon from '@material-ui/icons/PhotoFilter';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import PublishIcon from '@material-ui/icons/Publish';
import SaveIcon from '@material-ui/icons/Save';
import SortIcon from '@material-ui/icons/Sort';
import WarningIcon from '@material-ui/icons/Warning';

import {AF, MO, OF, SB, SF, TT, WF} from "../../data/const";
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
import SourceList from "../library/SourceList";

const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    ...theme.mixins.toolbar
  },
  title: {
    textAlign: 'center',
  },
  titleField: {
    width: '100%',
    margin: 0,
  },
  titleInput: {
    color: theme.palette.common.white,
    textAlign: 'center',
    fontSize: theme.typography.h4.fontSize,
  },
  noTitle: {
    width: theme.spacing(7),
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
    backgroundColor: (theme.palette.primary as any)["50"],
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
  sourcesTab: {
    ariaControls: 'vertical-tabpanel-2',
  },
  generateTab: {
    ariaControls: 'vertical-tabpanel-3',
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
  maxMenu: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    width: 100,
  },
  sortMenu: {
    width: 200,
  },
  tagMenu: {
    maxHeight: 400,
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
    zIndex: theme.zIndex.modal + 1,
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

class SceneDetail extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    autoEdit: boolean,
    config: Config,
    library: Array<LibrarySource>,
    scene: Scene,
    tags: Array<Tag>,
    goBack(): void,
    onAddSource(scene: Scene, type: string, ...args: any[]): void,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource): void,
    onDelete(scene: Scene): void,
    onExport(scene: Scene): void,
    onGenerate(scene: Scene): void,
    onPlayScene(scene: Scene): void,
    onPlay(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onSaveAsScene(scene: Scene): void,
    onSort(scene: Scene, algorithm: string, ascending: boolean): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  readonly state = {
    isEditingName: this.props.autoEdit,
    drawerOpen: false,
    menuAnchorEl: null as any,
    openMenu: null as string,
    openTab: this.props.scene.generatorWeights ? 3 : 2,
    snackbar: null as string,
    snackbarType: null as string,
  };

  readonly nameInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;
    return (
      <div className={classes.root} onKeyDown={this.secretHotkey.bind(this)} tabIndex={0}>

        <AppBar position="absolute" className={classes.appBar}>
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

            {/*TODO Drive this off state so it responds faster*/}
            {this.state.isEditingName && (
              <form onSubmit={this.endEditingName.bind(this)} className={classes.titleField}>
                <TextField
                  autoFocus
                  fullWidth
                  id="title"
                  value={this.props.scene.name}
                  margin="none"
                  ref={this.nameInputRef}
                  inputProps={{className: classes.titleInput}}
                  onBlur={this.endEditingName.bind(this)}
                  onChange={this.onChangeName.bind(this)}
                />
              </form>
            )}
            {!this.state.isEditingName && (
              <React.Fragment>
                <div className={classes.fill}/>
                <Typography component="h1" variant="h4" color="inherit" noWrap
                            className={clsx(classes.title, this.props.scene.name.length == 0 && classes.noTitle)} onClick={this.beginEditingName.bind(this)}>
                  {this.props.scene.name}
                </Typography>
                <div className={classes.fill}/>
              </React.Fragment>
            )}

            <IconButton
              edge="start"
              color="inherit"
              aria-label="Play"
              onClick={this.props.onPlayScene.bind(this)}>
              <PlayCircleOutlineIcon fontSize="large"/>
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          className={clsx(classes.drawer, this.state.drawerOpen && classes.backdropTop)}
          variant="permanent"
          classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)}}
          open={this.state.drawerOpen}>
          <Collapse in={!open}>
            <div className={classes.appBarSpacer} />
          </Collapse>

          <ListItem className={classes.drawerButton}>
            <IconButton onClick={this.onToggleDrawer.bind(this)}>
              <MenuIcon className={classes.drawerIcon}/>
            </IconButton>
          </ListItem>

          <Divider />

          <div>
            <Tabs
              orientation="vertical"
              value={this.state.openTab}
              onChange={this.onChangeTab.bind(this)}
              aria-label="scene detail tabs"
              className={classes.tabs}>
              <Tab id="vertical-tab-0"
                   aria-controls="vertical-tabpanel-0"
                   icon={<BuildIcon/>} label={open ? "Options" : ""}
                   className={clsx(classes.tab, classes.optionsTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-1"
                   aria-controls="vertical-tabpanel-1"
                   icon={<PhotoFilterIcon/>} label={open ? "Effects" : ""}
                   className={clsx(classes.tab, classes.effectsTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-2"
                   aria-controls="vertical-tabpanel-2"
                   icon={<CollectionsIcon/>} label={open ? `Sources (${this.props.scene.sources.length})` : ""}
                   className={clsx(classes.tab, classes.sourcesTab, !open && classes.tabClose)}/>
              {this.props.scene.generatorWeights && (
                <Tab id="vertical-tab-3"
                     aria-controls="vertical-tabpanel-3"
                     icon={<LocalOfferIcon/>} label={open ? "Generate" : ""}
                     className={clsx(classes.tab, classes.generateTab, !open && classes.tabClose)}/>
              )}
            </Tabs>
          </div>
          <div className={classes.fill}/>

          <div>
            {this.props.scene.generatorWeights && (
              <ListItem button onClick={this.props.onSaveAsScene.bind(this, this.props.scene)}>
                <ListItemIcon>
                  <SaveIcon />
                </ListItemIcon>
                <ListItemText primary="Save as Scene" />
              </ListItem>
            )}
            <ListItem button onClick={this.props.onExport.bind(this, this.props.scene)}>
              <ListItemIcon>
                <PublishIcon />
              </ListItemIcon>
              <ListItemText primary="Export Scene" />
            </ListItem>
            <ListItem button onClick={this.onDeleteScene.bind(this, this.props.scene)}
                      className={classes.deleteItem}>
              <ListItemIcon>
                <DeleteForeverIcon color="error"/>
              </ListItemIcon>
              <ListItemText primary="Delete Scene" />
            </ListItem>
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

            {this.state.openTab === 0 && (
              <Typography
                component="div"
                role="tabpanel"
                hidden={this.state.openTab !== 0}
                id="vertical-tabpanel-0"
                aria-labelledby="vertical-tab-0">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <SceneOptions
                      allScenes={this.props.allScenes}
                      scene={this.props.scene}
                      onUpdateScene={this.props.onUpdateScene.bind(this)} />
                  </Box>
                </div>
              </Typography>
            )}

            {this.state.openTab === 1 && (
              <Typography
                component="div"
                role="tabpanel"
                hidden={this.state.openTab !== 1}
                id="vertical-tabpanel-1"
                aria-labelledby="vertical-tab-1">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <SceneEffects
                      scene={this.props.scene}
                      onUpdateScene={this.props.onUpdateScene.bind(this)} />
                  </Box>
                </div>
              </Typography>
            )}

            {this.state.openTab === 2 && (
              <Typography
                className={clsx(this.state.openTab === 2 && classes.sourcesSection)}
                component="div"
                role="tabpanel"
                hidden={this.state.openTab !== 2}
                id="vertical-tabpanel-2"
                aria-labelledby="vertical-tab-2">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box className={classes.fill}>
                    <SourceList
                      config={this.props.config}
                      sources={this.props.scene.sources}
                      onClearBlacklist={this.props.onClearBlacklist.bind(this)}
                      onClip={this.props.onClip.bind(this)}
                      onPlay={this.props.onPlay.bind(this)}
                      onUpdateSources={this.onUpdateSources.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.scene.generatorWeights && this.state.openTab === 3 && (
              <Typography
                className={clsx(this.state.openTab === 3 && classes.generateSection)}
                component="div"
                role="tabpanel"
                hidden={this.state.openTab !== 3}
                id="vertical-tabpanel-3"
                aria-labelledby="vertical-tab-3">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={1} className={classes.fill}>
                    <SceneGenerator
                      scene={this.props.scene}
                      tags={this.props.tags}
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
          open={this.state.openMenu == MO.new || this.state.drawerOpen} />

        {this.state.openTab == 2 && (
          <React.Fragment>
            {this.props.scene.sources.length > 0 && (
              <Tooltip title="Remove All Sources"  placement="left">
                <Fab
                  className={clsx(classes.addButton, classes.removeAllButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop)}
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
                className={clsx(classes.addButton, classes.libraryImportButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop)}
                onClick={this.onAddSource.bind(this, AF.library)}
                size="small">
                <LocalLibraryIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Local Video"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addVideoButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop)}
                onClick={this.onAddSource.bind(this, AF.videos)}
                size="small">
                <MovieIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Local Directory"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addDirectoryButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop)}
                onClick={this.onAddSource.bind(this, AF.directory)}
                size="small">
                <FolderIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="URL"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addURLButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop)}
                onClick={this.onAddSource.bind(this, AF.url)}
                size="small">
                <HttpIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Fab
              className={clsx(classes.addMenuButton, this.state.openMenu == MO.new && classes.backdropTop)}
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
                  {Object.values(SF).map((sf) =>
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
                </Menu>
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        {this.state.openTab == 3 && (
          <React.Fragment>
            {this.props.scene.generatorWeights.length > 0 && (
              <React.Fragment>
                <Fab
                  className={classes.removeAllWGButton}
                  onClick={this.onRemoveAll.bind(this)}
                  size="small">
                  <DeleteSweepIcon className={classes.icon} />
                </Fab>
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
            <Fab
              className={classes.sortMenuButton}
              onClick={this.onOpenMaxMenu.bind(this)}
              size="medium">
              {this.props.scene.generatorMax}
            </Fab>
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
                className={clsx(classes.addButton, classes.addDirectoryButton)}
                onClick={this.onAddAdvWG.bind(this)}
                size="small">
                <AddCircleOutlineIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Simple Rule"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addURLButton)}
                onClick={this.onOpenTagMenu.bind(this)}
                size="small">
                <AddIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Generate Sources" placement="top-end">
              <span className={classes.generateTooltip} style={!this.areWeightsValid() ? { pointerEvents: "none" } : {}}>
                <Fab
                  disabled={!this.areWeightsValid()}
                  className={classes.addMenuButton}
                  onClick={this.onGenerate.bind(this)}
                  size="large">
                  <Badge
                    color="secondary"
                    max={100}
                    invisible={this.areWeightsValid()}
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
              classes={{paper: classes.tagMenu}}
              open={this.state.openMenu == MO.simpleRule}
              onClose={this.onCloseDialog.bind(this)}>
              {this.props.tags.filter((t) => !this.props.scene.generatorWeights.map((wg) => wg.tag ? wg.tag.name : "").includes(t.name)).map((t) =>
                <MenuItem key={t.id} onClick={this.onAddSimpleWG.bind(this, t)}>
                  <ListItemText primary={t.name}/>
                </MenuItem>
              )}
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

  // Use alt+P to access import modal
  // Use alt+U to toggle highlighting untagged sources
  secretHotkey(e: KeyboardEvent) {
    if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'p' || e.key == 'π')) {
      this.setState({openMenu: this.state.openMenu == MO.urlImport ? null : MO.urlImport});
    }
  }

  onCloseSnackbar() {
    this.setState({snackbar: null, snackbarType: null});
  }

  onOpenMaxMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.max});
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

  areRulesValid(wg: WeightGroup) {
    let rulesHasAll = false;
    let rulesHasWeight = false;
    let rulesRemaining = 100;
    for (let rule of wg.rules) {
      if (rule.type == TT.weight) {
        rulesRemaining = rulesRemaining - rule.percent;
        rulesHasWeight = true;
      }
      if (rule.type == TT.all) {
        rulesHasAll = true;
      }
    }
    return (rulesRemaining == 100 && rulesHasAll && !rulesHasWeight) || rulesRemaining == 0;
  }

  areWeightsValid(): boolean {
    let remaining = 100;
    let hasAll = false;
    let hasWeight = false;
    for (let wg of this.props.scene.generatorWeights) {
      if (wg.rules) {
        const rulesValid = this.areRulesValid(wg);
        if (!rulesValid) return false;
      }
      if (wg.type == TT.weight) {
        remaining = remaining - wg.percent;
        hasWeight = true;
      }
      if (wg.type == TT.all) {
        hasAll = true;
      }
    }

    return (remaining == 100 && hasAll && !hasWeight) || remaining == 0;
  }

  onGenerate() {
    this.props.onGenerate(this.props.scene);
    setTimeout(this.generateCallback.bind(this), 250);
  }

  generateCallback() {
    if (this.props.scene.sources.length == 0) {
      this.setState({snackbar: "Sorry, no sources were found for these rules", snackbarType: SB.warning});
    } else {
      this.setState({openTab: 2});
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

  onAddSimpleWG(tag: Tag) {
    const wg = new WeightGroup();
    wg.name = tag.name;
    wg.percent = 0;
    wg.type = TT.weight;
    wg.tag = tag;
    const generatorWeights = this.props.scene.generatorWeights.concat([wg]);
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
    this.props.onAddSource(this.props.scene, addFunction, ...args);
  }

  onToggleDrawer() {
    this.setState({drawerOpen: !this.state.drawerOpen});
  }

  onToggleNewMenu() {
    this.setState({openMenu: this.state.openMenu == MO.new ? null : MO.new});
  }

  onOpenSortMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.sort});
  }

  onCloseDialog() {
    this.setState({menuAnchorEl: null, openMenu: null, drawerOpen: false});
  }

  onChangeTab(e: any, newTab: number) {
    this.setState({openTab: newTab});
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
    this.setState({isEditingName: true});
  }

  endEditingName(e: Event) {
    e.preventDefault();
    this.setState({isEditingName: false});
  }

  onChangeName(e: React.FormEvent<HTMLInputElement>) {
    this.changeKey('name', e.currentTarget.value);
  }

  onUpdateSources(sources: Array<LibrarySource>) {
    if (this.props.scene.orderFunction == OF.strict && (sources.length > 1 && this.props.scene.weightFunction == WF.sources)) {
      this.update((s) => {
        s.sources = sources;
        s.orderFunction = OF.ordered;
        return s;
      })
    } else {
      this.update((s) => {
        s.sources = sources;
      });
    }
  }

  onDeleteScene() {
    this.setState({openMenu: MO.deleteAlert});
  }

  onFinishDeleteScene() {
    this.props.onDelete(this.props.scene);
  }

  onRemoveAll() {
    this.setState({openMenu: MO.removeAllAlert});
  }

  onFinishRemoveAll() {
    this.onUpdateSources([]);
    this.onCloseDialog();
  }
}

export default withStyles(styles)(SceneDetail as any);