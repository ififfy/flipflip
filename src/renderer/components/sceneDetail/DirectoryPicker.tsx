import * as React from 'react';
import Modal from '../ui/Modal';
import {remote} from 'electron';

import {pathname} from '../../util';

type Props = {
  directories: Array<string>,
  onChange(directories: Array<string>): void,
};

export default class DirectoryPicker extends React.Component {
  readonly props: Props;
  readonly state = {
    removeAllIsOpen: false,
  };

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
        <div className='u-button u-clickable' onClick={this.onAdd.bind(this)}>+ Add local files</div>
        <div className='u-button u-clickable' onClick={this.toggleRemoveAllModal.bind(this)} style={{float: 'left'}}>- Remove All</div>

        {this.state.removeAllIsOpen && (
          <Modal onClose={this.toggleRemoveAllModal.bind(this)}>
            <div>Are you sure you want to remove all?</div>
            <button onClick={this.removeAll.bind(this)}>
              OK
            </button>
          </Modal>
        )}
      </div>
    )
  }

  toggleRemoveAllModal() {
    this.setState({
      removeAllIsOpen: !this.state.removeAllIsOpen
    });
  };

  onAdd() {
    let result = remote.dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']});
    if (!result) return;
    this.props.onChange(this.props.directories.concat(result));
  }

  onRemove(val: string) {
    this.props.onChange(this.props.directories.filter((d) => d != val));
  }

  removeAll() {
    this.toggleRemoveAllModal();
    this.props.onChange([]);
  }
};