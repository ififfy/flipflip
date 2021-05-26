import * as React from 'react';
import * as fs from "fs";
import * as path from "path";
import worker from 'workerize-loader!./Scrapers';
import recursiveReaddir from "recursive-readdir";
import fileURL from "file-url";
import wretch from "wretch";
import uuidv4 from "uuid/v4";

import {getCachePath, randomizeList} from "../../data/utils";
import {filterPathsToJustPlayable, getFileName, getSourceType, isVideo, processAllURLs} from "./Scrapers";
import {IF, SOF, ST} from '../../data/const';
import Config from "../../data/Config";
import LibrarySource from "../../data/LibrarySource";
import Scene from '../../data/Scene';
import Audio from "../../data/Audio";
import ChildCallbackHack from './ChildCallbackHack';
import ImagePlayer from './ImagePlayer';
import {Dialog, DialogContent} from "@material-ui/core";

let workerInstance: any = null;
let workerListener: any = null;
let nextWorkerInstance: any = null;
let nextWorkerListener: any = null;

// Returns true if array is empty, or only contains empty arrays
function isEmpty(allURLs: any[]): boolean {
  return Array.isArray(allURLs) && allURLs.every(isEmpty);
}

// Determine what kind of source we have based on the URL and return associated Promise
function scrapeFiles(worker: any, pm: Function, allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}) {
  const sourceType = getSourceType(source.url);
  if (sourceType == ST.local) { // Local files
    loadLocalDirectory(pm, allURLs, config, source, filter, weight, helpers, null);
  } else if (sourceType == ST.list) { // Image List
    helpers.next = null;
    worker.loadRemoteImageURLList(allURLs, config, source, filter, weight, helpers);
  } else if (sourceType == ST.video) {
    const cachePath = getCachePath(source.url, config) + getFileName(source.url);
    if (config.caching.enabled && fs.existsSync(cachePath)) {
      loadVideo(pm, allURLs, config, source, filter, weight, helpers, cachePath);
    } else {
      loadVideo(pm, allURLs, config, source, filter, weight, helpers, null);
    }
  } else if (sourceType == ST.playlist) {
    const cachePath = getCachePath(source.url, config) + getFileName(source.url);
    if (config.caching.enabled && fs.existsSync(cachePath)) {
      loadPlaylist(pm, allURLs, config, source, filter, weight, helpers, cachePath);
    } else {
      loadPlaylist(pm, allURLs, config, source, filter, weight, helpers, null);
    }
  } else { // Paging sources
    let workerFunction;
    if (sourceType == ST.tumblr) {
      workerFunction = worker.loadTumblr;
    } else if (sourceType == ST.reddit) {
      workerFunction = worker.loadReddit;
    } else if (sourceType == ST.imagefap) {
      workerFunction = worker.loadImageFap;
    } else if (sourceType == ST.sexcom) {
      workerFunction = worker.loadSexCom;
    } else if (sourceType == ST.imgur) {
      workerFunction = worker.loadImgur;
    } else if (sourceType == ST.twitter) {
      workerFunction = worker.loadTwitter;
    } else if (sourceType == ST.deviantart) {
      workerFunction = worker.loadDeviantArt;
    } else if (sourceType == ST.instagram) {
      workerFunction = worker.loadInstagram;
    } else if (sourceType == ST.danbooru) {
      workerFunction = worker.loadDanbooru;
    } else if (sourceType == ST.e621) {
      workerFunction = worker.loadE621;
    } else if (sourceType == ST.gelbooru1) {
      workerFunction = worker.loadGelbooru1;
    } else if (sourceType == ST.gelbooru2) {
      workerFunction = worker.loadGelbooru2;
    } else if (sourceType == ST.ehentai) {
      workerFunction = worker.loadEHentai;
    } else if (sourceType == ST.bdsmlr) {
      workerFunction = worker.loadBDSMlr;
    } else if (sourceType == ST.hydrus) {
      workerFunction = worker.loadHydrus;
    }
    if (helpers.next == -1) {
      helpers.next = 0;
      const cachePath = getCachePath(source.url, config);
      if (config.caching.enabled && fs.existsSync(cachePath) && fs.readdirSync(cachePath).length > 0) {
        // If the cache directory exists, use it
        loadLocalDirectory(pm, allURLs, config, source, filter, weight, helpers, cachePath);
      } else {
        workerFunction(allURLs, config, source, filter, weight, helpers);
      }
    } else {
      workerFunction(allURLs, config, source, filter, weight, helpers);
    }
  }
}

