import {remote} from "electron";
import {URL} from "url";
import path from 'path';
import * as fs from "fs";
import * as Path from "path";
import * as easings from 'd3-ease';
import crypto from "crypto";

import {getFileGroup, getSourceType} from "../components/player/Scrapers";
import {EA, ST, TF, TT} from "./const";
import en from "./en";
import Config from "./Config";
import LibrarySource from "./LibrarySource";
import Audio from "./Audio";
import WeightGroup from "./WeightGroup";
import Scene from "./Scene";

export const saveDir = path.join(remote.app.getPath('appData'), 'flipflip');
export const savePath = path.join(saveDir, 'data.json');
export const portablePath = path.join(path.dirname(remote.app.getAppPath()), 'data.json');

export function getEaseFunction(ea: string, exp: number, amp: number, per: number, ov: number) {
  switch(ea) {
    case EA.linear:
      return easings.easeLinear;
    case EA.sinIn:
      return easings.easeSinIn;
    case EA.sinOut:
      return easings.easeSinOut;
    case EA.sinInOut:
      return easings.easeSinInOut;
    case EA.expIn:
      return easings.easeExpIn;
    case EA.expOut:
      return easings.easeExpOut;
    case EA.expInOut:
      return easings.easeExpInOut;
    case EA.circleIn:
      return easings.easeCircleIn;
    case EA.circleOut:
      return easings.easeCircleOut;
    case EA.circleInOut:
      return easings.easeCircleInOut;
    case EA.bounceIn:
      return easings.easeBounceIn;
    case EA.bounceOut:
      return easings.easeBounceOut;
    case EA.bounceInOut:
      return easings.easeBounceInOut;
    case EA.polyIn:
      return easings.easePolyIn.exponent(exp);
    case EA.polyOut:
      return easings.easePolyOut.exponent(exp);
    case EA.polyInOut:
      return easings.easePolyInOut.exponent(exp);
    case EA.elasticIn:
      return easings.easeElasticIn.amplitude(amp).period(per);
    case EA.elasticOut:
      return easings.easeElasticOut.amplitude(amp).period(per);
    case EA.elasticInOut:
      return easings.easeElasticInOut.amplitude(amp).period(per);
    case EA.backIn:
      return easings.easeBackIn.overshoot(ov);
    case EA.backOut:
      return easings.easeBackOut.overshoot(ov);
    case EA.backInOut:
      return easings.easeBackInOut.overshoot(ov);

  }
}

