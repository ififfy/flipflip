import fs from "fs";
import path from "path";
import { app } from "electron";
import Backup from "../common/Backup";
import { ST } from "../common/const";
import { getFileGroup, getSourceType } from "../common/utils";
import Config from "../common/Config";
import en from "../common/en";

/**
 * utils that only work in the Electron main process (NOT workers)
 */
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

export function getLocalPath(source: string, config: Config) {
  return cachePath(source, "local", config);
}

export function getCachePath(source: string, config: Config) {
  const typeDir = en.get(getSourceType(source)).toLowerCase();
  return cachePath(source, typeDir, config);
}

function cachePath(source: string, typeDir: string, config: Config) {
  if (config.caching.directory != "") {
    let baseDir = config.caching.directory;
    if (!baseDir.endsWith(path.sep)) {
      baseDir += path.sep;
    }
    if (source) {
      if (source != ST.video && source != ST.playlist) {
        return (
          baseDir +
          typeDir +
          path.sep +
          getFileGroup(source, path.sep) +
          path.sep
        );
      } else {
        return baseDir + typeDir + path.sep;
      }
    } else {
      return baseDir;
    }
  } else {
    if (source) {
      if (source != ST.video && source != ST.playlist) {
        return (
          saveDir +
          path.sep +
          "ImageCache" +
          path.sep +
          typeDir +
          path.sep +
          getFileGroup(source, path.sep) +
          path.sep
        );
      } else {
        return (
          saveDir + path.sep + "ImageCache" + path.sep + typeDir + path.sep
        );
      }
    } else {
      return saveDir + path.sep + "ImageCache" + path.sep;
    }
  }
}
