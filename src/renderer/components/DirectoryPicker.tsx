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
    isOpen: false,
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
        <div className='u-button u-clickable' onClick={this.toggleModal.bind(this)}>+ Import From URL</div>
        <div className='u-button u-clickable' onClick={this.removeAll.bind(this)} style={{float: 'left'}}>- Remove All</div>

        {this.state.isOpen && (
          <Modal onClose={this.toggleModal.bind(this)}>
            <div>Enter a gooninator URL for import:</div>
            <input type="text" name="url" onChange={this.importURLChange.bind(this)}/>
            <div>Enter the parent directory to look in:</div>
            <input type="text" name="root" value={this.state.rootDir} onChange={this.rootDirChange}/>
            <button onClick={this.doImport.bind(this)}>
              Import
            </button>
          </Modal>
        )}
      </div>
    )
  }

  importURLChange(e: React.FormEvent<HTMLInputElement>) {
    this.setState({importURL: e.currentTarget.value});
  };

  // @ts-ignore
  rootDirChange(e: React.FormEvent<HTMLInputElement>) {
    this.setState({rootDir: e.currentTarget.value});
  };

  toggleModal() {
    this.setState({
      isOpen: !this.state.isOpen,
      importURL: ""
    });
  };

  doImport() {
    let importURL = this.state.importURL;
    this.setState({
      isOpen: !this.state.isOpen,
      importURL: ""
    });
    if (!importURL) {
      return;
    }
    let rootDir = this.state.rootDir;
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
      if (this.props.directories.includes(fullPath)) {
        // Remove index and push u back
        importURLs.splice(u,1);
        u-=1
      } else {
        importURLs[u] = fullPath;
      }
    }

    // Don't add empty blog
    if (importURLs.length == 1 && importURLs[0] === sep) {
      return;
    } else {
      // Add list
      this.props.onChange(this.props.directories.concat(importURLs));
    }
  };

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
    this.props.onChange([]);
  }
};