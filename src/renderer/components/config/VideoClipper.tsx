import * as React from "react";
import clsx from "clsx";

import {
  AppBar, Button, CircularProgress, Collapse, Container, createStyles, Drawer, Fab, Grid, IconButton, Slider, TextField,
  Theme, Toolbar, Tooltip, Typography, withStyles
} from "@material-ui/core";
import ValueLabel from "@material-ui/core/Slider/ValueLabel";

import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteIcon from '@material-ui/icons/Delete';
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import SaveIcon from '@material-ui/icons/Save';

import {getTimestamp, getTimestampValue} from "../../data/utils";
import {BT} from "../../data/const";
import LibrarySource from "../../data/LibrarySource";
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
    height: theme.spacing(17.5),
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
    padding: theme.spacing(1),
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
});

const StyledValueLabel = withStyles((theme: Theme) => createStyles({
  offset: {
    top: -5,
    left: 'calc(-50% + 8px)',
    fontSize: '1rem',
  },
  circle: {
    width: theme.spacing(1),
    height: theme.spacing(1),
    backgroundColor: 'transparent',
  },
  label: {
    color: theme.palette.text.primary,
  }
}))(ValueLabel as any);

class VideoClipper extends React.Component {
  readonly props: {
    classes: any,
    source: LibrarySource,
    videoVolume: number,
    cache(video: HTMLVideoElement): void,
    goBack(): void,
    onUpdateClips(url: string, clips: Array<Clip>): void,
  };

  readonly state = {
    scene: new Scene(),
    video: null as HTMLVideoElement,
    empty: false,
    isEditing: -1,
    isEditingValue: [0,0],
    isEditingStartText: "",
    isEditingEndText: "",
  };

  render() {
    const classes = this.props.classes;

    return(
      <div className={clsx(classes.root, "VideoClipper")}>
        <AppBar
          className={classes.appBar}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip title="Back" placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  onClick={this.props.goBack.bind(this)}>
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
                <ImageView
                  image={this.state.video}
                  scene={this.state.scene}
                  fitParent
                  hasStarted/>
              </Container>
              <div className={classes.drawerSpacer}/>
            </main>

            <Drawer
              variant="permanent"
              anchor="bottom"
              classes={{paper: classes.clipDrawerPaper}}
              open>
              <Grid container alignItems="center">
                <Grid item xs={12}>
                  <Collapse in={this.state.isEditing == -1}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Tooltip title="New Clip" placement="top">
                          <Fab
                            color="primary"
                            size="small"
                            className={clsx(classes.fab, classes.addFab)}
                            onClick={this.onAdd.bind(this)}>
                            <AddIcon/>
                          </Fab>
                        </Tooltip>
                      </Grid>
                      {this.props.source.clips.map((c) =>
                        <Grid key={c.id} item>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={this.onEdit.bind(this, c)}>
                            {c.id}
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Collapse>
                  <Collapse in={this.state.isEditing != -1}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs className={classes.timeSlider}>
                        <Slider
                          min={0}
                          max={this.state.video.duration}
                          value={this.state.isEditingValue}
                          ValueLabelComponent={(props) => <StyledValueLabel {...props}/>}
                          valueLabelDisplay="on"
                          valueLabelFormat={(value) => getTimestamp(value)}
                          marks={[{value: 0, label: getTimestamp(0)}, {value: this.state.video.duration, label: getTimestamp(this.state.video.duration)}]}
                          onChange={this.onChangePosition.bind(this)}/>
                      </Grid>
                      <Grid item>
                        <TextField
                          className={classes.clipField}
                          label="Start"
                          value={this.state.isEditingStartText}
                          onChange={this.onChangeStartText.bind(this)}/>
                      </Grid>
                      <Grid item>
                        <TextField
                          className={classes.clipField}
                          label="End"
                          value={this.state.isEditingEndText}
                          onChange={this.onChangeEndText.bind(this)}/>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Save" placement="top">
                          <Fab
                            color="primary"
                            size="small"
                            className={classes.fab}
                            onClick={this.onSave.bind(this)}>
                            <SaveIcon/>
                          </Fab>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Delete Clip" placement="top">
                          <Fab
                            size="small"
                            className={clsx(classes.fab, classes.removeFab)}
                            onClick={this.onRemove.bind(this)}>
                            <DeleteIcon color="inherit" />
                          </Fab>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Cancel" placement="top">
                          <IconButton onClick={this.onCancel.bind(this)}>
                            <KeyboardReturnIcon/>
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Collapse>
                </Grid>
                <Grid item xs={12}>
                  <VideoControl
                    video={this.state.video}
                    volume={this.state.scene.videoVolume}
                    clip={this.state.isEditing == -1 ? null : this.state.isEditingValue}
                    clips={this.props.source.clips}
                    onChangeVolume={this.onChangeVolume.bind(this)}/>
                </Grid>
              </Grid>
            </Drawer>
          </React.Fragment>
        )}
      </div>
    );
  }

