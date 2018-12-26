import * as React from 'react';
import * as ReactDOM from 'react-dom';
import recursiveReaddir from 'recursive-readdir';
import fs from 'fs'
import animated from 'animated-gif-detector';

import Scene from '../Scene';
import ImagePlayer from './ImagePlayer';
import CaptionProgram from './CaptionProgram';

function filterPathsToJustImages(imageTypeFilter: string, paths: Array<string>): Array<string> {
  if (imageTypeFilter === 'if.any') return paths;

  if (imageTypeFilter === 'if.gifs') {
    return paths.filter((f) => f.toLowerCase().endsWith('.gif') && animated(fs.readFileSync(f)));
  }

  if (imageTypeFilter === 'if.stills') {
    return paths.filter((f) => {
      if (f.toLowerCase().endsWith('.gif') && !animated(fs.readFileSync(f))) return true;
      if (f.toLowerCase().endsWith('.png')) return true;
      if (f.toLowerCase().endsWith('.jpeg')) return true;
      if (f.toLowerCase().endsWith('.jpg')) return true;
      if (f.toLowerCase().endsWith('.webp')) return true;
      if (f.toLowerCase().endsWith('.tiff')) return true;
      return false;
    });
  }

  console.warn('unknown image type filter', imageTypeFilter);
  return paths;
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
    allPaths: Array<Array<string>>(),
  }

  render() {
    return (
      <div
        className="HeadlessScenePlayer"
        style={{opacity: this.props.opacity}}>
        {this.state.isLoaded && (
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
            allPaths={this.state.allPaths} />)}
        {this.props.showText && this.state.isLoaded && this.props.scene.hastebinID && this.props.isPlaying && (
          <CaptionProgram hastebinID={this.props.scene.hastebinID} />
        )}

        {this.props.showLoadingState && !this.state.isLoaded && (
          <div className="LoadingIndicator"><div className="loader" /></div>
        )}
        {this.props.showEmptyState && this.state.isLoaded && this.state.allPaths.length == 0 && (
          <div className="EmptyIndicator">No images found</div>
        )}
      </div>
    );
  }

  componentDidMount() {
    let n = this.props.scene.directories.length;
    this.setState({allPaths: []});
    this.props.scene.directories.forEach((d) => {
      const blacklist = ['*.css', '*.html', 'avatar.png'];
      recursiveReaddir(d, blacklist, (err: any, rawFiles: Array<string>) => {
        if (err) console.warn(err);

        const files = filterPathsToJustImages(this.props.scene.imageTypeFilter, rawFiles);

        let newAllPaths = this.state.allPaths;

        n -= 1;
        if (n == 0) {
          this.setState({isLoaded: true});
          setTimeout(this.props.didFinishLoading, 0);
        }

        if (!files || files.length === 0) {
          return;
        }

        // The scene can configure which of these branches to take
        if (this.props.scene.weightDirectoriesEqually) {
          // Just add the new paths to the end of the list
          newAllPaths = this.state.allPaths.concat([files]);
          this.setState({allPaths: newAllPaths});
        } else {
          // If we found some files, put them in their own list.
          // If list is empty, ignore.
          if (newAllPaths.length == 0) {
            newAllPaths = [files];
          } else {
            newAllPaths[0] = newAllPaths[0].concat(files);
          }
        }
      });
    });
  }
}