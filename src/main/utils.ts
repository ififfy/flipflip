import fs from "fs";
import path from "path";
import { app } from "electron";
import Backup from "../common/Backup";
export const saveDir = path.join(app.getPath("appData"), "flipflip");
export const savePath = path.join(saveDir, "data.json");
export const portablePath = path.join(
  path.dirname(app.getAppPath()),
  "data.json",
);

export function getBackups(): Array<Backup> {
  const files = fs.readdirSync(saveDir);
  const backups = Array<Backup>();
  for (let file of files) {
    if (file.startsWith("data.json.") && file != "data.json.new") {
      const stats = fs.statSync(path.join(saveDir, file));
      backups.push({ url: file, size: stats.size });
    }
  }
  backups.sort((a, b) => {
    const aFile = a.url;
    const bFile = b.url;
    if (aFile > bFile) {
      return -1;
    } else if (aFile < bFile) {
      return 1;
    } else {
      return 0;
    }
  });
  return backups;
}
