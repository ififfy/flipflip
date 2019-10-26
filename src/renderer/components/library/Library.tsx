import * as React from "react";
import clsx from "clsx";
import Select, { components } from 'react-select';

import {
  AppBar, Backdrop, Badge, Button, Checkbox, Chip, Collapse, Container, createStyles, Dialog, DialogActions,
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
import MovieIcon from '@material-ui/icons/Movie';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import PublishIcon from '@material-ui/icons/Publish';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import SortIcon from '@material-ui/icons/Sort';

import {AF, MO, PR, SF, ST} from "../../data/const";
import en from "../../data/en";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import LibrarySearch from "./LibrarySearch";
import SourceIcon from "./SourceIcon";
import SourceList from "./SourceList";
import URLDialog from "../sceneDetail/URLDialog";

const Option = (props: any) => (
  <div>
    <components.Option {...props}>
      <Checkbox color="default" checked={props.isSelected} onChange={() => null} />{" "}
      <label>{props.label}</label>
    </components.Option>
  </div>
);
const MultiValue = (props: any) => (
  <components.MultiValue {...props}>
    <span>{props.data.label}</span>
  </components.MultiValue>
);

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
    backgroundColor: (theme.palette.primary as any)["50"],
  },
  container: {
    display: 'flex',
    padding: theme.spacing(0),
    overflow: 'hidden',
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
  backdropTop: {
    zIndex: theme.zIndex.modal + 1,
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
});

class Library extends React.Component {
  readonly props: {
    classes: any,
    config: Config,
    filters: Array<string>,
    isBatchTag: boolean,
    isSelect: boolean,
    library: Array<LibrarySource>,
    progressCurrent: number,
    progressMode: string,
    progressTitle: string,
    progressTotal: number,
    selected: Array<string>,
    tags: Array<Tag>,
    yOffset: number,
    goBack(): void,
    onAddSource(scene: Scene, type: string, ...args: any[]): void,
    onBatchTag(): void,
    onClearBlacklist(sourceURL: string): void,
    onClip(source: LibrarySource): void,
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
    onUpdateLibrary(sources: Array<LibrarySource>): void,
    onUpdateMode(mode: string): void,
    savePosition(yOffset: number, filters:Array<string>, selected: Array<string>): void,
    systemMessage(message: string): void,
  };

  readonly state = {
    displaySources: Array<LibrarySource>(),
    drawerOpen: false,
    filters: this.props.filters,
    selected: this.props.selected,
    selectedTags: Array<{label: string, value: string}>(),
    menuAnchorEl: null as any,
    openMenu: null as string,
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
        cancelProgressMessage = "Cancel Offline Check";
      case PR.tumblr:
      case PR.reddit:
      case PR.twitter:
      case PR.instagram:
        cancelProgressMessage = "Cancel Import";
    }

    return (
      <div className={classes.root} onKeyDown={this.secretHotkey.bind(this)} tabIndex={0}>
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar>
            <div className={classes.titleBar}>
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
                <LibrarySearch
                  displaySources={this.state.displaySources}
                  filters={this.state.filters}
                  onUpdateFilters={this.onUpdateFilters.bind(this)}/>
              </div>
            </div>
          </Toolbar>
        </AppBar>

        <Drawer
          className={clsx(classes.drawer, this.state.drawerOpen && classes.backdropTop)}
          variant="permanent"
          classes={{paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose, (this.props.isSelect || this.props.isBatchTag) && classes.drawerPaperHidden)}}
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
            <ListItem button onClick={this.onBatchTag.bind(this)}>
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
                <NotInterestedIcon />
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
                  <ListItemText primary={cancelProgressMessage} />
                </ListItem>
                {(this.props.progressMode === PR.offline || this.props.progressMode === PR.tumblr) && (
                  <LinearProgress variant="determinate" value={Math.round((this.props.progressCurrent / this.props.progressTotal) * 100)}/>
                )}
                {this.props.progressMode !== PR.offline && this.props.progressMode !== PR.tumblr && (
                  <LinearProgress variant={this.props.progressMode === PR.cancel ? "query" : "indeterminate"}/>
                )}
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
            {!this.props.isSelect && !this.props.isBatchTag &&  (
              <div className={classes.drawerSpacer}/>
            )}
            <Container maxWidth={false} className={classes.container}>
              <SourceList
                config={this.props.config}
                isSelect={this.props.isSelect || this.props.isBatchTag}
                library={this.props.library}
                selected={this.state.selected}
                sources={this.state.displaySources}
                yOffset={this.props.yOffset}
                onClearBlacklist={this.props.onClearBlacklist.bind(this)}
                onClip={this.props.onClip.bind(this)}
                onPlay={this.props.onPlay.bind(this)}
                onUpdateSelected={this.onUpdateSelected.bind(this)}
                onUpdateSources={this.props.onUpdateLibrary.bind(this)}
                savePosition={this.savePosition.bind(this)}
                systemMessage={this.props.systemMessage.bind(this)}/>
            </Container>
          </div>
        </main>

        <Backdrop
          className={classes.backdrop}
          onClick={this.onCloseDialog.bind(this)}
          open={this.state.openMenu == MO.new || this.state.drawerOpen} />

