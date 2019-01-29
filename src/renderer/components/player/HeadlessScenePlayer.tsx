import * as React from 'react';
import recursiveReaddir from 'recursive-readdir';
import fileURL from 'file-url';
import wretch from 'wretch';

import Scene from '../../Scene';
import Progress from '../ui/Progress';
import ImagePlayer from './ImagePlayer';
import CaptionProgram from './CaptionProgram';
import { TK, IF } from '../../const';
import ChildCallbackHack from './ChildCallbackHack';

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
    case TK.url: return src;
    case TK.hastebin: return `https://hastebin.com/raw/${src}`;
    default: return src;
  }
}

// Determine what kind of source we have based on the URL and return associated Promise
function getPromise(url: string, filter: string, page: number, index: number): CancelablePromise {
  let promise;
  if (/^https?:\/\/[^\.]*\.tumblr\.com/.exec(url) != null) { // Tumblr
    promise = loadTumblr(url, filter, page);
    promise.source = url;
    promise.index = index;
    promise.page = page;
    promise.timeout = 8000; // This delay might have to be modified, 5000 was too low, resulted in 429 response
  } else if (/^https?:\/\//.exec(url) != null) { // Arbitrary URL, assume image list
    promise = loadRemoteImageURLList(url, filter);
  } else { // Directory
    promise = loadLocalDirectory(url, filter);
  }
  return promise;
}

function loadLocalDirectory(path: string, filter: string): CancelablePromise {
  const blacklist = ['*.css', '*.html', 'avatar.png'];

  return new CancelablePromise((resolve, reject) => {
    recursiveReaddir(path, blacklist, (err: any, rawFiles: Array<string>) => {
      if (err) console.warn(err);
      resolve(filterPathsToJustImages(filter, rawFiles).map((p) => fileURL(p)));
    });
  });
}

function loadRemoteImageURLList(url: string, filter: string): CancelablePromise {
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

function loadTumblr(url: string, filter: string, page: number): CancelablePromise {
  // Implementing hard page cap for now
  // TODO Implement caching and remove this
  if (page > 20) {
    return new CancelablePromise((resolve, reject) => {resolve(null)});
  }
  // Using GoddessServant0's API key for now
  // TODO Allow user to specify API key or something?
  let API_KEY="BaQquvlxQeRhKRyViknF98vseIdcBEyDrzJBpHxvAiMPHCKR2l";
  // TumblrID takes the form of <blog_name>.tumblr.com
  let tumblrID = url.replace(/https?:\/\//, "");
  tumblrID = tumblrID.replace("/", "");
  let tumblrURL = "https://api.tumblr.com/v2/blog/" + tumblrID + "/posts/photo?api_key=" + API_KEY + "&offset=" + (page*20);
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
        resolve(images);
      })
      .catch((e) => {
        console.warn("Fetch error on", tumblrURL);
        console.error(e);
        resolve(null)
      });
  });
}

// Inspired by https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
class CancelablePromise extends Promise<Array<string>> {
  hasCanceled: boolean;
  // Only looping sources use these properties
  source: string;
  index: number;
  page: number;
  timeout: number;


  constructor(executor: (resolve: (value?: (PromiseLike<Array<string>> | Array<string>)) => void, reject: (reason?: any) => void) => void) {
    super(executor);
    this.hasCanceled = false;
    this.source = "";
    this.index = 0;
    this.page = 0;
    this.timeout = 0;
  }

  getPromise(): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      this.then(
          val => this.hasCanceled ? null : resolve(val),
          error => this.hasCanceled ? null : reject(error)
      );
    });
  }

  cancel() {
    this.hasCanceled = true;
  }
}

export default class HeadlessScenePlayer extends React.Component {
  readonly props: {
    scene: Scene,
    opacity: number,
    showText: boolean,
    showLoadingState: boolean,
    showEmptyState: boolean,
    isPlaying: boolean,
    historyOffset: number,
    advanceHack?: ChildCallbackHack,
    setHistoryPaths: (historyPaths: string[]) => void,
    didFinishLoading: () => void,
  };

