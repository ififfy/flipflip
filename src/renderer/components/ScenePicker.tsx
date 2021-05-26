import * as React from 'react';
import {ipcRenderer, remote} from "electron";
import wretch from "wretch";
import clsx from 'clsx';
import Sortable from "react-sortablejs";

import {
  AppBar, Badge, Button, Card, CardActionArea, CardContent, Chip, Container, createStyles, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Drawer, Fab, IconButton, Link, ListItem, ListItemIcon,
  ListItemSecondaryAction, ListItemText, Menu, MenuItem, Tab, Tabs, Theme, Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CasinoIcon from '@material-ui/icons/Casino';
import CloseIcon from '@material-ui/icons/Close';
import CodeIcon from '@material-ui/icons/Code';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import GridOnIcon from '@material-ui/icons/GridOn';
import HelpIcon from '@material-ui/icons/Help';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import MenuIcon from '@material-ui/icons/Menu';
import MovieIcon from '@material-ui/icons/Movie';
import MovieFilterIcon from '@material-ui/icons/MovieFilter';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SettingsIcon from '@material-ui/icons/Settings';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import SortIcon from '@material-ui/icons/Sort';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';

import {arrayMove, getRandomListItem} from "../data/utils";
import {IPC, MO, SF, SPT} from "../data/const";
import en from "../data/en";
import Config from "../data/Config";
import Scene from "../data/Scene";
import Jiggle from "../animations/Jiggle";
import VSpin from "../animations/VSpin";
import SceneGrid from "../data/SceneGrid";
import SceneSearch from "../SceneSearch";

const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  logo: {
    marginLeft: 24,
    width: theme.spacing(6),
    height: theme.spacing(6),
    marginRight: 5,
    background: 'url("./src/renderer/icons/flipflip_logo.png") no-repeat',
    backgroundSize: theme.spacing(6),
    transition: theme.transitions.create(['opacity', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerLogo: {
    marginLeft: 0,
  },
  title: {
    transition: theme.transitions.create(['opacity', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  version: {
    marginTop: 35,
    marginLeft: -11,
    transition: theme.transitions.create(['opacity', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  titleOut: {
    marginLeft: -111,
    opacity: 0,
    transition: theme.transitions.create(['opacity', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  updateIcon: {
    float: 'right',
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
  drawerToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: theme.palette.primary.contrastText,
    paddingLeft: 23,
    backgroundColor: theme.palette.primary.main,
    ...theme.mixins.toolbar,
  },
  drawerBottom: {
    width: drawerWidth,
    padding: 8,
    paddingLeft: 16,
    transition: theme.transitions.create(['opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerBottomClose: {
    opacity: 0,
    transition: theme.transitions.create(['opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  chip: {
    transition: theme.transitions.create(['opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  chipClose: {
    opacity: 0,
    transition: theme.transitions.create(['opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    ...theme.mixins.toolbar
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
    overflowY: 'auto',
  },
  sceneList: {
    padding: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
  },
  scene: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  deleteScene: {
    backgroundColor: theme.palette.error.main,
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
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
    margin: 0,
    top: 'auto',
    right: 80,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  randomButton: {
    backgroundColor: theme.palette.secondary.light,
    margin: 0,
    top: 'auto',
    right: 130,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  extraWindowRandomButton :{
    right: 28,
    bottom: 25,
  },
  generateTooltip: {
    top: 'auto',
    right: 28,
    bottom: 140,
    left: 'auto',
    position: 'fixed',
    borderRadius: '50%',
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  gridTooltip: {
    top: 'auto',
    right: 28,
    bottom: 195,
    left: 'auto',
    position: 'fixed',
    borderRadius: '50%',
    width: theme.spacing(5),
    height: theme.spacing(5),
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
  addSceneButton: {
    marginBottom: 60,
  },
  addGeneratorButton: {
    marginBottom: 115,
  },
  addGridButton: {
    marginBottom: 170,
  },
  importSceneButton: {
    marginBottom: 225,
  },
  deleteScenesButton: {
    marginBottom: 280,
    backgroundColor: theme.palette.error.main,
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
  sortMenu: {
    width: 200,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
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
  sceneTab: {
    ariaControls: 'vertical-tabpanel-0',
  },
  generatorTab: {
    ariaControls: 'vertical-tabpanel-1',
  },
  gridTab: {
    ariaControls: 'vertical-tabpanel-2',
  },
  fill: {
    flexGrow: 1,
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

class ScenePicker extends React.Component {
  readonly props: {
    classes: any,
    canGenerate: boolean,
    canGrid: boolean,
    config: Config,
    grids: Array<SceneGrid>,
    audioLibraryCount: number,
    scriptLibraryCount: number,
    libraryCount: number,
    openTab: number,
    scenes: Array<Scene>,
    tutorial: string,
    version: string,
    onAddGenerator(): void,
    onAddGrid(): void,
    onAddScene(): void,
    onChangeTab(newTab: number): void,
    onDeleteScenes(sceneIDs: Array<number>): void,
    onImportScene(addToLibrary: boolean): void,
    onOpenConfig(): void,
    onOpenAudioLibrary(): void,
    onOpenScriptLibrary(): void,
    onOpenCaptionScriptor(): void,
    onOpenLibrary(): void,
    onOpenScene(scene: Scene): void,
    onOpenGrid(grid: SceneGrid): void,
    onTutorial(tutorial: string): void,
    onSort(algorithm: string, ascending: boolean): void,
    onUpdateConfig(config: Config): void,
    onUpdateScenes(scenes: Array<Scene>): void,
    onUpdateGrids(grids: Array<SceneGrid>): void,
    startTutorial(): void,
  };

  readonly state = {
    drawerOpen: false,
    newVersion: "",
    newVersionLink: "",
    isFirstWindow: false,
    menuAnchorEl: null as any,
    openMenu: null as string,
    displayScenes: Array<Scene>(),
    displayGrids: Array<SceneGrid>(),
    filters: Array<string>(),
    deleteScenes: null as Array<number>,
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;
    return (
      <div className={classes.root} onClick={this.onClickCloseMenu.bind(this)}>

        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift, this.props.tutorial == SPT.scenePicker && classes.backdropTop)}>
          <Toolbar>
            {!open && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Toggle Drawer"
                className={clsx(this.props.tutorial == SPT.scenePicker && classes.highlight)}
                onClick={this.onToggleDrawer.bind(this)}>
                <MenuIcon />
              </IconButton>
            )}
            <VSpin>
              <div className={clsx(classes.logo, open && classes.titleOut)}/>
            </VSpin>
            <Typography component="h1" variant="h4" color="inherit" noWrap className={clsx(classes.title, open && classes.titleOut)}>
              FlipFlip
            </Typography>
            <Typography variant="caption" color="inherit" noWrap className={clsx(classes.version, open && classes.titleOut)}>
              v{this.props.version}
            </Typography>
            <div className={classes.fill}/>
            {this.state.newVersion != "" && (
              <Tooltip title={`Download ${this.state.newVersion}`}>
                <IconButton color="inherit" className={classes.updateIcon} onClick={this.openGitRelease.bind(this)}>
                  <Badge variant="dot" color="secondary">
                    <SystemUpdateIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            <SceneSearch
              displaySources={this.state.displayScenes}
              filters={this.state.filters}
              placeholder={"Search ..."}
              onUpdateFilters={this.onUpdateFilters.bind(this)}/>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          className={this.props.tutorial == SPT.drawer ? clsx(classes.backdropTop, classes.disable, classes.highlight) : ''}
          classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)}}
          open={open}>

          <div className={classes.drawerToolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Toggle Drawer"
              onClick={this.onToggleDrawer.bind(this)}>
              <MenuIcon />
            </IconButton>
            <VSpin>
              <div className={clsx(classes.logo, classes.drawerLogo)}/>
            </VSpin>
            <Typography component="h1" variant="h6" color="inherit" noWrap>
              FlipFlip
            </Typography>
          </div>

          <Divider />

          <div>
            <Tabs
              orientation="vertical"
              value={this.props.openTab}
              onChange={this.onChangeTab.bind(this)}
              aria-label="scene picker tabs"
              className={classes.tabs}>
              <Tab id="vertical-tab-0"
                   aria-controls="vertical-tabpanel-0"
                   icon={<MovieIcon/>} label={open ? `Scenes (${this.props.scenes.filter((s) => !s.generatorWeights).length})` : ""}
                   className={clsx(classes.tab, classes.sceneTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-1"
                   aria-controls="vertical-tabpanel-1"
                   icon={<MovieFilterIcon/>} label={open ? `Scene Generators (${this.props.scenes.filter((s) => !!s.generatorWeights).length})` : ""}
                   className={clsx(classes.tab, classes.generatorTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-2"
                   aria-controls="vertical-tabpanel-2"
                   icon={<GridOnIcon/>} label={open ? `Scene Grids (${this.props.grids.length})` : ""}
                   className={clsx(classes.tab, classes.gridTab, !open && classes.tabClose)}/>
            </Tabs>
          </div>

          {this.state.isFirstWindow && (
            <React.Fragment>
              <Divider />

              <div>
                <Tooltip title={this.state.drawerOpen ? "" : "Library"}>
                  <ListItem button onClick={this.props.onOpenLibrary.bind(this)}>
                    <ListItemIcon>
                      <LocalLibraryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Library" />
                    {this.props.libraryCount > 0 && (
                      <Chip
                        className={clsx(classes.chip, !open && classes.chipClose)}
                        label={this.props.libraryCount}
                        color='primary'
                        size='small'
                        variant='outlined'/>
                    )}
                  </ListItem>
                </Tooltip>
                <Tooltip title={this.state.drawerOpen ? "" : "Audio Library"}>
                  <ListItem button onClick={this.props.onOpenAudioLibrary.bind(this)}>
                    <ListItemIcon>
                      <LibraryMusicIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Audio Library" />
                    {this.props.audioLibraryCount > 0 && (
                      <Chip
                        className={clsx(classes.chip, !open && classes.chipClose)}
                        label={this.props.audioLibraryCount}
                        color='primary'
                        size='small'
                        variant='outlined'/>
                    )}
                  </ListItem>
                </Tooltip>
                <Tooltip title={this.state.drawerOpen ? "" : "Script Library"}>
                  <ListItem button onClick={this.props.onOpenScriptLibrary.bind(this)}>
                    <ListItemIcon>
                      <LibraryBooksIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Script Library" />
                    {this.props.scriptLibraryCount > 0 && (
                      <Chip
                        className={clsx(classes.chip, !open && classes.chipClose)}
                        label={this.props.scriptLibraryCount}
                        color='primary'
                        size='small'
                        variant='outlined'/>
                    )}
                  </ListItem>
                </Tooltip>
              </div>

              <Divider />

              <div>
                <Tooltip title={this.state.drawerOpen ? "" : "Caption Scripter"}>
                  <ListItem button onClick={this.props.onOpenCaptionScriptor.bind(this)}>
                    <ListItemIcon>
                      <CodeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Caption Scripter" />
                  </ListItem>
                </Tooltip>
              </div>

              <Divider />

              <div>
                {this.props.scenes.length > 0 && (
                  <React.Fragment>
                    <Tooltip title={this.state.drawerOpen ? "" : "New Window"}>
                      <ListItem button onClick={this.onNewWindow.bind(this)}>
                        <ListItemIcon>
                          <OpenInNewIcon />
                        </ListItemIcon>
                        <ListItemText primary="New Window" />
                      </ListItem>
                    </Tooltip>

                    <Dialog
                      open={this.state.openMenu == MO.newWindowAlert}
                      onClose={this.onCloseDialog.bind(this)}
                      aria-labelledby="new-window-title"
                      aria-describedby="new-window-description">
                      <DialogTitle id="new-window-title">New Window Warning</DialogTitle>
                      <DialogContent>
                        <DialogContentText id="new-window-description">
                          Please be aware that only changes made in the main window (this window) will be saved.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={this.newWindow.bind(this, true)} color="secondary">
                          Don't show again
                        </Button>
                        <Button onClick={this.newWindow.bind(this, false)} color="primary">
                          OK
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </React.Fragment>
                )}
                <Tooltip title={this.state.drawerOpen ? "" : "Settings"}>
                  <ListItem button onClick={this.props.onOpenConfig.bind(this)}>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                  </ListItem>
                </Tooltip>
                <Tooltip title={this.state.drawerOpen ? "" : "User Manual"}>
                  <ListItem button onClick={this.openLink.bind(this,"https://ififfy.github.io/flipflip/#/")}>
                    <ListItemIcon>
                      <HelpIcon />
                    </ListItemIcon>
                    <ListItemText primary="User Manual" />
                  </ListItem>
                </Tooltip>
              </div>
            </React.Fragment>
          )}
          <div className={classes.fill}/>

          <div className={clsx(classes.drawerBottom, !open && classes.drawerBottomClose)}>
            <Typography variant="body2" color="inherit" className={classes.drawerText}>
              Questions? Suggestions?
              <br/>
              Visit us on <Link href="#" onClick={this.openLink.bind(this, "https://github.com/ififfy/flipflip")}>GitHub</Link> or <Link href="#" onClick={this.openLink.bind(this, "https://www.reddit.com/r/flipflip")}>Reddit</Link>
            </Typography>
          </div>
        </Drawer>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth={false} className={classes.container}>

            {this.props.openTab === 0 && (
              <Typography
                component="div"
                role="tabpanel"
                hidden={this.props.openTab !== 0}
                id="vertical-tabpanel-0"
                aria-labelledby="vertical-tab-0">
                <Sortable
                  className={classes.sceneList}
                  options={{
                    animation: 150,
                    easing: "cubic-bezier(1, 0, 0, 1)",
                  }}
                  onChange={(order: any, sortable: any, evt: any) => {
                    let newScenes = Array.from(this.props.scenes);
                    arrayMove(newScenes, evt.oldIndex, evt.newIndex);
                    this.props.onUpdateScenes(newScenes);
                  }}>
                  {this.props.scenes.map((scene) => {
                    if (scene.generatorWeights || !this.state.displayScenes.includes(scene)) return <div key={scene.id}/>;
                    else {
                      return (
                        <Jiggle key={scene.id} bounce disable={this.state.deleteScenes?.includes(scene.id)} className={classes.scene}>
                          <Card className={clsx(this.state.deleteScenes?.includes(scene.id) && classes.deleteScene)}>
                            <CardActionArea onClick={this.state.deleteScenes == null ? this.props.onOpenScene.bind(this, scene) : this.onToggleDelete.bind(this, scene.id)}>
                              <CardContent>
                                <Typography component="h2" variant="h6">
                                  {scene.name}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Jiggle>
                      )
                    }
                  })}
                </Sortable>
              </Typography>
            )}

            {this.props.openTab === 1 && (
              <Typography
                component="div"
                role="tabpanel"
                hidden={this.props.openTab !== 1}
                id="vertical-tabpanel-1"
                aria-labelledby="vertical-tab-1">
                <Sortable
                  className={classes.sceneList}
                  options={{
                    animation: 150,
                    easing: "cubic-bezier(1, 0, 0, 1)",
                  }}
                  onChange={(order: any, sortable: any, evt: any) => {
                    let newScenes = Array.from(this.props.scenes);
                    arrayMove(newScenes, evt.oldIndex, evt.newIndex);
                    this.props.onUpdateScenes(newScenes);
                  }}>
                  {this.props.scenes.map((scene) => {
                    if (!scene.generatorWeights || !this.state.displayScenes.includes(scene)) return <div key={scene.id}/>;
                    else {
                      return (
                        <Jiggle key={scene.id} bounce disable={this.state.deleteScenes?.includes(scene.id)} className={classes.scene}>
                          <Card className={clsx(this.state.deleteScenes?.includes(scene.id) && classes.deleteScene)}>
                            <CardActionArea onClick={this.state.deleteScenes == null ? this.props.onOpenScene.bind(this, scene) : this.onToggleDelete.bind(this, scene.id)}>
                              <CardContent>
                                <Typography component="h2" variant="h6">
                                  {scene.name}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Jiggle>
                      )
                    }
                  })}
                </Sortable>
              </Typography>
            )}

            {this.props.openTab === 2 && (
              <Typography
                component="div"
                role="tabpanel"
                hidden={this.props.openTab !== 2}
                id="vertical-tabpanel-2"
                aria-labelledby="vertical-tab-2">
                <Sortable
                  className={classes.sceneList}
                  options={{
                    animation: 150,
                    easing: "cubic-bezier(1, 0, 0, 1)",
                  }}
                  onChange={(order: any, sortable: any, evt: any) => {
                    let newGrids = Array.from(this.props.grids);
                    arrayMove(newGrids, evt.oldIndex, evt.newIndex);
                    this.props.onUpdateGrids(newGrids);
                  }}>
                  {this.state.displayGrids.map((grid) =>
                    <Jiggle key={grid.id} bounce disable={this.state.deleteScenes?.includes(parseInt("999" + grid.id))} className={classes.scene}>
                      <Card className={clsx(this.state.deleteScenes?.includes(parseInt("999" + grid.id)) && classes.deleteScene)}>
                        <CardActionArea onClick={this.state.deleteScenes == null ? this.props.onOpenGrid.bind(this, grid) : this.onToggleDelete.bind(this, parseInt("999" + grid.id))}>
                          <CardContent>
                            <Typography component="h2" variant="h6">
                              {grid.name}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Jiggle>
                  )}
                </Sortable>
              </Typography>
            )}

          </Container>
        </main>

        {this.state.deleteScenes != null && (
          <React.Fragment>
            <Tooltip title={"Delete Selected Scenes"}>
              <Fab
                className={classes.deleteButton}
                onClick={this.onFinishDelete.bind(this)}
                size="large">
                <DeleteIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title={"Cancel Delete"}>
              <Fab
                className={classes.sortMenuButton}
                onClick={this.onCancelDelete.bind(this)}
                size="medium">
                <CloseIcon className={classes.icon} />
              </Fab>
            </Tooltip>
          </React.Fragment>
        )}

        {this.state.deleteScenes == null && (
          <React.Fragment>
            {this.state.isFirstWindow &&  (
              <React.Fragment>
                {this.props.scenes.length > 0 && (
                  <Tooltip title="Delete Scenes"  placement="left">
                    <Fab
                      className={clsx(classes.addButton, classes.deleteScenesButton, this.state.openMenu != MO.new && classes.addButtonClose)}
                      onClick={this.onDeleteScenes.bind(this)}
                      size="small">
                      <DeleteIcon className={classes.icon} />
                    </Fab>
                  </Tooltip>
                )}
                <Tooltip title="Import Scene"  placement="left">
                  <Fab
                    className={clsx(classes.addButton, classes.importSceneButton, this.state.openMenu != MO.new && classes.addButtonClose)}
                    onClick={this.onImportScene.bind(this)}
                    size="small">
                    <GetAppIcon className={classes.icon} />
                  </Fab>
                </Tooltip>
                <Tooltip title="Add Scene Grid"  placement="left">
                  <span className={classes.gridTooltip} style={!this.props.canGrid ? { pointerEvents: "none" } : {}}>
                    <Fab
                      className={clsx(classes.addButton, classes.addGridButton, this.state.openMenu != MO.new && classes.addButtonClose)}
                      onClick={this.props.onAddGrid.bind(this)}
                      disabled={!this.props.canGrid}
                      size="small">
                      <GridOnIcon className={classes.icon} />
                    </Fab>
                  </span>
                </Tooltip>
                <Tooltip title="Add Scene Generator"  placement="left">
                  <span className={classes.generateTooltip} style={!this.props.canGenerate ? { pointerEvents: "none" } : {}}>
                    <Fab
                      className={clsx(classes.addButton, classes.addGeneratorButton, this.state.openMenu != MO.new && classes.addButtonClose)}
                      onClick={this.props.onAddGenerator.bind(this)}
                      disabled={!this.props.canGenerate}
                      size="small">
                      <MovieFilterIcon className={classes.icon} />
                    </Fab>
                  </span>
                </Tooltip>
                <Tooltip title="Add Scene"  placement="left">
                  <Fab
                    className={clsx(classes.addButton, classes.addSceneButton, this.state.openMenu != MO.new && classes.addButtonClose, this.props.tutorial == SPT.add2 && clsx(classes.backdropTop, classes.highlight))}
                    onClick={this.onAddScene.bind(this)}
                    size="small">
                    <MovieIcon className={classes.icon} />
                  </Fab>
                </Tooltip>
                <Fab
                  className={clsx(classes.addMenuButton, (this.props.tutorial == SPT.add1 || this.props.tutorial == SPT.add2) && classes.backdropTop, this.props.tutorial == SPT.add1 && classes.highlight)}
                  onClick={this.onToggleNewMenu.bind(this)}
                  size="large">
                  <AddIcon className={classes.icon} />
                </Fab>

                {this.props.scenes.length >= 2 && (
                  <React.Fragment>
                    <Fab
                      className={classes.sortMenuButton}
                      aria-haspopup="true"
                      aria-controls="sort-menu"
                      aria-label="Sort Scenes"
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
                      {[SF.alpha, SF.date, SF.count].map((sf) =>
                        <MenuItem key={sf}>
                          <ListItemText primary={en.get(sf)}/>
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={this.props.onSort.bind(this, sf, true)}>
                              <ArrowUpwardIcon/>
                            </IconButton>
                            <IconButton edge="end" onClick={this.props.onSort.bind(this, sf, false)}>
                              <ArrowDownwardIcon/>
                            </IconButton>
                          </ListItemSecondaryAction>
                        </MenuItem>
                      )}
                      <MenuItem key={SF.random}>
                        <ListItemText primary={en.get(SF.random)}/>
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={this.props.onSort.bind(this, SF.random, true)}>
                            <ShuffleIcon/>
                          </IconButton>
                        </ListItemSecondaryAction>
                      </MenuItem>
                    </Menu>
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
            <Tooltip title="Random Scene">
              <Fab
                className={clsx(classes.randomButton, !this.state.isFirstWindow && classes.extraWindowRandomButton)}
                onClick={this.onRandomScene.bind(this)}
                size="small">
                <CasinoIcon className={classes.icon} />
              </Fab>
            </Tooltip>
          </React.Fragment>
        )}

        <Dialog
          open={this.state.openMenu == MO.urlImport}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="import-title"
          aria-describedby="import-description">
          <DialogTitle id="import-title">Import Scene</DialogTitle>
          <DialogContent>
            <DialogContentText id="import-description">
              You are about to import a Scene. Would you also like to import this Scene's sources into your Library?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="default">
              Cancel
            </Button>
            <Button onClick={this.onFinishImportScene.bind(this, false)} color="secondary">
              Just Import Scene
            </Button>
            <Button onClick={this.onFinishImportScene.bind(this, true)} color="primary">
              Import Sources into Library
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  componentDidMount() {
    this.props.startTutorial();
    this.setState({displayScenes: this.getDisplayScenes(), displayGrids: this.getDisplayGrids()});
    if (remote.getCurrentWindow().id == 1) {
      this.setState({isFirstWindow: true});
      wretch("https://api.github.com/repos/ififfy/flipflip/releases")
        .get()
        .json(json => {
          const newestReleaseTag = json[0].tag_name;
          const newestReleaseURL = json[0].html_url;
          let releaseVersion = newestReleaseTag.replace("v", "").replace(".", "").replace(".", "");
          let releaseBetaVersion = -1;
          if (releaseVersion.includes("-")) {
            const releaseSplit = releaseVersion.split("-");
            releaseVersion = releaseSplit[0];
            const betaString = releaseSplit[1];
            const betaNumber = betaString.replace("beta", "");
            if (betaNumber == "") {
              releaseBetaVersion = 0;
            } else {
              releaseBetaVersion = parseInt(betaNumber);
            }
          }
          let thisVersion = this.props.version.replace(".", "").replace(".", "");
          let thisBetaVersion = -1;
          if (thisVersion.includes("-")) {
            const releaseSplit = thisVersion.split("-");
            thisVersion = releaseSplit[0];
            const betaString = releaseSplit[1];
            const betaNumber = betaString.replace("beta", "");
            if (betaNumber == "") {
              thisBetaVersion = 0;
            } else {
              thisBetaVersion = parseInt(betaNumber);
            }
          }
          if (parseInt(releaseVersion) > parseInt(thisVersion)) {
            this.setState({
              newVersion: newestReleaseTag,
              newVersionLink: newestReleaseURL,
            })
          } else if (parseInt(releaseVersion) == parseInt(thisVersion)) {
            if ((releaseBetaVersion == -1 && thisBetaVersion >= 0) ||
              releaseBetaVersion > thisBetaVersion) {
              this.setState({
                newVersion: newestReleaseTag,
                newVersionLink: newestReleaseURL,
              })
            }
          }
        })
        .catch((e) => console.error(e));
    }
  }

  componentDidUpdate(props: any, state: any) {
    if (state.filters != this.state.filters || props.scenes != this.props.scenes) {
      this.setState({displayScenes: this.getDisplayScenes(), displayGrids: this.getDisplayGrids()});
    }
  }

  onUpdateFilters(filters: Array<string>) {
    this.setState({filters: filters, displayScenes: this.getDisplayScenes(), displayGrids: this.getDisplayGrids()});
  }

  onImportScene() {
    this.setState({openMenu: MO.urlImport});
  }

  onDeleteScenes() {
    this.setState({openMenu: null, deleteScenes: Array<number>()});
  }

  onCancelDelete() {
    this.setState({deleteScenes: null});
  }

  onFinishDelete() {
    this.props.onDeleteScenes(this.state.deleteScenes);
    this.setState({deleteScenes: null});
  }

  onToggleDelete(sceneID: number) {
    const newDeleteScenes = Array.from(this.state.deleteScenes);
    if (newDeleteScenes.includes(sceneID)) {
      newDeleteScenes.splice(newDeleteScenes.indexOf(sceneID), 1);
    } else {
      newDeleteScenes.push(sceneID);
    }
    this.setState({deleteScenes: newDeleteScenes});
  }

  onFinishImportScene(addToLibrary: boolean) {
    this.props.onImportScene(addToLibrary);
    this.onCloseDialog();
  }

  onNewWindow() {
    if (!this.props.config.newWindowAlerted) {
      this.setState({openMenu: MO.newWindowAlert});
    } else {
      this.newWindow(false);
    }
  }

  onChangeTab(e: MouseEvent, tab: number) {
    if (this.props.openTab != tab) {
      this.props.onChangeTab(tab);
    }
  }

  newWindow(hideFutureWarnings: boolean) {
    if (this.state.openMenu == MO.newWindowAlert) {
      this.setState({openMenu: null});
      if (hideFutureWarnings) {
        let newConfig = this.props.config;
        newConfig.newWindowAlerted = true;
        this.props.onUpdateConfig(newConfig);
      }
    }
    ipcRenderer.send(IPC.newWindow);
  }

  onToggleDrawer() {
    if (this.props.tutorial == SPT.scenePicker) {
      this.props.onTutorial(SPT.scenePicker);
    }
    this.setState({drawerOpen: !this.state.drawerOpen});
  }

  onToggleNewMenu() {
    if (this.props.tutorial == SPT.add1) {
      this.props.onTutorial(SPT.add1);
    }
    this.setState({openMenu: this.state.openMenu == MO.new ? null : MO.new});
  }

  onAddScene() {
    if (this.props.tutorial == SPT.add2) {
      this.props.onTutorial(SPT.add2);
    }
    this.props.onAddScene();
  }

  onOpenSortMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.sort});
  }

  onClickCloseMenu(e: MouseEvent) {
    if (this.state.openMenu == MO.new) {
      let parent: any = e.target;
      do {
        let className = parent.className;
        if ((typeof className !== 'string') && className.baseVal != null) {
          className = className.baseVal;
        }
        if (className.includes("MuiFab-")) {
          return;
        }
        if (className.includes("ScenePicker-root")) {
          break;
        }
      } while ((parent = parent.parentNode) != null);
      this.setState({menuAnchorEl: null, openMenu: null});
    }
  }

  onCloseDialog() {
    this.setState({menuAnchorEl: null, openMenu: null});
  }

  onRandomScene() {
    this.props.onOpenScene(getRandomListItem(this.props.scenes));
  }

  openGitRelease() {
    this.openLink(this.state.newVersionLink);
  }

  openLink(url: string) {
    remote.shell.openExternal(url);
  }

  getDisplayScenes() {
    let displayScenes = [];
    const filtering = this.state.filters.length > 0;
    if (filtering) {
      for (let scene of this.props.scenes) {
        let matchesFilter = true;
        for (let filter of this.state.filters) {
          if (((filter.startsWith('"') || filter.startsWith('-"')) && filter.endsWith('"')) ||
            ((filter.startsWith('\'') || filter.startsWith('-\'')) && filter.endsWith('\''))) {
            if (filter.startsWith("-")) {
              filter = filter.substring(2, filter.length - 1);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = !regex.test(scene.name);
            } else {
              filter = filter.substring(1, filter.length - 1);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = regex.test(scene.name);
            }
          } else { // This is a search filter
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = !regex.test(scene.name);
            } else {
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = regex.test(scene.name);
            }
          }
          if (!matchesFilter) break;
        }
        if (matchesFilter) {
          displayScenes.push(scene);
        }
      }
    } else {
      displayScenes = this.props.scenes;
    }
    return displayScenes;
  }

  getDisplayGrids() {
    let displayGrids = [];
    const filtering = this.state.filters.length > 0;
    if (filtering) {
      for (let grid of this.props.grids) {
        let matchesFilter = true;
        for (let filter of this.state.filters) {
          if (((filter.startsWith('"') || filter.startsWith('-"')) && filter.endsWith('"')) ||
            ((filter.startsWith('\'') || filter.startsWith('-\'')) && filter.endsWith('\''))) {
            if (filter.startsWith("-")) {
              filter = filter.substring(2, filter.length - 1);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = !regex.test(grid.name);
            } else {
              filter = filter.substring(1, filter.length - 1);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = regex.test(grid.name);
            }
          } else { // This is a search filter
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = !regex.test(grid.name);
            } else {
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = regex.test(grid.name);
            }
          }
          if (!matchesFilter) break;
        }
        if (matchesFilter) {
          displayGrids.push(grid);
        }
      }
    } else {
      displayGrids = this.props.grids;
    }
    return displayGrids;
  }
}

(ScenePicker as any).displayName="ScenePicker";
export default withStyles(styles)(ScenePicker as any);