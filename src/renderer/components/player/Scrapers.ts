import path from "path";
import wretch from "wretch";
import {DOMParser} from "xmldom";
// @ts-ignore
import domino from "domino-ext";
import tumblr from "tumblr.js";
import Snoowrap from "snoowrap";
import * as imgur from "imgur";
import * as Twitter from "twitter";
import {IgApiClient} from "instagram-private-api";

import {IF, RF, RT, ST, WF} from "../../data/const";
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";

const pm = (object: any, resolve?: Function) => {
  if (object?.source && object?.data && object?.allURLs && object?.weight && object?.helpers) {
    const source = object.source;
    if (source.blacklist && source.blacklist.length > 0) {
      object.data = object.data.filter((url: string) => !source.blacklist.includes(url));
    }
    object.allURLs = processAllURLs(object.data, object.allURLs, object.source, object.weight, object.helpers);
  }
  if (!!resolve) {
    resolve({data: object});
  } else {
    // @ts-ignore
    postMessage(object);
  }
}

export const processAllURLs = (data: string[], allURLs: Map<string, string[]>, source: LibrarySource, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}): Map<string, string[]> => {
  let newAllURLs = new Map(allURLs);
  if (helpers.next != null && helpers.next <= 0) {
    if (weight == WF.sources) {
      newAllURLs.set(source.url, data);
    } else {
      for (let d of data) {
        newAllURLs.set(d, [source.url]);
      }
    }
  } else {
    if (weight == WF.sources) {
      let sourceURLs = newAllURLs.get(source.url);
      if (!sourceURLs) sourceURLs = [];
      newAllURLs.set(source.url, sourceURLs.concat(data.filter((u: string) => {
        const fileName = getFileName(u);
        const found = sourceURLs.map((u: string) => getFileName(u)).includes(fileName);
        return !found;
      })));
    } else {
      for (let d of data.filter((u: string) => {
        const fileName = getFileName(u);
        const found = Array.from(newAllURLs.keys()).map((u: string) => getFileName(u)).includes(fileName);
        return !found;
      })) {
        newAllURLs.set(d, [source.url]);
      }
    }
  }
  return newAllURLs;
}

let redditAlerted = false;
let tumblrAlerted = false;
let tumblr429Alerted = false;
let twitterAlerted = false;
let instagramAlerted = false;
let hydrusAlerted = false;
let piwigoAlerted = false;

export const reset = () => {
  redditAlerted = false;
  tumblrAlerted = false;
  tumblr429Alerted = false;
  twitterAlerted = false;
  instagramAlerted = false;
  hydrusAlerted = false;
  piwigoAlerted = false;
}

export const loadRemoteImageURLList = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
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
                allURLs: allURLs,
                weight: weight,
                helpers: helpers,
                source: source,
                timeout: 0,
              }, resolve);
            }
          })
            .catch ((error: any) => {
              convertedCount++;
              if (convertedCount == lines.length) {
                helpers.count = filterPathsToJustPlayable(IF.any, convertedSource, true).length;
                pm({
                  error: error.message,
                  data: filterPathsToJustPlayable(filter, convertedSource, true),
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: 0,
                }, resolve);
              }
            });
        }
      } else {
        pm({
          warning: "No lines in" + url + " are links or files",
          helpers: helpers,
          source: source,
          timeout: 0,
        }, resolve);
      }
    })
    .catch((e) => {
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: 0,
      }, resolve);
    });
}

export const loadTumblr = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
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
      }, resolve);
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
          error: err.message,
          systemMessage: systemMessage,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
        return;
      }

      // End loop if we're at end of posts
      if (data.posts.length == 0) {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
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
              helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedSource, false).length;
              pm({
                data: filterPathsToJustPlayable(filter, convertedSource, false),
                allURLs: allURLs,
                weight: weight,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }, resolve);
            }
          })
            .catch ((error: any) => {
              convertedCount++;
              if (convertedCount == images.length) {
                helpers.next = helpers.next + 1;
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedSource, false).length;
                pm({
                  error: error.message,
                  data: filterPathsToJustPlayable(filter, convertedSource, false),
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              }
            });
        }
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
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
    }, resolve);
  }
}

export const loadReddit = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
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
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, false).length;
                pm({
                  data: filterPathsToJustPlayable(filter, convertedListing, false),
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              }
            })
              .catch ((error: any) => {
                convertedCount++;
                if (convertedCount == submissionListing.length) {
                  helpers.next = submissionListing[submissionListing.length - 1].name;
                  helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, false).length;
                  pm({
                    error: error.message,
                    data: filterPathsToJustPlayable(filter, convertedListing, false),
                    allURLs: allURLs,
                    weight: weight,
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  }, resolve);
                }
              });
          }
        } else {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        }
      };
      const errorSubmission = (error: any) => {
        pm({
          error: error.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
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
                  helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, false).length;
                  pm({
                    data: filterPathsToJustPlayable(filter, convertedListing, false),
                    allURLs: allURLs,
                    weight: weight,
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  }, resolve);
                }
              })
                .catch ((error: any) => {
                  convertedCount++;
                  if (convertedCount == submissionListing.length) {
                    helpers.next = submissionListing[submissionListing.length - 1].name;
                    helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, false).length;
                    pm({
                      error: error.message,
                      data: filterPathsToJustPlayable(filter, convertedListing, false),
                      allURLs: allURLs,
                      weight: weight,
                      helpers: helpers,
                      source: source,
                      timeout: timeout,
                    }, resolve);
                  }
                });
            }
          } else {
            helpers.next = null;
            pm({
              data: [],
              allURLs: allURLs,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve);
          }
        }).catch((err: any) => {
          pm({
            error: err.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
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
                  helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, false).length;
                  pm({
                    data: filterPathsToJustPlayable(filter, convertedListing, false),
                    allURLs: allURLs,
                    weight: weight,
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  }, resolve);
                }
              })
                .catch ((error: any) => {
                  convertedCount++;
                  if (convertedCount == submissionListing.length) {
                    helpers.next = submissionListing[submissionListing.length - 1].name;
                    helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, convertedListing, false).length;
                    pm({
                      error: error.message,
                      data: filterPathsToJustPlayable(filter, convertedListing, false),
                      allURLs: allURLs,
                      weight: weight,
                      helpers: helpers,
                      source: source,
                      timeout: timeout,
                    }, resolve);
                  }
                });
            }
          } else {
            helpers.next = null;
            pm({
              data: [],
              allURLs: allURLs,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve);
          }
        }).catch((err: any) => {
          pm({
            error: err.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
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
    }, resolve);
  }
}

