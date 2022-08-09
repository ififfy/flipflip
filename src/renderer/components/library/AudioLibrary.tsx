import * as React from "react";
import {remote} from "electron";
import path from 'path';
import clsx from "clsx";
import {parseBuffer, parseFile} from "music-metadata";
import * as fs from "fs";
import wretch from "wretch";

import {
  AppBar,
  Backdrop,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
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
import AlbumIcon from '@mui/icons-material/Album';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import CancelIcon from "@mui/icons-material/Cancel";
import ClearIcon from '@mui/icons-material/Clear';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import EditIcon from '@mui/icons-material/Edit';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GetAppIcon from '@mui/icons-material/GetApp';
import HttpIcon from '@mui/icons-material/Http';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MenuIcon from'@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SortIcon from '@mui/icons-material/Sort';

import {red} from "@mui/material/colors";

import {extractMusicMetadata, getFilesRecursively} from "../../data/utils";
import {isAudio} from "../player/Scrapers";
import {AF, ASF, ALT, MO, SP, PR} from "../../data/const";
import en from "../../data/en";
import Audio from "../../data/Audio";
import Playlist from "../../data/Playlist";
import Tag from "../../data/Tag";
import LibrarySearch from "./LibrarySearch";
import AudioSourceList from "./AudioSourceList";
import AudioArtistList from "./AudioArtistList";
import AudioAlbumList from "./AudioAlbumList";
import PlaylistSelect from "../configGroups/PlaylistSelect";
import PlaylistList from "./PlaylistList";
import AudioEdit from "./AudioEdit";

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
    minWidth: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
      minWidth: theme.spacing(9),
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
  addLocalButton: {
    marginBottom: 115
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
  playlistMenu: {
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
  },
  urlDialog: {
    width: '100%',
  },
  progress: {
    position: 'absolute',
    right: 20,
  },
  error: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  tabSection: {
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
  playlistsTab: {
    ariaControls: 'vertical-tabpanel-0',
  },
  artistsTab: {
    ariaControls: 'vertical-tabpanel-1',
  },
  albumsTab: {
    ariaControls: 'vertical-tabpanel-2',
  },
  songsTab: {
    ariaControls: 'vertical-tabpanel-3',
  },
  addProgress: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    zIndex: 1,
  },
});

class AudioLibrary extends React.Component {
  readonly props: {
    classes: any,
    cachePath: string,
    filters: Array<string>,
    library: Array<Audio>,
    progressCurrent: number,
    progressMode: string,
    progressTitle: string,
    progressTotal: number,
    openTab: number,
    playlists: Array<Playlist>,
    selected: Array<string>,
    specialMode: string,
    tags: Array<Tag>,
    tutorial: string,
    yOffset: number,
    goBack(): void,
    onAddToPlaylist(): void,
    onBatchTag(): void,
    onBatchEdit(): void,
    onBatchDetectBPM(): void,
    onChangeTab(newTab: number): void,
    onImportFromLibrary(sources: Array<Audio>): void,
    onManageTags(): void,
    onPlay(source: Audio, displayed: Array<Audio>): void,
    onSort(algorithm: string, ascending: boolean): void,
    onSortPlaylist(playist: string, algorithm: string, ascending: boolean): void,
    onTutorial(tutorial: string): void,
    onUpdateLibrary(fn: (library: Array<Audio>) => void): void,
    onUpdatePlaylists(fn: (playlists: Array<Playlist>) => void): void,
    onUpdateMode(mode: string): void,
    savePosition(yOffset: number, filters:Array<string>, selected: Array<string>): void,
    systemMessage(message: string): void,
  };

