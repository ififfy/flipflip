import path from "path";
import wretch from "wretch";
import { JSDOM } from "jsdom";
import { DOMParser } from "xmldom";
import * as imgur from "imgur";
import tumblr from "tumblr.js";
import Snoowrap from "snoowrap";

import { IF, RF, RT, WF } from "../../common/const";
import Config from "../../common/Config";
import LibrarySource from "../../common/LibrarySource";
import { getFileGroup, getFileName, isVideo } from "../../common/utils";

export const processAllURLs = (
  data: string[],
  allURLs: Map<string, string[]>,
  source: LibrarySource,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
): Map<string, string[]> => {
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
      newAllURLs.set(
        source.url,
        sourceURLs.concat(
          data.filter((u: string) => {
            const fileName = getFileName(u, path.sep);
            const found = sourceURLs
              .map((u: string) => getFileName(u, path.sep))
              .includes(fileName);
            return !found;
          }),
        ),
      );
    } else {
      for (let d of data.filter((u: string) => {
        const fileName = getFileName(u, path.sep);
        const found = Array.from(newAllURLs.keys())
          .map((u: string) => getFileName(u, path.sep))
          .includes(fileName);
        return !found;
      })) {
        newAllURLs.set(d, [source.url]);
      }
    }
  }
  return newAllURLs;
};

let redditAlerted = false;
let tumblrAlerted = false;
let tumblr429Alerted = false;
let hydrusAlerted = false;
let piwigoAlerted = false;

export const reset = () => {
  redditAlerted = false;
  tumblrAlerted = false;
  tumblr429Alerted = false;
  hydrusAlerted = false;
  piwigoAlerted = false;
};

