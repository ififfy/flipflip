import {remote} from "electron";
import {URL} from "url";
import path from 'path';
import * as fs from "fs";
import * as Path from "path";
import * as easings from 'd3-ease';
import crypto from "crypto";

import {getFileGroup, getSourceType} from "../components/player/Scrapers";
import {BT, EA, GO, HTF, IF, IT, OF, OT, SC, SL, SOF, ST, STF, TF, TT, VO, VTF, WF} from "./const";
import en from "./en";
import Config from "./Config";
import LibrarySource from "./LibrarySource";
import Audio from "./Audio";
import WeightGroup from "./WeightGroup";
import Scene from "./Scene";
import Clip from "./Clip";

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
    if (file.startsWith("data.json.") && file != "data.json.new") {
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
      audio.bpm = parseFloat(metadata.common.bpm);
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
  const orRules = wg.rules.filter((r) => r.type == TT.or);
  const weightRules = wg.rules.filter((r) => r.type == TT.weight);
  let rulesRemaining = 100;
  for (let rule of weightRules) {
    rulesRemaining = rulesRemaining - rule.percent;
  }
  return wg.rules.length > 0 && (orRules.length == 0 || (orRules.length + weightRules.length == wg.rules.length && rulesRemaining == 0) || orRules.length == wg.rules.length) && (rulesRemaining == 0 || (rulesRemaining == 100 && weightRules.length == 0));
}

export function areWeightsValid(scene: Scene): boolean {
  if (!scene.generatorWeights) return false;
  let remaining = 100;
  const orRules = scene.generatorWeights.filter((r) => r.type == TT.or);
  const weightRules = scene.generatorWeights.filter((r) => r.type == TT.weight);
  for (let wg of scene.generatorWeights) {
    if (wg.rules) {
      const rulesValid = areRulesValid(wg);
      if (!rulesValid) return false;
    }
    if (wg.type == TT.weight) {
      remaining = remaining - wg.percent;
    }
  }
  return scene.generatorWeights.length > 0 && (orRules.length == 0 || (orRules.length + weightRules.length == scene.generatorWeights.length && remaining == 0) || orRules.length == scene.generatorWeights.length) && (remaining == 0 || (remaining == 100 && weightRules.length == 0));
}

