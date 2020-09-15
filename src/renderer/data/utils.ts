import {remote} from "electron";
import {URL} from "url";
import path from 'path';
import * as fs from "fs";
import wretch from "wretch";
import * as easings from 'd3-ease';
import crypto from "crypto";

import {EA, ST} from "./const";
import en from "./en";
import Config from "./Config";
import LibrarySource from "./LibrarySource";

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

export function getFileName(url: string, extension = true) {
  let sep;
  if (/^(https?:\/\/)|(file:\/\/)/g.exec(url) != null) {
    sep = "/"
  } else {
    sep = path.sep;
  }
  url = url.substring(url.lastIndexOf(sep) + 1);
  if (url.includes("?")) {
    url = url.substring(0, url.indexOf("?"));
  }
  if (!extension) {
    url = url.substring(0, url.lastIndexOf("."));
  }
  return url;
}

export function getSourceType(url: string): string {
  if (isAudio(url, false)) {
    return ST.audio;
  } else if (isVideo(url, false)) {
    return ST.video;
  } else if (isVideoPlaylist(url, true)) {
    return ST.playlist;
  } else if (/^https?:\/\/([^.]*|(66\.media))\.tumblr\.com/.exec(url) != null) {
    return ST.tumblr;
  } else if (/^https?:\/\/(www\.)?reddit\.com\//.exec(url) != null) {
    return ST.reddit;
  } else if (/^https?:\/\/(www\.)?imagefap\.com\//.exec(url) != null) {
    return ST.imagefap;
  } else if (/^https?:\/\/(www\.)?imgur\.com\//.exec(url) != null) {
    return ST.imgur;
  } else if (/^https?:\/\/(www\.)?(cdn\.)?sex\.com\//.exec(url) != null) {
    return ST.sexcom;
  } else if (/^https?:\/\/(www\.)?twitter\.com\//.exec(url) != null) {
    return ST.twitter;
  } else if (/^https?:\/\/(www\.)?deviantart\.com\//.exec(url) != null) {
    return ST.deviantart;
  } else if (/^https?:\/\/(www\.)?instagram\.com\//.exec(url) != null) {
    return ST.instagram;
  } else if (/^https?:\/\/(www\.)?(lolibooru\.moe|hypnohub\.net|danbooru\.donmai\.us|e621\.net)\//.exec(url) != null) {
    return ST.danbooru;
  } else if (/^https?:\/\/(www\.)?(gelbooru\.com|furry\.booru\.org|rule34\.xxx|realbooru\.com)\//.exec(url) != null) {
    return ST.gelbooru2;
  } else if (/^https?:\/\/(www\.)?(.*\.booru\.org)\//.exec(url) != null) {
    return ST.gelbooru1;
  } else if (/^https?:\/\/(www\.)?e-hentai\.org\/g\//.exec(url) != null) {
    return ST.ehentai;
  } else if (/(^https?:\/\/)|(\.txt$)/.exec(url) != null) { // Arbitrary URL, assume image list
    return ST.list;
  } else { // Directory
    return ST.local;
  }
}

