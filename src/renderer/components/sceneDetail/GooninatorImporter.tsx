import * as React from 'react'
import {sep} from "path";
import {remote} from "electron";
import {TK} from '../../const';
import SimpleTextInput from '../ui/SimpleTextInput';

export default class GooninatorImporter extends React.Component {
  readonly props: {
    directories: Array<string>,
    onChangeDirectories(directories: Array<string>): void,
    onChangeTextKind(kind: string) : void,
    onChangeTextSource(hbID: string) : void,
    onDidImport(): void,
  };

  readonly state = {
    importURL: "",
    rootDir: "",
  };

  render() {
    return (
      <div className="GooninatorImporter">
        <SimpleTextInput
          label="Paste a gooninator URL for import:"
          value={this.state.importURL}
          onChange={this.importURLChange.bind(this)}
          isEnabled={true} />

        <p>Enter the parent directory to look in:</p>
        <p>
          <input type="text" name="root" value={this.state.rootDir} readOnly onClick={this.addRootDir.bind(this)}/>
        </p>
        <div className="u-button u-float-right" onClick={this.doImport.bind(this)}>
          Import
        </div>
        <div style={{clear: 'both'}} />
      </div>
    );
  }

  doImport() {
    let importURL = this.state.importURL;
    let hastebinURL = this.state.importURL;
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

    this.props.onDidImport();
  };

  importURLChange(value: string) {
    this.setState({importURL: value});
  };

  addRootDir() {
    let result = remote.dialog.showOpenDialog({properties: ['openDirectory']});
    if (!result) return;
    this.setState({rootDir: result});
  }
}

