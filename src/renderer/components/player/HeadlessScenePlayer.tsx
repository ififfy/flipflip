import * as React from 'react';
import * as fs from "fs";
import recursiveReaddir from 'recursive-readdir';
import fileURL from 'file-url';
import wretch from 'wretch';
import http from 'http';
import Snoowrap from 'snoowrap';
import tumblr from "tumblr.js";
import imgur from "imgur";
import Twitter from "twitter";
import {IgApiClient} from "instagram-private-api";

import {IF, ST, WF} from '../../data/const';
import {
  CancelablePromise,
  convertURL,
  getCachePath,
  getFileGroup,
  getFileName,
  getSourceType,
  isImage,
  isVideo,
  isImageOrVideo,
} from "../../data/utils";
import Config from "../../data/Config";
import Scene from '../../data/Scene';
import ChildCallbackHack from './ChildCallbackHack';
import ImagePlayer from './ImagePlayer';
import LibrarySource from "../library/LibrarySource";

let redditAlerted = false;
let tumblrAlerted = false;
let tumblr429Alerted = false;
let twitterAlerted = false;
let instagramAlerted = false;

// Returns true if array is empty, or only contains empty arrays
function isEmpty(allURLs: any[]): boolean {
  return Array.isArray(allURLs) && allURLs.every(isEmpty);
}

function filterPathsToJustPlayable(imageTypeFilter: string, paths: Array<string>, strict: boolean): Array<string> {
  switch (imageTypeFilter) {
    default:
    case IF.any:
      return paths.filter((p) => isImageOrVideo(p, strict));
    case IF.stills:
      return paths.filter((p) => isImage(p, strict));
    case IF.gifs:
      return paths.filter((p) => p.toLowerCase().endsWith('.gif') || isVideo(p, strict));
    case IF.videos:
      return paths.filter((p) => isVideo(p, strict));
  }
}

// Determine what kind of source we have based on the URL and return associated Promise
function getPromise(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  let promise;
  const sourceType = getSourceType(source.url);

  if (sourceType == ST.local) { // Local files
    helpers.next = null;
    promise = loadLocalDirectory(config, source, filter, helpers);
  } else if (sourceType == ST.list) { // Image List
    helpers.next = null;
    promise = loadRemoteImageURLList(config, source, filter, helpers);
  } else if (sourceType == ST.video) {
    helpers.next = null;
    const cachePath = getCachePath(source.url, config) + getFileName(source.url);
    if (fs.existsSync(cachePath)) {
      const realURL = source.url;
      source.url = cachePath;
      promise = loadVideo(config, source, filter, helpers);
      source.url = realURL;
    } else {
      promise = loadVideo(config, source, filter, helpers);
    }
  } else { // Paging sources
    let promiseFunction;
    let timeout;
    if (sourceType == ST.tumblr) {
      promiseFunction = loadTumblr;
      timeout = 3000;
    } else if (sourceType == ST.reddit) {
      promiseFunction = loadReddit;
      timeout = 3000;
    } else if (sourceType == ST.imagefap) {
      promiseFunction = loadImageFap;
      timeout = 8000;
    } else if (sourceType == ST.sexcom) {
      promiseFunction = loadSexCom;
      timeout = 8000;
    } else if (sourceType == ST.imgur) {
      promiseFunction = loadImgur;
      timeout = 3000;
    } else if (sourceType == ST.twitter) {
      promiseFunction = loadTwitter;
      timeout = 3000;
    } else if (sourceType == ST.deviantart) {
      promiseFunction = loadDeviantArt;
      timeout = 3000;
    } else if (sourceType == ST.instagram) {
      promiseFunction = loadInstagram;
      timeout = 3000;
    } else if (sourceType == ST.danbooru) {
      promiseFunction = loadDanbooru;
      timeout = 8000;
    } else if (sourceType == ST.gelbooru1) {
      promiseFunction = loadGelbooru1;
      timeout = 8000;
    } else if (sourceType == ST.gelbooru2) {
      promiseFunction = loadGelbooru2;
      timeout = 8000;
    } else if (sourceType == ST.ehentai) {
      promiseFunction = loadEHentai;
      timeout = 8000;
    }
    if (helpers.next == -1) {
      helpers.next = 0;
      const cachePath = getCachePath(source.url, config);
      if (fs.existsSync(cachePath) && config.caching.enabled) {
        // If the cache directory exists, use it
        const realURL = source.url;
        source.url = cachePath;
        promise = loadLocalDirectory(config, source, filter, helpers);
        source.url = realURL;
        timeout = 0;
      } else {
        promise = promiseFunction(config, source, filter, helpers);
      }
    } else {
      promise = promiseFunction(config, source, filter, helpers);
    }
    promise.timeout = timeout;
  }
  promise.source = source;
  return promise;
}

function loadLocalDirectory(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const blacklist = ['*.css', '*.html', 'avatar.png'];
  const url = source.url;

  return new CancelablePromise((resolve) => {
    recursiveReaddir(url, blacklist, (err: any, rawFiles: Array<string>) => {
      if (err) {
        console.warn(err);
        resolve(null);
      } else {
        // If this is a local source (not a cacheDir call)
        if (helpers.next == null) {
          helpers.count = filterPathsToJustPlayable(IF.any, rawFiles, true).length;
        }
        resolve({
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
        });
      }
    });
  });
}

