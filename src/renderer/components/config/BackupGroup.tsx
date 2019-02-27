import * as React from "react";
import * as fs from "fs";
import path from "path";
import {remote} from "electron";

import ControlGroup from "../sceneDetail/ControlGroup";
import Modal from "../ui/Modal";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";

const saveDir = path.join(remote.app.getPath('appData'), 'flipflip');

export default class BackupGroup extends React.Component {

  readonly props: {
    backup(): void,
    restore(backupFile: string): void,
  };

  readonly state = {
    backups: Array<string>(),
    backup: "",
    confirmMessage: "",
    confirmTitle: "",
    confirmFunction: this.nop,
  };

  render() {
    const hasBackup = this.state.backups.length > 0;
    return(
      <ControlGroup title="Backup" isNarrow={true}>
        <div className="ControlSubgroup">
          <button onClick={this.onBackup.bind(this)} className="u-button u-clickable" >
            Backup Data
          </button>
          <button onClick={hasBackup ? this.onRestore.bind(this) : this.nop} className={`u-button ${hasBackup ? 'u-clickable' : 'u-disabled'}`} >
            Restore Backup
          </button>
        </div>
        <br/>
        <span>
          Last Backup: {hasBackup ? this.convertFromEpoch(this.state.backups[0]) : '--'}
        </span>
        {this.state.confirmMessage != "" && (
          <Modal onClose={this.closeConfirm.bind(this)} title={this.state.confirmTitle}>
            <p>{this.state.confirmMessage}</p>
            <SimpleOptionPicker
              label=""
              value={this.state.backup}
              keys={this.state.backups.map((b) => this.convertFromEpoch(b))}
              onChange={this.onChangeBackup.bind(this)}/>
            <div className="u-button u-float-right" onClick={this.state.confirmFunction.bind(this)}>
              Confirm
            </div>
          </Modal>
        )}
      </ControlGroup>
    );
  }

  nop() {}

  componentDidMount() {
    this.refreshBackups();
  }

  refreshBackups() {
    const files = fs.readdirSync(saveDir);
    const backups = [];
    for (let file of files) {
      if (file.startsWith("data.json.")) {
        backups.push(file);
      }
    }
    backups.sort((a, b) => {
      if (a > b) {
        return -1;
      } else if (a < b) {
        return 1;
      } else {
        return 0;
      }
    });
    this.setState({backups: backups});
  }

  convertFromEpoch(backupFile: string) {
    const epochString = backupFile.substring(backupFile.lastIndexOf(".") + 1);
    const date = new Date(Number.parseInt(epochString));
    return date.toLocaleString();
  }

  convertToEpoch(localeString: string) {
    const date = new Date(localeString);
    return date.getTime();
  }

  onChangeBackup(backup: string) {
    const backupFile = 'data.json.' + this.convertToEpoch(backup);
    this.setState({backup: backupFile});
  }

  onRestore() {
    this.setState({
      backup: this.state.backups[0],
      confirmTitle: "Restore",
      confirmMessage: "You are about to override your data with the most recent backup. Continue?",
      confirmFunction: this.restore
    });
  }

  restore() {
    this.props.restore(saveDir + path.sep + this.state.backup);
    this.closeConfirm();
  }

  onBackup() {
    this.props.backup();
    this.closeConfirm();
    this.refreshBackups();
  }

  closeConfirm() {
    this.setState({confirmTitle: "", confirmMessage: "", confirmFunction: this.nop});
  }
}