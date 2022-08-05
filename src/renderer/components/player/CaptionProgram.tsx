import * as React from "react";
import wretch from "wretch";
import * as fs from "fs";
import Sound from "react-sound";

import captionProgramDefaults, {
  CancelablePromise,
  getMsTimestampValue,
  getRandomListItem,
  getTimeout,
  getTimingFromString,
  htmlEntities
} from "../../data/utils";
import {RP, TF} from "../../data/const";
import Tag from "../../data/Tag";
import ChildCallbackHack from "./ChildCallbackHack";
import Audio from "../../data/Audio";
import CaptionScript from "../../data/CaptionScript";
import {CircularProgress} from "@mui/material";

const splitFirstWord = function (s: string) {
  const firstSpaceIndex = s.indexOf(" ");
  if (firstSpaceIndex > 0 && firstSpaceIndex < s.length - 1) {
    const first = s.substring(0, firstSpaceIndex);
    const rest = s.substring(firstSpaceIndex + 1);
    return [first, rest];
  } else {
    return [s, null];
  }
};

const getFirstWord = function (s: string) {
  return splitFirstWord(s)[0];
};

const getRest = function (s: string) {
  return splitFirstWord(s)[1];
};

export default class CaptionProgram extends React.Component {
  readonly el = React.createRef<HTMLDivElement>();

  readonly props: {
    captionScript: CaptionScript,
    currentAudio: Audio
    currentImage: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement,
    repeat: string,
    scale: number,
    singleTrack: boolean,
    timeToNextFrame: number,
    getTags(source: string, clipID?: string): Array<Tag>,
    goBack(): void,
    playNextScene(): void,
    jumpToHack?: ChildCallbackHack,
    advance?(): void,
    getCurrentTimestamp?(): number,
    nextTrack?(): void,
    onError?(e: string): void,
  };

  readonly state = {
    ...captionProgramDefaults,
    countColors: new Map<number, string>(),
    countColor: "#FFFFFF",
    countProgress: false,
    countCurrent: 0,
    countTotal: 0,
    countChild: 0,
  };

  _runningPromise: CancelablePromise = null;
  _timeout: any = null;