function loadVideo(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  return new CancelablePromise((resolve) => {
    let path = filterPathsToJustPlayable(filter, [url], true).map((p) => p.startsWith("http") ? p : fileURL(p));
    if (path.length > 0) {
      helpers.count = 1;
      if (source.clips && source.clips.length > 0) {
        const clipPaths = Array<string>();
        for (let clip of source.clips) {
          clipPaths.push(path[0] + ":::" + clip.start + ":" + clip.end);
        }
        path = clipPaths;
      }
    }
    resolve({
      data: path,
      helpers: helpers,
    });
  });
}

function loadRemoteImageURLList(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  return new CancelablePromise((resolve) => {
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
                resolve({
                  data: filterPathsToJustPlayable(filter, convertedSource, true),
                  helpers: helpers,
                });
              }
            });
          }
        } else {
          console.warn("No lines in", url, " are links or files");
          resolve(null)
        }
      })
      .catch((e) => {
        console.warn("Fetch error on", url);
        console.warn(e);
        resolve(null);
      });
  });
}

function loadTumblr(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  let configured = config.remoteSettings.tumblrOAuthToken != "" && config.remoteSettings.tumblrOAuthTokenSecret != "";
  if (configured) {
    const url = source.url;
    return new CancelablePromise((resolve) => {
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
        resolve(null);
        return;
      }
      client.blogPosts(tumblrID, {offset: helpers.next*20}, (err, data) => {
        if (err) {
          console.error("Error retriving " + tumblrID + (helpers.next == 0 ? "" : "(Page " + helpers.next + " )"));
          console.error(err);
          if (err.message.includes("429 Limit Exceeded") && !tumblr429Alerted && helpers.next == 0) {
            alert("Tumblr has temporarily throttled your FlipFlip due to high traffic. Try again in a few minutes or visit Preferences to try a different Tumblr API key.");
            tumblr429Alerted = true;
          }
          resolve(null);
          return;
        }

        // End loop if we're at end of posts
        if (data.posts.length == 0) {
          helpers.next = null;
          resolve({data: [], helpers: helpers});
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
                resolve({
                  data: filterPathsToJustPlayable(filter, convertedSource, true),
                  helpers: helpers,
                });
              }
            });
          }
        } else {
          helpers.next = null;
          resolve({data: [], helpers: helpers});
        }
      });
    });
  } else {
    if (!tumblrAlerted) {
      alert("You haven't authorized FlipFlip to work with Tumblr yet.\nVisit Preferences and click 'Authorzie FlipFlip on Tumblr'.");
      tumblrAlerted = true;
    }
    return new CancelablePromise((resolve) => {
      resolve(null);
    });
  }
}

function loadReddit(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  let configured = config.remoteSettings.redditRefreshToken != "";
  if (configured) {
    const url = source.url;
    return new CancelablePromise((resolve) => {
      const reddit = new Snoowrap({
        userAgent: config.remoteSettings.redditUserAgent,
        clientId: config.remoteSettings.redditClientID,
        clientSecret: "",
        refreshToken: config.remoteSettings.redditRefreshToken,
      });
      if (url.includes("/r/")) {
        reddit.getSubreddit(getFileGroup(url)).getHot({after: helpers.next})
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
                    resolve({
                      data: filterPathsToJustPlayable(filter, convertedListing, true),
                      helpers: helpers,
                    });
                  }
                });
              }
            } else {
              helpers.next = null;
              resolve({data: [], helpers: helpers});
            }
          })
          .catch((error: any) => {
            resolve(null);
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
                  resolve({
                    data: filterPathsToJustPlayable(filter, convertedListing, true),
                    helpers: helpers,
                  });
                }
              });
            }
          } else {
            helpers.next = null;
            resolve({data: [], helpers: helpers});
          }
        }).catch((err: any) => {
          resolve(null);
        });
      }
    });
  } else {
    if (!redditAlerted) {
      alert("You haven't authorized FlipFlip to work with Reddit yet.\nVisit Preferences and click 'Authorzie FlipFlip on Reddit'.");
      redditAlerted = true;
    }
    return new CancelablePromise((resolve) => {
      resolve(null);
    });
  }
}