const loadLocalDirectory = (pm: Function, allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, cachePath: string) => {
  const blacklist = ['*.css', '*.html', 'avatar.png', '*.txt'];
  const url = cachePath ? cachePath : source.url;

  recursiveReaddir(url, blacklist, (err: any, rawFiles: Array<string>) => {
    if (err) {
      pm({data: {
        error: err.message,
        helpers: helpers,
        source: source,
        timeout: 0,
      }});
    } else {
      let sources = filterPathsToJustPlayable(filter, rawFiles, true).map((p) => fileURL(p)).sort((a, b) => {
        let aFile: any = getFileName(a, false);
        if (parseInt(aFile)) {
          aFile = parseInt(aFile);
        }
        let bFile: any = getFileName(b, false);
        if (parseInt(aFile)) {
          aFile = parseInt(aFile);
        }
        if (aFile > bFile) {
          return 1;
        } else if (aFile < bFile) {
          return -1;
        } else {
          return 0;
        }
      });

      if (source.blacklist && source.blacklist.length > 0) {
        sources = sources.filter((url: string) => !source.blacklist.includes(url));
      }
      allURLs = processAllURLs(sources, allURLs, source, weight, helpers);
      // If this is a local source (not a cacheDir call)
      if (helpers.next == -1) {
        helpers.count = filterPathsToJustPlayable(IF.any, rawFiles, true).length;
        helpers.next = null;
      }

      pm({data: {
        data: sources,
        allURLs: allURLs,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: 0,
      }});
    }
  });
}

export const loadVideo = (pm: Function, allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, cachePath: string) => {
  const url = cachePath ? cachePath : source.url;
  const missingVideo = () => {
    pm({data: {
      error: "Could not find " + source.url,
      data: [],
      allURLs: allURLs,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: 0,
    }});
  }
  const ifExists = (url: string) => {
    if (!url.startsWith("http")) {
      url = fileURL(url);
    }
    helpers.count = 1;

    let paths;
    if (source.clips && source.clips.length > 0) {
      const clipPaths = Array<string>();
      for (let clip of source.clips) {
        if (!source.disabledClips || !source.disabledClips.includes(clip.id)) {
          let clipPath = url + ":::" + clip.id + ":" + (clip.volume != null ? clip.volume : "-") + ":::" + clip.start + ":" + clip.end;
          if (source.subtitleFile != null && source.subtitleFile.length > 0) {
            clipPath = clipPath + "|||" + source.subtitleFile;
          }
          clipPaths.push(clipPath);
        }
      }
      paths = clipPaths;
    } else {
      if (source.subtitleFile != null && source.subtitleFile.length > 0) {
        url = url + "|||" + source.subtitleFile;
      }
      paths = [url];
    }

    if (source.blacklist && source.blacklist.length > 0) {
      paths = paths.filter((url: string) => !source.blacklist.includes(url));
    }
    allURLs = processAllURLs(paths, allURLs, source, weight, helpers);
    helpers.next = null;

    pm({data: {
      data: paths,
      allURLs: allURLs,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: 0,
    }});
  }

  if (!isVideo(url, false)) {
    missingVideo();
  }
  if (url.startsWith("http")) {
    wretch(url)
      .get()
      .notFound((e) => {
        missingVideo();
      })
      .res((r) => {
        ifExists(url);
      })
  } else {
    const exists = fs.existsSync(url);
    if (exists) {
      ifExists(url);
    } else {
      missingVideo();
    }
  }
}

