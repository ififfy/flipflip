import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {remote} from 'electron';

type Props = {
  directories: Array<String>,
  onChange(directories: Array<String>): void,
};

function pathname(p: String): String {
  return p.substring(p.lastIndexOf("/") + 1);
}

export default class DirectoryPicker extends React.Component {
  readonly props: Props

  render() {
    return (
      <div>
        {this.props.directories.map((directory) => {
          return <div key={(directory as unknown) as number}>{pathname(directory)}</div>;
        })}
        <div onClick={this.onAdd.bind(this)}>+ Add</div>
      </div>
    )
  }

  onAdd() {
    this.props.onChange(this.props.directories.concat(
      remote.dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']})));
  }
};