function loadImageFap(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  if (helpers.next == 0) {
    helpers.next = [0, 0];
  }
  const url = source.url;
  return new CancelablePromise((resolve) => {
    if (url.includes("/pictures/")) {
      wretch("http://www.imagefap.com/gallery/" + getFileGroup(url) + "?view=2")
        .get()
        .setTimeout(5000)
        .onAbort((e) => resolve(null))
        .text((html) => {
          let imageEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll(".expp-container > form > table > tbody > tr > td");
          if (imageEls.length > 0) {
            let imageCount = 0;
            let images = Array<string>();
            for (let image of imageEls) {
              wretch("http://www.imagefap.com/photo/" + image.id + "/")
                .get()
                .text((html) => {
                  imageCount++;
                  let contentURL = html.match("\"contentUrl\": \"(.*?)\",");
                  if (contentURL != null) {
                    images.push(contentURL[1]);
                  }
                  if (imageCount == imageEls.length) {
                    helpers.next = null;
                    helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                    resolve({
                      data: filterPathsToJustPlayable(filter, images, true),
                      helpers: helpers,
                    });
                  }
                })
            }
          } else {
            helpers.next = null;
            resolve({data: [], helpers: helpers});
          }
        });
    } else if (url.includes("/organizer/")) {
      wretch(url + "?page=" + helpers.next[0])
        .get()
        .setTimeout(5000)
        .onAbort((e) => resolve(null))
        .text((html) => {
          let albumEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll("td.blk_galleries > font > a.blk_galleries");
          if (albumEls.length == 0) {
            helpers.next = null;
            resolve({data: [], helpers: helpers});
          } else if (albumEls.length > helpers.next[1]) {
            let albumEl = albumEls[helpers.next[1]];
            let albumID = albumEl.getAttribute("href").substring(albumEl.getAttribute("href").lastIndexOf("/") + 1);
            wretch("http://www.imagefap.com/gallery/" + albumID + "?view=2")
              .get()
              .text((html) => {
                let imageEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll(".expp-container > form > table > tbody > tr > td");
                if (imageEls.length > 0) {
                  let images = Array<string>();
                  let imageCount = 0;
                  for (let image of imageEls) {
                    wretch("http://www.imagefap.com/photo/" + image.id + "/")
                      .get()
                      .text((html) => {
                        imageCount++;
                        let contentURL = html.match("\"contentUrl\": \"(.*?)\",");
                        if (contentURL != null) {
                          images.push(contentURL[1]);
                        }
                        if (imageCount == imageEls.length) {
                          helpers.next[1] += 1;
                          helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                          resolve({
                            data: filterPathsToJustPlayable(filter, images, true),
                            helpers: helpers,
                          })
                        }
                      });
                  }
                } else {
                  helpers.next[1] += 1;
                  resolve({
                    data: [],
                    helpers: helpers,
                  })
                }
              });
          } else {
            helpers.next[0] += 1;
            helpers.next[1] = 0;
            resolve({
              data: [],
              helpers: helpers,
            })
          }
        });
    } else if (url.includes("/video.php?vid=")) {
      wretch(url)
        .get()
        .setTimeout(5000)
        .onAbort((e) => resolve(null))
        .text((html) => {
          let videoEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll(".video-js");
          if (videoEls.length == 0) {
            helpers.next = null;
            resolve({data: [], helpers: helpers});
          } else {
            let videoURLs = Array<string>();
            for (let el of videoEls) {
              let videoURL = "";
              let videoDimension = 0;
              for (let source of el.querySelectorAll("source")) {
                if (parseInt(source.getAttribute("res")) > videoDimension) {
                  videoDimension = parseInt(source.getAttribute("res"));
                  videoURL = source.src;
                }
              }
              if (videoURL != "") {
                videoURLs.push(videoURL.split("?")[0]);
              }
            }
            helpers.next = null;
            helpers.count = helpers.count + videoURLs.length;
            resolve({
              data: videoURLs,
              helpers: helpers,
            })
          }
        });
    }
  });
}

function loadSexCom(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  return new CancelablePromise((resolve) => {
    let requestURL;
    if (url.includes("/user/")) {
      requestURL = "http://www.sex.com/user/" + getFileGroup(url) + "?page=" + (helpers.next + 1);
    } else if (url.includes("/gifs/") || url.includes("/pics/") || url.includes("/videos/")) {
      requestURL = "http://www.sex.com/" + getFileGroup(url) + "?page=" + (helpers.next + 1);
    }
    wretch(requestURL)
      .get()
      .setTimeout(5000)
      .onAbort((e) => resolve(null))
      .notFound((e) => resolve(null))
      .text((html) => {
        let imageEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll(".small_pin_box > .image_wrapper > img");
        if (imageEls.length > 0) {
          let videos = Array<string>();
          let images = Array<string>();
          for (let image of imageEls) {
            if (image.nextElementSibling || image.previousElementSibling) {
              videos.push(image.parentElement.getAttribute("href"));
            } else {
              images.push(image.getAttribute("data-src"));
            }
          }
          if (videos.length == 0) {
            helpers.next = helpers.next + 1;
            helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
            resolve({
              data: filterPathsToJustPlayable(filter, images, true),
              helpers: helpers,
            })
          } else {
            let count = 0;
            for (let videoURL of videos) {
              wretch("http://www.sex.com" + videoURL)
                .get()
                .setTimeout(5000)
                .onAbort((e) => resolve(null))
                .notFound((e) => resolve(null))
                .text((html) => {
                  count += 1;

                  let vidID = null;
                  const vidIDRegex = /\/video\/stream\/(\d+)/g;
                  let regexResult = vidIDRegex.exec(html);
                  if (regexResult != null) {
                    vidID = regexResult[1];
                  }

                  let date = null;
                  const dateRegex = /\d{4}\/\d{2}\/\d{2}/g;
                  regexResult = dateRegex.exec(html);
                  if (regexResult != null) {
                    date = regexResult[0];
                  }

                  if (vidID != null && date != null) {
                    images.push("https://videos1.sex.com/stream/" + date + "/" + vidID +".mp4");
                  }
                  if (count == videos.length) {
                    helpers.next = helpers.next + 1;
                    helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                    resolve({
                      data: filterPathsToJustPlayable(filter, images, true),
                      helpers: helpers,
                    })
                  }
                });
            }
          }
        } else {
          helpers.next = null;
          resolve({data: [], helpers: helpers});
        }
      });
  });
}