  render() {
    const countXPos = this.state.countX * this.props.scale;
    const countYPos = this.state.countY * this.props.scale;
    let countXStyle = {}
    let countYStyle = {}
    if (this.state.showCountProgress) {
      if (countXPos > 0) {
        countXStyle = {
          marginLeft: (countXPos) + 'vmin',
          marginRight: 'unset',
        }
      } else {
        countXStyle = {
          marginLeft: 'unset',
          marginRight: (countXPos * -1) + 'vmin',
        }
      }
      if (countYPos > 0) {
        countYStyle = {
          marginBottom: (countYPos) + 'vmin',
          marginTop: 'unset',
        }
      } else {
        countYStyle = {
          marginBottom: 'unset',
          marginTop: (countYPos * -1) + 'vmin',
        }
      }
    }
    return (
      <React.Fragment>
        <div style={{
          zIndex: 6,
          pointerEvents: 'none',
          display: 'table',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'hidden',
          opacity: this.props.captionScript.opacity / 100,
        }}>
          <div ref={this.el}/>
        </div>
        {this.state.audios.map((a) => {
            return <Sound
              key={a.alias}
              url={a.file}
              playStatus={a.playing
                ? (Sound as any).status.PLAYING
                : (Sound as any).status.PAUSED}
              volume={a.volume}
              onFinishedPlaying={() => {
                const newAudios = Array.from(this.state.audios);
                const audio = newAudios.find((au) => a.alias == au.alias);
                audio.playing = false;
                this.setState({audios: newAudios});
              }}
            />
          }
        )}
        {this.state.countProgress && (
          <div style={{
            zIndex: 6,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
            opacity: this.props.captionScript.opacity / 100,
          }}>
            {this.state.countChild == 0 && (
              <CircularProgress
                style={{
                  ...countXStyle,
                  ...countYStyle,
                  color: this.state.countColor,
                }}
                size={this.state.countProgressScale * this.props.scale}
                value={Math.round((this.state.countCurrent / this.state.countTotal) * 100)}
                variant="determinate"/>
            )}
            {this.state.countChild == 1 && (
              <CircularProgress
                style={{
                  ...countXStyle,
                  ...countYStyle,
                  color: this.state.countColor,
                }}
                size={this.state.countProgressScale * this.props.scale}
                value={Math.round((this.state.countCurrent / this.state.countTotal) * 100)}
                variant="determinate"/>
            )}
          </div>
        )}
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.start();
    if (this.props.jumpToHack) {
      this.props.jumpToHack.listener = (args) => {
        this.setState({programCounter: args[0]});
      }
    }
  }

  componentWillUnmount() {
    this.reset();
    this.stop();
    if (this.props.jumpToHack) {
      this.props.jumpToHack.listener = null;
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return props.captionScript !== this.props.captionScript ||
        props.currentImage !== this.props.currentImage ||
        props.getCurrentTimestamp !== this.props.getCurrentTimestamp ||
        state.countProgress !== this.state.countProgress ||
        state.countCurrent !== this.state.countCurrent ||
        state.countTotal !== this.state.countTotal ||
        state.countColor !== this.state.countColor ||
        state.audios !== this.state.audios;
  }

  _sceneCommand: Function = null;
  componentDidUpdate(props: any, state: any) {
    if (this.props.currentImage !== props.currentImage && this._sceneCommand != null) {
      const command = this._sceneCommand;
      this._sceneCommand = null;
      command();
    }
    if (this.el.current && (this.props.captionScript.url != props.captionScript.url || this.props.captionScript.script != props.captionScript.script) ||
      (this.props.getCurrentTimestamp != null && props.getCurrentTimestamp == null)) {
      this.stop();
      this.reset();
      this.start();
    }
  }

  reset() {
    this.setState({
      ...captionProgramDefaults,
      phrases: new Map<number, Array<string>>(),
      audios: new Array<{alias: string, file: string, playing: boolean, volume: number}>(),
      timestampFn: new Map<number, Array<Function>>(),
      countColors: new Map<number, string>(),
      countColor: "#FFFFFF",
      countProgress: false,
      countCurrent: 0,
      countTotal: 0,
    });
  }

  stop() {
    captionProgramDefaults.phrases = new Map<number, Array<string>>();
    captionProgramDefaults.audios = new Array<{alias: string, file: string, playing: boolean, volume: number}>();
    captionProgramDefaults.timestampFn = new Map<number, Array<Function>>();
    this.setState({countProgress: false});
    if (this.el) {
      this.el.current.style.opacity = '0';
    }
    if (this._runningPromise) {
      this._runningPromise.cancel();
      this._runningPromise = null;
    }
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    this._sceneCommand = null;
    this._timeStarted = null;
    this._lastTimestamp = null;
    this._nextTimestamp = null;
    if (this._timestampTimeout) {
      clearTimeout(this._timestampTimeout);
      this._timestampTimeout = null;
    }
  }

  start() {
    const url = this.props.captionScript.url;
    this._runningPromise = new CancelablePromise((resolve, reject) => {
      if (this.props.captionScript.script != null) {
        resolve({data: [this.props.captionScript.script], helpers: null});
      } else {
        wretch(url)
          .get()
          .error(503, error => {
            console.warn("Unable to access " + url + " - Service is unavailable");
          })
          .text(data => {
            resolve({data: [data], helpers: null});
          });
      }
    });
    this._runningPromise.then((data) => {
      let error = null;
      let newProgram = new Array<Function>();
      let newTimestamps = new Map<number, Array<Function>>();
      let index = 0;
      let containsTimestampAction = false;
      let containsAction = false;

      for (let line of data.data[0].split('\n')) {
        index++;
        line = line.trim();

        if (line.length == 0 || line[0] == '#') continue;
        let command = getFirstWord(line);
        let value = getRest(line);

        let timestamp = getMsTimestampValue(command);
        if (timestamp != null && value != null && value.length > 0) {
          line = value;
          command = getFirstWord(line);
          value = getRest(line);
        }

        let fn, ms;
        switch (command) {
          case "advance":
            if (value != null) {
              error = "Error: {" + index + "} '" + line + "' - extra parameter(s)";
              break;
            }
            if (timestamp != null) {
              containsTimestampAction = true;
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push(this.advance());
              } else {
                newTimestamps.set(timestamp, [this.advance()]);
              }
            } else {
              containsAction = true;
              newProgram.push(this.advance());
            }
            break;
          case "count":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameters";
              break;
            }
            const split = value.split(" ");
            if (split.length < 2) {
              error = "Error: {" + index + "} '" + line + "' - missing second parameter";
              break;
            }
            if (split.length > 2) {
              error = "Error: {" + index + "} '" + line + "' - extra parameter(s)";
              break;
            }
            let start = parseInt(split[0]);
            const end = parseInt(split[1]);
            if (/^\d+\s*$/.exec(split[0]) == null || /^\d+\s*$/.exec(split[1]) == null ||
              isNaN(start) || isNaN(end) || start < 0 || end < 0) {
              error = "Error: {" + index + "} '" + line + "' - invalid count command";
              break;
            }
            if (timestamp != null) {
              containsTimestampAction = true;
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push(this.count(start, end, true));
              } else {
                newTimestamps.set(timestamp, [this.count(start, end, true)]);
              }
            } else {
              containsAction = true;
              newProgram.push(this.count(start, end));
            }
            break;
          case "blink":
          case "cap":
          case "bigcap":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            }
            let rr;
            if (command == "blink") {
              rr = /(?:^|[\/\s])(\$RANDOM_PHRASE|\$\d)(?:[\/\s]|$)/g;
            } else {
              rr = /(?:^|\s)(\$RANDOM_PHRASE|\$\d)(?:\s|$)/g;
            }
            let rrE;
            while ( (rrE = rr.exec(value)) ) {
              let register;
              if (rrE[1] == "$RANDOM_PHRASE") {
                register = 0;
              } else {
                register = parseInt(rrE[1].substring(1, 2));
              }
              if (!this.state.phrases.has(register)) {
                error = "Error: {" + index + "} '" + line + "' - no phrases stored" + (register == 0 ? "" : " in group " + register);
                break;
              }
            }
            if (error != null) break;
            if (timestamp != null) {
              containsTimestampAction = true;
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push((this as any)[command](value, true));
              } else {
                newTimestamps.set(timestamp, [(this as any)[command](value, true)]);
              }
            } else {
              containsAction = true;
              newProgram.push((this as any)[command](value));
            }
            break;
          case "storephrase":
          case "storePhrase":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            }
            const newPhrases = this.state.phrases;
            const registerRegex = /^\$(\d)\s.*$/.exec(value);
            if (registerRegex != null) {
              const register = parseInt(registerRegex[1]);
              if (register != 0) {
                value = value.replace("$" + register + " ", "");
                if (!newPhrases.has(register)) {
                  newPhrases.set(register, []);
                }
                newPhrases.set(register, newPhrases.get(register).concat([value]));
              }
            }
            if (!newPhrases.has(0)) {
              newPhrases.set(0, []);
            }
            newPhrases.set(0, newPhrases.get(0).concat([value]));
            this.setState({phrases: newPhrases});
            break;
          case "storeAudio":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameters";
              break;
            }
            let audioSplit = value.split(' ');
            if (audioSplit.length < 2) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            }
            let file: string, alias: string;
            if (audioSplit[0].startsWith('\'')) {
              file = audioSplit[0].substring(1);
              for (let s = 1; s < audioSplit.length; s++) {
                if (audioSplit[s].endsWith('\'')) {
                  file += " " + audioSplit[s].substring(0, audioSplit[s].length - 1);
                  if (audioSplit.length == s + 1 ) {
                    error = "Error: {" + index + "} '" + line + "' - missing parameter";
                  } else if (audioSplit.length > s + 2) {
                    error = "Error: {" + index + "} '" + line + "' - extra parameter";
                  } else {
                    alias = audioSplit[audioSplit.length - 1];
                  }
                  break;
                } else if (s == audioSplit.length - 1) {
                  error = "Error: {" + index + "} '" + line + "' - invalid command";
                  break;
                } else {
                  file += " " + audioSplit[s];
                }
              }
              if (error != null) break;
              alias = audioSplit[audioSplit.length - 1];
            } else if (audioSplit[0].startsWith('\"')) {
              file = audioSplit[0].substring(1);
              for (let s = 1; s < audioSplit.length; s++) {
                if (audioSplit[s].endsWith('\"')) {
                  file += " " + audioSplit[s].substring(0, audioSplit[s].length - 1);
                  if (s < audioSplit.length - 2) {
                    error = "Error: {" + index + "} '" + line + "' - missing parameter";
                  } else {
                    alias = audioSplit[audioSplit.length - 1];
                  }
                  break;
                } else if (s == audioSplit.length - 1) {
                  error = "Error: {" + index + "} '" + line + "' - invalid command";
                  break;
                } else {
                  file += " " + audioSplit[s];
                }
              }
              if (error != null) break;
            } else {
              file = audioSplit[0];
              alias = audioSplit[1];
            }
            if (!file.startsWith("http") && !fs.existsSync(file)) {
              error = "Error: {" + index + "} '" + line + "' - file '" + file + "' does not exist";
              break;
            }
            if (this.state.audios.find((a) => a.alias == alias) != null) {
              error = "Error: {" + index + "} '" + line + "' - alias already used";
              break;
            }
            this.setState({audios: this.state.audios.concat([{alias: alias, file: file, playing: false, volume: 100}])});
            break;
          case "playAudio":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameters";
              break;
            }
            const pSplit = value.split(" ");
            if (pSplit.length > 2) {
              error = "Error: {" + index + "} '" + line + "' - extra parameter(s)";
              break;
            }
            if (this.state.audios.find((a) => a.alias == pSplit[0]) == null) {
              error = "Error: {" + index + "} '" + line + "' - no audio not stored for '" + pSplit[0] + "'";
              break;
            }
            let volume = 100;
            if (pSplit.length > 1) {
              volume = parseInt(pSplit[1]);
              if (/^\d+$/.exec(pSplit[1]) == null || volume < 0 || volume > 100) {
                error = "Error: {" + index + "} '" + line + "' - invalid volume (0 - 100)";
                break;
              }
            }
            fn = (this as any)[command](pSplit[0], volume);
            if (timestamp != null) {
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push(fn);
              } else {
                newTimestamps.set(timestamp, [fn]);
              }
            } else {
              newProgram.push(fn);
            }
            break;
          case "setBlinkDuration":
          case "setBlinkDelay":
          case "setBlinkGroupDelay":
          case "setCaptionDuration":
          case "setCaptionDelay":
          case "setCountDuration":
          case "setCountDelay":
          case "setCountGroupDelay":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameters";
              break;
            } else if (value.split(" ").length > 2) {
              error = "Error: {" + index + "} '" + line + "' - extra parameter(s)";
              break;
            } else if (/^\d+\s*\d*\s*$/.exec(value) == null) {
              error = "Error: {" + index + "} '" + line + "' - invalid command";
              break;
            }
            const numbers: Array<any> = value.split(" ");
            let invalid = false;
            for (let n = 0; n<numbers.length; n++) {
              ms = parseInt(numbers[n]);
              if (isNaN(ms)) {
                error = "Error: {" + index + "} '" + line + "' - invalid command";
                invalid = true;
                break;
              }
              numbers[n] = ms;
            }
            if (invalid) break;
            fn = (this as any)[command](numbers);
            if (timestamp != null) {
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push(fn);
              } else {
                newTimestamps.set(timestamp, [fn]);
              }
            } else {
              newProgram.push(fn);
            }
            break;
          case "setBlinkWaveRate":
          case "setBlinkBPMMulti":
          case "setBlinkDelayWaveRate":
          case "setBlinkDelayBPMMulti":
          case "setBlinkGroupDelayWaveRate":
          case "setBlinkGroupDelayBPMMulti":
          case "setBlinkOpacity":
          case "setBlinkX":
          case "setBlinkY":
          case "setCaptionWaveRate":
          case "setCaptionBPMMulti":
          case "setCaptionDelayWaveRate":
          case "setCaptionDelayBPMMulti":
          case "setCaptionOpacity":
          case "setCaptionX":
          case "setBigCaptionX":
          case "setCaptionY":
          case "setBigCaptionY":
          case "setCountWaveRate":
          case "setCountBPMMulti":
          case "setCountDelayWaveRate":
          case "setCountDelayBPMMulti":
          case "setCountGroupDelayWaveRate":
          case "setCountGroupDelayBPMMulti":
          case "setCountOpacity":
          case "setCountX":
          case "setCountY":
          case "setCountProgressScale":
          case "wait":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            } else if (value.includes(" ")) {
              error = "Error: {" + index + "} '" + line + "' - extra parameter(s)";
              break;
            } else if (/^-?\d+\s*$/.exec(value) == null) {
              error = "Error: {" + index + "} '" + line + "' - invalid command";
              break;
            }
            ms = parseInt(value);
            if (isNaN(ms)) {
              error = "Error: {" + index + "} '" + line + "' - invalid command";
              break;
            }
            fn = (this as any)[command](ms);
            if (timestamp != null) {
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push(fn);
              } else {
                newTimestamps.set(timestamp, [fn]);
              }
            } else {
              newProgram.push(fn);
            }
            break;
          case "setBlinkTF":
          case "setBlinkDelayTF":
          case "setBlinkGroupDelayTF":
          case "setCaptionTF":
          case "setCaptionDelayTF":
          case "setCountTF":
          case "setCountDelayTF":
          case "setCountGroupDelayTF":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            }
            const tf = getTimingFromString(value);
            if (tf == null) {
              error = "Error: {" + index + "} '" + line + "' - invalid timing function";
              break;
            }
            fn = (this as any)[command](tf);
            if (timestamp != null) {
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push(fn);
              } else {
                newTimestamps.set(timestamp, [fn]);
              }
            } else {
              newProgram.push(fn);
            }
            break;
          case "setShowCountProgress":
          case "setCountProgressOffset":
          case "setCountColorMatch":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            }
            value = value.toLowerCase();
            if (value != "true" && value != "false" && value != "t" && value != "f") {
              error = "Error: {" + index + "} '" + line + "' - invalid parameter";
              break;
            }
            fn = (this as any)[command](value == "true" || value == "t");
            if (timestamp != null) {
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push(fn);
              } else {
                newTimestamps.set(timestamp, [fn]);
              }
            } else {
              newProgram.push(fn);
            }
            break;
          case "setCountProgressColor":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameters";
              break;
            } else if (value.split(" ").length > 2) {
              error = "Error: {" + index + "} '" + line + "' - extra parameter(s)";
              break;
            } else if (/^\d+\s*#([a-f0-9]{3}){1,2}\s*$/i.exec(value) == null) {
              error = "Error: {" + index + "} '" + line + "' - invalid command";
              break;
            }
            const args: Array<any> = value.split(" ");
            ms = parseInt(args[0]);
            if (isNaN(ms)) {
              error = "Error: {" + index + "} '" + line + "' - invalid command";
              break;
            }
            args[0] = ms;
            fn = (this as any)[command](args);
            if (timestamp != null) {
              if (newTimestamps.has(timestamp)) {
                newTimestamps.get(timestamp).push(fn);
              } else {
                newTimestamps.set(timestamp, [fn]);
              }
            } else {
              newProgram.push(fn);
            }
            break;
          default:
            error = "Error: {" + index + "} '" + line + "' - unknown command";
        }
        if (error != null) {
          break;
        }
      }

      if (error == null && (containsAction || containsTimestampAction)) {
        if (newTimestamps.size > 0 && containsAction && containsTimestampAction) {
          this.setState({program: newProgram, timestampFn: newTimestamps, timestamps: Array.from(newTimestamps.keys()).sort((a, b) => {
              if (a > b) {
                return 1;
              } else if (a < b) {
                return -1;
              } else {
                return 0;
              }
            })});
          this._timeStarted = new Date();
          this.timestampLoop();
          this.captionLoop();
        } else if (newTimestamps.size > 0 && containsTimestampAction) {
          this.setState({timestampFn: newTimestamps, timestamps: Array.from(newTimestamps.keys()).sort((a, b) => {
              if (a > b) {
                return 1;
              } else if (a < b) {
                return -1;
              } else {
                return 0;
              }
            })});
          this._timeStarted = new Date();
          this.timestampLoop();
        } else if (containsAction) {
          this.setState({program: newProgram});
          this.captionLoop();
        }
      } else if (this.props.onError) {
        if (this.props.onError) {
          this.props.onError(error);
        } else {
          console.error(error);
        }
      }
    })
  }

  _timeStarted: Date = null;
  _nextTimestamp: number = null;
  _lastTimestamp: number = null;
  _timestampTimeout: NodeJS.Timeout = null;
  timestampLoop() {
    const doLoop = (passed: number): number => {
      let index = this.state.timestampCounter;
      let fns;
      while (this.state.timestamps.length >= index &&
      passed > this.state.timestamps[index + 1]) {
        index++;
      }
      fns = this.state.timestampFn.get(this.state.timestamps[index]);
      this._nextTimestamp = this.state.timestamps[index + 1];

      for (let fn of fns) {
        fn(() => {
          let newCounter = index
          if (newCounter >= this.state.timestamps.length - 1) {
            if (this.props.captionScript.stopAtEnd) {
              this.props.goBack();
              return;
            }
            if (this.props.captionScript.nextSceneAtEnd && this.props.playNextScene) {
              this.props.playNextScene();
              return;
            }
            if (((this.props.repeat == RP.all && !this.props.singleTrack) || this.props.repeat == RP.none) && this.props.nextTrack) {
              this.props.nextTrack();
              return;
            }
          }
          this.setState({timestampCounter: newCounter});
        });
      }
      return index;
    }

    if (this.props.getCurrentTimestamp && this.props.captionScript.syncWithAudio) {
      const passed = this.props.getCurrentTimestamp();
      if (this._lastTimestamp == null || Math.abs(this._lastTimestamp - passed) > 1000) {
        // Timestamp has changed, reset
        let index = 0;
        if (passed > this.state.timestamps[0]) {
          while (this.state.timestamps.length >= index &&
          passed > this.state.timestamps[index + 1]) {
            for (let fn of this.state.timestampFn.get(this.state.timestamps[index])) {
              if (/const command = \(\)/g.exec(fn.toString()) == null) {
                fn(() => {});
              }
            }
            index++;
          }
          this._nextTimestamp = this.state.timestamps[index + 1];
        } else {
          this._nextTimestamp = this.state.timestamps[index];
        }
        this.setState({timestampCounter: index});
      } else if (passed >  this._nextTimestamp) {
        const index = doLoop(passed);
        if (index >= this.state.timestamps.length - 1) {
          this._nextTimestamp = 99999999;
        }
      }
      this._lastTimestamp = passed;
      this._timestampTimeout = setTimeout(this.timestampLoop.bind(this), 100);
    } else {
      if (this._nextTimestamp == null) {
        this._nextTimestamp = this.state.timestamps[this.state.timestampCounter];
      }
      const passed = (new Date().getTime() - this._timeStarted.getTime());
      if (passed > this._nextTimestamp) {
        const index = doLoop(passed);
        if (index >= this.state.timestamps.length - 1) {
          return;
        }
      }
      this._timestampTimeout = setTimeout(this.timestampLoop.bind(this),   100);
    }
  }

  captionLoop() {
    if (this.state.program[this.state.programCounter]) {
      this.state.program[this.state.programCounter](() => {
        let newCounter = this.state.programCounter + 1;
        if (newCounter >= this.state.program.length) {
          if (this.props.captionScript.stopAtEnd) {
            this.props.goBack();
            return;
          }
          if (this.props.captionScript.nextSceneAtEnd && this.props.playNextScene) {
            this.props.playNextScene();
            return;
          }
          if (((this.props.repeat == RP.all && !this.props.singleTrack) || this.props.repeat == RP.none) && this.props.nextTrack) {
            this.props.nextTrack();
            return;
          }
          newCounter = 0;
        }
        this.setState({
          programCounter: newCounter,
          countChild: this.state.countChild == 0 ? 1 : 0
        });
        this.captionLoop();
      });
    }
  }

  getPhrase(value: string) {
    const registerRegex = /^\$(\d)$/.exec(value);
    if (value == "$RANDOM_PHRASE") {
      return getRandomListItem(this.state.phrases.get(0));
    } else if (registerRegex != null) {
      const register = parseInt(registerRegex[1]);
      return getRandomListItem(this.state.phrases.get(register));
    } else if (value == "$TAG_PHRASE") {
      if (this.props.currentImage) {
        const tag = getRandomListItem(this.props.getTags(this.props.currentImage.getAttribute("source"), this.props.currentImage.getAttribute("clip")).filter((t) => t.phraseString && t.phraseString != ""));
        if (tag) {
          const phraseString = tag.phraseString;
          return getRandomListItem(phraseString.split('\n'));
        }
      }
      return "";
    } else {
      return value;
    }
  }

  showText(value: string, ms: number, opacity: number) {
    return (nextCommand: Function) => {
      this.el.current.style.opacity = (opacity / 100).toString();
      this.el.current.innerHTML = htmlEntities(value);
      const wait = this.wait(ms);
      wait(() => {
        this.el.current.style.opacity = '0';
        nextCommand();
      });
    }
  }

  wait(ms: number) {
    return (nextCommand: Function) => {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(nextCommand, ms);
    };
  }

  advance() {
    return (nextCommand: Function) => {
      if (this.props.advance) {
        this.props.advance();
      }
      const wait = this.wait(0);
      wait(() => {
        nextCommand();
      })
    };
  }

  cap(value: string, timestamp = false) {
    return (nextCommand: Function) => {
      const command = () => {
        if (this.state.countProgress) {
          this.setState({countProgress: false});
        }
        let duration = getTimeout(this.state.captionTF, this.state.captionDuration[0], this.state.captionDuration[0],
            this.state.captionDuration[1], this.state.captionWaveRate, this.props.currentAudio,
            this.state.captionBPMMulti, this.props.timeToNextFrame);
        const showText = this.showText(this.getPhrase(value), duration, this.state.captionOpacity);
        let delay = timestamp ? 0 : getTimeout(this.state.captionDelayTF, this.state.captionDelay[0], this.state.captionDelay[0],
            this.state.captionDelay[1], this.state.captionDelayWaveRate, this.props.currentAudio,
            this.state.captionDelayBPMMulti, this.props.timeToNextFrame);
        const wait = this.wait(delay);
        this.el.current.style.color = this.props.captionScript.caption.color;
        this.el.current.style.fontSize = (this.props.captionScript.caption.fontSize * this.props.scale) + "vmin";
        this.el.current.style.fontFamily = this.props.captionScript.caption.fontFamily;
        this.el.current.style.display = 'table-cell';
        this.el.current.style.textAlign = 'center';
        this.el.current.style.verticalAlign = 'bottom';
        const yPos = (14 + this.state.captionY) * this.props.scale;
        if (yPos > 0) {
          this.el.current.style.paddingBottom = (yPos) + 'vmin';
          this.el.current.style.paddingTop = 'unset';
        } else {
          this.el.current.style.paddingBottom = 'unset';
          this.el.current.style.paddingTop = (yPos * -1) + 'vmin';
        }
        const xPos = this.state.captionX * this.props.scale;
        if (xPos > 0) {
          this.el.current.style.paddingLeft = (xPos) + 'vmin';
          this.el.current.style.paddingRight = 'unset';
        } else {
          this.el.current.style.paddingLeft = 'unset';
          this.el.current.style.paddingRight = (xPos * -1) + 'vmin';
        }
        //this.el.current.style.transition = 'opacity 0.5s ease-in-out';
        if (this.props.captionScript.caption.border) {
          this.el.current.style.webkitTextStroke = (this.props.captionScript.caption.borderpx * this.props.scale) + 'px ' + this.props.captionScript.caption.borderColor;
        } else {
          this.el.current.style.webkitTextStroke = 'unset';
        }
        if (this.state.captionDelayTF == TF.scene && !timestamp) {
          showText(function () {
            nextCommand();
          });
        } else {
          showText(function () {
            wait(nextCommand);
          });
        }
      }
      if (this.state.captionDelayTF == TF.scene && !timestamp) {
        this._sceneCommand = command;
      } else {
        command();
      }
    }

  }

  bigcap(value: string, timestamp = false) {
    return (nextCommand: Function) => {
      const command = () => {
        if (this.state.countProgress) {
          this.setState({countProgress: false});
        }
        let duration = getTimeout(this.state.captionTF, this.state.captionDuration[0], this.state.captionDuration[0],
            this.state.captionDuration[1], this.state.captionWaveRate, this.props.currentAudio,
            this.state.captionBPMMulti, this.props.timeToNextFrame);
        const showText = this.showText(this.getPhrase(value), duration, this.state.captionOpacity);
        let delay = timestamp ? 0 : getTimeout(this.state.captionDelayTF, this.state.captionDelay[0], this.state.captionDelay[0],
            this.state.captionDelay[1], this.state.captionDelayWaveRate, this.props.currentAudio,
            this.state.captionDelayBPMMulti, this.props.timeToNextFrame);
        const wait = this.wait(delay);
        this.el.current.style.color = this.props.captionScript.captionBig.color;
        this.el.current.style.fontSize = (this.props.captionScript.captionBig.fontSize * this.props.scale) + "vmin";
        this.el.current.style.fontFamily = this.props.captionScript.captionBig.fontFamily;
        this.el.current.style.display = 'table-cell';
        this.el.current.style.textAlign = 'center';
        this.el.current.style.verticalAlign = 'middle';
        const yPos = this.state.bigCaptionY * this.props.scale;
        if (yPos > 0) {
          this.el.current.style.paddingBottom = (yPos) + 'vmin';
          this.el.current.style.paddingTop = 'unset';
        } else {
          this.el.current.style.paddingBottom = 'unset';
          this.el.current.style.paddingTop = (yPos * -1) + 'vmin';
        }
        const xPos = this.state.bigCaptionX * this.props.scale;
        if (xPos > 0) {
          this.el.current.style.paddingLeft = (xPos) + 'vmin';
          this.el.current.style.paddingRight = 'unset';
        } else {
          this.el.current.style.paddingLeft = 'unset';
          this.el.current.style.paddingRight = (xPos * -1) + 'vmin';
        }
        this.el.current.style.transition = 'opacity 0.1s ease-out';
        if (this.props.captionScript.captionBig.border) {
          this.el.current.style.webkitTextStroke = (this.props.captionScript.captionBig.borderpx * this.props.scale) + 'px ' + this.props.captionScript.captionBig.borderColor;
        } else {
          this.el.current.style.webkitTextStroke = 'unset';
        }
        if (this.state.captionDelayTF == TF.scene && !timestamp) {
          showText(function () {
            nextCommand();
          });
        } else {
          showText(function () {
            wait(nextCommand);
          });
        }
      }
      if (this.state.captionDelayTF == TF.scene && !timestamp) {
       this._sceneCommand = command;
      } else {
        command();
      }
    }

  }

  blink(value: string, timestamp = false) {
    return (nextCommand: Function) => {
      const command = () => {
        if (this.state.countProgress) {
          this.setState({countProgress: false});
        }
        let fns = new Array<Function>();
        let i = 0;
        const phrase = this.getPhrase(value).split('/')
        const length = phrase.length;
        for (let word of phrase) {
          word = this.getPhrase(word.trim());
          let j = i;
          i += 1;
          fns.push(() => {
            let duration = getTimeout(this.state.blinkTF, this.state.blinkDuration[0], this.state.blinkDuration[0],
                this.state.blinkDuration[1], this.state.blinkWaveRate, this.props.currentAudio,
                this.state.blinkBPMMulti, this.props.timeToNextFrame);
            const showText = this.showText(word, duration, this.state.blinkOpacity);
            if (j == length - 1 && (this.state.blinkDelayTF == TF.scene || this.state.blinkGroupDelayTF == TF.scene || timestamp)) {
              showText(() => nextCommand());
            } else if (this.state.blinkDelayTF == TF.scene) {
              showText(() => this._sceneCommand = fns[j + 1]);
            } else {
              let delay = getTimeout(this.state.blinkDelayTF, this.state.blinkDelay[0], this.state.blinkDelay[0],
                  this.state.blinkDelay[1], this.state.blinkDelayWaveRate, this.props.currentAudio,
                  this.state.blinkDelayBPMMulti, this.props.timeToNextFrame);
              const wait = this.wait(delay);
              showText(() => wait(fns[j + 1]));
            }
          })
        }

        if (this.state.blinkGroupDelayTF != TF.scene && this.state.blinkDelayTF != TF.scene && !timestamp) {
          let delay = getTimeout(this.state.blinkGroupDelayTF, this.state.blinkGroupDelay[0], this.state.blinkGroupDelay[0],
              this.state.blinkGroupDelay[1], this.state.blinkGroupDelayWaveRate, this.props.currentAudio,
              this.state.blinkGroupDelayBPMMulti, this.props.timeToNextFrame);
          const lastWait = this.wait(delay);
          fns.push(() => lastWait(nextCommand));
        }

        this.el.current.style.color = this.props.captionScript.blink.color;
        this.el.current.style.fontSize = (this.props.captionScript.blink.fontSize * this.props.scale) + "vmin";
        this.el.current.style.fontFamily = this.props.captionScript.blink.fontFamily;
        this.el.current.style.display = 'table-cell';
        this.el.current.style.textAlign = 'center';
        this.el.current.style.verticalAlign = 'middle';
        const yPos = this.state.blinkY * this.props.scale;
        if (yPos > 0) {
          this.el.current.style.paddingBottom = (yPos) + 'vmin';
          this.el.current.style.paddingTop = 'unset';
        } else {
          this.el.current.style.paddingBottom = 'unset';
          this.el.current.style.paddingTop = (yPos * -1) + 'vmin';
        }
        const xPos = this.state.blinkX * this.props.scale;
        if (xPos > 0) {
          this.el.current.style.paddingLeft = (xPos) + 'vmin';
          this.el.current.style.paddingRight = 'unset';
        } else {
          this.el.current.style.paddingLeft = 'unset';
          this.el.current.style.paddingRight = (xPos * -1) + 'vmin';
        }
        this.el.current.style.transition = 'opacity 0.1s ease-out';
        if (this.props.captionScript.blink.border) {
          this.el.current.style.webkitTextStroke = (this.props.captionScript.blink.borderpx * this.props.scale) + 'px ' + this.props.captionScript.blink.borderColor;
        } else {
          this.el.current.style.webkitTextStroke = 'unset';
        }
        fns[0]();
      }
      if ((this.state.blinkGroupDelayTF == TF.scene || this.state.blinkDelayTF == TF.scene) && !timestamp) {
        this._sceneCommand = command;
      } else {
        command();
      }
    }
  }

  count(start: number, end: number, timestamp = false) {
    let values = Array<number>();
    const origStart = start;
    const origEnd = end;
    do {
      values.push(start);
      if (start == end) {
        break;
      } else if (start < end) {
        start+=1;
      } else if (start > end) {
        start-=1;
      }
    } while (true);

    return (nextCommand: Function) => {
      const command = () => {
        let offset = 0;
        if (this.state.showCountProgress) {
          offset = this.state.countProgressOffset ? Math.min(origStart,origEnd) : 0;
          this.setState({countProgress: true, countCurrent: origStart-offset, countTotal: Math.max(origStart, origEnd)-offset, countColor: this.props.captionScript.count.color});
        } else if (this.state.countProgress) {
          this.setState({countProgress: false});
        }
        let fns = new Array<Function>();
        let i = 0;
        const length = values.length;
        for (let val of values) {
          let j = i;
          i += 1;
          fns.push(() => {
            let duration = getTimeout(this.state.countTF, this.state.countDuration[0], this.state.countDuration[0],
                this.state.countDuration[1], this.state.countWaveRate, this.props.currentAudio,
                this.state.countBPMMulti, this.props.timeToNextFrame);
            if (this.state.showCountProgress) {
              if (this.state.countColors.has(val)) {
                this.setState({countCurrent: val - offset, countColor: this.state.countColors.get(val)});
                if (this.state.countColorMatch) {
                  this.el.current.style.color = this.state.countColors.get(val);
                }
              } else {
                this.setState({countCurrent: val - offset});
              }
            } else {
              if (this.state.countColorMatch) {
                this.el.current.style.color = this.state.countColors.get(val);
              }
            }
            const showText = this.showText(val.toString(), duration, this.state.countOpacity);
            if (j == length - 1 && (this.state.countDelayTF == TF.scene || this.state.countGroupDelayTF == TF.scene || timestamp)) {
              showText(() => nextCommand());
            } else if (this.state.countDelayTF == TF.scene) {
              showText(() => this._sceneCommand = fns[j + 1]);
            } else {
              let delay = getTimeout(this.state.countDelayTF, this.state.countDelay[0], this.state.countDelay[0],
                  this.state.countDelay[1], this.state.countDelayWaveRate, this.props.currentAudio,
                  this.state.countDelayBPMMulti, this.props.timeToNextFrame);
              const wait = this.wait(delay);
              showText(() => wait(fns[j + 1]));
            }
          })
        }

        if (this.state.countGroupDelayTF != TF.scene && this.state.countDelayTF != TF.scene && !timestamp) {
          let delay = getTimeout(this.state.countGroupDelayTF, this.state.countGroupDelay[0], this.state.countGroupDelay[0],
              this.state.countGroupDelay[1], this.state.countGroupDelayWaveRate, this.props.currentAudio,
              this.state.countGroupDelayBPMMulti, this.props.timeToNextFrame);
          const lastWait = this.wait(delay);
          fns.push(() => lastWait(nextCommand));
        }

        this.el.current.style.color = this.props.captionScript.count.color;
        this.el.current.style.fontSize = (this.props.captionScript.count.fontSize * this.props.scale) + "vmin";
        this.el.current.style.fontFamily = this.props.captionScript.count.fontFamily;
        this.el.current.style.display = 'table-cell';
        this.el.current.style.textAlign = 'center';
        this.el.current.style.verticalAlign = 'middle';
        const yPos = this.state.countY * this.props.scale;
        if (yPos > 0) {
          this.el.current.style.paddingBottom = (yPos) + 'vmin';
          this.el.current.style.paddingTop = 'unset';
        } else {
          this.el.current.style.paddingBottom = 'unset';
          this.el.current.style.paddingTop = (yPos * -1) + 'vmin';
        }
        const xPos = this.state.countX * this.props.scale;
        if (xPos > 0) {
          this.el.current.style.paddingLeft = (xPos) + 'vmin';
          this.el.current.style.paddingRight = 'unset';
        } else {
          this.el.current.style.paddingLeft = 'unset';
          this.el.current.style.paddingRight = (xPos * -1) + 'vmin';
        }
        this.el.current.style.transition = 'opacity 0.1s ease-out';
        if (this.props.captionScript.count.border) {
          this.el.current.style.webkitTextStroke = (this.props.captionScript.count.borderpx * this.props.scale) + 'px ' + this.props.captionScript.count.borderColor;
        } else {
          this.el.current.style.webkitTextStroke = 'unset';
        }
        fns[0]();
      }
      if ((this.state.countGroupDelayTF == TF.scene || this.state.countDelayTF == TF.scene) && !timestamp) {
        this._sceneCommand = command;
      } else {
        command();
      }
    }
  }

  playAudio(alias: string, volume: number) {
    return (nextCommand: Function) => {
      const newAudios = Array.from(this.state.audios);
      const audio = newAudios.find((a) => a.alias == alias);
      audio.playing = true;
      audio.volume = volume;
      this.setState({audios: newAudios});
      nextCommand();
    }
  }

  setBlinkY(relYPos: number) {
    return (nextCommand: Function) => {
      this.setState({blinkY: relYPos});
      nextCommand();
    }
  }

  setCaptionY(relYPos: number) {
    return (nextCommand: Function) => {
      this.setState({captionY: relYPos});
      nextCommand();
    }
  }

  setBigCaptionY(relYPos: number) {
    return (nextCommand: Function) => {
      this.setState({bigCaptionY: relYPos});
      nextCommand();
    }
  }

  setCountY(relYPos: number) {
    return (nextCommand: Function) => {
      this.setState({countY: relYPos});
      nextCommand();
    }
  }

  setBlinkX(relXPos: number) {
    return (nextCommand: Function) => {
      this.setState({blinkX: relXPos});
      nextCommand();
    }
  }

  setCaptionX(relXPos: number) {
    return (nextCommand: Function) => {
      this.setState({captionX: relXPos});
      nextCommand();
    }
  }

  setBigCaptionX(relXPos: number) {
    return (nextCommand: Function) => {
      this.setState({bigCaptionX: relXPos});
      nextCommand();
    }
  }

  setCountX(relXPos: number) {
    return (nextCommand: Function) => {
      this.setState({countX: relXPos});
      nextCommand();
    }
  }

  /* Blink */
  setBlinkDuration(ms: Array<number>) {
    return (nextCommand: Function) => {
      if (ms.length == 1) {
        ms.push(this.state.blinkDuration[1]);
      }
      this.setState({blinkDuration: ms});
      nextCommand();
    }
  }

  setBlinkWaveRate(waveRate: number) {
    return (nextCommand: Function) => {
      this.setState({blinkWaveRate: waveRate});
      nextCommand();
    }
  }

  setBlinkBPMMulti(bpmMulti: number) {
    return (nextCommand: Function) => {
      this.setState({blinkBPMMulti: bpmMulti});
      nextCommand();
    }
  }

  setBlinkTF(tf: string) {
    return (nextCommand: Function) => {
      this.setState({blinkTF: tf});
      nextCommand();
    }
  }

  /* Blink Delay */
  setBlinkDelay(ms: Array<number>) {
    return (nextCommand: Function) => {
      if (ms.length == 1) {
        ms.push(this.state.blinkDelay[1]);
      }
      this.setState({blinkDelay: ms});
      nextCommand();
    }
  }

  setBlinkDelayWaveRate(waveRate: number) {
    return (nextCommand: Function) => {
      this.setState({blinkDelayWaveRate: waveRate});
      nextCommand();
    }
  }

  setBlinkDelayBPMMulti(bpmMulti: number) {
    return (nextCommand: Function) => {
      this.setState({blinkDelayBPMMulti: bpmMulti});
      nextCommand();
    }
  }

  setBlinkDelayTF(tf: string) {
    return (nextCommand: Function) => {
      this.setState({blinkDelayTF: tf});
      nextCommand();
    }
  }

  /* Blink Group Delay*/
  setBlinkGroupDelay(ms: Array<number>) {
    return (nextCommand: Function) => {
      if (ms.length == 1) {
        ms.push(this.state.blinkGroupDelay[1]);
      }
      this.setState({blinkGroupDelay: ms});
      nextCommand();
    }
  }

  setBlinkGroupDelayWaveRate(waveRate: number) {
    return (nextCommand: Function) => {
      this.setState({blinkGroupDelayWaveRate: waveRate});
      nextCommand();
    }
  }

  setBlinkGroupDelayBPMMulti(bpmMulti: number) {
    return (nextCommand: Function) => {
      this.setState({blinkGroupDelayBPMMulti: bpmMulti});
      nextCommand();
    }
  }

  setBlinkGroupDelayTF(tf: string) {
    return (nextCommand: Function) => {
      this.setState({blinkGroupDelayTF: tf});
      nextCommand();
    }
  }

  /* Caption */
  setCaptionDuration(ms: Array<number>) {
    return (nextCommand: Function) => {
      if (ms.length == 1) {
        ms.push(this.state.captionDuration[1]);
      }
      this.setState({captionDuration: ms});
      nextCommand();
    }
  }

  setCaptionWaveRate(waveRate: number) {
    return (nextCommand: Function) => {
      this.setState({captionWaveRate: waveRate});
      nextCommand();
    }
  }

  setCaptionBPMMulti(bpmMulti: number) {
    return (nextCommand: Function) => {
      this.setState({captionBPMMulti: bpmMulti});
      nextCommand();
    }
  }

  setCaptionTF(tf: string) {
    return (nextCommand: Function) => {
      this.setState({captionTF: tf});
      nextCommand();
    }
  }

  /* Caption Delay */
  setCaptionDelay(ms: Array<number>) {
    return (nextCommand: Function) => {
      if (ms.length == 1) {
        ms.push(this.state.captionDelay[1]);
      }
      this.setState({captionDelay: ms});
      nextCommand();
    }
  }

  setCaptionDelayWaveRate(waveRate: number) {
    return (nextCommand: Function) => {
      this.setState({captionDelayWaveRate: waveRate});
      nextCommand();
    }
  }

  setCaptionDelayBPMMulti(bpmMulti: number) {
    return (nextCommand: Function) => {
      this.setState({captionDelayBPMMulti: bpmMulti});
      nextCommand();
    }
  }

  setCaptionDelayTF(tf: string) {
    return (nextCommand: Function) => {
      this.setState({captionDelayTF: tf});
      nextCommand();
    }
  }

  /* Count */
  setCountDuration(ms: Array<number>) {
    return (nextCommand: Function) => {
      if (ms.length == 1) {
        ms.push(this.state.countDuration[1]);
      }
      this.setState({countDuration: ms});
      nextCommand();
    }
  }

  setCountWaveRate(waveRate: number) {
    return (nextCommand: Function) => {
      this.setState({countWaveRate: waveRate});
      nextCommand();
    }
  }

  setCountBPMMulti(bpmMulti: number) {
    return (nextCommand: Function) => {
      this.setState({countBPMMulti: bpmMulti});
      nextCommand();
    }
  }

  setCountTF(tf: string) {
    return (nextCommand: Function) => {
      this.setState({countTF: tf});
      nextCommand();
    }
  }

  /* Count Delay */
  setCountDelay(ms: Array<number>) {
    return (nextCommand: Function) => {
      if (ms.length == 1) {
        ms.push(this.state.countDelay[1]);
      }
      this.setState({countDelay: ms});
      nextCommand();
    }
  }

  setCountDelayWaveRate(waveRate: number) {
    return (nextCommand: Function) => {
      this.setState({countDelayWaveRate: waveRate});
      nextCommand();
    }
  }

  setCountDelayBPMMulti(bpmMulti: number) {
    return (nextCommand: Function) => {
      this.setState({countDelayBPMMulti: bpmMulti});
      nextCommand();
    }
  }

  setCountDelayTF(tf: string) {
    return (nextCommand: Function) => {
      this.setState({countDelayTF: tf});
      nextCommand();
    }
  }

  /* Count Group Delay */
  setCountGroupDelay(ms: Array<number>) {
    return (nextCommand: Function) => {
      if (ms.length == 1) {
        ms.push(this.state.countGroupDelay[1]);
      }
      this.setState({countGroupDelay: ms});
      nextCommand();
    }
  }

  setCountGroupDelayWaveRate(waveRate: number) {
    return (nextCommand: Function) => {
      this.setState({countGroupDelayWaveRate: waveRate});
      nextCommand();
    }
  }

  setCountGroupDelayBPMMulti(bpmMulti: number) {
    return (nextCommand: Function) => {
      this.setState({countGroupDelayBPMMulti: bpmMulti});
      nextCommand();
    }
  }

  setCountGroupDelayTF(tf: string) {
    return (nextCommand: Function) => {
      this.setState({countGroupDelayTF: tf});
      nextCommand();
    }
  }

  setShowCountProgress(show: boolean) {
    return (nextCommand: Function) => {
      this.setState({showCountProgress: show});
      nextCommand();
    }
  }

  setCountProgressScale(scale: number) {
    return (nextCommand: Function) => {
      this.setState({countProgressScale: scale});
      nextCommand();
    }
  }

  setCountProgressColor(args: Array<any>) {
    return (nextCommand: Function) => {
      const newColors = this.state.countColors;
      newColors.set(args[0], args[1]);
      this.setState({countColors: newColors});
      nextCommand();
    }
  }

  setCountProgressOffset(offset: boolean) {
    return (nextCommand: Function) => {
      this.setState({countProgressOffset: offset});
      nextCommand();
    }
  }

  setCountColorMatch(match: boolean) {
    return (nextCommand: Function) => {
      this.setState({countColorMatch: match});
      nextCommand();
    }
  }

  setBlinkOpacity(opacity: number) {
    return (nextCommand: Function) => {
      this.setState({blinkOpacity: opacity});
      nextCommand();
    }
  }

  setCaptionOpacity(opacity: number) {
    return (nextCommand: Function) => {
      this.setState({captionOpacity: opacity});
      nextCommand();
    }
  }

  setCountOpacity(opacity: number) {
    return (nextCommand: Function) => {
      this.setState({countOpacity: opacity});
      nextCommand();
    }
  }
}

(CaptionProgram as any).displayName="CaptionProgram";