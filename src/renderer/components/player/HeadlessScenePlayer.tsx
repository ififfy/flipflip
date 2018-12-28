import * as React from 'react';
import * as ReactDOM from 'react-dom';
import recursiveReaddir from 'recursive-readdir';
import fs from 'fs'
import fileURL from 'file-url';
import animated from 'animated-gif-detector';
import wretch from 'wretch';

import Scene from '../../Scene';
import ImagePlayer from './ImagePlayer';
import CaptionProgram from './CaptionProgram';
import { TK, IF } from '../../const';

function isImage(path: string): boolean {
  const p = path.toLowerCase()
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
      return paths.filter((p) => isImage(p));
    case IF.gifs:
      return paths.filter((f) => f.toLowerCase().endsWith('.gif') && animated(fs.readFileSync(f)));
    case IF.stills:
      return paths.filter((f) => {
        const p = f.toLowerCase()
        if (p.endsWith('.gif') && !animated(fs.readFileSync(f))) return true;
        if (p.endsWith('.png')) return true;
        if (p.endsWith('.jpeg')) return true;
        if (p.endsWith('.jpg')) return true;
        if (p.endsWith('.webp')) return true;
        if (p.endsWith('.tiff')) return true;
        if (p.endsWith('.svg')) return true;
        return false;
      });
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

function loadLocalDirectory(path: string, filter: string): Promise<Array<string>> {
  const blacklist = ['*.css', '*.html', 'avatar.png'];

  return new Promise<Array<string>>((resolve, reject) => {
    recursiveReaddir(path, blacklist, (err: any, rawFiles: Array<string>) => {
      if (err) console.warn(err);
      resolve(filterPathsToJustImages(filter, rawFiles).map((p) => fileURL(p)));
    });
  });
}

function loadRemoteImageURLList(url: string, filter: string): Promise<Array<string>> {
  return new Promise<Array<string>>((resolve, reject) => {
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

export default class HeadlessScenePlayer extends React.Component {
  readonly props: {
    scene: Scene,
    opacity: number,
    showText: boolean,
    showLoadingState: boolean,
    showEmptyState: boolean,
    isPlaying: boolean,
    historyOffset: number,
    setHistoryLength: (historyLength: number) => void,
    didFinishLoading: () => void,
  }

  readonly state = {
    isLoaded: false,
    allURLs: Array<Array<string>>(),
  }

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
            historyOffset={this.props.historyOffset}
            setHistoryLength={this.props.setHistoryLength}
            maxInMemory={120}
            maxLoadingAtOnce={5}
            maxToRememberInHistory={500}
            timingFunction={this.props.scene.timingFunction}
            timingConstant={this.props.scene.timingConstant}
            zoomType={this.props.scene.zoomType}
            zoomLevel={this.props.scene.zoomLevel}
            isPlaying={this.props.isPlaying}
            fadeEnabled={this.props.scene.crossFade}
            imageSizeMin={this.props.scene.imageSizeMin}
            allURLs={this.state.allURLs} />)}

        {showCaptionProgram && (
          <CaptionProgram url={textURL(this.props.scene.textKind, this.props.scene.textSource)} />
        )}

        {showLoadingIndicator && (
          <div className="LoadingIndicator">
            <div className="loader" />
            <div className="LoadingIndicator__Text">Building image list</div>
          </div>
        )}

        {showEmptyIndicator && (
          <div className="EmptyIndicator">No images found</div>
        )}
      </div>
    );
  }

  componentDidMount() {
    let n = this.props.scene.directories.length;
    this.setState({allURLs: []});

    let newAllURLs = Array<Array<string>>();

    this.props.scene.directories.forEach((d) => {
      const loadPromise = (isURL(d)
        ? loadRemoteImageURLList(d, this.props.scene.imageTypeFilter)
        : loadLocalDirectory(d, this.props.scene.imageTypeFilter))
      
        loadPromise.then((urls) => {
          n -= 1;

          // The scene can configure which of these branches to take
          if (this.props.scene.weightDirectoriesEqually) {
            // Just add the new urls to the end of the list
            newAllURLs = this.state.allURLs.concat([urls]);
          } else {
            if (newAllURLs.length == 0) newAllURLs = [[]];
            // Append to a single list of urls
            newAllURLs[0] = newAllURLs[0].concat(urls);
          }

          if (n == 0) {
            this.setState({allURLs: newAllURLs, isLoaded: true});
            setTimeout(this.props.didFinishLoading, 0);
          }
        })
    });
  }
}