function loadImgur(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  return new CancelablePromise((resolve) => {
    imgur.getAlbumInfo(getFileGroup(url))
      .then((json: any) => {
        const images = json.data.images.map((i: any) => i.link);
        helpers.next = null;
        helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
        resolve({
          data: filterPathsToJustPlayable(filter, images, true),
          helpers: helpers,
        })
      })
      .catch((err: any) => {
        console.error(err.message);
        resolve(null);
      });
  });
}

function loadTwitter(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  let configured = config.remoteSettings.twitterAccessTokenKey != "" && config.remoteSettings.twitterAccessTokenSecret != "";
  if (configured) {
    const excludeRTS = source.url.endsWith("--");
    const url = source.url.replace("--", "");
    return new CancelablePromise((resolve) => {
      const twitter = new Twitter({
        consumer_key: config.remoteSettings.twitterConsumerKey,
        consumer_secret: config.remoteSettings.twitterConsumerSecret,
        access_token_key: config.remoteSettings.twitterAccessTokenKey,
        access_token_secret: config.remoteSettings.twitterAccessTokenSecret,
      });
      twitter.get('statuses/user_timeline',
        helpers.next == 0 ? {screen_name: getFileGroup(url), count: 200, include_rts: !excludeRTS, tweet_mode: 'extended'} : {screen_name: getFileGroup(url), count: 200, include_rts: !excludeRTS, tweet_mode: 'extended', max_id: helpers.next},
        (error: any, tweets: any) => {
        if (error) {
          resolve(null);
          return;
        }
        let images = Array<string>();
        let lastID = "";
        for (let t of tweets) {
          // Skip FanCentro/OnlyFans/ClipTeez posts
          if (/href="https?:\/\/(fancentro\.com|onlyfans\.com|mykink\.xxx)\/?"/.exec(t.source) != null) continue;
          if (t.extended_entities && t.extended_entities.media) {
            for (let m of t.extended_entities.media) {
              if (m.video_info) {
                images.push(m.video_info.variants[0].url);
              } else {
                images.push(m.media_url);
              }
            }
          } else if (t.entities.media) {
            for (let m of t.entities.media) {
              images.push(m.media_url);
            }
          }
          lastID = t.id;
        }
        if (lastID == helpers.next) {
          helpers.next = null;
          resolve({data: [], helpers: helpers});
        } else {
          helpers.next = lastID;
          helpers.count = helpers.count + images.length;
          resolve({data: images, helpers: helpers});
        }
      })
    });
  } else {
    if (!twitterAlerted) {
      alert("You haven't authorized FlipFlip to work with Twitter yet.\nVisit Preferences and click 'Authorzie FlipFlip on Twitter'.");
      twitterAlerted = true;
    }
    return new CancelablePromise((resolve) => {
      resolve(null);
    });
  }
}