export function getBackups(): Array<{url: string, size: number}> {
  const files = fs.readdirSync(saveDir);
  const backups = Array<any>();
  for (let file of files) {
    if (file.startsWith("data.json.")) {
      const stats = fs.statSync(saveDir + "/" + file);
      backups.push({url: file, size: stats.size});
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

export function convertFromEpoch(backupFile: string) {
  const epochString = backupFile.substring(backupFile.lastIndexOf(".") + 1);
  const date = new Date(Number.parseInt(epochString));
  return date.toLocaleString();
}

export function getTimingFromString(tf: string): string {
  switch(tf) {
    case "constant":
    case "const":
      return TF.constant;
    case "random":
    case "rand":
      return  TF.random;
    case "wave":
    case "sin":
      return  TF.sin;
    case "bpm":
    case "audio":
      return  TF.bpm;
    case "scene":
      return  TF.scene;
    default:
      return null;
  }
}

export function getTimeout(tf: string, c: number, min: number, max: number, sinRate: number,
                           audio: Audio, bpmMulti: number, timeToNextFrame: number): number {
  let timeout = null;
  switch (tf) {
    case TF.random:
      timeout = Math.floor(Math.random() * (max - min + 1)) + min;
      break;
    case TF.sin:
      sinRate = (Math.abs(sinRate - 100) + 2) * 1000;
      timeout = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (max - min + 1)) + min;
      break;
    case TF.constant:
      timeout = c;
      break;
    case TF.bpm:
      if (!audio) {
        timeout = 1000;
      } else {
        timeout = 60000 / (audio.bpm * bpmMulti);
        // If we cannot parse this, default to 1s
        if (!timeout) {
          timeout = 1000;
        }
      }
      break;
    case TF.scene:
      timeout = timeToNextFrame ? timeToNextFrame : 1000;
      break;
  }
  return timeout;
}

export function getTimestamp(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor(secs % 3600 / 60);
  const seconds = Math.floor(secs % 3600 % 60);
  if (hours > 0) {
    return hours + ":" + (minutes >= 10 ? minutes : "0" + minutes) + ":" + (seconds >= 10 ? seconds : "0" + seconds);
  } else {
    return minutes + ":" + (seconds >= 10 ? seconds : "0" + seconds);
  }
}

export function getMsRemainder(sec: number): string {
  if (isNaN(sec) || sec < 0) {
    return null;
  }

  const ms = Math.round(sec * 1000);
  let remainder = (Math.floor((ms % 1000) * 1000) / 1000).toString();
  while (remainder.length < 3) {
    remainder = "0" + remainder;
  }
  return "." + remainder;
}

export function getMsTimestampValue(value: string): number {
  const split = value.split(":");
  const splitInt = [];
  let milli = null;
  if (split.length > 3 || split.length == 0) return null;
  if (split[split.length - 1].includes(".")) {
    const splitMili = split[split.length - 1].split("\.");
    if (splitMili.length > 2) return null;
    split[split.length - 1] = splitMili[0];
    milli = splitMili[1];
    if (milli.length > 3) return null;
    while (milli.length < 3) {
      milli += "0";
    }
    milli = parseInt(milli);
    if (isNaN(milli)) return null;
  }
  for (let n = 0; n < split.length; n++) {
    if (n != 0) {
      if (split[n].length != 2) return null;
    }
    const int = parseInt(split[n]);
    if (isNaN(int)) return null;
    splitInt.push(int);
  }

  let ms;
  if (split.length == 3) {
    ms = (splitInt[0] * 60 * 60) + (splitInt[1] * 60) + splitInt[2];
  } else if (split.length == 2) {
    ms = (splitInt[0] * 60) + splitInt[1];
  } else if (split.length == 1) {
    ms = splitInt[0];
  }
  ms *= 1000;
  if (milli != null) {
    ms += milli;
  }
  return ms;
}

export function getTimestampValue(value: string): number {
  const split = value.split(":");
  const splitInt = [];
  if (split.length > 3 || split.length == 0) return null;
  for (let n = 0; n < split.length; n++) {
    if (n != 0) {
      if (split[n].length != 2) return null;
    }
    const int = parseInt(split[n]);
    if (isNaN(int)) return null;
    splitInt.push(int);
  }

  if (split.length == 3) {
    return (splitInt[0] * 60 * 60) + (splitInt[1] * 60) + splitInt[2];
  } else if (split.length == 2) {
    return (splitInt[0] * 60) + splitInt[1];
  } else if (split.length == 1) {
    return splitInt[0];
  }
}

export function generateThumbnailFile(cachePath: string, data: Buffer): string {
  let checksumThumbnailPath = cachePath;
  if (!checksumThumbnailPath.endsWith(path.sep)) {
    checksumThumbnailPath += path.sep;
  }
  checksumThumbnailPath += "thumbs" + path.sep;
  if (!fs.existsSync(checksumThumbnailPath)) {
    fs.mkdirSync(checksumThumbnailPath);
  }
  const checksum = crypto.createHash('md5').update(data).digest('hex');
  checksumThumbnailPath += checksum + ".png";
  if (!fs.existsSync(checksumThumbnailPath)) {
    fs.writeFileSync(checksumThumbnailPath, data);
  }
  return checksumThumbnailPath;
}

export function extractMusicMetadata(audio: Audio, metadata: any, cachePath: string) {
  if (metadata.common) {
    if (metadata.common.title) {
      audio.name = metadata.common.title;
    }
    if (metadata.common.album) {
      audio.album = metadata.common.album;
    }
    if (metadata.common.artist) {
      audio.artist = metadata.common.artist;
    }
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      audio.thumb = generateThumbnailFile(cachePath, metadata.common.picture[0].data);
    }
    if (metadata.common.track && metadata.common.track.no) {
      audio.trackNum = parseInt(metadata.common.track.no);
    }
    if (metadata.common.bpm) {
      audio.bpm = parseInt(metadata.common.bpm);
    }
  }
  if (metadata.format && metadata.format.duration) {
    audio.duration = metadata.format.duration;
  } else {
    const data = toArrayBuffer(fs.readFileSync(audio.url));
    let context = new AudioContext();
    context.decodeAudioData(data, (buffer) => {
      audio.duration = buffer.duration;
    });
  }
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
        return baseDir + typeDir + path.sep + getFileGroup(source) + path.sep;
      } else {
        return baseDir + typeDir + path.sep;
      }
    } else {
      return baseDir;
    }
  } else {
    if (source) {
      if (source != ST.video && source != ST.playlist) {
        return saveDir + path.sep + "ImageCache" + path.sep + typeDir + path.sep + getFileGroup(source) + path.sep;
      } else {
        return saveDir + path.sep + "ImageCache" + path.sep + typeDir + path.sep;
      }
    } else {
      return saveDir + path.sep + "ImageCache" + path.sep;
    }
  }
}

