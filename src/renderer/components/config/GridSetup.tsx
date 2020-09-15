import * as React from "react";
import clsx from "clsx";

import {
  AppBar, Button, Container, createStyles, Fab, IconButton, ListItemText, Menu, MenuItem, TextField, Theme, Toolbar,
  Tooltip, Typography, withStyles
} from "@material-ui/core";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';

import {SGT} from "../../data/const";
import SceneSelect from "../configGroups/SceneSelect";
import SceneGrid from "../../data/SceneGrid";
import Scene from "../../data/Scene";

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    height: '100vh',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacer: {
    ...theme.mixins.toolbar
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
    flexBasis: '13%',
  },
  headerRight: {
    flexBasis: '13%',
    justifyContent: 'flex-end',
    display: 'flex',
  },
  titleField: {
    margin: 0,
    textAlign: 'center',
    flexGrow: 1,
  },
  titleInput: {
    color: theme.palette.primary.contrastText,
    textAlign: 'center',
    fontSize: theme.typography.h4.fontSize,
  },
  noTitle: {
    width: '33%',
    height: theme.spacing(7),
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
  },
  container: {
    height: '100%',
    padding: theme.spacing(0),
  },
  dimensionInput: {
    color: `${theme.palette.primary.contrastText} !important`,
    minWidth: theme.spacing(6),
  },
  grid: {
    flexGrow: 1,
    display: 'grid',
    height: '100%',
  },
  gridCell: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneMenu: {
    minHeight: 365,
    minWidth: 250,
  },
  deleteButton: {
    backgroundColor: theme.palette.error.dark,
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
  deleteIcon: {
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
  }
});

class GridSetup extends React.Component {
  readonly props: {
    classes: any,
    allScenes: Array<Scene>,
    autoEdit: boolean,
    grid: SceneGrid,
    tutorial: string,
    goBack(): void,
    onDelete(grid: SceneGrid): void,
    onPlayGrid(grid: SceneGrid): void,
    onTutorial(tutorial: string): void,
    onUpdateGrid(grid: SceneGrid, fn: (grid: SceneGrid) => void): void,
  };

  readonly state = {
    isEditingName: this.props.autoEdit ? this.props.grid.name : null as string,
    isEditing: null as Array<number>,
    menuAnchorEl: null as any,
    height: this.props.grid.grid && this.props.grid.grid.length > 0 &&
    this.props.grid.grid[0].length ? this.props.grid.grid.length : 1,
    width: this.props.grid.grid && this.props.grid.grid.length > 0 &&
    this.props.grid.grid[0].length > 0 ? this.props.grid.grid[0].length : 1,
  };

  readonly nameInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const classes = this.props.classes;

    const colSize = 100 / this.state.width;
    const rowSize = 100 / this.state.height;
    let gridTemplateColumns = "";
    let gridTemplateRows = "";
    for (let w = 0; w < this.state.width; w++) {
      gridTemplateColumns += colSize.toString() + "% ";
    }
    for (let h = 0; h < this.state.height; h++) {
      gridTemplateRows += rowSize.toString() + "% ";
    }

