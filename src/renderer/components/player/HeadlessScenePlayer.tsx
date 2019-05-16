import * as React from 'react';
import * as fs from "fs";
import recursiveReaddir from 'recursive-readdir';
import fileURL from 'file-url';
import wretch from 'wretch';
import http from 'http';
import Snoowrap from 'snoowrap';
import tumblr from "tumblr.js";
import imgur from "imgur";

import {IF, ST} from '../../const';
import {
  CancelablePromise,
  convertURL,
  getCachePath,
  getFileGroup,
  getFileName,
  getSourceType,
} from "../../utils";
import Config from "../../Config";
import Scene from '../../Scene';
import ChildCallbackHack from './ChildCallbackHack';
import ImagePlayer from './ImagePlayer';

let redditAlerted = false;
let tumblrAlerted = false;

// Returns true if array is empty, or only contains empty arrays
const isEmpty = function (allURLs: any[]): boolean {
  return Array.isArray(allURLs) && allURLs.every(isEmpty);
};

function isImage(path: string): boolean {
  const p = path.toLowerCase();
  if (p.endsWith('.gif')) return true;
  if (p.endsWith('.png')) return true;
  if (p.endsWith('.jpeg')) return true;
  if (p.endsWith('.jpg')) return true;
  if (p.endsWith('.webp')) return true;
  if (p.endsWith('.tiff')) return true;
  if (p.endsWith('.svg')) return true;
  return false;
}

function filterPathsToJustImages(imageTypeFilter: string, paths: Array<string>): Array<string> {
  switch (imageTypeFilter) {
    case IF.any:
    case IF.stills:
      return paths.filter((p) => isImage(p));
    case IF.gifs:
      return paths.filter((f) => f.toLowerCase().endsWith('.gif'));
    default:
      console.warn('unknown image type filter', imageTypeFilter);
      return paths.filter((p) => isImage(p));
  }
}

// Determine what kind of source we have based on the URL and return associated Promise
function getPromise(config: Config, url: string, filter: string, next: any): CancelablePromise {
  let promise;
  const sourceType = getSourceType(url);

  if (sourceType == ST.local) { // Local files
    promise = loadLocalDirectory(config, url, filter, null);
  } else if (sourceType == ST.list) { // Image List
    promise = loadRemoteImageURLList(config, url, filter, null);
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
    }
    if (next == -1) {
      const cachePath = getCachePath(url, config);
      if (fs.existsSync(cachePath) && config.caching.enabled) {
        // If the cache directory exists, use it
        promise = loadLocalDirectory(config, cachePath, filter, 0);
        timeout = 0;
      } else {
        promise = promiseFunction(config, url, filter, 0);
      }
    } else {
      promise = promiseFunction(config, url, filter, next);
    }
    promise.timeout = timeout;
  }
  promise.source = url;
  return promise;
}

function loadLocalDirectory(config: Config, url: string, filter: string, next: any): CancelablePromise {
  const blacklist = ['*.css', '*.html', 'avatar.png'];

  return new CancelablePromise((resolve, reject) => {
    recursiveReaddir(url, blacklist, (err: any, rawFiles: Array<string>) => {
      if (err) {
        console.warn(err);
        resolve(null);
      } else {
        resolve({data: filterPathsToJustImages(filter, rawFiles).map((p) => fileURL(p)), next: next});
      }
    });
  });
}

