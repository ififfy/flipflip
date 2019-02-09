import * as React from 'react';
import * as fs from "fs";
import recursiveReaddir from 'recursive-readdir';
import fileURL from 'file-url';
import wretch from 'wretch';

import {IF, ST, TOT} from '../../const';
import {CancelablePromise, getCachePath, getFileName, getSourceType} from "../../utils";
import Config from "../../Config";
import Scene from '../../Scene';
import CaptionProgram from './CaptionProgram';
import ChildCallbackHack from './ChildCallbackHack';
import ImagePlayer from './ImagePlayer';
import Progress from '../ui/Progress';

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

function textURL(kind: string, src: string): string {
  switch (kind) {
    case TOT.url:
      return src;
    case TOT.hastebin:
      return `https://hastebin.com/raw/${src}`;
    default:
      return src;
  }
}

function getTumblrAPIKey(config: Config, overlay: boolean, attempt: number): string {
  if (attempt == 0) { // This is our first attempt, use defaults
    if (!overlay) {
      return config.remoteSettings.tumblrDefault;
    } else {
      return config.remoteSettings.tumblrOverlay;
    }
  } else {
    let nextAPIKey = null;
    for (let key of config.remoteSettings.tumblrOther) {
      if (key != config.remoteSettings.tumblrDefault &&
        key != config.remoteSettings.tumblrOverlay) {
        if (attempt == 0) {
          nextAPIKey = key;
        } else {
          attempt -= 1;
        }
      }
    }
    // If they have all been used, just use default
    if (nextAPIKey == null) nextAPIKey = config.remoteSettings.tumblrDefault;
    return nextAPIKey;
  }
}

// Determine what kind of source we have based on the URL and return associated Promise
function getPromise(config: Config, url: string, filter: string, page: number, overlay: boolean): CancelablePromise {
  let promise;
  const sourceType = getSourceType(url);
  switch (sourceType) {
    case ST.tumblr:
      if (page == -1) {
        const cachePath = getCachePath(url, config);
        if (fs.existsSync(cachePath) && config.caching.enabled) {
          // If the cache directory exists, use it
          promise = loadLocalDirectory(getCachePath(url, config), filter);
          promise.page = -1;
        } else {
          // Otherwise loadTumblr;
          promise = loadTumblr(config, url, filter, page, overlay, 0);
          promise.page = 0;
        }
      } else {
        promise = loadTumblr(config, url, filter, page, overlay, 0);
        promise.page = page;
      }
      promise.timeout = 8000;
      break;
    case ST.reddit:
      if (page == -1) {
        const cachePath = getCachePath(url, config);
        if (fs.existsSync(cachePath) && config.caching.enabled) {
          // If the cache directory exists, use it
          promise = loadLocalDirectory(getCachePath(url, config), filter);
          promise.page = -1;
        } else {
          // Otherwise loadTumblr;
          promise = loadReddit(config, url, filter, page, overlay, 0);
          promise.page = 0;
        }
      } else {
        promise = loadReddit(config, url, filter, page, overlay, 0);
        promise.page = page;
      }
      promise.timeout = 1000;
      break;
    case ST.list:
      promise = loadRemoteImageURLList(url);
      break;
    case ST.local:
      promise = loadLocalDirectory(url, filter);
      break;
  }
  promise.source = url;
  return promise;
}

