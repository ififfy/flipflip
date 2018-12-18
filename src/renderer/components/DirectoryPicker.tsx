import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {remote} from 'electron';

import {pathname} from '../util';

type Props = {
  directories: Array<string>,
  onChange(directories: Array<string>): void,
};

export default class DirectoryPicker extends React.Component {
  readonly props: Props

  render() {
    return (
      <div className='DirectoryPicker'>
        {this.props.directories.map((directory) => {
          return (
            <div
              className="DirectoryPicker__Directory"
              key={(directory as unknown) as number}>
              {pathname(directory, this.props.directories)}
              <div
                onClick={this.onRemove.bind(this, directory)}
                className="u-button u-destructive u-clickable">×️</div>
            </div>
          );
        })}
        <div className='u-button u-clickable' onClick={this.onAdd.bind(this)}>+ Add</div>
      </div>
    )
  }

  onAdd() {
    const result = remote.dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']});
    if (result) {
      this.props.onChange(this.props.directories.concat(result));
    }
  }

  onRemove(val: string) {

    this.props.onChange(this.props.directories.filter((d) => d != val));
  }
};