import * as React from 'react';
import Modal from '../ui/Modal';
import {remote} from 'electron';

type Props = {
  sources: Array<string>,
  onImportURL(): void,
  onChange(sources: Array<string>): void,
};

export default class DirectoryPicker extends React.Component {
  readonly props: Props;
  readonly state = {
    removeAllIsOpen: false,
  };

  render() {
    return (
      <div className='DirectoryPicker'>
        <div className='DirectoryPicker__Buttons'>
          <div className='u-button u-clickable' onClick={this.onAdd.bind(this)}>+ Add local files</div>
          <div className='u-button u-clickable' onClick={this.props.onImportURL.bind(this)}>+ Import URL</div>
          <div className={`u-button u-float-left ${this.props.sources.length == 0 ? 'u-disabled' : 'u-clickable'} `}
               onClick={this.props.sources.length == 0 ? this.nop : this.toggleRemoveAllModal.bind(this)}>- Remove All</div>
        </div>
        {this.props.sources.map((source) => {
          return (
            <div
              className="DirectoryPicker__Directory"
              key={(source as any) as number}>
              {source}
              <div
                onClick={this.onRemove.bind(this, source)}
                className="u-button u-destructive u-clickable">×️</div>
            </div>
          );
        })}

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

  nop() {}

  toggleRemoveAllModal() {
    this.setState({
      removeAllIsOpen: !this.state.removeAllIsOpen
    });
  };

  onAdd() {
    let result = remote.dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']});
    if (!result) return;
    // dedup
    result = result.filter((s) => !this.props.sources.includes(s));
    this.props.onChange(this.props.sources.concat(result));
  }

  onRemove(val: string) {
    this.props.onChange(this.props.sources.filter((s) => s != val));
  }

  removeAll() {
    this.toggleRemoveAllModal();
    this.props.onChange([]);
  }
};