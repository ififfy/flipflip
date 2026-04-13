import fs from "fs";
import path from "path";
import crypto from "crypto";
import { app } from "electron";
import wretch from "wretch";
import Backup from "../common/Backup";
import Audio from "../common/Audio";
import Config from "../common/Config";
import { parseBuffer, parseFile } from "music-metadata";
import { getFileGroup, getSourceType } from "src/common/utils";
import { ST } from "../common/const";
import en from "../renderer/data/en";
import { toArrayBuffer } from "../renderer/data/utils";

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

export async function extractMusicMetadataFromFile(
  audio: Audio,
  config: Config,
) {
  try {
    const metadata = await parseFile(audio.url);
    if (metadata) {
      extractMusicMetadata(audio, metadata, getCachePath(null, config));
    }

    return audio;
  } catch (err) {
    console.error("Error reading metadata:", err.message);
    return undefined;
  }
}

export async function extractMusicMetadataFromURL(
  audio: Audio,
  config: Config,
) {
  try {
    const arrayBuffer = await wretch(audio.url).get().arrayBuffer();
    const metadata = await parseBuffer(Buffer.from(arrayBuffer));
    if (metadata) {
      extractMusicMetadata(audio, metadata, getCachePath(null, config));
    }

    return audio;
  } catch (err) {
    console.error("Error reading metadata:", err.message);
    return undefined;
  }
}

export function extractMusicMetadata(
  audio: Audio,
  metadata: any,
  cachePath: string,
) {
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
      audio.thumb = generateThumbnailFile(
        cachePath,
        metadata.common.picture[0].data,
      );
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
    const data = toArrayBuffer(fs.readFileSync(audio.url)); // FIXME
    let context = new AudioContext(); // FIXME pass in AudioHTMLElement with URL (file://, http://)
    context.decodeAudioData(data, (buffer) => {
      audio.duration = buffer.duration;
    });
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
  const checksum = crypto.createHash("md5").update(data).digest("hex");
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
