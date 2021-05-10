import * as React from 'react';
import * as fs from "fs";
import * as path from "path";
import worker from 'workerize-loader!./Scrapers';

import {
  CancelablePromise,
  getCachePath,
  randomizeList,
} from "../../data/utils";
import {getFileName, getSourceType} from "./Scrapers";
import {SOF, ST, WF} from '../../data/const';
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from '../../data/Scene';
import Audio from "../../data/Audio";
import ChildCallbackHack from './ChildCallbackHack';
import ImagePlayer from './ImagePlayer';

let workerInstance: any = null;
let workerListener: any = null;

// Returns true if array is empty, or only contains empty arrays
function isEmpty(allURLs: any[]): boolean {
  return Array.isArray(allURLs) && allURLs.every(isEmpty);
}

// Determine what kind of source we have based on the URL and return associated Promise
function scrapeFiles(config: Config, source: LibrarySource, filter: string, helpers: {next: any, count: number, retries: number}) {
  const sourceType = getSourceType(source.url);

  if (sourceType == ST.local) { // Local files
    helpers.next = null;
    workerInstance.loadLocalDirectory(config, source, filter, helpers);
  } else if (sourceType == ST.list) { // Image List
    helpers.next = null;
    workerInstance.loadRemoteImageURLList(config, source, filter, helpers);
  } else if (sourceType == ST.video) {
    helpers.next = null;
    const cachePath = getCachePath(source.url, config) + getFileName(source.url);
    if (fs.existsSync(cachePath)) {
      const realURL = source.url;
      source.url = cachePath;
      workerInstance.loadVideo(config, source, filter, helpers);
      source.url = realURL;
    } else {
      workerInstance.loadVideo(config, source, filter, helpers);
    }
  } else if (sourceType == ST.playlist) {
    helpers.next = null;
    const cachePath = getCachePath(source.url, config) + getFileName(source.url);
    if (fs.existsSync(cachePath)) {
      const realURL = source.url;
      source.url = cachePath;
      workerInstance.loadPlaylist(config, source, filter, helpers);
      source.url = realURL;
    } else {
      workerInstance.loadPlaylist(config, source, filter, helpers);
    }
  } else { // Paging sources
    let workerFunction;
    if (sourceType == ST.tumblr) {
      workerFunction = workerInstance.loadTumblr;
    } else if (sourceType == ST.reddit) {
      workerFunction = workerInstance.loadReddit;
    } else if (sourceType == ST.imagefap) {
      workerFunction = workerInstance.loadImageFap;
    } else if (sourceType == ST.sexcom) {
      workerFunction = workerInstance.loadSexCom;
    } else if (sourceType == ST.imgur) {
      workerFunction = workerInstance.loadImgur;
    } else if (sourceType == ST.twitter) {
      workerFunction = workerInstance.loadTwitter;
    } else if (sourceType == ST.deviantart) {
      workerFunction = workerInstance.loadDeviantArt;
    } else if (sourceType == ST.instagram) {
      workerFunction = workerInstance.loadInstagram;
    } else if (sourceType == ST.danbooru) {
      workerFunction = workerInstance.loadDanbooru;
    } else if (sourceType == ST.e621) {
      workerFunction = workerInstance.loadE621;
    } else if (sourceType == ST.gelbooru1) {
      workerFunction = workerInstance.loadGelbooru1;
    } else if (sourceType == ST.gelbooru2) {
      workerFunction = workerInstance.loadGelbooru2;
    } else if (sourceType == ST.ehentai) {
      workerFunction = workerInstance.loadEHentai;
    } else if (sourceType == ST.bdsmlr) {
      workerFunction = workerInstance.loadBDSMlr;
    } else if (sourceType == ST.hydrus) {
      workerFunction = workerInstance.loadHydrus;
    }
    if (helpers.next == -1) {
      helpers.next = 0;
      const cachePath = getCachePath(source.url, config);
      if (config.caching.enabled && fs.existsSync(cachePath) && fs.readdirSync(cachePath).length > 0) {
        // If the cache directory exists, use it
        const realURL = source.url;
        source.url = cachePath;
        workerInstance.loadLocalDirectory(config, source, filter, helpers);
        source.url = realURL;
      } else {
        workerFunction(config, source, filter, helpers);
      }
    } else {
      workerFunction(config, source, filter, helpers);
    }
  }
}

