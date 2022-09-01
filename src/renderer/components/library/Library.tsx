import * as React from "react";
import clsx from "clsx";
import {readdir, readFileSync, unlinkSync} from "fs";
import rimraf from "rimraf";
import {move} from "fs-extra";
import path from "path";
import {remote} from "electron";
import wretch from "wretch";

import {
  AppBar,
  Backdrop,
  Badge,
  Button,
  Chip,
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
  InputAdornment,
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  SvgIcon,
  TextField,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FolderIcon from '@mui/icons-material/Folder';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GetAppIcon from '@mui/icons-material/GetApp';
import HttpIcon from '@mui/icons-material/Http';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MenuIcon from'@mui/icons-material/Menu';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import MovieIcon from '@mui/icons-material/Movie';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import PublishIcon from '@mui/icons-material/Publish';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SortIcon from '@mui/icons-material/Sort';

import {AF, LT, MO, PR, SF, SP, ST} from "../../data/const";
import {filterSource, getCachePath, getLocalPath} from "../../data/utils";
import {getSourceType} from "../player/Scrapers";
import en from "../../data/en";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import BatchClipDialog from "./BatchClipDialog";
import LibrarySearch from "./LibrarySearch";
import SourceIcon from "./SourceIcon";
import SourceList from "./SourceList";
import URLDialog from "../sceneDetail/URLDialog";
import PiwigoDialog from "../sceneDetail/PiwigoDialog";

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
    [theme.breakpoints.down('sm')]: {
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
    bottom: 50,
    left: 'auto',
    position: 'fixed',
    zIndex: theme.zIndex.fab + 1,
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
  addPiwigoButton: {
    marginBottom: 225
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
    onBatchClip(): void,
    onBatchTag(): void,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource, displayed: Array<LibrarySource>): void,
    onDownload(source: LibrarySource): void;
    onEditBlacklist(sourceURL: string, blacklist: string): void,
    onExportLibrary(): void,
    onImportFromLibrary(sources: Array<LibrarySource>): void,
    onImportLibrary(importLibrary: any): void,
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
    importFile: "",
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
    const piwigoConfigured = this.props.config.remoteSettings.piwigoProtocol != "" &&
      this.props.config.remoteSettings.piwigoHost != "";
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
        <AppBar enableColorOnDark position="absolute" className={clsx(classes.appBar, open && classes.appBarShift, this.props.tutorial == LT.toolbar && clsx(classes.backdropTop, classes.disable))}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip disableInteractive title={this.props.specialMode == SP.select ? "Cancel Import" : "Back"} placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  className={classes.backButton}
                  onClick={this.goBack.bind(this)}
                  size="large">
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
              onClick={this.onToggleDrawer.bind(this)}
              size="large">
              <MenuIcon className={classes.drawerIcon}/>
            </IconButton>
          </ListItem>

          <Divider />

          <div className={clsx(this.props.tutorial != null && classes.disable)}>

            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Manage Tags"}>
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
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Batch Tag"}>
              <ListItem button onClick={this.onBatchTag.bind(this)}>
                <ListItemIcon>
                  <FormatListBulletedIcon />
                </ListItemIcon>
                <ListItemText primary="Batch Tag" />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Batch Clip"}>
              <ListItem button onClick={this.onBatchClip.bind(this)}>
                <ListItemIcon>
                  <SvgIcon>
                    <path d="M11 21H7V19H11V21M15.5 19H17V21H13V19H13.2L11.8 12.9L9.3 13.5C9.2 14 9 14.4 8.8
                          14.8C7.9 16.3 6 16.7 4.5 15.8C3 14.9 2.6 13 3.5 11.5C4.4 10 6.3 9.6 7.8 10.5C8.2 10.7 8.5
                          11.1 8.7 11.4L11.2 10.8L10.6 8.3C10.2 8.2 9.8 8 9.4 7.8C8 6.9 7.5 5 8.4 3.5C9.3 2 11.2
                          1.6 12.7 2.5C14.2 3.4 14.6 5.3 13.7 6.8C13.5 7.2 13.1 7.5 12.8 7.7L15.5 19M7 11.8C6.3
                          11.3 5.3 11.6 4.8 12.3C4.3 13 4.6 14 5.3 14.4C6 14.9 7 14.7 7.5 13.9C7.9 13.2 7.7 12.2 7
                          11.8M12.4 6C12.9 5.3 12.6 4.3 11.9 3.8C11.2 3.3 10.2 3.6 9.7 4.3C9.3 5 9.5 6 10.3 6.5C11
                          6.9 12 6.7 12.4 6M12.8 11.3C12.6 11.2 12.4 11.2 12.3 11.4C12.2 11.6 12.2 11.8 12.4
                          11.9C12.6 12 12.8 12 12.9 11.8C13.1 11.6 13 11.4 12.8 11.3M21 8.5L14.5 10L15 12.2L22.5
                          10.4L23 9.7L21 8.5M23 19H19V21H23V19M5 19H1V21H5V19Z" />
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText primary="Batch Clip" />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={"Identify local sources which have identical tags"}>
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
                  <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Import from Tumblr"}>
                    <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportTumblr.bind(this)}>
                      <ListItemIcon>
                        <SourceIcon type={ST.tumblr}/>
                      </ListItemIcon>
                      <ListItemText primary="Tumblr" />
                    </ListItem>
                  </Tooltip>
                )}
                {redditAuthorized && (
                  <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Import from Reddit"}>
                    <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportReddit.bind(this)}>
                      <ListItemIcon>
                        <SourceIcon type={ST.reddit}/>
                      </ListItemIcon>
                      <ListItemText primary="Reddit" />
                    </ListItem>
                  </Tooltip>
                )}
                {twitterAuthorized && (
                  <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Import from Twitter"}>
                    <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onImportTwitter.bind(this)}>
                      <ListItemIcon>
                        <SourceIcon type={ST.twitter}/>
                      </ListItemIcon>
                      <ListItemText primary="Twitter" />
                    </ListItem>
                  </Tooltip>
                )}
                {instagramAuthorized && (
                  <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Import from Instagram"}>
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
            <Tooltip disableInteractive title={"Identify sources which are not accessible"}>
              <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onMarkOffline.bind(this)}>
                <ListItemIcon>
                  <OfflineBoltIcon />
                </ListItemIcon>
                <ListItemText primary="Mark Offline" />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={"Detect duration and resolution of video sources"}>
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
                <Tooltip disableInteractive title={this.state.drawerOpen ? "" : cancelProgressMessage}>
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
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Export Library"}>
              <ListItem button onClick={this.props.onExportLibrary.bind(this)}>
                <ListItemIcon>
                  <PublishIcon />
                </ListItemIcon>
                <ListItemText primary="Export Library" />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Import Library"}>
              <ListItem button onClick={this.onImportLibrary.bind(this)}>
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
                onDownload={this.props.onDownload.bind(this)}
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
            <Tooltip disableInteractive title="Clear"  placement="top-end">
              <Fab
                className={classes.selectNoneButton}
                onClick={this.onSelectNone.bind(this)}
                size="small">
                <ClearIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title="Select All"  placement="top-end">
              <Fab
                className={classes.selectAllButton}
                onClick={this.onSelectAll.bind(this)}
                size="medium">
                <SelectAllIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title={this.props.specialMode == SP.batchTag ? "Batch Tag" : this.props.specialMode == SP.batchClip ? "Batch Clip" : "Import"}  placement="top-end">
              <Badge
                classes={{
                  badge: classes.importBadge
                }}
                overlap="circular"
                color="secondary"
                badgeContent={this.state.selected.length}
                max={999}>
                <Fab
                  className={classes.addMenuButton}
                  disabled={this.state.selected.length == 0}
                  onClick={this.props.specialMode == SP.batchTag ? this.onToggleBatchTagModal.bind(this) : this.props.specialMode == SP.batchClip ? this.onToggleBatchClipModal.bind(this) : this.onImportFromLibrary.bind(this)}
                  size="large">
                  {this.props.specialMode == SP.select && (
                    <GetAppIcon className={classes.icon} />
                  )}
                  {this.props.specialMode == SP.batchTag && (
                    <LocalOfferIcon className={classes.icon} />
                  )}
                  {this.props.specialMode == SP.batchClip && (
                    <SvgIcon className={classes.icon} >
                      <path d="M11 21H7V19H11V21M15.5 19H17V21H13V19H13.2L11.8 12.9L9.3 13.5C9.2 14 9 14.4 8.8
                          14.8C7.9 16.3 6 16.7 4.5 15.8C3 14.9 2.6 13 3.5 11.5C4.4 10 6.3 9.6 7.8 10.5C8.2 10.7 8.5
                          11.1 8.7 11.4L11.2 10.8L10.6 8.3C10.2 8.2 9.8 8 9.4 7.8C8 6.9 7.5 5 8.4 3.5C9.3 2 11.2
                          1.6 12.7 2.5C14.2 3.4 14.6 5.3 13.7 6.8C13.5 7.2 13.1 7.5 12.8 7.7L15.5 19M7 11.8C6.3
                          11.3 5.3 11.6 4.8 12.3C4.3 13 4.6 14 5.3 14.4C6 14.9 7 14.7 7.5 13.9C7.9 13.2 7.7 12.2 7
                          11.8M12.4 6C12.9 5.3 12.6 4.3 11.9 3.8C11.2 3.3 10.2 3.6 9.7 4.3C9.3 5 9.5 6 10.3 6.5C11
                          6.9 12 6.7 12.4 6M12.8 11.3C12.6 11.2 12.4 11.2 12.3 11.4C12.2 11.6 12.2 11.8 12.4
                          11.9C12.6 12 12.8 12 12.9 11.8C13.1 11.6 13 11.4 12.8 11.3M21 8.5L14.5 10L15 12.2L22.5
                          10.4L23 9.7L21 8.5M23 19H19V21H23V19M5 19H1V21H5V19Z" />
                    </SvgIcon>
                  )}
                </Fab>
              </Badge>
            </Tooltip>
          </React.Fragment>
        )}

        {!this.props.specialMode && (
          <React.Fragment>
            {this.props.library.length > 0 && (
              <Tooltip disableInteractive title={this.state.filters.length == 0 ? "Delete All Sources" : "Delete These Sources"}  placement="left">
                <Fab
                  className={classes.removeAllButton}
                  onClick={this.onRemoveAll.bind(this)}
                  size="small">
                  <DeleteSweepIcon className={classes.icon} />
                </Fab>
              </Tooltip>
            )}
            <Dialog
              open={this.state.openMenu == MO.libraryImport}
              onClose={this.onCloseDialog.bind(this)}
              aria-labelledby="import-title"
              aria-describedby="import-description">
              <DialogTitle id="import-title">Import Library</DialogTitle>
              <DialogContent>
                <DialogContentText id="import-description">
                  To import a library, enter the URL or open a local file.
                </DialogContentText>
                <TextField
                  variant="standard"
                  label="Import File"
                  fullWidth
                  placeholder="Paste URL Here"
                  margin="dense"
                  value={this.state.importFile}
                  InputProps={{
                    endAdornment:
                      <InputAdornment position="end">
                        <Tooltip disableInteractive title="Open File">
                          <IconButton onClick={this.onOpenImportFile.bind(this)} size="large">
                            <FolderIcon/>
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>,
                  }}
                  onChange={this.onChangeImportFile.bind(this)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={this.onCloseDialog.bind(this)}>
                  Cancel
                </Button>
                <Button color="primary"
                        disabled={this.state.importFile.length == 0}
                        onClick={this.onFinishImportLibrary.bind(this, this.state.importFile)}>
                  Import
                </Button>
              </DialogActions>
            </Dialog>
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
            <Dialog
              open={this.state.openMenu == MO.deleteAlert}
              onClose={this.onCloseDialog.bind(this)}
              aria-labelledby="delete-all-title"
              aria-describedby="delete-all-description">
              {this.state.filters.length == 0 && (
                <React.Fragment>
                  <DialogTitle id="delete-all-title">PERMANENTLY Delete Library</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="delete-all-description">
                      Are you sure you really wanna delete your entire library...? ಠ_ಠ
                    </DialogContentText>
                    <DialogContentText id="delete-all-description">
                      WARNING: THIS WILL DELETE ANY LOCAL FILES FROM DISK
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={this.onFinishDeleteAll.bind(this)} color="primary">
                      PERMANENTLY DELETE FROM DISK
                    </Button>
                  </DialogActions>
                </React.Fragment>
              )}
              {this.state.filters.length > 0 && (
                <React.Fragment>
                  <DialogTitle id="delete-all-title">PERMANENTLY Delete Sources</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="delete-all-description">
                      Are you sure you want to remove these sources from your library?
                    </DialogContentText>
                    <DialogContentText id="delete-all-description">
                      WARNING: THIS WILL DELETE ANY LOCAL FILES FROM DISK
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={this.onFinishDeleteVisible.bind(this)} color="primary">
                      PERMANENTLY DELETE FROM DISK
                    </Button>
                  </DialogActions>
                </React.Fragment>
              )}
            </Dialog>
            {piwigoConfigured &&
              <Tooltip disableInteractive title={this.state.filters.length > 0 ? "" : "Piwigo"}  placement="left">
                <Fab
                  className={clsx(classes.addButton, classes.addPiwigoButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                  disabled={this.state.filters.length > 0}
                  onClick={this.openPiwigoDialog.bind(this)}
                  size="small">
                  <SourceIcon className={classes.icon} type={ST.piwigo}/>
                </Fab>
              </Tooltip>
            }
            <Tooltip disableInteractive title={this.state.filters.length > 0 ? "" : "Local Video/Playlist"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addVideoButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.videos)}
                size="small">
                <MovieIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.filters.length > 0 ? "" : "Local Directory"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addDirectoryButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.directory)}
                size="small">
                <FolderIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.filters.length > 0 ? "" : "URL"}  placement="left">
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

        <PiwigoDialog 
          config={this.props.config}
          open={this.state.openMenu == MO.piwigo}
          onClose={this.onCloseDialog.bind(this)}
          onImportURL={this.onAddSource.bind(this)}
        />

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
                  onClick={this.props.onSort.bind(this, null, sf, true)}
                  size="large">
                  <ArrowUpwardIcon/>
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={this.props.onSort.bind(this, null, sf, false)}
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
                onClick={this.props.onSort.bind(this, null, SF.random, true)}
                size="large">
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
        <BatchClipDialog
          open={this.state.openMenu == MO.batchClip}
          library={this.props.library}
          selected={this.state.selected}
          onCloseDialog={this.onCloseDialog.bind(this)}
          onUpdateLibrary={this.props.onUpdateLibrary.bind(this)}
        />
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
    if (state.filters != this.state.filters || props.library != this.props.library || props.specialMode != this.props.specialMode) {
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

  openPiwigoDialog() {
    this.setState({openMenu: MO.piwigo});
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

  onBatchClip() {
    this.onCloseDialog();
    this.props.onBatchClip();
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
    } else if (this.props.specialMode == SP.batchClip) {
      this.setState({selected: [], clipOffset: [0, 0]});
      this.props.onBatchClip();
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

  onToggleBatchClipModal() {
    if (this.state.openMenu == MO.batchClip) {
      this.setState({openMenu: null, clipOffset: [0, 0]});
    } else {
      this.setState({openMenu: MO.batchClip, clipOffset: [0, 0]});
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
    this.setState({menuAnchorEl: null, openMenu: null, drawerOpen: false, importFile: ""});
  }

  onRemoveAll(e: MouseEvent) {
    if (e.shiftKey && e.altKey && e.ctrlKey) {
      this.setState({openMenu: MO.deleteAlert});
    } else {
      this.setState({openMenu: MO.removeAllAlert});
    }
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

  onFinishDeleteAll() {
    for (let l of this.props.library) {
      const fileType = getSourceType(l.url);
      if (fileType == ST.local) {
        rimraf.sync(l.url);
      } else if (fileType == ST.video || fileType == ST.playlist || fileType == ST.list) {
        unlinkSync(l.url);
      }
    }
    this.props.onUpdateLibrary((l) => {
      l.splice(0, l.length);
    });
    this.onCloseDialog();
  }

  onFinishDeleteVisible() {
    this.props.onUpdateLibrary((l) => {
      const displayIDs = this.state.displaySources.map((s) => s.id);
      for (let i = l.length -1; i >= 0 ; i--) {
        if (displayIDs.includes(l[i].id)) {
          const fileType = getSourceType(l[i].url);
          if (fileType == ST.local) {
            rimraf.sync(l[i].url);
          } else if (fileType == ST.video || fileType == ST.playlist || fileType == ST.list) {
            unlinkSync(l[i].url);
          }
          l.splice(i, 1);
        }
      }
    });
    this.onCloseDialog();
    this.setState({filters: []});
  }

  onOpenImportFile() {
    const filePath = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
      {filters: [{name:'All Files (*.*)', extensions: ['*']},{name: 'JSON Document', extensions: ['json']}], properties: ['openFile']});
    if (!filePath || !filePath.length) return;
    this.setState({importFile: filePath[0]});
  }

  onChangeImportFile(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({importFile: input.value});
  }

  onImportLibrary() {
    this.setState({openMenu: MO.libraryImport});
  }

  onFinishImportLibrary() {
    if (this.state.importFile.startsWith("http")) {
      wretch(this.state.importFile)
        .get()
        .text((text) => {
          let json;
          try {
            json = JSON.parse(text);
            this.props.onImportLibrary(json);
            this.onCloseDialog();
          } catch (e) {
            this.props.systemMessage("This is not a valid JSON file");
          }
        })
        .catch((e) => {
          this.props.systemMessage("Error accessing URL");
        });
    } else {
      this.props.onImportLibrary(JSON.parse(readFileSync(this.state.importFile, 'utf-8')));
      this.onCloseDialog();
    }
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
        for (let filter of this.state.filters) {
          matchesFilter = filterSource(filter, source, null, mergeSources);
          if (!matchesFilter) break;
        }
        if (matchesFilter) {
          displaySources.push(source);
        }
      }
    } else {
      displaySources = this.props.library;
    }
    if (this.props.specialMode == SP.batchClip) {
      displaySources = displaySources.filter((s) => getSourceType(s.url) == ST.video);
    }
    return displaySources;
  }
}

(Library as any).displayName="Library";
export default withStyles(styles)(Library as any);