export function filterSource(filter: string, source: LibrarySource, clip: Clip, mergeSources?: Array<LibrarySource>): boolean {
  let matchesFilter = true;
  let countRegex;
  if (filter == "<Mergeable>") {
    matchesFilter = !!mergeSources && mergeSources.includes(source);
  } else if (filter == "<Offline>") { // This is offline filter
    matchesFilter = source.offline;
  } else if (filter == "<Marked>") { // This is a marked filter
    matchesFilter = source.marked;
  } else if (filter == "<Untagged>") { // This is untagged filter
    matchesFilter = clip && clip.tags && clip.tags.length > 0 ? clip.tags.length === 0 : source.tags.length === 0;
  } else if (filter == "<Unclipped>") {
    matchesFilter = getSourceType(source.url) == ST.video && source.clips.length === 0;
  } else if ((filter.startsWith("[") || filter.startsWith("-[")) && filter.endsWith("]")) { // This is a tag filter
    let tags = clip && clip.tags && clip.tags.length > 0 ? clip.tags : source.tags;
    if (filter.startsWith("-")) {
      let tag = filter.substring(2, filter.length-1);
      matchesFilter = tags.find((t) => t.name == tag) == null;
    } else {
      let tag = filter.substring(1, filter.length-1);
      matchesFilter = tags.find((t) => t.name == tag) != null;
    }
  } else if ((filter.startsWith("{") || filter.startsWith("-{")) && filter.endsWith("}")) { // This is a type filter
    if (filter.startsWith("-")) {
      let type = filter.substring(2, filter.length-1);
      matchesFilter = en.get(getSourceType(source.url)) != type;
    } else {
      let type = filter.substring(1, filter.length-1);
      matchesFilter = en.get(getSourceType(source.url)) == type;
    }
  } else if ((countRegex = /^count(\+?)([>=<])(\d*)$/.exec(filter)) != null) {
    const all = countRegex[1] == "+";
    const symbol = countRegex[2];
    const value = parseInt(countRegex[3]);
    const type = getSourceType(source.url);
    const count = type == ST.video ? source.clips.length : source.count;
    const countComplete = type == ST.video ? true : source.countComplete;
    switch (symbol) {
      case "=":
        matchesFilter = (all || countComplete) && count == value;
        break;
      case ">":
        matchesFilter = (all || countComplete) && count > value;
        break;
      case "<":
        matchesFilter = (all || countComplete) && count < value;
        break;
    }
  } else if ((countRegex = /^duration([>=<])([\d:]*)$/.exec(filter)) != null) {
    const symbol = countRegex[1];
    let value;
    if (countRegex[2].includes(":")) {
      value = getTimestampValue(countRegex[2]);
    } else {
      value = parseInt(countRegex[2]);
    }
    const type = getSourceType(source.url);
    if (type == ST.video) {
      let duration = clip ? clip.end - clip.start : source.duration;
      if (duration == null) {
        matchesFilter = false;
      } else {
        switch (symbol) {
          case "=":
            matchesFilter = Math.floor(duration) == value;
            break;
          case ">":
            matchesFilter = Math.floor(duration) > value;
            break;
          case "<":
            matchesFilter = Math.floor(duration) < value;
            break;
        }
      }
    } else {
      matchesFilter = false;
    }
  } else if ((countRegex = /^resolution([>=<])(\d*)p?$/.exec(filter)) != null) {
    const symbol = countRegex[1];
    const value = parseInt(countRegex[2]);

    const type = getSourceType(source.url);
    if (type == ST.video) {
      if (source.resolution == null) {
        matchesFilter = false;
      } else {
        switch (symbol) {
          case "=":
            matchesFilter = source.resolution == value;
            break;
          case ">":
            matchesFilter = source.resolution > value;
            break;
          case "<":
            matchesFilter = source.resolution < value;
            break;
        }
      }
    } else {
      matchesFilter = false;
    }
  } else if (((filter.startsWith('"') || filter.startsWith('-"')) && filter.endsWith('"')) ||
    ((filter.startsWith('\'') || filter.startsWith('-\'')) && filter.endsWith('\''))) {
    if (filter.startsWith("-")) {
      filter = filter.substring(2, filter.length - 1);
      const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
      matchesFilter = !regex.test(source.url);
    } else {
      filter = filter.substring(1, filter.length - 1);
      const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
      matchesFilter = regex.test(source.url);
    }
  } else { // This is a search filter
    filter = filter.replace("\\", "\\\\");
    if (filter.startsWith("-")) {
      filter = filter.substring(1, filter.length);
      const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
      matchesFilter = !regex.test(source.url);
    } else {
      const regex = new RegExp(filter.replace("\\", "\\\\"), "i");
      matchesFilter = regex.test(source.url);
    }
  }
  return matchesFilter;
}

