import * as React from "react";
import clsx from "clsx";
import {readdir} from "fs";
import {move} from "fs-extra";

import {
  AppBar, Backdrop, Badge, Button, Chip, Collapse, Container, createStyles, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Drawer, Fab, IconButton, LinearProgress, ListItem,
  ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader, Menu, MenuItem, Theme, Toolbar, Tooltip,
  Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CancelIcon from '@material-ui/icons/Cancel';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import FolderIcon from '@material-ui/icons/Folder';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import GetAppIcon from '@material-ui/icons/GetApp';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MenuIcon from'@material-ui/icons/Menu';
import MergeTypeIcon from '@material-ui/icons/MergeType';
import MovieFilterIcon from '@material-ui/icons/MovieFilter';
import MovieIcon from '@material-ui/icons/Movie';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import PublishIcon from '@material-ui/icons/Publish';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import ShuffleIcon from "@material-ui/icons/Shuffle";
import SortIcon from '@material-ui/icons/Sort';

import {AF, LT, MO, PR, SF, SP, ST} from "../../data/const";
import {getCachePath, getLocalPath, getTimestampValue} from "../../data/utils";
import {getSourceType} from "../player/Scrapers";
import en from "../../data/en";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import LibrarySearch from "./LibrarySearch";
import SourceIcon from "./SourceIcon";
import SourceList from "./SourceList";
import URLDialog from "../sceneDetail/URLDialog";

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
    ...theme.mixins.toolbar
  },
  backButton: {
    float: 'left',
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
  displayCount: {
    marginTop: 3,
    marginRight: theme.spacing(1),
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
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  drawerPaperHidden: {
    width: 0,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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
    minHeight: theme.spacing(6),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
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
    backgroundColor: theme.palette.background.default,
  },
  container: {
    padding: theme.spacing(0),
    overflow: 'hidden',
    flexGrow: 1,
  },
  containerNotEmpty: {
    display: 'flex',
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
  selectAllButton: {
    backgroundColor: theme.palette.secondary.dark,
    margin: 0,
    top: 'auto',
    right: 130,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  selectNoneButton: {
    backgroundColor: theme.palette.secondary.light,
    margin: 0,
    top: 'auto',
    right: 180,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  importBadge:{
    top: 'auto',
    right: 30,
    bottom: 75,
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
    margin: 0,
    top: 'auto',
    right: 130,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  addButtonClose: {
    marginBottom: 0,
    transition: theme.transitions.create(['margin', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen + theme.transitions.duration.standard,
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
  hidden: {
    opacity: 0,
    transition: theme.transitions.create(['margin', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: 100,
    }),
  },
  noScroll: {
    overflow: 'visible',
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
    selected: Array<string>,
    specialMode: string,
    tags: Array<Tag>,
    tutorial: string,
    yOffset: number,
    goBack(): void,
    onAddSource(scene: Scene, type: string, ...args: any[]): void,
    onBatchTag(): void,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onEditBlacklist(sourceURL: string, blacklist: string): void,
    onExportLibrary(): void,
    onImportFromLibrary(sources: Array<LibrarySource>): void,
    onImportLibrary(): void,
    onImportInstagram(): void,
    onImportReddit(): void,
    onImportTumblr(): void,
    onImportTwitter(): void,
    onManageTags(): void,
    onMarkOffline(): void,
    onPlay(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onSort(scene: Scene, algorithm: string, ascending: boolean): void,
    onTutorial(tutorial: string): void,
    onUpdateLibrary(fn: (library: Array<LibrarySource>) => void): void,
    onUpdateMode(mode: string): void,
    onUpdateVideoMetadata(): void,
    savePosition(yOffset: number, filters:Array<string>, selected: Array<string>): void,
    systemMessage(message: string): void,
  };

  readonly state = {
    displaySources: Array<LibrarySource>(),
    drawerOpen: false,
    filters: this.props.filters,
    selected: this.props.selected,
    selectedTags: Array<string>(),
    menuAnchorEl: null as any,
    openMenu: null as string,
    moveDialog: false,
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

    let cancelProgressMessage;
    switch (this.props.progressMode) {
      case PR.offline:
        cancelProgressMessage = "Cancel Offline Check ( " + this.props.progressCurrent + " / " + this.props.progressTotal + " )";
        break;
      case PR.videoMetadata:
        cancelProgressMessage = "End Video MD Check ( " + this.props.progressCurrent + " / " + this.props.progressTotal + " )";
        break;
      case PR.tumblr:
        cancelProgressMessage = "Cancel Import ( " + this.props.progressCurrent + " / " + this.props.progressTotal + " )";
        break;
      case PR.reddit:
      case PR.twitter:
      case PR.instagram:
        cancelProgressMessage = "Cancel Import";
        break;
    }

    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift, this.props.tutorial == LT.toolbar && clsx(classes.backdropTop, classes.disable))}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip title={this.props.specialMode == SP.select ? "Cancel Import" : "Back"} placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  className={classes.backButton}
                  onClick={this.goBack.bind(this)}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </div>

            <Typography component="h1" variant="h4" color="inherit" noWrap
                        className={classes.title}>
              Library
            </Typography>

            <div className={classes.headerRight}>
              <div className={clsx(classes.searchBar, this.props.tutorial == LT.toolbar && classes.highlight)}>
                {this.props.library.length > 0 && (
                  <Chip
                    className={classes.searchCount}
                    label={this.props.library.length}
                    size='medium'
                    variant='outlined'/>
                )}
                {this.state.filters.length > 0 && (
                  <Chip
                    className={classes.displayCount}
                    label={this.state.displaySources.length}
                    size='medium'/>
                )}
                <LibrarySearch
                  displaySources={this.state.displaySources}
                  filters={this.state.filters}
                  tags={this.props.tags}
                  placeholder={"Search ..."}
                  isCreatable
                  onlyUsed
                  onUpdateFilters={this.onUpdateFilters.bind(this)}/>
              </div>
            </div>
          </Toolbar>
        </AppBar>

        <Drawer
          className={clsx(classes.drawer, (this.props.tutorial == LT.sidebar1 || this.props.tutorial == LT.sidebar2 || this.state.drawerOpen) && classes.backdropTop, this.props.tutorial == LT.sidebar2 && classes.highlight)}
          variant="permanent"
          classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose, this.props.specialMode && classes.drawerPaperHidden)}}
          open={this.state.drawerOpen}>
          <div className={clsx(!open && classes.appBarSpacerWrapper)}>
            <Collapse in={!open}>
              <div className={classes.appBarSpacer} />
            </Collapse>
          </div>

          <ListItem className={classes.drawerButton}>
            <IconButton
              className={clsx(this.props.tutorial == LT.sidebar1 && classes.highlight)}
              onClick={this.onToggleDrawer.bind(this)}>
              <MenuIcon className={classes.drawerIcon}/>
            </IconButton>
          </ListItem>

          <Divider />

          <div className={clsx(this.props.tutorial != null && classes.disable)}>

            <Tooltip title={this.state.drawerOpen ? "" : "Manage Tags"}>
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
            </Tooltip>
            <Tooltip title={this.state.drawerOpen ? "" : "Batch Tag"}>
              <ListItem button onClick={this.onBatchTag.bind(this)}>
                <ListItemIcon>
                  <FormatListBulletedIcon />
                </ListItemIcon>
                <ListItemText primary="Batch Tag" />
              </ListItem>
            </Tooltip>
            <Tooltip title={"Identify local sources which have identical tags"}>
              <ListItem button onClick={this.onFindMerges.bind(this)}>
                <ListItemIcon>
                  <MergeTypeIcon />
                </ListItemIcon>
                <ListItemText primary="Find Mergeables" />
              </ListItem>
            </Tooltip>
          </div>

          {remoteAuthorized && (
            <React.Fragment>
              <Divider />

              <div className={clsx(this.props.tutorial != null && classes.disable)}>
                <Collapse in={open}>
                  <ListSubheader inset>
                    Import Remote Sources
                  </ListSubheader>
                </Collapse>
                {tumblrAuthorized && (
                  <Tooltip title={this.state.drawerOpen ? "" : "Import from Tumblr"}>
                    <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportTumblr.bind(this)}>
                      <ListItemIcon>
                        <SourceIcon type={ST.tumblr}/>
                      </ListItemIcon>
                      <ListItemText primary="Tumblr" />
                    </ListItem>
                  </Tooltip>
                )}
                {redditAuthorized && (
                  <Tooltip title={this.state.drawerOpen ? "" : "Import from Reddit"}>
                    <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportReddit.bind(this)}>
                      <ListItemIcon>
                        <SourceIcon type={ST.reddit}/>
                      </ListItemIcon>
                      <ListItemText primary="Reddit" />
                    </ListItem>
                  </Tooltip>
                )}
                {twitterAuthorized && (
                  <Tooltip title={this.state.drawerOpen ? "" : "Import from Twitter"}>
                    <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportTwitter.bind(this)}>
                      <ListItemIcon>
                        <SourceIcon type={ST.twitter}/>
                      </ListItemIcon>
                      <ListItemText primary="Twitter" />
                    </ListItem>
                  </Tooltip>
                )}
                {instagramAuthorized && (
                  <Tooltip title={this.state.drawerOpen ? "" : "Import from Instagram"}>
                    <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportInstagram.bind(this)}>
                      <ListItemIcon>
                        <SourceIcon type={ST.instagram}/>
                      </ListItemIcon>
                      <ListItemText primary="Instagram" />
                    </ListItem>
                  </Tooltip>
                )}
              </div>
            </React.Fragment>
          )}

          <Divider />

          <div className={clsx(this.props.tutorial != null && classes.disable)}>
            <Tooltip title={"Identify sources which are not accessible"}>
              <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onMarkOffline.bind(this)}>
                <ListItemIcon>
                  <OfflineBoltIcon />
                </ListItemIcon>
                <ListItemText primary="Mark Offline" />
              </ListItem>
            </Tooltip>
            <Tooltip title={"Detect duration and resolution of video sources"}>
              <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onUpdateVideoMetadata.bind(this)}>
                <ListItemIcon>
                  <MovieFilterIcon />
                </ListItemIcon>
                <ListItemText primary="Video Metadata" />
              </ListItem>
            </Tooltip>
          </div>

          {this.props.progressMode != null && (
            <React.Fragment>
              <Divider />

              <div>
                <Tooltip title={this.state.drawerOpen ? "" : cancelProgressMessage}>
                  <ListItem button onClick={this.props.onUpdateMode.bind(this, PR.cancel)}>
                    <ListItemIcon>
                      <CancelIcon color="error"/>
                    </ListItemIcon>
                    <ListItemText primary={cancelProgressMessage} />
                  </ListItem>
                </Tooltip>
                {(this.props.progressMode === PR.offline || this.props.progressMode === PR.tumblr || this.props.progressMode === PR.videoMetadata) && (
                  <LinearProgress variant="determinate" value={Math.round((this.props.progressCurrent / this.props.progressTotal) * 100)}/>
                )}
                {this.props.progressMode !== PR.offline && this.props.progressMode !== PR.tumblr && this.props.progressMode !== PR.videoMetadata && (
                  <LinearProgress variant={this.props.progressMode === PR.cancel ? "query" : "indeterminate"}/>
                )}
              </div>
            </React.Fragment>
          )}

          <div className={classes.fill}/>

          <div className={clsx(this.props.tutorial != null && classes.disable)}>
            <Tooltip title={this.state.drawerOpen ? "" : "Export Library"}>
              <ListItem button onClick={this.props.onExportLibrary.bind(this)}>
                <ListItemIcon>
                  <PublishIcon />
                </ListItemIcon>
                <ListItemText primary="Export Library" />
              </ListItem>
            </Tooltip>
            <Tooltip title={this.state.drawerOpen ? "" : "Import Library"}>
              <ListItem button onClick={this.props.onImportLibrary.bind(this)}>
                <ListItemIcon>
                  <GetAppIcon />
                </ListItemIcon>
                <ListItemText primary="Import Library" />
              </ListItem>
            </Tooltip>
          </div>
        </Drawer>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <div className={clsx(classes.root, classes.fill)}>
            {!this.props.specialMode &&  (
              <div className={classes.drawerSpacer}/>
            )}
            <Container maxWidth={false} className={clsx(classes.container, this.state.displaySources.length > 0 && classes.containerNotEmpty)}>
              <SourceList
                config={this.props.config}
                isSelect={!!this.props.specialMode}
                library={this.props.library}
                selected={this.state.selected}
                showHelp={!this.props.specialMode && this.state.filters.length == 0}
                sources={this.state.displaySources}
                yOffset={this.props.yOffset}
                onClearBlacklist={this.props.onClearBlacklist.bind(this)}
                onClip={this.props.onClip.bind(this)}
                onEditBlacklist={this.props.onEditBlacklist.bind(this)}
                onPlay={this.props.onPlay.bind(this)}
                onUpdateSelected={this.onUpdateSelected.bind(this)}
                onUpdateLibrary={this.props.onUpdateLibrary.bind(this)}
                savePosition={this.savePosition.bind(this)}
                systemMessage={this.props.systemMessage.bind(this)}/>
            </Container>
          </div>
        </main>

        <Backdrop
          className={classes.backdrop}
          onClick={this.onCloseDialog.bind(this)}
          open={this.props.tutorial == null && (this.state.openMenu == MO.new || this.state.drawerOpen)} />

        {this.props.specialMode && (
          <React.Fragment>
            <Tooltip title="Clear"  placement="top-end">
              <Fab
                className={classes.selectNoneButton}
                onClick={this.onSelectNone.bind(this)}
                size="small">
                <ClearIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Select All"  placement="top-end">
              <Fab
                className={classes.selectAllButton}
                onClick={this.onSelectAll.bind(this)}
                size="medium">
                <SelectAllIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title={this.props.specialMode == SP.batchTag ? "Batch Tag" : "Import"}  placement="top-end">
              <Badge
                className={classes.importBadge}
                color="secondary"
                badgeContent={this.state.selected.length}
                max={999}>
                <Fab
                  className={classes.addMenuButton}
                  disabled={this.state.selected.length == 0}
                  onClick={this.props.specialMode == SP.batchTag ? this.onToggleBatchTagModal.bind(this) : this.onImportFromLibrary.bind(this)}
                  size="large">
                  {this.props.specialMode == SP.select && (
                    <GetAppIcon className={classes.icon} />
                  )}
                  {this.props.specialMode == SP.batchTag && (
                    <LocalOfferIcon className={classes.icon} />
                  )}
                </Fab>
              </Badge>
            </Tooltip>
          </React.Fragment>
        )}

        {!this.props.specialMode && (
          <React.Fragment>
            {this.props.library.length > 0 && (
              <Tooltip title={this.state.filters.length == 0 ? "Delete All Sources" : "Delete These Sources"}  placement="left">
                <Fab
                  className={classes.removeAllButton}
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
                </React.Fragment>
              )}
              {this.state.filters.length > 0 && (
                <React.Fragment>
                  <DialogTitle id="remove-all-title">Delete Sources</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="remove-all-description">
                      Are you sure you want to remove these sources from your library?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={this.onFinishRemoveVisible.bind(this)} color="primary">
                      Confirm
                    </Button>
                  </DialogActions>
                </React.Fragment>
              )}
            </Dialog>
            <Tooltip title={this.state.filters.length > 0 ? "" : "Local Video/Playlist"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addVideoButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.videos)}
                size="small">
                <MovieIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title={this.state.filters.length > 0 ? "" : "Local Directory"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addDirectoryButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.directory)}
                size="small">
                <FolderIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title={this.state.filters.length > 0 ? "" : "URL"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addURLButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.url)}
                size="small">
                <HttpIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Fab
              className={clsx(classes.addMenuButton, this.state.openMenu == MO.new && classes.backdropTop)}
              disabled={this.state.filters.length > 0}
              onClick={this.onToggleNewMenu.bind(this)}
              size="large">
              <AddIcon className={classes.icon} />
            </Fab>
          </React.Fragment>
        )}

        <Fab
          disabled={this.props.library.length < 2}
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
                <IconButton edge="end" onClick={this.props.onSort.bind(this, null, sf, true)}>
                  <ArrowUpwardIcon/>
                </IconButton>
                <IconButton edge="end" onClick={this.props.onSort.bind(this, null, sf, false)}>
                  <ArrowDownwardIcon/>
                </IconButton>
              </ListItemSecondaryAction>
            </MenuItem>
          )}
          <MenuItem key={SF.random}>
            <ListItemText primary={en.get(SF.random)}/>
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={this.props.onSort.bind(this, null, SF.random, true)}>
                <ShuffleIcon/>
              </IconButton>
            </ListItemSecondaryAction>
          </MenuItem>
        </Menu>

        <URLDialog
          open={this.state.openMenu == MO.urlImport}
          onImportURL={this.onAddSource.bind(this)}
          onClose={this.onCloseDialog.bind(this)}
        />
        <Dialog
          classes={{paper: classes.noScroll}}
          open={this.state.openMenu == MO.batchTag}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="batch-tag-title"
          aria-describedby="batch-tag-description">
          <DialogTitle id="batch-tag-title">Batch Tag</DialogTitle>
          <DialogContent className={classes.noScroll}>
            <DialogContentText id="batch-tag-description">
              Choose tags to add, remove, or overwrite on the selected source(s)
            </DialogContentText>
            {this.state.openMenu == MO.batchTag &&
              <LibrarySearch
                displaySources={this.props.library}
                filters={this.state.selectedTags}
                tags={this.props.tags}
                placeholder={"Tag These Sources"}
                isClearable
                onlyTags
                showCheckboxes
                hideSelectedOptions={false}
                onUpdateFilters={this.onSelectTags.bind(this)}/>
            }
          </DialogContent>
          <DialogActions>
            <Button disabled={this.state.selectedTags && this.state.selectedTags.length == 0}
                    onClick={this.batchTagRemove.bind(this)} color="secondary">
              - Remove
            </Button>
            <Button disabled={this.state.selectedTags && this.state.selectedTags.length == 0}
                    onClick={this.batchTagAdd.bind(this)} color="secondary">
              + Add
            </Button>
            <Button onClick={this.batchTagOverwrite.bind(this)} color="primary">
              Overwrite
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.moveDialog}
          onClose={this.onCloseMoveDialog.bind(this)}
          aria-describedby="move-description">
          <DialogTitle id="move-title">Localize Offline Sources</DialogTitle>
          <DialogContent>
            <DialogContentText id="move-description">
              You are about to convert all offline sources to local sources. Any cached images will be moved to a
              local directory. Offline sources without cached images will be removed from the Library.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseMoveDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishMove.bind(this)} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  componentDidMount() {
    this.setState({displaySources: this.getDisplaySources()});
    window.addEventListener('keydown', this.onKeyDown, false);
  }

  componentDidUpdate(props: any, state: any) {
    if (state.filters != this.state.filters || props.library != this.props.library) {
      this.setState({displaySources: this.getDisplaySources()});
    }
    if (this.props.tutorial == LT.final && this.state.drawerOpen) {
      this.setState({drawerOpen: false});
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  // Use alt+P to access import modal
  // Use alt+M to toggle highlighting  sources
  // Use alt+L to move cached offline sources to local sources
  onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'p' || e.key == 'π')) {
      this.setState({openMenu: this.state.openMenu == MO.urlImport ? null : MO.urlImport});
    } else if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'm' || e.key == 'µ')) {
      this.toggleMarked();
    } else if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'l' || e.key == '¬')) {
      this.moveOffline();
    } else if (e.key == 'Escape' && this.props.specialMode != null) {
      this.goBack();
    }
  };

  moveOffline() {
    this.setState({moveDialog: true});
  }

  onFinishMove() {
    for (let source of this.props.library) {
      if (source.offline) {
        const cachePath = getCachePath(source.url, this.props.config);
        readdir(cachePath, (error, files) => {
          if (!!error || files.length == 0) {
            this.props.onUpdateLibrary((l) => {
              l.forEach((s, index) => {
                if (s.id == source.id) {
                  l.splice(index, 1);
                  return;
                }
              });
            });
          } else {
            const localPath = getLocalPath(source.url, this.props.config);
            move(cachePath, localPath, console.error);
            this.props.onUpdateLibrary((l) => {
              l.forEach((s, index) => {
                if (s.id == source.id) {
                  s.url = localPath;
                  s.offline = false;
                  s.lastCheck = null;
                  s.count = files.length;
                  s.countComplete = true;
                  return;
                }
              });
            });
          }
        });
      }
    }
    this.onCloseMoveDialog();
  }

  onCloseMoveDialog() {
    this.setState({moveDialog: false});
  }

  onBatchTag() {
    this.onCloseDialog();
    this.props.onBatchTag();
  }

  onFindMerges() {
    this.onUpdateFilters(["<Mergeable>"]);
  }

  getMerges() {
    let merges: Array<LibrarySource> = [];
    let remainingLibrary = this.props.library.filter((ls) => getSourceType(ls.url) == ST.local && ls.tags.length > 0);
    // While we still have sources left to check
    while (remainingLibrary.length > 0) {
      // Grab the first source in the list
      const source = remainingLibrary.splice(0, 1)[0];
      let matches = [source];

      // For the rest of the sources
      for (let rs of remainingLibrary) {
        // Compare tags
        if (rs.tags.length == source.tags.length) {
          let hasAllTags = true;
          const tagNames = source.tags.map((t) => t.name);
          for (let tag of rs.tags) {
            if (!tagNames.includes(tag.name)) {
              hasAllTags = false;
            }
          }
          // If the tags are the same, add to matches
          if (hasAllTags) {
            matches.push(rs);
          }
        }
      }
      // If we've found matches
      if (matches.length > 1) {
        for (let m of matches) {
          if (m != source) {
            // Remove them from the remaining library
            remainingLibrary.splice(remainingLibrary.indexOf(m), 1);
          }
        }
        // Add to the master lit of mergeables
        merges = merges.concat(matches);
      }
    }
    return merges;
  }

  goBack() {
    if (this.props.specialMode == SP.batchTag) {
      this.setState({selected: [], selectedTags: []});
      this.props.onBatchTag();
    } else {
      this.props.goBack();
    }
  }

  onUpdateFilters(filters: Array<string>) {
    this.setState({filters: filters, displaySources: this.getDisplaySources()});
  }

  onAddSource(addFunction: string, e: MouseEvent, ...args: any[]) {
    this.onCloseDialog();
    if (addFunction == AF.videos && e.shiftKey) {
      this.props.onAddSource(null, AF.videoDir, ...args);
    } else {
      this.props.onAddSource(null, addFunction, ...args);
    }
  }

  onToggleBatchTagModal() {
    if (this.state.openMenu == MO.batchTag) {
      this.setState({openMenu: null, selectedTags: []});
    } else {
      this.setState({openMenu: MO.batchTag, selectedTags: this.getSelectedTags()});
    }
  }

  onSelectTags(selectedTags: Array<string>) {
    this.setState({selectedTags: selectedTags});
  }

  onToggleDrawer() {
    if (this.props.tutorial == LT.sidebar1) {
      this.props.onTutorial(LT.sidebar1);
    }
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
    this.props.onUpdateLibrary((l) => {
      l.splice(0, l.length);
    });
    this.onCloseDialog();
  }

  onFinishRemoveVisible() {
    this.props.onUpdateLibrary((l) => {
      const displayIDs = this.state.displaySources.map((s) => s.id);
      for (let i = l.length -1; i >= 0 ; i--) {
        if (displayIDs.includes(l[i].id)) {
          l.splice(i, 1);
        }
      }
    });
    this.onCloseDialog();
    this.setState({filters: []});
  }

  onImportFromLibrary() {
    const selected = this.state.selected;
    const sources = new Array<LibrarySource>();
    for (let url of selected) {
      const source = this.props.library.find((s) => s.url == url);
      if (source) {
        sources.push(source);
      }
    }
    this.props.onImportFromLibrary(sources);
  }

  onUpdateSelected(selected: Array<string>) {
    this.setState({selected: selected});
  }

  onSelectAll() {
    const displaySources = this.state.displaySources;
    const newSelected = Array.from(this.state.selected);
    for (let source of displaySources.map((s) => s.url)) {
      if (!newSelected.includes(source)) {
        newSelected.push(source);
      }
    }
    this.setState({selected: newSelected});
  }

  onSelectNone() {
    const displaySources = this.state.displaySources;
    let newSelected = Array.from(this.state.selected);
    for (let source of displaySources.map((s) => s.url)) {
      if (newSelected.includes(source)) {
        newSelected.splice(newSelected.indexOf(source), 1)
      }
    }
    this.setState({selected: newSelected});
  }

  savePosition() {
    const sortableList = document.getElementById("sortable-list");
    if (sortableList) {
      const scrollElement = sortableList.firstElementChild;
      const scrollTop = scrollElement ? scrollElement.scrollTop : 0;
      this.props.savePosition(scrollTop, this.state.filters, this.state.selected);
    }
  }

  toggleMarked() {
    let taggingMode = this.props.library.find((s) => s.marked) == null;
    if (taggingMode) { // We're marking sources
      this.props.onUpdateLibrary((l) => {
        for (let source of this.state.displaySources) {
          l.find((s) => s.id == source.id).marked = true;
        }
      });
    } else { // We're unmarking sources
      this.props.onUpdateLibrary((l) => {
        for (let source of l) {
          source.marked = false;
        }
      });
    }
  }

  batchTagOverwrite() {
    this.props.onUpdateLibrary((l) => {
      for (let sourceURL of this.state.selected) {
        const source = l.find((s) => s.url === sourceURL);
        source.tags = new Array<Tag>();
        for (let tag of this.state.selectedTags) {
          source.tags.push(new Tag({name: tag, id: this.props.tags.find((t) => t.name == tag).id}));
        }
      }
    });
    this.onCloseDialog();
  }

  batchTagAdd() {
    this.props.onUpdateLibrary((l) => {
      for (let sourceURL of this.state.selected) {
        const source = l.find((s) => s.url === sourceURL);
        const sourceTags = source.tags.map((t) => t.name);
        for (let tag of this.state.selectedTags) {
          if (!sourceTags.includes(tag)) {
            source.tags.push(new Tag({name: tag, id: this.props.tags.find((t) => t.name == tag).id}));
          }
        }
      }
    });
    this.onCloseDialog();
  }

  batchTagRemove() {
    this.props.onUpdateLibrary((l) => {
      for (let sourceURL of this.state.selected) {
        const source = l.find((s) => s.url === sourceURL);
        const sourceTags = source.tags.map((t) => t.name);
        for (let tag of this.state.selectedTags) {
          if (sourceTags.includes(tag)) {
            const indexOf = sourceTags.indexOf(tag);
            source.tags.splice(indexOf, 1);
            sourceTags.splice(indexOf, 1);
          }
        }
      }
    });
    this.onCloseDialog();
  }

  getSelectedTags() {
    let tagSelectValue = new Array<string>();
    let commonTags = Array<Tag>();
    for (let sourceURL of this.state.selected) {
      const source = this.props.library.find((s) => s.url === sourceURL);
      const tags = source.tags;
      if (commonTags.length == 0) {
        commonTags = tags;
      } else {
        const tagNames = tags.map((t) => t.name);
        commonTags = commonTags.filter((t) => tagNames.includes(t.name));
      }

      if (commonTags.length == 0) break;
    }

    if (commonTags.length > 0) {
      tagSelectValue = commonTags.map((t) => t.name);
    }

    return tagSelectValue;
  }

  getDisplaySources() {
    let displaySources = [];
    const filtering = this.state.filters.length > 0;
    if (filtering) {
      const mergeSources = this.state.filters.includes("<Mergeable>") ? this.getMerges() : null;
      for (let source of mergeSources ? mergeSources : this.props.library) {
        let matchesFilter = true;
        let countRegex;
        for (let filter of this.state.filters) {
          if (filter == "<Mergeable>") {
            matchesFilter = mergeSources.includes(source);
          } else if (filter == "<Offline>") { // This is offline filter
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
      displaySources = this.props.library;
    }
    return displaySources;
  }
}

(Library as any).displayName="Library";
export default withStyles(styles)(Library as any);