  readonly state = {
    isLoaded: false,
    onLoaded: Function(),
    promiseQueue: Array<CancelablePromise>(),
    promise: new CancelablePromise((resolve, reject) => {}),
    directoriesProcessed: 0,
    progressMessage: this.props.scene.directories.length > 0 ? this.props.scene.directories[0] : "",
    allURLs: Array<Array<string>>(),
  };

  render() {
    // Returns true if array is empty, or only contains empty arrays
    const isEmpty = function(allURLs: any[], index: number, array: any[]): boolean {
      return Array.isArray(allURLs) && allURLs.every(isEmpty);
    };

    const showImagePlayer = this.state.onLoaded != null;
    const showLoadingIndicator = this.props.showLoadingState && !this.state.isLoaded;
    const showEmptyIndicator = this.props.showEmptyState && this.state.isLoaded && isEmpty(this.state.allURLs, -1, null);
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
            advanceHack={this.props.advanceHack}
            historyOffset={this.props.historyOffset}
            setHistoryPaths={this.props.setHistoryPaths}
            maxInMemory={120}
            maxLoadingAtOnce={5}
            maxToRememberInHistory={500}
            timingFunction={this.props.scene.timingFunction}
            timingConstant={this.props.scene.timingConstant}
            zoomType={this.props.scene.zoomType}
            backgroundType = {this.props.scene.backgroundType}
            backgroundColor = {this.props.scene.backgroundColor}
            effectLevel={this.props.scene.effectLevel}
            horizTransType={this.props.scene.horizTransType}
            vertTransType={this.props.scene.vertTransType}
            imageTypeFilter={this.props.scene.imageTypeFilter}
            isPlaying={this.props.isPlaying}
            fadeEnabled={this.props.scene.crossFade}
            playFullGif={this.props.scene.playFullGif}
            imageSizeMin={this.props.scene.imageSizeMin}
            allURLs={isEmpty(this.state.allURLs, -1, null) ? null : this.state.allURLs}
            onLoaded={this.state.onLoaded.bind(this)}/>)}

        {showCaptionProgram && (
          <CaptionProgram url={textURL(this.props.scene.textKind, this.props.scene.textSource)} />
        )}

        {showLoadingIndicator && (
          <Progress
            total={this.props.scene.directories.length}
            current={this.state.directoriesProcessed}
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
    this.setState({allURLs: []});
    let newAllURLs = Array<Array<string>>();

    let directoryLoop = () => {
      let d = this.props.scene.directories[n];
      let loadPromise = getPromise(d, this.props.scene.imageTypeFilter, 0, n);

      // Because of rendering lag, always display the NEXT source, unless this is the last one
      let message;
      if ((n+1) == this.props.scene.directories.length) {
        message = d;
      } else {
        message = this.props.scene.directories[n+1];
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
          newAllURLs = newAllURLs.concat([urls]);

          // If this is a remote URL, queue up the next promise
          if (loadPromise.source.length > 0) {
            newPromiseQueue.push(
                getPromise(d, this.props.scene.imageTypeFilter, loadPromise.page + 1, loadPromise.index));
          }

          if (n < this.props.scene.directories.length) {
            this.setState({directoriesProcessed: (n + 1), promiseQueue: newPromiseQueue});
            directoryLoop();
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
              let sourceURLs = newAllURLs[promise.index];
              newAllURLs[promise.index] = sourceURLs.concat(urls);

              // Add the next promise to the queue
              let newPromiseQueue = this.state.promiseQueue;
              newPromiseQueue.push(
                  getPromise(promise.source, this.props.scene.imageTypeFilter, promise.page + 1, promise.index));

              this.setState({allURLs: newAllURLs, promiseQueue: newPromiseQueue});
            }

            // If there is an overlay, double the timeout
            setTimeout(promiseLoop, this.props.scene.overlaySceneID != -1 ? promise.timeout * 2 : promise.timeout);
          });
      }
    };

    directoryLoop();

  }

  componentWillUnmount() {
    this.state.promise.cancel(); // Cancel the promise
  }

  onLoaded() {
    this.setState({isLoaded: true});
  }
}