export const loadRemoteImageURLList = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const url = source.url;
  wretch(url)
    .get()
    .text((data) => {
      const lines = data
        .match(/[^\r\n]+/g)
        .filter(
          (line) =>
            line.startsWith("http://") ||
            line.startsWith("https://") ||
            line.startsWith("file:///"),
        );
      if (lines.length > 0) {
        let convertedSource = Array<string>();
        let convertedCount = 0;
        for (let url of lines) {
          convertURL(url, pm)
            .then((urls: Array<string>) => {
              convertedSource = convertedSource.concat(urls);
              convertedCount++;
              if (convertedCount == lines.length) {
                helpers.count = filterPathsToJustPlayable(
                  IF.any,
                  convertedSource,
                  true,
                ).length;
                pm({
                  data: filterPathsToJustPlayable(
                    filter,
                    convertedSource,
                    true,
                  ),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: 0,
                });
              }
            })
            .catch((error: any) => {
              convertedCount++;
              if (convertedCount == lines.length) {
                helpers.count = filterPathsToJustPlayable(
                  IF.any,
                  convertedSource,
                  true,
                ).length;
                pm({
                  error: error.message,
                  data: filterPathsToJustPlayable(
                    filter,
                    convertedSource,
                    true,
                  ),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
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
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    });
};

export const loadTumblr = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 3000;
  let configured =
    config.remoteSettings.tumblrOAuthToken != "" &&
    config.remoteSettings.tumblrOAuthTokenSecret != "";
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
      });
      return;
    }
    client.blogPosts(tumblrID, { offset: helpers.next * 20 }, (err, data) => {
      if (err) {
        let systemMessage = undefined;
        if (
          err.message.includes("429 Limit Exceeded") &&
          !tumblr429Alerted &&
          helpers.next == 0
        ) {
          if (!config.remoteSettings.silenceTumblrAlert) {
            systemMessage =
              "Tumblr has temporarily throttled your FlipFlip due to high traffic. Try again in a few minutes or visit Settings to try a different Tumblr API key.";
          }
          tumblr429Alerted = true;
        }
        pm({
          error: err.message,
          systemMessage: systemMessage,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
        return;
      }
      // End loop if we're at end of posts
      if (data.posts.length == 0) {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
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
            const regex =
              /<iframe[^(?:src|\/>)]*src=["']([^"']*)[^(?:\/>)]*\/?>/g;
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
          convertURL(url, pm)
            .then((urls: Array<string>) => {
              convertedSource = convertedSource.concat(urls);
              convertedCount++;
              if (convertedCount == images.length) {
                helpers.next = helpers.next + 1;
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, convertedSource, false)
                    .length;
                pm({
                  data: filterPathsToJustPlayable(
                    filter,
                    convertedSource,
                    false,
                  ),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                });
              }
            })
            .catch((error: any) => {
              convertedCount++;
              if (convertedCount == images.length) {
                helpers.next = helpers.next + 1;
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, convertedSource, false)
                    .length;
                pm({
                  error: error.message,
                  data: filterPathsToJustPlayable(
                    filter,
                    convertedSource,
                    false,
                  ),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
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
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    });
  } else {
    let systemMessage = undefined;
    if (!tumblrAlerted) {
      systemMessage =
        "You haven't authorized FlipFlip to work with Tumblr yet.\nVisit Settings to authorize Tumblr.";
      tumblrAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    });
  }
};

export const loadReddit = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
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
            convertURL(s.url, pm)
              .then((urls: Array<string>) => {
                convertedListing = convertedListing.concat(urls);
                convertedCount++;
                for (let u of urls) {
                  allPosts.set(u, "https://www.reddit.com" + s.permalink);
                }
                if (convertedCount == submissionListing.length) {
                  helpers.next =
                    submissionListing[submissionListing.length - 1].name;
                  helpers.count =
                    helpers.count +
                    filterPathsToJustPlayable(IF.any, convertedListing, false)
                      .length;
                  pm({
                    data: filterPathsToJustPlayable(
                      filter,
                      convertedListing,
                      false,
                    ),
                    allURLs: allURLs,
                    allPosts: allPosts,
                    weight: weight,
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  });
                }
              })
              .catch((error: any) => {
                convertedCount++;
                if (convertedCount == submissionListing.length) {
                  helpers.next =
                    submissionListing[submissionListing.length - 1].name;
                  helpers.count =
                    helpers.count +
                    filterPathsToJustPlayable(IF.any, convertedListing, false)
                      .length;
                  pm({
                    error: error.message,
                    data: filterPathsToJustPlayable(
                      filter,
                      convertedListing,
                      false,
                    ),
                    allURLs: allURLs,
                    allPosts: allPosts,
                    weight: weight,
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
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        }
      };
      const errorSubmission = (error: any) => {
        pm({
          error: error.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      };

      switch (source.redditFunc) {
        default:
        case RF.hot:
          reddit
            .getSubreddit(getFileGroup(url, path.sep))
            .getHot({ after: helpers.next })
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
        case RF.new:
          reddit
            .getSubreddit(getFileGroup(url, path.sep))
            .getNew({ after: helpers.next })
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
        case RF.top:
          const time = source.redditTime == null ? RT.day : source.redditTime;
          reddit
            .getSubreddit(getFileGroup(url, path.sep))
            .getTop({ time: time, after: helpers.next })
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
        case RF.controversial:
          reddit
            .getSubreddit(getFileGroup(url, path.sep))
            .getControversial({ after: helpers.next })
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
        case RF.rising:
          reddit
            .getSubreddit(getFileGroup(url, path.sep))
            .getRising({ after: helpers.next })
            .then(handleSubmissions)
            .catch(errorSubmission);
          break;
      }
    } else if (url.includes("/saved")) {
      reddit
        .getUser(getFileGroup(url, path.sep))
        .getSavedContent({ after: helpers.next })
        .then((submissionListing: any) => {
          if (submissionListing.length > 0) {
            let convertedListing = Array<string>();
            let convertedCount = 0;
            for (let s of submissionListing) {
              convertURL(s.url, pm)
                .then((urls: Array<string>) => {
                  convertedListing = convertedListing.concat(urls);
                  convertedCount++;
                  for (let u of urls) {
                    allPosts.set(u, "https://www.reddit.com" + s.permalink);
                  }
                  if (convertedCount == submissionListing.length) {
                    helpers.next =
                      submissionListing[submissionListing.length - 1].name;
                    helpers.count =
                      helpers.count +
                      filterPathsToJustPlayable(IF.any, convertedListing, false)
                        .length;
                    pm({
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false,
                      ),
                      allURLs: allURLs,
                      allPosts: allPosts,
                      weight: weight,
                      helpers: helpers,
                      source: source,
                      timeout: timeout,
                    });
                  }
                })
                .catch((error: any) => {
                  convertedCount++;
                  if (convertedCount == submissionListing.length) {
                    helpers.next =
                      submissionListing[submissionListing.length - 1].name;
                    helpers.count =
                      helpers.count +
                      filterPathsToJustPlayable(IF.any, convertedListing, false)
                        .length;
                    pm({
                      error: error.message,
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false,
                      ),
                      allURLs: allURLs,
                      allPosts: allPosts,
                      weight: weight,
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
              allURLs: allURLs,
              allPosts: allPosts,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
            });
          }
        })
        .catch((err: any) => {
          pm({
            error: err.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        });
    } else if (url.includes("/user/") || url.includes("/u/")) {
      reddit
        .getUser(getFileGroup(url, path.sep))
        .getSubmissions({ after: helpers.next })
        .then((submissionListing: any) => {
          if (submissionListing.length > 0) {
            let convertedListing = Array<string>();
            let convertedCount = 0;
            for (let s of submissionListing) {
              convertURL(s.url, pm)
                .then((urls: Array<string>) => {
                  convertedListing = convertedListing.concat(urls);
                  convertedCount++;
                  for (let u of urls) {
                    allPosts.set(u, "https://www.reddit.com" + s.permalink);
                  }
                  if (convertedCount == submissionListing.length) {
                    helpers.next =
                      submissionListing[submissionListing.length - 1].name;
                    helpers.count =
                      helpers.count +
                      filterPathsToJustPlayable(IF.any, convertedListing, false)
                        .length;
                    pm({
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false,
                      ),
                      allURLs: allURLs,
                      allPosts: allPosts,
                      weight: weight,
                      helpers: helpers,
                      source: source,
                      timeout: timeout,
                    });
                  }
                })
                .catch((error: any) => {
                  convertedCount++;
                  if (convertedCount == submissionListing.length) {
                    helpers.next =
                      submissionListing[submissionListing.length - 1].name;
                    helpers.count =
                      helpers.count +
                      filterPathsToJustPlayable(IF.any, convertedListing, false)
                        .length;
                    pm({
                      error: error.message,
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false,
                      ),
                      allURLs: allURLs,
                      allPosts: allPosts,
                      weight: weight,
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
              allURLs: allURLs,
              allPosts: allPosts,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
            });
          }
        })
        .catch((err: any) => {
          pm({
            error: err.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        });
    }
  } else {
    let systemMessage = undefined;
    if (!redditAlerted) {
      systemMessage =
        "You haven't authorized FlipFlip to work with Reddit yet.\nVisit Settings to authorize Reddit.";
      redditAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    });
  }
};

export const loadRedGifs = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 10000;
  const url = source.url;
  let apiURL = "https://api.redgifs.com/v2/";
  let orderRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*order=([^&]*)/.exec(url);
  let order = null;
  if (!!orderRegex) {
    order = orderRegex[1];
  }
  let typeRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*type=(\w)/.exec(url);
  let type = null;
  if (!!typeRegex) {
    type = typeRegex[1];
  }
  let tagsRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*tags=([^&]*)/.exec(url);
  let tags = null;
  if (!!tagsRegex) {
    tags = tagsRegex[1];
  }
  let ratioRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*ratio=(\w)/.exec(url);
  let ratio = null;
  if (!!ratioRegex) {
    ratio = ratioRegex[1];
  }
  let verifiedRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*verified=(\w)/.exec(url);
  let verified = null;
  if (!!verifiedRegex) {
    verified = verifiedRegex[1];
  }
  let longRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*long=(\w)/.exec(url);
  let long = null;
  if (!!longRegex) {
    long = longRegex[1];
  }
  let soundRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*sound=(\w)/.exec(url);
  let sound = null;
  if (!!soundRegex) {
    sound = soundRegex[1];
  }

  if (url.includes("/users/")) {
    apiURL += "users/" + getFileGroup(url, path.sep) + "/search?";
    if (!order) {
      order = "recent";
    }
  } else if (url.includes("/browse?")) {
    apiURL += "gifs/search?search_text=" + tags + "&count=80&";
    if (!order) {
      order = "trending";
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
    .onAbort((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .json((json) => {
      const images = json.gifs
        .map((g: any) => {
          if (g.urls.hd) {
            return g.urls.hd;
          } else if (g.urls.sd) {
            return g.urls.sd;
          }
          return null;
        })
        .filter((url: string) => !!url);
      helpers.next = json.page == json.pages ? null : helpers.next + 1;
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
      pm({
        data: filterPathsToJustPlayable(filter, images, false),
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
    })
    .catch((err: any) => {
      pm({
        error: err.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
    });
};

const loadImageFapGallery = (
  galleryURL: string,
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  timeout: number,
  images: Array<string>,
  baseGalleryURL: string,
  onFinishedLoading: (helpers: {
    next: any;
    count: number;
    retries: number;
    uuid: string;
  }) => void,
  pm: (object: any) => void,
) => {
  wretch(galleryURL)
    .get()
    .setTimeout(15000)
    .onAbort((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .text((html) => {
      const galleryWindow = new JSDOM(html, { contentType: "text/html" })
        .window;
      let imageEl = galleryWindow.document.querySelector(
        ".expp-container > form > table > tbody > tr > td > table > tbody > tr > td > a",
      );
      if (imageEl) {
        const imageURL = "https://www.imagefap.com" + imageEl.href;
        wretch(imageURL)
          .get()
          .text((html) => {
            let captcha = undefined;
            const ahrefs = new JSDOM(html, {
              contentType: "text/html",
            }).window.document.querySelectorAll(
              'a[href^="https://cdn.imagefap.com/images/full/"]',
            );
            if (ahrefs.length > 0) {
              for (let i = 0; i < ahrefs.length; i++) {
                images.push(ahrefs.item(i).href);
              }
            } else {
              captcha = imageURL;
            }
            if (captcha != null) {
              pm({
                captcha: captcha,
                data: images,
                allURLs: allURLs,
                allPosts: allPosts,
                weight: weight,
                helpers: helpers,
                source: source,
                timeout: timeout,
              });
            }
          });
      } else {
        let captcha = undefined;
        if (html.includes("Enter the captcha")) {
          helpers.count = source.count;
          captcha = galleryURL;
          images = allURLs.get(source.url);
          pm({ warning: source.url + " - blocked due to captcha" });
        } else {
          onFinishedLoading(helpers);
        }
        pm({
          captcha: captcha,
          data: images,
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
      const nextGalleryLink = galleryWindow.document.querySelector(
        "#gallery > font > span > a:last-child",
      );
      if (nextGalleryLink && nextGalleryLink.innerHTML == ":: next ::") {
        let href = nextGalleryLink.href;
        if (href.startsWith("/")) {
          href = href.substring(1);
        }
        setTimeout(
          () =>
            loadImageFapGallery(
              baseGalleryURL + href,
              allURLs,
              allPosts,
              source,
              filter,
              weight,
              helpers,
              timeout,
              images,
              baseGalleryURL,
              onFinishedLoading,
              pm,
            ),
          2000,
        );
      } else {
        onFinishedLoading(helpers);
        pm({
          data: filterPathsToJustPlayable(filter, images, false),
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    });
};

export const loadImageFap = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  const url = source.url;
  if (url.includes("/gallery/") || url.includes("/pictures/")) {
    let images = Array<string>();
    const gid = getFileGroup(url, path.sep);
    const baseGalleryURL = "https://www.imagefap.com/gallery/" + gid;
    loadImageFapGallery(
      baseGalleryURL + "?gid=" + gid + "&view=0",
      allURLs,
      allPosts,
      source,
      filter,
      weight,
      helpers,
      timeout,
      images,
      baseGalleryURL,
      (h) => (h.next = null),
      pm,
    );
  } else if (url.includes("/organizer/")) {
    if (helpers.next == 0) {
      helpers.next = [0, 0, 0];
    }
    wretch(url + "?page=" + helpers.next[0])
      .get()
      .setTimeout(10000)
      .onAbort((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .text((html) => {
        const albumEls = new JSDOM(html, {
          contentType: "text/html",
        }).window.document.querySelectorAll(
          "td.blk_galleries > font > a.blk_galleries",
        );
        if (albumEls.length == 0) {
          let captcha = undefined;
          if (html.includes("Enter the captcha")) {
            helpers.count = source.count;
            captcha =
              "https://www.imagefap.com/gallery/" +
              getFileGroup(url, path.sep) +
              "?view=2";
            pm({ warning: source.url + " - blocked due to captcha" });
          }
          helpers.next = null;
          pm({
            captcha: captcha,
            data: [],
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        } else if (albumEls.length > helpers.next[1]) {
          let albumEl = albumEls[helpers.next[1]];
          let albumID = albumEl
            .getAttribute("href")
            .substring(albumEl.getAttribute("href").lastIndexOf("/") + 1);
          let images = Array<string>();
          const baseGalleryURL = "https://www.imagefap.com/gallery/" + albumID;
          loadImageFapGallery(
            baseGalleryURL + "?gid=" + albumID + "&view=0",
            allURLs,
            allPosts,
            source,
            filter,
            weight,
            helpers,
            timeout,
            images,
            baseGalleryURL,
            (h) => (h.next[1] += 1),
            pm,
          );
        } else {
          let images = Array<string>();
          let captcha = undefined;
          if (html.includes("Enter the captcha")) {
            helpers.count = source.count;
            captcha =
              "https://www.imagefap.com/gallery/" +
              getFileGroup(url, path.sep) +
              "?view=0";
            images = allURLs.get(url);
            pm({ warning: source.url + " - blocked due to captcha" });
          } else {
            helpers.next[0] += 1;
            helpers.next[1] = 0;
          }
          pm({
            captcha: captcha,
            data: images,
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        }
      })
      .catch((e) => {
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      });
  } else if (url.includes("/video.php?vid=")) {
    helpers.next = null;
    pm({
      data: [],
      allURLs: allURLs,
      allPosts: allPosts,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: timeout,
    });
    wretch(url)
      .get()
      .setTimeout(10000)
      .onAbort((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .text((html) => {
        const foundVideoConfigURLs =
          /url: '(https:\/\/cdn-fck\.moviefap\.com\/moviefap\/.*)',/g.exec(
            html,
          );
        if (foundVideoConfigURLs.length == 2) {
          const videoConfigURL = foundVideoConfigURLs[1]; // get first group
          wretch(videoConfigURL)
            .get()
            .setTimeout(10000)
            .onAbort((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .text((xml) => {
              // Get highest resolution video link
              let res = 0;
              let videoLink = "";
              const videoQualities = new JSDOM(xml, {
                contentType: "application/xml",
              }).window.document.querySelectorAll("flixV2 > quality > item");
              for (let i = 0; i < videoQualities.length; i++) {
                const quality = videoQualities.item(i);
                const newResText = quality
                  .querySelector("res")
                  .innerHTML.slice(0, -1);
                const newRes = Number(newResText);
                if (newRes > res) {
                  res = newRes;
                  videoLink = quality.querySelector("videoLink").textContent;
                }
              }

              const data = videoLink
                ? filterPathsToJustPlayable(filter, [videoLink], false)
                : [];
              if (data.length > 0) {
                helpers.count = helpers.count + data.length;
              }

              helpers.next = null;
              pm({
                data,
                allURLs: allURLs,
                allPosts: allPosts,
                weight: weight,
                helpers: helpers,
                source: source,
                timeout: timeout,
              });
            });
        } else {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        }
      });
  } else {
    helpers.next = null;
    pm({
      data: [],
      allURLs: allURLs,
      allPosts: allPosts,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: timeout,
    });
  }
};

export const loadSexCom = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  const url = source.url;
  // This doesn't work anymore due to src url requiring referer
  helpers.next = null;
  pm({
    data: [],
    allURLs: allURLs,
    allPosts: allPosts,
    weight: weight,
    helpers: helpers,
    source: source,
    timeout: timeout,
  });
  /*let requestURL;
  if (url.includes("/user/")) {
    requestURL = "https://www.sex.com/user/" + getFileGroup(url, path.sep) + "?page=" + (helpers.next + 1);
  } else if (url.includes("/gifs/") || url.includes("/pics/") || url.includes("/videos/")) {
    requestURL = "https://www.sex.com/" + getFileGroup(url, path.sep) + "?page=" + (helpers.next + 1);
  }
  wretch(requestURL)
    .get()
    .setTimeout(5000)
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }))
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
    }))
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
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
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
              }))
              .notFound((e) => pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }))
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
                    allPosts: allPosts,
                    weight: weight,
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                  });
                }
              });
          }
        }
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    });*/
};

export const loadImgur = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 3000;
  const url = source.url;
  imgur
    .getAlbumInfo(getFileGroup(url, path.sep))
    .then((json: any) => {
      const images = json.images.map((i: any) => i.link);
      helpers.next = null;
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
      pm({
        data: filterPathsToJustPlayable(filter, images, true),
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
    })
    .catch((err: any) => {
      pm({
        error: err.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
    });
};

export const loadDeviantArt = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 3000;
  const url = source.url;
  wretch(
    "https://backend.deviantart.com/rss.xml?type=deviation&q=by%3A" +
      getFileGroup(url, path.sep) +
      "+sort%3Atime+meta%3Aall" +
      (helpers.next != 0 ? "&offset=" + helpers.next : ""),
  )
    .get()
    .setTimeout(5000)
    .onAbort((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .notFound((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
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
        helpers.next += 1;
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
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
      pm({
        data: filterPathsToJustPlayable(filter, images, false),
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
    });
};

export const loadE621 = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  let suffix = "";
  if (url.includes("/pools/")) {
    suffix =
      "/pools.json?search[id]=" + url.substring(url.lastIndexOf("/") + 1);

    wretch(thisHost + suffix)
      .get()
      .setTimeout(5000)
      .badRequest((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .notFound((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .timeout((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .internalError((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .onAbort((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .json((json: any) => {
        if (json.length == 0) {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
          return;
        }

        const count = json[0].post_count;
        const images = Array<string>();
        for (let postID of json[0].post_ids) {
          suffix = "/posts/" + postID + ".json";
          wretch(thisHost + suffix)
            .get()
            .setTimeout(5000)
            .badRequest((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .notFound((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .timeout((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .internalError((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .onAbort((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
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
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, true),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                });
              }
            })
            .catch((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            );
        }
      })
      .catch((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      );
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
      .badRequest((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .notFound((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .timeout((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .internalError((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .onAbort((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .json((json: any) => {
        if (json.length == 0) {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
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
        helpers.count =
          helpers.count +
          filterPathsToJustPlayable(IF.any, images, true).length;
        pm({
          data: filterPathsToJustPlayable(filter, images, true),
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      })
      .catch((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      );
  }
};

export const loadDanbooru = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  let suffix = "";
  if (url.includes("/pools/")) {
    suffix = "/pools/" + url.substring(url.lastIndexOf("/") + 1) + ".json";
  } else if (url.includes("favorite_groups")) {
    suffix =
      "/favorite_groups/" + url.substring(url.lastIndexOf("/") + 1) + ".json";
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
    .badRequest((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .notFound((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .timeout((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .internalError((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .onAbort((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .json((json: any) => {
      if (json.length == 0) {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
        return;
      }

      if (json.post_ids) {
        if (json.post_ids.length == 0) {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
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
            .badRequest((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .notFound((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .timeout((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .internalError((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .onAbort((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .json((json: any) => {
              images.push(json.file_url);
              if (images.length == limit || postIDs.length == current) {
                if (postIDs.length == current) {
                  helpers.next = null;
                } else {
                  helpers.next = current;
                }
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, true),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                });
              } else {
                setTimeout(getPost, 200);
              }
            })
            .catch((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            );
        };
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
        helpers.count =
          helpers.count +
          filterPathsToJustPlayable(IF.any, images, true).length;
        pm({
          data: filterPathsToJustPlayable(filter, images, true),
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    })
    .catch((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    );
};

export const loadGelbooru1 = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  wretch(url + "&pid=" + helpers.next * 10)
    .get()
    .setTimeout(5000)
    .onAbort((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .notFound((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .error(503, (e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .text((html) => {
      const imageEls = new JSDOM(html, {
        contentType: "text/html",
      }).window.document.querySelectorAll("span.thumb > a");
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
            .onAbort((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .notFound((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .error(503, (e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .text((html) => {
              imageCount++;
              let contentURL = html.match(
                '<img[^>]*id="?image"?[^>]*src="([^"]*)"',
              );
              if (contentURL != null) {
                let url = contentURL[1];
                if (url.startsWith("//")) url = "http:" + url;
                images.push(url);
              }
              contentURL = html.match(
                '<img[^>]*src="([^"]*)"[^>]*id="?image"?',
              );
              if (contentURL != null) {
                let url = contentURL[1];
                if (url.startsWith("//")) url = "http:" + url;
                images.push(url);
              }
              contentURL = html.match('<video[^>]*src="([^"]*)"');
              if (contentURL != null) {
                let url = contentURL[1];
                if (url.startsWith("//")) url = "http:" + url;
                images.push(url);
              }
              if (imageCount == imageEls.length || imageCount == 10) {
                helpers.next = helpers.next + 1;
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, false).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, false),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                });
              }
            });
          if (index < imageEls.length - 1 && index < 9) {
            setTimeout(getImage.bind(null, index + 1), 1000);
          }
        };
        setTimeout(getImage.bind(null, 0), 1000);
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    });
};

export const loadGelbooru2 = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  const url = source.url;
  const hostRegex = /^(https?:\/\/[^\/]*)\//g;
  const thisHost = hostRegex.exec(url)[1];
  let suffix =
    "/index.php?page=dapi&s=post&q=index&limit=20&json=1&pid=" +
    (helpers.next + 1);
  const tagRegex = /[?&]tags=(.*)&?/g;
  let tags;
  if ((tags = tagRegex.exec(url)) !== null) {
    suffix += "&tags=" + tags[1];
  }
  wretch(thisHost + suffix)
    .get()
    .setTimeout(5000)
    .badRequest((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .notFound((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .timeout((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .internalError((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .onAbort((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .json((json: any) => {
      if (json.length == 0) {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }

      const images = Array<string>();
      for (let p of json.post) {
        if (p.file_url) {
          images.push(p.file_url);
        } else if (p.image) {
          images.push(thisHost + "//images/" + p.directory + "/" + p.image);
        }
      }

      helpers.next = helpers.next + 1;
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, true).length;
      pm({
        data: filterPathsToJustPlayable(filter, images, true),
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
    })
    .catch((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    );
};

export const loadEHentai = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  const url = source.url;
  wretch(url + "?p=" + (helpers.next + 1))
    .get()
    .setTimeout(5000)
    .onAbort((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .notFound((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .text((html) => {
      const imageEls = new JSDOM(html, {
        contentType: "text/html",
      }).window.document.querySelectorAll("#gdt > .gdtm > div > a");
      if (imageEls.length > 0) {
        let imageCount = 0;
        let images = Array<string>();
        for (let i = 0; i < imageEls.length; i++) {
          const image = imageEls.item(i);
          wretch(image.getAttribute("href"))
            .get()
            .setTimeout(5000)
            .onAbort((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .notFound((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .text((html) => {
              imageCount++;
              let contentURL = html.match('<img id="img" src="(.*?)"');
              if (contentURL != null) {
                images.push(contentURL[1]);
              }
              if (imageCount == imageEls.length) {
                helpers.next = helpers.next + 1;
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, true),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
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
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    });
};

export const loadLuscious = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 5000;
  const url = source.url;
  if (url.includes("albums")) {
    const name = getFileGroup(url, path.sep);
    const id = name.substring(name.indexOf("_") + 1, name.length);
    wretch(
      "https://members.luscious.net/graphql/nobatch/?operationName=AlbumListOwnPictures",
    )
      .json({
        operationName: "AlbumListOwnPictures",
        query:
          "query AlbumListOwnPictures($input: PictureListInput!) {\n" +
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
        variables: {
          input: {
            filters: [
              {
                name: "album_id",
                value: id,
              },
            ],
            display: "position",
            page: helpers.next + 1,
          },
        },
      })
      .post()
      .setTimeout(5000)
      .onAbort((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .notFound((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
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
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        } else {
          helpers.next = null;
          pm({
            data: [],
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        }
      })
      .catch((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      );
  } else {
    const id = getFileGroup(url, path.sep);
    if (helpers.next == 0) {
      helpers.next = [0, 0, 0];
    }
    wretch(
      "https://members.luscious.net/graphql/nobatch/?operationName=AlbumList",
    )
      .json({
        operationName: "AlbumList",
        query:
          "query AlbumList($input: AlbumListInput!) {\n" +
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
        variables: {
          input: {
            display: "date_newest",
            filters: [
              {
                name: "created_by_id",
                value: id,
              },
            ],
            page: helpers.next[0] + 1,
          },
        },
      })
      .post()
      .setTimeout(5000)
      .onAbort((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .notFound((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      )
      .json((json) => {
        const userHasNextPage = json.data.album.list.info.has_next_page;
        const albums = json.data.album.list.items;
        if (albums.length > 0) {
          const album = albums[helpers.next[1]];
          wretch(
            "https://members.luscious.net/graphql/nobatch/?operationName=AlbumListOwnPictures",
          )
            .json({
              operationName: "AlbumListOwnPictures",
              query:
                "query AlbumListOwnPictures($input: PictureListInput!) {\n" +
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
              variables: {
                input: {
                  filters: [
                    {
                      name: "album_id",
                      value: album.id,
                    },
                  ],
                  display: "rating_all_time",
                  page: helpers.next[2] + 1,
                },
              },
            })
            .post()
            .setTimeout(5000)
            .onAbort((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
            .notFound((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            )
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
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, true).length;
                pm({
                  data: filterPathsToJustPlayable(filter, images, true),
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                });
              } else {
                pm({
                  data: [],
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                });
              }
            })
            .catch((e) =>
              pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
              }),
            );
        } else {
          helpers.next = null;
          pm({
            warning: json,
            data: [],
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        }
      })
      .catch((e) =>
        pm({
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
        }),
      );
  }
};

export const loadBDSMlr = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  let url = source.url;
  if (url.endsWith("/rss")) {
    url = url.substring(0, url.indexOf("/rss"));
  }
  const retry = () => {
    if (helpers.retries < 3) {
      helpers.retries += 1;
      pm({
        data: [],
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
    } else {
      pm({
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
    }
  };
  wretch(url + "/rss?page=" + (helpers.next + 1))
    .get()
    .setTimeout(5000)
    .onAbort(retry)
    .notFound((e) =>
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: timeout,
      }),
    )
    .internalError(retry)
    .text((html) => {
      helpers.retries = 0;
      const itemEls = new JSDOM(html, {
        contentType: "application/xml",
      }).window.document.querySelectorAll("item");
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
        helpers.count =
          helpers.count +
          filterPathsToJustPlayable(IF.any, images, true).length;
        pm({
          data: filterPathsToJustPlayable(filter, images, true),
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    });
};

let piwigoLoggedIn: boolean = false;
export const loadPiwigo = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
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
        .formUrl({
          method: "pwg.session.login",
          username: user,
          password: pass,
        })
        .post()
        .setTimeout(5000)
        .notFound((e) =>
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }),
        )
        .internalError((e) =>
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }),
        )
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
            });
          }
        })
        .catch((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        });
    };

    const retry = () => {
      if (helpers.retries < 3) {
        helpers.retries += 1;
        pm({
          data: [],
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      } else {
        pm({
          helpers: helpers,
          source: source,
          timeout: timeout,
        });
      }
    };

    const search = () => {
      return wretch(url + "&page=" + helpers.next)
        .get()
        .setTimeout(5000)
        .onAbort(retry)
        .notFound((e) =>
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }),
        )
        .internalError(retry)
        .json((json) => {
          if (json.stat != "ok") {
            helpers.next = null;
            pm({
              data: [],
              allURLs: allURLs,
              allPosts: allPosts,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
            });
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
            helpers.count =
              helpers.count +
              filterPathsToJustPlayable(IF.any, images, true).length;
          } else {
            helpers.next = null;
          }

          pm({
            data: filterPathsToJustPlayable(filter, images, true),
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        });
    };

    if (!piwigoLoggedIn) {
      login();
    } else {
      search();
    }
  } else {
    let systemMessage = undefined;
    if (!piwigoAlerted) {
      systemMessage =
        "You haven't configured FlipFlip to work with Piwigo yet.\nVisit Settings to configure Piwigo.";
      piwigoAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    });
  }
};

export const loadHydrus = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pm: (object: any) => void,
) => {
  const timeout = 8000;
  const chunk = 1000;
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
        systemMessage =
          "Source url '" +
          source.url +
          "' does not match configured Hydrus server '" +
          hydrusURL;
        hydrusAlerted = true;
      }
      pm({
        systemMessage: systemMessage,
        helpers: helpers,
        source: source,
        timeout: timeout,
      });
      return;
    }

    const tagsRegex = /tags=([^&]*)&?.*$/.exec(source.url);
    let noTags = tagsRegex == null || tagsRegex.length <= 1;

    let pages = 0;
    const search = () => {
      const url = noTags
        ? hydrusURL + "/get_files/search_files"
        : hydrusURL + "/get_files/search_files?tags=" + tagsRegex[1];
      wretch(url)
        .headers({ "Hydrus-Client-API-Access-Key": apiKey })
        .get()
        .setTimeout(15000)
        .notFound((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        })
        .internalError((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        })
        .json((json) => {
          const fileIDs = json.file_ids;
          pages = Math.ceil(fileIDs.length / chunk);
          getFileMetadata(fileIDs, 0);
        })
        .catch((e) =>
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }),
        );
    };

    let images = Array<string>();
    const getFileMetadata = (fileIDs: Array<number>, page: number) => {
      const pageIDs = fileIDs.slice(page * chunk, (page + 1) * chunk);
      wretch(
        hydrusURL +
          "/get_files/file_metadata?file_ids=[" +
          pageIDs.toString() +
          "]",
      )
        .headers({ "Hydrus-Client-API-Access-Key": apiKey })
        .get()
        .setTimeout(15000)
        .notFound((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        })
        .internalError((e) => {
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          });
        })
        .json((json) => {
          for (let metadata of json.metadata) {
            if (
              (filter == IF.any && isImageOrVideo(metadata.ext, true)) ||
              ((filter == IF.stills || filter == IF.images) &&
                isImage(metadata.ext, true)) ||
              (filter == IF.animated &&
                metadata.ext.toLowerCase().endsWith(".gif")) ||
              isVideo(metadata.ext, true) ||
              (filter == IF.videos && isVideo(metadata.ext, true))
            ) {
              images.push(
                hydrusURL +
                  "/get_files/file?file_id=" +
                  metadata.file_id +
                  "&Hydrus-Client-API-Access-Key=" +
                  apiKey +
                  "&ext=" +
                  metadata.ext,
              );
            }
          }

          page += 1;
          if (page == pages) {
            pm({
              data: images,
              allURLs: allURLs,
              allPosts: allPosts,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
            });
          } else {
            getFileMetadata(fileIDs, page);
          }
        })
        .catch((e) =>
          pm({
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
          }),
        );
    };

    search();
  } else {
    let systemMessage = undefined;
    if (!hydrusAlerted) {
      systemMessage =
        "You haven't configured FlipFlip to work with Hydrus yet.\nVisit Settings to configure Hydrus.";
      hydrusAlerted = true;
    }
    pm({
      systemMessage: systemMessage,
      helpers: helpers,
      source: source,
      timeout: timeout,
    });
  }
};

export function filterPathsToJustPlayable(
  imageTypeFilter: string,
  paths: Array<string>,
  strict: boolean,
): Array<string> {
  switch (imageTypeFilter) {
    default:
    case IF.any:
      return paths.filter((p) => isImageOrVideo(p, strict));
    case IF.stills:
    case IF.images:
      return paths.filter((p) => isImage(p, strict));
    case IF.animated:
      return paths.filter(
        (p) => p.toLowerCase().endsWith(".gif") || isVideo(p, strict),
      );
    case IF.videos:
      return paths.filter((p) => isVideo(p, strict));
  }
}

export const isImageOrVideo = (path: string, strict: boolean): boolean => {
  return isImage(path, strict) || isVideo(path, strict);
};

export function isImage(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [
    ".gif",
    ".png",
    ".jpeg",
    ".jpg",
    ".webp",
    ".tiff",
    ".svg",
  ];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

let _redgifOAuth: any = null;
async function convertURL(
  url: string,
  pm: (object: any) => void,
): Promise<Array<string>> {
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
    let json = await imgur.getAlbumInfo(getFileGroup(url, path.sep));
    if (json) {
      return json.data.images.map((i: any) => i.link);
    }
    return [];
  }

  // If this is gfycat page, return gfycat image
  let gfycatMatch = url.match("^https?://gfycat\.com/(?:ifr/)?(\\w*)$");
  if (gfycatMatch != null) {
    // Only lookup CamelCase url if not already CamelCase
    if (/[A-Z]/.test(gfycatMatch[1])) {
      return ["https://giant.gfycat.com/" + gfycatMatch[1] + ".mp4"];
    }

    let html = await wretch(url)
      .get()
      .notFound(() => {
        return [url];
      })
      .text();

    const gfycat = new JSDOM(html, {
      contentType: "text/html",
    }).window.document.querySelectorAll(
      "#video-" + gfycatMatch[1].toLocaleLowerCase() + " > source",
    );
    if (gfycat.length > 0) {
      for (let source of gfycat) {
        if ((source as any).type == "video/webm") {
          return [(source as any).src];
        }
      }
      // Fallback to MP4
      for (let source of gfycat) {
        if (
          (source as any).type == "video/mp4" &&
          !(source as any).src.endsWith("-mobile.mp4")
        ) {
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
  let redgifMatch = /^https?:\/\/(?:www\.)?redgifs\.com\/watch\/(\w*).*$/.exec(
    url,
  );
  if (redgifMatch != null) {
    let fourOFour = false;
    if (_redgifOAuth == null) {
      let authJson: any = await wretch(
        "https://api.redgifs.com/v2/oauth/client",
      )
        .content("application/x-www-form-urlencoded")
        .formUrl({
          grant_type: "client_credentials",
          client_id: "183c871ed84-0009-314e-0005-2eb73632ccb8",
          client_secret: "e600b7ca33a0d5a012df08468b3adb25",
        })
        .post()
        .json();
      if (_redgifOAuth == null && authJson.access_token) {
        _redgifOAuth = "Bearer " + authJson.access_token;
      }
    }

    let json: any = await wretch(
      "https://api.redgifs.com/v2/gifs/" + redgifMatch[1],
    )
      .auth(_redgifOAuth)
      .get()
      .notFound(() => {
        fourOFour = true;
      })
      .json();
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
    pm({ warning: "Possible missed file: " + url });
  }

  return [url];
}