export function getEffects(scene: Scene) {
  const effects = [];
  effects.push(Object.values(TF).indexOf(scene.timingFunction));
  effects.push(scene.timingConstant);
  effects.push(scene.timingMin);
  effects.push(scene.timingMax);
  effects.push(scene.timingSinRate);
  effects.push(scene.timingBPMMulti);
  effects.push(scene.backForth ? 1 : 0);
  effects.push(Object.values(TF).indexOf(scene.backForthTF));
  effects.push(scene.backForthConstant);
  effects.push(scene.backForthMin);
  effects.push(scene.backForthMax);
  effects.push(scene.backForthSinRate);
  effects.push(scene.backForthBPMMulti);
  effects.push(Object.values(IT).indexOf(scene.imageType));
  effects.push(Object.values(BT).indexOf(scene.backgroundType));
  effects.push(scene.backgroundColor);
  effects.push(scene.backgroundColorSet.join("|"));
  effects.push(scene.backgroundBlur);

  effects.push(Object.values(IF).indexOf(scene.imageTypeFilter));
  effects.push(scene.fullSource ? 1 : 0);
  effects.push(Object.values(OT).indexOf(scene.imageOrientation));
  effects.push(Object.values(GO).indexOf(scene.gifOption));
  effects.push(scene.gifTimingConstant);
  effects.push(scene.gifTimingMin);
  effects.push(scene.gifTimingMax);
  effects.push(Object.values(OT).indexOf(scene.videoOrientation));
  effects.push(Object.values(VO).indexOf(scene.videoOption));
  effects.push(scene.videoTimingConstant);
  effects.push(scene.videoTimingMin);
  effects.push(scene.videoTimingMax);
  effects.push(scene.videoSpeed);
  effects.push(scene.videoRandomSpeed ? 1 : 0);
  effects.push(scene.videoSpeedMin);
  effects.push(scene.videoSpeedMax);
  effects.push(scene.randomVideoStart ? 1 : 0);
  effects.push(scene.continueVideo ? 1 : 0);
  effects.push(scene.playVideoClips ? 1 : 0);
  effects.push(scene.skipVideoStart);
  effects.push(scene.skipVideoEnd);
  effects.push(scene.videoVolume);
  effects.push(Object.values(WF).indexOf(scene.weightFunction));
  effects.push(Object.values(SOF).indexOf(scene.sourceOrderFunction));
  effects.push(scene.forceAllSource ? 1 : 0);
  effects.push(Object.values(OF).indexOf(scene.orderFunction));
  effects.push(scene.forceAll ? 1 : 0);

  effects.push(scene.zoom ? 1 : 0);
  effects.push(scene.zoomRandom ? 1 : 0);
  effects.push(scene.zoomStart);
  effects.push(scene.zoomStartMin);
  effects.push(scene.zoomStartMax);
  effects.push(scene.zoomEnd);
  effects.push(scene.zoomEndMin);
  effects.push(scene.zoomEndMax);
  effects.push(Object.values(HTF).indexOf(scene.horizTransType));
  effects.push(scene.horizTransLevel);
  effects.push(scene.horizTransLevelMin);
  effects.push(scene.horizTransLevelMax);
  effects.push(scene.horizTransRandom ? 1 : 0);
  effects.push(Object.values(VTF).indexOf(scene.vertTransType));
  effects.push(scene.vertTransLevel);
  effects.push(scene.vertTransLevelMin);
  effects.push(scene.vertTransLevelMax);
  effects.push(scene.vertTransRandom ? 1 : 0);
  effects.push(Object.values(TF).indexOf(scene.transTF));
  effects.push(scene.transDuration);
  effects.push(scene.transDurationMin);
  effects.push(scene.transDurationMax);
  effects.push(scene.transSinRate);
  effects.push(scene.transBPMMulti);
  effects.push(Object.values(EA).indexOf(scene.transEase));
  effects.push(scene.transExp);
  effects.push(scene.transAmp);
  effects.push(scene.transPer);
  effects.push(scene.transOv);

  effects.push(scene.crossFade ? 1 : 0);
  effects.push(scene.crossFadeAudio ? 1 : 0);
  effects.push(Object.values(TF).indexOf(scene.fadeTF));
  effects.push(scene.fadeDuration);
  effects.push(scene.fadeDurationMin);
  effects.push(scene.fadeDurationMax);
  effects.push(scene.fadeSinRate);
  effects.push(scene.fadeBPMMulti);
  effects.push(Object.values(EA).indexOf(scene.fadeEase));
  effects.push(scene.fadeExp);
  effects.push(scene.fadeAmp);
  effects.push(scene.fadePer);
  effects.push(scene.fadeOv);

  effects.push(scene.slide ? 1 : 0);
  effects.push(Object.values(TF).indexOf(scene.slideTF));
  effects.push(Object.values(STF).indexOf(scene.slideType));
  effects.push(scene.slideDistance);
  effects.push(scene.slideDuration);
  effects.push(scene.slideDurationMin);
  effects.push(scene.slideDurationMax);
  effects.push(scene.slideSinRate);
  effects.push(scene.slideBPMMulti);
  effects.push(Object.values(EA).indexOf(scene.slideEase));
  effects.push(scene.slideExp);
  effects.push(scene.slideAmp);
  effects.push(scene.slidePer);
  effects.push(scene.slideOv);

  effects.push(scene.strobe ? 1 : 0);
  effects.push(scene.strobePulse ? 1 : 0);
  effects.push(Object.values(SL).indexOf(scene.strobeLayer));
  effects.push(scene.strobeOpacity);
  effects.push(Object.values(TF).indexOf(scene.strobeTF));
  effects.push(scene.strobeTime);
  effects.push(scene.strobeTimeMin);
  effects.push(scene.strobeTimeMax);
  effects.push(scene.strobeSinRate);
  effects.push(scene.strobeBPMMulti);
  effects.push(Object.values(TF).indexOf(scene.strobeDelayTF));
  effects.push(scene.strobeDelay);
  effects.push(scene.strobeDelayMin);
  effects.push(scene.strobeDelayMax);
  effects.push(scene.strobeDelaySinRate);
  effects.push(scene.strobeDelayBPMMulti);
  effects.push(Object.values(SC).indexOf(scene.strobeColorType));
  effects.push(scene.strobeColor);
  effects.push(scene.strobeColorSet.join("|"));
  effects.push(Object.values(EA).indexOf(scene.strobeEase));
  effects.push(scene.strobeExp);
  effects.push(scene.strobeAmp);
  effects.push(scene.strobePer);
  effects.push(scene.strobeOv);

  effects.push(scene.fadeInOut ? 1 : 0);
  effects.push(scene.fadeIOPulse ? 1 : 0);
  effects.push(Object.values(TF).indexOf(scene.fadeIOTF));
  effects.push(scene.fadeIODuration);
  effects.push(scene.fadeIODurationMin);
  effects.push(scene.fadeIODurationMax);
  effects.push(scene.fadeIOSinRate);
  effects.push(scene.fadeIOBPMMulti);
  effects.push(Object.values(TF).indexOf(scene.fadeIODelayTF));
  effects.push(scene.fadeIODelay);
  effects.push(scene.fadeIODelayMin);
  effects.push(scene.fadeIODelayMax);
  effects.push(scene.fadeIODelaySinRate);
  effects.push(scene.fadeIODelayBPMMulti);
  effects.push(Object.values(EA).indexOf(scene.fadeIOStartEase));
  effects.push(scene.fadeIOStartExp);
  effects.push(scene.fadeIOStartAmp);
  effects.push(scene.fadeIOStartPer);
  effects.push(scene.fadeIOStartOv);
  effects.push(Object.values(EA).indexOf(scene.fadeIOEndEase));
  effects.push(scene.fadeIOEndExp);
  effects.push(scene.fadeIOEndAmp);
  effects.push(scene.fadeIOEndPer);
  effects.push(scene.fadeIOEndOv);

  effects.push(scene.panning ? 1 : 0);
  effects.push(Object.values(TF).indexOf(scene.panTF));
  effects.push(scene.panDuration);
  effects.push(scene.panDurationMin);
  effects.push(scene.panDurationMax);
  effects.push(scene.panSinRate);
  effects.push(scene.panBPMMulti);
  effects.push(Object.values(HTF).indexOf(scene.panHorizTransType));
  effects.push(scene.panHorizTransImg ? 1 : 0);
  effects.push(scene.panHorizTransLevel);
  effects.push(scene.panHorizTransLevelMax);
  effects.push(scene.panHorizTransLevelMin);
  effects.push(scene.panHorizTransRandom ? 1 : 0);
  effects.push(Object.values(VTF).indexOf(scene.panVertTransType));
  effects.push(scene.panVertTransImg ? 1 : 0);
  effects.push(scene.panVertTransLevel);
  effects.push(scene.panVertTransLevelMax);
  effects.push(scene.panVertTransLevelMin);
  effects.push(scene.panVertTransRandom ? 1 : 0);
  effects.push(Object.values(EA).indexOf(scene.panStartEase));
  effects.push(scene.panStartExp);
  effects.push(scene.panStartAmp);
  effects.push(scene.panStartPer);
  effects.push(scene.panStartOv);
  effects.push(Object.values(EA).indexOf(scene.panEndEase));
  effects.push(scene.panEndExp);
  effects.push(scene.panEndAmp);
  effects.push(scene.panEndPer);
  effects.push(scene.panEndOv);

  // Add future items here

  return Buffer.from(effects.join(",")).toString('base64').slice(0, -1);
}