    return(
      <div className={classes.root}>

        <AppBar position="absolute" className={clsx(classes.appBar, this.props.tutorial == SGT.dimensions && classes.backdropTop)}>
          <Toolbar className={classes.headerBar}>
            <div className={classes.headerLeft}>
              <Tooltip title="Back" placement="right-end">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Back"
                  className={clsx(this.props.tutorial == SGT.dimensions && classes.disable)}
                  onClick={this.goBack.bind(this)}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </div>

            {this.state.isEditingName != null && (
              <form onSubmit={this.endEditingName.bind(this)} className={classes.titleField}>
                <TextField
                  autoFocus
                  fullWidth
                  id="title"
                  value={this.state.isEditingName}
                  margin="none"
                  ref={this.nameInputRef}
                  inputProps={{className: classes.titleInput}}
                  onBlur={this.endEditingName.bind(this)}
                  onChange={this.onChangeName.bind(this)}
                />
              </form>
            )}
            {this.state.isEditingName == null && (
              <Typography component="h1" variant="h4" color="inherit" noWrap
                          className={clsx(classes.title, this.props.grid.name.length == 0 && classes.noTitle, this.props.tutorial == SGT.dimensions && classes.disable)} onClick={this.beginEditingName.bind(this)}>
                {this.props.grid.name}
              </Typography>
            )}

            <div className={classes.headerRight}>
              <TextField
                label="Height"
                margin="dense"
                value={this.state.height}
                onChange={this.onHeightInput.bind(this)}
                onBlur={this.blurHeight.bind(this)}
                variant="filled"
                className={clsx(this.props.tutorial == SGT.dimensions && classes.highlight)}
                InputLabelProps={{className: classes.dimensionInput}}
                inputProps={{
                  className: classes.dimensionInput,
                  min: 1,
                  max: 5,
                  type: 'number',
                }}/>
              <TextField
                label="Width"
                margin="dense"
                value={this.state.width}
                onChange={this.onWidthInput.bind(this)}
                onBlur={this.blurWidth.bind(this)}
                variant="filled"
                className={clsx(this.props.tutorial == SGT.dimensions && classes.highlight)}
                InputLabelProps={{className: classes.dimensionInput}}
                inputProps={{
                  className: classes.dimensionInput,
                  min: 1,
                  max: 5,
                  type: 'number',
                }}/>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="Play"
                className={clsx(this.props.tutorial == SGT.dimensions && classes.disable)}
                onClick={this.onPlayGrid.bind(this)}>
                <PlayCircleOutlineIcon fontSize="large"/>
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth={false} className={classes.container}>
            <div className={classes.grid}
                 style={{gridTemplateColumns: gridTemplateColumns, gridTemplateRows: gridTemplateRows}}>
              {this.props.grid.grid.map((row, rowIndex) =>
                <React.Fragment key={rowIndex}>
                  {row.map((sceneID, colIndex) => {
                    const scene = this.props.allScenes.find((s) => s.id == sceneID);
                    return (
                      <Button
                        className={classes.gridCell}
                        key={colIndex}
                        variant="outlined"
                        onClick={this.onClickCell.bind(this, rowIndex, colIndex)}>
                        {scene ? scene.name : "~~EMPTY~~"}
                      </Button>
                    );
                  })}
                </React.Fragment>
              )}
            </div>
            <Menu
              id="scene-menu"
              elevation={1}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              getContentAnchorEl={null}
              anchorEl={this.state.menuAnchorEl}
              keepMounted
              classes={{paper: classes.sceneMenu}}
              open={!!this.state.isEditing}
              onClose={this.onCloseMenu.bind(this)}>
              {!!this.state.isEditing &&
                <SceneSelect
                  scene={null}
                  allScenes={this.props.allScenes}
                  value={this.props.grid.grid[this.state.isEditing[0]][this.state.isEditing[1]]}
                  menuIsOpen
                  autoFocus
                  onlyExtra
                  getSceneName={this.getSceneName.bind(this)}
                  onChange={this.onChooseScene.bind(this)}
                  />
              }
            </Menu>
            <Fab
              className={classes.deleteButton}
              onClick={this.props.onDelete.bind(this, this.props.grid)}
              size="small">
              <DeleteIcon className={classes.deleteIcon}/>
            </Fab>
          </Container>
        </main>
      </div>
    );
  }

  componentDidUpdate() {
    if (this.props.tutorial == SGT.dimensions && this.state.width ==2 && this.state.height == 2) {
      this.props.onTutorial(SGT.dimensions);
      const sceneID = this.props.allScenes[0].id;
      const newGrid = this.props.grid.grid;
      newGrid[0][0] = sceneID;
      newGrid[0][1] = sceneID;
      newGrid[1][0] = sceneID;
      newGrid[1][1] = sceneID;
      this.changeKey('grid', newGrid);
    }
  }

  onClickCell(rowIndex: number, colIndex: number, e: MouseEvent) {
    this.setState({menuAnchorEl: e.currentTarget, isEditing: [rowIndex, colIndex]});
  }

  onChooseScene(sceneID: number) {
    const row = this.state.isEditing[0];
    const col = this.state.isEditing[1];
    const newGrid = this.props.grid.grid;
    newGrid[row][col] = sceneID;
    this.changeKey('grid', newGrid);
    this.onCloseMenu();
  }

  onCloseMenu() {
    this.setState({isEditing: null});
  }

  getNewGrid(height: number, width: number) {
    let grid = this.props.grid.grid;

    // Adjust height
    if (grid.length > height) {
      grid.splice(height, grid.length - height);
    } else if (grid.length < height) {
      const newRow = Array<number>(width).fill(-1);
      grid.push(newRow);
    }
    // Adjust width
    for (let row of grid) {
      if (row.length > width) {
        row.splice(width, row.length - width);
      } else if (row.length < width) {
        while (row.length < width) {
          row.push(-1);
        }
      }
    }
    return grid;
  }

  onUpdateHeight(height: number) {
    const grid = this.getNewGrid(height, this.state.width);
    this.changeKey('grid', grid);
    this.setState({height: height});
  }

  onUpdateWidth(width: number) {
    const grid = this.getNewGrid(this.state.height, width);
    this.changeKey('grid', grid);
    this.setState({width: width});
  }

  onHeightInput(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    if (input.value === '') {
      this.onUpdateHeight(1);
    } else {
      this.onUpdateHeight(Number(input.value));
    }
  }

  blurHeight(e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && this.state.height < min) {
      this.onUpdateHeight(min);
    } else if (max && this.state.height > max) {
      this.onUpdateHeight(max);
    }
  }

  onWidthInput(e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    if (input.value === '') {
      this.onUpdateWidth(1);
    } else {
      this.onUpdateWidth(Number(input.value));
    }
  }

  blurWidth(e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && this.state.width < min) {
      this.onUpdateWidth(min);
    } else if (max && this.state.width > max) {
      this.onUpdateWidth(max);
    }
  }

  beginEditingName() {
    this.setState({isEditingName: this.props.grid.name});
  }

  endEditingName(e: Event) {
    e.preventDefault();
    this.changeKey('name', this.state.isEditingName);
    this.setState({isEditingName: null});
  }

  onChangeName(e: React.FormEvent<HTMLInputElement>) {
    this.setState({isEditingName:  e.currentTarget.value});
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateGrid(this.props.grid, fn);
  }

  goBack() {
    this.props.goBack();
  }

  onPlayGrid() {
    this.props.onPlayGrid(this.props.grid);
  }

  getSceneName(id: string): string {
    if (id === "-1") return "~~EMPTY~~";
    const scene = this.props.allScenes.find((s) => s.id.toString() === id)
    return scene ? scene.name : "~~EMPTY~~";
  }
}

export default withStyles(styles)(GridSetup as any);