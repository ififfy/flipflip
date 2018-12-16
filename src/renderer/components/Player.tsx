import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {join} from 'path';
import {readdir} from 'fs';

import Scene from '../Scene';
import ImagePlayer from './ImagePlayer';

function filterPathsToJustImages(imageTypeFilter: string, paths: Array<string>): Array<string> {
  if (imageTypeFilter === 'any') return paths;

  if (imageTypeFilter === 'gifs') {
    return paths.filter((f) => f.toLowerCase().endsWith('.gif'));
  }

  if (imageTypeFilter === 'stills') {
    return paths.filter((f) => {
      if (f.toLowerCase().endsWith('.gif')) return true;
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

export default class Player extends React.Component {
  readonly props: {
    goBack(): void,
    scene: Scene,
  }

  readonly state = {
    isLoaded: false,
    isPlaying: false,
    allPaths: Array<Array<string>>(),
  }

  render() {
    console.log(this.state);
    return (
      <div className="Player">
        <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>

        {this.state.isLoaded && (
          <ImagePlayer
            maxInMemory={120}
            maxLoadingAtOnce={5}
            maxToRememberInHistory={500}
            timingFunction={this.props.scene.timingFunction}
            isPlaying={this.state.isPlaying}
            allPaths={this.state.allPaths} />)}

        {!this.state.isLoaded && <div>Loading...</div>}
      </div>
    );
  }
  
  componentDidMount() {
    const loadAll = () => {
      let n = this.props.scene.directories.length;
      this.setState({allPaths: []});
      this.props.scene.directories.forEach((d) => {
        readdir(d, (err, rawFiles) => {
          if (err) console.warn(err);

          const files = filterPathsToJustImages(this.props.scene.imageTypeFilter, rawFiles)
            .map((p) => join(d, p));

          let newAllPaths = this.state.allPaths;
          if (this.props.scene.weightDirectoriesEqually) {
            newAllPaths = this.state.allPaths.concat([files]);
            this.setState({allPaths: newAllPaths});
          } else {
            if (newAllPaths.length == 0) {
              newAllPaths = [files];
            } else {
              newAllPaths[0] = newAllPaths[0].concat(files);
            }
          }

          n -= 1;
          if (n == 0) {
            this.setState({isLoaded: true, isPlaying: true});
          }
        });
      });
    };
    loadAll();
  }
};