function loadDeviantArt(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  return new CancelablePromise((resolve) => {
    wretch("http://backend.deviantart.com/rss.xml?type=deviation&q=by%3A" + getFileGroup(url) + "+sort%3Atime+meta%3Aall" + (helpers.next != 0 ? "&offset=" + helpers.next : ""))
      .get()
      .setTimeout(5000)
      .onAbort((e) => resolve(null))
      .notFound((e) => resolve(null))
      .text((text) => {
        const xml = new DOMParser().parseFromString(text, "text/xml");
        let hasNextPage = false;
        for (let link of xml.getElementsByTagName("atom:link")) {
          if (link.getAttribute("rel") == "next") hasNextPage = true;
        }
        let images = Array<string>();
        for (let item of xml.getElementsByTagName("item")) {
          helpers.next+=1;
          for (let content of item.getElementsByTagName("media:content")) {
            if (content.getAttribute("medium") == "image") {
              images.push(content.getAttribute("url"));
            }
          }
        }
        if (!hasNextPage) {
          helpers.next = null;
        }
        helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
        resolve({
          data: filterPathsToJustPlayable(filter, images, false),
          helpers: helpers,
        });
      });
  });
}
let ig: IgApiClient = null;
let session: any = null;
function loadInstagram(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const configured = config.remoteSettings.instagramUsername != "" && config.remoteSettings.instagramPassword != "";
  if (configured) {
    const url = source.url;
    const processItems = (items: any, resolve: any, helpers: {next: any, count: number}) => {
      let images = Array<string>();
      for (let item of items) {
        if (item.carousel_media) {
          for (let media of item.carousel_media) {
            images.push(media.image_versions2.candidates[0].url);
          }
        }
        if (item.video_versions) {
          images.push(item.video_versions[0].url);
        } else if (item.image_versions2) {
          images.push(item.image_versions2.candidates[0].url);
        }
      }
      // Strict filter won't work because instagram media needs the extra parameters on the end
      helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
      resolve({
        data: filterPathsToJustPlayable(filter, images, false),
        helpers: helpers,
      });
    };

    if (ig == null) {
      ig = new IgApiClient();
      ig.state.generateDevice(config.remoteSettings.instagramUsername);
      return new CancelablePromise((resolve) => {
        ig.account.login(config.remoteSettings.instagramUsername, config.remoteSettings.instagramPassword).then((loggedInUser) => {
          ig.state.serializeCookieJar().then((cookies) => {
            session = JSON.stringify(cookies);
            ig.user.getIdByUsername(getFileGroup(url)).then((id) => {
              const userFeed = ig.feed.user(id);
              userFeed.items().then((items) => {
                helpers.next = [id, userFeed.serialize()];
                processItems(items, resolve, helpers);
              }).catch((e) => {console.error(e);resolve(null)});
            }).catch((e) => {console.error(e);resolve(null)});
          }).catch((e) => {console.error(e);resolve(null)});
        }).catch((e) => {
          alert(e + "\n\nVisit Preferences and click 'Check Instagram Login' to attempt to resolve this issue.");
          console.error(e);
          ig = null;
          resolve(null)
        });
      });
    } else if (helpers.next == 0) {
      return new CancelablePromise((resolve) => {
        ig.user.getIdByUsername(getFileGroup(url)).then((id) => {
          const userFeed = ig.feed.user(id);
          userFeed.items().then((items) => {
            helpers.next = [id, userFeed.serialize()];
            processItems(items, resolve, helpers);
          }).catch((e) => {console.error(e);resolve(null)});
        }).catch((e) => {console.error(e);resolve(null)});
      });
    } else {
      return new CancelablePromise((resolve) => {
        ig.state.deserializeCookieJar(JSON.parse(session)).then((data) => {
          const id = helpers.next[0];
          const feedSession = helpers.next[1];
          const userFeed = ig.feed.user(id);
          userFeed.deserialize(feedSession);
          if (!userFeed.isMoreAvailable()) {
            helpers.next = null;
            resolve({data: [], helpers: helpers});
            return;
          }
          userFeed.items().then((items) => {
            helpers.next = [id, userFeed.serialize()];
            processItems(items, resolve, helpers);
          }).catch((e) => {console.error(e);resolve(null)});
        }).catch((e) => {console.error(e);resolve(null)});
      });
    }
  } else {
    if (!instagramAlerted) {
      alert("You haven't authorized FlipFlip to work with Instagram yet.\nVisit Preferences and populate your username and password.\nNote this information is only kept on your computer and never shared with anyone else.");
      instagramAlerted = true;
    }
    return new CancelablePromise((resolve) => {
      resolve(null);
    });
  }
}

function loadDanbooru(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  let suffix = "";
  if (url.includes("/pool/")) {
    suffix = "/pool/show.json?page=" + (helpers.next + 1) + "&id=" + url.substring(url.lastIndexOf("/") + 1);
  } else {
    suffix = "/post/index.json?limit=20&page=" + (helpers.next + 1);
    const tagRegex = /[?&]tags=(.*)&?/g;
    let tags;
    if ((tags = tagRegex.exec(url)) !== null) {
      suffix += "&tags=" + tags[1];
    }
    const titleRegex = /[?&]title=(.*)&?/g;
    let title;
    if ((title = titleRegex.exec(url)) !== null) {
      if (tags == null) {
        suffix += "&tags=";
      } else if (!suffix.endsWith("+")) {
        suffix += "+";
      }
      suffix += title[1];
    }
  }
  return new CancelablePromise((resolve) => {
    wretch(thisHost + suffix)
      .get()
      .setTimeout(5000)
      .badRequest((e) => resolve(null))
      .notFound((e) => resolve(null))
      .timeout((e) => resolve(null))
      .internalError((e) => resolve(null))
      .onAbort((e) => resolve(null))
      .json((json: any) => {
        if (json.length == 0) {
          helpers.next = null;
          resolve({data: [], helpers: helpers});
        }

        let list;
        if (json.posts) {
          list = json.posts;
        } else {
          list = json;
        }

        const images = Array<string>();
        for (let p of list) {
          if (p.file_url) {
            let fileURL = p.file_url;
            if (!p.file_url.startsWith("http")) {
              fileURL = "https://" + p.file_url;
            }
            images.push(fileURL);
          }
        }

        helpers.next = url.includes("/pool/") ? null : helpers.next + 1;
        helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
        resolve({
          data: filterPathsToJustPlayable(filter, images, true),
          helpers: helpers,
        });
      });
  });
}

