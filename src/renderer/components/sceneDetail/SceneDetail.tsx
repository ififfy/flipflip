import * as React from "react";
import clsx from "clsx";

import {
  AppBar, Box, Container, createStyles, CssBaseline, Drawer, Fab, IconButton, ListItem,
  ListItemIcon, ListItemText, Tab, Tabs, TextField, Theme, Toolbar, Typography, withStyles
} from "@material-ui/core";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import BuildIcon from '@material-ui/icons/Build';
import CollectionsIcon from '@material-ui/icons/Collections';
import DeleteIcon from '@material-ui/icons/Delete';
import PhotoFilterIcon from '@material-ui/icons/PhotoFilter';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import PublishIcon from '@material-ui/icons/Publish';
import SaveIcon from '@material-ui/icons/Save';

import {OF, WF} from "../../data/const";
import Config from "../../data/Config";
import Scene from "../../data/Scene";
import LibrarySource from "../library/LibrarySource";
import SceneEffectGroup from "./SceneEffectGroup";
import ImageVideoGroup from "./ImageVideoGroup";
import CrossFadeGroup from "./CrossFadeGroup";
import ZoomMoveGroup from "./ZoomMoveGroup";
import StrobeGroup from "./StrobeGroup";
import AudioGroup from "./AudioGroup";
import TextGroup from "./TextGroup";
import SourcePicker from "./SourcePicker";

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
  titleField: {
    width: '100%',
    margin: 0,
  },
  titleInput: {
    color: theme.palette.common.white,
    textAlign: 'center',
    fontSize: theme.typography.h4.fontSize,
  },
  noTitle: {
    width: theme.spacing(7),
    height: theme.spacing(7),
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
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    padding: theme.spacing(1),
  },
  tab: {
    width: drawerWidth,
    height: theme.spacing(12),
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
  optionsTab: {
    ariaControls: 'vertical-tabpanel-0',
  },
  effectsTab: {
    ariaControls: 'vertical-tabpanel-1',
  },
  sourcesTab: {
    ariaControls: 'vertical-tabpanel-2',
  },
  deleteItem: {
    color: theme.palette.error.main,
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
  fill: {
    flexGrow: 1,
  },
});

