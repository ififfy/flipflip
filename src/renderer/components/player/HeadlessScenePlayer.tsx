import * as React from 'react';
import * as fs from "fs";
import recursiveReaddir from 'recursive-readdir';
import fileURL from 'file-url';
import wretch from 'wretch';
import http from 'http';
import Snoowrap from 'snoowrap';

import {IF, ST} from '../../const';
import {CancelablePromise, getCachePath, getFileGroup, getFileName, getSourceType} from "../../utils";
import Config from "../../Config";
import Scene from '../../Scene';
import ChildCallbackHack from './ChildCallbackHack';
import ImagePlayer from './ImagePlayer';
import Progress from '../ui/Progress';

let redditAlerted = false;

// Returns true if array is empty, or only contains empty arrays
const isEmpty = function (allURLs: any[]): boolean {
  return Array.isArray(allURLs) && allURLs.every(isEmpty);
};

function urlConversion(url: string): string {
  let imgurMatch = url.match("^https?://(?:m\.)?imgur\.com/([\\w\\d]{7})$");
  if (imgurMatch != null) {
    return "https://i.imgur.com/" + imgurMatch[1] + ".jpg";
  }
  /*let gfycatMatch = url.match("^https?://gfycat\.com/(\\w*)$");
  if (gfycatMatch != null) {
    // TODO Somehow convert richpepperyferret to RichPepperyFerret
    // Origiinal link: https://gfycat.com/richpepperyferret
    // Target link: https://giant.gfycat.com/RichPepperyFerret.gif
    return "https://giant.gfycat.com/" + gfycatMatch[1] + ".gif";
  }*/
  return url;
}

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

function getTumblrAPIKey(config: Config, overlay: boolean): string {
  if (!overlay) {
    return config.remoteSettings.tumblrDefault;
  } else {
    return config.remoteSettings.tumblrOverlay;
  }
}

// Determine what kind of source we have based on the URL and return associated Promise
function getPromise(config: Config, url: string, filter: string, next: any, overlay: boolean): CancelablePromise {
  let promise;
  const sourceType = getSourceType(url);

  if (sourceType == ST.local) { // Local files
    promise = loadLocalDirectory(url, filter, null);
  } else if (sourceType == ST.list) { // Image List
    promise = loadRemoteImageURLList(url);
  } else { // Paging sources
    let promiseFunction;
    let timeout;
    if (sourceType == ST.tumblr) {
      promiseFunction = loadTumblr;
      timeout = 8000;
    } else if (sourceType == ST.reddit) {
      promiseFunction = loadReddit;
      timeout = 3000;
    }
    if (next == -1) {
      const cachePath = getCachePath(url, config);
      if (fs.existsSync(cachePath) && config.caching.enabled) {
        // If the cache directory exists, use it
        promise = loadLocalDirectory(getCachePath(url, config), filter, 0);
      } else {
        promise = promiseFunction(config, url, filter, 0, overlay);
      }
    } else {
      promise = promiseFunction(config, url, filter, next, overlay);
    }
    promise.timeout = timeout;
  }
  promise.source = url;
  return promise;
}

function loadLocalDirectory(path: string, filter: string, next: any): CancelablePromise {
  const blacklist = ['*.css', '*.html', 'avatar.png'];

  return new CancelablePromise((resolve, reject) => {
    recursiveReaddir(path, blacklist, (err: any, rawFiles: Array<string>) => {
      if (err) {
        console.warn(err);
        resolve(null);
      } else {
        resolve({data: filterPathsToJustImages(filter, rawFiles).map((p) => fileURL(p)), next: next});
      }
    });
  });
}

function loadRemoteImageURLList(url: string): CancelablePromise {
  return new CancelablePromise((resolve, reject) => {
    wretch(url)
      .get()
      .text(data => {
        const lines = data.match(/[^\r\n]+/g).filter((line) => line.startsWith("http"));
        if (!lines.length) {
          console.warn("No lines in", url, "start with 'http://'")
        }
        resolve({data: lines, next: null});
      })
      .catch((e) => {
        console.warn("Fetch error on", url);
        console.warn(e);
        resolve(null);
      });
  });
}

