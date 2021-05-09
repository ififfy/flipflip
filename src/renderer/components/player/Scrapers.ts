import recursiveReaddir from 'recursive-readdir';
import fileURL from 'file-url';
import path from "path";
import wretch from "wretch";

import {IF} from "../../data/const";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";

const pm = (object: any) => {
  // @ts-ignore
  postMessage(object);
}

export const sendMessage = (message: string) => {
  pm(message);
}

export const loadLocalDirectory = (config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number, retries: number}) => {
  const blacklist = ['*.css', '*.html', 'avatar.png'];
  const url = source.url;

  recursiveReaddir(url, blacklist, (err: any, rawFiles: Array<string>) => {
    if (err) {
      pm({
        error: err,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    } else {
      // If this is a local source (not a cacheDir call)
      if (helpers.next == null) {
        helpers.count = filterPathsToJustPlayable(IF.any, rawFiles, true).length;
      }

      pm({
        data: filterPathsToJustPlayable(filter, rawFiles, true).map((p) => fileURL(p)).sort((a, b) => {
          let aFile: any = getFileName(a, false);
          if (parseInt(aFile)) {
            aFile = parseInt(aFile);
          }
          let bFile: any = getFileName(b, false);
          if (parseInt(aFile)) {
            aFile = parseInt(aFile);
          }
          if (aFile > bFile) {
            return 1;
          } else if (aFile < bFile) {
            return -1;
          } else {
            return 0;
          }
        }),
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    }
  });
}

export const loadRemoteImageURLList = (config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number, retries: number}) => {
  const url = source.url;

  wretch(url)
    .get()
    .text(data => {
      const lines = data.match(/[^\r\n]+/g).filter((line) => line.startsWith("http://") || line.startsWith("https://") || line.startsWith("file:///"));
      if (lines.length > 0) {
        let convertedSource = Array<string>();
        let convertedCount = 0;
        for (let url of lines) {
          convertURL(url).then((urls: Array<string>) => {
            convertedSource = convertedSource.concat(urls);
            convertedCount++;
            if (convertedCount == lines.length) {
              helpers.count = filterPathsToJustPlayable(IF.any, convertedSource, true).length;
              pm({
                data: filterPathsToJustPlayable(filter, convertedSource, true),
                helpers: helpers,
                source: source,
                timeout: 0,
              });
            }
          })
            .catch ((error: any) => {
              convertedCount++;
              if (convertedCount == lines.length) {
                helpers.count = filterPathsToJustPlayable(IF.any, convertedSource, true).length;
                pm({
                  error: error,
                  data: filterPathsToJustPlayable(filter, convertedSource, true),
                  helpers: helpers,
                  source: source,
                  timeout: 0,
                });
              }
            });
        }
      } else {
        pm({
          warning: "No lines in" + url + " are links or files",
          helpers: helpers,
          source: source,
          timeout: 0,
        });
      }
    })
    .catch((e) => {
      pm({
        error: e,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    });
}

function filterPathsToJustPlayable(imageTypeFilter: string, paths: Array<string>, strict: boolean): Array<string> {
  switch (imageTypeFilter) {
    default:
    case IF.any:
      return paths.filter((p) => isImageOrVideo(p, strict));
    case IF.stills:
    case IF.images:
      return paths.filter((p) => isImage(p, strict));
    case IF.gifs:
      return paths.filter((p) => p.toLowerCase().endsWith('.gif') || isVideo(p, strict));
    case IF.videos:
      return paths.filter((p) => isVideo(p, strict));
  }
}

const isImageOrVideo = (path: string, strict: boolean): boolean => {
  return (isImage(path, strict) || isVideo(path, strict));
}

function isImage(path: string, strict: boolean): boolean {
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

function isVideo(path: string, strict: boolean): boolean {
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

function getFileName(url: string, extension = true) {
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
    let fourOFour = false
    let html = await wretch(url).get().notFound(() => {fourOFour = true}).text();
    if (fourOFour) {
      return [url];
    } else if (html) {
      let redgif = new DOMParser().parseFromString(html, "text/html").querySelectorAll("#video-" + redgifMatch[1] + " > source");
      if (redgif.length > 0) {
        for (let source of redgif) {
          if ((source as any).type == "video/webm") {
            return [(source as any).src];
          }
        }
        // Fallback to MP4
        for (let source of redgif) {
          if ((source as any).type == "video/mp4" && !(source as any).src.endsWith("-mobile.mp4")) {
            return [(source as any).src];
          }
        }
        // Fallback to MP4-mobile
        for (let source of redgif) {
          if ((source as any).type == "video/mp4") {
            return [(source as any).src];
          }
        }
      } else {
        const fallbackRegex = /"webm":\s*\{[^}]*"url":\s*"([^,}]*)",?/.exec(html);
        if (fallbackRegex != null) {
          return [fallbackRegex[1].replace(/\\u002F/g,"/")];
        } else {
          console.log(html);
          redgifMatch = null;
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