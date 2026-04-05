import fs from "fs";
import path from "path";
import moment from "moment";
import rimraf from "rimraf";
import { webFrame } from "electron";
import Config from "../common/Config";
import { saveDir, getBackups, savePath } from "./utils";
import Backup from "../common/Backup";
import AppStorageState from "../common/AppStorageState";
import LibrarySource from "../common/LibrarySource";
import Scene from "../common/Scene";
import SceneGroup from "../common/SceneGroup";
import SceneGrid from "../common/SceneGrid";
import Audio from "../common/Audio";
import CaptionScript from "../common/CaptionScript";
import Playlist from "../common/Playlist";
import Tag from "../common/Tag";
import { Route } from "../common/Route";
import defaultTheme from "../common/theme";
import { reloadWindow } from "./WindowManager";

export function cleanBackups(config: Config) {
  let backups = getBackups();
  if (backups.length <= 1) return;
  if (config.generalSettings.autoCleanBackup) {
    let keepDays = [backups[0]],
      keepWeeks = [backups[0]],
      keepMonths = [backups[0]];

    const convertFromEpoch = (backupFile: string) => {
      const epochString = backupFile.substring(backupFile.lastIndexOf(".") + 1);
      return new Date(Number.parseInt(epochString));
    };

    for (let backup of backups) {
      let backupDate = convertFromEpoch(backup.url);
      let lastDay = convertFromEpoch(keepDays[keepDays.length - 1].url);
      let lastWeek = convertFromEpoch(keepWeeks[keepWeeks.length - 1].url);
      let lastMonth = convertFromEpoch(keepMonths[keepMonths.length - 1].url);

      if (moment(backupDate).isSame(lastDay, "day")) {
        if (
          moment(backupDate).isSame(new Date(), "day") &&
          backupDate > lastDay
        ) {
          keepDays[keepDays.length - 1] = backup;
        } else if (
          !moment(backupDate).isSame(new Date(), "day") &&
          backupDate < lastDay
        ) {
          keepDays[keepDays.length - 1] = backup;
        }
      } else if (keepDays.length < config.generalSettings.autoCleanBackupDays) {
        keepDays.push(backup);
      }

      if (moment(backupDate).isSame(lastWeek, "week")) {
        if (backupDate < lastWeek) {
          keepWeeks[keepWeeks.length - 1] = backup;
        }
      } else if (
        keepWeeks.length < config.generalSettings.autoCleanBackupWeeks
      ) {
        keepWeeks.push(backup);
      }

      if (moment(backupDate).isSame(lastMonth, "month")) {
        if (backupDate < lastWeek) {
          keepMonths[keepMonths.length - 1] = backup;
        }
      } else if (
        keepMonths.length < config.generalSettings.autoCleanBackupMonths
      ) {
        keepMonths.push(backup);
      }
    }
    backups = backups.filter(
      (b) =>
        !keepDays.includes(b) &&
        !keepWeeks.includes(b) &&
        !keepMonths.includes(b),
    );
  } else {
    for (let k = 0; k < config.generalSettings.cleanRetain; k++) {
      backups.shift(); // Keep the K newest backups
    }
  }

  unlinkBackups(backups);
}

function unlinkBackups(backups: Array<Backup>) {
  for (let backup of backups) {
    try {
      fs.unlinkSync(path.join(saveDir, backup.url));
    } catch (e) {
      console.error(e);
    }
  }
}

export function restoreFromBackup(backupFile: string): AppStorageState {
  const data = JSON.parse(fs.readFileSync(backupFile, "utf-8"));
  const state: AppStorageState = {
    version: data.version,
    specialMode: data.specialMode ? data.specialMode : null,
    openTab: data.openTab ? data.openTab : 0,
    displayedSources: Array<LibrarySource>(),
    config: new Config(data.config),
    scenes: data.scenes.map((s: any) => new Scene(s)),
    sceneGroups: data.sceneGroups
      ? data.sceneGroups.map((g: any) => new SceneGroup(g))
      : Array<SceneGroup>(),
    grids: data.grids
      ? data.grids.map((g: any) => new SceneGrid(g))
      : Array<SceneGrid>(),
    audios: data.audios
      ? data.audios.map((a: any) => new Audio(a))
      : Array<Audio>(),
    scripts: data.scripts
      ? data.scripts.map((a: any) => new CaptionScript(a))
      : Array<CaptionScript>(),
    playlists: data.playlists
      ? data.playlists.map((p: any) => new Playlist(p))
      : Array<Playlist>(),
    library: data.library.map((s: any) => new LibrarySource(s)),
    tags: data.tags.map((t: any) => new Tag(t)),
    route: data.route.map((s: any) => new Route(s)),
    libraryYOffset: 0,
    libraryFilters: Array<string>(),
    librarySelected: Array<string>(),
    audioOpenTab: data.audioOpenTab ? data.audioOpenTab : 3,
    audioYOffset: 0,
    audioFilters: Array<string>(),
    audioSelected: Array<string>(),
    scriptYOffset: 0,
    scriptFilters: Array<string>(),
    scriptSelected: Array<string>(),
    progressMode: null as string,
    progressTitle: null as string,
    progressCurrent: 0,
    progressTotal: 0,
    progressNext: null as string,
    systemMessage: null as string,
    systemSnack: null as string,
    systemSnackSeverity: null as string,
    tutorial: null as string,
    theme: data.theme ? data.theme : defaultTheme,
    systemSnackOpen: false,
  };

  return state;
}

export function reset(windowId: number) {
  rimraf.sync(savePath);
  reloadWindow(windowId);
}

export function printMemoryReport() {
  function format(x: any) {
    let f = x.toString();
    while (f.length < 15) {
      f = " " + f;
    }
    f = f.substr(0, 15);
    return f;
  }
  function logB(x: any) {
    console.log(
      format(x[0]),
      format((x[1] / (1000.0 * 1000)).toFixed(2)),
      "MB",
    );
  }
  function logKB(x: any) {
    console.log(format(x[0]), format((x[1] / 1000.0).toFixed(2)), "MB");
  }
  function logCount(x: any) {
    console.log(
      format(x[0]),
      format(x[1].count),
      format((x[1].size / (1000.0 * 1000)).toFixed(2)),
      "MB",
      format((x[1].liveSize / (1000.0 * 1000)).toFixed(2)),
      "MB",
    );
  }

  Object.entries(process.memoryUsage()).map(logB);
  Object.entries(process.getProcessMemoryInfo()).map(logKB);
  Object.entries(process.getSystemMemoryInfo()).map(logKB);
  console.log("\n");
  console.log(
    format("object"),
    format("count"),
    format("size"),
    format("liveSize"),
  );
  Object.entries(webFrame.getResourceUsage()).map(logCount);
  console.log("------");
}
