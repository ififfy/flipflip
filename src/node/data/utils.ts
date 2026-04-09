import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getFileGroup } from "../../common/utils";
import { ST } from "../../common/const";
import Config from "../../common/Config";

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
  return cachePath(source, "local", config); // FIXME
}

export function getCachePath(source: string, config: Config) {
  const typeDir = en.get(getSourceType(source)).toLowerCase();
  return cachePath(source, typeDir, config); // FIXME
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
        return (
          saveDir +
          path.sep +
          "ImageCache" +
          path.sep +
          typeDir +
          path.sep +
          getFileGroup(source) +
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