  readonly state = {
    displaySources: Array<Audio>(),
    drawerOpen: false,
    filters: this.props.filters,
    selected: this.props.selected,
    selectedTags: Array<string>(),
    menuAnchorEl: null as any,
    openMenu: null as string,
    playlistID: null as number,
    importURL: null as string,
    loadingMetadata: false,
    loadingSources: false,
    error: false,
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;
    const playlist = this.state.filters.find((f) => f.startsWith("playlist:"))?.replace("playlist:", "");
    return (
      <div className={classes.root}>
        <AppBar enableColorOnDark position="absolute" className={clsx(classes.appBar, open && classes.appBarShift, this.props.tutorial == ALT.toolbar && clsx(classes.backdropTop, classes.disable))}>
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
              Audio Library
            </Typography>

            <div className={classes.headerRight}>
              <div className={clsx(classes.searchBar, this.props.tutorial == ALT.toolbar && classes.highlight)}>
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
                  noTypes
                  onUpdateFilters={this.onUpdateFilters.bind(this)}/>
              </div>
            </div>
          </Toolbar>
        </AppBar>

        <Drawer
          className={clsx(classes.drawer, (this.props.tutorial == ALT.sidebar1 || this.props.tutorial == ALT.sidebar2 || this.state.drawerOpen) && classes.backdropTop, this.props.tutorial == ALT.sidebar2 && classes.highlight)}
          variant="permanent"
          classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)}}
          open={this.state.drawerOpen}>
          <div className={clsx(!open && classes.appBarSpacerWrapper)}>
            <Collapse in={!open}>
              <div className={classes.appBarSpacer} />
            </Collapse>
          </div>

          <ListItem className={classes.drawerButton}>
            <IconButton
              className={clsx(this.props.tutorial == ALT.sidebar1 && classes.highlight)}
              onClick={this.onToggleDrawer.bind(this)}
              size="large">
              <MenuIcon className={classes.drawerIcon}/>
            </IconButton>
          </ListItem>

          <Divider />

          <div>
            <Tabs
              orientation="vertical"
              value={this.props.openTab}
              onChange={this.onChangeTab.bind(this)}
              aria-label="audio library tabs"
              className={classes.tabs}>
              <Tab id="vertical-tab-0"
                   aria-controls="vertical-tabpanel-0"
                   icon={<QueueMusicIcon/>} label={open ? "Playlists" : ""}
                   className={clsx(classes.tab, classes.playlistsTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-1"
                   aria-controls="vertical-tabpanel-1"
                   icon={<PersonIcon/>} label={open ? "Artists" : ""}
                   className={clsx(classes.tab, classes.artistsTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-2"
                   aria-controls="vertical-tabpanel-2"
                   icon={<AlbumIcon/>} label={open ? "Albums" : ""}
                   className={clsx(classes.tab, classes.albumsTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-3"
                   aria-controls="vertical-tabpanel-3"
                   icon={<AudiotrackIcon/>} label={open ? "Songs" : ""}
                   className={clsx(classes.tab, classes.songsTab, !open && classes.tabClose)}/>
            </Tabs>
          </div>

          <Divider />

          <div className={clsx(this.props.tutorial != null && classes.disable)}>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Manage Tags"}>
              <ListItem button onClick={this.props.onManageTags.bind(this)} disabled={this.props.specialMode != null}>
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
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Add to Playlist"}>
              <ListItem button onClick={this.onAddToPlaylist.bind(this)} disabled={this.props.specialMode != null}>
                <ListItemIcon>
                  <PlaylistAddIcon />
                </ListItemIcon>
                <ListItemText primary="Add to Playlist" />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Batch Tag"}>
              <ListItem button onClick={this.onBatchTag.bind(this)} disabled={this.props.specialMode != null}>
                <ListItemIcon>
                  <FormatListBulletedIcon />
                </ListItemIcon>
                <ListItemText primary="Batch Tag" />
              </ListItem>
            </Tooltip>
            <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Batch Edit"}>
              <ListItem button onClick={this.onBatchEdit.bind(this)} disabled={this.props.specialMode != null}>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary="Batch Edit" />
              </ListItem>
            </Tooltip>
          </div>

          <Divider />

          <div className={clsx(this.props.tutorial != null && classes.disable)}>
            <Tooltip disableInteractive title={"BPM Detection"}>
              <ListItem button disabled={this.props.progressMode != null} onClick={this.props.onBatchDetectBPM.bind(this)}>
                <ListItemIcon>
                  <SvgIcon viewBox="0 0 24 24" fontSize="small">
                    <path
                      d="M12,1.75L8.57,2.67L4.07,19.5C4.06,19.5 4,19.84 4,20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20C20,19.84 19.94,19.5 19.93,19.5L15.43,2.67L12,1.75M10.29,4H13.71L17.2,17H13V12H11V17H6.8L10.29,4M11,5V9H10V11H14V9H13V5H11Z"/>
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText primary="BPM Detection" />
              </ListItem>
            </Tooltip>
          </div>

          {this.props.progressMode != null && (
            <React.Fragment>
              <Divider />

              <div>
                <Tooltip disableInteractive title={this.state.drawerOpen ? "" : "Cancel BPM Detection"}>
                  <ListItem button onClick={this.props.onUpdateMode.bind(this, PR.cancel)}>
                    <ListItemIcon>
                      <CancelIcon color="error"/>
                    </ListItemIcon>
                    <ListItemText primary={"Cancel BPM Detection"} />
                  </ListItem>
                </Tooltip>
                <LinearProgress variant="determinate" value={Math.round((this.props.progressCurrent / this.props.progressTotal) * 100)}/>
              </div>
            </React.Fragment>
          )}

          <div className={classes.fill}/>
        </Drawer>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth={false} className={classes.container}>

            {this.props.openTab === 0 && (
              <Typography component="div">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <PlaylistList
                      playlists={this.props.playlists}
                      audios={this.props.library}
                      showHelp={!this.props.specialMode && this.state.filters.length == 0}
                      onClickPlaylist={this.onClickPlaylist.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.openTab === 1 && (
              <Typography
                className={classes.tabSection}
                component="div">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <AudioArtistList
                      sources={this.state.displaySources}
                      showHelp={!this.props.specialMode && this.state.filters.length == 0}
                      onClickArtist={this.onClickArtist.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.openTab === 2 && (
              <Typography
                className={classes.tabSection}
                component="div">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <AudioAlbumList
                      sources={this.state.displaySources}
                      showHelp={!this.props.specialMode && this.state.filters.length == 0}
                      onClickAlbum={this.onClickAlbum.bind(this)}
                      onClickArtist={this.onClickArtist.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.openTab === 3 && (
              <Typography
                className={classes.tabSection}
                component="div">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box className={classes.fill}>
                    <AudioSourceList
                      cachePath={this.props.cachePath}
                      isSelect={!!this.props.specialMode}
                      selected={this.state.selected}
                      showHelp={!this.props.specialMode && this.state.filters.length == 0}
                      sources={this.state.displaySources}
                      tutorial={this.props.tutorial}
                      yOffset={this.props.yOffset}
                      playlist={playlist}
                      onClickAlbum={this.onClickAlbum.bind(this)}
                      onClickArtist={this.onClickArtist.bind(this)}
                      onPlay={this.props.onPlay.bind(this)}
                      onUpdateSelected={this.onUpdateSelected.bind(this)}
                      onUpdateLibrary={this.props.onUpdateLibrary.bind(this)}
                      onUpdatePlaylists={this.props.onUpdatePlaylists.bind(this)}
                      savePosition={this.savePosition.bind(this)}
                      systemMessage={this.props.systemMessage.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

          </Container>
        </main>

        <Backdrop
          className={classes.backdrop}
          onClick={this.onCloseDialog.bind(this)}
          open={this.props.tutorial == null && (this.state.openMenu == MO.new || this.state.drawerOpen)} />

        {this.props.specialMode && this.props.openTab == 3 && (
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
            {this.props.specialMode == SP.batchTag && (
              <Tooltip disableInteractive title={"Batch Tag"}  placement="top-end">
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
                    onClick={this.onToggleBatchTagModal.bind(this)}
                    size="large">
                    <LocalOfferIcon className={classes.icon} />
                  </Fab>
                </Badge>
              </Tooltip>
            )}
            {this.props.specialMode == SP.batchEdit && (
              <Tooltip disableInteractive title={"Batch Edit"}  placement="top-end">
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
                    onClick={this.onShowBatchEditModal.bind(this)}
                    size="large">
                    <EditIcon className={classes.icon} />
                  </Fab>
                </Badge>
              </Tooltip>
            )}
            {this.props.specialMode == SP.addToPlaylist && (
              <Tooltip disableInteractive title={"Add to Playlist"}  placement="top-end">
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
                    onClick={this.onTogglePlaylistDialog.bind(this)}
                    size="large">
                    <PlaylistAddIcon className={classes.icon} />
                  </Fab>
                </Badge>
              </Tooltip>
            )}
            {this.props.specialMode == SP.select && (
              <Tooltip disableInteractive title={"Import"}  placement="top-end">
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
                    onClick={this.onImportFromLibrary.bind(this)}
                    size="large">
                    <GetAppIcon className={classes.icon} />
                  </Fab>
                </Badge>
              </Tooltip>
            )}

          </React.Fragment>
        )}

        {!this.props.specialMode && this.props.openTab == 3 && (
          <React.Fragment>
            {this.props.library.length > 0 && (
              <Tooltip disableInteractive title={this.state.filters.length == 0 ? "Delete All Sources" : playlist ? "Delete Playlist" : "Delete These Sources"}  placement="left">
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
                  <DialogTitle id="remove-all-title">Delete Audio Library</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="remove-all-description">
                      Are you sure you really wanna delete your entire audio library...? ಠ_ಠ
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
              {this.state.filters.length > 0 && !playlist && (
                <React.Fragment>
                  <DialogTitle id="remove-all-title">Delete Sources</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="remove-all-description">
                      Are you sure you want to remove these sources from your audio library?
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
              {this.state.filters.length > 0 && playlist && (
                <React.Fragment>
                  <DialogTitle id="remove-all-title">Delete Playlist</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="remove-all-description">
                      Are you sure you want to delete this playlist?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={this.onFinishRemovePlaylist.bind(this)} color="primary">
                      Confirm
                    </Button>
                  </DialogActions>
                </React.Fragment>
              )}
            </Dialog>
            <Tooltip disableInteractive title={this.state.filters.length > 0 ? "" : "Local Audio"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addLocalButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.audios)}
                size="small">
                <AudiotrackIcon className={classes.icon} />
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
            {this.state.loadingSources && <CircularProgress size={60} color="secondary" className={classes.addProgress} />}
            <Fab
              className={clsx(classes.addMenuButton, this.state.openMenu == MO.new && classes.backdropTop)}
              disabled={this.state.filters.length > 0}
              onClick={this.onToggleNewMenu.bind(this)}
              size="large">
              <AddIcon className={classes.icon} />
            </Fab>
          </React.Fragment>
        )}

        {this.props.openTab == 3 && (
          <React.Fragment>
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
              {Object.values(ASF).filter((f) => f!=ASF.trackNum && f!=ASF.random).map((sf) =>
                <MenuItem key={sf}>
                  <ListItemText primary={en.get(sf)}/>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={playlist? this.props.onSortPlaylist.bind(this, playlist, sf, true) : this.props.onSort.bind(this, sf, true)}
                      size="large">
                      <ArrowUpwardIcon/>
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={playlist ? this.props.onSortPlaylist.bind(this, playlist, sf, false) : this.props.onSort.bind(this, sf, false)}
                      size="large">
                      <ArrowDownwardIcon/>
                    </IconButton>
                  </ListItemSecondaryAction>
                </MenuItem>
              )}
              <MenuItem key={ASF.random}>
                <ListItemText primary={en.get(ASF.random)}/>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={playlist? this.props.onSortPlaylist.bind(this, playlist, ASF.random, true) : this.props.onSort.bind(this, ASF.random, true)}
                    size="large">
                    <ShuffleIcon/>
                  </IconButton>
                </ListItemSecondaryAction>
              </MenuItem>
            </Menu>
          </React.Fragment>
        )}

        {this.state.openMenu == MO.urlImport && (
          <Dialog
            classes={{paper: clsx(classes.noScroll, classes.urlDialog)}}
            open={this.state.openMenu == MO.urlImport}
            onClose={this.onCloseDialog.bind(this)}
            aria-labelledby="add-url-title">
            <DialogTitle id="add-url-title">Add Audio URL</DialogTitle>
            <DialogContent className={classes.noScroll}>
              <DialogContentText id="add-url-description">
                Enter the URL of the audio file:
              </DialogContentText>
              <TextField
                variant="standard"
                label="Audio URL"
                fullWidth
                placeholder="Paste URL Here"
                margin="dense"
                value={this.state.importURL == null ? "" : this.state.importURL}
                onChange={this.onURLChange.bind(this)} />
            </DialogContent>
            <DialogActions>
              {this.state.loadingMetadata && <CircularProgress size={34} className={classes.progress} />}
              <Button
                className={clsx(this.state.error && classes.error)}
                onClick={this.onAddURL.bind(this)} color="primary">
                Import
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {this.state.openMenu == MO.playlist && (
          <Menu
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
            classes={{paper: classes.playlistMenu}}
            open={this.state.openMenu == MO.playlist}
            onClose={this.onCloseDialog.bind(this)}>
            <PlaylistSelect
              playlists={this.props.playlists}
              menuIsOpen
              autoFocus
              onChange={this.onChoosePlaylist.bind(this)} />
          </Menu>
        )}

        {this.state.openMenu == MO.newPlaylist && (
          <Dialog
            classes={{paper: clsx(classes.noScroll, classes.urlDialog)}}
            open={true}
            onClose={this.onCloseDialog.bind(this)}
            aria-labelledby="add-playlist-title">
            <DialogTitle id="add-playist-title">New Playlist</DialogTitle>
            <DialogContent className={classes.noScroll}>
              <TextField
                variant="standard"
                label="Name"
                fullWidth
                placeholder="Name your playlist"
                margin="dense"
                value={this.state.importURL == null ? "" : this.state.importURL}
                onChange={this.onURLChange.bind(this)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={this.onAddPlaylist.bind(this)} color="primary">
                Create Playlist
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {this.state.openMenu == MO.playlistDuplicates && (
          <Dialog
            classes={{paper: clsx(classes.noScroll, classes.urlDialog)}}
            open={true}
            onClose={this.onCloseDialog.bind(this)}
            aria-labelledby="duplicate-title">
            <DialogTitle id="duplicate-title">Add duplicate songs?</DialogTitle>
            <DialogContent className={classes.noScroll}>
              Some of these songs are already in this playlist
            </DialogContent>
            <DialogActions>
              <Button onClick={this.onSkipDuplicates.bind(this)} color="secondary">
                Skip Duplicates
              </Button>
              <Button
                onClick={this.onAddDuplicates.bind(this)} color="primary">
                Add Anyway
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {this.state.openMenu == MO.batchEdit && (
          <AudioEdit
            audio={this.getCommonAudio()}
            cachePath={this.props.cachePath}
            title={"Batch Edit song info"}
            onCancel={this.onCloseDialog.bind(this)}
            onFinishEdit={this.onFinishBatchEdit.bind(this)}
          />
        )}

        {this.state.openMenu == MO.batchTag && (
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
        )}
      </div>
    );
  }

  componentDidMount() {
    this.setState({displaySources: this.getDisplaySources()});
    window.addEventListener('keydown', this.onKeyDown, false);
  }

  componentDidUpdate(props: any, state: any) {
    if (state.filters != this.state.filters || props.library != this.props.library || props.playlists != this.props.playlists) {
      this.setState({displaySources: this.getDisplaySources()});
    }
    if (this.props.tutorial == ALT.final && this.state.drawerOpen) {
      this.setState({drawerOpen: false});
    }
  }

  componentWillUnmount() {
    this.savePosition();
    window.removeEventListener('keydown', this.onKeyDown);
  }

  // Use alt+M to toggle highlighting  sources
  onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'm' || e.key == 'µ')) {
      this.toggleMarked();
    } else if (e.key == 'Escape' && this.props.specialMode != null) {
      this.goBack();
    }
  };

  onChangeTab(e: any, newTab: number) {
    if (newTab != this.props.openTab) {
      this.props.onChangeTab(newTab);
    }
  }

  onClickPlaylist(playlist: string) {
    this.props.onChangeTab(3);
    this.setState({filters: ["playlist:" + playlist]});
  }

  onClickArtist(artist: string, e: MouseEvent) {
    e.stopPropagation();
    this.props.onChangeTab(2);
    this.setState({filters: this.state.filters.filter((f) => !f.startsWith("album:") && !f.startsWith("artist:")).concat(["artist:" + artist])})
  }

  onClickAlbum(album: string) {
    this.props.onChangeTab(3);
    this.setState({filters: this.state.filters.filter((f) => !f.startsWith("album:") && !f.startsWith("artist:")).concat(["album:" + album])})
  }

  onAddToPlaylist() {
    this.onCloseDialog();
    this.props.onAddToPlaylist();
  }

  onBatchTag() {
    this.onCloseDialog();
    this.props.onBatchTag();
  }

  onBatchEdit() {
    this.onCloseDialog();
    this.props.onBatchEdit();
  }


  goBack() {
    if (this.props.specialMode == SP.batchTag) {
      this.setState({selected: [], selectedTags: []});
      this.props.onBatchTag();
    } else if (this.props.specialMode == SP.batchEdit) {
      this.setState({selected: [], selectedTags: []});
      this.props.onBatchEdit();
    } else if (this.props.specialMode == SP.addToPlaylist) {
      this.setState({selected: [], selectedTags: []});
      this.props.onAddToPlaylist();
    } else {
      this.props.goBack();
    }
  }

  onUpdateFilters(filters: Array<string>) {
    this.setState({filters: filters, displaySources: this.getDisplaySources()});
  }

  onURLChange(e: MouseEvent) {
    const type = (e.target as HTMLInputElement).value;
    this.setState({importURL: type});
  }

  onAddSource(type: string, e: MouseEvent) {
    this.onCloseDialog();
    switch (type) {
      case AF.url:
        this.setState({openMenu: MO.urlImport, importURL: ""});
        break;
      case AF.audios:
        let aResult = new Array<string>();
        if (e.shiftKey) {
          let adResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
            {filters: [{name:'All Files (*.*)', extensions: ['*']}], properties: ['openDirectory', 'multiSelections']});
          if (!adResult) return;
          for (let path of adResult) {
            if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
              aResult = aResult.concat(getFilesRecursively(path));
            } else {
              aResult.push(path);
            }
          }
        } else {
          aResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
            {filters: [{name: 'All Files (*.*)', extensions: ['*']}, {name: 'Audio files', extensions: ['mp3', 'm4a', 'wav', 'ogg']}], properties: ['openFile', 'multiSelections']});
          if (!aResult) return;
        }
        aResult = aResult.filter((r) => isAudio(r, true));
        this.setState({loadingSources: true});
        this.addAudioSources(aResult);
        break;
    }
  }

  onAddURL() {
    const originalSources = Array.from(this.props.library);
    // dedup
    let sourceURLs = originalSources.map((s) => s.url);
    if (sourceURLs.includes(this.state.importURL) || !isAudio(this.state.importURL, false)) {
      console.error("File is not valid");
      this.setState({loadingMetadata: false, error: true});
      setTimeout(() => {this.setState({error: false})}, 3000);
      return;
    }

    let id = originalSources.length + 1;
    originalSources.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    const url = this.state.importURL;
    const newAudio = new Audio({
      url: url,
      id: id,
      tags: [],
    });
    id += 1;
    this.setState({loadingMetadata: true});

    const error = (err: any) => {
      console.error("File is not available:", err.message);
      this.setState({loadingMetadata: false, error: true});
      setTimeout(() => {this.setState({error: false})}, 3000);
    }
    wretch(url)
      .get()
      .unauthorized(error)
      .notFound(error)
      .timeout(error)
      .internalError(error)
      .arrayBuffer((buffer) => {
        parseBuffer(Buffer.from(buffer))
          .then((metadata: any) => {
            if (metadata) {
              extractMusicMetadata(newAudio, metadata, this.props.cachePath);
            }
            if (!newAudio.name) {
              newAudio.name = url.substring(url.lastIndexOf(path.sep) + 1, url.lastIndexOf("."));
            }
            originalSources.unshift(newAudio);
            this.props.onUpdateLibrary((l) => {
              l.splice(0, l.length);
              l.push(...originalSources);
            });
            this.setState({loadingMetadata: false});
            this.onCloseDialog();
          })
          .catch((err: any) => {
            console.error("Error reading metadata:", err.message);
            this.setState({loadingMetadata: false, error: true});
            setTimeout(() => {this.setState({error: false})}, 3000);
          });
      })
      .catch(error);
  }

  addAudioSources(newSources: Array<string>) {
    const originalSources = Array.from(this.props.library);
    // dedup
    let sourceURLs = originalSources.map((s) => s.url);
    newSources = newSources.filter((s) => !sourceURLs.includes(s) && isAudio(s, true));

    let id = originalSources.length + 1;
    originalSources.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    let index = 0;
    const addSourceLoop = () => {
      if (index == newSources.length) {
        this.props.onUpdateLibrary((l) => {
          l.splice(0, l.length);
          l.push(...originalSources);
        });
        this.setState({loadingSources: false});
        return;
      }

      const url = newSources[index];
      index++;

      if (url.startsWith("http") || fs.existsSync(url)) {
        const newAudio = new Audio({
          url: url,
          id: id,
          tags: [],
        });
        id += 1;
        parseFile(url)
          .then((metadata: any) => {
            if (metadata) {
              extractMusicMetadata(newAudio, metadata, this.props.cachePath);
            }
            if (!newAudio.name) {
              newAudio.name = url.substring(url.lastIndexOf(path.sep) + 1, url.lastIndexOf("."));
            }
            originalSources.unshift(newAudio);
            addSourceLoop();
          })
          .catch((err: any) => {
            console.error("Error reading metadata:", err.message);
            addSourceLoop();
          });
      } else {
        addSourceLoop();
      }
    }

    addSourceLoop();
  }

  onToggleBatchTagModal() {
    if (this.state.openMenu == MO.batchTag) {
      this.setState({openMenu: null, selectedTags: []});
    } else {
      this.setState({openMenu: MO.batchTag, selectedTags: this.getSelectedTags()});
    }
  }

  onShowBatchEditModal() {
    this.setState({openMenu: MO.batchEdit});
  }

  onTogglePlaylistDialog(e: MouseEvent) {
    if (this.state.openMenu == MO.playlist) {
      this.setState({menuAnchorEl: null, openMenu: null});
    } else {
      this.setState({menuAnchorEl: e.currentTarget, openMenu: MO.playlist});
    }
  }

  onChoosePlaylist(playlistID: number) {
    if (playlistID == -1) {
      this.setState({openMenu: MO.newPlaylist});
    } else {
      // Check to see if playlist already has any of these tracks
      const playlist = this.props.playlists.find((p) => p.id == playlistID);
      for (let url of this.state.selected) {
        const audio = this.props.library.find((a) => a.url == url);
        if (playlist.audios.includes(audio.id)) {
          // If so, show alert before adding to playlist
          this.setState({openMenu: MO.playlistDuplicates, playlistID: playlistID});
          return;
        }
      }
      // Otherwise, add tracks to playlist
      this.props.onUpdatePlaylists((ps) => {
        const playlist = ps.find((p) => p.id == playlistID);
        if (playlist) {
          playlist.audios = playlist.audios.concat(this.state.selected.map((s) => this.props.library.find((a) => a.url == s)?.id));
        }
      });
      this.goBack();
      this.onCloseDialog();
    }
  }

  onSkipDuplicates() {
    this.props.onUpdatePlaylists((ps) => {
      const playlist = ps.find((p) => p.id == this.state.playlistID);
      if (playlist) {
        for (let url of this.state.selected) {
          const audio = this.props.library.find((a) => a.url == url);
          if (!playlist.audios.includes(audio.id)) {
            playlist.audios.push(audio.id);
          }
        }
        for (let aID of playlist.audios) {
          const audio = this.props.library.find((a) => a.id == aID);
          if (!this.state.selected.includes(audio.url)) {
            playlist.audios.push(audio.id);
          }
        }
      }
    });
    this.goBack();
    this.onCloseDialog();
  }

  onAddDuplicates() {
    this.props.onUpdatePlaylists((ps) => {
      const playlist = ps.find((p) => p.id == this.state.playlistID);
      if (playlist) {
        playlist.audios = playlist.audios.concat(this.state.selected.map((s) => this.props.library.find((a) => a.url == s)?.id));
      }
    });
    this.goBack();
    this.onCloseDialog();
  }

  onAddPlaylist() {
    const name = this.state.importURL;
    for (let playlist of this.props.playlists) {
      if (name == playlist.name) return;
    }
    let id = this.props.playlists.length + 1;
    this.props.playlists.forEach((p) => {
      id = Math.max(p.id + 1, id);
    });
    const playlist = new Playlist({id: id, name: name, audios: this.state.selected.map((s) => this.props.library.find((a) => a.url == s)?.id)});
    this.props.onUpdatePlaylists((ps) => {
      ps.push(playlist);
    });
    this.goBack();
    this.onCloseDialog();
  }

  onSelectTags(selectedTags: Array<string>) {
    this.setState({selectedTags: selectedTags});
  }

  onToggleDrawer() {
    if (this.props.tutorial == ALT.sidebar1) {
      this.props.onTutorial(ALT.sidebar1);
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
    this.setState({menuAnchorEl: null, openMenu: null, drawerOpen: false, importURL: null, playlistID: null});
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

  onFinishRemovePlaylist() {
    this.props.onUpdatePlaylists((pl) => {
      const playlistName = this.state.filters.find((f) => f.startsWith("playlist:"))?.replace("playlist:", "");
      pl.forEach((p, index) => {
        if (p.name == playlistName) {
          pl.splice(index, 1);
          return
        }
      })
    });
    this.onCloseDialog();
    this.setState({filters: []});
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
    const sources = new Array<Audio>();
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
    } else {
      this.props.savePosition(0, this.state.filters, this.state.selected);
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

  onFinishBatchEdit(common: Audio) {
    const keys = ["thumb", "name", "artist", "album", "comment", "trackNum"];
    this.props.onUpdateLibrary((l) => {
      for (let sourceURL of this.state.selected) {
        const source: any = l.find((s) => s.url === sourceURL);
        for (let key of keys) {
          if ((common as any)[key] != null && (common as any)[key] != "") {
            source[key] = (common as any)[key];
          }
        }
      }
    });
    this.onCloseDialog();
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

  getCommonAudio() {
    const keys = ["thumb", "name", "artist", "album", "comment", "trackNum"];
    let common: any = new Audio();
    for (let sourceURL of this.state.selected) {
      const source: any = this.props.library.find((s) => s.url === sourceURL);
      for (let key of keys) {
        if (common[key] === undefined) {
          common[key] = source[key];
        } else if (common[key] != null && common[key] != source[key]) {
          common[key] = null;
        }
      }
    }
    for (let key of keys) {
      if (common[key] == null) {
        common[key] = undefined;
      }
    }
    return common;
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
      const playlistName = this.state.filters.find((f) => f.startsWith("playlist:"))?.replace("playlist:", "");
      const playlist = this.props.playlists.find((p) => p.name == playlistName);
      const library: Array<Audio> = playlist ? playlist.audios.map((aID) => this.props.library.find((a) => a.id==aID)) : this.props.library;
      for (let source of library) {
        let matchesFilter = true;
        let countRegex;
        for (let filter of this.state.filters) {
          if (filter == "<Marked>") { // This is a marked filter
            matchesFilter = source.marked;
          }else if (filter == "<Untagged>") { // This is untagged filter
            matchesFilter = source.tags.length === 0;
          } else if ((filter.startsWith("[") || filter.startsWith("-[")) && filter.endsWith("]")) { // This is a tag filter
            if (filter.startsWith("-")) {
              let tag = filter.substring(2, filter.length - 1);
              matchesFilter = source.tags.find((t) => t.name == tag) == null;
            } else {
              let tag = filter.substring(1, filter.length - 1);
              matchesFilter = source.tags.find((t) => t.name == tag) != null;
            }
          } else if (filter.startsWith("artist:") || filter.startsWith("-artist:")) {
            filter = filter.replace("artist:","");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              if (filter.length == 0) {
                matchesFilter = source.artist && source.artist.length > 0;
              } else {
                matchesFilter = filter != source.artist;
              }
            } else {
              if (filter.length == 0) {
                matchesFilter = !source.artist || source.artist.length == 0;
              } else {
                matchesFilter = filter == source.artist;
              }
            }
          } else if (filter.startsWith("album:") || filter.startsWith("-album:")) {
            filter = filter.replace("album:", "");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              if (filter.length == 0) {
                matchesFilter = source.album && source.album.length > 0;
              } else {
                matchesFilter = filter != source.album;
              }
            } else {
              if (filter.length == 0) {
                matchesFilter = !source.album || source.album.length == 0;
              } else {
                matchesFilter = filter == source.album;
              }
            }
          } else if (filter.startsWith("playlist:")) {
            filter = filter.replace("playlist:", "");
            const playlist = this.props.playlists.find((p) => p.name == filter);
            if (playlist) {
              matchesFilter = playlist.audios.includes(source.id);
            } else {
              matchesFilter = false;
            }
          } else if (filter.startsWith("comment:") || filter.startsWith("-comment:")) {
            filter = filter.replace("comment:", "");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              if (filter.length == 0) {
                matchesFilter = source.comment && source.comment.length > 0;
              } else {
                const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
                matchesFilter = !regex.test(source.comment);
              }
            } else {
              if (filter.length == 0) {
                matchesFilter = !source.comment || source.comment.length == 0;
              } else {
                const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
                matchesFilter = regex.test(source.comment);
              }
            }
          } else if ((countRegex = /^count([>=<])(\d*)$/.exec(filter)) != null) {
            const symbol = countRegex[1];
            const value = parseInt(countRegex[2]);
            const count = source.playedCount;
            switch (symbol) {
              case "=":
                matchesFilter = count == value;
                break;
              case ">":
                matchesFilter = count > value;
                break;
              case "<":
                matchesFilter = count < value;
                break;
            }
          } else if (((filter.startsWith('"') || filter.startsWith('-"')) && filter.endsWith('"')) ||
            ((filter.startsWith('\'') || filter.startsWith('-\'')) && filter.endsWith('\''))) {
            if (filter.startsWith("-")) {
              filter = filter.substring(2, filter.length - 1);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = !regex.test(source.url) && !regex.test(source.name) && !regex.test(source.artist) && !regex.test(source.album);
            } else {
              filter = filter.substring(1, filter.length - 1);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = regex.test(source.url) || regex.test(source.name) || regex.test(source.artist) || regex.test(source.album);
            }
          } else { // This is a search filter
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = !regex.test(source.url) && !regex.test(source.name) && !regex.test(source.artist) && !regex.test(source.album);
            } else {
              const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
              matchesFilter = regex.test(source.url) || regex.test(source.name) || regex.test(source.artist) || regex.test(source.album);
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

(AudioLibrary as any).displayName="AudioLibrary";
export default withStyles(styles)(AudioLibrary as any);