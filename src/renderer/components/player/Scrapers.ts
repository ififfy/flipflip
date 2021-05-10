import recursiveReaddir from 'recursive-readdir';
import fileURL from 'file-url';
import path from "path";
import wretch from "wretch";
import fs from "fs";
import {DOMParser} from "xmldom";
import domino from "domino";
import tumblr from "tumblr.js";
import Snoowrap from "snoowrap";

import {IF, RF, RT, ST} from "../../data/const";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";

const pm = (object: any) => {
  // @ts-ignore
  postMessage(object);
}

export const sendMessage = (message: string) => {
  pm(message);
}

let redditAlerted = false;
let tumblrAlerted = false;
let tumblr429Alerted = false;
let twitterAlerted = false;
let instagramAlerted = false;
let hydrusAlerted = false;

export const reset = () => {
  redditAlerted = false;
  tumblrAlerted = false;
  tumblr429Alerted = false;
  twitterAlerted = false;
  instagramAlerted = false;
  hydrusAlerted = false;
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

export const loadVideo = (config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number, retries: number}) => {
  const url = source.url;
  const missingVideo = () => {
    pm({
      warning: "Could not find " + source.url,
      data: [],
      helpers: helpers,
      source: source,
      timeout: 0,
    });
  }
  const ifExists = (url: string) => {
    if (!url.startsWith("http")) {
      url = fileURL(url);
    }
    helpers.count = 1;

    let paths;
    if (source.clips && source.clips.length > 0) {
      const clipPaths = Array<string>();
      for (let clip of source.clips) {
        if (!source.disabledClips || !source.disabledClips.includes(clip.id)) {
          let clipPath = url + ":::" + clip.id + ":" + (clip.volume != null ? clip.volume : "-") + ":::" + clip.start + ":" + clip.end;
          if (source.subtitleFile != null && source.subtitleFile.length > 0) {
            clipPath = clipPath + "|||" + source.subtitleFile;
          }
          clipPaths.push(clipPath);
        }
      }
      paths = clipPaths;
    } else {
      if (source.subtitleFile != null && source.subtitleFile.length > 0) {
        url = url + "|||" + source.subtitleFile;
      }
      paths = [url];
    }
    pm({
      data: paths,
      helpers: helpers,
      source: source,
      timeout: 0,
    });
  }

  if (!isVideo(url, false)) {
    missingVideo();
  }
  if (url.startsWith("http")) {
    wretch(url)
      .get()
      .notFound((e) => {
        missingVideo();
      })
      .res((r) => {
        ifExists(url);
      })
  } else {
    const exists = fs.existsSync(url);
    if (exists) {
      ifExists(url);
    } else {
      missingVideo();
    }
  }
}