  componentDidMount() {
    const scene = this.state.scene;
    scene.backgroundType = BT.color;
    scene.backgroundColor = "#010101";
    scene.videoVolume = this.props.videoVolume;
    this.setState({scene: scene});

    let video = document.createElement('video');

    video.onerror = () => {
      console.error("Error loading " + this.props.source.url);
      this.setState({empty: true});
    };

    video.onloadeddata = () => {
      this.props.cache(video);
      this.setState({video: video});
    };

    video.src = this.props.source.url;
    video.preload = "auto";
    video.loop = true;
    video.load();
  }

  onAdd() {
    this.setState({
      isEditing: 0,
      isEditingValue: [0, this.state.video.duration],
      isEditingStartText: getTimestamp(0),
      isEditingEndText: getTimestamp(this.state.video.duration),
    });
  }

  onEdit(clip: Clip) {
    this.setState({
      isEditing: clip.id,
      isEditingValue: [clip.start, clip.end],
      isEditingStartText: getTimestamp(clip.start),
      isEditingEndText: getTimestamp(clip.end),
    });
  }

  onCancel() {
    this.closeEdit();
  }

  onSave() {
    const source = this.props.source;
    let clip = source.clips.find((c) => c.id == this.state.isEditing);
    if (clip) {
      clip.start = this.state.isEditingValue[0];
      clip.end = this.state.isEditingValue[1];
    } else {
      const newClip = new Clip();
      let id = source.clips.length + 1;
      source.clips.forEach((c) => {
        id = Math.max(c.id + 1, id);
      });
      newClip.id = id;
      newClip.start = this.state.isEditingValue[0];
      newClip.end = this.state.isEditingValue[1];
      source.clips.push(newClip);
    }
    this.props.onUpdateClips(source.url, source.clips);
    this.closeEdit();
  }

  onRemove() {
    if (this.state.isEditing > 0) {
      const source =  this.props.source;
      source.clips = source.clips.filter((c) => c.id !== this.state.isEditing);
      source.clips.forEach((c) => {
        if (c.id > this.state.isEditing) {
          c.id = c.id - 1;
        }
      });
      this.props.onUpdateClips(source.url, source.clips);
    }
    this.closeEdit();
  }

  closeEdit() {
    this.setState({
      isEditing: -1,
      isEditingValue: null,
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

  onChangePosition(e: MouseEvent, values: Array<number>) {
    let min = values[0];
    let max = values[1];
    if (min < 0) min = 0;
    if (max < 0) max = 0;
    if (min > this.state.video.duration) min = this.state.video.duration;
    if (max > this.state.video.duration) max = this.state.video.duration;

    if (this.state.video.paused) {
      if (values[0] != this.state.isEditingValue[0]) {
        this.state.video.currentTime = min;
      } else if (values[1] != this.state.isEditingValue[1]) {
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
    if (timestampValue) {
      this.onChangePosition(null, [timestampValue, this.state.isEditingValue[1]]);
    }
  }

  onChangeEndText(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.setState({isEditingEndText: input.value});
    let timestampValue = getTimestampValue(input.value);
    if (timestampValue) {
      this.onChangePosition(null, [this.state.isEditingValue[0], timestampValue]);
    }
  }
}

export default withStyles(styles)(VideoClipper as any);