export function getFileGroup(url: string) {
  let sep;
  switch (getSourceType(url)) {
    case ST.tumblr:
      let tumblrID = url.replace(/https?:\/\//, "");
      tumblrID = tumblrID.replace(/\.tumblr\.com\/?/, "");
      return tumblrID;
    case ST.reddit:
      let redditID = url;
      if (url.endsWith("/")) redditID = redditID.slice(0, url.lastIndexOf("/"));
      redditID = redditID.substring(redditID.lastIndexOf("/") + 1);
      return redditID;
    case ST.imagefap:
      let imagefapID = url.replace(/https?:\/\/www.imagefap.com\//, "");
      imagefapID = imagefapID.replace(/pictures\//, "");
      imagefapID = imagefapID.replace(/organizer\//, "");
      imagefapID = imagefapID.replace(/video\.php\?vid=/, "");
      imagefapID = imagefapID.split("/")[0];
      return imagefapID;
    case ST.sexcom:
      let sexcomID = url.replace(/https?:\/\/www.sex.com\//, "");
      sexcomID = sexcomID.replace(/user\//, "");
      sexcomID = sexcomID.split("?")[0];
      if (sexcomID.endsWith("/")) {
        sexcomID = sexcomID.substring(0, sexcomID.length - 1);
      }
      return sexcomID;
    case ST.imgur:
      let imgurID = url.replace(/https?:\/\/imgur.com\//, "");
      imgurID = imgurID.replace(/a\//, "");
      return imgurID;
    case ST.twitter:
      let twitterID = url.replace(/https?:\/\/twitter.com\//, "");
      if (twitterID.includes("?")) {
        twitterID = twitterID.substring(0, twitterID.indexOf("?"));
      }
      return twitterID;
    case ST.deviantart:
      let authorID = url.replace(/https?:\/\/www.deviantart.com\//, "");
      if (authorID.includes("/")) {
        authorID = authorID.substring(0, authorID.indexOf("/"));
      }
      return authorID;
    case ST.instagram:
      let instagramID = url.replace(/https?:\/\/www.instagram.com\//, "");
      if (instagramID.includes("/")) {
        instagramID = instagramID.substring(0, instagramID.indexOf("/"));
      }
      return instagramID;
    case ST.danbooru:
    case ST.gelbooru1:
    case ST.gelbooru2:
      const hostRegex = /^https?:\/\/(?:www\.)?([^.]*)\./g;
      const host =  hostRegex.exec(url)[1];
      let danbooruID = "";
      if (url.includes("/pool/")) {
        danbooruID = "pool" + url.substring(url.lastIndexOf("/"));
      } else {
        const tagRegex = /[?&]tags=(.*)&?/g;
        let tags;
        if ((tags = tagRegex.exec(url)) !== null) {
          danbooruID = tags[1];
        }
        const titleRegex = /[?&]title=(.*)&?/g;
        let title;
        if ((title = titleRegex.exec(url)) !== null) {
          if (tags == null) {
            danbooruID = ""
          } else if (!danbooruID.endsWith("+")) {
            danbooruID += "+";
          }
          danbooruID += title[1];
        }
        if (danbooruID.endsWith("+")) {
          danbooruID = danbooruID.substring(0, danbooruID.length - 1);
        }
      }
      return host + "/" + decodeURIComponent(danbooruID);
    case ST.ehentai:
      const galleryRegex = /^https?:\/\/(?:www\.)?e-hentai\.org\/g\/([^\/]*)/g;
      const gallery = galleryRegex.exec(url);
      return gallery[1];
    case ST.list:
      if (/^https?:\/\//g.exec(url) != null) {
        sep = "/"
      } else {
        sep = path.sep;
      }
      return url.substring(url.lastIndexOf(sep) + 1).replace(".txt", "");
    case ST.local:
      if (url.endsWith(path.sep)) {
        url = url.substring(0, url.length - 1);
        return url.substring(url.lastIndexOf(path.sep)+1);
      } else {
        return url.substring(url.lastIndexOf(path.sep)+1);
      }
    case ST.video:
    case ST.playlist:
      if (/^https?:\/\//g.exec(url) != null) {
        sep = "/"
      } else {
        sep = path.sep;
      }
      let name = url.substring(0, url.lastIndexOf(sep));
      return name.substring(name.lastIndexOf(sep)+1);

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
        return saveDir + path.sep + "ImageCache" + path.sep + typeDir + path.sep + getFileGroup(source);
      } else {
        return saveDir + path.sep + "ImageCache" + path.sep + typeDir + path.sep;
      }
    } else {
      return saveDir + path.sep + "ImageCache" + path.sep;
    }
  }
}

export async function convertURL(url: string): Promise<Array<string>> {
  // If this is a imgur image page, return image file
  let imgurMatch = url.match("^https?://(?:m\.)?imgur\.com/([\\w\\d]{7})$");
  if (imgurMatch != null) {
    return ["https://i.imgur.com/" + imgurMatch[1] + ".jpg"];
  }

  // If this is imgur album, return album images
  let imgurAlbumMatch = url.match("^https?://imgur\.com/a/([\\w\\d]{7})$");
  if (imgurAlbumMatch != null) {
    let html = await wretch(url).get().notFound(() => {return [url]}).text();
    let imageEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll(".post-images > div.post-image-container");
    if (imageEls.length > 0) {
      let images = Array<string>();
      for (let image of imageEls) {
        images.push("https://i.imgur.com/" + image.id + ".jpg");
      }
      return images;
    } else {
      imgurAlbumMatch = null;
    }
  }

  // If this is gfycat page, return gfycat image
  let gfycatMatch = url.match("^https?://gfycat\.com/(?:ifr/)?(\\w*)$");
  if (gfycatMatch != null) {
    // Only lookup CamelCase url if not already CamelCase
    if (/[A-Z]/.test(gfycatMatch[1])) {
      return ["https://giant.gfycat.com/" + gfycatMatch[1] + ".mp4"];
    }

    let html = await wretch(url).get().notFound(() => {return [url]}).text();
    let gfycat = new DOMParser().parseFromString(html, "text/html").querySelectorAll(".upnext-item.active > a");
    if (gfycat.length > 0) {
      let gfycatID = (gfycat[0] as any).href;
      gfycatID = gfycatID.substring(gfycatID.lastIndexOf("/") + 1);
      return ["https://giant.gfycat.com/" + gfycatID + ".mp4"];
    } else {
      gfycat = new DOMParser().parseFromString(html, "text/html").querySelectorAll("#webmSource");
      if (gfycat.length > 0) {
        return [(gfycat[0] as any).src];
      }
      gfycatMatch = null;
    }
  }

  // If this is redgif page, return redgif image
  let redgifMatch = url.match("^https?://(?:www\.)?redgifs\.com/watch/(\\w*)$");
  if (redgifMatch != null) {
    let html = await wretch(url).get().notFound(() => {return [url]}).text();
    let redgif = new DOMParser().parseFromString(html, "text/html").querySelectorAll("#video-" + redgifMatch[1] + " > source");
    if (redgif.length > 0) {
      for (let source of redgif) {
        if ((source as any).type == "video/webm") {
          return [(source as any).src];
        }
      }
    } else {
      redgifMatch = null;
    }
  }

  if (url.includes("redgifs") || url.includes("gfycat")) {
    console.warn("Possible missed file: " + url);
  }

  if (!imgurMatch && !imgurAlbumMatch && !gfycatMatch && !redgifMatch) {
    return [url];
  }
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

export function isImageOrVideo(path: string, strict: boolean): boolean {
  return (isImage(path, strict) || isVideo(path, strict));
}

export function isAudio(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [".mp3", ".m4a", ".wav", ".ogg"];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

export function isVideo(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [".mp4", ".mkv", ".webm", ".ogv", ".mov"];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

export function isVideoPlaylist(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [".asx", ".m3u8", ".pls", ".xspf"];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

export function isImage(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [".gif", ".png", ".jpeg", ".jpg", ".webp", ".tiff", ".svg"];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

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
  data: Array<string>, helpers: {next: any, count: number}}> {
  hasCanceled: boolean;
  source: LibrarySource;
  timeout: number;


  constructor(executor: (resolve: (value?: (
    PromiseLike<{data: Array<string>, helpers: {next: any, count: number}}> |
    {data: Array<string>, helpers: {next: any, count: number}}
    )) => void, reject: (reason?: any) => void) => void) {
    super(executor);
    this.hasCanceled = false;
    this.source = null;
    this.timeout = 0;
  }

  getPromise(): Promise<{data: Array<string>, helpers: {next: any, count: number}}> {
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