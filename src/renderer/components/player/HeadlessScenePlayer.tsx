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

function isURL(maybeURL: string): boolean {
  return maybeURL.startsWith('http');  // lol
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

// Inspired by https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
class CancelablePromise extends Promise<Array<string>> {
  hasCanceled_ : boolean;


  constructor(executor: (resolve: (value?: (PromiseLike<Array<string>> | Array<string>)) => void, reject: (reason?: any) => void) => void) {
    super(executor);
    this.hasCanceled_ = false;
  }

  getPromise() : Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      this.then(
          val => this.hasCanceled_ ? null : resolve(val),
          error => this.hasCanceled_ ? null : reject(error)
      );
    });
  }

  cancel() {
    this.hasCanceled_ = true;
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
    promise: new CancelablePromise((resolve, reject) => {}),
    directoriesProcessed: 0,
    progressMessage: "",
    allURLs: Array<Array<string>>(),
  };

  render() {
    const showImagePlayer = this.state.isLoaded;
    const showLoadingIndicator = this.props.showLoadingState && !this.state.isLoaded;
    const showEmptyIndicator = (
      this.props.showEmptyState &&
      this.state.isLoaded &&
      this.state.allURLs.length == 0);
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
            effectLevel={this.props.scene.effectLevel}
            horizTransType={this.props.scene.horizTransType}
            vertTransType={this.props.scene.vertTransType}
            imageTypeFilter={this.props.scene.imageTypeFilter}
            isPlaying={this.props.isPlaying}
            fadeEnabled={this.props.scene.crossFade}
            playFullGif={this.props.scene.playFullGif}
            imageSizeMin={this.props.scene.imageSizeMin}
            allURLs={this.state.allURLs} />)}

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
      let loadPromise = (isURL(d)
          ? loadRemoteImageURLList(d, this.props.scene.imageTypeFilter)
          : loadLocalDirectory(d, this.props.scene.imageTypeFilter));

      let message = d;
      if (this.props.opacity != 1) {
        message = "<p>Loading Overlay...</p>" + d;
      }

      this.setState({promise: loadPromise, progressMessage: message});

      loadPromise
        .getPromise()
        .then((urls) => {
          n += 1;

          // The scene can configure which of these branches to take
          if (urls.length > 0) {
            if (this.props.scene.weightDirectoriesEqually) {
              // Just add the new urls to the end of the list
              newAllURLs = newAllURLs.concat([urls]);
            } else {
              if (newAllURLs.length == 0) newAllURLs = [[]];
              // Append to a single list of urls
              newAllURLs[0] = newAllURLs[0].concat(urls);
            }
          }

          if (n < this.props.scene.directories.length) {
            this.setState({directoriesProcessed: (n + 1)});
            directoryLoop();
          } else {
            this.setState({allURLs: newAllURLs, isLoaded: true});
            setTimeout(this.props.didFinishLoading, 0);
          }
        }
      )
    };

    directoryLoop();

  }

  componentWillUnmount() {
    this.state.promise.cancel(); // Cancel the promise
  }
}