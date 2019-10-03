import * as React from 'react';
import {ipcRenderer, remote} from "electron";
import wretch from "wretch";
import clsx from 'clsx';
import Sortable from "react-sortablejs";

import {
  AppBar, Badge, Button, Card, CardActionArea, CardContent, Chip, Container, createStyles,
  CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider,
  Drawer, IconButton, Link, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Theme,
  Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CasinoIcon from '@material-ui/icons/Casino';
import GetAppIcon from '@material-ui/icons/GetApp';
import HelpIcon from '@material-ui/icons/Help';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
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
    overflow: 'hidden',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
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
  drawerText: {
    whiteSpace: 'normal',
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
    padding: theme.spacing(1),
  },
  sceneList: {
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'auto',
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
    onUpdateConfig(config: Config): void,
    onUpdateScenes(scenes: Array<Scene>): void,
  };

  readonly state = {
    drawerOpen: false,
    newVersion: "",
    newVersionLink: "",
    isFirstWindow: false,
    menuAnchorEl: null as any,
    menuOpen: null as string,
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar>
            {!open && this.state.isFirstWindow && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Open Drawer"
                onClick={this.onDrawerOpen.bind(this)}
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
          <Drawer
            variant="permanent"
            classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)}}
            open={open}>
            <div className={classes.drawerToolbar}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Close Drawer"
                onClick={this.onDrawerClose.bind(this)}>
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
              <ListItem button aria-haspopup="true"
                        aria-controls="new-menu"
                        aria-label="New Scene"
                        onClick={this.onOpenNewMenu.bind(this)}>
                <ListItemIcon>
                  <AddCircleIcon />
                </ListItemIcon>
                <ListItemText primary="New Scene" />
              </ListItem>
              <Menu
                id="new-menu"
                elevation={1}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                getContentAnchorEl={null}
                anchorEl={this.state.menuAnchorEl}
                keepMounted
                open={this.state.menuOpen == MO.new}
                onClose={this.onCloseMenu.bind(this)}>
                <MenuItem onClick={this.props.onAddScene.bind(this)}>
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="New Scene"/>
                </MenuItem>
                <MenuItem disabled={!this.props.canGenerate}
                          onClick={this.props.canGenerate ? this.props.onAddGenerator.bind(this) : this.nop}>
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="New Generator"/>
                </MenuItem>
                <MenuItem onClick={this.props.onImportScene.bind(this)}>
                  <ListItemIcon>
                    <GetAppIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Import Scene"/>
                </MenuItem>
              </Menu>
              {this.props.scenes.length > 1 && (
                <React.Fragment>
                  <ListItem button aria-haspopup="true"
                            aria-controls="sort-menu"
                            aria-label="Sort Scenes"
                            onClick={this.onOpenSortMenu.bind(this)}>
                    <ListItemIcon>
                      <SortIcon />
                    </ListItemIcon>
                    <ListItemText primary="Sort Scenes" />
                  </ListItem>
                  <Menu
                    id="sort-menu"
                    elevation={1}
                    anchorOrigin={{
                      vertical: 'center',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    getContentAnchorEl={null}
                    anchorEl={this.state.menuAnchorEl}
                    keepMounted
                    open={this.state.menuOpen == MO.sort}
                    onClose={this.onCloseMenu.bind(this)}>
                    {[SF.alphaA, SF.alphaD, SF.dateA, SF.dateD, SF.type].map((sf) =>
                      <MenuItem key={sf} onClick={this.onSort.bind(this, sf)}>
                        <ListItemText primary={en.get(sf)}/>
                      </MenuItem>
                    )}
                  </Menu>
                </React.Fragment>
              )}
              {this.props.scenes.length > 1 && (
                <ListItem button onClick={this.onRandomScene.bind(this)}>
                  <ListItemIcon>
                    <CasinoIcon />
                  </ListItemIcon>
                  <ListItemText primary="Random Scene" />
                </ListItem>
              )}
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
                    open={this.state.menuOpen == MO.alert}
                    onClose={this.onCloseMenu.bind(this)}
                    aria-labelledby="new-window-title"
                    aria-describedby="new-window-description">
                    <DialogTitle id="new-window-title">New Window Warning</DialogTitle>
                    <DialogContent>
                      <DialogContentText id="new-window-description">
                        Please be aware that only changes made in the main window (this window) will be saved.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.newWindow.bind(this, true)} color="primary">
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
                  <Card className={clsx(classes.scene, scene.tagWeights != null && classes.generator)}>
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
      this.setState({menuOpen: MO.alert});
    } else {
      this.newWindow(false);
    }
  }

  newWindow(hideFutureWarnings: boolean) {
    if (this.state.menuOpen == MO.alert) {
      this.setState({menuOpen: null});
      if (hideFutureWarnings) {
        let newConfig = this.props.config;
        newConfig.newWindowAlerted = true;
        this.props.onUpdateConfig(newConfig);
      }
    }
    ipcRenderer.send(IPC.newWindow);
  }

  openGitRelease() {
    this.openLink(this.state.newVersionLink);
  }

  openLink(url: string) {
    remote.shell.openExternal(url);
  }

  onRandomScene() {
    this.props.onOpenScene(getRandomListItem(this.props.scenes));
  }

  onDrawerOpen() {
    this.setState({drawerOpen: true});
  };

  onDrawerClose() {
    this.setState({drawerOpen: false});
  };

  onOpenNewMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, menuOpen: MO.new});
  }

  onOpenSortMenu(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, menuOpen: MO.sort});
  }

  onCloseMenu() {
    this.setState({menuAnchorEl: null, menuOpen: null});
  }
  
  onSort(sortFunction: string) {
    this.onCloseMenu();
    switch (sortFunction) {
      case SF.alphaA:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          if (aName < bName) {
            return -1;
          } else if (aName > bName) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.alphaD:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          if (aName > bName) {
            return -1;
          } else if (aName < bName) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.dateA:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          if (a.id < b.id) {
            return -1;
          } else if (a.id > b.id) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.dateD:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          } else if (a.id < b.id) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.type:
        this.props.onUpdateScenes(this.props.scenes.sort((a, b) => {
          if (!(a.tagWeights || a.sceneWeights) && (b.tagWeights || b.sceneWeights)) {
            return -1;
          } else if ((a.tagWeights || a.sceneWeights) && !(b.tagWeights || b.sceneWeights)) {
            return 1;
          } else {
            const aName = a.name.toLowerCase();
            const bName = a.name.toLowerCase();
            if (aName < bName) {
              return -1;
            } else if (a.name > b.name) {
              return 1;
            } else {
              return 0;
            }
          }
        }));
        break;
    }
  }
}

export default withStyles(styles)(ScenePicker as any);