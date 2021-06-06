import * as React from "react";
import clsx from "clsx";
import * as fs from "fs";
import {remote} from "electron";

import {
  AppBar, Backdrop, Badge, Button, Chip, Collapse, Container, createStyles, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Divider, Drawer, Fab, IconButton, ListItem, ListItemIcon, ListItemSecondaryAction,
  ListItemText, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import DescriptionIcon from '@material-ui/icons/Description';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import GetAppIcon from '@material-ui/icons/GetApp';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MenuIcon from'@material-ui/icons/Menu';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import ShuffleIcon from "@material-ui/icons/Shuffle";
import SortIcon from '@material-ui/icons/Sort';

import {AF, MO, SF, SP, SLT} from "../../data/const";
import {getFilesRecursively, isText} from "../../data/utils";
import en from "../../data/en";
import Tag from "../../data/Tag";
import LibrarySearch from "./LibrarySearch";
import CaptionScript from "../../data/CaptionScript";
import ScriptSourceList from "./ScriptSourceList";
import Scene from "../../data/Scene";

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
  }
});

class ScriptLibrary extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    filters: Array<string>,
    library: Array<CaptionScript>,
    selected: Array<string>,
    specialMode: string,
    tags: Array<Tag>,
    tutorial: string,
    yOffset: number,
    goBack(): void,
    onBatchTag(): void,
    onEditScript(source: CaptionScript): void,
    onImportFromLibrary(sources: Array<CaptionScript>): void,
    onImportToScriptor(source: CaptionScript): void,
    onManageTags(): void,
    onPlay(source: CaptionScript, sceneID: string, displayed: Array<CaptionScript>): void,
    onSort(algorithm: string, ascending: boolean): void,
    onTutorial(tutorial: string): void,
    onUpdateLibrary(fn: (library: Array<CaptionScript>) => void): void,
    onUpdateMode(mode: string): void,
    savePosition(yOffset: number, filters:Array<string>, selected: Array<string>): void,
    systemMessage(message: string): void,
  };

  readonly state = {
    displaySources: Array<CaptionScript>(),
    drawerOpen: false,
    filters: this.props.filters,
    selected: this.props.selected,
    selectedTags: Array<string>(),
    menuAnchorEl: null as any,
    openMenu: null as string,
  };

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;

    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift, this.props.tutorial == SLT.toolbar && clsx(classes.backdropTop, classes.disable))}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip title={this.props.specialMode == SP.select || this.props.specialMode == SP.selectSingle ?
                "Cancel Import" : "Back"} placement="right-end">
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
              Caption Script Library
            </Typography>

            <div className={classes.headerRight}>
              <div className={clsx(classes.searchBar, this.props.tutorial == SLT.toolbar && classes.highlight)}>
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
          className={clsx(classes.drawer, (this.props.tutorial == SLT.sidebar1 || this.props.tutorial == SLT.sidebar2 || this.state.drawerOpen) && classes.backdropTop, this.props.tutorial == SLT.sidebar2 && classes.highlight)}
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
              className={clsx(this.props.tutorial == SLT.sidebar1 && classes.highlight)}
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
          </div>
        </Drawer>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <div className={clsx(classes.root, classes.fill)}>
            {!this.props.specialMode &&  (
              <div className={classes.drawerSpacer}/>
            )}
            <Container maxWidth={false} className={clsx(classes.container, this.state.displaySources.length > 0 && classes.containerNotEmpty)}>
              <ScriptSourceList
                specialMode={this.props.specialMode}
                library={this.props.library}
                scenes={this.props.allScenes}
                selected={this.state.selected}
                showHelp={!this.props.specialMode && this.state.filters.length == 0}
                sources={this.state.displaySources}
                yOffset={this.props.yOffset}
                onEditScript={this.props.onEditScript}
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
                  onClick={this.props.specialMode == SP.batchTag ? this.onToggleBatchTagModal.bind(this) :
                    this.props.specialMode == SP.select ? this.onImportFromLibrary.bind(this) : this.onImportSingleFromLibrary.bind(this)}
                  size="large">
                  {(this.props.specialMode == SP.select || this.props.specialMode == SP.selectSingle) && (
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
                  <DialogTitle id="remove-all-title">Delete Caption Script Library</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="remove-all-description">
                      Are you sure you really wanna delete your entire caption script library...? ಠ_ಠ
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
                      Are you sure you want to remove these sources from your caption script library?
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
            <Tooltip title={this.state.filters.length > 0 ? "" : "Local Script"}  placement="left">
              <Fab
                className={clsx(classes.addButton, classes.addLocalButton, this.state.openMenu != MO.new && classes.addButtonClose, this.state.openMenu == MO.new && classes.backdropTop, this.state.filters.length > 0 && classes.hidden)}
                disabled={this.state.filters.length > 0}
                onClick={this.onAddSource.bind(this, AF.script)}
                size="small">
                <DescriptionIcon className={classes.icon} />
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
          {[SF.alpha, SF.alphaFull, SF.date].map((sf) =>
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
    if (this.props.tutorial == SLT.final && this.state.drawerOpen) {
      this.setState({drawerOpen: false});
    }
  }

  componentWillUnmount() {
    this.savePosition();
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey && !e.ctrlKey && e.altKey && (e.key == 'm' || e.key == 'µ')) {
      this.toggleMarked();
    } else if (e.key == 'Escape' && this.props.specialMode != null) {
      this.goBack();
    }
  };

  onBatchTag() {
    this.onCloseDialog();
    this.props.onBatchTag();
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

  onAddSource(type: string, e: MouseEvent) {
    this.onCloseDialog();
    switch (type) {
      case AF.url:
        const originalSources = Array.from(this.props.library);
        let id = originalSources.length + 1;
        originalSources.forEach((s) => {
          id = Math.max(s.id + 1, id);
        });
        originalSources.unshift(new CaptionScript({
          url: "",
          id: id,
          tags: [],
        }));
        this.props.onUpdateLibrary((l) => {
          l.splice(0, l.length);
          l.push(...originalSources);
        });
        break;
      case AF.script:
        let aResult = new Array<string>();
        if (e.shiftKey) {
          let adResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
            {filters: [{name:'All Files (*.*)', extensions: ['*']}], properties: ['openDirectory', 'multiSelections']});
          if (!adResult) return;
          for (let path of adResult) {
            if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
              aResult = adResult.concat(getFilesRecursively(path));
            } else {
              aResult.push(path);
            }
          }
        } else {
          aResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
            {filters: [{name: 'All Files (*.*)', extensions: ['*']}, {name: 'Text files', extensions: ['txt']}], properties: ['openFile', 'multiSelections']});
          if (!aResult) return;
        }
        aResult = aResult.filter((r) => isText(r, true));
        this.setState({loadingSources: true});
        this.addScriptSources(aResult);
        break;
    }
  }

  addScriptSources(newSources: Array<string>) {
    const originalSources = Array.from(this.props.library);
    // dedup
    let sourceURLs = originalSources.map((s) => s.url);
    newSources = newSources.filter((s) => !sourceURLs.includes(s));

    let id = originalSources.length + 1;
    originalSources.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    for (let url of newSources) {
      if (fs.existsSync(url)) {
        const newText = new CaptionScript({
          url: url,
          id: id,
          tags: [],
        });
        id += 1;
        originalSources.unshift(newText);
      }
    }

    this.props.onUpdateLibrary((l) => {
      l.splice(0, l.length);
      l.push(...originalSources);
    });
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
    if (this.props.tutorial == SLT.sidebar1) {
      this.props.onTutorial(SLT.sidebar1);
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
    const sources = new Array<CaptionScript>();
    for (let url of selected) {
      const source = this.props.library.find((s) => s.url == url);
      if (source) {
        sources.push(source);
      }
    }
    this.props.onImportFromLibrary(sources);
  }

  onImportSingleFromLibrary() {
    for (let url of this.state.selected) {
      const source = this.props.library.find((s) => s.url == url);
      if (source) {
        this.props.onImportToScriptor(source);
        break;
      }
    }

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
      for (let source of this.props.library) {
        let matchesFilter = true;
        let countRegex;
        for (let filter of this.state.filters) {
          if (filter == "<Marked>") { // This is a marked filter
            matchesFilter = source.marked;
          }else if (filter == "<Untagged>") { // This is untagged filter
            matchesFilter = source.tags.length === 0;
          } else if ((filter.startsWith("[") || filter.startsWith("-[")) && filter.endsWith("]")) { // This is a tag filter
            if (filter.startsWith("-")) {
              let tag = filter.substring(2, filter.length-1);
              matchesFilter = source.tags.find((t) => t.name == tag) == null;
            } else {
              let tag = filter.substring(1, filter.length-1);
              matchesFilter = source.tags.find((t) => t.name == tag) != null;
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

(ScriptLibrary as any).displayName="ScriptLibrary";
export default withStyles(styles)(ScriptLibrary as any);