import * as React from "react";
import clsx from "clsx";
import {green, red} from "@mui/material/colors";

import {
  AppBar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Collapse,
  Container,
  Drawer,
  Fab,
  Grid,
  IconButton,
  Slider,
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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SaveIcon from '@mui/icons-material/Save';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

import {getTimestamp, getTimestampValue} from "../../data/utils";
import {BT, VCT} from "../../data/const";
import LibrarySource from "../../data/LibrarySource";
import Tag from "../../data/Tag";
import Clip from "../../data/Clip";
import Scene from "../../data/Scene";
import ImageView from "../player/ImageView";
import VideoControl from "../player/VideoControl";

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  videoContent: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.common.black,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing(0),
    position: 'relative',
  },
  progress: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  appBar: {
    height: theme.spacing(8),
  },
  drawerSpacer: {
    height: theme.spacing(21),
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
    flexBasis: '3%',
  },
  clipDrawerPaper: {
    backgroundColor: theme.palette.background.default,
    height: theme.spacing(21),
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  },
  clipTagDrawerPaper: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  },
  tagList: {
    padding: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  tagContent: {
    padding: theme.spacing(1),
  },
  selectedTag: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  tagButtons: {
    display: 'flex',
    flexDirection: 'column',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%',
  },
  emptyMessage2: {
    textAlign: 'center',
  },
  timeSlider: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  clipField: {
    maxWidth: theme.spacing(8),
  },
  fab: {
    boxShadow: 'none',
  },
  addFab: {
    marginLeft: theme.spacing(1),
  },
  removeFab: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  fill: {
    flexGrow: 1,
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
  enabledClip: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  disabledClip: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  valueLabel: {
    backgroundColor: 'transparent',
    top: 2
  },
  noTransition: {
    transition: 'unset',
  }
});

class VideoClipper extends React.Component {
  readonly props: {
    classes: any,
    allTags: Array<Tag>,
    isLibrary: boolean,
    source: LibrarySource,
    tutorial: string,
    videoVolume: number,
    cache(video: HTMLVideoElement): void,
    goBack(): void,
    navigateClipping(offset: number): void,
    onTutorial(tutorial: string): void,
    onStartVCTutorial(): void,
    onSetDisabledClips(disabledClips: Array<number>): void,
    onUpdateClips(url: string, clips: Array<Clip>): void,
  };

  readonly state = {
    scene: new Scene(),
    video: null as HTMLVideoElement,
    empty: false,
    isEditing: null as Clip,
    isEditingValue: [0,0],
    isEditingStartText: "",
    isEditingEndText: "",
    isTagging: false,
  };

  render() {
    const classes = this.props.classes;
    let tagNames: Array<string> = [];
    if (!!this.state.isEditing && this.state.isEditing.tags) {
      tagNames = this.state.isEditing.tags.map((t) => t.name);
    }

    return (
      <div className={clsx(classes.root, "VideoClipper")}>
        <AppBar enableColorOnDark className={classes.appBar}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip disableInteractive title="Back" placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  onClick={this.props.goBack.bind(this)}
                  size="large">
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </div>

            <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.title}>
              {this.props.source.url}
            </Typography>

            <div className={classes.headerLeft}/>
          </Toolbar>
        </AppBar>

        {!this.state.video && !this.state.empty && (
          <main className={classes.content}>
            <div className={classes.appBar}/>
            <Container maxWidth={false} className={clsx(classes.container, classes.progress)}>
              <CircularProgress size={200} />
            </Container>
          </main>
        )}

        {!this.state.video && this.state.empty && (
          <main className={classes.content}>
            <div className={classes.appBar}/>
            <Container maxWidth={false} className={classes.container}>
              <Typography component="h1" variant="h3" color="inherit" noWrap className={classes.emptyMessage}>
                (ಥ﹏ಥ)
              </Typography>
              <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.emptyMessage2}>
                I couldn't find anything
              </Typography>
            </Container>
          </main>
        )}