function loadRemoteImageURLList(config: Config, url: string, filter: string, next: any): CancelablePromise {
  return new CancelablePromise((resolve, reject) => {
    wretch(url)
      .get()
      .text(data => {
        const lines = data.match(/[^\r\n]+/g).filter((line) => line.startsWith("http"));
        if (lines.length > 0) {
          let convertedSource = Array<string>();
          let convertedCount = 0;
          for (let url of lines) {
            convertURL(url).then((urls: Array<string>) => {
              convertedSource = convertedSource.concat(urls);
              convertedCount++;
              if (convertedCount == lines.length) {
                resolve({
                  data: convertedSource.filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
                  next: null
                });
              }
            });
          }
        } else {
          console.warn("No lines in", url, "start with 'http://'")
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

function loadTumblr(config: Config, url: string, filter: string, next: any): CancelablePromise {
  let configured = config.remoteSettings.tumblrOAuthToken != "" && config.remoteSettings.tumblrOAuthTokenSecret != "";
  if (configured) {
    return new CancelablePromise((resolve, reject) => {
      const client = tumblr.createClient({
        consumer_key: config.remoteSettings.tumblrKey,
        consumer_secret: config.remoteSettings.tumblrSecret,
        token: config.remoteSettings.tumblrOAuthToken,
        token_secret: config.remoteSettings.tumblrOAuthTokenSecret,
      });
      // TumblrID takes the form of <blog_name>.tumblr.com
      let tumblrID = url.replace(/https?:\/\//, "");
      tumblrID = tumblrID.replace("/", "");
      client.blogPosts(tumblrID, {offset: next*20}, (err, data) => {
        if (err) {
          console.error(err);
          resolve(null);
          return;
        }

        // End loop if we're at end of posts
        if (data.posts.length == 0) {
          resolve(null);
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
            const regex = /<img[^(?:src|\/>)]*src=["']([^"']*)[^(?:\/>)]*\/?>/g;
            let imageSource;
            while ((imageSource = regex.exec(post.body)) !== null) {
              images.push(imageSource[1]);
            }
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
                resolve({
                  data: convertedSource.filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
                  next: (next as number) + 1
                });
              }
            });
          }
        } else {
          resolve(null);
        }
      });
    });
  } else {
    if (!tumblrAlerted) {
      alert("You haven't authorized FlipFlip to work with Reddit yet.\nVisit Config and click 'Authorzie FlipFlip on Reddit'.");
      tumblrAlerted = true;
    }
    return new CancelablePromise((resolve, reject) => {
      resolve(null);
    });
  }
}

function loadReddit(config: Config, url: string, filter: string, next: any): CancelablePromise {
  let configured = config.remoteSettings.redditRefreshToken != "";
  if (configured) {
      return new CancelablePromise((resolve, reject) => {
        const reddit = new Snoowrap({
          userAgent: config.remoteSettings.redditUserAgent,
          clientId: config.remoteSettings.redditClientID,
          clientSecret: "",
          refreshToken: config.remoteSettings.redditRefreshToken,
        });
        if (url.includes("/r/")) {
          reddit.getSubreddit(getFileGroup(url)).getHot({after: next})
            .then((submissionListing: any) => {
              if (submissionListing.length > 0) {
                let convertedListing = Array<string>();
                let convertedCount = 0;
                for (let s of submissionListing) {
                  convertURL(s.url).then((urls: Array<string>) => {
                    convertedListing = convertedListing.concat(urls);
                    convertedCount++;
                    if (convertedCount == submissionListing.length) {
                      resolve({
                        data: convertedListing.filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
                        next: submissionListing[submissionListing.length - 1].name
                      });
                    }
                  });
                }
              } else {
                resolve(null);
              }
            })
            .catch((error: any) => {
              resolve(null);
            });
        } else if (url.includes("/user/") || url.includes("/u/")) {
          reddit.getUser(getFileGroup(url)).getSubmissions({after: next})
            .then((submissionListing: any) => {
            if (submissionListing.length > 0) {
              let convertedListing = Array<string>();
              let convertedCount = 0;
              for (let s of submissionListing) {
                convertURL(s.url).then((urls: Array<string>) => {
                  convertedListing = convertedListing.concat(urls);
                  convertedCount++;
                  if (convertedCount == submissionListing.length) {
                    resolve({
                      data: convertedListing.filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
                      next: submissionListing[submissionListing.length - 1].name
                    });
                  }
                });
              }
            } else {
              resolve(null);
            }
          }).catch((err: any) => {
            // If user is not authenticated for users, prompt to re-authenticate
            if (err.statusCode == 403) {
              alert("You have not authorized FlipFlip to work with Reddit users submissions. Visit config and authorize FlipFlip to work with Reddit. Try clearing and re-authorizing FlipFlip with Reddit.");
            }
            resolve(null);
          });
        }
      });
  } else {
    if (!redditAlerted) {
      alert("You haven't authorized FlipFlip to work with Reddit yet.\nVisit Config and click 'Authorzie FlipFlip on Reddit'.");
      redditAlerted = true;
    }
    return new CancelablePromise((resolve, reject) => {
      resolve(null);
    });
  }
}

function loadImageFap(config: Config, url: string, filter: string, next: any): CancelablePromise {
  if (next == 0) {
    next = [0, 0];
  }
  return new CancelablePromise((resolve, reject) => {
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
                    resolve({
                      data: images.filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
                      next: null
                    });
                  }
                })
            }
          } else {
            resolve(null);
          }
        });
    } else if (url.includes("/organizer/")) {
      wretch(url + "?page=" + next[0])
        .get()
        .setTimeout(5000)
        .onAbort((e) => resolve(null))
        .text((html) => {
          let albumEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll("td.blk_galleries > font > a.blk_galleries");
          if (albumEls.length == 0) {
            resolve(null);
          } else if (albumEls.length > next[1]) {
            let albumEl = albumEls[next[1]];
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
                          next[1] += 1;
                          resolve({
                            data: images.filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
                            next: next
                          })
                        }
                      });
                  }
                } else {
                  next[1] += 1;
                  resolve({
                    data: [],
                    next: next
                  })
                }
              });
          } else {
            next[0] += 1;
            next[1] = 0;
            resolve({
              data: [],
              next: next
            })
          }
        });
    }
  });
}