class SceneDetail extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    autoEdit: boolean,
    config: Config,
    scene: Scene,
    goBack(): void,
    onBlacklistFile(sourceURL: string, fileToBlacklist: string): void,
    onClip(source: LibrarySource): void,
    onDelete(scene: Scene): void,
    onExport(scene: Scene): void,
    onLibraryImport(scene: Scene): void,
    onPlay(scene: Scene): void,
    onSaveAsScene(scene: Scene): void,
    onSetupGrid(scene: Scene): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  readonly state = {
    isEditingName: this.props.autoEdit,
    drawerOpen: false,
    drawerHover: false,
    openTab: 2,
  };

  readonly nameInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;
    const open = this.state.drawerOpen;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Back"
              onClick={this.props.goBack.bind(this)}>
              <ArrowBackIcon />
            </IconButton>
            {this.state.isEditingName && (
              <form onSubmit={this.endEditingName.bind(this)} className={classes.titleField}>
                <TextField
                  autoFocus
                  id="title"
                  value={this.props.scene.name}
                  margin="normal"
                  ref={this.nameInputRef}
                  className={classes.titleField}
                  inputProps={{className: classes.titleInput}}
                  onBlur={this.endEditingName.bind(this)}
                  onChange={this.onChangeName.bind(this)}
                />
              </form>
            )}
            {!this.state.isEditingName && (
              <React.Fragment>
                <div className={classes.fill}/>
                <Typography component="h1" variant="h4" color="inherit" noWrap
                            className={clsx(classes.title, this.props.scene.name.length == 0 && classes.noTitle)} onClick={this.beginEditingName.bind(this)}>
                  {this.props.scene.name}
                </Typography>
                <div className={classes.fill}/>
              </React.Fragment>
            )}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Play"
              onClick={this.props.onPlay.bind(this)}>
              <PlayCircleOutlineIcon fontSize="large"/>
            </IconButton>
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
            <Tabs
              orientation="vertical"
              value={this.state.openTab}
              onChange={this.onChangeTab.bind(this)}
              aria-label="scene detail tabs"
              className={classes.tabs}>
              <Tab id="vertical-tab-0" icon={<BuildIcon/>} label={open ? "Options" : ""}
                   className={clsx(classes.tab, classes.optionsTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-1" icon={<PhotoFilterIcon/>} label={open ? "Effects" : ""}
                   className={clsx(classes.tab, classes.effectsTab, !open && classes.tabClose)}/>
              <Tab id="vertical-tab-2" icon={<CollectionsIcon/>} label={open ? `Sources (${this.props.scene.sources.length})` : ""}
                   className={clsx(classes.tab, classes.sourcesTab, !open && classes.tabClose)}/>
            </Tabs>
          </div>
          <div className={classes.fill}/>
          <div>
            {(this.props.scene.tagWeights || this.props.scene.sceneWeights) && (
              <ListItem button onClick={this.props.onSaveAsScene.bind(this, this.props.scene)}>
                <ListItemIcon>
                  <SaveIcon />
                </ListItemIcon>
                <ListItemText primary="Save as Scene" />
              </ListItem>
            )}
            <ListItem button onClick={this.props.onExport.bind(this, this.props.scene)}>
              <ListItemIcon>
                <PublishIcon />
              </ListItemIcon>
              <ListItemText primary="Export Scene" />
            </ListItem>
            <ListItem button onClick={this.props.onDelete.bind(this, this.props.scene)}
                      className={classes.deleteItem}>
              <ListItemIcon>
                <DeleteIcon color="error"/>
              </ListItemIcon>
              <ListItemText primary="Delete Scene" />
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
            <Typography
              component="div"
              role="tabpanel"
              hidden={this.state.openTab !== 0}
              id="vertical-tabpanel-0"
              aria-labelledby="vertical-tab-0">
              <Box p={3}>
                <SceneEffectGroup
                  scene={this.props.scene}
                  isTagging={false}
                  isConfig={false}
                  allScenes={this.props.allScenes}
                  onSetupGrid={this.props.onSetupGrid.bind(this)}
                  onUpdateScene={this.props.onUpdateScene.bind(this)} />

                <ImageVideoGroup
                  scene={this.props.scene}
                  isPlayer={false}
                  onUpdateScene={this.props.onUpdateScene.bind(this)}/>
              </Box>
            </Typography>
            <Typography
              component="div"
              role="tabpanel"
              hidden={this.state.openTab !== 1}
              id="vertical-tabpanel-1"
              aria-labelledby="vertical-tab-1">
              <Box p={3}>
                <CrossFadeGroup
                  scene={this.props.scene}
                  onUpdateScene={this.props.onUpdateScene.bind(this)} />

                <ZoomMoveGroup
                  scene={this.props.scene}
                  onUpdateScene={this.props.onUpdateScene.bind(this)} />

                <StrobeGroup
                  scene={this.props.scene}
                  onUpdateScene={this.props.onUpdateScene.bind(this)} />

                <AudioGroup
                  scene={this.props.scene}
                  isPlayer={false}
                  onUpdateScene={this.props.onUpdateScene.bind(this)}/>

                <TextGroup
                  scene={this.props.scene}
                  onUpdateScene={this.props.onUpdateScene.bind(this)}/>
              </Box>
            </Typography>
            <Typography
              component="div"
              role="tabpanel"
              hidden={this.state.openTab !== 2}
              id="vertical-tabpanel-2"
              aria-labelledby="vertical-tab-2">
              <Box p={1}>
                <SourcePicker
                  sources={this.props.scene.sources}
                  config={this.props.config}
                  yOffset={0}
                  filters={[]}
                  selected={[]}
                  emptyMessage="You haven't added any sources to this Scene yet."
                  isSelect={false}
                  isBatchTag={false}
                  onUpdateSources={this.onChangeSources.bind(this)}
                  onClip={this.props.onClip}
                  onBlacklistFile={this.props.onBlacklistFile}
                  onOpenLibraryImport={this.props.onLibraryImport.bind(this, this.props.scene)}
                  onChangeTextKind={this.changeKey.bind(this, 'textKind').bind(this)}
                  onChangeTextSource={this.changeKey.bind(this, 'textSource').bind(this)} />
              </Box>
            </Typography>
          </Container>
        </main>
      </div>
    )
  }

  onToggleDrawer() {
    this.setState({drawerOpen: !this.state.drawerOpen});
  }

  onChangeTab(e: any, newTab: number) {
    this.setState({openTab: newTab});
  }

  onMouseEnterDrawer() {
    this.setState({drawerHover: true});
  }

  onMouseLeaveDrawer() {
    this.setState({drawerHover: false});
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  beginEditingName() {
    this.setState({isEditingName: true});
  }

  endEditingName(e: Event) {
    e.preventDefault();
    this.setState({isEditingName: false});
  }

  onChangeName(e: React.FormEvent<HTMLInputElement>) {
    this.update((s) => { s.name = e.currentTarget.value; });
  }

  onChangeSources(sources: Array<LibrarySource>) {
    if (this.props.scene.orderFunction == OF.strict && (sources.length > 1 && this.props.scene.weightFunction == WF.sources)) {
      this.update((s) => {
        s.sources = sources;
        s.orderFunction = OF.ordered;
        return s;
      })
    } else {
      this.update((s) => {
        s.sources = sources;
      });
    }
  }
}

export default withStyles(styles)(SceneDetail as any);