function loadGelbooru1(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  return new CancelablePromise((resolve) => {
    wretch(url + "&pid=" + (helpers.next * 10))
      .get()
      .setTimeout(5000)
      .onAbort((e) => resolve(null))
      .notFound((e) => resolve(null))
      .error(503, (e) => resolve(null))
      .text((html) => {
        let imageEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll("span.thumb > a");
        if (imageEls.length > 0) {
          let imageCount = 0;
          let images = Array<string>();

          const getImage = (index: number) => {
            let link = imageEls.item(index).getAttribute("href");
            if (!link.startsWith("http")) {
              link = thisHost + "/" + link;
            }
            wretch(link)
              .get()
              .setTimeout(5000)
              .onAbort((e) => resolve(null))
              .notFound((e) => resolve(null))
              .error(503, (e) => resolve(null))
              .text((html) => {
                imageCount++;
                let contentURL = html.match("<img alt=\"img\" src=\"(.*?)\"");
                if (contentURL != null) {
                  images.push(contentURL[1]);
                }
                if (imageCount == imageEls.length || imageCount == 10) {
                  helpers.next = helpers.next + 1;
                  helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                  resolve({
                    data: filterPathsToJustPlayable(filter, images, true),
                    helpers: helpers,
                  });
                }
              });

            if (index < imageEls.length - 1 && index < 9) {
              setTimeout(getImage.bind(null, index+1), 1000);
            }
          };

          setTimeout(getImage.bind(null, 0), 1000);
        } else {
          helpers.next = null;
          resolve({data: [], helpers: helpers});
        }
      });
  });
}

function loadGelbooru2(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  let suffix = "/index.php?page=dapi&s=post&q=index&limit=20&json=1&pid=" + (helpers.next + 1);
  const tagRegex = /[?&]tags=(.*)&?/g;
  let tags;
  if ((tags = tagRegex.exec(url)) !== null) {
    suffix += "&tags=" + tags[1];
  }
  return new CancelablePromise((resolve) => {
    wretch(thisHost + suffix)
      .get()
      .setTimeout(5000)
      .badRequest((e) => resolve(null))
      .notFound((e) => resolve(null))
      .timeout((e) => resolve(null))
      .internalError((e) => resolve(null))
      .onAbort((e) => resolve(null))
      .json((json: any) => {
        if (json.length == 0) {
          helpers.next = null;
          resolve({data: [], helpers: helpers});
        }

        const images = Array<string>();
        for (let p of json) {
          if (p.file_url) {
            images.push(p.file_url);
          } else if (p.image) {
            images.push(thisHost + "//images/" + p.directory + "/" + p.image);
          }
        }

        helpers.next = helpers.next + 1;
        helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
        resolve({
          data: filterPathsToJustPlayable(filter, images, true),
          helpers: helpers,
        });
      });
  });
}

function loadEHentai(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number}): CancelablePromise {
  const url = source.url;
  return new CancelablePromise((resolve) => {
    wretch(url + "?p=" + (helpers.next + 1))
      .get()
      .setTimeout(5000)
      .onAbort((e) => resolve(null))
      .notFound((e) => resolve(null))
      .text((html) => {
        let imageEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll("#gdt > .gdtm > div > a");
        if (imageEls.length > 0) {
          let imageCount = 0;
          let images = Array<string>();
          for (let image of imageEls) {
            wretch(image.getAttribute("href"))
              .get()
              .setTimeout(5000)
              .onAbort((e) => resolve(null))
              .notFound((e) => resolve(null))
              .text((html) => {
                imageCount++;
                let contentURL = html.match("<img id=\"img\" src=\"(.*?)\"");
                if (contentURL != null) {
                  images.push(contentURL[1]);
                }
                if (imageCount == imageEls.length) {
                  helpers.next = helpers.next + 1;
                  helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                  resolve({
                    data: filterPathsToJustPlayable(filter, images, true),
                    helpers: helpers,
                  })
                }
              })
          }
        } else {
          helpers.next = null;
          resolve({data: [], helpers: helpers});
        }
      });
  });
}

export default class HeadlessScenePlayer extends React.Component {
  readonly props: {
    config: Config,
    scene: Scene,
    nextScene?: Scene,
    opacity: number,
    isPlaying: boolean,
    hasStarted: boolean,
    strobeLayer?: string,
    historyOffset: number,
    advanceHack?: ChildCallbackHack,
    deleteHack?: ChildCallbackHack,
    setHistoryOffset(historyOffset: number): void,
    setHistoryPaths(historyPaths: Array<any>): void,
    firstImageLoaded(): void,
    finishedLoading(empty: boolean): void,
    setProgress(total: number, current: number, message: string): void,
    setVideo(video: HTMLVideoElement): void,
    setCount(sourceURL: string, count: number, countComplete: boolean): void,
    cache(i: HTMLImageElement | HTMLVideoElement): void,
    setTimeToNextFrame?(timeToNextFrame: number): void,
  };

  readonly state = {
    promiseQueue: Array<{source: LibrarySource, helpers: {next: any, count: number}}>(),
    promise: new CancelablePromise((resolve, reject) => {}),
    nextPromise: new CancelablePromise((resolve, reject) => {}),
    allURLs: new Map<string, Array<string>>(),
    restart: false,
    preload: false,
    videoVolume: this.props.scene.videoVolume,
  };

  _nextPromiseQueue: Array<{source: LibrarySource, helpers: {next: any, count: number}}> = null;
  _nextAllURLs: Map<string, Array<string>> = null;

