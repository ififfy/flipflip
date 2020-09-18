import * as React from "react";
import {remote} from "electron";
import clsx from "clsx";
import * as mm from "music-metadata";
import {existsSync, readFileSync} from "fs";
import wretch from "wretch";

import {
  AppBar, Backdrop, Badge, Box, Button, Chip, CircularProgress, Collapse, Container, createStyles, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, Fab, IconButton, LinearProgress,
  ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Tab, Tabs, TextField, Theme, Toolbar,
  Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import AlbumIcon from '@material-ui/icons/Album';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import CancelIcon from '@material-ui/icons/Cancel';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from "@material-ui/icons/Delete";
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import EditIcon from '@material-ui/icons/Edit';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import GetAppIcon from '@material-ui/icons/GetApp';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MenuIcon from'@material-ui/icons/Menu';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import PersonIcon from '@material-ui/icons/Person';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import SortIcon from '@material-ui/icons/Sort';

import {red} from "@material-ui/core/colors";

import {generateThumbnailFile, isAudio, isImage} from "../../data/utils";
import {AF, ASF, LT, MO, PR} from "../../data/const";
import en from "../../data/en";
import Audio from "../../data/Audio";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import LibrarySearch from "./LibrarySearch";
import AudioSourceList from "./AudioSourceList";
import AudioArtistList from "./AudioArtistList";
import AudioAlbumList from "./AudioAlbumList";

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
    right: 80,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  selectNoneButton: {
    backgroundColor: theme.palette.secondary.light,
    margin: 0,
    top: 'auto',
    right: 130,
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
  trackThumb: {
    height: 140,
    width: 140,
    overflow: 'hidden',
    display: 'inline-flex',
    justifyContent: 'center',
    position: 'absolute',
  },
  pointer: {
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    maxWidth: 365,
    marginRight: theme.spacing(4),
  },
  inputShort: {
    width: 75,
  },
  inputFull: {
    width: '100%',
    maxWidth: 530,
  },
  thumbImage: {
    height: '100%',
  },
  deleteThumbButton: {
    backgroundColor: theme.palette.error.main,
    position: 'absolute',
    bottom: '3%',
    right: '6%',
  },
  deleteIcon: {
    color: theme.palette.error.contrastText,
  },
  audioIcon: {
    height: '100%',
    width: '100%',
  },
  actions: {
    marginRight: theme.spacing(3),
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
});

class AudioLibrary extends React.Component {
  readonly props: {
    classes: any,
    cachePath: string,
    filters: Array<string>,
    isBatchTag: boolean,
    isBatchEdit: boolean,
    isSelect: boolean,
    library: Array<Audio>,
    openTab: number,
    progressCurrent: number,
    progressMode: string,
    progressTitle: string,
    progressTotal: number,
    selected: Array<string>,
    tags: Array<Tag>,
    tutorial: string,
    yOffset: number,
    goBack(): void,
    onBatchTag(): void,
    onBatchEdit(): void,
    onChangeTab(newTab: number): void,
    onExportLibrary(): void,
    onImportFromLibrary(sources: Array<Audio>): void,
    onImportLibrary(): void,
    onManageTags(): void,
    onMarkOffline(): void,
    onPlay(source: Audio, displayed: Array<Audio>): void,
    onSort(scene: Scene, algorithm: string, ascending: boolean): void,
    onTutorial(tutorial: string): void,
    onUpdateLibrary(fn: (library: Array<Audio>) => void): void,
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
    importURL: null as string,
    loadingMetadata: false,
    error: false,
    commonAudio: null as Audio,
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;

    let cancelProgressMessage;
    switch (this.props.progressMode) {
      case PR.audioOffline:
        cancelProgressMessage = "Cancel Offline Check";
        break;
    }

    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift, this.props.tutorial == LT.toolbar && clsx(classes.backdropTop, classes.disable))}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip title={this.props.isSelect ? "Cancel Import" : "Back"} placement="right-end">
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
              Audio Library
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
                  noTypes
                  onUpdateFilters={this.onUpdateFilters.bind(this)}/>
              </div>
            </div>
          </Toolbar>
        </AppBar>

        <Drawer
          className={clsx(classes.drawer, (this.props.tutorial == LT.sidebar1 || this.props.tutorial == LT.sidebar2 || this.state.drawerOpen) && classes.backdropTop, this.props.tutorial == LT.sidebar2 && classes.highlight)}
          variant="permanent"
          classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose, (this.props.isSelect || this.props.isBatchTag || this.props.isBatchEdit) && classes.drawerPaperHidden)}}
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
                   icon={<AudiotrackIcon/>} label={open ? "Sogs" : ""}
                   className={clsx(classes.tab, classes.songsTab, !open && classes.tabClose)}/>
            </Tabs>
          </div>

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
            <Tooltip title={this.state.drawerOpen ? "" : "Batch Edit"}>
              <ListItem button onClick={this.onBatchEdit.bind(this)}>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary="Batch Edit" />
              </ListItem>
            </Tooltip>
          </div>

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
                {this.props.progressMode === PR.audioOffline && (
                  <LinearProgress variant="determinate" value={Math.round((this.props.progressCurrent / this.props.progressTotal) * 100)}/>
                )}
              </div>
            </React.Fragment>
          )}

          <div className={classes.fill}/>

          {/*<div className={clsx(this.props.tutorial != null && classes.disable)}>
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
          </div>*/}
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
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.openTab === 1 && (
              <Typography
                className={classes.tabSection}
                component="div"
                role="tabpanel"
                hidden={this.props.openTab !== 1}
                id="vertical-tabpanel-1"
                aria-labelledby="vertical-tab-1">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <AudioArtistList
                      sources={this.state.displaySources}
                      onClickArtist={this.onClickArtist.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.openTab === 2 && (
              <Typography
                className={classes.tabSection}
                component="div"
                role="tabpanel"
                hidden={this.props.openTab !== 2}
                id="vertical-tabpanel-2"
                aria-labelledby="vertical-tab-2">
                <div className={classes.tabPanel}>
                  <div className={classes.drawerSpacer}/>
                  <Box p={2} className={classes.fill}>
                    <AudioAlbumList
                      sources={this.state.displaySources}
                      onClickAlbum={this.onClickAlbum.bind(this)}
                      onClickArtist={this.onClickArtist.bind(this)}/>
                  </Box>
                </div>
              </Typography>
            )}

            {this.props.openTab === 3 && (
              <Typography
                className={classes.tabSection}
                component="div"
                role="tabpanel"
                hidden={this.props.openTab !== 3}
                id="vertical-tabpanel-3"
                aria-labelledby="vertical-tab-3">
                <div className={classes.tabPanel}>
                  {!this.props.isSelect && !this.props.isBatchTag && !this.props.isBatchEdit &&  (
                    <div className={classes.drawerSpacer}/>
                  )}
                  <Box className={classes.fill}>
                    <AudioSourceList
                      cachePath={this.props.cachePath}
                      isSelect={this.props.isSelect || this.props.isBatchTag || this.props.isBatchEdit}
                      selected={this.state.selected}
                      sources={this.state.displaySources}
                      yOffset={this.props.yOffset}
                      onClickAlbum={this.onClickAlbum.bind(this)}
                      onClickArtist={this.onClickArtist.bind(this)}
                      onPlay={this.props.onPlay.bind(this)}
                      onUpdateSelected={this.onUpdateSelected.bind(this)}
                      onUpdateLibrary={this.props.onUpdateLibrary.bind(this)}
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

        {(this.props.isSelect || this.props.isBatchTag || this.props.isBatchEdit) && (
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
            {this.props.isBatchTag && (
              <Tooltip title={"Batch Tag"}  placement="top-end">
                <Badge
                  className={classes.importBadge}
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
            {this.props.isBatchEdit && (
              <Tooltip title={"Batch Edit"}  placement="top-end">
                <Badge
                  className={classes.importBadge}
                  color="secondary"
                  badgeContent={this.state.selected.length}
                  max={999}>
                  <Fab
                    className={classes.addMenuButton}
                    disabled={this.state.selected.length == 0}
                    onClick={this.onToggleBatchEditModal.bind(this)}
                    size="large">
                    <EditIcon className={classes.icon} />
                  </Fab>
                </Badge>
              </Tooltip>
            )}
            {!this.props.isBatchTag && !this.props.isBatchEdit && (
              <Tooltip title={"Import"}  placement="top-end">
                <Badge
                  className={classes.importBadge}
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

        {!this.props.isSelect && !this.props.isBatchTag && !this.props.isBatchEdit && (
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
              {this.state.filters.length > 0 && (
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
            </Dialog>
            <Tooltip title={this.state.filters.length > 0 ? "" : "Local Audio"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addLocalButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                onClick={this.onAddSource.bind(this, AF.audios)}
                size="small">
                <AudiotrackIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title={this.state.filters.length > 0 ? "" : "URL"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addURLButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
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
                  {Object.values(ASF).map((sf) =>
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

        {this.state.openMenu == MO.urlImport && (
          <Dialog
            classes={{paper: clsx(classes.noScroll, classes.urlDialog)}}
            open={this.state.openMenu == MO.urlImport}
            onClose={this.onCloseDialog.bind(this)}
            aria-labelledby="add-url-title">
            <DialogTitle id="add-url-title">Add Audio URL</DialogTitle>
            <DialogContent className={classes.noScroll}>
              <DialogContentText id="batch-tag-description">
                Enter the URL of the audio file:
              </DialogContentText>
              <TextField
                label="Audio URL"
                fullWidth
                placeholder="Paste URL Here"
                margin="dense"
                value={this.state.importURL}
                onChange={this.onURLChange.bind(this)}/>
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

        {this.state.openMenu == MO.batchEdit && (
          <Dialog
            open={this.state.openMenu == MO.batchEdit}
            onClose={this.onCloseDialog.bind(this)}
            aria-describedby="edit-description">
            <DialogContent>
              <Typography variant="h6">Batch Edit song info</Typography>
              <TextField
                className={classes.input}
                value={this.state.commonAudio.name}
                margin="normal"
                label="Name"
                onChange={this.onEditBatch.bind(this, 'name')}/>
              <div className={clsx(classes.trackThumb, this.state.commonAudio.thumb == null && classes.pointer)} onClick={this.state.commonAudio.thumb == null ? this.loadThumb.bind(this) : this.nop}>
                {this.state.commonAudio.thumb != null && (
                  <React.Fragment>
                    <IconButton
                      onClick={this.onRemoveThumb.bind(this)}
                      className={classes.deleteThumbButton}
                      edge="end"
                      size="small"
                      aria-label="delete">
                      <DeleteIcon className={classes.deleteIcon} color="inherit"/>
                    </IconButton>
                    <img className={classes.thumbImage} src={this.state.commonAudio.thumb}/>
                  </React.Fragment>
                )}
                {this.state.commonAudio.thumb == null && (
                  <AudiotrackIcon className={classes.audioIcon} />
                )}
              </div>
              <TextField
                className={classes.input}
                value={this.state.commonAudio.artist}
                margin="normal"
                label="Artist"
                onChange={this.onEditBatch.bind(this, 'artist')}/>
              <TextField
                className={classes.input}
                value={this.state.commonAudio.album}
                margin="normal"
                label="Album"
                onChange={this.onEditBatch.bind(this, 'album')}/>
              <TextField
                className={classes.inputShort}
                value={this.state.commonAudio.trackNum}
                margin="normal"
                label="Track #"
                inputProps={{
                  min: 0,
                  type: 'number',
                }}
                onChange={this.onEditBatch.bind(this, 'trackNum')}/>
              <TextField
                className={classes.inputFull}
                value={this.state.commonAudio.comment}
                margin="normal"
                label="Comment"
                multiline
                onChange={this.onEditBatch.bind(this, 'comment')}/>
            </DialogContent>
            <DialogActions className={classes.actions}>
              <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
                Cancel
              </Button>
              <Button onClick={this.onFinishBatchEdit.bind(this)} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
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

  nop() {}

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

  // Use alt+M to toggle highlighting  sources
  onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'm' || e.key == 'µ')) {
      this.toggleMarked();
    }
  };

  onChangeTab(e: any, newTab: number) {
    this.props.onChangeTab(newTab);
  }

  onClickArtist(artist: string) {
    this.setState({openTab: 2, filters: ["artist:" + artist]})
  }

  onClickAlbum(album: string) {
    this.setState({openTab: 3, filters: ["album:" + album]})
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
    if (this.props.isBatchTag) {
      this.setState({selected: [], selectedTags: []});
      this.props.onBatchTag();
    } else if (this.props.isBatchEdit) {
      this.setState({selected: [], selectedTags: []});
      this.props.onBatchEdit();
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

  onAddSource(type: string) {
    this.onCloseDialog();
    switch (type) {
      case AF.url:
        this.setState({openMenu: MO.urlImport, importURL: ""});
        break;
      case AF.audios:
        let aResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
          {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'Audio files', extensions: ['mp3', 'm4a', 'wav', 'ogg']}], properties: ['openFile', 'multiSelections']});
        if (!aResult) return;
        aResult = aResult.filter((r) => isAudio(r, true));
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
      lastCheck: new Date(),
      tags: [],
    });
    id += 1;
    this.setState({loadingMetadata: true});
    wretch(url)
      .get()
      .notFound((err) => {
        console.error("File is not available:", err.message);
        this.setState({loadingMetadata: false, error: true});
        setTimeout(() => {this.setState({error: false})}, 3000);
      })
      .arrayBuffer((buffer) => {
        mm.parseBuffer(Buffer.from(buffer))
          .then((metadata: any) => {
            if (metadata) {
              if (metadata.common) {
                newAudio.name = metadata.common.title;
                newAudio.album = metadata.common.album;
                newAudio.artist = metadata.common.artist;
                if (metadata.common.picture && metadata.common.picture.length > 0) {
                  newAudio.thumb = generateThumbnailFile(this.props.cachePath, metadata.common.picture[0].data);
                }
              }
              if (metadata.format) {
                newAudio.duration = metadata.format.duration;
              }
            }
            if (!newAudio.name) {
              newAudio.name = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
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
        return;
      }

      const url = newSources[index];
      index++;

      if (existsSync(url)) {
        const newAudio = new Audio({
          url: url,
          id: id,
          lastCheck: new Date(),
          tags: [],
        });
        id += 1;
        mm.parseFile(url)
          .then((metadata: any) => {
            if (metadata) {
              if (metadata.common) {
                newAudio.name = metadata.common.title;
                newAudio.album = metadata.common.album;
                newAudio.artist = metadata.common.artist;
                if (metadata.common.picture && metadata.common.picture.length > 0) {
                  newAudio.thumb = generateThumbnailFile(this.props.cachePath, metadata.common.picture[0].data);
                }
              }
              if (metadata.format) {
                newAudio.duration = metadata.format.duration;
              }
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

  onToggleBatchEditModal() {
    if (this.state.openMenu == MO.batchEdit) {
      this.setState({openMenu: null, selectedTags: []});
    } else {
      this.setState({openMenu: MO.batchEdit, commonAudio: this.getCommonAudio()});
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
    this.setState({menuAnchorEl: null, openMenu: null, drawerOpen: false, importURL: null, commonAudio: null});
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

  onEditBatch(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const newAudio = new Audio(this.state.commonAudio);
    (newAudio as any)[key] = input.value;
    this.setState({commonAudio: newAudio});
  }

  onRemoveThumb(e: MouseEvent) {
    e.preventDefault();
    const newAudio = new Audio(this.state.commonAudio);
    newAudio.thumb = null;
    this.setState({commonAudio: newAudio});
  }

  loadThumb() {
    let iResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
      {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'Image files', extensions: ["gif", "png", "jpeg", "jpg", "webp", "tiff", "svg"]}], properties: ['openFile']});
    if (!iResult) return;
    iResult = iResult.filter((i) => isImage(i, true));
    if (iResult.length > 0) {
      const newAudio = this.state.commonAudio;
      newAudio.thumb = generateThumbnailFile(this.props.cachePath, readFileSync(iResult[0]));
      this.setState({commonAudio: newAudio});
    }
  }

  onFinishBatchEdit() {
    const keys = ["thumb", "name", "artist", "album", "comment"];
    let common: any = this.state.commonAudio;
    this.props.onUpdateLibrary((l) => {
      for (let sourceURL of this.state.selected) {
        const source: any = l.find((s) => s.url === sourceURL);
        for (let key of keys) {
          if (!common[key] != null) {
            source[key] = common[key];
          }
        }
      }
    })
    this.onCloseDialog();
  }

  batchTagOverwrite() {
    for (let sourceURL of this.state.selected) {
      const source = this.props.library.find((s) => s.url === sourceURL);
      source.tags = new Array<Tag>();
      for (let tag of this.state.selectedTags) {
        source.tags.push(new Tag({name: tag, id: this.props.tags.find((t) => t.name == tag).id}));
      }
    }
    this.onCloseDialog();
  }

  batchTagAdd() {
    for (let sourceURL of this.state.selected) {
      const source = this.props.library.find((s) => s.url === sourceURL);
      const sourceTags = source.tags.map((t) => t.name);
      for (let tag of this.state.selectedTags) {
        if (!sourceTags.includes(tag)) {
          source.tags.push(new Tag({name: tag, id: this.props.tags.find((t) => t.name == tag).id}));
        }
      }
    }
    this.onCloseDialog();
  }

  batchTagRemove() {
    for (let sourceURL of this.state.selected) {
      const source = this.props.library.find((s) => s.url === sourceURL);
      const sourceTags = source.tags.map((t) => t.name);
      for (let tag of this.state.selectedTags) {
        if (sourceTags.includes(tag)) {
          const indexOf = sourceTags.indexOf(tag);
          source.tags.splice(indexOf, 1);
          sourceTags.splice(indexOf, 1);
        }
      }
    }
    this.onCloseDialog();
  }

  getCommonAudio() {
    const keys = ["thumb", "name", "artist", "album", "comment"];
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
      for (let source of this.props.library) {
        let matchesFilter = true;
        for (let filter of this.state.filters) {
          if (filter == "<Offline>") { // This is offline filter
            matchesFilter = source.offline;
          } else if (filter == "<Marked>") { // This is a marked filter
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
          } else if (filter.startsWith("artist:")) {
            filter = filter.replace("artist:","");
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter, "i");
              matchesFilter = !regex.test(source.artist);
            } else {
              const regex = new RegExp(filter, "i");
              matchesFilter = regex.test(source.artist);
            }
          } else if (filter.startsWith("album:")) {
            filter = filter.replace("album:","");
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter, "i");
              matchesFilter = !regex.test(source.album);
            } else {
              const regex = new RegExp(filter, "i");
              matchesFilter = regex.test(source.album);
            }
          } else { // This is a search filter
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter, "i");
              matchesFilter = !regex.test(source.url) && !regex.test(source.name) && !regex.test(source.artist) && !regex.test(source.album);
            } else {
              const regex = new RegExp(filter, "i");
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

export default withStyles(styles)(AudioLibrary as any);