        {this.state.video && (
          <React.Fragment>
            <main className={classes.videoContent}>
              <div className={classes.appBar}/>
              <Container maxWidth={false} className={classes.container}>
                {this.state.isTagging && (
                  <ImageView
                    image={this.state.video}
                    scene={this.state.scene}
                    fitParent
                    hasStarted/>
                )}
                {!this.state.isTagging && (
                  <ImageView
                    image={this.state.video}
                    scene={this.state.scene}
                    fitParent
                    hasStarted/>
                )}
              </Container>
              {!this.state.isTagging && (
                <div className={classes.drawerSpacer}/>
              )}
              {this.state.isTagging && (
                <Grid container alignItems="center" className={classes.clipTagDrawerPaper}>
                  <Grid item xs>
                    <div className={classes.tagList}>
                      {this.props.allTags.map((tag) =>
                        <Card className={clsx(classes.tag, tagNames && tagNames.includes(tag.name) && classes.selectedTag)} key={tag.id}>
                          <CardActionArea onClick={this.toggleTag.bind(this, tag)}>
                            <CardContent className={classes.tagContent}>
                              <Typography component="h6" variant="body2">
                                {tag.name}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      )}
                    </div>
                  </Grid>
                  <Grid item className={classes.tagButtons}>
                    <Tooltip disableInteractive title="Inherit Source Tags">
                      <Fab
                        color="primary"
                        size="small"
                        onClick={this.onInherit.bind(this)}>
                        <SystemUpdateAltIcon/>
                      </Fab>
                    </Tooltip>
                    <Tooltip disableInteractive title="End Tagging" placement="top">
                      <IconButton onClick={this.onTag.bind(this)} size="large">
                        <KeyboardReturnIcon/>
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12} className={clsx(this.props.tutorial == VCT.controls && classes.highlight)}>
                    <VideoControl
                      video={this.state.video}
                      volume={this.state.scene.videoVolume}
                      clip={!this.state.isEditing ? null : this.state.isEditing}
                      clipValue={!this.state.isEditing ? null : this.state.isEditingValue}
                      useHotkeys
                      onChangeVolume={this.onChangeVolume.bind(this)}/>
                  </Grid>
                </Grid>
              )}
            </main>

            {!this.state.isTagging &&  (
              <Drawer
                variant="permanent"
                anchor="bottom"
                className={clsx((this.props.tutorial == VCT.controls || this.props.tutorial == VCT.clips || this.props.tutorial == VCT.clip) && classes.backdropTop)}
                classes={{paper: classes.clipDrawerPaper}}
                open>
                <Grid container alignItems="center">
                  <Grid item xs={12}>
                    <Collapse in={!this.state.isEditing}>
                      <Grid container spacing={1} alignItems="center" className={clsx(this.props.tutorial == VCT.controls && classes.disable, this.props.tutorial == VCT.clips && classes.highlight)}>
                        <Grid key={-1} item>
                          <Tooltip disableInteractive title="New Clip" placement="top">
                            <Fab
                              color="primary"
                              size="small"
                              className={clsx(classes.fab, classes.addFab, this.props.tutorial == VCT.clips && classes.highlight)}
                              onClick={this.onAdd.bind(this)}>
                              <AddIcon/>
                            </Fab>
                          </Tooltip>
                        </Grid>
                        {this.props.source.clips.map((c, index) =>
                          <Grid key={c.id} item>
                            <Button
                              variant="contained"
                              color="secondary"
                              size="large"
                              className={clsx(this.props.tutorial == VCT.clips && classes.disable)}
                              onClick={this.onEdit.bind(this, c)}>
                              {index + 1}
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Collapse>
                    <Collapse in={!!this.state.isEditing}>
                      <Grid container spacing={1} alignItems="center" className={clsx(this.props.tutorial == VCT.clip && classes.highlight)}>
                        {!this.props.isLibrary && this.state.isEditing && this.props.source.clips.find((c) => c.id == this.state.isEditing.id) && (
                          <Grid item>
                            <Tooltip disableInteractive title={this.props.source.disabledClips && this.props.source.disabledClips.includes(this.state.isEditing.id) ? "Disabled" : "Enabled"} placement="top">
                              <Fab
                                size="small"
                                className={clsx(classes.fab,
                                  !this.props.source.disabledClips || !this.props.source.disabledClips.includes(this.state.isEditing.id) && classes.enabledClip,
                                  this.props.source.disabledClips && this.props.source.disabledClips.includes(this.state.isEditing.id) && classes.disabledClip)}
                                onClick={this.onToggleClip.bind(this)}>
                                {this.props.source.disabledClips && this.props.source.disabledClips.includes(this.state.isEditing.id) ? <CloseIcon/> : <CheckIcon/>}
                              </Fab>
                            </Tooltip>
                          </Grid>
                        )}
                        <Grid item xs className={classes.timeSlider}>
                          <Slider
                            min={0}
                            max={this.state.video.duration}
                            value={this.state.isEditingValue}
                            classes={{
                              valueLabel: classes.valueLabel,
                              thumb: classes.noTransition,
                              track: classes.noTransition,
                            }}
                            valueLabelDisplay="on"
                            valueLabelFormat={(value) => getTimestamp(value)}
                            marks={[{value: 0, label: getTimestamp(0)}, {value: this.state.video.duration, label: getTimestamp(this.state.video.duration)}]}
                            onChange={this.onChangePosition.bind(this)}/>
                        </Grid>
                        <Grid item>
                          <TextField
                            variant="standard"
                            id="start"
                            className={classes.clipField}
                            label="Start"
                            value={this.state.isEditingStartText}
                            onDoubleClick={this.onClickStartText.bind(this)}
                            onChange={this.onChangeStartText.bind(this)} />
                        </Grid>
                        <Grid item>
                          <TextField
                            variant="standard"
                            id="end"
                            className={classes.clipField}
                            label="End"
                            value={this.state.isEditingEndText}
                            onDoubleClick={this.onClickEndText.bind(this)}
                            onChange={this.onChangeEndText.bind(this)} />
                        </Grid>
                        <Grid item>
                          <Tooltip disableInteractive title="Save" placement="top">
                            <Fab
                              color="primary"
                              size="small"
                              className={clsx(classes.fab, this.props.tutorial == VCT.clip && classes.highlight)}
                              onClick={this.onSave.bind(this)}>
                              <SaveIcon/>
                            </Fab>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip disableInteractive title="Tag Clip" placement="top">
                            <Fab
                              color="secondary"
                              size="small"
                              className={clsx(classes.fab, this.props.tutorial == VCT.clip && classes.disable)}
                              onClick={this.onTag.bind(this)}>
                              <LocalOfferIcon/>
                            </Fab>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip disableInteractive title="Set Volume" placement="top">
                            <Fab
                              color="secondary"
                              size="small"
                              className={clsx(classes.fab, this.props.tutorial == VCT.clip && classes.disable)}
                              onClick={this.onSetVolume.bind(this)}
                              onContextMenu={this.onClearVolume.bind(this)}>
                              <SvgIcon viewBox="0 0 24 24">
                                <path d="M3 9V15H7L12 20V4L7 9H3M16 15H14V9H16V15M20 19H18V5H20V19Z" />
                              </SvgIcon>
                            </Fab>
                          </Tooltip>
                        </Grid>
                        {this.state.isEditing && this.props.source.clips.find((c) => c.id == this.state.isEditing.id) && (
                          <Grid item>
                            <Tooltip disableInteractive title="Delete Clip" placement="top">
                              <Fab
                                size="small"
                                className={clsx(classes.fab, classes.removeFab, this.props.tutorial == VCT.clip && classes.disable)}
                                onClick={this.onRemove.bind(this)}>
                                <DeleteIcon color="inherit" />
                              </Fab>
                            </Tooltip>
                          </Grid>
                        )}
                        <Grid item>
                          <Tooltip disableInteractive title="Cancel" placement="top">
                            <IconButton
                              className={clsx(this.props.tutorial == VCT.clip && classes.disable)}
                              onClick={this.onCancel.bind(this)}
                              size="large">
                              <KeyboardReturnIcon/>
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} className={clsx(this.props.tutorial == VCT.controls && classes.highlight)}>
                    <VideoControl
                      video={this.state.video}
                      volume={this.state.scene.videoVolume}
                      clip={!this.state.isEditing ? null : this.state.isEditing}
                      clipValue={!this.state.isEditing ? null : this.state.isEditingValue}
                      clips={this.props.source.clips}
                      useHotkeys
                      onChangeVolume={this.onChangeVolume.bind(this)}/>
                  </Grid>
                </Grid>
              </Drawer>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('wheel', this.onScroll, false);

    const scene = this.state.scene;
    scene.backgroundType = BT.color;
    scene.backgroundColor = "#010101";
    scene.videoVolume = this.props.videoVolume;
    this.setState({scene: scene});
    this.initVideo();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('wheel', this.onScroll);
  }

  componentDidUpdate(props: any) {
    if (this.props.source.url !== props.source.url) {
      this.setState({
        video: null as HTMLVideoElement,
        empty: false,
        isEditing: null,
        isEditingValue: [0,0],
        isEditingStartText: "",
        isEditingEndText: "",
      });
      this.initVideo();
    }
  }

  initVideo() {
    let video = document.createElement('video');

    video.onerror = () => {
      console.error("Error loading " + this.props.source.url);
      this.setState({empty: true});
    };

    video.onloadeddata = () => {
      this.props.cache(video);
      this.setState({video: video});
      this.props.onStartVCTutorial();
    };

    video.src = this.props.source.url;
    video.preload = "auto";
    video.loop = true;
    if (this.props.source.subtitleFile != null && this.props.source.subtitleFile.length > 0) {
      video.setAttribute("subtitles", this.props.source.subtitleFile);
    }
    video.load();
  }

  onAdd() {
    if (this.props.tutorial == VCT.clips) {
      this.props.onTutorial(VCT.clips);
    }
    const source = this.props.source;
    const newClip = new Clip();
    let id = source.clips.length + 1;
    source.clips.forEach((c) => {
      id = Math.max(c.id + 1, id);
    });
    newClip.id = id;
    newClip.start = this.state.isEditingValue[0];
    newClip.end = this.state.isEditingValue[1];
    newClip.tags = source.tags.concat();
    this.setState({
      isEditing: newClip,
      isEditingValue: [0, this.state.video.duration],
      isEditingStartText: getTimestamp(0),
      isEditingEndText: getTimestamp(this.state.video.duration),
    });
  }

  onEdit(clip: Clip) {
    if (clip.volume != null) {
      this.onChangeVolume(clip.volume);
    }
    this.setState({
      isEditing: clip,
      isEditingValue: [clip.start, clip.end],
      isEditingStartText: getTimestamp(clip.start),
      isEditingEndText: getTimestamp(clip.end),
    });
  }

  onCancel() {
    this.closeEdit();
  }

  onSave(close: boolean = true) {
    if (this.props.tutorial == VCT.clip) {
      this.props.onTutorial(VCT.clip);
    }
    const source = this.props.source;
    let clip = source.clips.find((c) => c.id == this.state.isEditing.id);
    if (clip) {
      clip.start = this.state.isEditingValue[0];
      clip.end = this.state.isEditingValue[1];
    } else {
      this.state.isEditing.start = this.state.isEditingValue[0];
      this.state.isEditing.end = this.state.isEditingValue[1];
      source.clips = source.clips.concat([this.state.isEditing]);
    }
    this.props.onUpdateClips(source.url, source.clips);
    if (close) {
      this.closeEdit();
    }
  }

  onToggleClip() {
    this.props.onSetDisabledClips(this.props.source.disabledClips ? this.props.source.disabledClips.concat(this.state.isEditing.id) : [this.state.isEditing.id]);
  }

  onTag() {
    this.setState({isTagging: !this.state.isTagging});
  }

  onClearVolume() {
    const source = this.props.source;
    let fn = (c: Clip): Clip => {c.volume = null; return c;};
    this.setState({isEditing: fn(this.state.isEditing)});
    let clip = source.clips.find((c) => c.id === this.state.isEditing.id);
    if (clip) {
      clip.volume = null;
      this.props.onUpdateClips(source.url, source.clips);
    }
  }

  onSetVolume() {
    const source = this.props.source;
    let fn = (c: Clip): Clip => {c.volume = parseInt(this.state.scene.videoVolume as any); return c;};
    this.setState({isEditing: fn(this.state.isEditing)});
    let clip = source.clips.find((c) => c.id === this.state.isEditing.id);
    if (clip) {
      clip.volume = this.state.scene.videoVolume;
      this.props.onUpdateClips(source.url, source.clips);
    }
  }

  onInherit() {
    const source = this.props.source;
    let fn = (c: Clip): Clip => {c.tags = source.tags; return c;};
    this.setState({isEditing: fn(this.state.isEditing)});
    let clip = source.clips.find((c) => c.id === this.state.isEditing.id);
    if (clip) {
      clip.tags = source.tags.concat();
      this.props.onUpdateClips(source.url, source.clips);
    }
  }

  toggleTag(tag: Tag) {
    const source = this.props.source;
    let clip = source.clips.find((c) => c.id === this.state.isEditing.id);
    if (clip) {
      if (clip.tags.find((t) => t.name === tag.name)) {
        clip.tags = clip.tags.filter((t) => t.name !== tag.name);
      } else {
        clip.tags = clip.tags.concat([tag]);
      }
      this.props.onUpdateClips(source.url, source.clips);
    } else {
      const isEditing = this.state.isEditing;
      if (isEditing.tags.find((t) => t.name === tag.name)) {
        isEditing.tags = isEditing.tags.filter((t) => t.name !== tag.name);
      } else {
        isEditing.tags = isEditing.tags.concat([tag]);
      }
      this.setState({isEditing: isEditing});
    }
  }

  onRemove() {
    const source =  this.props.source;
    const clip = source.clips.find((c) => c.id === this.state.isEditing.id);
    if (clip) {
      source.clips = source.clips.filter((c) => c.id !== this.state.isEditing.id);
      this.props.onUpdateClips(source.url, source.clips);
      this.props.onSetDisabledClips(this.props.source.disabledClips ? this.props.source.disabledClips.filter((n) => n != this.state.isEditing.id) : []);
    }
    this.closeEdit();
  }

  closeEdit() {
    this.setState({
      isEditing: null,
      isEditingValue: [0, 0],
      isEditingStartText: "",
      isEditingEndText: "",
    });
  }

  onChangeVolume(volume: number) {
    const scene = this.state.scene;
    scene.videoVolume = volume;
    this.setState({scene: scene});
    if (this.state.video) {
      this.state.video.volume = volume / 100;
    }
  }

  onChangePosition(e: MouseEvent, values: Array<number>, forceStart = false, forceEnd = false) {
    let min = values[0];
    let max = values[1];
    if (min < 0) min = 0;
    if (max < 0) max = 0;
    if (min > this.state.video.duration) min = this.state.video.duration;
    if (max > this.state.video.duration) max = this.state.video.duration;

    if (this.state.video.paused) {
      if (forceStart || values[0] != this.state.isEditingValue[0]) {
        this.state.video.currentTime = min;
      } else if (forceEnd || values[1] != this.state.isEditingValue[1]) {
        this.state.video.currentTime = max;
      }
    } else {
      if (this.state.video.currentTime < min) {
        this.state.video.currentTime = min;
      } else if (this.state.video.currentTime > max) {
        this.state.video.currentTime = max;
      }
    }

    this.setState({
      isEditingValue: [min, max],
      isEditingStartText: getTimestamp(min),
      isEditingEndText: getTimestamp(max),
    });
  }

  onChangeStartText(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({isEditingStartText: input.value});
    let timestampValue = getTimestampValue(input.value);
    this.onChangeStartTextValue(timestampValue);
  }

  onChangeStartTextValue(timestampValue: number, force = false) {
    if (timestampValue != null) {
      this.onChangePosition(null, [timestampValue, this.state.isEditingValue[1]], force, false);
    }
  }

  onClickStartText() {
    this.setState({isEditingStartText: getTimestamp(this.state.video.currentTime)});
    this.onChangePosition(null, [this.state.video.currentTime, this.state.isEditingValue[1]]);
  }

  onChangeEndText(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({isEditingEndText: input.value});
    let timestampValue = getTimestampValue(input.value);
    this.onChangeStartTextValue(timestampValue);
  }

  onChangeEndTextValue(timestampValue: number, force = false) {
    if (timestampValue != null) {
      this.onChangePosition(null, [this.state.isEditingValue[0], timestampValue], false, force);
    }
  }

  onClickEndText() {
    this.setState({isEditingEndText: getTimestamp(this.state.video.currentTime)});
    this.onChangePosition(null, [this.state.isEditingValue[0], this.state.video.currentTime]);
  }

  onScroll = (e: WheelEvent) => {
    const volumeChange = (e.deltaY / 100) * -5;
    let newVolume = this.state.scene.videoVolume + volumeChange;
    if (newVolume < 0) {
      newVolume = 0;
    } else if (newVolume > 100) {
      newVolume = 100;
    }
    this.onChangeVolume(newVolume);
  }

  onKeyDown = (e: KeyboardEvent) => {
    const focus = document.activeElement.tagName.toLocaleLowerCase();
    const start = document.activeElement.id == "start";
    const end = document.activeElement.id == "end";
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        if (this.state.isTagging) {
          this.onTag();
        } else if (!!this.state.isEditing) {
          const clip = this.props.source.clips.find((c) => c.id == this.state.isEditing.id);
          if (clip) {
            this.onSave();
          } else {
            this.closeEdit();
          }
        } else {
          this.props.goBack();
        }
        break;
      case '[':
        e.preventDefault();
        if (this.state.isEditing) {
          this.prevClip();
        } else {
          this.prevSource();
        }
        break;
      case ']':
        e.preventDefault();
        if (this.state.isEditing) {
          this.nextClip();
        } else {
          this.nextSource();
        }
        break;
      case 'ArrowDown':
        if (focus == "input") {
          e.preventDefault();
          if (start) {
            const timestampValue = getTimestampValue(this.state.isEditingStartText);
            const startValue = timestampValue-1 >= 0 ? timestampValue-1 : 0;
            this.onChangeStartTextValue(startValue, true);
          } else if (end) {
            const timestampValue = getTimestampValue(this.state.isEditingEndText);
            const endValue = timestampValue-1 >= 0 ? timestampValue-1 : 0;
            this.onChangeEndTextValue(endValue, true);
          }
        }
        break;
      case 'ArrowUp':
        if (focus == "input") {
          e.preventDefault();
          if (start) {
            const timestampValue = getTimestampValue(this.state.isEditingStartText);
            const startValue = timestampValue+1 <= this.state.video.duration ? timestampValue+1 : Math.floor(this.state.video.duration);
            this.onChangeStartTextValue(startValue, true);
          } else if (end) {
            const timestampValue = getTimestampValue(this.state.isEditingEndText);
            const endValue = timestampValue+1 <= this.state.video.duration ? timestampValue+1 : Math.floor(this.state.video.duration);
            this.onChangeEndTextValue(endValue, true);
          }
        }
        break;
    }
  };

  prevClip() {
    this.onSave(false);
    let indexOf = this.props.source.clips.indexOf(this.state.isEditing);
    indexOf -= 1;
    if (indexOf < 0) {
      indexOf = this.props.source.clips.length - 1;
    }
    this.onEdit(this.props.source.clips[indexOf]);
  }

  nextClip() {
    this.onSave(false);
    let indexOf = this.props.source.clips.indexOf(this.state.isEditing);
    indexOf += 1;
    if (indexOf >= this.props.source.clips.length) {
      indexOf = 0
    }
    this.onEdit(this.props.source.clips[indexOf]);
  }

  prevSource() {
    this.props.navigateClipping(-1);
  }

  nextSource() {
    this.props.navigateClipping(1);
  }
}

(VideoClipper as any).displayName="VideoClipper";
export default withStyles(styles)(VideoClipper as any);