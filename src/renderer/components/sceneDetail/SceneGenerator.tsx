import * as React from "react";
import clsx from "clsx";

import {
  Avatar, Card, CardContent, CardHeader, createStyles, Dialog, DialogContent, DialogTitle, Divider, FormControlLabel,
  Grid, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Radio,
  RadioGroup, Slider, TextField, Theme, withStyles
} from "@material-ui/core";
import ValueLabel from "@material-ui/core/Slider/ValueLabel";

import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

import {SDGT, TT} from "../../data/const";
import en from "../../data/en";
import Scene from "../../data/Scene";
import Tag from "../../data/Tag";
import WeightGroup from "../../data/WeightGroup";

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
    maxHeight: 400,
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
  }
});

const StyledValueLabel = withStyles({
  offset: {
    top: -10,
    left: 'calc(-50% + 28px)',
  },
  circle: {
    borderRadius: '0 50% 50% 50%',
  },
  open: {},
  thumb: {
    '&$open $offset': {
      transform: 'scale(1)',
    },
  },
})(ValueLabel);

class SceneGenerator extends React.Component {
  readonly props: {
    classes: any,
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
    menuAnchorEl: null as any,
  };

  render() {
    const classes = this.props.classes;
    const isWeighing: WeightGroup = this.state.isWeighing == -1 ? null :
      this.state.isEditing == -1 ? this.props.scene.generatorWeights[this.state.isWeighing] :
      this.props.scene.generatorWeights[this.state.isEditing].rules[this.state.isWeighing];
    const isEditing: WeightGroup = this.state.isEditing == -1 ? null :
      this.props.scene.generatorWeights[this.state.isEditing];

    return(
      <Grid container spacing={1}>
        {this.props.scene.generatorWeights.map((wg, i) =>
          <Grid key={i} item xs={12} sm={6} md={4} lg={3} className={clsx((this.props.tutorial == SDGT.edit1 || this.props.tutorial == SDGT.edit2) && classes.backdropTop)}>
            <Card>
              <CardHeader
                classes={{action: classes.noAlignSelf}}
                avatar={
                  <IconButton className={clsx(classes.cardAvatarButton, this.props.tutorial == SDGT.edit1 && classes.highlight)} onClick={this.onWeighGroup.bind(this, i)}>
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
                    {wg.rules && (
                      <IconButton size="small" onClick={this.onEditGroup.bind(this, i)}>
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton size="small"
                                className={clsx(this.props.tutorial == SDGT.edit1 && classes.disable)}
                                onClick={this.onDeleteGroup.bind(this, i)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </React.Fragment>
                }
                title={wg.name}/>
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
                            </React.Fragment>
                          </ListItemIcon>
                          <ListItemText primary={wg.tag.name} />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </React.Fragment>
              )}
            </Card>
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
          getContentAnchorEl={null}
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
                max={this.getRemainingPercent() + isWeighing.percent}
                defaultValue={isWeighing.percent}
                onChangeCommitted={this.onGroupSliderChange.bind(this, this.state.isWeighing, 'percent')}
                valueLabelDisplay={'auto'}
                valueLabelFormat={(v) => v + "%"}
                ValueLabelComponent={StyledValueLabel as any}
                orientation="vertical"/>
            </div>
          )}
          {this.state.isWeighing != -1 && (
            <RadioGroup
              className={classes.editRadios}
              value={isWeighing.type}
              onChange={this.onGroupInput.bind(this, this.state.isWeighing, 'type')}>
              {Object.values(TT).map((tt) =>
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
          <DialogTitle id="adv-rule-title">Advanced Rule</DialogTitle>
          <DialogContent className={classes.noScroll}>
            {this.state.isEditing != -1 && (
              <div>
                <div style={{display: 'flex'}}>
                  <TextField
                    style={{flexGrow: 1}}
                    label="Rule Name"
                    value={this.props.scene.generatorWeights[this.state.isEditing].name}
                    onChange={this.onGroupNameChange.bind(this)}/>
                    <IconButton onClick={this.onClickAddRule.bind(this)}>
                      <AddIcon />
                    </IconButton>
                </div>
                <List disablePadding>
                  {isEditing.rules.map((wg, i) =>
                    <ListItem key={i} disableGutters>
                      <ListItemIcon>
                        <IconButton className={classes.cardAvatarButton} onClick={this.onWeighRule.bind(this, i)}>
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
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText primary={wg.tag.name} />
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
                  getContentAnchorEl={null}
                  anchorEl={this.state.menuAnchorEl}
                  keepMounted
                  classes={{paper: classes.tagMenu}}
                  open={this.state.addRule}
                  onClose={this.onCloseAddRule.bind(this)}>
                  {this.props.tags.filter((t) => !this.props.scene.generatorWeights[this.state.isEditing].rules.map((wg) => wg.tag ? wg.tag.name : "").includes(t.name)).map((t) =>
                    <MenuItem key={t.id} onClick={this.onAddRule.bind(this, t)}>
                      <ListItemText primary={t.name}/>
                    </MenuItem>
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
    let rulesHasAll = false;
    let rulesHasWeight = false;
    let rulesRemaining = 100;
    for (let rule of wg.rules) {
      if (rule.type == TT.weight) {
        rulesRemaining = rulesRemaining - rule.percent;
        rulesHasWeight = true;
      }
      if (rule.type == TT.all) {
        rulesHasAll = true;
      }
    }
    return (rulesRemaining == 100 && rulesHasAll && !rulesHasWeight) || rulesRemaining == 0;
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
    this.setState({isWeighing: -1, isEditing: -1, addRule: false, menuAnchorEl: null});
  }

  onCloseMenu() {
    if (this.state.isEditing == -1) {
      this.onCloseDialog();
    } else {
      this.setState({isWeighing: -1, menuAnchorEl: null});
    }
  }

  onAddRule(tag: Tag) {
    const newWG = new WeightGroup();
    newWG.name = tag.name;
    newWG.percent = 0;
    newWG.type = TT.weight;
    newWG.tag = tag;
    const generatorWeights = this.props.scene.generatorWeights;
    const wg = generatorWeights[this.state.isEditing];
    wg.rules = wg.rules.concat([newWG]);
    this.changeKey("generatorWeights", generatorWeights);
  }

  onClickAddRule(e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, addRule: true});
  }

  onCloseAddRule() {
    this.setState({addRule: false, menuAnchorEl: null});
  }

  onWeighRule(index: number, e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, isWeighing: index});
  }

  onDeleteRule(index: number) {
    const generatorWeights = this.props.scene.generatorWeights;
    const wg = generatorWeights[this.state.isEditing];
    wg.rules.splice(index, 1);
    this.changeKey("generatorWeights", generatorWeights);
  }

  onGroupNameChange(e: MouseEvent) {
    const generatorWeights = this.props.scene.generatorWeights;
    const wg = generatorWeights[this.state.isEditing];
    wg.name = (e.target as HTMLInputElement).value;
    this.changeKey("generatorWeights", generatorWeights);
  }

  onWeighGroup(index: number, e: MouseEvent) {
    if (this.props.tutorial == SDGT.edit1) {
      this.props.onTutorial(SDGT.edit1);
    }
    this.setState({menuAnchorEl: e.currentTarget, isWeighing: index});
  }

  onEditGroup(index: number) {
    this.setState({isEditing: index});
  }

  onDeleteGroup(index: number) {
    const generatorWeights = this.props.scene.generatorWeights;
    generatorWeights.splice(index, 1);
    this.changeKey("generatorWeights", generatorWeights);
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
    this.changeKey("generatorWeights", generatorWeights);
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
      if (generatorWeights.length == 1 && generatorWeights[0].type == TT.all) {
        this.props.onTutorial(SDGT.edit2);
        this.onCloseDialog();
      }
    }
    this.changeKey("generatorWeights", generatorWeights);
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

}

export default withStyles(styles)(SceneGenerator as any);