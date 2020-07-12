import * as React from "react";
import clsx from "clsx";

import {
  Collapse, createStyles, Divider, FormControl, FormControlLabel, FormLabel, Grid, InputAdornment,
  InputLabel, MenuItem, Radio, RadioGroup, Select, Slider, Switch, TextField, Theme, Typography, withStyles
} from "@material-ui/core";


import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import {GO, IF, OF, SDT, SOF, VO, WF} from "../../data/const";
import {SceneSettings} from "../../data/Config";
import en from "../../data/en";
import Scene from "../../data/Scene";

const styles = (theme: Theme) => createStyles({
  fullWidth: {
    width: '100%',
  },
  paddingLeft: {
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(1),
    },
  },
  noPadding: {
    padding: '0 !important',
  },
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0,
  },
  gutterBottom: {
    marginBottom: theme.spacing(2),
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

class ImageVideoCard extends React.Component {
  readonly props: {
    classes: any,
    scene: Scene | SceneSettings,
    sidebar: boolean,
    tutorial: string,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
    isPlayer?: boolean,
  };

  render() {
    const classes = this.props.classes;

    const gifTimingConstant = typeof this.props.scene.gifTimingConstant === 'number' ? this.props.scene.gifTimingConstant : 0;
    const gifTimingMin = typeof this.props.scene.gifTimingMin === 'number' ? this.props.scene.gifTimingMin : 0;
    const gifTimingMax = typeof this.props.scene.gifTimingMax === 'number' ? this.props.scene.gifTimingMax : 0;
    const videoTimingConstant = typeof this.props.scene.videoTimingConstant === 'number' ? this.props.scene.videoTimingConstant : 0;
    const videoTimingMin = typeof this.props.scene.videoTimingMin === 'number' ? this.props.scene.videoTimingMin : 0;
    const videoTimingMax = typeof this.props.scene.videoTimingMax === 'number' ? this.props.scene.videoTimingMax : 0;
    const skipVideoStart = typeof this.props.scene.skipVideoStart === 'number' ? this.props.scene.skipVideoStart : 0;
    const skipVideoEnd = typeof this.props.scene.skipVideoEnd === 'number' ? this.props.scene.skipVideoEnd : 0;
    const videoVolume = typeof this.props.scene.videoVolume === 'number' ? this.props.scene.videoVolume : 0;
    return(
      <Grid container alignItems="center">
        {!this.props.isPlayer && (
          <Grid container spacing={2} alignItems="center" className={clsx(classes.gutterBottom, this.props.tutorial == SDT.imageOptions && classes.highlight)}>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
              <FormControl className={classes.fullWidth}>
                <InputLabel>Image Filter</InputLabel>
                <Select
                  value={this.props.scene.imageTypeFilter}
                  onChange={this.onInput.bind(this, 'imageTypeFilter')}>
                  {Object.values(IF).map((tf) =>
                    <MenuItem key={tf} value={tf}>{en.get(tf)}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
              <Collapse in={this.props.scene.orderFunction == OF.random}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.forceAll}
                            onChange={this.onBoolInput.bind(this, 'forceAll')}/>
                  }
                  label="Avoid Repeating Images"/>
              </Collapse>
              <Collapse in={this.props.scene.sources.length > 1 && this.props.scene.weightFunction == WF.sources}>
                <FormControlLabel
                  control={
                    <Switch checked={this.props.scene.fullSource}
                            onChange={this.onBoolInput.bind(this, 'fullSource')}/>
                  }
                  label="Play Full Sources"/>
              </Collapse>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 6} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.videos) && classes.noPadding)}>
              <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.videos}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel>GIF Options</InputLabel>
                  <Select
                    value={this.props.scene.gifOption}
                    onChange={this.onInput.bind(this, 'gifOption')}>
                    {Object.values(GO).map((go) =>
                      <MenuItem key={go} value={go}>{en.get(go)}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Collapse>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 6} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.videos || this.props.scene.gifOption == GO.none || this.props.scene.gifOption == GO.full) && classes.noPadding)}>
              <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.videos && this.props.scene.gifOption == GO.part}>
                <TextField
                  variant="outlined"
                  label="For"
                  margin="dense"
                  value={gifTimingConstant}
                  onChange={this.onIntInput.bind(this, 'gifTimingConstant')}
                  onBlur={this.blurIntKey.bind(this, 'gifTimingConstant')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: 'number',
                  }}/>
              </Collapse>
              <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.videos && this.props.scene.gifOption == GO.partr}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={gifTimingMin}
                  onChange={this.onIntInput.bind(this, 'gifTimingMin')}
                  onBlur={this.blurIntKey.bind(this, 'gifTimingMin')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: 'number',
                  }}/>
                <TextField
                  variant="outlined"
                  label="and"
                  margin="dense"
                  value={gifTimingMax}
                  onChange={this.onIntInput.bind(this, 'gifTimingMax')}
                  onBlur={this.blurIntKey.bind(this, 'gifTimingMax')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: 'number',
                  }}/>
              </Collapse>
            </Grid>
          </Grid>
        )}
        <Grid container spacing={2} alignItems="center" className={clsx(this.props.tutorial == SDT.videoOptions && classes.highlight)}>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 6} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images}>
              <FormControl className={classes.fullWidth}>
                <InputLabel>Video Options</InputLabel>
                <Select
                  value={this.props.scene.videoOption}
                  onChange={this.onInput.bind(this, 'videoOption')}>
                  {Object.values(VO).map((vo) =>
                    <MenuItem key={vo} value={vo}>{en.get(vo)}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 6} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images || this.props.scene.videoOption == VO.none || this.props.scene.videoOption == VO.full) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images && this.props.scene.videoOption == VO.part}>
              <TextField
                variant="outlined"
                label="For"
                margin="dense"
                value={videoTimingConstant}
                onChange={this.onIntInput.bind(this, 'videoTimingConstant')}
                onBlur={this.blurIntKey.bind(this, 'videoTimingConstant')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                }}
                inputProps={{
                  step: 100,
                  min: 0,
                  type: 'number',
                }}/>
            </Collapse>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images && this.props.scene.videoOption == VO.partr}>
              <TextField
                variant="outlined"
                label="Between"
                margin="dense"
                value={videoTimingMin}
                onChange={this.onIntInput.bind(this, 'videoTimingMin')}
                onBlur={this.blurIntKey.bind(this, 'videoTimingMin')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                }}
                inputProps={{
                  step: 100,
                  min: 0,
                  type: 'number',
                }}/>
              <TextField
                variant="outlined"
                label="and"
                margin="dense"
                value={videoTimingMax}
                onChange={this.onIntInput.bind(this, 'videoTimingMax')}
                onBlur={this.blurIntKey.bind(this, 'videoTimingMax')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                }}
                inputProps={{
                  step: 100,
                  min: 0,
                  type: 'number',
                }}/>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 8} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images && !this.props.scene.videoRandomSpeed}>
              <Typography id="video-speed-slider" variant="caption" component="div"
                          color="textSecondary">
                Video Speed {this.props.scene.videoSpeed / 10}x
              </Typography>
              <Slider
                min={1}
                max={40}
                defaultValue={this.props.scene.videoSpeed}
                onChangeCommitted={this.onSliderChange.bind(this, 'videoSpeed')}
                valueLabelDisplay={'auto'}
                valueLabelFormat={(v) => v/10 + "x"}
                aria-labelledby="video-speed-slider"/>
            </Collapse>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images && this.props.scene.videoRandomSpeed}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography id="video-speed-min-slider" variant="caption" component="div"
                              color="textSecondary">
                    Video Speed Min {this.props.scene.videoSpeedMin / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={40}
                    defaultValue={this.props.scene.videoSpeedMin}
                    onChangeCommitted={this.onSliderChange.bind(this, 'videoSpeedMin')}
                    valueLabelDisplay={'auto'}
                    valueLabelFormat={(v) => v/10 + "x"}
                    aria-labelledby="video-speed-min-slider"/>
                </Grid>
                <Grid item xs={6}>
                  <Typography id="video-speed-max-slider" variant="caption" component="div"
                              color="textSecondary">
                    Video Speed Max {this.props.scene.videoSpeedMax / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={40}
                    defaultValue={this.props.scene.videoSpeedMax}
                    onChangeCommitted={this.onSliderChange.bind(this, 'videoSpeedMax')}
                    valueLabelDisplay={'auto'}
                    valueLabelFormat={(v) => v/10 + "x"}
                    aria-labelledby="video-speed-max-slider"/>
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images}>
              <FormControlLabel
                control={
                  <Switch checked={this.props.scene.videoRandomSpeed}
                          size="small"
                          onChange={this.onBoolInput.bind(this, 'videoRandomSpeed')}/>
                }
                label="Random Speed"/>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} md={this.props.sidebar ? 12 : 6} lg={this.props.sidebar ? 12 : 4} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images}>
              <FormControlLabel
                control={
                  <Switch checked={this.props.scene.randomVideoStart}
                          size="small"
                          onChange={this.onBoolInput.bind(this, 'randomVideoStart')}/>
                }
                label="Start at Random Time"/>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} md={this.props.sidebar ? 12 : 6} lg={this.props.sidebar ? 12 : 4} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images}>
              <FormControlLabel
                control={
                  <Switch checked={this.props.scene.continueVideo}
                          size="small"
                          onChange={this.onBoolInput.bind(this, 'continueVideo')}/>
                }
                label="Continue Videos"/>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} md={this.props.sidebar ? 12 : 6} lg={this.props.sidebar ? 12 : 4} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images}>
              <FormControlLabel
                control={
                  <Switch checked={this.props.scene.rotatePortrait}
                          size="small"
                          onChange={this.onBoolInput.bind(this, 'rotatePortrait')}/>
                }
                label="Rotate Portrait Videos"/>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images}>
              <FormControlLabel
                control={
                  <Switch checked={this.props.scene.playVideoClips}
                          size="small"
                          onChange={this.onBoolInput.bind(this, 'playVideoClips')}/>
                }
                label="Use Clips"/>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images || this.props.scene.playVideoClips) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images && !this.props.scene.playVideoClips}>
              <TextField
                variant="outlined"
                label="Skip First"
                margin="dense"
                value={skipVideoStart}
                onChange={this.onIntInput.bind(this, 'skipVideoStart')}
                onBlur={this.blurIntKey.bind(this, 'skipVideoStart')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                }}
                inputProps={{
                  step: 100,
                  min: 0,
                  type: 'number',
                }}/>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} className={clsx((this.props.scene.imageTypeFilter == IF.stills || this.props.scene.imageTypeFilter == IF.images || this.props.scene.playVideoClips) && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images && !this.props.scene.playVideoClips}>
              <TextField
                variant="outlined"
                label="Skip Last"
                margin="dense"
                value={skipVideoEnd}
                onChange={this.onIntInput.bind(this, 'skipVideoEnd')}
                onBlur={this.blurIntKey.bind(this, 'skipVideoEnd')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                }}
                inputProps={{
                  step: 100,
                  min: 0,
                  type: 'number',
                }}/>
            </Collapse>
          </Grid>
          <Grid item xs={12} className={clsx(this.props.scene.imageTypeFilter == IF.stills && this.props.scene.imageTypeFilter == IF.images && classes.noPadding)}>
            <Collapse in={this.props.scene.imageTypeFilter != IF.stills && this.props.scene.imageTypeFilter != IF.images}>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <VolumeDownIcon />
                </Grid>
                <Grid item xs>
                  <Slider
                    defaultValue={videoVolume}
                    onChangeCommitted={this.onSliderChange.bind(this, 'videoVolume')}/>
                </Grid>
                <Grid item>
                  <VolumeUpIcon />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" className={classes.gutterBottom}>
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          {!this.props.isPlayer && (
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} className={clsx(this.props.tutorial == SDT.weighting && classes.highlight)}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Weighting</FormLabel>
                <RadioGroup
                  value={this.props.scene.weightFunction}
                  onChange={this.onInput.bind(this, 'weightFunction')}>
                  {Object.values(WF).map((wf) =>
                    <FormControlLabel
                      disabled={this.props.scene.sources.length <= 1}
                      key={wf}
                      value={wf}
                      control={<Radio />}
                      label={en.get(wf)} />
                  )}
                </RadioGroup>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} className={clsx(this.props.tutorial == SDT.ordering && classes.highlight)}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Source Ordering</FormLabel>
              <RadioGroup
                value={this.props.scene.sourceOrderFunction}
                onChange={this.onInput.bind(this, 'sourceOrderFunction')}>
                {Object.values(SOF).map((wf) =>
                  <FormControlLabel
                    disabled={this.props.scene.sources.length <= 1 || this.props.scene.weightFunction == WF.images}
                    key={wf}
                    value={wf}
                    control={<Radio />} label={en.get(wf)} />
                )}
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={this.props.sidebar ? 12 : 4} className={clsx(this.props.tutorial == SDT.ordering && classes.highlight)}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Image Ordering</FormLabel>
              <RadioGroup
                value={this.props.scene.orderFunction}
                onChange={this.onInput.bind(this, 'orderFunction')}>
                <FormControlLabel
                  disabled={this.props.scene.sources.length > 1 && this.props.scene.weightFunction != WF.images}
                  key={OF.strict} value={OF.strict} control={<Radio />} label={en.get(OF.strict)} />
                {[OF.ordered, OF.random].map((wf) =>
                  <FormControlLabel key={wf} value={wf} control={<Radio />} label={en.get(wf)} />
                )}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  blurIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.props.scene as any)[key] < min) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.scene as any)[key] > max) {
      this.changeIntKey(key, max);
    }
  }

  onSliderChange(key: string, e: MouseEvent, value: number) {
    this.changeKey(key, value);
  }

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  onIntInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value === '' ? '' : Number(input.value));
  }

  onInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeIntKey(key:string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }
}

export default withStyles(styles)(ImageVideoCard as any);