export default class SourceScraper extends React.Component {
  readonly props: {
    config: Config,
    scene: Scene,
    nextScene?: Scene,
    currentAudio: Audio,
    opacity: number,
    isPlaying: boolean,
    gridView: boolean,
    hasStarted: boolean,
    strobeLayer?: string,
    historyOffset: number,
    advanceHack: ChildCallbackHack,
    deleteHack?: ChildCallbackHack,
    isOverlay?: boolean,
    setHistoryOffset(historyOffset: number): void,
    setHistoryPaths(historyPaths: Array<any>): void,
    firstImageLoaded(): void,
    finishedLoading(empty: boolean): void,
    setProgress(total: number, current: number, message: string[]): void,
    setVideo(video: HTMLVideoElement): void,
    setCount(sourceURL: string, count: number, countComplete: boolean): void,
    cache(i: HTMLImageElement | HTMLVideoElement): void,
    systemMessage(message: string): void,
    setTimeToNextFrame?(timeToNextFrame: number): void,
    playNextScene?(): void,
  };

  // TODO Remove Promise stuff
  readonly state = {
    promiseQueue: Array<{source: LibrarySource, helpers: {next: any, count: number, retries: number}}>(),
    promise: new CancelablePromise((resolve, reject) => {}),
    nextPromise: new CancelablePromise((resolve, reject) => {}),
    allURLs: new Map<string, Array<string>>(),
    restart: false,
    preload: false,
    videoVolume: this.props.scene.videoVolume,
  };

  _backForth: NodeJS.Timeout = null;
  _nextPromiseQueue: Array<{source: LibrarySource, helpers: {next: any, count: number, retries: number}}> = null;
  _nextAllURLs: Map<string, Array<string>> = null;

  render() {
    return (
      <div style={{opacity: this.props.opacity}}>

        {this.state.allURLs.size > 0 && this.state.restart == false && (
          <ImagePlayer
            config={this.props.config}
            scene={this.props.scene}
            currentAudio={this.props.currentAudio}
            isOverlay={this.props.isOverlay}
            isPlaying={this.props.isPlaying}
            gridView={this.props.gridView}
            historyOffset={this.props.historyOffset}
            setHistoryOffset={this.props.setHistoryOffset}
            setHistoryPaths={this.props.setHistoryPaths}
            maxInMemory={this.props.config.displaySettings.maxInMemory}
            maxLoadingAtOnce={this.props.config.displaySettings.maxLoadingAtOnce}
            advanceHack={this.props.advanceHack}
            deleteHack={this.props.deleteHack}
            strobeLayer={this.props.strobeLayer}
            hasStarted={this.props.hasStarted}
            allURLs={isEmpty(Array.from(this.state.allURLs.values())) ? null : this.state.allURLs}
            onLoaded={this.props.firstImageLoaded.bind(this)}
            setVideo={this.props.setVideo}
            cache={this.props.cache}
            playNextScene={this.props.playNextScene}
            setTimeToNextFrame={this.props.setTimeToNextFrame}/>)}
      </div>
    );
  }