export const loadPlaylist = (config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number, retries: number}) => {
  const url = source.url;
  wretch(url)
    .get()
    .text(data => {
      const urls = [];
      if (url.endsWith(".asx")) {
        const refs = new DOMParser().parseFromString(data, "text/xml").getElementsByTagName("Ref");
        for (let r = 0; r < refs.length; r++) {
          const l = refs[r];
          urls.push(l.getAttribute("href"));
        }
      } else if (url.endsWith(".m3u8")) {
        for (let l of data.split("\n")) {
          if (l.length > 0 && !l.startsWith("#")) {
            urls.push(l.trim());
          }
        }
      } else if (url.endsWith(".pls")) {
        for (let l of data.split("\n")) {
          if (l.startsWith("File")) {
            urls.push(l.split("=")[1].trim());
          }
        }
      } else if (url.endsWith(".xspf")) {
        const locations = new DOMParser().parseFromString(data, "text/xml").getElementsByTagName("location");
        for (let r = 0; r < locations.length; r++) {
          const l = locations[r];
          urls.push(l.textContent);
        }
      }

      if (urls.length > 0) {
        helpers.count = urls.length;
      }
      pm({
        data: filterPathsToJustPlayable(filter, urls, true),
        helpers: helpers,
        source: source,
        timeout: 0,
      });
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

export const loadTumblr = (config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number, retries: number}) => {
  const timeout = 3000;
  let configured = config.remoteSettings.tumblrOAuthToken != "" && config.remoteSettings.tumblrOAuthTokenSecret != "";
  if (configured) {
    const url = source.url;
    const client = tumblr.createClient({
      consumer_key: config.remoteSettings.tumblrKey,
      consumer_secret: config.remoteSettings.tumblrSecret,
      token: config.remoteSettings.tumblrOAuthToken,
      token_secret: config.remoteSettings.tumblrOAuthTokenSecret,
    });
    // TumblrID takes the form of <blog_name>.tumblr.com
    let tumblrID = url.replace(/https?:\/\//, "");
    tumblrID = tumblrID.replace("/", "");
    if (tumblr429Alerted) {
      pm({
        helpers: helpers,
        source: source,
        timeout: timeout,
      })
      return;
    }
    client.blogPosts(tumblrID, {offset: helpers.next*20}, (err, data) => {
      if (err) {
        let systemMessage = undefined;
        if (err.message.includes("429 Limit Exceeded") && !tumblr429Alerted && helpers.next == 0) {
          if (!config.remoteSettings.silenceTumblrAlert) {
            systemMessage = "Tumblr has temporarily throttled your FlipFlip due to high traffic. Try again in a few minutes or visit Settings to try a different Tumblr API key.";
          }
          tumblr429Alerted = true;
        }
        pm({
          error: err,
          systemMessage: systemMessage,
          helpers: helpers,
          source: source,
          timeout: timeout,
        })
        return;
      }

      // End loop if we're at end of posts
      if (data.posts.length == 0) {
        helpers.next = null;
        pm({
          data: [],
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
        return;
      }

      let images = [];
      for (let post of data.posts) {
        // Sometimes photos are listed separately
        if (post.photos) {
          for (let photo of post.photos) {
            images.push(photo.original_size.url);
          }
        }
        if (post.player) {
          for (let embed of post.player) {
            const regex = /<iframe[^(?:src|\/>)]*src=["']([^"']*)[^(?:\/>)]*\/?>/g;
            let imageSource;
            while ((imageSource = regex.exec(embed.embed_code)) !== null) {
              images.push(imageSource[1]);
            }
          }
        }
        if (post.body) {
          const regex = /<img[^(?:src|\/>)]*src=["']([^"']*)[^>]*>/g;
          let imageSource;
          while ((imageSource = regex.exec(post.body)) !== null) {
            images.push(imageSource[1]);
          }
          const regex2 = /<source[^(?:src|\/>)]*src=["']([^"']*)[^>]*>/g;
          while ((imageSource = regex2.exec(post.body)) !== null) {
            images.push(imageSource[1]);
          }
        }
        if (post.video_url) {
          images.push(post.video_url);
        }
      }

      if (images.length > 0) {
        let convertedSource = Array<string>();
        let convertedCount = 0;
        for (let url of images) {
          convertURL(url).then((urls: Array<string>) => {
            convertedSource = convertedSource.concat(urls);
            convertedCount++;
            if (convertedCount == images.length) {
              helpers.next = helpers.next + 1;
              helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedSource, true).length;
              pm({
                data: filterPathsToJustPlayable(filter, convertedSource, true),
                helpers: helpers,
                source: source,
                timeout: timeout,
              });
            }
          })
            .catch ((error: any) => {
              convertedCount++;
              if (convertedCount == images.length) {
                helpers.next = helpers.next + 1;
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedSource, true).length;
                pm({
                  error: error,
                  data: filterPathsToJustPlayable(filter, convertedSource, true),
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                });
              }
            });
        }
      } else {
        helpers.next = null;
        pm({
          data: [],
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    });
  } else {
    let systemMessage = undefined;
    if (!tumblrAlerted) {
      systemMessage = "You haven't authorized FlipFlip to work with Tumblr yet.\nVisit Settings to authorize Tumblr.";
      tumblrAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    })
  }
}

export const loadReddit = (config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number, retries: number}) => {
  const timeout = 3000;
  let configured = config.remoteSettings.redditRefreshToken != "";
  if (configured) {
    const url = source.url;
    const reddit = new Snoowrap({
      userAgent: config.remoteSettings.redditUserAgent,
      clientId: config.remoteSettings.redditClientID,
      clientSecret: "",
      refreshToken: config.remoteSettings.redditRefreshToken,
    });
    if (url.includes("/r/")) {
      const handleSubmissions = (submissionListing: any) => {
        if (submissionListing.length > 0) {
          let convertedListing = Array<string>();
          let convertedCount = 0;
          for (let s of submissionListing) {
            convertURL(s.url).then((urls: Array<string>) => {
              convertedListing = convertedListing.concat(urls);
              convertedCount++;
              if (convertedCount == submissionListing.length) {
                helpers.next = submissionListing[submissionListing.length - 1].name;
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, convertedListing, true),
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                });
              }
            })
              .catch ((error: any) => {
                convertedCount++;
                if (convertedCount == submissionListing.length) {
                  helpers.next = submissionListing[submissionListing.length - 1].name;
                  helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, true).length;
                  pm({
                    error: error,
                    data: filterPathsToJustPlayable(filter, convertedListing, true),
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  });
                }
              });
          }
        } else {
          helpers.next = null;
          pm({
            data: [],
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        }
      };
      const errorSubmission = (error: any) => {
        pm({
          error: error,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      };

      switch (source.redditFunc) {
        default:
        case RF.hot:
          reddit.getSubreddit(getFileGroup(url)).getHot({after: helpers.next})
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
        case RF.new:
          reddit.getSubreddit(getFileGroup(url)).getNew({after: helpers.next})
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
        case RF.top:
          const time = source.redditTime == null ? RT.day : source.redditTime;
          reddit.getSubreddit(getFileGroup(url)).getTop({time: time, after: helpers.next})
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
        case RF.controversial:
          reddit.getSubreddit(getFileGroup(url)).getControversial({after: helpers.next})
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
        case RF.rising:
          reddit.getSubreddit(getFileGroup(url)).getRising({after: helpers.next})
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
      }
    } else if (url.includes("/saved")) {
      reddit.getUser(getFileGroup(url)).getSavedContent({after: helpers.next})
        .then((submissionListing: any) => {
          if (submissionListing.length > 0) {
            let convertedListing = Array<string>();
            let convertedCount = 0;
            for (let s of submissionListing) {
              convertURL(s.url).then((urls: Array<string>) => {
                convertedListing = convertedListing.concat(urls);
                convertedCount++;
                if (convertedCount == submissionListing.length) {
                  helpers.next = submissionListing[submissionListing.length - 1].name;
                  helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, true).length;
                  pm({
                    data: filterPathsToJustPlayable(filter, convertedListing, true),
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  });
                }
              })
                .catch ((error: any) => {
                  convertedCount++;
                  if (convertedCount == submissionListing.length) {
                    helpers.next = submissionListing[submissionListing.length - 1].name;
                    helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, true).length;
                    pm({
                      data: filterPathsToJustPlayable(filter, convertedListing, true),
                      helpers: helpers,
                      source: source,
                      timeout: timeout,
                    });
                  }
                });
            }
          } else {
            helpers.next = null;
            pm({
              data: [],
              helpers: helpers,
              source: source,
              timeout: timeout,
            });
          }
        }).catch((err: any) => {
          pm({
            error: err,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        });
    } else if (url.includes("/user/") || url.includes("/u/")) {
      reddit.getUser(getFileGroup(url)).getSubmissions({after: helpers.next})
        .then((submissionListing: any) => {
          if (submissionListing.length > 0) {
            let convertedListing = Array<string>();
            let convertedCount = 0;
            for (let s of submissionListing) {
              convertURL(s.url).then((urls: Array<string>) => {
                convertedListing = convertedListing.concat(urls);
                convertedCount++;
                if (convertedCount == submissionListing.length) {
                  helpers.next = submissionListing[submissionListing.length - 1].name;
                  helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, true).length;
                  pm({
                    data: filterPathsToJustPlayable(filter, convertedListing, true),
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  });
                }
              })
                .catch ((error: any) => {
                  convertedCount++;
                  if (convertedCount == submissionListing.length) {
                    helpers.next = submissionListing[submissionListing.length - 1].name;
                    helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, true).length;
                    pm({
                      data: filterPathsToJustPlayable(filter, convertedListing, true),
                      helpers: helpers,
                      source: source,
                      timeout: timeout,
                    });
                  }
                });
            }
          } else {
            helpers.next = null;
            pm({
              data: [],
              helpers: helpers,
              source: source,
              timeout: timeout,
            });
          }
        }).catch((err: any) => {
          pm({
            error: err,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        });
    }
  } else {
    let systemMessage = undefined
    if (!redditAlerted) {
      systemMessage = "You haven't authorized FlipFlip to work with Reddit yet.\nVisit Settings to authorize Reddit.";
      redditAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    });
  }
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

export const isImageOrVideo = (path: string, strict: boolean): boolean => {
  return (isImage(path, strict) || isVideo(path, strict));
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

async function convertURL(url: string): Promise<Array<string>> {
  // If this is a imgur image page, return image file
  let imgurMatch = url.match("^https?://(?:m\.)?imgur\.com/([\\w\\d]{7})$");
  if (imgurMatch != null) {
    return ["https://i.imgur.com/" + imgurMatch[1] + ".jpg"];
  }

  // If this is imgur album, return album images
  // TODO Fix (replace with imgur library?
  let imgurAlbumMatch = url.match("^https?://imgur\.com/a/([\\w\\d]{7})$");
  if (imgurAlbumMatch != null) {
    let html = await wretch(url).get().notFound(() => {return [url]}).text();
    let imageEls = domino.createWindow(html).document.querySelectorAll(".post-images > div.post-image-container");
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
  // TODO Fix
  let gfycatMatch = url.match("^https?://gfycat\.com/(?:ifr/)?(\\w*)$");
  if (gfycatMatch != null) {
    // Only lookup CamelCase url if not already CamelCase
    if (/[A-Z]/.test(gfycatMatch[1])) {
      return ["https://giant.gfycat.com/" + gfycatMatch[1] + ".mp4"];
    }

    let html = await wretch(url).get().notFound(() => {return [url]}).text();
    let gfycat = domino.createWindow(html).document.querySelectorAll(".upnext-item.active > a");
    if (gfycat.length > 0) {
      let gfycatID = (gfycat[0] as any).href;
      gfycatID = gfycatID.substring(gfycatID.lastIndexOf("/") + 1);
      return ["https://giant.gfycat.com/" + gfycatID + ".mp4"];
    } else {
      gfycat = domino.createWindow(html).document.querySelectorAll("#webmSource");
      if (gfycat.length > 0) {
        return [(gfycat[0] as any).src];
      }
      gfycatMatch = null;
    }
  }

  // If this is redgif page, return redgif image
  // TODO Fix
  let redgifMatch = url.match("^https?://(?:www\.)?redgifs\.com/watch/(\\w*)$");
  if (redgifMatch != null) {
    let fourOFour = false
    let html = await wretch(url).get().notFound(() => {fourOFour = true}).text();
    if (fourOFour) {
      return [url];
    } else if (html) {
      let redgif = domino.createWindow(html).document.querySelectorAll("#video-" + redgifMatch[1] + " > source");
      console.log(redgif);
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
    pm({warning: "Possible missed file: " + url});
  }

  if (!imgurMatch && !imgurAlbumMatch && !gfycatMatch && !redgifMatch) {
    return [url];
  }
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
  } else if (/^https?:\/\/(www\.)?(lolibooru\.moe|hypnohub\.net|danbooru\.donmai\.us)\//.exec(url) != null) {
    return ST.danbooru;
  } else if (/^https?:\/\/(www\.)?(gelbooru\.com|furry\.booru\.org|rule34\.xxx|realbooru\.com)\//.exec(url) != null) {
    return ST.gelbooru2;
  } else if (/^https?:\/\/(www\.)?(e621\.net)\//.exec(url) != null) {
    return ST.e621;
  } else if (/^https?:\/\/(www\.)?(.*\.booru\.org|idol\.sankakucomplex\.com)\//.exec(url) != null) {
    return ST.gelbooru1;
  } else if (/^https?:\/\/(www\.)?e-hentai\.org\/g\//.exec(url) != null) {
    return ST.ehentai;
  } else if (/^https?:\/\/[^.]*\.bdsmlr\.com/.exec(url) != null) {
    return ST.bdsmlr;
  } else if (/^https?:\/\/[\w\\.]+:\d+\/get_files\/search_files/.exec(url) != null) {
    return ST.hydrus;
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
      if (redditID.endsWith("/")) redditID = redditID.slice(0, url.lastIndexOf("/"));
      if (redditID.endsWith("/saved")) redditID = redditID.replace("/saved", "");
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
    case ST.e621:
      const hostRegexE621 = /^https?:\/\/(?:www\.)?([^.]*)\./g;
      const hostE621 =  hostRegexE621.exec(url)[1];
      let E621ID = "";
      if (url.includes("/pools/")) {
        E621ID = "pool" + url.substring(url.lastIndexOf("/"));
      } else {
        const tagRegex = /[?&]tags=(.*)&?/g;
        let tags;
        if ((tags = tagRegex.exec(url)) !== null) {
          E621ID = tags[1];
        }
        if (E621ID.endsWith("+")) {
          E621ID = E621ID.substring(0, E621ID.length - 1);
        }
      }
      return hostE621 + "/" + decodeURIComponent(E621ID);
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
    case ST.bdsmlr:
      let bdsmlrID = url.replace(/https?:\/\//, "");
      bdsmlrID = bdsmlrID.replace(/\/rss/, "");
      bdsmlrID = bdsmlrID.replace(/\.bdsmlr\.com\/?/, "");
      return bdsmlrID;
    case ST.hydrus:
      const tagsRegex = /tags=([^&]*)&?.*$/.exec(url);
      if (tagsRegex == null) return "hydrus";
      let tags = tagsRegex[1];
      if (!tags.startsWith("[")) {
        tags = decodeURIComponent(tags);
      }
      tags = tags.substring(1, tags.length - 1);
      tags = tags.replace(/"/g, "");
      return tags;
  }
}