function loadTumblr(config: Config, url: string, filter: string, next: any, overlay: boolean): CancelablePromise {
  const API_KEY = getTumblrAPIKey(config, overlay);
  // TumblrID takes the form of <blog_name>.tumblr.com
  let tumblrID = url.replace(/https?:\/\//, "");
  tumblrID = tumblrID.replace("/", "");
  let tumblrURL = "https://api.tumblr.com/v2/blog/" + tumblrID + "/posts/photo?api_key=" + API_KEY + "&offset=" + (next * 20);
  return new CancelablePromise((resolve, reject) => {
    wretch(tumblrURL)
      .get()
      .notFound(error => {
        console.warn(tumblrID + " is not available");
        resolve(null);
      })
      .error(429, error => {
        console.warn("Tumblr responded with 429 - Too Many Requests");
        resolve(null);
      })
      .json(json => {
        // End loop if we're at end of posts
        if (json.response.posts.length == 0) {
          resolve(null);
          return;
        }

        let images = [];
        for (let post of json.response.posts) {
          // Sometimes photos are listed separately
          if (post.photos) {
            for (let photo of post.photos) {
              let imgURL = photo.original_size.url;
              if (filter != IF.gifs || (filter == IF.gifs && imgURL.toLowerCase().endsWith('.gif'))) {
                images.push(photo.original_size.url);
              }
            }
          } else { // Sometimes photos are elements of the body
            const regex = /<img[^(?:src|\/>)]*src="([^"]*)[^(?:\/>)]*\/>/g;
            let imageSource;
            while ((imageSource = regex.exec(post.body)) !== null) {
              images.push(imageSource[1]);
            }
          }
        }
        resolve({data: images, next: (next as number) + 1});
      })
      .catch((e) => {
        console.warn("Fetch error on", tumblrURL);
        console.error(e);
        resolve(null)
      });
  });
}