export const loadRedGifs = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 10000;
  const url = source.url;
  let apiURL = "https://api.redgifs.com/v2/";
  let orderRegex = /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*order=([^&]*)/.exec(url);
  let order = null;
  if (!!orderRegex) {
    order = orderRegex[1];
  }
  let typeRegex = /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*type=(\w)/.exec(url);
  let type = null;
  if (!!typeRegex) {
    type = typeRegex[1];
  }
  let tagsRegex = /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*tags=([^&]*)/.exec(url);
  let tags = null;
  if (!!tagsRegex) {
    tags = tagsRegex[1];
  }
  let ratioRegex = /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*ratio=(\w)/.exec(url);
  let ratio = null;
  if (!!ratioRegex) {
    ratio = ratioRegex[1];
  }
  let verifiedRegex = /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*verified=(\w)/.exec(url);
  let verified = null;
  if (!!verifiedRegex) {
    verified = verifiedRegex[1];
  }
  let longRegex = /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*long=(\w)/.exec(url);
  let long = null;
  if (!!longRegex) {
    long = longRegex[1];
  }
  let soundRegex = /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*sound=(\w)/.exec(url);
  let sound = null;
  if (!!soundRegex) {
    sound = soundRegex[1];
  }

  if (url.includes("/users/")) {
    apiURL += "users/" + getFileGroup(url) + "/search?";
    if (!order) {
      order="recent"
    }
  } else if (url.includes("/browse?")) {
    apiURL += "gifs/search?search_text=" + tags + "&count=80&";
    if (!order) {
      order="trending"
    }
  }
  let page = helpers.next + 1;
  if (!!type) {
    apiURL += "type=" + type + "&";
  }
  if (!!ratio) {
    apiURL += "ratio=" + ratio + "&";
  }
  if (!!verified) {
    apiURL += "verified=" + verified + "&";
  }
  if (!!long) {
    apiURL += "long=" + long + "&";
  }
  if (!!sound) {
    apiURL += "sound=" + sound + "&";
  }
  apiURL += "order=" + order + "&page=" + page + "";

  wretch(apiURL)
    .get()
    .setTimeout(15000)
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .json((json) => {
      const images = json.gifs.map((g: any) => {
        if (g.urls.hd) {
          return g.urls.hd;
        } else if (g.urls.sd) {
          return g.urls.sd;
        }
        return null;
      }).filter((url: string) => !!url);
      helpers.next = json.page == json.pages ? null : (helpers.next + 1);
      helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
      pm({
        data: filterPathsToJustPlayable(filter, images, false),
        allURLs: allURLs,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    })
    .catch((err: any) => {
      pm({
        error: err.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    });
}

export const loadImageFap = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  const url = source.url;
  if (url.includes("/pictures/")) {
    wretch("https://www.imagefap.com/gallery/" + getFileGroup(url) + "?view=2")
      .get()
      .setTimeout(15000)
      .onAbort((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .text((html) => {
        let imageEls = domino.createWindow(html).document.querySelectorAll(".expp-container > form > table > tbody > tr > td");
        let images = Array<string>();
        if (imageEls.length > 0) {
          helpers.count = imageEls.length;
          let imageCount = helpers.next > 0 ? helpers.next : 0;
          const imageLoop = () => {
            const image = imageEls.item(imageCount++);
            wretch("https://www.imagefap.com/photo/" + image.id + "/")
              .get()
              .text((html) => {
                let captcha = undefined;
                let contentURL = html.match("\"contentUrl\": \"(.*?)\",");
                if (contentURL != null) {
                  images.push(contentURL[1]);
                } else {
                  captcha = "https://www.imagefap.com/photo/" + image.id + "/";
                }
                if (imageCount == imageEls.length || captcha != null) {
                  helpers.next = imageCount == imageEls.length ? null : imageCount;
                  pm({
                    captcha: captcha,
                    data: filterPathsToJustPlayable(filter, images, false),
                    allURLs: allURLs,
                    weight: weight,
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  }, resolve);
                } else {
                  setTimeout(imageLoop, 200);
                }
              });
          }
          imageLoop();
        } else {
          let captcha = undefined;
          if (html.includes("Enter the captcha")) {
            helpers.count = source.count;
            captcha = "https://www.imagefap.com/gallery/" + getFileGroup(url) + "?view=2";
            images = allURLs.get(url);
            pm({warning: source.url + " - blocked due to captcha"}, resolve);
          } else {
            helpers.next = null;
          }
          pm({
            captcha: captcha,
            data: images,
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        }
      });
  } else if (url.includes("/organizer/")) {
    if (helpers.next == 0) {
      helpers.next = [0, 0, 0];
    }
    wretch(url + "?page=" + helpers.next[0])
      .get()
      .setTimeout(10000)
      .onAbort((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .text((html) => {
        let albumEls = domino.createWindow(html).document.querySelectorAll("td.blk_galleries > font > a.blk_galleries");
        if (albumEls.length == 0) {
          let captcha = undefined;
          if (html.includes("Enter the captcha")) {
            helpers.count = source.count;
            captcha = "https://www.imagefap.com/gallery/" + getFileGroup(url) + "?view=2";
            pm({warning: source.url + " - blocked due to captcha"}, resolve);
          }
          helpers.next = null;
          pm({
            captcha: captcha,
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        } else if (albumEls.length > helpers.next[1]) {
          let albumEl = albumEls[helpers.next[1]];
          let albumID = albumEl.getAttribute("href").substring(albumEl.getAttribute("href").lastIndexOf("/") + 1);
          wretch("https://www.imagefap.com/gallery/" + albumID + "?view=2")
            .get()
            .setTimeout(15000)
            .onAbort((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .text((html) => {
              let imageEls = domino.createWindow(html).document.querySelectorAll(".expp-container > form > table > tbody > tr > td");
              let images = Array<string>();
              if (imageEls.length > 0) {
                let imageCount = helpers.next[2];
                const imageLoop = () => {
                  const image = imageEls.item(imageCount++);
                  wretch("https://www.imagefap.com/photo/" + image.id + "/")
                    .get()
                    .text((html) => {
                      let captcha = undefined;
                      let contentURL = html.match("\"contentUrl\": \"(.*?)\",");
                      if (contentURL != null) {
                        images.push(contentURL[1]);
                      } else {
                        captcha = "https://www.imagefap.com/photo/" + image.id + "/";
                      }
                      if (imageCount == imageEls.length || captcha != null) {
                        if (imageCount == imageEls.length) {
                            helpers.next[2] = 0;
                            helpers.next[1] += 1;
                            helpers.count += imageEls.length;
                        } else {
                            helpers.next = imageCount;
                        }
                        pm({
                          captcha: captcha,
                          data: filterPathsToJustPlayable(filter, images, false),
                          allURLs: allURLs,
                          weight: weight,
                          helpers: helpers,
                          source: source,
                          timeout: timeout,
                        }, resolve);
                      } else {
                        setTimeout(imageLoop, 200);
                      }
                    });
                }
                imageLoop();
              } else {
                let captcha = undefined;
                if (html.includes("Enter the captcha")) {
                  helpers.count = source.count;
                  captcha = "https://www.imagefap.com/gallery/" + getFileGroup(url) + "?view=2";
                  pm({warning: source.url + " - blocked due to captcha"}, resolve);
                } else {
                  helpers.next[1] += 1;
                }
                pm({
                  captcha: captcha,
                  data: [],
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              }
            });
        } else {
          let images = Array<string>();
          let captcha = undefined;
          if (html.includes("Enter the captcha")) {
            helpers.count = source.count;
            captcha = "https://www.imagefap.com/gallery/" + getFileGroup(url) + "?view=2";
            images = allURLs.get(url);
            pm({warning: source.url + " - blocked due to captcha"}, resolve);
          } else {
            helpers.next[0] += 1;
            helpers.next[1] = 0;
          }
          pm({
            captcha: captcha,
            data: images,
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        }
      })
      .catch((e) => {
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      });
  } else if (url.includes("/video.php?vid=")) {
    helpers.next = null;
    pm({
      data: [],
      allURLs: allURLs,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve);
    // This doesn't work anymore due to src url requiring referer
    /*wretch(url)
      .get()
      .setTimeout(10000)
      .onAbort((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .text((html) => {
        const findVideoURLs = /url: '(https:\/\/cdn-fck\.moviefap\.com\/moviefap\/.*)',/g.exec(html);
        if (findVideoURLs) {
          let videoURLs = Array<string>();
          for (let v of findVideoURLs) {
            if (!v.startsWith('url:')) {
              videoURLs.push(v);
            }
          }
          helpers.next = null;
          helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, videoURLs, false).length;
          pm({
            data: filterPathsToJustPlayable(filter, videoURLs, false),
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        } else {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        }
      });*/
  } else {
    helpers.next = null;
    pm({
      data: [],
      allURLs: allURLs,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve);
  }
}

export const loadSexCom = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  const url = source.url;
  // This doesn't work anymore due to src url requiring referer
  helpers.next = null;
  pm({
    data: [],
    allURLs: allURLs,
    weight: weight,
    helpers: helpers,
    source: source,
    timeout: timeout,
  }, resolve);
  /*let requestURL;
  if (url.includes("/user/")) {
    requestURL = "https://www.sex.com/user/" + getFileGroup(url) + "?page=" + (helpers.next + 1);
  } else if (url.includes("/gifs/") || url.includes("/pics/") || url.includes("/videos/")) {
    requestURL = "https://www.sex.com/" + getFileGroup(url) + "?page=" + (helpers.next + 1);
  }
  wretch(requestURL)
    .get()
    .setTimeout(5000)
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .text((html) => {
      let imageEls = domino.createWindow(html).document.querySelectorAll(".small_pin_box > .image_wrapper > img");
      if (imageEls.length > 0) {
        let videos = Array<string>();
        let images = Array<string>();
        for (let i = 0; i < imageEls.length; i++) {
          const image = imageEls.item(i);
          if (image.nextElementSibling || image.previousElementSibling) {
            videos.push(image.parentElement.getAttribute("href"));
          } else {
            images.push(image.getAttribute("data-src"));
          }
        }
        if (videos.length == 0) {
          helpers.next = helpers.next + 1;
          helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
          pm({
            data: filterPathsToJustPlayable(filter, images, false),
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        } else {
          const validImages = filterPathsToJustPlayable(filter, images, false);
          images = [];
          let count = 0;
          for (let videoURL of videos) {
            wretch("https://www.sex.com" + videoURL)
              .get()
              .setTimeout(5000)
              .onAbort((e) => pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }, resolve))
              .notFound((e) => pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }, resolve))
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
                  const validVideos = filterPathsToJustPlayable(IF.any, images, true);
                  const filePaths = validImages.concat(validVideos);
                  helpers.next = helpers.next + 1;
                  helpers.count = helpers.count + filePaths.length;
                  pm({
                    data: filePaths,
                    allURLs: allURLs,
                    weight: weight,
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  }, resolve);
                }
              });
          }
        }
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      }
    });*/
}

export const loadImgur = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 3000;
  const url = source.url;
  imgur.getAlbumInfo(getFileGroup(url))
    .then((json: any) => {
      const images = json.data.images.map((i: any) => i.link);
      helpers.next = null;
      helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
      pm({
        data: filterPathsToJustPlayable(filter, images, true),
        allURLs: allURLs,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    })
    .catch((err: any) => {
      pm({
        error: err.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    });
}

export const loadTwitter = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 3000;
  let configured = config.remoteSettings.twitterAccessTokenKey != "" && config.remoteSettings.twitterAccessTokenSecret != "";
  if (configured) {
    const includeRetweets = source.includeRetweets;
    const includeReplies = source.includeReplies;
    const url = source.url;
    const twitter = new Twitter({
      consumer_key: config.remoteSettings.twitterConsumerKey,
      consumer_secret: config.remoteSettings.twitterConsumerSecret,
      access_token_key: config.remoteSettings.twitterAccessTokenKey,
      access_token_secret: config.remoteSettings.twitterAccessTokenSecret,
    });
    twitter.get('statuses/user_timeline',
      helpers.next == 0 ? {screen_name: getFileGroup(url), count: 200, exclude_replies: !includeReplies, include_rts: includeRetweets, tweet_mode: 'extended'} : {screen_name: getFileGroup(url), count: 200, exclude_replies: !includeReplies, include_rts: includeRetweets, tweet_mode: 'extended', max_id: helpers.next},
      (error: any, tweets: any) => {
        if (error) {
          pm({
            error: error.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
          return;
        }
        let images = Array<string>();
        let lastID = "";
        for (let t of tweets) {
          // Skip FanCentro/OnlyFans/ClipTeez posts
          if (/href="https?:\/\/(fancentro\.com|onlyfans\.com|mykink\.xxx)\/?"/.exec(t.source) != null) continue;
          if (t.extended_entities && t.extended_entities.media) {
            for (let m of t.extended_entities.media) {
              let url;
              if (m.video_info) {
                url = m.video_info.variants[0].url;
              } else {
                url = m.media_url;
              }
              if (url.includes("?")) {
                url = url.substring(0, url.lastIndexOf("?"));
              }
              images.push(url);
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
          pm({
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        } else {
          helpers.next = lastID;
          helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
          pm({
            data: filterPathsToJustPlayable(filter, images, true),
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        }
      })
  } else {
    let systemMessage = undefined;
    if (!twitterAlerted) {
      systemMessage = "You haven't authorized FlipFlip to work with Twitter yet.\nVisit Settings to authorize Twitter.";
      twitterAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve);
  }
}

export const loadDeviantArt = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 3000;
  const url = source.url;
  wretch("https://backend.deviantart.com/rss.xml?type=deviation&q=by%3A" + getFileGroup(url) + "+sort%3Atime+meta%3Aall" + (helpers.next != 0 ? "&offset=" + helpers.next : ""))
    .get()
    .setTimeout(5000)
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .text((text) => {
      const xml = new DOMParser().parseFromString(text, "text/xml");
      let hasNextPage = false;
      const pages = xml.getElementsByTagName("atom:link");
      for (let l = 0; l < pages.length; l++) {
        if (pages[l].getAttribute("rel") == "next") hasNextPage = true;
      }
      let images = Array<string>();
      const items = xml.getElementsByTagName("item");
      for (let i = 0; i < items.length; i++) {
        helpers.next+=1;
        const contents = items[i].getElementsByTagName("media:content");
        for (let c = 0; c < contents.length; c++) {
          const content = contents[c];
          if (content.getAttribute("medium") == "image") {
            images.push(content.getAttribute("url"));
          }
        }
      }
      if (!hasNextPage) {
        helpers.next = null;
      }
      helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
      pm({
        data: filterPathsToJustPlayable(filter, images, false),
        allURLs: allURLs,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    });
}

let ig: IgApiClient = null;
let session: any = null;
export const loadInstagram = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 3000;
  const configured = config.remoteSettings.instagramUsername != "" && config.remoteSettings.instagramPassword != "";
  if (configured) {
    const url = source.url;
    const processItems = (items: any, helpers: {next: any, count: number, retries: number, uuid: string}) => {
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
      pm({
        data: filterPathsToJustPlayable(filter, images, false),
        allURLs: allURLs,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    };

    if (ig == null) {
      ig = new IgApiClient();
      ig.state.generateDevice(config.remoteSettings.instagramUsername);
      ig.account.login(config.remoteSettings.instagramUsername, config.remoteSettings.instagramPassword).then((loggedInUser) => {
        ig.state.serializeCookieJar().then((cookies) => {
          session = JSON.stringify(cookies);
          ig.user.getIdByUsername(getFileGroup(url)).then((id) => {
            const userFeed = ig.feed.user(id);
            userFeed.items().then((items) => {
              helpers.next = [id, userFeed.serialize()];
              processItems(items, helpers);
            }).catch((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve));
          }).catch((e) => pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve));
        }).catch((e) => pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve));
      }).catch((e) => {
        pm({
          error: e.message,
          systemMessage: e + "\n\nVisit Settings to authorize Instagram and attempt to resolve this issue.",
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
        ig = null;
      });
    } else if (helpers.next == 0) {
      ig.user.getIdByUsername(getFileGroup(url)).then((id) => {
        const userFeed = ig.feed.user(id);
        userFeed.items().then((items) => {
          helpers.next = [id, userFeed.serialize()];
          processItems(items, helpers);
        }).catch((e) => pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve));
      }).catch((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve));
    } else {
      ig.state.deserializeCookieJar(JSON.parse(session)).then((data) => {
        const id = helpers.next[0];
        const feedSession = helpers.next[1];
        const userFeed = ig.feed.user(id);
        userFeed.deserialize(feedSession);
        if (!userFeed.isMoreAvailable()) {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
          return;
        }
        userFeed.items().then((items) => {
          helpers.next = [id, userFeed.serialize()];
          processItems(items, helpers);
        }).catch((e) => pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve));
      }).catch((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve));
    }
  } else {
    let systemMessage = undefined;
    if (!instagramAlerted) {
      systemMessage = "You haven't authorized FlipFlip to work with Instagram yet.\nVisit Settings to authorize Instagram.";
      instagramAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve);
  }
}

export const loadE621 = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  let suffix = "";
  if (url.includes("/pools/")) {
    suffix = "/pools.json?search[id]=" + url.substring(url.lastIndexOf("/") + 1);

    wretch(thisHost + suffix)
      .get()
      .setTimeout(5000)
      .badRequest((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .notFound((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .timeout((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .internalError((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .onAbort((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .json((json: any) => {
        if (json.length == 0) {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
          return;
        }

        const count = json[0].post_count;
        const images = Array<string>();
        for (let postID of json[0].post_ids) {
          suffix = "/posts/" + postID + ".json";
          wretch(thisHost + suffix)
            .get()
            .setTimeout(5000)
            .badRequest((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .notFound((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .timeout((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .internalError((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .onAbort((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .json((json: any) => {
              if (json.post && json.post.file.url) {
                let fileURL = json.post.file.url;
                if (!fileURL.startsWith("http")) {
                  fileURL = "https://" + fileURL;
                }
                images.push(fileURL);
              }

              if (images.length == count) {
                helpers.next = null;
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, true),
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              }
            })
            .catch((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve));
        }
      })
      .catch((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve));
  } else {
    suffix = "/posts.json?limit=20&page=" + (helpers.next + 1);
    const tagRegex = /[?&]tags=(.*)&?/g;
    let tags;
    if ((tags = tagRegex.exec(url)) !== null) {
      suffix += "&tags=" + tags[1];
    }

    wretch(thisHost + suffix)
      .get()
      .setTimeout(5000)
      .badRequest((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .notFound((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .timeout((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .internalError((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .onAbort((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .json((json: any) => {
        if (json.length == 0) {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        }

        let list = json.posts;
        const images = Array<string>();
        for (let p of list) {
          if (p.file.url) {
            let fileURL = p.file.url;
            if (!fileURL.startsWith("http")) {
              fileURL = "https://" + fileURL;
            }
            images.push(fileURL);
          }
        }

        helpers.next = helpers.next + 1;
        helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
        pm({
          data: filterPathsToJustPlayable(filter, images, true),
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      })
      .catch((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve));
  }
}

export const loadDanbooru = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  let suffix = "";
  if (url.includes("/pools/")) {
    suffix = "/pools/" + url.substring(url.lastIndexOf("/") + 1) + ".json";
  } else if (url.includes("favorite_groups")) {
    suffix = "/favorite_groups/" + url.substring(url.lastIndexOf("/") + 1) + ".json";
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
  wretch(thisHost + suffix)
    .get()
    .setTimeout(5000)
    .badRequest((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .timeout((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .internalError((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .json((json: any) => {
      if (json.length == 0) {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
        return;
      }

      if (json.post_ids) {
        if (json.post_ids.length == 0) {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
          return;
        }

        const images = Array<string>();
        const postIDs = json.post_ids;
        const limit = 10;
        let current = helpers.next;
        const getPost = () => {
          wretch(thisHost + "/posts/" + postIDs[current++] + ".json")
            .get()
            .setTimeout(5000)
            .badRequest((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .notFound((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .timeout((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .internalError((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .onAbort((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .json((json: any) => {
              images.push(json.file_url);
              if (images.length == limit || postIDs.length == current) {
                if (postIDs.length == current) {
                  helpers.next = null;
                } else {
                  helpers.next = current;
                }
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, true),
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              } else {
                setTimeout(getPost, 200);
              }
            })
            .catch((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve));
        }
        setTimeout(getPost, 200);
      } else {
        const images = Array<string>();
        for (let p of json) {
          if (p.file_url) {
            let fileURL = p.file_url;
            if (!p.file_url.startsWith("http")) {
              fileURL = "https://" + p.file_url;
            }
            images.push(fileURL);
          }
        }

        helpers.next = helpers.next + 1;
        helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
        pm({
          data: filterPathsToJustPlayable(filter, images, true),
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      }
    })
    .catch((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve));
}

export const loadGelbooru1 = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  wretch(url + "&pid=" + (helpers.next * 10))
    .get()
    .setTimeout(5000)
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .error(503, (e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .text((html) => {
      let imageEls = domino.createWindow(html).document.querySelectorAll("span.thumb > a");
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
            .onAbort((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .notFound((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .error(503, (e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .text((html) => {
              imageCount++;
              let contentURL = html.match("<img[^>]*id=\"?image\"?[^>]*src=\"([^\"]*)\"");
              if (contentURL != null) {
                let url = contentURL[1];
                if (url.startsWith("//")) url = "http:" + url;
                images.push(url);
              }
              contentURL = html.match("<img[^>]*src=\"([^\"]*)\"[^>]*id=\"?image\"?");
              if (contentURL != null) {
                let url = contentURL[1];
                if (url.startsWith("//")) url = "http:" + url;
                images.push(url);
              }
              contentURL = html.match("<video[^>]*src=\"([^\"]*)\"");
              if (contentURL != null) {
                let url = contentURL[1];
                if (url.startsWith("//")) url = "http:" + url;
                images.push(url);
              }
              if (imageCount == imageEls.length || imageCount == 10) {
                helpers.next = helpers.next + 1;
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, false),
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              }
            });

          if (index < imageEls.length - 1 && index < 9) {
            setTimeout(getImage.bind(null, index+1), 1000);
          }
        };

        setTimeout(getImage.bind(null, 0), 1000);
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      }
    });
}

export const loadGelbooru2 = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  let suffix = "/index.php?page=dapi&s=post&q=index&limit=20&json=1&pid=" + (helpers.next + 1);
  const tagRegex = /[?&]tags=(.*)&?/g;
  let tags;
  if ((tags = tagRegex.exec(url)) !== null) {
    suffix += "&tags=" + tags[1];
  }
  wretch(thisHost + suffix)
    .get()
    .setTimeout(5000)
    .badRequest((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .timeout((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .internalError((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .json((json: any) => {
      if (json.length == 0) {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
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
      pm({
        data: filterPathsToJustPlayable(filter, images, true),
        allURLs: allURLs,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    })
    .catch((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve));
}

export const loadEHentai = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  const url = source.url;
  wretch(url + "?p=" + (helpers.next + 1))
    .get()
    .setTimeout(5000)
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .text((html) => {
      let imageEls = domino.createWindow(html).document.querySelectorAll("#gdt > .gdtm > div > a");
      if (imageEls.length > 0) {
        let imageCount = 0;
        let images = Array<string>();
        for (let i = 0; i < imageEls.length; i++) {
          const image = imageEls.item(i)
          wretch(image.getAttribute("href"))
            .get()
            .setTimeout(5000)
            .onAbort((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .notFound((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .text((html) => {
              imageCount++;
              let contentURL = html.match("<img id=\"img\" src=\"(.*?)\"");
              if (contentURL != null) {
                images.push(contentURL[1]);
              }
              if (imageCount == imageEls.length) {
                helpers.next = helpers.next + 1;
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, true),
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              }
            })
        }
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      }
    });
}

export const loadLuscious = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 5000;
  const url = source.url;
  if (url.includes("albums")) {
    const name = getFileGroup(url);
    const id = name.substring(name.indexOf("_") + 1, name.length);
    wretch("https://members.luscious.net/graphql/nobatch/?operationName=AlbumListOwnPictures")
      .json({
        "operationName": "AlbumListOwnPictures",
        "query": "query AlbumListOwnPictures($input: PictureListInput!) {\n" +
          "picture {\n" +
          "list(input: $input) {\n" +
          "info {...FacetCollectionInfo}\n" +
          "items {...PictureStandardWithoutAlbum}\n" +
          "}\n" +
          "}\n" +
          "}\n" +
          "fragment FacetCollectionInfo on FacetCollectionInfo {\n" +
          "page\n" +
          "has_next_page\n" +
          "has_previous_page\n" +
          "total_items\n" +
          "total_pages\n" +
          "items_per_page\n" +
          "}\n" +
          "fragment PictureStandardWithoutAlbum on Picture {\n" +
          "url_to_original\n" +
          "url_to_video\n" +
          "url\n" +
          "}",
        "variables": {
          "input": {
            "filters": [
              {
                "name": "album_id",
                "value": id,
              }
            ],
            "display": "position",
            "page": helpers.next + 1,
          }
        }
      })
      .post()
      .setTimeout(5000)
      .onAbort((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .notFound((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .json((json) => {
        const hasNextPage = json.data.picture.list.info.has_next_page;
        const items = json.data.picture.list.items;
        const totalItems = json.data.picture.list.info.total_items;
        if (items.length > 0) {
          const images = [];
          for (let item of items) {
            images.push(item.url_to_original);
          }
          helpers.next = hasNextPage ? helpers.next + 1 : null;
          helpers.count = totalItems;
          // If cdnio image server goes down, use this: filterPathsToJustPlayable(filter, images, true).map((s) => s.replace('cdnio.', 'w1680.')),
          pm({
            data: filterPathsToJustPlayable(filter, images, true),
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        } else {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        }
      })
      .catch((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve));
  } else {
    const id = getFileGroup(url);
    if (helpers.next == 0) {
      helpers.next = [0, 0, 0];
    }
    wretch("https://members.luscious.net/graphql/nobatch/?operationName=AlbumList")
      .json({
        "operationName": "AlbumList",
        "query": "query AlbumList($input: AlbumListInput!) {\n" +
          "album {\n" +
            "list(input: $input) {\n" +
              "info {...FacetCollectionInfo}\n" +
              "items {...AlbumMinimal}\n" +
            "}\n" +
          "}\n" +
        "}\n" +
        "fragment FacetCollectionInfo on FacetCollectionInfo {\n" +
          "page\n" +
          "has_next_page\n" +
          "has_previous_page\n" +
          "total_items\n" +
          "total_pages\n" +
          "url_complete\n" +
        "}\n" +
        "fragment AlbumMinimal on Album {\n" +
          "id\n" +
        "}",
        "variables": {
          "input": {
            "display": "date_newest",
            "filters": [
              {
                "name": "created_by_id",
                "value": id
              }
            ],
            "page": helpers.next[0] + 1,
          }
        }
      })
      .post()
      .setTimeout(5000)
      .onAbort((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .notFound((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve))
      .json((json) => {
        const userHasNextPage = json.data.album.list.info.has_next_page;
        const albums = json.data.album.list.items;
        if (albums.length > 0) {
          const album = albums[helpers.next[1]];
          wretch("https://members.luscious.net/graphql/nobatch/?operationName=AlbumListOwnPictures")
            .json({
              "operationName": "AlbumListOwnPictures",
              "query": "query AlbumListOwnPictures($input: PictureListInput!) {\n" +
                "picture {\n" +
                "list(input: $input) {\n" +
                "info {...FacetCollectionInfo}\n" +
                "items {...PictureStandardWithoutAlbum}\n" +
                "}\n" +
                "}\n" +
                "}\n" +
                "fragment FacetCollectionInfo on FacetCollectionInfo {\n" +
                "page\n" +
                "has_next_page\n" +
                "has_previous_page\n" +
                "total_items\n" +
                "total_pages\n" +
                "items_per_page\n" +
                "}\n" +
                "fragment PictureStandardWithoutAlbum on Picture {\n" +
                "url_to_original\n" +
                "url_to_video\n" +
                "url\n" +
                "}",
              "variables": {
                "input": {
                  "filters": [
                    {
                      "name": "album_id",
                      "value": album.id,
                    }
                  ],
                  "display": "rating_all_time",
                  "page": helpers.next[2] + 1,
                }
              }
            })
            .post()
            .setTimeout(5000)
            .onAbort((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .notFound((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve))
            .json((json) => {
              const hasNextPage = json.data.picture.list.info.has_next_page;
              if (hasNextPage) {
                helpers.next[2] = helpers.next[2] + 1;
              } else {
                if (helpers.next[1] < albums.length - 1) {
                  helpers.next[1] = helpers.next[1] + 1;
                  helpers.next[2] = 0;
                } else {
                  if (userHasNextPage) {
                    helpers.next[0] = helpers.next[0] + 1;
                    helpers.next[1] = 0;
                    helpers.next[2] = 0;
                  } else {
                    helpers.next = null;
                  }
                }
              }
              const items = json.data.picture.list.items;
              if (items.length > 0) {
                const images = [];
                for (let item of items) {
                  images.push(item.url_to_original);
                }
                helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, true),
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              } else {
                pm({
                  data: [],
                  allURLs: allURLs,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                }, resolve);
              }
            })
            .catch((e) => pm({
              error: e.message,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve));
        } else {
          helpers.next = null;
          pm({
            warning: json,
            data: [],
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        }
      })
      .catch((e) => pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve));
  }
}

export const loadBDSMlr = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  let url = source.url;
  if (url.endsWith("/rss")) {
    url = url.substring(0, url.indexOf("/rss"))
  }
  const retry = () => {
    if (helpers.retries < 3) {
      helpers.retries += 1;
      pm({
        data: [],
        allURLs: allURLs,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    } else {
      pm({
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    }
  }
  wretch(url + "/rss?page=" + (helpers.next + 1))
    .get()
    .setTimeout(5000)
    .onAbort(retry)
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve))
    .internalError(retry)
    .text((html) => {
      helpers.retries = 0;
      let itemEls = domino.createWindow(html).document.querySelectorAll("item");
      if (itemEls.length > 0) {
        let imageCount = 0;
        let images = Array<string>();
        for (let i = 0; i < itemEls.length; i++) {
          const item = itemEls.item(i);
          const embeddedImages = item.querySelectorAll("description > img");
          if (embeddedImages.length > 0) {
            for (let image of embeddedImages) {
              imageCount++;
              images.push(image.getAttribute("src"));
            }
          }
        }
        helpers.next = helpers.next + 1;
        helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
        pm({
          data: filterPathsToJustPlayable(filter, images, true),
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      }
    });
}

let piwigoLoggedIn: boolean = false;
export const loadPiwigo = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  let url = source.url;

  const user = config.remoteSettings.piwigoUsername;
  const pass = config.remoteSettings.piwigoPassword;
  const host = config.remoteSettings.piwigoHost;
  const protocol = config.remoteSettings.piwigoProtocol;
  const configured = host != "" && protocol != "" && user != "" && pass != "";

  if (configured) {
    const login = () => {
      return wretch(protocol + "://" + host + "/ws.php?format=json")
        .formUrl({method: "pwg.session.login", username: user, password: pass})
        .post()
        .setTimeout(5000)
        .notFound((e) => pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve))
        .internalError((e) => pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve))
        .json((json) => {
          if (json.stat == "ok") {
            piwigoLoggedIn = true;
            search();
          } else {
            pm({
              error: "Piwigo login failed.",
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve);
          }
        })
        .catch((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        });
    }

    const retry = () => {
      if (helpers.retries < 3) {
        helpers.retries += 1;
        pm({
          data: [],
          allURLs: allURLs,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      } else {
        pm({
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve);
      }
    }

    const search = () => {
      return wretch(url + "&page=" + helpers.next)
        .get()
        .setTimeout(5000)
        .onAbort(retry)
        .notFound((e) => pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve))
        .internalError(retry)
        .json((json) => {
          if (json.stat != "ok") {
            helpers.next = null;
            pm({
              data: [],
              allURLs: allURLs,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve);
            return;
          }

          const images = Array<string>();
          if (json?.result?.images) {
            for (let o = 0; o < json.result.images.length; o++) {
              const image = json.result.images[o];
              if (image.element_url) {
                images.push(image.element_url);
              }
            }
          }

          if (images.length > 0) {
            helpers.next = helpers.next + 1;
            helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
          } else {
            helpers.next = null;
          }

          pm({
            data: filterPathsToJustPlayable(filter, images, true),
            allURLs: allURLs,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        });
    };

    if (!piwigoLoggedIn) {
      login()
    } else {
      search();
    }
  } else {
    let systemMessage = undefined;
    if (!piwigoAlerted) {
      systemMessage = "You haven't configured FlipFlip to work with Piwigo yet.\nVisit Settings to configure Piwigo.";
      piwigoAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve);
  }
}

export const loadHydrus = (allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, resolve?: Function) => {
  const timeout = 8000;
  const apiKey = config.remoteSettings.hydrusAPIKey;
  const configured = apiKey != "";
  if (configured) {
    const protocol = config.remoteSettings.hydrusProtocol;
    const domain = config.remoteSettings.hydrusDomain;
    const port = config.remoteSettings.hydrusPort;
    const hydrusURL = protocol + "://" + domain + ":" + port;

    if (!source.url.startsWith(hydrusURL)) {
      let systemMessage = undefined;
      if (!hydrusAlerted) {
        systemMessage = "Source url '" + source.url + "' does not match configured Hydrus server '" + hydrusURL;
        hydrusAlerted = true;
      }
      pm({
        systemMessage: systemMessage,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }, resolve);
    }

    const tagsRegex = /tags=([^&]*)&?.*$/.exec(source.url);
    let noTags = tagsRegex == null || tagsRegex.length <= 1;

    let pages = 0;
    const search = () => {
      const url = noTags ? hydrusURL + "/get_files/search_files" : hydrusURL + "/get_files/search_files?tags=" + tagsRegex[1];
      wretch(url)
        .headers({"Hydrus-Client-API-Access-Key": apiKey})
        .get()
        .setTimeout(15000)
        .notFound((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        })
        .internalError((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        })
        .json((json) => {
          const fileIDs = json.file_ids;
          const chunk = 1000;
          pages = Math.ceil(fileIDs.length / chunk);
          let page = 0;
          for (let i=0; i<fileIDs.length; i+=chunk) {
            const pageIDs = fileIDs.slice(i,i+chunk);
            // Stagger our getFileMetadata calls
            setTimeout(() => getFileMetadata(pageIDs, ++page), page*1000);
          }
        })
        .catch((e) => pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve));
    }

    let images = Array<string>();
    const getFileMetadata = (fileIDs: Array<number>, page: number) => {
      wretch(hydrusURL + "/get_files/file_metadata?file_ids=[" + fileIDs.toString() + "]")
        .headers({"Hydrus-Client-API-Access-Key": apiKey})
        .get()
        .setTimeout(15000)
        .notFound((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        })
        .internalError((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }, resolve);
        })
        .json((json) => {
          for (let metadata of json.metadata) {
            if ((filter == IF.any && isImageOrVideo(metadata.ext, true)) ||
              (filter == IF.stills || filter == IF.images) && isImage(metadata.ext, true) ||
              (filter == IF.animated && metadata.ext.toLowerCase().endsWith('.gif') || isVideo(metadata.ext, true)) ||
              (filter == IF.videos && isVideo(metadata.ext, true))) {
              images.push(hydrusURL + "/get_files/file?file_id=" + metadata.file_id + "&Hydrus-Client-API-Access-Key=" + apiKey + "&ext=" + metadata.ext);
            }
          }

          if (page == pages) {
            pm({
              data: images,
              allURLs: allURLs,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
            }, resolve);
          }
        })
        .catch((e) => pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }, resolve));
    }

    search();
  } else {
    let systemMessage = undefined;
    if (!hydrusAlerted) {
      systemMessage = "You haven't configured FlipFlip to work with Hydrus yet.\nVisit Settings to configure Hydrus.";
      hydrusAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }, resolve);
  }
}

export function filterPathsToJustPlayable(imageTypeFilter: string, paths: Array<string>, strict: boolean): Array<string> {
  switch (imageTypeFilter) {
    default:
    case IF.any:
      return paths.filter((p) => isImageOrVideo(p, strict));
    case IF.stills:
    case IF.images:
      return paths.filter((p) => isImage(p, strict));
    case IF.animated:
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
  const acceptableExtensions = [".mp4", ".mkv", ".webm", ".ogv", ".mov", ".m4v"];
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

let _redgifOAuth: any = null;
async function convertURL(url: string): Promise<Array<string>> {
  if (url.includes(".gifv")) {
    return [url.replace(".gifv", ".mp4")];
  }

  // If this is a imgur image page, return image file
  let imgurMatch = url.match("^https?://(?:m\.)?imgur\.com/([\\w\\d]{7})$");
  if (imgurMatch != null) {
    return ["https://i.imgur.com/" + imgurMatch[1] + ".jpg"];
  }

  // If this is imgur album, return album images
  let imgurAlbumMatch = url.match("^https?://imgur\.com/a/([\\w\\d]{7})$");
  if (imgurAlbumMatch != null) {
    let json = await imgur.getAlbumInfo(getFileGroup(url));
    if (json) {
      return json.data.images.map((i: any) => i.link);
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
    let gfycat = domino.createWindow(html).document.querySelectorAll("#video-" + gfycatMatch[1].toLocaleLowerCase() + " > source");
    if (gfycat.length > 0) {
      for (let source of gfycat) {
        if ((source as any).type == "video/webm") {
          return [(source as any).src];
        }
      }
      // Fallback to MP4
      for (let source of gfycat) {
        if ((source as any).type == "video/mp4" && !(source as any).src.endsWith("-mobile.mp4")) {
          return [(source as any).src];
        }
      }
      // Fallback to MP4-mobile
      for (let source of gfycat) {
        if ((source as any).type == "video/mp4") {
          return [(source as any).src];
        }
      }
    }
  }

  // If this is redgif page, return redgif image
  let redgifMatch = /^https?:\/\/(?:www\.)?redgifs\.com\/watch\/(\w*).*$/.exec(url);
  if (redgifMatch != null) {
    let fourOFour = false
    if (_redgifOAuth == null) {
      let authJson: any = await wretch("https://api.redgifs.com/v2/oauth/client")
        .content("application/x-www-form-urlencoded")
        .formUrl({
          grant_type: "client_credentials",
          client_id: "183c871ed84-0009-314e-0005-2eb73632ccb8",
          client_secret: "e600b7ca33a0d5a012df08468b3adb25"
        })
        .post().json();
      if (_redgifOAuth == null && authJson.access_token) {
        _redgifOAuth = "Bearer " + authJson.access_token;
      }
    }

    let json: any = await wretch("https://api.redgifs.com/v2/gifs/" + redgifMatch[1]).auth(_redgifOAuth).get().notFound(() => {fourOFour = true}).json();
    if (fourOFour) {
      return [url];
    } else if (json && json.gif) {
      if (json.gif.urls.hd) {
        return [json.gif.urls.hd];
      }
      if (json.gif.urls.sd) {
        return [json.gif.urls.sd];
      }
    }
  }

  if (url.includes("redgifs") || url.includes("gfycat")) {
    pm({warning: "Possible missed file: " + url});
  }

  return [url];
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
  } else if (/^https?:\/\/(www\.)?redgifs\.com\//.exec(url) != null) {
    return ST.redgifs;
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
  } else if (/^https?:\/\/(www\.|members\.)?luscious\.net\//.exec(url) != null) {
    return ST.luscious;
  } else if (/^https?:\/\/(www\.)?(.*\.booru\.org|idol\.sankakucomplex\.com)\//.exec(url) != null) {
    return ST.gelbooru1;
  } else if (/^https?:\/\/(www\.)?e-hentai\.org\/g\//.exec(url) != null) {
    return ST.ehentai;
  } else if (/^https?:\/\/[^.]*\.bdsmlr\.com/.exec(url) != null) {
    return ST.bdsmlr;
  } else if (/^https?:\/\/[\w\\.]+:\d+\/get_files\/search_files/.exec(url) != null) {
    return ST.hydrus;
  } else if (/^https?:\/\/[^.]*\.[a-z0-9\.:]+\/ws.php/.exec(url) != null) {
    return ST.piwigo;
  } else if (/^https?:\/\/hypno\.nimja\.com\/visual\/\d+/.exec(url) != null) {
    return ST.nimja;
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
    case ST.redgifs:
      let redgifID;
      if (url.includes("/browse?")) {
        let redgifRegex = /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*tags=([^&]*)/.exec(url);
        return redgifRegex.length ? redgifRegex[1] : "all";
      } else  if (url.includes("/users/")) {
        redgifID = url.replace(/^https?:\/\/(www\.)?redgifs\.com\/users\//, "");
        if (redgifID.includes("/")) {
          redgifID = redgifID.substring(0, redgifID.indexOf("/"));
        }
      }
      return redgifID;
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
    case ST.luscious:
      let albumID = url.replace(/^https?:\/\/(www\.|members\.)?luscious\.net\/(albums|users)\//, "");
      if (albumID.includes("/")) {
        albumID = albumID.substring(0, albumID.indexOf("/"));
      }
      return albumID;
    case ST.danbooru:
    case ST.gelbooru1:
    case ST.gelbooru2:
      const hostRegex = /^https?:\/\/(?:www\.)?([^.]*)\./g;
      const host =  hostRegex.exec(url)[1];
      let danbooruID = "";
      if (url.includes("/pools/")) {
        danbooruID = "pools/" + url.substring(url.lastIndexOf("/"));
      } else if (url.includes("/favorite_groups/")) {
        danbooruID = "favorite_groups/" + url.substring(url.lastIndexOf("/"));
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
    case ST.nimja:
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
    case ST.piwigo:
      const catRegex = /cat_id\[]=(\d*)/.exec(url);
      if (catRegex != null) return catRegex[1];

      const tagRegex = /tag_id\[]=(\d*)/.exec(url);
      if (tagRegex != null) return tagRegex[1];

      return "piwigo";
  }
}