        {(this.props.isSelect || this.props.isBatchTag) && (
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
            <Tooltip title={this.props.isBatchTag ? "Batch Tag" : "Import"}  placement="top-end">
              <Badge
                className={classes.importBadge}
                color="secondary"
                badgeContent={this.state.selected.length}
                max={999}>
                <Fab
                  className={classes.addMenuButton}
                  disabled={this.state.selected.length == 0}
                  onClick={this.props.isBatchTag ? this.onToggleBatchTagModal.bind(this) : this.onImportFromLibrary.bind(this)}
                  size="large">
                  {this.props.isSelect && (
                    <GetAppIcon className={classes.icon} />
                  )}
                  {this.props.isBatchTag && (
                    <LocalOfferIcon className={classes.icon} />
                  )}
                </Fab>
              </Badge>
            </Tooltip>
          </React.Fragment>
        )}

        {!this.props.isSelect && !this.props.isBatchTag && (
          <React.Fragment>
            {this.props.library.length > 0 && this.state.filters.length == 0 && (
              <Tooltip title="Remove All Sources"  placement="left">
                <Fab
                  className={clsx(classes.addButton, classes.removeAllButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                  disabled={this.props.library.length == 0 || this.state.filters.length > 0}
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
                className={clsx(classes.addButton, classes.addVideoButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.videos)}
                size="small">
                <MovieIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="Local Directory"  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addDirectoryButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.directory)}
                size="small">
                <FolderIcon className={classes.icon} />
              </Fab>
            </Tooltip>
            <Tooltip title="URL"  placement="left">
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
          </React.Fragment>
        )}

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
            <Select
              defaultValue={this.state.selectedTags}
              options={this.props.tags.map((tag) => {return {label: tag.name, value: tag.id}})}
              components={{ Option, MultiValue }}
              isClearable
              isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              placeholder="Tag These Sources"
              onChange={this.onSelectTags.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button disabled={this.state.selectedTags.length == 0}
                    onClick={this.batchTagRemove.bind(this)} color="secondary">
              - Remove
            </Button>
            <Button disabled={this.state.selectedTags.length == 0}
                    onClick={this.batchTagAdd.bind(this)} color="secondary">
              + Add
            </Button>
            <Button onClick={this.batchTagOverwrite.bind(this)} color="primary">
              Overwrite
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  componentDidMount() {
    this.setState({displaySources: this.getDisplaySources()});
  }

  componentDidUpdate(props: any, state: any) {
    if (state.filters != this.state.filters || props.library != this.props.library) {
      this.setState({displaySources: this.getDisplaySources()});
    }
  }

  // Use alt+P to access import modal
  // Use alt+U to toggle highlighting untagged sources
  secretHotkey(e: KeyboardEvent) {
    if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'p' || e.key == 'π')) {
      this.setState({openMenu: this.state.openMenu == MO.urlImport ? null : MO.urlImport});
    } else if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'm' || e.key == 'µ')) {
      this.toggleMarked();
    }
  }

  onBatchTag() {
    this.onCloseDialog();
    this.props.onBatchTag();
  }

  goBack() {
    if (this.props.isBatchTag) {
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
    this.props.onAddSource(null, addFunction, ...args);
  }

  onToggleBatchTagModal() {
    if (this.state.openMenu == MO.batchTag) {
      this.setState({openMenu: null, selectedTags: []});
    } else {
      this.setState({openMenu: MO.batchTag, selectedTags: this.getSelectedTags()});
    }
  }

  onSelectTags(selectedTags: [{label: string, value: string}]) {
    this.setState({selectedTags: selectedTags});
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
    const scrollElement = sortableList.firstElementChild;
    const scrollTop = scrollElement ? scrollElement.scrollTop : 0;
    this.props.savePosition(scrollTop, this.state.filters, this.state.selected);
  }

  toggleMarked() {
    let taggingMode = this.props.library.find((s) => s.marked) == null;

    if (taggingMode) { // We're marking sources
      for (let source of this.state.displaySources) {
        source.marked = true;
      }
    } else { // We're unmarking sources
      for (let source of this.props.library) {
        source.marked = false;
      }
    }
    this.props.onUpdateLibrary(this.props.library);
  }

  batchTagOverwrite() {
    for (let sourceURL of this.state.selected) {
      const source = this.props.library.find((s) => s.url === sourceURL);
      source.tags = new Array<Tag>();
      for (let tag of this.state.selectedTags) {
        source.tags.push(new Tag({name: tag.label, id: parseInt(tag.value)}));
      }
    }
    this.onCloseDialog();
  }

  batchTagAdd() {
    for (let sourceURL of this.state.selected) {
      const source = this.props.library.find((s) => s.url === sourceURL);
      const sourceTags = source.tags.map((t) => t.name);
      for (let tag of this.state.selectedTags) {
        if (!sourceTags.includes(tag.label)) {
          source.tags.push(new Tag({name: tag.label, id: parseInt(tag.value)}));
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
        if (sourceTags.includes(tag.label)) {
          const indexOf = sourceTags.indexOf(tag.label);
          source.tags.splice(indexOf, 1);
          sourceTags.splice(indexOf, 1);
        }
      }
    }
    this.onCloseDialog();
  }

  getSelectedTags() {
    let tagSelectValue = new Array<{label: string, value: string}>();
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
      tagSelectValue = commonTags.map((t) => {return {label: t.name, value: t.id.toString()}});
    }

    return tagSelectValue;
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
            const value = parseInt(countRegex[3]);
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