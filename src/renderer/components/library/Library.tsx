import * as React from "react";
import clsx from "clsx";
import CreatableSelect from "react-select/creatable";

import {
  AppBar, Backdrop, Button, Chip, Collapse, Container, createStyles, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Divider, Drawer, Fab, IconButton, ListItem, ListItemIcon, ListItemSecondaryAction,
  ListItemText, ListSubheader, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import FolderIcon from '@material-ui/icons/Folder';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import GetAppIcon from '@material-ui/icons/GetApp';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MenuIcon from'@material-ui/icons/Menu';
import MovieIcon from '@material-ui/icons/Movie';
import PublishIcon from '@material-ui/icons/Publish';
import SortIcon from '@material-ui/icons/Sort';
import WarningIcon from '@material-ui/icons/Warning';

import {AF, MO, PR, SF, ST} from "../../data/const";
import en from "../../data/en";
import Config from "../../data/Config";
import Scene from "../../data/Scene";
import SourceIcon from "../sceneDetail/SourceIcon";
import SourceList from "../sceneDetail/SourceList";
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
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    ...theme.mixins.toolbar
  },
  backButton: {
    float: 'left',
  },
  title: {
    textAlign: 'center',
  },
  searchBar: {
    float: 'right',
    display: 'flex',
    maxWidth: '100%',
  },
  searchCount: {
    color: theme.palette.primary.contrastText,
    marginTop: 3,
    marginRight: theme.spacing(1),
  },
  searchSelect: {
    minWidth: 200,
    maxWidth: `calc(100% - ${theme.spacing(7)}px)`,
    maxHeight: theme.mixins.toolbar.minHeight,
    color: theme.palette.text.primary,
  },
  titleBar: {
    flex: 1,
    maxWidth: '33%',
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
  drawer: {
    position: 'absolute',
  },
  drawerSpacer: {
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  drawerButton: {
    backgroundColor: theme.palette.primary.main,
  },
  drawerIcon: {
    color: theme.palette.primary.contrastText,
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
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: (theme.palette.primary as any)["50"],
  },
  container: {
    display: 'flex',
    padding: theme.spacing(0),
    overflowY: 'auto',
    flexGrow: 1,
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
  backdrop: {
    zIndex: theme.zIndex.modal,
    height: '100%',
    width: '100%',
  },
  backdropTop: {
    zIndex: theme.zIndex.modal + 1,
  },
});

class Library extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    filters: Array<string>,
    library: Array<LibrarySource>,
    progressCurrent: number,
    progressMode: string,
    progressTitle: string,
    progressTotal: number,
    tags: Array<Tag>,
    goBack(): void,
    onAddSource(scene: Scene, type: string): void,
    onBatchTag(): void,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource): void,
    onExportLibrary(): void,
    onImportLibrary(): void,
    onImportInstagram(): void,
    onImportReddit(): void,
    onImportTumblr(): void,
    onImportTwitter(): void,
    onManageTags(): void,
    onMarkOffline(): void,
    onSort(scene: Scene, algorithm: string, ascending: boolean): void,
    onUpdateLibrary(sources: Array<LibrarySource>): void,
    onUpdateMode(mode: string): void,
  };

  readonly state = {
    drawerOpen: false,
    filters: this.props.filters,
    menuAnchorEl: null as any,
    openMenu: null as string,
    searchInput: "",
  };

  handleChange = (search: [{label: string, value: string}]) => {
    if (search == null) {
      this.setState({filters: []});
    } else {
      let filters = Array<string>();
      for (let s of search) {
        if (s.value.endsWith("~")) {
          filters = filters.concat(s.value);
        } else {
          filters = filters.concat(s.value.split(" "));
        }
      }
      this.setState({filters});
    }
  };
  handleInputChange = (searchInput: string) => {
    this.setState({searchInput})
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;

    const tumblrAuthorized = this.props.config.remoteSettings.tumblrOAuthToken != "" &&
      this.props.config.remoteSettings.tumblrOAuthTokenSecret != "";
    const redditAuthorized = this.props.config.remoteSettings.redditRefreshToken != "";
    const twitterAuthorized = this.props.config.remoteSettings.twitterAccessTokenKey != "" &&
      this.props.config.remoteSettings.twitterAccessTokenSecret != "";
    const instagramAuthorized = this.props.config.remoteSettings.instagramUsername != "" &&
      this.props.config.remoteSettings.instagramPassword != "";
    const remoteAuthorized = tumblrAuthorized || redditAuthorized || twitterAuthorized || instagramAuthorized;

    const displaySources = this.getDisplaySources();
    const tags = new Map<string, number>();
    let untaggedCount = 0;
    let offlineCount = 0;
    let markedCount = 0;
    const options = Array<{ label: string, value: string }>();
    const defaultValues = Array<{ label: string, value: string }>();
    for (let source of displaySources) {
      if (source.offline) {
        offlineCount++;
      }
      if (source.marked) {
        markedCount++;
      }

      if (source.tags.length > 0) {
        for (let tag of source.tags) {
          if (tags.has(tag.name)) {
            tags.set(tag.name, tags.get(tag.name) + 1);
          } else {
            tags.set(tag.name, 1);
          }
        }
      } else {
        untaggedCount += 1;
      }
    }
    const tagKeys = Array.from(tags.keys()).sort((a, b) => {
      const aCount = tags.get(a);
      const bCount = tags.get(b);
      if (aCount > bCount) {
        return -1;
      } else if (aCount < bCount) {
        return 1;
      } else {
        return 0;
      }
    });
    for (let filter of this.state.filters) {
      let opt;
      if (filter.endsWith("~")) { // This is a tag filter
        opt = {label: filter.substring(0, filter.length-1) + " (Tag)", value: filter};
      } else {
        opt = {label: filter, value: filter};
      }
      options.push(opt);
      defaultValues.push(opt);
    }

    if (untaggedCount > 0 && !this.state.filters.includes("<Untagged>")) {
      options.push({label: "<Untagged> (" + untaggedCount + ")", value: "<Untagged>"});
    }
    if (offlineCount > 0 && !this.state.filters.includes("<Offline>")) {
      options.push({label: "<Offline> (" + offlineCount + ")", value: "<Offline>"});
    }
    if (markedCount > 0 && !this.state.filters.includes("<Marked>")) {
      options.push({label: "<Marked> (" + markedCount + ")", value: "<Marked>"});
    }
    for (let tag of tagKeys) {
      if (!this.state.filters.includes(tag + "~")) {
        options.push({label: tag + " (" + tags.get(tag) + ")", value: tag + "~"});
      }
    }
    if (this.state.searchInput.startsWith("-")) {
      for (let tag of tagKeys) {
        if (!this.state.filters.includes(tag + "~")) {
          options.push({label: "-" + tag + " (" + tags.get(tag) + ")", value: "-" + tag + "~"});
        }
      }
    }

    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar>
            <div className={classes.titleBar}>
              <Tooltip title="Back" placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  className={classes.backButton}
                  onClick={this.props.goBack.bind(this)}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </div>

            <Typography component="h1" variant="h4" color="inherit" noWrap
                        className={clsx(classes.title, classes.titleBar)}>
              Library
            </Typography>

            <div className={classes.titleBar}>
              <div className={classes.searchBar}>
                {this.props.library.length > 0 && (
                  <Chip
                    className={classes.searchCount}
                    label={this.props.library.length}
                    size='medium'
                    variant='outlined'/>
                )}
                <CreatableSelect
                  className={clsx(classes.searchSelect, "CreatableSelect")}
                  components={{DropdownIndicator: null,}}
                  value={defaultValues}
                  options={options}
                  inputValue={this.state.searchInput}
                  isClearable
                  isMulti
                  rightAligned={true}
                  placeholder="Search ..."
                  formatCreateLabel={(input: string) => "Search for " + input}
                  onChange={this.handleChange}
                  onInputChange={this.handleInputChange}
                />
              </div>
            </div>
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
            <ListItem button onClick={this.props.onBatchTag.bind(this)}>
              <ListItemIcon>
                <FormatListBulletedIcon />
              </ListItemIcon>
              <ListItemText primary="Batch Tag" />
            </ListItem>
          </div>

          {remoteAuthorized && (
            <React.Fragment>
              <Divider />

              <div>
                <Collapse in={open}>
                  <ListSubheader inset>
                    Import Remote Sources
                  </ListSubheader>
                </Collapse>
                {tumblrAuthorized && (
                  <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportTumblr.bind(this)}>
                    <ListItemIcon>
                      <SourceIcon type={ST.tumblr}/>
                    </ListItemIcon>
                    <ListItemText primary="Tumblr" />
                  </ListItem>
                )}
                {redditAuthorized && (
                  <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportReddit.bind(this)}>
                    <ListItemIcon>
                      <SourceIcon type={ST.reddit}/>
                    </ListItemIcon>
                    <ListItemText primary="Reddit" />
                  </ListItem>
                )}
                {twitterAuthorized && (
                  <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportTwitter.bind(this)}>
                    <ListItemIcon>
                      <SourceIcon type={ST.twitter}/>
                    </ListItemIcon>
                    <ListItemText primary="Twitter" />
                  </ListItem>
                )}
                {instagramAuthorized && (
                  <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportInstagram.bind(this)}>
                    <ListItemIcon>
                      <SourceIcon type={ST.instagram}/>
                    </ListItemIcon>
                    <ListItemText primary="Instagram" />
                  </ListItem>
                )}
              </div>
            </React.Fragment>
          )}

          <Divider />

          <div>
            <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onMarkOffline.bind(this)}>
              <ListItemIcon>
                <WarningIcon />
              </ListItemIcon>
              <ListItemText primary="Mark Offline" />
            </ListItem>
          </div>

          {this.props.progressMode != null && (
            <React.Fragment>
              <Divider />

              <div>
                <ListItem button onClick={this.props.onUpdateMode.bind(this, PR.cancel)}>
                  <ListItemIcon>
                    <CancelIcon color="error"/>
                  </ListItemIcon>
                  <ListItemText primary={`Cancel ${this.props.progressMode == PR.offline ? 'Offline Check' : 'Import'}`} />
                </ListItem>
              </div>
            </React.Fragment>
          )}

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

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <div className={clsx(classes.root, classes.fill)}>
            <div className={classes.drawerSpacer}/>
            <Container maxWidth={false} className={classes.container}>
              <SourceList
                config={this.props.config}
                sources={displaySources}
                onClearBlacklist={this.props.onClearBlacklist.bind(this)}
                onClip={this.props.onClip.bind(this)}
                onUpdateSources={this.props.onUpdateLibrary.bind(this)} />
            </Container>
          </div>
        </main>

        <Backdrop
          className={classes.backdrop}
          onClick={this.onCloseDialog.bind(this)}
          open={this.state.openMenu == MO.new || this.state.drawerOpen} />

        <Tooltip title="Remove All Sources"  placement="left">
          <Fab
            className={clsx(classes.addButton, classes.removeAllButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop)}
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
          <DialogTitle id="remove-all-title">Delete Library</DialogTitle>
          <DialogContent>
            <DialogContentText id="remove-all-description">
              Are you sure you really wanna delete your entire library...? ಠ_ಠ
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishRemoveAll.bind(this)} color="primary">
              Yea... I'm sure
            </Button>
          </DialogActions>
        </Dialog>
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

  onAddSource(addFunction: string) {
    this.onCloseDialog();
    this.props.onAddSource(null, addFunction);
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

  onRemoveAll() {
    this.setState({openMenu: MO.removeAllAlert});
  }

  onFinishRemoveAll() {
    this.props.onUpdateLibrary([]);
    this.onCloseDialog();
  }

  getDisplaySources() {
    let displaySources = [];
    const filtering = this.state.filters.length > 0;
    if (filtering) {
      for (let source of this.props.library) {
        let matchesFilter = true;
        let countRegex;
        for (let filter of this.state.filters) {
          if (filter == "<Offline>") { // This is offline filter
            matchesFilter = source.offline;
          } else if (filter == "<Marked>") { // This is a marked filter
            matchesFilter = source.marked;
          }else if (filter == "<Untagged>") { // This is untagged filter
            matchesFilter = source.tags.length === 0;
          } else if (filter.endsWith("~")) { // This is a tag filter
            let tag = filter.substring(0, filter.length-1);
            if (tag.startsWith("-")) {
              tag = tag.substring(1, tag.length);
              matchesFilter = source.tags.find((t) => t.name == tag) == null;
            } else {
              matchesFilter = source.tags.find((t) => t.name == tag) != null;
            }
          } else if ((countRegex = /^count(\+?)([>=<])(\d*)$/.exec(filter)) != null) {
            const all = countRegex[1] == "+";
            const symbol = countRegex[2];
            const value = parseInt(countRegex[3], 10);
            switch (symbol) {
              case "=":
                matchesFilter = (all || source.countComplete) && source.count == value;
                break;
              case ">":
                matchesFilter = (all || source.countComplete) && source.count > value;
                break;
              case "<":
                matchesFilter = (all || source.countComplete) && source.count < value;
                break;
            }
          } else { // This is a search filter
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter, "i");
              matchesFilter = !regex.test(source.url);
            } else {
              const regex = new RegExp(filter, "i");
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
      displaySources = this.props.library;
    }
    return displaySources;
  }
}

export default withStyles(styles)(Library as any);