function loadLocalDirectory(path: string, filter: string): CancelablePromise {
  const blacklist = ['*.css', '*.html', 'avatar.png'];

  return new CancelablePromise((resolve, reject) => {
    recursiveReaddir(path, blacklist, (err: any, rawFiles: Array<string>) => {
      if (err) {
        console.warn(err);
        resolve([]);
      } else {
        resolve(filterPathsToJustImages(filter, rawFiles).map((p) => fileURL(p)));
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
        resolve(lines);
      })
      .catch((e) => {
        console.warn("Fetch error on", url);
        console.warn(e);
        resolve([]);
      });
  });
}

function loadTumblr(config: Config, url: string, filter: string, page: number, overlay: boolean, attempt: number): CancelablePromise {
  const API_KEY = getTumblrAPIKey(config, overlay, attempt);
  // TumblrID takes the form of <blog_name>.tumblr.com
  let tumblrID = url.replace(/https?:\/\//, "");
  tumblrID = tumblrID.replace("/", "");
  let tumblrURL = "https://api.tumblr.com/v2/blog/" + tumblrID + "/posts/photo?api_key=" + API_KEY + "&offset=" + (page * 20);
  return new CancelablePromise((resolve, reject) => {
    wretch(tumblrURL)
      .get()
      .notFound(error => {
        console.warn(tumblrID + " is not available");
        resolve(null);
      })
      .error(429, error => {
        console.warn("Tumblr responded with 429 - Too Many Requests");
        if (attempt < 4) {
          loadTumblr(config, url, filter, page, overlay, attempt + 1);
        } else {
          resolve(null);
        }
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
        resolve(images);
      })
      .catch((e) => {
        console.warn("Fetch error on", tumblrURL);
        console.error(e);
        resolve(null)
      });
  });
}

function loadReddit(config: Config, url: string, filter: string, page: number, overlay: boolean, attempt: number): CancelablePromise {
  let configured = true;
  if (config.remoteSettings.redditClientID == "") {
    configured = false;
    console.warn("Reddit Client ID is not configured");
  }
  if (config.remoteSettings.redditClientSecret == "") {
    configured = false;
    console.warn("Reddit Client Secret is not configured");
  }
  if (config.remoteSettings.redditUsername == "") {
    configured = false;
    console.warn("Reddit Username is not configured");
  }
  if (config.remoteSettings.redditUsername == "") {
    configured = false;
    console.warn("Reddit Username is not configured");
  }
  if (config.remoteSettings.redditPassword == "") {
    configured = false;
    console.warn("Reddit Password is not configured");
  }

  //TODO Finish implementing reddit
  if (configured) {
    return new CancelablePromise((resolve, reject) => {
      /*const reddit = new Snoowrap({
        clientId: config.remoteSettings.redditClientID,
        clientSecret: config.remoteSettings.redditClientSecret,
        username: config.remoteSettings.redditUsername,
        password: config.remoteSettings.redditPassword,
      });
      console.log(getFileGroup(url));
      reddit.getSubreddit(getFileGroup(url)).getHot();*/
      resolve(null);
    });
  } else {
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
    showText: boolean,
    showLoadingState: boolean,
    showEmptyState: boolean,
    isPlaying: boolean,
    historyOffset: number,
    advanceHack?: ChildCallbackHack,
    deleteHack?: ChildCallbackHack,
    setHistoryOffset: (historyOffset: number) => void,
    setHistoryPaths: (historyPaths: Array<HTMLImageElement>) => void,
    didFinishLoading: () => void,
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
    // Returns true if array is empty, or only contains empty arrays
    const isEmpty = function (allURLs: any[]): boolean {
      return Array.isArray(allURLs) && allURLs.every(isEmpty);
    };

    const showImagePlayer = this.state.onLoaded != null;
    const showLoadingIndicator = this.props.showLoadingState && !this.state.isLoaded;
    const showEmptyIndicator = this.props.showEmptyState && this.state.isLoaded && isEmpty(Array.from(this.state.allURLs.values()));
    const showCaptionProgram = (
      this.props.showText &&
      this.state.isLoaded &&
      this.props.scene.textSource &&
      this.props.scene.textSource.length &&
      this.props.isPlaying);

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

        {showCaptionProgram && (
          <CaptionProgram
            config={this.props.config}
            url={textURL(this.props.scene.textKind, this.props.scene.textSource)}/>
        )}

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
    let n = 0;
    let newAllURLs = new Map<string, Array<string>>();

    let sourceLoop = () => {
      let d = this.props.scene.sources[n].url;
      let loadPromise = getPromise(this.props.config, d, this.props.scene.imageTypeFilter, -1, this.props.opacity != 1);

      // Because of rendering lag, always display the NEXT source, unless this is the last one
      let message;
      if ((n + 1) == this.props.scene.sources.length) {
        message = d;
      } else {
        message = this.props.scene.sources[n + 1].url;
      }
      if (this.props.opacity != 1) {
        message = "<p>Loading Overlay...</p>" + message;
      }

      this.setState({promise: loadPromise, progressMessage: message});

      loadPromise
        .getPromise()
        .then((urls) => {
          let newPromiseQueue = this.state.promiseQueue;
          n += 1;

          // Just add the new urls to the end of the list
          newAllURLs = newAllURLs.set(loadPromise.source, urls);

          // If this is a remote URL, queue up the next promise
          if (loadPromise.page) {
            newPromiseQueue.push(
              getPromise(this.props.config, d, this.props.scene.imageTypeFilter, loadPromise.page + 1, this.props.opacity != 1));
          }

          if (n < this.props.scene.sources.length) {
            this.setState({sourcesProcessed: (n + 1), promiseQueue: newPromiseQueue});
            sourceLoop();
          } else {
            this.setState({allURLs: newAllURLs, onLoaded: this.onLoaded, promiseQueue: newPromiseQueue});
            setTimeout(this.props.didFinishLoading, 0);
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
          .then((urls) => {
            // If we are not at the end of a source
            if (urls != null) {
              // Update the correct index with our new images
              let newAllURLs = this.state.allURLs;
              let sourceURLs = newAllURLs.get(promise.source);
              newAllURLs.set(promise.source, sourceURLs.concat(urls.filter((u) => {
                const fileName = getFileName(u);
                return !sourceURLs.map((u) => getFileName(u)).includes(fileName);
              })));

              // Add the next promise to the queue
              let newPromiseQueue = this.state.promiseQueue;
              newPromiseQueue.push(
                getPromise(this.props.config, promise.source, this.props.scene.imageTypeFilter, promise.page + 1, this.props.opacity != 1));

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