  render() {
    return (
      <div
        className={`HeadlessScenePlayer ${this.props.opacity != 1 ? 'm-overlay' : ''}`}
        style={{opacity: this.props.opacity}}>

        {this.state.allURLs.size > 0 && this.state.restart == false && (
          <ImagePlayer
            config={this.props.config}
            scene={this.props.scene}
            isPlaying={this.props.isPlaying}
            historyOffset={this.props.historyOffset}
            setHistoryOffset={this.props.setHistoryOffset}
            setHistoryPaths={this.props.setHistoryPaths}
            maxInMemory={this.props.config.displaySettings.maxInMemory}
            maxLoadingAtOnce={this.props.config.displaySettings.maxLoadingAtOnce}
            maxToRememberInHistory={this.props.config.displaySettings.maxInHistory}
            advanceHack={this.props.advanceHack}
            deleteHack={this.props.deleteHack}
            strobeLayer={this.props.strobeLayer}
            hasStarted={this.props.hasStarted}
            allURLs={isEmpty(Array.from(this.state.allURLs.values())) ? null : this.state.allURLs}
            onLoaded={this.props.firstImageLoaded.bind(this)}
            setVideo={this.props.setVideo}
            cache={this.props.cache}
            setTimeToNextFrame={this.props.setTimeToNextFrame}/>)}
      </div>
    );
  }