function loadReddit(config: Config, url: string, filter: string, next: any, overlay: boolean): CancelablePromise {
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
          reddit.getSubreddit(getFileGroup(url)).getHot({after: next}).then((submissionListing: any) => {
            if (submissionListing.length > 0) {
              resolve({
                data: submissionListing.map((s: any) => urlConversion(s.url)).filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
                next: submissionListing[submissionListing.length - 1].name
              });
            } else {
              resolve(null);
            }
          });
        } else if (url.includes("/user/") || url.includes("/u/")) {
          reddit.getUser(getFileGroup(url)).getSubmissions({after: next}).then((submissionListing: any) => {
            if (submissionListing.length > 0) {
              resolve({
                data: submissionListing.map((s: any) => urlConversion(s.url)).filter((s: string) => isImage(s) && (filter != IF.gifs || (filter == IF.gifs && s.endsWith('.gif')))),
                next: submissionListing[submissionListing.length - 1].name
              });
            } else {
              resolve(null);
            }
          }).catch((err: any) => {
            // If user is not authenticated for users, prompt to re-authenticate
            if (err.statusCode == 403) {
              alert("You have not authorized FlipFlip to work with Reddit users submissions. Visit config and authorize FlipFlip to work with Reddit. Try clearing and re-authorizing FlipFlip with Reddit.");
              resolve(null);
            }
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

export default class HeadlessScenePlayer extends React.Component {
  readonly props: {
    config: Config,
    scene: Scene,
    opacity: number,
    showLoadingState: boolean,
    showEmptyState: boolean,
    isPlaying: boolean,
    historyOffset: number,
    advanceHack?: ChildCallbackHack,
    deleteHack?: ChildCallbackHack,
    setHistoryOffset: (historyOffset: number) => void,
    setHistoryPaths: (historyPaths: Array<HTMLImageElement>) => void,
    didFinishLoading: (empty?: boolean) => void,
  };

  readonly state = {
    isLoaded: false,
    onLoaded: Function(),
    promiseQueue: Array<CancelablePromise>(),
    promise: new CancelablePromise((resolve, reject) => {}),
    sourcesProcessed: 0,
    progressMessage: this.props.scene.sources.length > 0 ? this.props.scene.sources[0].url : "",
    allURLs: new Map<string, Array<string>>(),
  };

  render() {
    const showImagePlayer = this.state.onLoaded != null;
    const showLoadingIndicator = this.props.showLoadingState && !this.state.isLoaded;
    const showEmptyIndicator = this.props.showEmptyState && this.state.isLoaded && isEmpty(Array.from(this.state.allURLs.values()));

    return (
      <div
        className="HeadlessScenePlayer"
        style={{opacity: this.props.opacity}}>

        {showImagePlayer && (
          <ImagePlayer
            config={this.props.config}
            advanceHack={this.props.advanceHack}
            deleteHack={this.props.deleteHack}
            historyOffset={this.props.historyOffset}
            setHistoryOffset={this.props.setHistoryOffset}
            setHistoryPaths={this.props.setHistoryPaths}
            maxInMemory={120}
            maxLoadingAtOnce={5}
            maxToRememberInHistory={500}
            timingFunction={this.props.scene.timingFunction}
            timingConstant={this.props.scene.timingConstant}
            zoomType={this.props.scene.zoomType}
            backgroundType={this.props.scene.backgroundType}
            backgroundColor={this.props.scene.backgroundColor}
            strobe={this.props.opacity == 1 && !this.props.scene.strobeOverlay ? this.props.scene.strobe : false}
            strobeTime={this.props.scene.strobeTime}
            strobeColor={this.props.scene.strobeColor}
            effectLevel={this.props.scene.effectLevel}
            horizTransType={this.props.scene.horizTransType}
            vertTransType={this.props.scene.vertTransType}
            imageTypeFilter={this.props.scene.imageTypeFilter}
            isPlaying={this.props.isPlaying}
            fadeEnabled={this.props.scene.crossFade}
            playFullGif={this.props.scene.playFullGif}
            imageSizeMin={this.props.scene.imageSizeMin}
            allURLs={isEmpty(Array.from(this.state.allURLs.values())) ? null : this.state.allURLs}
            onLoaded={this.state.onLoaded.bind(this)}/>)}

        {showLoadingIndicator && (
          <Progress
            total={this.props.scene.sources.length}
            current={this.state.sourcesProcessed}
            message={this.state.progressMessage}/>
        )}

        {showEmptyIndicator && (
          <div className="EmptyIndicator">No images found</div>
        )}
      </div>
    );
  }

  componentDidMount() {
    redditAlerted = false;
    let n = 0;
    let newAllURLs = new Map<string, Array<string>>();

    let sourceLoop = () => {
      let d = this.props.scene.sources[n] != null ? this.props.scene.sources[n].url : "";
      let loadPromise = getPromise(this.props.config, d, this.props.scene.imageTypeFilter, -1, this.props.opacity != 1);

      // Because of rendering lag, always display the NEXT source, unless this is the last one
      let message;
      if ((n + 1) == this.props.scene.sources.length) {
        message = d;
      } else {
        message = this.props.scene.sources[n + 1] != null ? this.props.scene.sources[n + 1].url : "";
      }
      if (this.props.opacity != 1) {
        message = "<p>Loading Overlay...</p>" + message;
      }

      this.setState({promise: loadPromise, progressMessage: message});

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
              newPromiseQueue.push(
                getPromise(this.props.config, d, this.props.scene.imageTypeFilter, object.next, this.props.opacity != 1));
            }
          }

          if (n < this.props.scene.sources.length) {
            this.setState({sourcesProcessed: (n + 1), promiseQueue: newPromiseQueue});
            sourceLoop();
          } else {
            this.setState({allURLs: newAllURLs, onLoaded: this.onLoaded, promiseQueue: newPromiseQueue});
            setTimeout(this.props.didFinishLoading.bind(this, isEmpty(Array.from(newAllURLs.values()))), 0);
            // All sources have been initialized, start our remote promise loop
            promiseLoop();
          }
        });
    };

    let promiseLoop = () => {
      // Process until queue is empty or player has been stopped
      if (this.state.promiseQueue.length > 0 && !this.state.promise.hasCanceled) {
        let promise = this.state.promiseQueue.shift();
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
              newPromiseQueue.push(
                getPromise(this.props.config, promise.source, this.props.scene.imageTypeFilter, object.next, this.props.opacity != 1));

              this.setState({allURLs: newAllURLs, promiseQueue: newPromiseQueue});
            }

            // If there is an overlay, double the timeout
            setTimeout(promiseLoop, promise.timeout);
          });
      }
    };

    sourceLoop();
  }

  componentWillUnmount() {
    this.state.promise.cancel(); // Cancel the promise
  }

  onLoaded() {
    this.setState({isLoaded: true});
  }
}