export function htmlEntities(str: string): string {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\\n/g,"<br/>");
}

export function urlToPath(url: string): string {
  const path = new URL(url).pathname;
  if (process.platform === "win32") {
    return decodeURIComponent(path.substring(1, path.length));
  } else {
    return decodeURIComponent(path);
  }
}

export function removeDuplicatesBy(keyFn: Function, array: any[]): any[] {
  let mySet = new Set();
  return array.filter(function (x: any) {
    let key = keyFn(x);
    let isNew = !mySet.has(key);
    if (isNew) mySet.add(key);
    return isNew;
  });
}

export function arrayMove(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
}

export function toArrayBuffer(buf: Buffer) {
  let ab = new ArrayBuffer(buf.length);
  let view = new Uint8Array(ab);
  for (let j = 0; j < buf.length; ++j) {
    view[j] = buf[j];
  }
  return ab;
}

export function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function randomizeList(list: any[]) {
  let currentIndex = list.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = list[currentIndex];
    list[currentIndex] = list[randomIndex];
    list[randomIndex] = temporaryValue;
  }

  return list;
}

export function getRandomIndex(list: any[]) {
  return Math.floor(Math.random() * list.length)
}

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomListItem(list: any[], count: number = 1) {
  if (count <= 0) {
    return;
  } else if (count == 1) {
    return list[getRandomIndex(list)];
  } else {
    let newList = [];
    for (let c = 0; c < count && list.length > 0; c++) {
      newList.push(list.splice(getRandomIndex(list), 1)[0])
    }
    return newList;
  }
}

export function getFilesRecursively(path: string): string[] {
  const isDirectory = (path: string) => fs.statSync(path).isDirectory();
  const getDirectories = (path: string) =>
    fs.readdirSync(path).map(name => Path.join(path, name)).filter(isDirectory);

  const isFile = (path: string) => fs.statSync(path).isFile();
  const getFiles = (path: string) =>
    fs.readdirSync(path).map(name => Path.join(path, name)).filter(isFile);

  let dirs = getDirectories(path);
  let files = dirs
    .map(dir => getFilesRecursively(dir)) // go through each directory
    .reduce((a,b) => a.concat(b), []);    // map returns a 2d array (array of file arrays) so flatten
  return files.concat(getFiles(path));
}