export const loadPlaylist = (pm: Function, allURLs: Map<string, Array<string>>, config: Config, source: LibrarySource, filter: string, weight: string, helpers: {next: any, count: number, retries: number, uuid: string}, cachePath: string) => {
  const url = cachePath ? cachePath : source.url;
  wretch(url)
    .get()
    .text(data => {
      let urls = [];
      if (url.endsWith(".asx")) {
        const refs = new DOMParser().parseFromString(data, "text/xml").getElementsByTagName("Ref");
        for (let r = 0; r < refs.length; r++) {
          const l = refs[r];
          urls.push(l.getAttribute("href"));
        }
      } else if (url.endsWith(".m3u8")) {
        for (let l of data.split("\n")) {
          if (l.length > 0 && !l.startsWith("#")) {
            urls.push(l.trim());
          }
        }
      } else if (url.endsWith(".pls")) {
        for (let l of data.split("\n")) {
          if (l.startsWith("File")) {
            urls.push(l.split("=")[1].trim());
          }
        }
      } else if (url.endsWith(".xspf")) {
        const locations = new DOMParser().parseFromString(data, "text/xml").getElementsByTagName("location");
        for (let r = 0; r < locations.length; r++) {
          const l = locations[r];
          urls.push(l.textContent);
        }
      }

      if (urls.length > 0) {
        helpers.count = urls.length;
      }

      urls = filterPathsToJustPlayable(filter, urls, true);

      if (source.blacklist && source.blacklist.length > 0) {
        urls = urls.filter((url: string) => !source.blacklist.includes(url));
      }
      allURLs = processAllURLs(urls, allURLs, source, weight, helpers);
      helpers.next = null;

      pm({data: {
        data: urls,
        allURLs: allURLs,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: 0,
      }});
    })
    .catch((e) => {
      pm({data: {
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: 0,
      }});
    });
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

  readonly state = {
    allURLs: new Map<string, Array<string>>(),
    restart: false,
    preload: false,
    videoVolume: this.props.scene.videoVolume,
    captcha: null as any,
    load: false,
  };

  _isMounted = false;
  _backForth: NodeJS.Timeout = null;
  _promiseQueue: Array<{source: LibrarySource, helpers: {next: any, count: number, retries: number, uuid: string}}> = null;
  _nextPromiseQueue: Array<{source: LibrarySource, helpers: {next: any, count: number, retries: number, uuid: string}}> = null;
  _nextAllURLs: Map<string, Array<string>> = null;

  render() {
    let style: any = {opacity: this.props.opacity};
    if (this.props.gridView) {
      style = {
        ...style,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: this.props.isOverlay ? 4 : 'auto',
      }
    }
    return (
      <div style={style}>

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
        {this.state.captcha != null && (
          <Dialog
            open={true}
            onClose={this.onCloseDialog.bind(this)}>
            <DialogContent style={{height: 600}}>
              <iframe sandbox="allow-forms" src={this.state.captcha.captcha} height={"100%"} onLoad={this.onIFrameLoad.bind(this)}/>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  onIFrameLoad() {
    if (!this.state.load) {
      this.setState({load: true});
    } else {
      this.onCloseDialog();
    }
  }

  onCloseDialog() {
    this.setState({captcha: null, load: false});
  }

  componentDidMount(restart = false) {
    this._isMounted = true;
    // Create an instance of your worker
    const uuid = uuidv4();
    workerInstance = worker();
    if (!restart) {
      workerInstance.reset();
      this._promiseQueue = new Array<{ source: LibrarySource, helpers: {next: any, count: number, retries: number, uuid: string} }>();
      this._nextPromiseQueue = new Array<{ source: LibrarySource, helpers: {next: any, count: number, retries: number, uuid: string} }>();
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
      if (!this._isMounted || sceneSources.length == 0 || n >= sources.length) return;

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
        if (object?.type == "RPC" || (object?.helper != null && object.helpers.uuid != uuid)) return;

        if (object?.captcha != null && this.state.captcha == null) {
          this.setState({captcha: {captcha: object.captcha, source: object?.source, helpers: object?.helpers}});
        }

        if (object?.error != null) {
          console.error("Error retrieving " + object?.source?.url + (object?.helpers?.next > 0 ? "Page " + object.helpers.next : ""));
          console.error(object.error);
        }

        if (object?.warning != null) {
          console.warn(object.warning);
        }

        if (object?.systemMessage != null) {
          this.props.systemMessage(object.systemMessage);
        }

        if (object?.source) {
          n += 1;

          // Just add the new urls to the end of the list
          if (object?.data && object?.allURLs) {
            const source = object.source;
            newAllURLs = object.allURLs;
            this.setState({allURLs: newAllURLs});

            // If this is a remote URL, queue up the next promise
            if (object.helpers.next != null) {
              this._promiseQueue.push({source: source, helpers: object.helpers});
            }
            this.props.setCount(source.url, object.helpers.count, object.helpers.next == null);
          }

          if (n < sceneSources.length) {
            const timeout = object?.timeout != null ? object.timeout : 1000;
            if (timeout == 0) {
              setImmediate(sourceLoop);
            } else {
              setTimeout(sourceLoop, timeout);
            }
          } else {
            this.props.finishedLoading(isEmpty(Array.from(newAllURLs.values())));
            promiseLoop();
            if (this.props.nextScene && this.props.playNextScene) {
              n = 0;
              nextWorkerInstance = worker();
              nextSourceLoop();
            }
          }
        }
      }

      // Attach an event listener to receive calculations from your worker
      if (workerListener != null) {
        workerInstance?.removeEventListener('message', workerListener);
      }
      workerListener = receiveMessage.bind(this);
      workerInstance.addEventListener('message', workerListener);
      scrapeFiles(workerInstance, workerListener, this.state.allURLs, this.props.config, d, this.props.scene.imageTypeFilter, this.props.scene.weightFunction, {next: -1, count: 0, retries: 0, uuid: uuid})
    };

    let nextSourceLoop = () => {
      if (!this._isMounted) return;

      if (!this.props.isPlaying) {
        setTimeout(nextSourceLoop, 500);
        return;
      }

      const d = nextSources[n];
      if (!this.props.nextScene.playVideoClips && d.clips) {
        d.clips = [];
      }

      const receiveMessage = (message: any) => {
        let object = message.data;
        if (object?.type == "RPC" || (object?.helper != null && object.helpers.uuid != uuid)) return;

        if (object?.error != null) {
          console.error("Error retrieving " + object?.source?.url + (object?.helpers?.next > 0 ? "Page " + object.helpers.next : ""));
          console.error(object.error);
        }

        if (object?.warning != null) {
          console.warn(object.warning);
        }

        if (object?.systemMessage != null) {
          this.props.systemMessage(object.systemMessage);
        }

        if (object?.source) {
          n += 1;

          // Just add the new urls to the end of the list
          if (object?.data != null) {
            const source = object.source;
            this._nextAllURLs = object.allURLs;

            // If this is a remote URL, queue up the next promise
            if (object.helpers.next != null) {
              this._nextPromiseQueue.push({source: source, helpers: object.helpers});
            }
            this.props.setCount(source.url, object.helpers.count, object.helpers.next == null);
          }

          if (n < nextSources.length) {
            setTimeout(nextSourceLoop, object.timeout != null ? object.timeout : 1000);
          }
        }
      }

      // Attach an event listener to receive calculations from your worker
      if (nextWorkerListener != null) {
        nextWorkerInstance?.removeEventListener('message', nextWorkerListener);
      }
      nextWorkerListener = receiveMessage.bind(this);
      nextWorkerInstance.addEventListener('message', nextWorkerListener);
      scrapeFiles(nextWorkerInstance, nextWorkerListener, this._nextAllURLs, this.props.config, d, this.props.nextScene.imageTypeFilter, this.props.nextScene.weightFunction, {next: -1, count: 0, retries: 0, uuid: uuid});
    };

    let promiseLoop = () => {
      if (this.state.captcha != null && this._promiseQueue.length == 0) {
        setTimeout(promiseLoop, 2000);
      }
      // Process until queue is empty or player has been stopped
      if (!this._isMounted || this._promiseQueue.length == 0)  {
        if (workerListener != null) {
          workerInstance?.removeEventListener('message', workerListener);
        }
        return;
      }

      if (!this.props.isPlaying) {
        setTimeout(promiseLoop, 500);
        return;
      }

      const receiveMessage = (message: any) => {
        let object = message.data;
        if (object?.type == "RPC" || (object?.helper != null && object.helpers.uuid != uuid)) return;

        if (object?.captcha != null && this.state.captcha == null) {
          this.setState({captcha: {captcha: object.captcha, source: object?.source, helpers: object?.helpers}});
        }

        if (object?.error != null) {
          console.error("Error retrieving " + object?.source?.url + (object?.helpers?.next > 0 ? "Page " + object.helpers.next : ""));
          console.error(object.error);
        }

        if (object?.warning != null) {
          console.warn(object.warning);
        }

        if (object?.systemMessage != null) {
          this.props.systemMessage(object.systemMessage);
        }

        // If we are not at the end of a source
        if (object?.source) {
          if (object?.data) {
            const source = object.source;
            let newAllURLs = object.allURLs;
            this.setState({allURLs: newAllURLs});

            // Add the next promise to the queue
            if (object.helpers.next != null) {
              this._promiseQueue.push({source: source, helpers: object.helpers});
            }
            this.props.setCount(source.url, object.helpers.count, object.helpers.next == null);
          }

          setTimeout(promiseLoop, object?.timeout != null ? object.timeout : 1000);
        }
      }

      // Attach an event listener to receive calculations from your worker
      if (workerListener != null) {
        workerInstance?.removeEventListener('message', workerListener);
      }
      workerListener = receiveMessage.bind(this);
      workerInstance.addEventListener('message', workerListener);
      const promiseData = this._promiseQueue.shift();
      scrapeFiles(workerInstance, workerListener, this.state.allURLs, this.props.config, promiseData.source, this.props.scene.imageTypeFilter, this.props.scene.weightFunction, promiseData.helpers);
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
      state.captcha !== this.state.captcha ||
      state.restart !== this.state.restart ||
      state.allURLs != this.state.allURLs;
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.scene.videoVolume !== this.state.videoVolume) {
      this.setState({videoVolume: this.props.scene.videoVolume});
    }
    if (props.scene.id !== this.props.scene.id) {
      workerInstance?.removeEventListener('message', workerListener);
      nextWorkerInstance?.removeEventListener('message', nextWorkerListener);
      workerListener = null;
      nextWorkerListener = null;
      if (props.nextScene != null && this.props.scene.id === props.nextScene.id) { // If the next scene has been played
        if (this.props.nextScene && this.props.nextScene.id === props.scene.id) { // Just swap values if we're coming back to this scene again
          const newAllURLs = this._nextAllURLs;
          const temp = this._nextPromiseQueue;
          this._nextPromiseQueue = this._promiseQueue;
          this._promiseQueue = temp;
          this._nextAllURLs = state.allURLs;
          this.setState({
            allURLs: newAllURLs,
            preload: true,
            restart: true
          });
        } else { // Replace values
          this._promiseQueue = this._nextPromiseQueue;
          this.setState({
            allURLs: this._nextAllURLs,
            preload: true,
            restart: true
          });
          this._nextPromiseQueue = Array<{source: LibrarySource, helpers: {next: any, count: number, retries: number, uuid: string}}>();
          this._nextAllURLs = new Map<string, Array<string>>();
        }
      } else {
        this._promiseQueue = Array<{ source: LibrarySource, helpers: {next: any, count: number, retries: number, uuid: string}}>();
        this.setState({
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
    this._isMounted = false;
    workerInstance?.removeEventListener('message', workerListener);
    nextWorkerInstance?.removeEventListener('message', nextWorkerListener);
    workerListener = null;
    nextWorkerListener = null;
    workerInstance = null;
    nextWorkerInstance = null;
    this._promiseQueue = null;
    this._nextPromiseQueue = null;
    this._nextAllURLs = null;
    clearTimeout(this._backForth);
    this._backForth = null;
  }
}

(SourceScraper as any).displayName="SourceScraper";