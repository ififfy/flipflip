import * as React from 'react'
import Modal from "./Modal";
import {sep} from "path";
import {remote} from "electron";
import {TK} from '../const';

export default class URLImporter extends React.Component {
  readonly props: {
    directories: Array<string>,
    onChangeDirectories(directories: Array<string>): void,
    onChangeTextKind(kind: string) : void,
    onChangeTextSource(hbID: string) : void,
  };

  readonly state = {
    importIsOpen: false,
    importURL: "",
    rootDir: "",
  };

  render() {
    return (
      <div className="URLImporter">
        <div className='u-button u-clickable' onClick={this.toggleImportModal.bind(this)}>+ Import From URL</div>
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
        <div style={{clear: 'both'}}></div>
      </div>
    )
  }

  doImport() {
    let importURL = this.state.importURL;
    let hastebinURL = this.state.importURL;
    this.toggleImportModal();
    if (!importURL) {
      return;
    }
    let rootDir = this.state.rootDir.toString();
    if (!rootDir.endsWith(sep)) {
      rootDir += sep;
    }
    if (importURL.includes("sources=")) {
      // Remove everything before "sources="
      importURL = importURL.substring(importURL.indexOf("sources=") + 8);

      if (importURL.includes("&")) {
        // Remove everything after the sources parameter
        importURL = importURL.substring(0, importURL.indexOf("&"));
      }

      // Split into blog names
      let importURLs = importURL.split("%20");
      // Append root onto each blog
      for (let u = 0; u < importURLs.length; u++) {
        let fullPath = rootDir + importURLs[u];
        if (this.props.directories.includes(fullPath) || importURLs[u] === sep || importURLs[u] === "") {
          // Remove index and push u back
          importURLs.splice(u, 1);
          u -= 1
        } else {
          importURLs[u] = fullPath;
        }
      }

      // Add list
      this.props.onChangeDirectories(this.props.directories.concat(importURLs));
    }

    if (hastebinURL.includes("pastebinId=")) {
      // Remove everything before "sources="
      hastebinURL = hastebinURL.substring(hastebinURL.indexOf("pastebinId=") + 11);

      if (hastebinURL.includes("&")) {
        // Remove everything after the sources parameter
        hastebinURL = hastebinURL.substring(0, hastebinURL.indexOf("&"));
      }

      // Update hastebin URL (if present)
      this.props.onChangeTextKind(TK.hastebin);
      this.props.onChangeTextSource(hastebinURL);
    }
  };

  toggleImportModal() {
    this.setState({
      importIsOpen: !this.state.importIsOpen,
      importURL: ""
    });
  };

  importURLChange(e: React.FormEvent<HTMLInputElement>) {
    this.setState({importURL: e.currentTarget.value});
  };

  addRootDir() {
    let result = remote.dialog.showOpenDialog({properties: ['openDirectory']});
    if (!result) return;
    this.setState({rootDir: result});
  }
}

