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

export function getFilesRecursively(filePath: string): string[] {
  const isDirectory = (filePath: string) => fs.statSync(filePath).isDirectory();
  const getDirectories = (filePath: string) =>
    fs
      .readdirSync(filePath)
      .map((name) => path.join(filePath, name))
      .filter(isDirectory);

  const isFile = (filePath: string) => fs.statSync(filePath).isFile();
  const getFiles = (filePath: string) =>
    fs
      .readdirSync(filePath)
      .map((name) => path.join(filePath, name))
      .filter(isFile);

  const dirs = getDirectories(filePath);
  const files = dirs
    .map((dir) => getFilesRecursively(dir)) // go through each directory
    .reduce((a, b) => a.concat(b), []); // map returns a 2d array (array of file arrays) so flatten
  return files.concat(getFiles(filePath));
}
