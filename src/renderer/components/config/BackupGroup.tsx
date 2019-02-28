import * as React from "react";
import path from "path";

import {getBackups, saveDir} from "../../utils";
import ControlGroup from "../sceneDetail/ControlGroup";
import Modal from "../ui/Modal";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";


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
              <SimpleOptionPicker
                label=""
                value={this.state.backup}
                keys={this.state.backups.map((b) => this.convertFromEpoch(b))}
                onChange={this.onChangeBackup.bind(this)} />
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

  convertToEpoch(localeString: string) {
    const date = new Date(localeString);
    return date.getTime();
  }

  onChangeBackup(backup: string) {
    const backupFile = 'data.json.' + this.convertToEpoch(backup);
    this.setState({backup: backupFile});
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
      confirmMessage: "You are about to override your data with the most recent backup. Continue?",
      confirmShowSelect: true,
      confirmFunction: this.restore,
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