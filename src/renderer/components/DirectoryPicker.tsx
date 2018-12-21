import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Modal from './Modal';
import {remote} from 'electron';

import {sep} from 'path';
import {pathname} from '../util';

type Props = {
  directories: Array<string>,
  onChange(directories: Array<string>): void,
};

export default class DirectoryPicker extends React.Component {
  readonly props: Props;
  readonly state = {
    importIsOpen: false,
    removeAllIsOpen: false,
    importURL: "",
    rootDir: "",
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
        <div className='u-button u-clickable' onClick={this.onAdd.bind(this)}>+ Add</div>
        <div className='u-button u-clickable' onClick={this.toggleImportModal.bind(this)}>+ Import From URL</div>
        <div className='u-button u-clickable' onClick={this.toggleRemoveAllModal.bind(this)} style={{float: 'left'}}>- Remove All</div>

        {this.state.importIsOpen && (
          <Modal onClose={this.toggleImportModal.bind(this)}>
            <div>Enter a gooninator URL for import:</div>
            <input type="text" name="url" onChange={this.importURLChange.bind(this)}/>
            <div>Enter the parent directory to look in:</div>
            <input type="text" name="root" value={this.state.rootDir} readOnly onClick={this.addRootDir.bind(this)}/>
            <button onClick={this.doImport.bind(this)}>
              Import
            </button>
          </Modal>
        )}

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

  importURLChange(e: React.FormEvent<HTMLInputElement>) {
    this.setState({importURL: e.currentTarget.value});
  };

  toggleRemoveAllModal() {
    this.setState({
      removeAllIsOpen: !this.state.removeAllIsOpen
    });
  };

  toggleImportModal() {
    this.setState({
      importIsOpen: !this.state.importIsOpen,
      importURL: ""
    });
  };

  doImport() {
    let importURL = this.state.importURL;
    this.toggleImportModal();
    if (!importURL) {
      return;
    }
    let rootDir = this.state.rootDir.toString();
    if (!rootDir.endsWith(sep)) {
      rootDir += sep;
    }
    // Remove everything before "sources="
    importURL = importURL.substring(importURL.indexOf("sources=") + 8);
    // Remove everything after the sources parameter
    importURL = importURL.substring(0, importURL.indexOf("&"));
    // Split into blog names
    let importURLs = importURL.split("%20");
    // Append root onto each blog
    for (let u = 0; u<importURLs.length; u++) {
      let fullPath = rootDir + importURLs[u];
      if (this.props.directories.includes(fullPath) || importURLs[u] === sep || importURLs[u] === "") {
        // Remove index and push u back
        importURLs.splice(u,1);
        u-=1
      } else {
        importURLs[u] = fullPath;
      }
    }

    // Add list
    this.props.onChange(this.props.directories.concat(importURLs));
  };

  addRootDir() {
    let result = remote.dialog.showOpenDialog({properties: ['openDirectory']});
    if (!result) return;
    this.setState({rootDir: result});
  }

  onAdd() {
    let result = remote.dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']});
    if (!result) return;
    // dedup
    result = result.filter((d) => !this.props.directories.includes(d));
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