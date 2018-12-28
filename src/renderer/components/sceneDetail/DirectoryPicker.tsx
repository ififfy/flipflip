import * as React from 'react';
import Modal from '../ui/Modal';
import {remote} from 'electron';

import {pathname} from '../../util';

type Props = {
  directories: Array<string>,
  onImportURL(): void,
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
              key={(directory as any) as number}>
              {pathname(directory, this.props.directories)}
              <div
                onClick={this.onRemove.bind(this, directory)}
                className="u-button u-destructive u-clickable">×️</div>
            </div>
          );
        })}
        <div className='u-button u-clickable' onClick={this.onAdd.bind(this)}>+ Add local files</div>
        <div className='u-button u-clickable' onClick={this.props.onImportURL.bind(this)}>+ Import URL</div>
        <div className='u-button u-clickable u-float-left' onClick={this.toggleRemoveAllModal.bind(this)}>- Remove All</div>

        {this.state.removeAllIsOpen && (
          <Modal onClose={this.toggleRemoveAllModal.bind(this)} title="Remove all?">
            <p>Are you sure you want to remove everything from this scene?</p>
            <div className="u-button u-float-right" onClick={this.removeAll.bind(this)}>
              OK
            </div>
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