function loadSexCom(config: Config, url: string, filter: string, next: any): CancelablePromise {
  return new CancelablePromise((resolve, reject) => {
    let requestURL;
    if (url.includes("/user/")) {
      requestURL = "http://www.sex.com/user/" + getFileGroup(url) + "?page=" + (next + 1);
    } else if (url.includes("/gifs/") || url.includes("/pics/")) {
      requestURL = "http://www.sex.com/" + getFileGroup(url) + "?page=" + (next + 1);
    }
    wretch(requestURL)
      .get()
      .setTimeout(5000)
      .onAbort((e) => resolve(null))
      .notFound((e) => resolve(null))
      .text((html) => {
        let imageEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll(".small_pin_box > .image_wrapper > img");
        if (imageEls.length > 0) {
          let images = Array<string>();
          for (let image of imageEls) {
            images.push(image.getAttribute("data-src"));
          }
          resolve({
            data: images.filter((s) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
            next: next + 1
          })
        } else {
          resolve(null);
        }
      });
  });
}

function loadImgur(config: Config, url: string, filter: string, next: any): CancelablePromise {
  return new CancelablePromise((resolve, reject) => {
    imgur.getAlbumInfo(getFileGroup(url))
      .then((json: any) => {
        resolve({
          data: json.data.images.map((i: any) => i.link).filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
          next: null
        })
      })
      .catch((err: any) => {
        console.error(err.message);
        resolve(null);
      });
  });
}

export default class HeadlessScenePlayer extends React.Component {
  readonly props: {
    config: Config,
    scene: Scene,
    nextScene: Scene,
    opacity: number,
    isPlaying: boolean,
    strobe: boolean,
    strobeTime: number,
    historyOffset: number,
    advanceHack?: ChildCallbackHack,
    deleteHack?: ChildCallbackHack,
    setHistoryOffset: (historyOffset: number) => void,
    setHistoryPaths: (historyPaths: Array<HTMLImageElement>) => void,
    firstImageLoaded: () => void,
    finishedLoading: (empty: boolean) => void,
    setProgress: (tota: number, current: number, message: string) => void,
    hasStarted: boolean,
  };

  readonly state = {
    promiseQueue: Array<{source: string, next: any}>(),
    promise: new CancelablePromise((resolve, reject) => {}),
    nextPromise: new CancelablePromise((resolve, reject) => {}),
    allURLs: new Map<string, Array<string>>(),
    restart: false,
  };

  nextPromiseQueue = Array<{source: string, next: any}>();
  nextAllURLs = new Map<string, Array<string>>();

  render() {
    return (
      <div
        className="HeadlessScenePlayer"
        style={{opacity: this.props.opacity}}>

        {this.state.allURLs.size > 0 && this.state.restart == false && (
          <ImagePlayer
            config={this.props.config}
            scene={this.props.scene}
            isPlaying={this.props.isPlaying}
            historyOffset={this.props.historyOffset}
            setHistoryOffset={this.props.setHistoryOffset}
            setHistoryPaths={this.props.setHistoryPaths}
            maxInMemory={120}
            maxLoadingAtOnce={5}
            maxToRememberInHistory={500}
            advanceHack={this.props.advanceHack}
            deleteHack={this.props.deleteHack}
            strobe={this.props.strobe}
            strobeTime={this.props.strobeTime}
            allURLs={isEmpty(Array.from(this.state.allURLs.values())) ? null : this.state.allURLs}
            onLoaded={this.props.firstImageLoaded.bind(this)}/>)}
      </div>
    );
  }

  componentDidMount() {
    redditAlerted = false;
    tumblrAlerted = false;
    let n = 0;
    let newAllURLs = new Map<string, Array<string>>();

    let sourceLoop = () => {
      if (this.state.promise.hasCanceled) return;

      const d = this.props.scene.sources[n] != null ? this.props.scene.sources[n].url : "";

      let message = d;
      if (this.props.opacity != 1) {
        message = "<p>Loading Overlay...</p>" + message;
      }
      this.props.setProgress(this.props.scene.sources.length, n+1, message);

      const loadPromise = getPromise(this.props.config, d, this.props.scene.imageTypeFilter, -1);
      this.setState({promise: loadPromise});

      loadPromise
        .getPromise()
        .then((object) => {
          let newPromiseQueue = this.state.promiseQueue;
          n += 1;

          // Just add the new urls to the end of the list
          if (object != null) {
            newAllURLs = newAllURLs.set(loadPromise.source, object.data);

            // If this is a remote URL, queue up the next promise
            if (object.next != null) {
              newPromiseQueue.push({source: d, next: object.next});
            }
          }

          this.setState({allURLs: newAllURLs, promiseQueue: newPromiseQueue});
          if (n < this.props.scene.sources.length) {
            setTimeout(sourceLoop, loadPromise.timeout);
          } else {
            this.props.finishedLoading(isEmpty(Array.from(newAllURLs.values())));
            promiseLoop();
            /*if (this.props.nextScene) { TODO
              n = 0;
              nextSourceLoop();
            }*/
          }
        });
    };

    let nextSourceLoop = () => {
      if (this.state.nextPromise.hasCanceled) return;

      const d = this.props.nextScene.sources[n] != null ? this.props.nextScene.sources[n].url : "";
      const loadPromise = getPromise(this.props.config, d, this.props.nextScene.imageTypeFilter, -1);
      this.setState({nextPromise: loadPromise});

      loadPromise
        .getPromise()
        .then((object) => {
          n += 1;

          // Just add the new urls to the end of the list
          if (object != null) {
            this.nextAllURLs = this.nextAllURLs.set(loadPromise.source, object.data);

            // If this is a remote URL, queue up the next promise
            if (object.next != null) {
              this.nextPromiseQueue.push({source: d, next: object.next})
            }
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
        const promise = getPromise(this.props.config, promiseData.source, this.props.scene.imageTypeFilter, promiseData.next);
        this.setState({promise: promise});

        promise
          .getPromise()
          .then((object) => {
            // If we are not at the end of a source
            if (object != null) {
              // Update the correct index with our new images
              let newAllURLs = this.state.allURLs;
              let sourceURLs = newAllURLs.get(promise.source);
              newAllURLs.set(promise.source, sourceURLs.concat(object.data.filter((u) => {
                const fileName = getFileName(u);
                return !sourceURLs.map((u) => getFileName(u)).includes(fileName);
              })));

              // Add the next promise to the queue
              let newPromiseQueue = this.state.promiseQueue;
              newPromiseQueue.push({source: promise.source, next: object.next});

              this.setState({allURLs: newAllURLs, promiseQueue: newPromiseQueue});
            }

            // If there is an overlay, double the timeout
            setTimeout(promiseLoop, promise.timeout);
          });
      }
    };

    sourceLoop();
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return (props.historyOffset !== this.props.historyOffset ||
      props.isPlaying !== this.props.isPlaying ||
      props.opacity !== this.props.opacity ||
      props.strobe !== this.props.strobe ||
      props.strobeTime !== this.props.strobeTime ||
      state.restart !== this.state.restart ||
      state.allURLs.size !== this.state.allURLs.size);
  }

  componentWillReceiveProps(props: any) {
    if (props.scene.id != this.props.scene.id) {
      this.componentWillUnmount();
      this.setState({
        promiseQueue: Array<{source: string, next: any}>(),
        promise: new CancelablePromise((resolve, reject) => {}),
        nextPromise: new CancelablePromise((resolve, reject) => {}),
        allURLs: new Map<string, Array<string>>(),
        restart: true});
    }
  }

  componentDidUpdate() {
    if (this.state.restart == true) {
      this.setState({restart: false});
      this.componentDidMount();
    }
  }

  componentWillUnmount() {
    this.state.nextPromise.cancel();
    this.state.promise.cancel();
  }
}