  componentDidMount(restart = false) {
    // Create an instance of your worker
    workerInstance = worker();
    if (!restart) {
      workerInstance.reset();
      this._nextPromiseQueue = new Array<{ source: LibrarySource, helpers: {next: any, count: number, retries: number} }>();
      this._nextAllURLs = new Map<string, Array<string>>();
    }
    let n = 0;
    let newAllURLs = new Map<string, Array<string>>();
    if (this.state.allURLs.size > 0) {
      newAllURLs = this.state.allURLs;
    }

    let sceneSources = new Array<LibrarySource>();
    for (let source of this.props.scene.sources) {
      if (source.dirOfSources && getSourceType(source.url) == ST.local) {
        try {
          const directories = fs.readdirSync(source.url, {withFileTypes: true})
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
          for (let d of directories) {
            sceneSources.push(new LibrarySource({url: source.url + path.sep + d}));
          }
        } catch (e) {
          sceneSources.push(new LibrarySource({url: source.url}));
          console.error(e);
        }
      } else {
        sceneSources.push(source);
      }
    }

    const sources = this.props.scene.sourceOrderFunction == SOF.random ?
      randomizeList(JSON.parse(JSON.stringify(sceneSources))) :
      JSON.parse(JSON.stringify(sceneSources));

    let nextSources = new Array<LibrarySource>();
    if (this.props.nextScene) {
      let nextSceneSources = new Array<LibrarySource>();
      for (let source of this.props.nextScene.sources) {
        if (source.dirOfSources && getSourceType(source.url) == ST.local) {
          try {
            const directories = fs.readdirSync(source.url, {withFileTypes: true})
              .filter(dirent => dirent.isDirectory())
              .map(dirent => dirent.name);
            for (let d of directories) {
              nextSceneSources.push(new LibrarySource({url: source.url + path.sep + d}));
            }
          } catch (e) {
            nextSceneSources.push(new LibrarySource({url: source.url}));
            console.error(e);
          }
        } else {
          nextSceneSources.push(source);
        }
      }
      nextSources = this.props.nextScene.sourceOrderFunction == SOF.random ?
        randomizeList(JSON.parse(JSON.stringify(nextSceneSources))) :
        JSON.parse(JSON.stringify(nextSceneSources));
    }

    let sourceLoop = () => {
      if (this.state.promise.hasCanceled || sceneSources.length == 0) return;

      const d = sources[n];

      let message = d ? [d.url] : [""];
      if (this.props.isOverlay) {
        message = ["Loading '" + this.props.scene.name + "'...", message];
      }
      this.props.setProgress(sceneSources.length, n+1, message);

      if (!this.props.scene.playVideoClips && d.clips) {
        d.clips = [];
      }

      const receiveMessage = (message: any) => {
        let object = message.data;
        if (object?.type == "RPC") return;
        // TODO Remove this when done
        console.log(object);

        if (object?.error) {
          console.error("Error retrieving " + object?.source.url + (object?.helpers.next > 0 ? "Page " + object.helpers.next : ""));
          console.error(object.error);
        }

        if (object?.warning) {
          console.warn(object.warning);
        }

        if (object?.systemMessage) {
          this.props.systemMessage(object.systemMessage);
        }

        if (object?.source) {
          let newPromiseQueue = this.state.promiseQueue;
          n += 1;

          // Just add the new urls to the end of the list
          if (object?.data != null) {
            const source = object.source;
            if (source.blacklist && source.blacklist.length > 0) {
              object.data = object.data.filter((url: string) => !source.blacklist.includes(url));
            }
            if (this.props.scene.weightFunction == WF.sources) {
              newAllURLs.set(source.url, object.data);
            } else {
              for (let d of object.data) {
                newAllURLs.set(d, [source.url]);
              }
            }

            // If this is a remote URL, queue up the next promise
            if (object.helpers.next != null) {
              newPromiseQueue.push({source: source, helpers: object.helpers});
            }
            this.props.setCount(source.url, object.helpers.count, object.helpers.next == null);
          }

          this.setState({allURLs: newAllURLs, promiseQueue: newPromiseQueue});
          if (n < sceneSources.length) {
            setTimeout(sourceLoop, object?.timeout != null ? object.timeout : 1000);
          } else {
            console.log(newAllURLs);
            console.log("DONE");
            this.props.finishedLoading(isEmpty(Array.from(newAllURLs.values())));
            //promiseLoop();
            //if (this.props.nextScene && this.props.playNextScene) {
            //  n = 0;
            //  nextSourceLoop();
            // }
          }
        }
      }

      // Attach an event listener to receive calculations from your worker
      if (workerListener != null) {
        workerInstance.removeEventListener('message', workerListener);
      }
      workerListener = receiveMessage.bind(this);
      workerInstance.addEventListener('message', workerListener);
      scrapeFiles(this.props.config, d, this.props.scene.imageTypeFilter, {next: -1, count: 0, retries: 0})
    };

    let nextSourceLoop = () => {
      /*if (this.state.nextPromise.hasCanceled) return;

      if (!this.props.isPlaying) {
        setTimeout(nextSourceLoop, 500);
        return;
      }

      const d = nextSources[n];
      if (!this.props.scene.playVideoClips && d.clips) {
        d.clips = [];
      }
      const loadPromise = scrapeFiles(this.props.systemMessage, this.props.config, d, this.props.nextScene.imageTypeFilter, {next: -1, count: 0, retries: 0});
      this.setState({nextPromise: loadPromise});

      loadPromise
        .getPromise()
        .then((object) => {
          n += 1;

          // Just add the new urls to the end of the list
          if (object != null) {
            if (loadPromise.source.blacklist && loadPromise.source.blacklist.length > 0) {
              object.data = object.data.filter((url) => !loadPromise.source.blacklist.includes(url));
            }
            if (this.props.nextScene.weightFunction == WF.sources) {
              this._nextAllURLs.set(loadPromise.source.url, object.data);
            } else {
              for (let d of object.data) {
                this._nextAllURLs.set(d, [loadPromise.source.url]);
              }
            }

            // If this is a remote URL, queue up the next promise
            if (object.helpers.next != null) {
              this._nextPromiseQueue.push({source: d, helpers: object.helpers});
            }
            this.props.setCount(d.url, object.helpers.count, object.helpers.next == null);
          }

          if (n < nextSources.length) {
            setTimeout(nextSourceLoop, loadPromise.timeout);
          }
        });*/
    };

    let promiseLoop = () => {
      /*// Process until queue is empty or player has been stopped
      if (this.state.promiseQueue.length > 0 && !this.state.promise.hasCanceled) {
        if (!this.props.isPlaying) {
          setTimeout(promiseLoop, 500);
          return;
        }

        const promiseData = this.state.promiseQueue.shift();
        const promise = scrapeFiles(this.props.systemMessage, this.props.config, promiseData.source, this.props.scene.imageTypeFilter, promiseData.helpers);
        this.setState({promise: promise});

        promise
          .getPromise()
          .then((object) => {
            // If we are not at the end of a source
            if (object != null) {
              if (promise.source.blacklist && promise.source.blacklist.length > 0) {
                object.data = object.data.filter((url) => !promise.source.blacklist.includes(url));
              }

              // Update the correct index with our new images
              let newAllURLs = this.state.allURLs;
              if (this.props.scene.weightFunction == WF.sources) {
                let sourceURLs = newAllURLs.get(promise.source.url);
                if (!sourceURLs) sourceURLs = [];
                newAllURLs.set(promise.source.url, sourceURLs.concat(object.data.filter((u) => {
                  const fileName = getFileName(u);
                  const found = sourceURLs.map((u) => getFileName(u)).includes(fileName);
                  return !found;
                })));
              } else {
                for (let d of object.data.filter((u) => {
                  const fileName = getFileName(u);
                  const found = Array.from(newAllURLs.keys()).map((u) => getFileName(u)).includes(fileName);
                  return !found;
                })) {
                  newAllURLs.set(d, [promise.source.url]);
                }
              }

              // Add the next promise to the queue
              let newPromiseQueue = this.state.promiseQueue;
              if (object.helpers.next != null) {
                newPromiseQueue.push({source: promise.source, helpers: object.helpers});
              }
              this.props.setCount(promise.source.url, object.helpers.count, object.helpers.next == null);

              this.setState({allURLs: newAllURLs, promiseQueue: newPromiseQueue});
            }

            // If there is an overlay, double the timeout
            setTimeout(promiseLoop, promise.timeout);
          });
      }*/
    };

    if (this.state.preload) {
      this.setState({preload: false});
      promiseLoop();
      if (this.props.nextScene && isEmpty(Array.from(this._nextAllURLs.values()))) {
        n = 0;
        nextSourceLoop();
      }
    } else {
      sourceLoop();
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return props.scene !== this.props.scene ||
      (props.nextScene && this.props.nextScene &&
      props.nextScene.id !== this.props.nextScene.id) ||
      props.historyOffset !== this.props.historyOffset ||
      props.isPlaying !== this.props.isPlaying ||
      props.opacity !== this.props.opacity ||
      props.strobeLayer !== this.props.strobeLayer ||
      props.hasStarted !== this.props.hasStarted ||
      props.gridView !== this.props.gridView ||
      state.restart !== this.state.restart ||
      state.promise.source !== this.state.promise.source ||
      (state.allURLs.size > 0 && this.state.allURLs.size == 0);
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.scene.videoVolume !== this.state.videoVolume) {
      this.setState({videoVolume: this.props.scene.videoVolume});
    }
    if (props.scene.id !== this.props.scene.id) {
      state.nextPromise.cancel();
      state.promise.cancel();
      if (props.nextScene != null && this.props.scene.id === props.nextScene.id) { // If the next scene has been played
        if (this.props.nextScene && this.props.nextScene.id === props.scene.id) { // Just swap values if we're coming back to this scene again
          const newAllURLs = this._nextAllURLs;
          const newPromiseQueue = this._nextPromiseQueue;
          this._nextAllURLs = state.allURLs;
          this._nextPromiseQueue = state.promiseQueue;
          this.setState({
            promiseQueue: newPromiseQueue,
            promise: new CancelablePromise((resolve, reject) => {}),
            nextPromise: new CancelablePromise((resolve, reject) => {}),
            allURLs: newAllURLs,
            preload: true,
            restart: true
          });
        } else { // Replace values
          this.setState({
            promiseQueue: this._nextPromiseQueue,
            promise: new CancelablePromise((resolve, reject) => {}),
            nextPromise: new CancelablePromise((resolve, reject) => {}),
            allURLs: this._nextAllURLs,
            preload: true,
            restart: true
          });
          this._nextPromiseQueue = Array<{source: LibrarySource, helpers: {next: any, count: number, retries: number}}>();
          this._nextAllURLs = new Map<string, Array<string>>();
        }
      } else {
        this.setState({
          promiseQueue: Array<{ source: LibrarySource, helpers: {next: any, count: number, retries: number}}>(),
          promise: new CancelablePromise((resolve, reject) => {}),
          nextPromise: new CancelablePromise((resolve, reject) => {}),
          allURLs: new Map<string, Array<string>>(),
          preload: false,
          restart: true
        });
      }
    }
    if (this.state.restart == true) {
      this.setState({restart: false});
      this.componentDidMount(true);
    }
  }

  componentWillUnmount() {
    workerInstance.removeEventListener('message', workerListener);
    workerListener = null;
    workerInstance = null;
    this.state.nextPromise.cancel();
    this.state.promise.cancel();
    this._nextPromiseQueue = null;
    this._nextAllURLs = null;
    clearTimeout(this._backForth);
    this._backForth = null;
  }
}

(SourceScraper as any).displayName="SourceScraper";