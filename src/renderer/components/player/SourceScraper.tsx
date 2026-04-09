import * as React from "react";
import uuidv4 from "uuid/v4";

import { Dialog, DialogContent } from "@mui/material";

import { flatten, randomizeList } from "../../data/utils";
import { getSourceType } from "../../../common/utils";
import { SOF, ST } from "../../../common/const";
import Config from "../../../common/Config";
import LibrarySource from "../../../common/LibrarySource";
import Scene from "../../../common/Scene";
import Audio from "../../../common/Audio";
import ChildCallbackHack from "./ChildCallbackHack";
import ImagePlayer from "./ImagePlayer";
import { fs_readDirectoryNames } from "../../dummy/fs";
import { path_join } from "../../dummy/path";

// Returns true if array is empty, or only contains empty arrays
function isEmpty(allURLs: any[]): boolean {
  return Array.isArray(allURLs) && allURLs.every(isEmpty);
}

interface SourceScraperProps {
  config: Config;
  scene: Scene;
  currentAudio: Audio;
  opacity: number;
  isPlaying: boolean;
  gridView: boolean;
  hasStarted: boolean;
  historyOffset: number;
  advanceHack: ChildCallbackHack;
  deleteHack?: ChildCallbackHack;
  gridCoordinates?: Array<number>;
  isOverlay?: boolean;
  nextScene?: Scene;
  strobeLayer?: string;
  setHistoryOffset(historyOffset: number): void;
  setHistoryPaths(historyPaths: Array<any>): void;
  firstImageLoaded(): void;
  finishedLoading(empty: boolean): void;
  setProgress(total: number, current: number, message: string[]): void;
  setVideo(video: HTMLVideoElement): void;
  setCount(sourceURL: string, count: number, countComplete: boolean): void;
  cache(i: HTMLImageElement | HTMLVideoElement): void;
  systemMessage(message: string): void;
  onEndScene?(): void;
  setTimeToNextFrame?(timeToNextFrame: number): void;
  setSceneCopy?(children: React.ReactNode): void;
  playNextScene?(): void;
}

export default class SourceScraper extends React.Component<SourceScraperProps> {
  readonly props: SourceScraperProps;

  readonly state: {
    allURLs: Map<string, Array<string>>;
    allPosts: Map<string, string>;
    restart: boolean;
    preload: boolean;
    videoVolume: number;
    captcha: any;
    load: boolean;
    singleImage: number;
  };

  constructor(props: SourceScraperProps) {
    super(props);

    this.state = {
      allURLs: new Map<string, Array<string>>(),
      allPosts: new Map<string, string>(),
      restart: false,
      preload: false,
      videoVolume: props.scene.videoVolume,
      captcha: null as any,
      load: false,
      singleImage: null as number,
    };
  }

  _isMounted = false;
  _backForth: number = null;
  _promiseQueue: Array<{
    source: LibrarySource;
    helpers: { next: any; count: number; retries: number; uuid: string };
  }> = null;
  _nextPromiseQueue: Array<{
    source: LibrarySource;
    helpers: { next: any; count: number; retries: number; uuid: string };
  }> = null;
  _nextAllURLs: Map<string, Array<string>> = null;
  _nextAllPosts: Map<string, string> = null;

