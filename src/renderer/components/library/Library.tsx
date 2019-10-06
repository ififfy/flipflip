import * as React from "react";
import clsx from "clsx";
import {string} from "prop-types";
import {remote} from "electron";

import {
  AppBar, Button, Chip, Collapse, Container, createStyles, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Divider, Drawer, Fab, IconButton, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText,
  ListSubheader, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import FolderIcon from '@material-ui/icons/Folder';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import GetAppIcon from '@material-ui/icons/GetApp';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MovieIcon from '@material-ui/icons/Movie';
import PublishIcon from '@material-ui/icons/Publish';
import SortIcon from '@material-ui/icons/Sort';
import WarningIcon from '@material-ui/icons/Warning';

import {getFileGroup, getFileName, getSourceType, isVideo} from "../../data/utils";
import {AF, MO, SF, ST} from "../../data/const";
import en from "../../data/en";
import Scene from "../../data/Scene";
import SourceIcon from "../sceneDetail/SourceIcon";
import LibrarySource from "./LibrarySource";
import Tag from "./Tag";

const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  title: {
    textAlign: 'center',
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
  drawerTitle: {
    transition: theme.transitions.create(['height'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerTitleClose: {
    height: 0,
    transition: theme.transitions.create(['height'], {
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
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    backgroundColor: (theme.palette.primary as any)["50"],
  },
  container: {
    padding: theme.spacing(0),
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
  removeAllButton: {
    backgroundColor: theme.palette.error.main,
    marginBottom: 225,
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

class Library extends React.Component {
  readonly props: {
    classes: any,
    library: Array<LibrarySource>,
    tags: Array<Tag>,
    goBack(): void,
    onAddSource(scene: Scene, type: string): void,
    onBatchTag(isBatchTag: boolean): void,
    onExportLibrary(): void,
    onImportLibrary(): void,
    onManageTags(): void,
    onSort(scene: Scene, algorithm: string, ascending: boolean): void,
    onUpdateLibrary(sources: Array<LibrarySource>): void,
  };

  readonly state = {
    drawerOpen: false,
    drawerHover: false,
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
            <Tooltip title="Back" placement="right-end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                onClick={this.props.goBack.bind(this)}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>

            <div className={classes.fill}/>
            <Typography component="h1" variant="h4" color="inherit" noWrap
                        className={classes.title}>
              Library
            </Typography>
            <div className={classes.fill}/>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)}}
          onMouseEnter={this.onMouseEnterDrawer.bind(this)}
          onMouseLeave={this.onMouseLeaveDrawer.bind(this)}
          open={false}>
          <div className={classes.appBarSpacer} />

          <div>
            <ListItem button onClick={this.props.onManageTags.bind(this)}>
              <ListItemIcon>
                <LocalOfferIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Tags" />
              {this.props.tags.length > 0 && (
                <Chip
                  className={clsx(classes.chip, !open && classes.chipClose)}
                  label={this.props.tags.length}
                  color='primary'
                  size='small'
                  variant='outlined'/>
              )}
            </ListItem>
            <ListItem button onClick={this.props.onManageTags.bind(this)}>
              <ListItemIcon>
                <FormatListBulletedIcon />
              </ListItemIcon>
              <ListItemText primary="Batch Tag" />
            </ListItem>
          </div>

          <Divider />

          <div>
            <Collapse in={open}>
              <ListSubheader inset>
                Import Remote Sources
              </ListSubheader>
            </Collapse>
            <ListItem button>
              <ListItemIcon>
                <SourceIcon type={ST.tumblr}/>
              </ListItemIcon>
              <ListItemText primary="Tumblr" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <SourceIcon type={ST.reddit}/>
              </ListItemIcon>
              <ListItemText primary="Reddit" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <SourceIcon type={ST.twitter}/>
              </ListItemIcon>
              <ListItemText primary="Twitter" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <SourceIcon type={ST.instagram}/>
              </ListItemIcon>
              <ListItemText primary="Instagram" />
            </ListItem>
          </div>

          <Divider />

          <div>
            <ListItem button>
              <ListItemIcon>
                <WarningIcon />
              </ListItemIcon>
              <ListItemText primary="Mark Offline" />
            </ListItem>
          </div>

          <div className={classes.fill}/>

          <div>
            <ListItem button onClick={this.props.onExportLibrary.bind(this)}>
              <ListItemIcon>
                <PublishIcon />
              </ListItemIcon>
              <ListItemText primary="Export Library" />
            </ListItem>
            <ListItem button onClick={this.props.onImportLibrary.bind(this)}>
              <ListItemIcon>
                <GetAppIcon />
              </ListItemIcon>
              <ListItemText primary="Import Library" />
            </ListItem>
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

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth={false} className={classes.container}>
            <div/>
          </Container>
        </main>

        <Tooltip title="Remove All Sources"  placement="left">
          <Fab
            className={clsx(classes.addButton, classes.removeAllButton, this.state.openMenu != MO.new && classes.addButtonClose)}
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
        <Tooltip title="Local Video"  placement="left">
          <Fab
            className={clsx(classes.addButton, classes.addVideoButton, this.state.openMenu != MO.new && classes.addButtonClose)}
            onClick={this.props.onAddSource.bind(this, null, AF.videos)}
            size="small">
            <MovieIcon className={classes.icon} />
          </Fab>
        </Tooltip>
        <Tooltip title="Local Directory"  placement="left">
          <Fab
            className={clsx(classes.addButton, classes.addDirectoryButton, this.state.openMenu != MO.new && classes.addButtonClose)}
            onClick={this.props.onAddSource.bind(this, null, AF.directory)}
            size="small">
            <FolderIcon className={classes.icon} />
          </Fab>
        </Tooltip>
        <Tooltip title="URL"  placement="left">
          <Fab
            className={clsx(classes.addButton, classes.addURLButton, this.state.openMenu != MO.new && classes.addButtonClose)}
            onClick={this.props.onAddSource.bind(this, null, AF.url)}
            size="small">
            <HttpIcon className={classes.icon} />
          </Fab>
        </Tooltip>
        <Fab
          className={classes.addMenuButton}
          onClick={this.onToggleNewMenu.bind(this)}
          size="large">
          <AddIcon className={classes.icon} />
        </Fab>

        {this.props.library.length >= 2 && (
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
                    <IconButton edge="end" onClick={this.props.onSort.bind(this, null, sf, true)}>
                      <ArrowUpwardIcon/>
                    </IconButton>
                    <IconButton edge="end" onClick={this.props.onSort.bind(this, null, sf, false)}>
                      <ArrowDownwardIcon/>
                    </IconButton>
                  </ListItemSecondaryAction>
                </MenuItem>
              )}
            </Menu>
          </React.Fragment>
        )}
      </div>
    );
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
        if (className.includes("Library-root")) {
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

  onRemoveAll() {
    this.setState({openMenu: MO.removeAllAlert});
  }

  onFinishRemoveAll() {
    this.props.onUpdateLibrary([]);
    this.onCloseDialog();
  }
}

export default withStyles(styles)(Library as any);