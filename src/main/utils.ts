import fs from "fs";
import path from "path";
import crypto from "crypto";
import wretch from "wretch";
import Audio from "../common/Audio";
import { parseBuffer, parseFile } from "music-metadata";

export function toArrayBuffer(buf: Buffer) {
  let ab = new ArrayBuffer(buf.length);
  let view = new Uint8Array(ab);
  for (let j = 0; j < buf.length; ++j) {
    view[j] = buf[j];
  }
  return ab;
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

export async function parseMusicMetadata(url: string) {
  if (url.startsWith("http")) {
    const arrayBuffer = await wretch(url).get().arrayBuffer();
    return await parseBuffer(Buffer.from(arrayBuffer));
  } else if (fs.existsSync(url)) {
    return await parseFile(url);
  }

  return undefined;
}

export function extractMusicMetadata(
  audio: Audio,
  metadata: any,
  cachePath: string,
) {
  if (!metadata) {
    return;
  }
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
    const data = toArrayBuffer(fs.readFileSync(audio.url));
    let context = new AudioContext();
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
