import * as React from 'react';
import Sortable from "react-sortablejs";

import Scene from "../../data/Scene";
import SimpleNumberInput from "../ui/SimpleNumberInput";

export default class GridSetup extends React.Component {
  readonly props: {
    scene: Scene,
    allScenes: Array<Scene>,
    onUpdateGrid(grid: Array<Array<number>>): void,
    goBack(): void,
  };

  readonly state = {
    height: this.props.scene.grid && this.props.scene.grid.length > 0 &&
            this.props.scene.grid[0].length ? this.props.scene.grid.length : 1,
    width: this.props.scene.grid && this.props.scene.grid.length > 0 &&
           this.props.scene.grid[0].length > 0 ? this.props.scene.grid[0].length : 1,
    grid: this.props.scene.grid && this.props.scene.grid.length > 0 &&
          this.props.scene.grid[0].length ? (JSON.parse(JSON.stringify(this.props.scene.grid)) as Array<Array<number>>)
          : [[this.props.scene.id]],
  };

  render() {
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

    let count = 0;
    for (let row of this.state.grid) {
      for (let col of row) {
        if (col != null) count++;
      }
    }
    const full = count == this.state.height * this.state.width;

    return (
      <div className="GridSetup">
        <div className="u-button-row">
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack.bind(this)}>Back</div>
          <div className="u-button-row-right">
            <SimpleNumberInput
              label="Height"
              value={this.state.height}
              min={1}
              max={5}
              isEnabled={true}
              onChange={this.onUpdateHeight.bind(this)}/>
            <SimpleNumberInput
              label="Width"
              value={this.state.width}
              min={1}
              max={5}
              isEnabled={true}
              onChange={this.onUpdateWidth.bind(this)}/>
            <div
              className={`u-button ${full ? 'u-clickable' : 'u-disabled'}`}
              onClick={full ? this.props.onUpdateGrid.bind(this, this.state.grid) : this.nop}>Save</div>
          </div>
        </div>
        <Sortable
          className="GridSetup__Grid"
          style={{gridTemplateColumns: gridTemplateColumns, gridTemplateRows: gridTemplateRows}}
          options={{
            group: 'shared',
            animation: 150,
            easing: "cubic-bezier(1, 0, 0, 1)",
          }}
          onChange={(order: any, sortable: any, evt: any) => {
            let newGrid = [];
            let newRow = [];
            for (let id of order) {
              newRow.push(id);
              if (newRow.length == this.state.width) {
                newGrid.push(newRow);
                newRow = [];
              }
              if (newGrid.length == this.state.height) break;
            }
            if (newRow.length > 0 && newGrid.length < this.state.height) {
              newGrid.push(newRow);
            }
            this.setState({grid: newGrid});
          }}>
          {this.state.grid.map((row, rowIndex) =>
            <React.Fragment key={rowIndex}>
              {row.map((sceneID, colIndex) => {
                const scene = this.props.allScenes.find((s) => s.id == sceneID);
                if (scene) {
                  return (
                    <div
                      key={colIndex}
                      onClick={this.onRemove.bind(this, rowIndex, colIndex)}
                      data-id={scene.id}
                      className="GridSetup__GridScene u-button">
                      {scene.name}
                    </div>
                  )
                }
              })}
            </React.Fragment>
          )}
        </Sortable>
        <Sortable
          className="GridSetup__Scenes"
          options={{
            group: {name: "shared", pull: "clone", put: false},
            sort: false,
            animation: 150,
            easing: "cubic-bezier(1, 0, 0, 1)",
          }}>
          {this.props.allScenes.map((scene) =>
            <div key={scene.id} data-id={scene.id} className="GridSetup__Scene u-button">
              {scene.name}
            </div>
          )}
        </Sortable>
      </div>
    )
  }

  nop() {}

  getNewGrid(height: number, width: number) {
    let grid = this.state.grid;

    // Adjust height
    if (grid.length > height) {
      grid.splice(height, grid.length - height);
    } else if (grid.length < height) {
      const newRow = Array<number>(width);
      grid.push(newRow);
    }
    // Adjust width
    for (let row of grid) {
      if (row.length > width) {
        row.splice(width, row.length - width);
      } else if (row.length < width) {
        while (row.length < width) {
          row.push(null);
        }
      }
    }

    // Ensure this scene is always present in the grid
    let found = false;
    for (let row of grid) {
      for (let scene of row) {
        if (scene == this.props.scene.id) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) {
      grid[0][0] = this.props.scene.id;
    }
    return grid;
  }

  onUpdateHeight(height: number) {
    const grid = this.getNewGrid(height, this.state.width);
    this.setState({height: height, grid: grid});
  }

  onUpdateWidth(width: number) {
    const grid = this.getNewGrid(this.state.height, width);
    this.setState({width: width, grid: grid});
  }

  onRemove(row: number, col: number) {
    const grid = this.state.grid;
    let gridRow = grid[row];
    gridRow.splice(col, 1);
    // Ensure this scene is always present in the grid
    let found = false;
    for (let row of grid) {
      for (let scene of row) {
        if (scene == this.props.scene.id) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) {
      grid[0][0] = this.props.scene.id;
    }
    this.setState({grid: grid});
  }
}