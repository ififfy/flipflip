import * as React from 'react';
import {ipcRenderer, remote} from "electron";
import {string} from "prop-types";
import wretch from "wretch";
import clsx from 'clsx';
import Sortable from "react-sortablejs";

import {
  AppBar, Badge, Button, Card, CardActionArea, CardContent, Chip, Container, createStyles, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Drawer, Fab, IconButton, Link, ListItem, ListItemIcon,
  ListItemSecondaryAction, ListItemText, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CasinoIcon from '@material-ui/icons/Casino';
import GetAppIcon from '@material-ui/icons/GetApp';
import HelpIcon from '@material-ui/icons/Help';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import MenuIcon from '@material-ui/icons/Menu';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SettingsIcon from '@material-ui/icons/Settings';
import SortIcon from '@material-ui/icons/Sort';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';

import {arrayMove, getRandomListItem} from "../data/utils";
import {IPC, MO, SF} from "../data/const";
import en from "../data/en";
import Config from "../data/Config";
import Scene from "../data/Scene";
import Jiggle from "../animations/Jiggle";
import VSpin from "../animations/VSpin";

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
    color: '#fff',
    paddingLeft: 20,
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
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    padding: theme.spacing(0),
  },
  sceneList: {
    padding: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  scene: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  generator: {
    borderWidth: 2,
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
  },
  sceneTitle: {
    textAlign: 'center',
  },
  toggle: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
    top: '50%',
    marginLeft: drawerWidth - 25,
    transition: theme.transitions.create(['margin', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  toggleClose: {
    marginLeft: theme.spacing(9) - 25,
    transition: theme.transitions.create(['margin', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  toggleHide: {
    opacity: 0,
    transition: theme.transitions.create(['margin', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  toggleIcon: {
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  toggleIconOpen: {
    transform: 'rotate(180deg)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
    right: 135,
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
  addSceneButton: {
    marginBottom: 60
  },
  addGeneratorButton: {
    marginBottom: 115
  },
  importSceneButton: {
    marginBottom: 170
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
  fill: {
    flexGrow: 1,
  },
});

class ScenePicker extends React.Component {
  readonly props: {
    classes: any,
    canGenerate: boolean,
    config: Config,
    libraryCount: number,
    scenes: Array<Scene>,
    version: string,
    onAddGenerator(): void,
    onAddScene(): void,
    onImportScene(): void,
    onOpenConfig(): void,
    onOpenLibrary(): void,
    onOpenScene(scene: Scene): void,
    onSort(algorithm: string, ascending: boolean): void,
    onUpdateConfig(config: Config): void,
    onUpdateScenes(scenes: Array<Scene>): void,
  };

  readonly state = {
    drawerOpen: false,
    drawerHover: false,
    newVersion: "",
    newVersionLink: "",
    isFirstWindow: false,
    menuAnchorEl: null as any,
    openMenu: null as string,
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;
    return (
      <div className={classes.root} onClick={this.onClickCloseMenu.bind(this)}>

        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar>
            {!open && this.state.isFirstWindow && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Toggle Drawer"
                onClick={this.onToggleDrawer.bind(this)}
                className={classes.toolbarButton}>
                <MenuIcon />
              </IconButton>
            )}
            <VSpin>
              <div className={clsx(classes.logo, open && classes.titleOut, !this.state.isFirstWindow && classes.drawerLogo)}/>
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
          </Toolbar>
        </AppBar>

        {this.state.isFirstWindow && (
          <React.Fragment>
            <Drawer
              variant="permanent"
              classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)}}
              onMouseEnter={this.onMouseEnterDrawer.bind(this)}
              onMouseLeave={this.onMouseLeaveDrawer.bind(this)}
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
              </div>

              <Divider />

              <div>
                {this.props.scenes.length > 0 && (
                  <React.Fragment>
                    <ListItem button onClick={this.onNewWindow.bind(this)}>
                      <ListItemIcon>
                        <OpenInNewIcon />
                      </ListItemIcon>
                      <ListItemText primary="New Window" />
                    </ListItem>

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
                <ListItem button onClick={this.props.onOpenConfig.bind(this)}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItem>
                <ListItem button onClick={this.openLink.bind(this,"https://ififfy.github.io/flipflip/#/")}>
                  <ListItemIcon>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText primary="User Manual" />
                </ListItem>
              </div>
              <div className={classes.fill}/>

              <div className={clsx(classes.drawerBottom, !open && classes.drawerBottomClose)}>
                <Typography variant="body2" color="inherit" className={classes.drawerText}>
                  Questions? Suggestions?
                  <br/>
                  Visit us on <Link href="#" onClick={this.openLink.bind(this, "https://github.com/ififfy/flipflip")}>GitHub</Link> or <Link href="#" onClick={this.openLink.bind(this, "https://www.reddit.com/r/flipflip")}>Reddit</Link>
                </Typography>
              </div>
            </Drawer>

            <Fab
              className={clsx(classes.toggle, !open && classes.toggleClose, !this.state.drawerHover && classes.toggleHide)}
              color="primary"
              size="medium"
              aria-label="toggle"
              onMouseEnter={this.onMouseEnterDrawer.bind(this)}
              onMouseLeave={this.onMouseLeaveDrawer.bind(this)}
              onClick={this.onToggleDrawer.bind(this)}>
              <ArrowForwardIosIcon className={clsx(classes.toggleIcon, open && classes.toggleIconOpen)}/>
            </Fab>
          </React.Fragment>
        )}

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth={false} className={classes.container}>
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
              {this.props.scenes.map((scene) =>
                <Jiggle key={scene.id} bounce={true}>
                  <Card className={clsx(classes.scene, (scene.tagWeights || scene.sceneWeights) && classes.generator)}>
                    <CardActionArea onClick={this.props.onOpenScene.bind(this, scene)}>
                      <CardContent>
                        <Typography component="h2" variant="h6">
                          {scene.name}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Jiggle>
              )}
            </Sortable>
          </Container>
        </main>

        {this.state.isFirstWindow &&  (
          <React.Fragment>
            <Tooltip title="Import Scene"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.importSceneButton, this.state.openMenu != MO.new && classes.addButtonClose)}
                onClick={this.props.onImportScene.bind(this)}
                size="small">
                <GetAppIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Add Scene Generator"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addGeneratorButton, this.state.openMenu != MO.new && classes.addButtonClose)}
                onClick={this.props.canGenerate ? this.props.onAddGenerator.bind(this) : this.nop}
                disabled={!this.props.canGenerate}
                size="small">
                <AddCircleOutlineIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Add Scene"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addSceneButton, this.state.openMenu != MO.new && classes.addButtonClose)}
                onClick={this.props.onAddScene.bind(this)}
                size="small">
                <AddCircleIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Fab
              className={classes.addMenuButton}
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
                  {[SF.alpha, SF.date, SF.count, SF.type].map((sf) =>
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
                </Menu>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
        <Tooltip title="Random Scene">
          <Fab
            className={classes.randomButton}
            onClick={this.onRandomScene.bind(this)}
            size="small">
            <CasinoIcon className={classes.icon} />
          </Fab>
        </Tooltip>
      </div>
    );
  }

  nop() {}

  componentDidMount() {
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
              releaseBetaVersion = parseInt(betaNumber, 10);
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
              thisBetaVersion = parseInt(betaNumber, 10);
            }
          }
          if (parseInt(releaseVersion, 10) > parseInt(thisVersion, 10)) {
            this.setState({
              newVersion: newestReleaseTag,
              newVersionLink: newestReleaseURL,
            })
          } else if (parseInt(releaseVersion, 10) == parseInt(thisVersion, 10)) {
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

  onNewWindow() {
    if (!this.props.config.newWindowAlerted) {
      this.setState({openMenu: MO.newWindowAlert});
    } else {
      this.newWindow(false);
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
    this.setState({drawerOpen: !this.state.drawerOpen});
  }

  onToggleNewMenu() {
    this.setState({openMenu: this.state.openMenu == MO.new ? null : MO.new});
  }

  onOpenSortMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.sort});
  }

  onClickCloseMenu(e: MouseEvent) {
    if (this.state.openMenu == MO.new) {
      let parent: any = e.target;
      do {
        let className = parent.className;
        if (!(className instanceof string) && className.baseVal != null) {
          className = className.baseVal;
        }
        console.log(className);
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

  onMouseEnterDrawer() {
    this.setState({drawerHover: true});
  }

  onMouseLeaveDrawer() {
    this.setState({drawerHover: false});
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
}

export default withStyles(styles)(ScenePicker as any);