import * as React from "react";
import * as fs from "fs";
import path from "path";
import {remote} from "electron";

import ControlGroup from "../sceneDetail/ControlGroup";

const saveDir = path.join(remote.app.getPath('appData'), 'flipflip');
const backupPath = path.join(saveDir, 'data - Backup.json');

export default class BackupGroup extends React.Component {

  readonly props: {
    restore(): void,
    backup(): void,
  };

  render() {
    const hasBackup = fs.existsSync(backupPath);
    return(
      <ControlGroup title="Backup" isNarrow={true}>
        <div className="ControlSubgroup">
          <button onClick={this.props.backup.bind(this)} className="u-button u-clickable" >
            Backup Data
          </button>
          <button onClick={hasBackup ? this.props.restore.bind(this) : this.nop} className={`u-button ${hasBackup ? 'u-clickable' : 'u-disabled'}`} >
            Restore Last Backup
          </button>
        </div>
      </ControlGroup>
    );
  }

  nop() {}
}