  render() {
    let style: any = { opacity: this.props.opacity };
    if (this.props.gridView) {
      style = {
        ...style,
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: this.props.isOverlay ? 4 : "auto",
      };
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
            advanceHack={this.props.advanceHack}
            deleteHack={this.props.deleteHack}
            strobeLayer={this.props.strobeLayer}
            hasStarted={this.props.hasStarted}
            singleImage={this.state.singleImage}
            allURLs={
              isEmpty(Array.from(this.state.allURLs.values()))
                ? null
                : this.state.allURLs
            }
            allPosts={this.state.allPosts}
            onLoaded={this.props.firstImageLoaded.bind(this)}
            setVideo={this.props.setVideo}
            cache={this.props.cache}
            onEndScene={this.props.onEndScene}
            playNextScene={this.props.playNextScene}
            gridCoordinates={this.props.gridCoordinates}
            setSceneCopy={this.props.setSceneCopy}
            setTimeToNextFrame={this.props.setTimeToNextFrame}
          />
        )}
        {this.state.captcha != null && (
          <Dialog open={true} onClose={this.onCloseDialog.bind(this)}>
            <DialogContent style={{ height: 600 }}>
              <iframe
                sandbox="allow-forms"
                src={this.state.captcha.captcha}
                height={"100%"}
                onLoad={this.onIFrameLoad.bind(this)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  onIFrameLoad() {
    if (!this.state.load) {
      this.setState({ load: true });
    } else {
      this.onCloseDialog();
    }
  }

  onCloseDialog() {
    this.setState({ captcha: null, load: false });
  }

  componentDidMount(restart = false) {
    this._isMounted = true;
    // Create an instance of your worker
    const uuid = uuidv4();
    if (!restart) {
      this._promiseQueue = new Array<{
        source: LibrarySource;
        helpers: { next: any; count: number; retries: number; uuid: string };
      }>();
      this._nextPromiseQueue = new Array<{
        source: LibrarySource;
        helpers: { next: any; count: number; retries: number; uuid: string };
      }>();
      this._nextAllURLs = new Map<string, Array<string>>();
      this._nextAllPosts = new Map<string, string>();
    }
    let n = 0;
    let newAllURLs = new Map<string, Array<string>>();
    if (this.state.allURLs.size > 0) {
      newAllURLs = this.state.allURLs;
    }
    let newAllPosts = new Map<string, string>();
    if (this.state.allPosts.size > 0) {
      newAllPosts = this.state.allPosts;
    }

    let sceneSources = new Array<LibrarySource>();
    for (let source of this.props.scene.sources) {
      if (source.dirOfSources && getSourceType(source.url) == ST.local) {
        try {
          const directories = fs_readDirectoryNames(source.url); // FIXME
          for (let d of directories) {
            sceneSources.push(
              new LibrarySource({ url: path_join(source.url, d) }), // FIXME
            );
          }
        } catch (e) {
          sceneSources.push(new LibrarySource({ url: source.url }));
          console.error(e);
        }
      } else {
        sceneSources.push(source);
      }
    }

    const sources =
      this.props.scene.sourceOrderFunction == SOF.random
        ? randomizeList(JSON.parse(JSON.stringify(sceneSources)))
        : JSON.parse(JSON.stringify(sceneSources));

    let nextSources = new Array<LibrarySource>();
    if (this.props.nextScene) {
      let nextSceneSources = new Array<LibrarySource>();
      for (let source of this.props.nextScene.sources) {
        if (source.dirOfSources && getSourceType(source.url) == ST.local) {
          try {
            const directories = fs_readDirectoryNames(source.url); // FIXME
            for (let d of directories) {
              nextSceneSources.push(
                new LibrarySource({ url: path_join(source.url, d) }), // FIXME
              );
            }
          } catch (e) {
            nextSceneSources.push(new LibrarySource({ url: source.url }));
            console.error(e);
          }
        } else {
          nextSceneSources.push(source);
        }
      }
      nextSources =
        this.props.nextScene.sourceOrderFunction == SOF.random
          ? randomizeList(JSON.parse(JSON.stringify(nextSceneSources)))
          : JSON.parse(JSON.stringify(nextSceneSources));
    }

    let sourceLoop = () => {
      if (!this._isMounted || sceneSources.length == 0 || n >= sources.length)
        return;

      const d = sources[n];

      let message = d ? [d.url] : [""];
      if (this.props.isOverlay) {
        message = ["Loading '" + this.props.scene.name + "'...", message];
      }
      this.props.setProgress(sceneSources.length, n + 1, message);

      if (!this.props.scene.playVideoClips && d.clips) {
        d.clips = [];
      }

      window.ipc.onScrapeFilesResponse((object: any) => {
        if (
          object?.type == "RPC" ||
          (object?.helpers != null && object.helpers.uuid != uuid)
        ) {
          return;
        }

        if (object?.captcha != null && this.state.captcha == null) {
          this.setState({
            captcha: {
              captcha: object.captcha,
              source: object?.source,
              helpers: object?.helpers,
            },
          });
        }

        if (object?.error != null) {
          console.error(
            "Error retrieving " +
              object?.source?.url +
              (object?.helpers?.next > 0 ? " Page " + object.helpers.next : ""),
          );
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
            this.setState({ allURLs: newAllURLs });
            newAllPosts = object.allPosts;
            this.setState({ allPosts: newAllPosts });

            // If this is a remote URL, queue up the next promise
            if (object.helpers.next != null) {
              this._promiseQueue.push({
                source: source,
                helpers: object.helpers,
              });
            }
            this.props.setCount(
              source.url,
              object.helpers.count,
              object.helpers.next == null,
            );
          }

          if (n < sceneSources.length) {
            const timeout = object?.timeout != null ? object.timeout : 1000;
            window.setTimeout(sourceLoop, timeout);
          } else {
            const values = flatten(Array.from(newAllURLs.values()));
            if (this._promiseQueue.length == 0) {
              this.setState({ singleImage: values.length == 1 });
            }
            this.props.finishedLoading(isEmpty(values));
            promiseLoop();
            if (this.props.nextScene && this.props.playNextScene) {
              n = 0;
              nextSourceLoop();
            }
          }
        }
      });

      window.ipc.scrapeFiles(
        this.state.allURLs,
        this.state.allPosts,
        this.props.config,
        d,
        this.props.scene.imageTypeFilter,
        this.props.scene.weightFunction,
        { next: -1, count: 0, retries: 0, uuid: uuid },
      );
    };

    let nextSourceLoop = () => {
      if (!this._isMounted) return;

      const d = nextSources[n];
      if (!this.props.nextScene.playVideoClips && d.clips) {
        d.clips = [];
      }

      window.ipc.onScrapeFilesResponse((object: any) => {
        if (
          object?.type == "RPC" ||
          (object?.helpers != null && object.helpers.uuid != uuid)
        )
          return;

        if (object?.error != null) {
          console.error(
            "Error retrieving " +
              object?.source?.url +
              (object?.helpers?.next > 0 ? " Page " + object.helpers.next : ""),
          );
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
            this._nextAllPosts = object.allPosts;

            // If this is a remote URL, queue up the next promise
            if (object.helpers.next != null) {
              this._nextPromiseQueue.push({
                source: source,
                helpers: object.helpers,
              });
            }
            this.props.setCount(
              source.url,
              object.helpers.count,
              object.helpers.next == null,
            );
          }

          if (n < nextSources.length) {
            window.setTimeout(
              nextSourceLoop,
              object.timeout != null ? object.timeout : 1000,
            );
          }
        }
      });

      window.ipc.scrapeFiles(
        this._nextAllURLs,
        this._nextAllPosts,
        this.props.config,
        d,
        this.props.nextScene.imageTypeFilter,
        this.props.nextScene.weightFunction,
        { next: -1, count: 0, retries: 0, uuid: uuid },
      );
    };

    let promiseLoop = () => {
      if (this.state.captcha != null && this._promiseQueue.length == 0) {
        window.setTimeout(promiseLoop, 2000);
      }
      // Process until queue is empty or player has been stopped
      if (!this._isMounted || this._promiseQueue.length == 0) {
        return;
      }

      window.ipc.onScrapeFilesResponse((object: any) => {
        if (
          object?.type == "RPC" ||
          (object?.helpers != null && object.helpers.uuid != uuid)
        )
          return;

        if (object?.captcha != null && this.state.captcha == null) {
          this.setState({
            captcha: {
              captcha: object.captcha,
              source: object?.source,
              helpers: object?.helpers,
            },
          });
        }

        if (object?.error != null) {
          console.error(
            "Error retrieving " +
              object?.source?.url +
              (object?.helpers?.next > 0 ? " Page " + object.helpers.next : ""),
          );
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
            this.setState({ allURLs: newAllURLs });
            let newAllPosts = object.allPosts;
            this.setState({ allPosts: newAllPosts });

            // Add the next promise to the queue
            if (object.helpers.next != null) {
              this._promiseQueue.push({
                source: source,
                helpers: object.helpers,
              });
            }
            this.props.setCount(
              source.url,
              object.helpers.count,
              object.helpers.next == null,
            );
          }

          window.setTimeout(
            promiseLoop,
            object?.timeout != null ? object.timeout : 1000,
          );
        }
      });

      const promiseData = this._promiseQueue.shift();
      window.ipc.scrapeFiles(
        this.state.allURLs,
        this.state.allPosts,
        this.props.config,
        promiseData.source,
        this.props.scene.imageTypeFilter,
        this.props.scene.weightFunction,
        promiseData.helpers,
      );
    };

    if (this.state.preload) {
      this.setState({ preload: false });
      promiseLoop();
      if (
        this.props.nextScene &&
        isEmpty(Array.from(this._nextAllURLs.values()))
      ) {
        n = 0;
        nextSourceLoop();
      }
    } else {
      sourceLoop();
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return (
      props.scene !== this.props.scene ||
      (props.nextScene &&
        this.props.nextScene &&
        props.nextScene.id !== this.props.nextScene.id) ||
      props.historyOffset !== this.props.historyOffset ||
      props.isPlaying !== this.props.isPlaying ||
      props.opacity !== this.props.opacity ||
      props.strobeLayer !== this.props.strobeLayer ||
      props.hasStarted !== this.props.hasStarted ||
      props.gridView !== this.props.gridView ||
      state.captcha !== this.state.captcha ||
      state.restart !== this.state.restart ||
      state.allURLs != this.state.allURLs ||
      state.allPosts != this.state.allPosts
    );
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.scene.videoVolume !== this.state.videoVolume) {
      this.setState({ videoVolume: this.props.scene.videoVolume });
    }
    if (props.scene.id !== this.props.scene.id) {
      if (
        props.nextScene != null &&
        this.props.scene.id === props.nextScene.id
      ) {
        // If the next scene has been played
        if (
          this.props.nextScene &&
          this.props.nextScene.id === props.scene.id
        ) {
          // Just swap values if we're coming back to this scene again
          const newAllURLs = this._nextAllURLs;
          const newAllPosts = this._nextAllPosts;
          const temp = this._nextPromiseQueue;
          this._nextPromiseQueue = this._promiseQueue;
          this._promiseQueue = temp;
          this._nextAllURLs = state.allURLs;
          this._nextAllPosts = state.allPosts;
          this.setState({
            allURLs: newAllURLs,
            allPosts: newAllPosts,
            preload: true,
            restart: true,
            singleImage: null,
          });
        } else {
          // Replace values
          this._promiseQueue = this._nextPromiseQueue;
          this.setState({
            allURLs: this._nextAllURLs,
            allPosts: this._nextAllPosts,
            preload: true,
            restart: true,
            singleImage: null,
          });
          this._nextPromiseQueue = Array<{
            source: LibrarySource;
            helpers: {
              next: any;
              count: number;
              retries: number;
              uuid: string;
            };
          }>();
          this._nextAllURLs = new Map<string, Array<string>>();
          this._nextAllPosts = new Map<string, string>();
        }
      } else {
        this._promiseQueue = Array<{
          source: LibrarySource;
          helpers: { next: any; count: number; retries: number; uuid: string };
        }>();
        this.setState({
          allURLs: new Map<string, Array<string>>(),
          allPosts: new Map<string, string>(),
          preload: false,
          restart: true,
          singleImage: null,
        });
      }
    }
    if (this.state.restart == true) {
      this.setState({ restart: false });
      this.componentDidMount(true);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._promiseQueue = null;
    this._nextPromiseQueue = null;
    this._nextAllURLs = null;
    this._nextAllPosts = null;
    window.clearTimeout(this._backForth);
    this._backForth = null;
  }
}

(SourceScraper as any).displayName = "SourceScraper";