export function isText(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [".txt"];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

function areRulesValid(wg: WeightGroup) {
  let rulesHasAll = false;
  let rulesHasWeight = false;
  let rulesRemaining = 100;
  for (let rule of wg.rules) {
    if (rule.type == TT.weight) {
      rulesRemaining = rulesRemaining - rule.percent;
      rulesHasWeight = true;
    }
    if (rule.type == TT.all) {
      rulesHasAll = true;
    }
  }
  return (rulesRemaining == 100 && rulesHasAll && !rulesHasWeight) || rulesRemaining == 0;
}

export function areWeightsValid(scene: Scene): boolean {
  if (!scene.generatorWeights) return false;
  let remaining = 100;
  let hasAll = false;
  let hasWeight = false;
  for (let wg of scene.generatorWeights) {
    if (wg.rules) {
      const rulesValid = areRulesValid(wg);
      if (!rulesValid) return false;
    }
    if (wg.type == TT.weight) {
      remaining = remaining - wg.percent;
      hasWeight = true;
    }
    if (wg.type == TT.all) {
      hasAll = true;
    }
  }

  return (remaining == 100 && hasAll && !hasWeight) || remaining == 0;
}

let captionProgramDefaults = {
  program: Array<Function>(),
  programCounter: 0,
  timestamps: Array<number>(),
  timestampFn: new Map<number, Array<Function>>(),
  timestampCounter: 0,
  audios: new Array<{alias: string, file: string, playing: boolean, volume: number}>(),
  phrases: new Map<number, Array<string>>(),

  blinkDuration: [200, 500],
  blinkWaveRate: 100,
  blinkBPMMulti: 1,
  blinkTF: TF.constant,

  blinkDelay: [80, 200],
  blinkDelayWaveRate: 100,
  blinkDelayBPMMulti: 1,
  blinkDelayTF: TF.constant,

  blinkGroupDelay: [1200, 2000],
  blinkGroupDelayWaveRate: 100,
  blinkGroupDelayBPMMulti: 1,
  blinkGroupDelayTF: TF.constant,

  captionDuration: [2000, 4000],
  captionWaveRate: 100,
  captionBPMMulti: 1,
  captionTF: TF.constant,

  captionDelay: [1200, 2000],
  captionDelayWaveRate: 100,
  captionDelayBPMMulti: 1,
  captionDelayTF: TF.constant,

  countDuration: [600, 1000],
  countWaveRate: 100,
  countBPMMulti: 1,
  countTF: TF.constant,

  countDelay: [400, 1000],
  countDelayWaveRate: 100,
  countDelayBPMMulti: 1,
  countDelayTF: TF.constant,

  showCountProgress: false,
  countProgressOffset: false,
  countColorMatch: false,
  countProgressScale: 500,

  countGroupDelay: [1200, 2000],
  countGroupDelayWaveRate: 100,
  countGroupDelayBPMMulti: 1,
  countGroupDelayTF: TF.constant,

  blinkY: 0,
  captionY: 0,
  bigCaptionY: 0,
  countY: 0,

  blinkX: 0,
  captionX: 0,
  bigCaptionX: 0,
  countX: 0,

  blinkOpacity: 100,
  captionOpacity: 100,
  countOpacity: 100,
}
export default captionProgramDefaults;

// Inspired by https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
/**
 * This object is a custom Promise wrapper which enables the ability to cancel the promise.
 *
 * In order to assist with processing the next promise, this promise returns a list of strings as well as a
 * helper object used to build the next promise. This helper object can have the follow values:
 *   * next - null or a value to use in the follow-up promise
 *   * count - current count
 */
export class CancelablePromise extends Promise<{
  data: Array<string>, helpers: {next: any, count: number, retries: number, uuid: string}}> {
  hasCanceled: boolean;
  source: LibrarySource;
  timeout: number;


  constructor(executor: (resolve: (value?: (
    PromiseLike<{data: Array<string>, helpers: {next: any, count: number, retries: number, uuid: string}}> |
    {data: Array<string>, helpers: {next: any, count: number, retries: number, uuid: string}}
    )) => void, reject: (reason?: any) => void) => void) {
    super(executor);
    this.hasCanceled = false;
    this.source = null;
    this.timeout = 0;
  }

  getPromise(): Promise<{data: Array<string>, helpers: {next: any, count: number, retries: number, uuid: string}}> {
    return new Promise((resolve, reject) => {
      this.then(
        val => this.hasCanceled ? null : resolve(val),
        error => this.hasCanceled ? null : reject(error)
      );
    });
  }

  cancel() {
    this.hasCanceled = true;
  }
}