export function applyEffects(scene: Scene, base64String: string) {
  base64String += '=';
  const effectsString = atob(base64String);
  const effects = effectsString.split(",");

  scene.timingFunction = Object.values(TF)[parseInt(effects.shift())];
  scene.timingConstant = parseInt(effects.shift());
  scene.timingMin = parseInt(effects.shift());
  scene.timingMax = parseInt(effects.shift());
  scene.timingSinRate = parseInt(effects.shift());
  scene.timingBPMMulti = parseInt(effects.shift());
  scene.backForth = parseInt(effects.shift()) == 1;
  scene.backForthTF = Object.values(TF)[parseInt(effects.shift())];
  scene.backForthConstant = parseInt(effects.shift());
  scene.backForthMin = parseInt(effects.shift());
  scene.backForthMax = parseInt(effects.shift());
  scene.backForthSinRate = parseInt(effects.shift());
  scene.backForthBPMMulti = parseInt(effects.shift());
  scene.imageType = Object.values(IT)[parseInt(effects.shift())];
  scene.backgroundType = Object.values(BT)[parseInt(effects.shift())];
  scene.backgroundColor = effects.shift();
  scene.backgroundColorSet = effects.shift().split("|");
  scene.backgroundBlur = parseInt(effects.shift());

  scene.imageTypeFilter = Object.values(IF)[parseInt(effects.shift())];
  scene.fullSource = parseInt(effects.shift()) == 1;
  scene.imageOrientation = Object.values(OT)[parseInt(effects.shift())];
  scene.gifOption = Object.values(GO)[parseInt(effects.shift())];
  scene.gifTimingConstant = parseInt(effects.shift());
  scene.gifTimingMin = parseInt(effects.shift());
  scene.gifTimingMax = parseInt(effects.shift());
  scene.videoOrientation = Object.values(OT)[parseInt(effects.shift())];
  scene.videoOption = Object.values(VO)[parseInt(effects.shift())];
  scene.videoTimingConstant = parseInt(effects.shift());
  scene.videoTimingMin = parseInt(effects.shift());
  scene.videoTimingMax = parseInt(effects.shift());
  scene.videoSpeed = parseInt(effects.shift());
  scene.videoRandomSpeed = parseInt(effects.shift()) == 1;
  scene.videoSpeedMin = parseInt(effects.shift());
  scene.videoSpeedMax = parseInt(effects.shift());
  scene.randomVideoStart = parseInt(effects.shift()) == 1;
  scene.continueVideo = parseInt(effects.shift()) == 1;
  scene.playVideoClips = parseInt(effects.shift()) == 1;
  scene.skipVideoStart = parseInt(effects.shift());
  scene.skipVideoEnd = parseInt(effects.shift());
  scene.videoVolume = parseInt(effects.shift());
  scene.weightFunction = Object.values(WF)[parseInt(effects.shift())];
  scene.sourceOrderFunction = Object.values(SOF)[parseInt(effects.shift())];
  scene.forceAllSource = parseInt(effects.shift()) == 1;
  scene.orderFunction = Object.values(OF)[parseInt(effects.shift())];
  scene.forceAll = parseInt(effects.shift()) == 1;

  scene.zoom = parseInt(effects.shift()) == 1;
  scene.zoomRandom = parseInt(effects.shift()) == 1;
  scene.zoomStart = parseFloat(effects.shift());
  scene.zoomStartMin = parseFloat(effects.shift());
  scene.zoomStartMax = parseFloat(effects.shift());
  scene.zoomEnd = parseFloat(effects.shift());
  scene.zoomEndMin = parseFloat(effects.shift());
  scene.zoomEndMax = parseFloat(effects.shift());
  scene.horizTransType = Object.values(HTF)[parseInt(effects.shift())];
  scene.horizTransLevel = parseInt(effects.shift());
  scene.horizTransLevelMin = parseInt(effects.shift());
  scene.horizTransLevelMax = parseInt(effects.shift());
  scene.horizTransRandom = parseInt(effects.shift()) == 1;
  scene.vertTransType = Object.values(VTF)[parseInt(effects.shift())];
  scene.vertTransLevel = parseInt(effects.shift());
  scene.vertTransLevelMin = parseInt(effects.shift());
  scene.vertTransLevelMax = parseInt(effects.shift());
  scene.vertTransRandom = parseInt(effects.shift()) == 1;
  scene.transTF = Object.values(TF)[parseInt(effects.shift())];
  scene.transDuration = parseInt(effects.shift());
  scene.transDurationMin = parseInt(effects.shift());
  scene.transDurationMax = parseInt(effects.shift());
  scene.transSinRate = parseInt(effects.shift());
  scene.transBPMMulti = parseInt(effects.shift());
  scene.transEase = Object.values(EA)[parseInt(effects.shift())];
  scene.transExp = parseInt(effects.shift());
  scene.transAmp = parseInt(effects.shift());
  scene.transPer = parseInt(effects.shift());
  scene.transOv = parseInt(effects.shift());

  scene.crossFade = parseInt(effects.shift()) == 1;
  scene.crossFadeAudio = parseInt(effects.shift()) == 1;
  scene.fadeTF = Object.values(TF)[parseInt(effects.shift())];
  scene.fadeDuration = parseInt(effects.shift());
  scene.fadeDurationMin = parseInt(effects.shift());
  scene.fadeDurationMax = parseInt(effects.shift());
  scene.fadeSinRate = parseInt(effects.shift());
  scene.fadeBPMMulti = parseInt(effects.shift());
  scene.fadeEase = Object.values(EA)[parseInt(effects.shift())];
  scene.fadeExp = parseInt(effects.shift());
  scene.fadeAmp = parseInt(effects.shift());
  scene.fadePer = parseInt(effects.shift());
  scene.fadeOv = parseInt(effects.shift());

  scene.slide = parseInt(effects.shift()) == 1;
  scene.slideTF = Object.values(TF)[parseInt(effects.shift())];
  scene.slideType = Object.values(STF)[parseInt(effects.shift())];
  scene.slideDistance = parseInt(effects.shift());
  scene.slideDuration = parseInt(effects.shift());
  scene.slideDurationMin = parseInt(effects.shift());
  scene.slideDurationMax = parseInt(effects.shift());
  scene.slideSinRate = parseInt(effects.shift());
  scene.slideBPMMulti = parseInt(effects.shift());
  scene.slideEase = Object.values(EA)[parseInt(effects.shift())];
  scene.slideExp = parseInt(effects.shift());
  scene.slideAmp = parseInt(effects.shift());
  scene.slidePer = parseInt(effects.shift());
  scene.slideOv = parseInt(effects.shift());

  scene.strobe = parseInt(effects.shift()) == 1;
  scene.strobePulse = parseInt(effects.shift()) == 1;
  scene.strobeLayer = Object.values(SL)[parseInt(effects.shift())];
  scene.strobeOpacity = parseFloat(effects.shift());
  scene.strobeTF = Object.values(TF)[parseInt(effects.shift())];
  scene.strobeTime = parseInt(effects.shift());
  scene.strobeTimeMin = parseInt(effects.shift());
  scene.strobeTimeMax = parseInt(effects.shift());
  scene.strobeSinRate = parseInt(effects.shift());
  scene.strobeBPMMulti = parseInt(effects.shift());
  scene.strobeDelayTF = Object.values(TF)[parseInt(effects.shift())];
  scene.strobeDelay = parseInt(effects.shift());
  scene.strobeDelayMin = parseInt(effects.shift());
  scene.strobeDelayMax = parseInt(effects.shift());
  scene.strobeDelaySinRate = parseInt(effects.shift());
  scene.strobeDelayBPMMulti = parseInt(effects.shift());
  scene.strobeColorType = Object.values(SC)[parseInt(effects.shift())];
  scene.strobeColor = effects.shift();
  scene.strobeColorSet = effects.shift().split("|");
  scene.strobeEase = Object.values(EA)[parseInt(effects.shift())];
  scene.strobeExp = parseInt(effects.shift());
  scene.strobeAmp = parseInt(effects.shift());
  scene.strobePer = parseInt(effects.shift());
  scene.strobeOv = parseInt(effects.shift());

  scene.fadeInOut = parseInt(effects.shift()) == 1;
  scene.fadeIOPulse = parseInt(effects.shift()) == 1;
  scene.fadeIOTF = Object.values(TF)[parseInt(effects.shift())];
  scene.fadeIODuration = parseInt(effects.shift());
  scene.fadeIODurationMin = parseInt(effects.shift());
  scene.fadeIODurationMax = parseInt(effects.shift());
  scene.fadeIOSinRate = parseInt(effects.shift());
  scene.fadeIOBPMMulti = parseInt(effects.shift());
  scene.fadeIODelayTF = Object.values(TF)[parseInt(effects.shift())];
  scene.fadeIODelay = parseInt(effects.shift());
  scene.fadeIODelayMin = parseInt(effects.shift());
  scene.fadeIODelayMax = parseInt(effects.shift());
  scene.fadeIODelaySinRate = parseInt(effects.shift());
  scene.fadeIODelayBPMMulti = parseInt(effects.shift());
  scene.fadeIOStartEase = Object.values(EA)[parseInt(effects.shift())];
  scene.fadeIOStartExp = parseInt(effects.shift());
  scene.fadeIOStartAmp = parseInt(effects.shift());
  scene.fadeIOStartPer = parseInt(effects.shift());
  scene.fadeIOStartOv = parseInt(effects.shift());
  scene.fadeIOEndEase = Object.values(EA)[parseInt(effects.shift())];
  scene.fadeIOEndExp = parseInt(effects.shift());
  scene.fadeIOEndAmp = parseInt(effects.shift());
  scene.fadeIOEndPer = parseInt(effects.shift());
  scene.fadeIOEndOv = parseInt(effects.shift());

  scene.panning = parseInt(effects.shift()) == 1;
  scene.panTF = Object.values(TF)[parseInt(effects.shift())];
  scene.panDuration = parseInt(effects.shift());
  scene.panDurationMin = parseInt(effects.shift());
  scene.panDurationMax = parseInt(effects.shift());
  scene.panSinRate = parseInt(effects.shift());
  scene.panBPMMulti = parseInt(effects.shift());
  scene.panHorizTransType = Object.values(HTF)[parseInt(effects.shift())];
  scene.panHorizTransImg = parseInt(effects.shift()) == 1;
  scene.panHorizTransLevel = parseInt(effects.shift());
  scene.panHorizTransLevelMax = parseInt(effects.shift());
  scene.panHorizTransLevelMin = parseInt(effects.shift());
  scene.panHorizTransRandom = parseInt(effects.shift()) == 1;
  scene.panVertTransType = Object.values(VTF)[parseInt(effects.shift())];
  scene.panVertTransImg = parseInt(effects.shift()) == 1;
  scene.panVertTransLevel = parseInt(effects.shift());
  scene.panVertTransLevelMax = parseInt(effects.shift());
  scene.panVertTransLevelMin = parseInt(effects.shift());
  scene.panVertTransRandom = parseInt(effects.shift()) == 1;
  scene.panStartEase = Object.values(EA)[parseInt(effects.shift())];
  scene.panStartExp = parseInt(effects.shift());
  scene.panStartAmp = parseInt(effects.shift());
  scene.panStartPer = parseInt(effects.shift());
  scene.panStartOv = parseInt(effects.shift());
  scene.panEndEase = Object.values(EA)[parseInt(effects.shift())];
  scene.panEndExp = parseInt(effects.shift());
  scene.panEndAmp = parseInt(effects.shift());
  scene.panEndPer = parseInt(effects.shift());
  scene.panEndOv = parseInt(effects.shift());

  if (effects.length != 0) {
    // Add future items here
  }

  return scene;
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