  componentDidMount(restart = false) {
    if (!restart) {
      redditAlerted = false;
      tumblrAlerted = false;
      tumblr429Alerted = false;
      instagramAlerted = false;
      twitterAlerted = false;
      this._nextPromiseQueue = new Array<{ source: LibrarySource, helpers: {next: any, count: number} }>();
      this._nextAllURLs = new Map<string, Array<string>>();
    }
    let n = 0;
    let newAllURLs = new Map<string, Array<string>>();
    if (this.state.allURLs.size > 0) {
      newAllURLs = this.state.allURLs;
    }

    let sourceLoop = () => {
      if (this.state.promise.hasCanceled) return;

      const d = JSON.parse(JSON.stringify(this.props.scene.sources[n]));

      let message = d ? d.url : "";
      if (this.props.opacity != 1) {
        message = "<p>Loading Overlay...</p>" + message;
      }
      this.props.setProgress(this.props.scene.sources.length, n+1, message);

      if (!this.props.scene.playVideoClips && d.clips) {
        d.clips = [];
      }
      const loadPromise = getPromise(this.props.config, d, this.props.scene.imageTypeFilter, {next: -1, count: 0});
      this.setState({promise: loadPromise});

      loadPromise
        .getPromise()
        .then((object) => {
          let newPromiseQueue = this.state.promiseQueue;
          n += 1;

          // Just add the new urls to the end of the list
          if (object != null) {
            if (loadPromise.source.blacklist && loadPromise.source.blacklist.length > 0) {
              object.data = object.data.filter((url) => !loadPromise.source.blacklist.includes(url));
            }
            if (this.props.scene.weightFunction == WF.sources) {
              newAllURLs.set(loadPromise.source.url, object.data);
            } else {
              for (let d of object.data) {
                newAllURLs.set(d, [loadPromise.source.url]);
              }
            }

            // If this is a remote URL, queue up the next promise
            if (object.helpers.next != null) {
              newPromiseQueue.push({source: d, helpers: object.helpers});
            }
            this.props.setCount(d.url, object.helpers.count, object.helpers.next == null);
          }

          this.setState({allURLs: newAllURLs, promiseQueue: newPromiseQueue});
          if (n < this.props.scene.sources.length) {
            setTimeout(sourceLoop, loadPromise.timeout);
          } else {
            this.props.finishedLoading(isEmpty(Array.from(newAllURLs.values())));
            promiseLoop();
            if (this.props.nextScene) {
              n = 0;
              nextSourceLoop();
            }
          }
        });
    };

    let nextSourceLoop = () => {
      if (this.state.nextPromise.hasCanceled) return;

      const d = JSON.parse(JSON.stringify(this.props.nextScene.sources[n]));
      if (!this.props.scene.playVideoClips && d.clips) {
        d.clips = [];
      }
      const loadPromise = getPromise(this.props.config, d, this.props.nextScene.imageTypeFilter, {next: -1, count: 0});
      this.setState({nextPromise: loadPromise});

      loadPromise
        .getPromise()
        .then((object) => {
          n += 1;

          // Just add the new urls to the end of the list
          if (object != null) {
            if (loadPromise.source.blacklist && loadPromise.source.blacklist.length > 0) {
              object.data = object.data.filter((url) => !loadPromise.source.blacklist.includes(url));
            }
            if (this.props.nextScene.weightFunction == WF.sources) {
              this._nextAllURLs.set(loadPromise.source.url, object.data);
            } else {
              for (let d of object.data) {
                this._nextAllURLs.set(d, [loadPromise.source.url]);
              }
            }

            // If this is a remote URL, queue up the next promise
            if (object.helpers.next != null) {
              this._nextPromiseQueue.push({source: d.url, helpers: object.helpers});
            }
            this.props.setCount(d.url, object.helpers.count, object.helpers.next == null);
          }

          if (n < this.props.nextScene.sources.length) {
            setTimeout(nextSourceLoop, loadPromise.timeout);
          }
        });
    };

    let promiseLoop = () => {
      // Process until queue is empty or player has been stopped
      if (this.state.promiseQueue.length > 0 && !this.state.promise.hasCanceled) {
        const promiseData = this.state.promiseQueue.shift();
        const promise = getPromise(this.props.config, promiseData.source, this.props.scene.imageTypeFilter, promiseData.helpers);
        this.setState({promise: promise});

        promise
          .getPromise()
          .then((object) => {
            // If we are not at the end of a source
            if (object != null) {
              if (promise.source.blacklist && promise.source.blacklist.length > 0) {
                object.data = object.data.filter((url) => !promise.source.blacklist.includes(url));
              }

              // Update the correct index with our new images
              let newAllURLs = this.state.allURLs;
              if (this.props.scene.weightFunction == WF.sources) {
                let sourceURLs = newAllURLs.get(promise.source.url);
                if (!sourceURLs) sourceURLs = [];
                newAllURLs.set(promise.source.url, sourceURLs.concat(object.data.filter((u) => {
                  const fileName = getFileName(u);
                  const found = sourceURLs.map((u) => getFileName(u)).includes(fileName);
                  return !found;
                })));
              } else {
                for (let d of object.data.filter((u) => {
                  const fileName = getFileName(u);
                  const found = Array.from(newAllURLs.keys()).map((u) => getFileName(u)).includes(fileName);
                  return !found;
                })) {
                  newAllURLs.set(d, [promise.source.url]);
                }
              }

              // Add the next promise to the queue
              let newPromiseQueue = this.state.promiseQueue;
              if (object.helpers.next != null) {
                newPromiseQueue.push({source: promise.source, helpers: object.helpers});
              }
              this.props.setCount(promise.source.url, object.helpers.count, object.helpers.next == null);

              this.setState({allURLs: newAllURLs, promiseQueue: newPromiseQueue});
            }

            // If there is an overlay, double the timeout
            setTimeout(promiseLoop, promise.timeout);
          });
      }
    };

    if (this.state.preload) {
      this.setState({preload: false});
      promiseLoop();
      if (this.props.nextScene && isEmpty(Array.from(this._nextAllURLs.values()))) {
        n = 0;
        nextSourceLoop();
      }
    } else {
      sourceLoop();
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return props.scene !== this.props.scene ||
      (props.nextScene && this.props.nextScene &&
      props.nextScene.id !== this.props.nextScene.id) ||
      props.historyOffset !== this.props.historyOffset ||
      props.isPlaying !== this.props.isPlaying ||
      props.opacity !== this.props.opacity ||
      props.strobeLayer !== this.props.strobeLayer ||
      props.hasStarted !== this.props.hasStarted ||
      state.restart !== this.state.restart ||
      state.promise.source !== this.state.promise.source ||
      (state.allURLs.size > 0 && this.state.allURLs.size == 0);
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.scene.videoVolume !== this.state.videoVolume) {
      this.setState({videoVolume: this.props.scene.videoVolume});
    }
    if (props.scene.id !== this.props.scene.id) {
      state.nextPromise.cancel();
      state.promise.cancel();
      if (props.nextScene != null && this.props.scene.id === props.nextScene.id) { // If the next scene has been played
        if (this.props.nextScene && this.props.nextScene.id === props.scene.id) { // Just swap values if we're coming back to this scene again
          const newAllURLs = this._nextAllURLs;
          const newPromiseQueue = this._nextPromiseQueue;
          this._nextAllURLs = state.allURLs;
          this._nextPromiseQueue = state.promiseQueue;
          this.setState({
            promiseQueue: newPromiseQueue,
            promise: new CancelablePromise((resolve, reject) => {}),
            nextPromise: new CancelablePromise((resolve, reject) => {}),
            allURLs: newAllURLs,
            preload: true,
            restart: true
          });
        } else { // Replace values
          this.setState({
            promiseQueue: this._nextPromiseQueue,
            promise: new CancelablePromise((resolve, reject) => {}),
            nextPromise: new CancelablePromise((resolve, reject) => {}),
            allURLs: this._nextAllURLs,
            preload: true,
            restart: true
          });
          this._nextPromiseQueue = Array<{source: LibrarySource, helpers: {next: any, count: number}}>();
          this._nextAllURLs = new Map<string, Array<string>>();
        }
      } else {
        this.setState({
          promiseQueue: Array<{ source: string, next: any }>(),
          promise: new CancelablePromise((resolve, reject) => {}),
          nextPromise: new CancelablePromise((resolve, reject) => {}),
          allURLs: new Map<string, Array<string>>(),
          preload: false,
          restart: true
        });
      }
    }
    if (this.state.restart == true) {
      this.setState({restart: false});
      this.componentDidMount(true);
    }
  }

  componentWillUnmount() {
    this.state.nextPromise.cancel();
    this.state.promise.cancel();
    this._nextPromiseQueue = null;
    this._nextAllURLs = null;
  }
}
