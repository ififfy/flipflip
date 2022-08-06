import * as React from "react";
import clsx from "clsx";

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  Radio,
  RadioGroup,
  Slider,
  Theme,
  Typography,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AddIcon from '@mui/icons-material/Add';
import AdjustIcon from '@mui/icons-material/Adjust';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

import {SDGT, TT} from "../../data/const";
import {arrayMove} from "../../data/utils";
import en from "../../data/en";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import WeightGroup from "../../data/WeightGroup";
import LibrarySearch from "../library/LibrarySearch";
import LibrarySource from "../../data/LibrarySource";

const styles = (theme: Theme) => createStyles({
  listElement: {
    paddingTop: 0,
    paddingBottom: '0 !important',
  },
  cardAvatar: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  cardAvatarButton: {
    padding: 0,
    fontSize: '1.125rem',
  },
  cardAvatarError: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  editSlider: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    height: '100%',
  },
  editRadios: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  editList: {
    display: 'flex',
    padding: theme.spacing(1),
    overflow: 'hidden',
  },
  fullHeight: {
    height: '100%',
  },
  slider: {
    height: 'auto',
    transform: 'scaleY(1)',
    zIndex: theme.zIndex.modal + 1,
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  sliderClose: {
    transform: 'scaleY(0)',
    zIndex: 'auto',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  editDialogPaper: {
    width: 400,
  },
  noAlignSelf: {
    alignSelf: 'unset',
  },
  tagMenu: {
    minHeight: 365,
    minWidth: 250,
  },
  backdropTop: {
    zIndex: `${theme.zIndex.modal + 1} !important` as any,
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid',
  },
  disable: {
    pointerEvents: 'none',
  },
  valueLabel: {
    top: theme.spacing(2.75),
    right: 'unset',
    left: theme.spacing(4),
    '&:before': {
      left: '0%',
      right: 'unset'
    }
  },
});

class SceneGenerator extends React.Component {
  readonly props: {
    classes: any,
    library: Array<LibrarySource>,
    scene: Scene,
    tags: Array<Tag>,
    tutorial: string,
    onTutorial(tutorial: string): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
  };

  readonly state = {
    isWeighing: -1,
    isEditing: -1,
    addRule: false,
    advRule: false,
    menuAnchorEl: null as any,
  };

  render() {
    const classes = this.props.classes;
    const isWeighing: WeightGroup = this.state.isWeighing == -1 ? null :
      this.state.isEditing == -1 ? this.props.scene.generatorWeights[this.state.isWeighing] :
      this.props.scene.generatorWeights[this.state.isEditing].rules[this.state.isWeighing];
    const isEditing: WeightGroup = this.state.isEditing == -1 ? null :
      this.props.scene.generatorWeights[this.state.isEditing];

    const weights = Array.from(this.props.scene.generatorWeights);
    let grid = Array<Array<any>>();
    for (let w=0; w<weights.length; w++) {
      if (!grid[w%4]) {
        grid[w%4] = [];
      }
      grid[w%4].push(weights[w]);
    }
    return (
      <Grid container spacing={1}>
        {grid.map((c, x) =>
          <Grid key={x} item xs={12} sm={6} md={4} lg={3} className={clsx((this.props.tutorial == SDGT.edit1 || this.props.tutorial == SDGT.edit2) && classes.backdropTop)}>
            <Grid container spacing={1}>
              {c.map((wg: WeightGroup, y) =>
                <Grid key={y} xs={12} item className={classes.image}>
                  <Card>
                    <CardHeader
                      classes={{action: classes.noAlignSelf}}
                      avatar={
                        <IconButton
                          className={clsx(classes.cardAvatarButton, this.props.tutorial == SDGT.edit1 && classes.highlight)}
                          onClick={this.onWeighGroup.bind(this, (y*4)+x)}
                          size="large">
                          {wg.type == TT.weight && (
                            <Avatar className={clsx(classes.cardAvatar, wg.rules && !this.areRulesValid(wg) && classes.cardAvatarError)}>
                              {wg.percent}
                            </Avatar>
                          )}
                          {wg.type == TT.all && (
                            <Avatar className={clsx(classes.cardAvatar, wg.rules && !this.areRulesValid(wg) && classes.cardAvatarError)}>
                              <CheckIcon/>
                            </Avatar>
                          )}
                          {wg.type == TT.none && (
                            <Avatar className={clsx(classes.cardAvatar, wg.rules && !this.areRulesValid(wg) && classes.cardAvatarError)}>
                              <NotInterestedIcon/>
                            </Avatar>
                          )}
                        </IconButton>
                      }
                      action={
                        <React.Fragment>
                          {wg.chosen && (
                            <Chip
                              label={wg.chosen + "/" + wg.max}
                              color='secondary'
                              size='small'/>
                          )}
                          {wg.rules && (
                            <IconButton size="small" onClick={this.onEditGroup.bind(this, (y*4)+x)}>
                              <EditIcon />
                            </IconButton>
                          )}
                          <IconButton size="small" onClick={this.onMoveLeft.bind(this, (y*4)+x)} disabled={(y*4)+x == 0}>
                            <ArrowLeftIcon />
                          </IconButton>
                          <IconButton size="small" onClick={this.onMoveRight.bind(this, (y*4)+x)} disabled={(y*4)+x == this.props.scene.generatorWeights.length - 1}>
                            <ArrowRightIcon />
                          </IconButton>
                          <IconButton size="small"
                                      className={clsx((this.props.tutorial == SDGT.edit1 || this.props.tutorial == SDGT.edit2) && classes.disable)}
                                      onClick={this.onDeleteGroup.bind(this, (y*4)+x)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </React.Fragment>
                      }
                      title={this.getRuleName(wg)}/>
                    {wg.rules && (
                      <React.Fragment>
                        <Divider/>
                        <CardContent className={classes.listElement}>
                          <List>
                            {wg.rules.map((wg, i) =>
                              <ListItem key={i}>
                                <ListItemIcon>
                                  <React.Fragment>
                                    {wg.type == TT.weight && (
                                      <Avatar>
                                        {wg.percent}
                                      </Avatar>
                                    )}
                                    {wg.type == TT.all && (
                                      <Avatar>
                                        <CheckIcon/>
                                      </Avatar>
                                    )}
                                    {wg.type == TT.none && (
                                      <Avatar>
                                        <NotInterestedIcon/>
                                      </Avatar>
                                    )}
                                    {wg.type == TT.or && (
                                      <Avatar>
                                        <AdjustIcon/>
                                      </Avatar>
                                    )}
                                  </React.Fragment>
                                </ListItemIcon>
                                <ListItemText primary={this.getSearchText(wg.search)} />
                              </ListItem>
                            )}
                          </List>
                        </CardContent>
                      </React.Fragment>
                    )}
                  </Card>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
        <Menu
          id="edit-menu"
          elevation={1}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          anchorEl={this.state.menuAnchorEl}
          keepMounted
          className={clsx((this.state.isEditing != -1 || this.props.tutorial == SDGT.edit2) && classes.backdropTop)}
          classes={{list: classes.editList, paper: clsx(this.state.isEditing != -1 && classes.backdropTop, this.props.tutorial == SDGT.edit2 && classes.highlight)}}
          open={this.state.isWeighing != -1}
          onClose={this.onCloseMenu.bind(this)}>
          {this.state.isWeighing != -1 && (
            <div className={clsx(classes.slider, isWeighing.type != TT.weight && classes.sliderClose)}>
              <Slider
                className={classes.editSlider}
                classes={{
                  valueLabel: classes.valueLabel,
                }}
                max={this.getRemainingPercent() + isWeighing.percent}
                defaultValue={isWeighing.percent}
                onChangeCommitted={this.onGroupSliderChange.bind(this, this.state.isWeighing, 'percent')}
                valueLabelDisplay={'auto'}
                valueLabelFormat={(v) => v + "%"}
                orientation="vertical"/>
            </div>
          )}
          {this.state.isWeighing != -1 && (
            <RadioGroup
              className={classes.editRadios}
              value={isWeighing.type}
              onChange={this.onGroupInput.bind(this, this.state.isWeighing, 'type')}>
              {Object.values(TT).filter((tt) => this.state.advRule || tt != TT.or).map((tt) =>
                <FormControlLabel key={tt} value={tt}
                                  control={<Radio className={clsx(this.props.tutorial == SDGT.edit2 && tt == TT.all && classes.highlight)}/>}
                                  label={en.get(tt)} />
              )}
            </RadioGroup>
          )}
        </Menu>
        <Dialog
          classes={{paper: classes.editDialogPaper}}
          open={this.state.isEditing != -1}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="adv-rule-title"
          aria-describedby="adv-rule-description">
          <DialogTitle id="adv-rule-title">{this.getRuleName(this.props.scene.generatorWeights[this.state.isEditing])}</DialogTitle>
          <DialogContent className={classes.noScroll}>
            {this.state.isEditing != -1 && (
              <div>
                <div style={{display: 'flex'}}>
                  <Typography variant={"overline"} style={{flexGrow: 1}}>
                    Create advanced rule:
                  </Typography>
                    <IconButton onClick={this.onClickAddRule.bind(this)} size="large">
                      <AddIcon />
                    </IconButton>
                </div>
                <List disablePadding>
                  {isEditing.rules.map((wg, i) =>
                    <ListItem key={i} disableGutters>
                      <ListItemIcon>
                        <IconButton
                          className={classes.cardAvatarButton}
                          onClick={this.onWeighRule.bind(this, i)}
                          size="large">
                          {wg.type == TT.weight && (
                            <Avatar className={classes.cardAvatar}>
                              {wg.percent}
                            </Avatar>
                          )}
                          {wg.type == TT.all && (
                            <Avatar className={classes.cardAvatar}>
                              <CheckIcon/>
                            </Avatar>
                          )}
                          {wg.type == TT.none && (
                            <Avatar className={classes.cardAvatar}>
                              <NotInterestedIcon/>
                            </Avatar>
                          )}
                          {wg.type == TT.or && (
                            <Avatar className={classes.cardAvatar}>
                              <AdjustIcon/>
                            </Avatar>
                          )}
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText primary={this.getSearchText(wg.search)} />
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={this.onDeleteRule.bind(this, i)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </List>
                <Menu
                  elevation={1}
                  anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  anchorEl={this.state.menuAnchorEl}
                  keepMounted
                  classes={{paper: classes.tagMenu}}
                  open={this.state.addRule}
                  onClose={this.onCloseAddRule.bind(this)}>
                  {this.state.addRule && (
                    <LibrarySearch
                      displaySources={this.props.library}
                      filters={this.props.scene.generatorWeights[this.state.isEditing].rules.filter((wg) => !wg.rules).map((wg) => wg.search)}
                      tags={this.props.tags}
                      placeholder={"Search ..."}
                      autoFocus
                      isCreatable
                      fullWidth
                      onlyUsed
                      menuIsOpen
                      controlShouldRenderValue={false}
                      onUpdateFilters={this.onAddRule.bind(this)}/>
                  )}
                </Menu>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Grid>
    );
  }

  componentDidUpdate(props: any) {
    if (this.props.scene.generatorWeights && this.props.scene.generatorWeights.length > 0 &&
        this.props.scene.generatorWeights.length > props.scene.generatorWeights.length) {
      const lastIndex = this.props.scene.generatorWeights.length - 1;
      const lastWG = this.props.scene.generatorWeights[lastIndex];
      if (lastWG.rules) {
        this.setState({isEditing: lastIndex});
      }
    }
  }

  areRulesValid(wg: WeightGroup) {
    const orRules = wg.rules.filter((r) => r.type == TT.or);
    const weightRules = wg.rules.filter((r) => r.type == TT.weight);
    let rulesRemaining = 100;
    for (let rule of weightRules) {
      rulesRemaining = rulesRemaining - rule.percent;
    }
    return wg.rules.length > 0 && (orRules.length == 0 || (orRules.length + weightRules.length == wg.rules.length && rulesRemaining == 0) || orRules.length == wg.rules.length) && (rulesRemaining == 0 || (rulesRemaining == 100 && weightRules.length == 0));
  }

  getRemainingPercent(): number {
    let remaining = 100;
    if (this.state.isEditing == -1) {
      for (let wg of this.props.scene.generatorWeights) {
        if (wg.type == TT.weight) {
          remaining = remaining - wg.percent;
        }
      }
    } else {
      for (let wg of this.props.scene.generatorWeights[this.state.isEditing].rules) {
        if (wg.type == TT.weight) {
          remaining = remaining - wg.percent;
        }
      }
    }
    return remaining;
  }

  onCloseDialog() {
    this.setState({isWeighing: -1, isEditing: -1, addRule: false, menuAnchorEl: null, advRule: false});
  }

  onCloseMenu() {
    if (this.state.isEditing == -1) {
      this.onCloseDialog();
    } else {
      this.setState({isWeighing: -1, menuAnchorEl: null});
    }
  }

  onAddRule(filters: Array<string>) {
    let generatorWeights = this.props.scene.generatorWeights;
    let wg = generatorWeights[this.state.isEditing];
    for (let search of filters) {
      if (search.length > 0 && wg.rules.find((wg) => wg.search == search) == null) {
        const newWG = new WeightGroup();
        newWG.percent = 0;
        newWG.type = TT.weight;
        newWG.search = search;
        wg.rules = wg.rules.concat([newWG]);
      }
    }
    this.changeGeneratorWeights(generatorWeights);
  }

  onClickAddRule(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, addRule: true});
  }

  onCloseAddRule() {
    this.setState({addRule: false, menuAnchorEl: null});
  }

  onWeighRule(index: number, e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, isWeighing: index, advRule: true});
  }

  onDeleteRule(index: number) {
    const generatorWeights = this.props.scene.generatorWeights;
    const wg = generatorWeights[this.state.isEditing];
    wg.rules.splice(index, 1);
    this.changeGeneratorWeights(generatorWeights);
  }

  getSearchText(search: string) {
    if ((search.startsWith("[") && search.endsWith("]")) ||
      ((search.startsWith("{") && search.endsWith("}")))){
      search = search.substring(1, search.length-1);
    }
    return search;
  }

  getRuleName(wg: WeightGroup) {
    if (!wg) return "ERROR";
    if (!!wg.rules) {
      if (wg.rules.length == 0) return "New Adv Rule";
      if (!this.areRulesValid(wg)) return "ERROR";

      let title = "";
      const allRules = wg.rules.filter((r) => r.type == TT.all).map((r) => this.getSearchText(r.search));
      if (allRules.length > 0) {
        title += allRules.join(" ");
      }
      const orRules = wg.rules.filter((r) => r.type == TT.or).map((r) => this.getSearchText(r.search));
      if (orRules.length > 0) {
        if (title != "") {
          title += ", ";
        }
        title += orRules.join(" OR ");
      }
      const noRules = wg.rules.filter((r) => r.type == TT.none).map((r) => this.getSearchText(r.search));
      if (noRules.length > 0) {
        if (title != "") {
          title += ", ";
        }
        title += "NO " + noRules.join(" ");
      }
      const weightRules = wg.rules.filter((r) => r.type == TT.weight);
      if (weightRules.length > 0) {
        for (let r of weightRules) {
          if (title != "") {
            title += ", ";
          }
          title += r.percent + "% " + this.getSearchText(r.search);
        }
      }

      return title
    } else {
      return this.getSearchText(wg.search);
    }
  }

  onWeighGroup(index: number, e: MouseEvent) {
    if (this.props.tutorial == SDGT.edit1) {
      this.props.onTutorial(SDGT.edit1);
    }
    this.setState({menuAnchorEl: e.currentTarget, isWeighing: index, advRule: false});
  }

  onEditGroup(index: number) {
    this.setState({isEditing: index});
  }

  onDeleteGroup(index: number) {
    const generatorWeights = this.props.scene.generatorWeights;
    generatorWeights.splice(index, 1);
    this.changeGeneratorWeights(generatorWeights);
  }

  onGroupSliderChange(index: number, key: string, e: MouseEvent, value: number) {
    const generatorWeights = this.props.scene.generatorWeights;
    if (this.state.isEditing == -1) {
      const wg = generatorWeights[index];
      (wg as any)[key] = value;
    } else {
      const wg = generatorWeights[this.state.isEditing];
      const rule = wg.rules[index];
      (rule as any)[key] = value;
    }
    this.changeGeneratorWeights(generatorWeights);
  }

  onGroupInput(index: number, key: string, e: MouseEvent) {
    const generatorWeights = this.props.scene.generatorWeights;
    const input = (e.target as HTMLInputElement);
    if (this.state.isEditing == -1) {
      const wg = generatorWeights[index];
      (wg as any)[key] = input.value;
    } else {
      const wg = generatorWeights[this.state.isEditing];
      const rule = wg.rules[index];
      (rule as any)[key] = input.value;
    }
    if (this.props.tutorial == SDGT.edit2) {
      if (generatorWeights.find((wg) => wg.type != TT.all) == null) {
        this.props.onTutorial(SDGT.edit2);
        this.onCloseDialog();
      }
    }
    this.changeGeneratorWeights(generatorWeights);
  }

  onMoveRight(index: number) {
    this.update((s) => {
      arrayMove(s.generatorWeights, index, index+1);
    })
  }

  onMoveLeft(index: number) {
    this.update((s) => {
      arrayMove(s.generatorWeights, index, index-1);
    })
  }

  changeGeneratorWeights(weights: WeightGroup[]) {
    for (let wg of weights) {
      wg.max = null;
      wg.chosen = null;
    }
    this.update((s) => {
      s.generatorWeights = weights;
    });
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

}

(SceneGenerator as any).displayName="SceneGenerator";
export default withStyles(styles)(SceneGenerator as any);