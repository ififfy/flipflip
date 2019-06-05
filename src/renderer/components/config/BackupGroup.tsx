import * as React from "react";
import path from "path";

import {getBackups, saveDir} from "../../data/utils";
import ControlGroup from "../sceneDetail/ControlGroup";
import Modal from "../ui/Modal";

export default class BackupGroup extends React.Component {

  readonly props: {
    backup(): void,
    restore(backupFile: string): void,
    clean(): void,
  };

  readonly state = {
    backups: Array<string>(),
    backup: "",
    confirmMessage: "",
    confirmTitle: "",
    confirmShowSelect: true,
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
          <button onClick={this.state.backups.length > 1 ? this.onClean.bind(this) : this.nop}
                  className={`u-button ${this.state.backups.length > 1 ? 'u-clickable' : 'u-disabled'}`} >
            Clean Backups
          </button>
        </div>
        <br/>
        <span>
          Number of Backups: {hasBackup ? this.state.backups.length : "--"}
        </span>
        <br/>
        <span>
          Last Backup: {hasBackup ? this.convertFromEpoch(this.state.backups[0]) : "--"}
        </span>
        {this.state.confirmMessage != "" && (
          <Modal onClose={this.closeConfirm.bind(this)} title={this.state.confirmTitle}>
            <p>{this.state.confirmMessage}</p>
            {this.state.confirmShowSelect && (
              <div className="SimpleOptionPicker">
                <select
                value={this.state.backup}
                onChange={this.onChangeBackup.bind(this)}>
                {this.state.backups.map((b) =>
                  <option value={b} key={b}>{this.convertFromEpoch(b)}</option>
                )}
                </select>
              </div>
            )}
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
    this.setState({backups: getBackups()});
  }

  convertFromEpoch(backupFile: string) {
    const epochString = backupFile.substring(backupFile.lastIndexOf(".") + 1);
    const date = new Date(Number.parseInt(epochString));
    return date.toLocaleString();
  }

  onChangeBackup(e: React.FormEvent<HTMLSelectElement>) {
    this.setState({backup: e.currentTarget.value});
  }

  onClean() {
    this.setState({
      backup: this.state.backups[0],
      confirmTitle: "Clean",
      confirmMessage: "You are about to clean your backups. This will leave only the latest backup. Continue?",
      confirmShowSelect: false,
      confirmFunction: this.clean,
    });
  }

  clean() {
    this.props.clean();
    this.closeConfirm();
    this.refreshBackups();
  }

  onRestore() {
    this.setState({
      backup: this.state.backups[0],
      confirmTitle: "Restore",
      confirmMessage: "Choose a backup to restore from:",
      confirmShowSelect: true,
      confirmFunction: this.restore,
    });
  }

  restore() {
    this.props.restore(saveDir + path.sep + this.state.backup);
    alert("Restore succes!");
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