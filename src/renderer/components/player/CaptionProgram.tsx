import * as React from "react";
import wretch from "wretch";

import {CancelablePromise, getRandomListItem, getTimeout, getTimingFromString, htmlEntities} from "../../data/utils";
import {TF} from "../../data/const";
import Tag from "../../data/Tag";
import ChildCallbackHack from "./ChildCallbackHack";
import Audio from "../../data/Audio";

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
    blinkColor: string,
    blinkFontSize: number,
    blinkFontFamily: string,
    blinkBorder: boolean,
    blinkBorderpx: number,
    blinkBorderColor: string,
    captionColor: string,
    captionFontSize: number,
    captionFontFamily: string,
    captionBorder: boolean,
    captionBorderpx: number,
    captionBorderColor: string,
    captionBigColor: string,
    captionBigFontSize: number,
    captionBigFontFamily: string,
    captionBigBorder: boolean,
    captionBigBorderpx: number,
    captionBigBorderColor: string,
    countColor: string,
    countFontSize: number,
    countFontFamily: string,
    countBorder: boolean,
    countBorderpx: number,
    countBorderColor: string,
    url: string,
    script: string;
    timeToNextFrame: number;
    currentAudio: Audio
    currentImage: HTMLImageElement | HTMLVideoElement,
    textEndStop: boolean,
    textNextScene: boolean,
    getTags(source: string, clipID?: string): Array<Tag>
    goBack(): void,
    playNextScene(): void,
    jumpToHack?: ChildCallbackHack,
    onError?(e: string): void,
  };

  readonly state = {
    program: Array<Function>(),
    programCounter: 0,
    phrases: Array<string>(),

    blinkDuration: [200, 500],
    blinkSinRate: 100,
    blinkBPMMulti: 1,
    blinkTF: TF.constant,

    blinkDelay: [80, 200],
    blinkDelaySinRate: 100,
    blinkDelayBPMMulti: 1,
    blinkDelayTF: TF.constant,

    blinkGroupDelay: [1200, 2000],
    blinkGroupDelaySinRate: 100,
    blinkGroupDelayBPMMulti: 1,
    blinkGroupDelayTF: TF.constant,

    captionDuration: [2000, 4000],
    captionSinRate: 100,
    captionBPMMulti: 1,
    captionTF: TF.constant,

    captionDelay: [1200, 2000],
    captionDelaySinRate: 100,
    captionDelayBPMMulti: 1,
    captionDelayTF: TF.constant,

    countDuration: [600, 1000],
    countSinRate: 100,
    countBPMMulti: 1,
    countTF: TF.constant,

    countDelay: [400, 1000],
    countDelaySinRate: 100,
    countDelayBPMMulti: 1,
    countDelayTF: TF.constant,

    countGroupDelay: [1200, 2000],
    countGroupDelaySinRate: 100,
    countGroupDelayBPMMulti: 1,
    countGroupDelayTF: TF.constant,
  };

  _runningPromise: CancelablePromise = null;
  _timeout: any = null;

  render() {
    return (
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
      }}>
        <div ref={this.el}/>
      </div>
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
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return props.url !== this.props.url || props.script !== this.props.script || props.currentImage !== this.props.currentImage;
  }

  _sceneCommand: Function = null;
  componentDidUpdate(props: any, state: any) {
    if (this.props.currentImage !== props.currentImage && this._sceneCommand != null) {
      const command = this._sceneCommand;
      this._sceneCommand = null;
      command();
    }
    if (!this.el.current || (this.props.url == props.url && this.props.script == props.script)) return;
    this.stop();
    this.reset();
    this.start();
  }

  reset() {
    this.setState({
      program: [],
      programCounter: 0,
      phrases: [],

      blinkDuration: [200, 500],
      blinkSinRate: 100,
      blinkBPMMulti: 1,
      blinkTF: TF.constant,

      blinkDelay: [80, 200],
      blinkDelaySinRate: 100,
      blinkDelayBPMMulti: 1,
      blinkDelayTF: TF.constant,

      blinkGroupDelay: [1200, 2000],
      blinkGroupDelaySinRate: 100,
      blinkGroupDelayBPMMulti: 1,
      blinkGroupDelayTF: TF.constant,

      captionDuration: [2000, 4000],
      captionSinRate: 100,
      captionBPMMulti: 1,
      captionTF: TF.constant,

      captionDelay: [1200, 2000],
      captionDelaySinRate: 100,
      captionDelayBPMMulti: 1,
      captionDelayTF: TF.constant,

      countDuration: [600, 1000],
      countSinRate: 100,
      countBPMMulti: 1,
      countTF: TF.constant,

      countDelay: [400, 1000],
      countDelaySinRate: 100,
      countDelayBPMMulti: 1,
      countDelayTF: TF.constant,

      countGroupDelay: [1200, 2000],
      countGroupDelaySinRate: 100,
      countGroupDelayBPMMulti: 1,
      countGroupDelayTF: TF.constant,
    });
  }

  stop() {
    if (this._runningPromise) {
      this._runningPromise.cancel();
      this._runningPromise = null;
    }
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    this._sceneCommand = null;
  }

  start() {
    const url = this.props.url;
    this._runningPromise = new CancelablePromise((resolve, reject) => {
      if (this.props.script != null) {
        resolve({data: [this.props.script], helpers: null});
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
      let index = 0;
      let containsAction = false;
      for (let line of data.data[0].split('\n')) {
        index++;
        line = line.trim();

        if (line.length == 0 || line[0] == '#') continue;

        const command = getFirstWord(line);
        const value = getRest(line);
        let fn, ms;
        switch (command) {
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
            containsAction = true;
            newProgram.push(this.count(start, end));
            break;
          case "blink":
          case "cap":
          case "bigcap":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            }
            if (value.split(" ").includes("$RANDOM_PHRASE") && this.state.phrases.length == 0) {
              error = "Error: {" + index + "} '" + line + "' - no phrases stored";
              break;
            }
            containsAction = true;
            newProgram.push((this as any)[command](value));
            break;
          case "storephrase":
          case "storePhrase":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            }
            let newPhrases = this.state.phrases;
            newPhrases = newPhrases.concat([value]);
            this.setState({phrases: newPhrases});
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
            newProgram.push(fn);
            break;
          case "setBlinkSinRate":
          case "setBlinkBPMMulti":
          case "setBlinkDelaySinRate":
          case "setBlinkDelayBPMMulti":
          case "setBlinkGroupDelaySinRate":
          case "setBlinkGroupDelayBPMMulti":
          case "setCaptionSinRate":
          case "setCaptionBPMMulti":
          case "setCaptionDelaySinRate":
          case "setCaptionDelayBPMMulti":
          case "setCountSinRate":
          case "setCountBPMMulti":
          case "setCountDelaySinRate":
          case "setCountDelayBPMMulti":
          case "setCountGroupDelaySinRate":
          case "setCountGroupDelayBPMMulti":
          case "wait":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            } else if (value.includes(" ")) {
              error = "Error: {" + index + "} '" + line + "' - extra parameter(s)";
              break;
            } else if (/^\d+\s*$/.exec(value) == null) {
              error = "Error: {" + index + "} '" + line + "' - invalid command";
              break;
            }
            ms = parseInt(value);
            if (isNaN(ms)) {
              error = "Error: {" + index + "} '" + line + "' - invalid command";
              break;
            }
            fn = (this as any)[command](ms);
            newProgram.push(fn);
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
            newProgram.push(fn);
            break;
          default:
            error = "Error: {" + index + "} '" + line + "' - unknown command";
        }
        if (error != null) {
          break;
        }
      }

      if (error == null && containsAction) {
        this.setState({program: newProgram});
        this.captionLoop();
      } else if (this.props.onError) {
        console.error(error);
        this.props.onError(error);
      }
    })
  }

  captionLoop() {
    if (this.state.program[this.state.programCounter]) {
      this.state.program[this.state.programCounter](() => {
        let newCounter = this.state.programCounter + 1;
        if (newCounter >= this.state.program.length) {
          if (this.props.textEndStop) {
            this.props.goBack();
            return;
          }
          if (this.props.textNextScene && this.props.playNextScene) {
            this.props.playNextScene();
            return;
          }
          newCounter = 0;
        }
        this.setState({programCounter: newCounter});
        this.captionLoop();
      });
    }
  }

  getPhrase(value: string) {
    if (value == "$RANDOM_PHRASE") {
      return getRandomListItem(this.state.phrases);
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

  showText(value: string, ms: number) {
    return (nextCommand: Function) => {
      this.el.current.style.opacity = '1';
      this.el.current.innerHTML = htmlEntities(value);
      const wait = this.wait(ms);
      wait(() => {
        this.el.current.style.opacity = '0';
        nextCommand();
      });
    }
  }

  wait(ms: number) {
    return (nextCommand: Function) => { this._timeout = setTimeout(nextCommand, ms)};
  }

  cap(value: string) {
    return (nextCommand: Function) => {
      let duration = getTimeout(this.state.captionTF, this.state.captionDuration[0], this.state.captionDuration[0],
        this.state.captionDuration[1], this.state.captionSinRate, this.props.currentAudio,
        this.state.captionBPMMulti, this.props.timeToNextFrame);
      const showText = this.showText(this.getPhrase(value), duration);
      let delay = getTimeout(this.state.captionDelayTF, this.state.captionDelay[0], this.state.captionDelay[0],
        this.state.captionDelay[1], this.state.captionDelaySinRate, this.props.currentAudio,
        this.state.captionDelayBPMMulti, this.props.timeToNextFrame);
      const wait = this.wait(delay);
      this.el.current.style.color = this.props.captionColor;
      this.el.current.style.fontSize = this.props.captionFontSize + "vmin";
      this.el.current.style.fontFamily = this.props.captionFontFamily;
      this.el.current.style.display = 'table-cell';
      this.el.current.style.textAlign = 'center';
      this.el.current.style.verticalAlign = 'bottom';
      this.el.current.style.paddingBottom = '20vmin';
      this.el.current.style.transition = 'opacity 0.5s ease-in-out';
      if (this.props.captionBorder) {
        this.el.current.style.webkitTextStroke = this.props.captionBorderpx + 'px ' + this.props.captionBorderColor;
      }
      if (this.state.captionDelayTF == TF.scene) {
        this._sceneCommand = () => {showText(() => nextCommand())};
      } else {
        showText(function() { wait(nextCommand); });
      }
    }
  }

  bigcap(value: string) {
    return (nextCommand: Function) => {
      let duration = getTimeout(this.state.captionTF, this.state.captionDuration[0], this.state.captionDuration[0],
        this.state.captionDuration[1], this.state.captionSinRate, this.props.currentAudio,
        this.state.captionBPMMulti, this.props.timeToNextFrame);
      const showText = this.showText(this.getPhrase(value), duration);
      let delay = getTimeout(this.state.captionDelayTF, this.state.captionDelay[0], this.state.captionDelay[0],
        this.state.captionDelay[1], this.state.captionDelaySinRate, this.props.currentAudio,
        this.state.captionDelayBPMMulti, this.props.timeToNextFrame);
      const wait = this.wait(delay);
      this.el.current.style.color = this.props.captionBigColor;
      this.el.current.style.fontSize = this.props.captionBigFontSize + "vmin";
      this.el.current.style.fontFamily = this.props.captionBigFontFamily;
      this.el.current.style.display = 'table-cell';
      this.el.current.style.textAlign = 'center';
      this.el.current.style.verticalAlign = 'middle';
      this.el.current.style.paddingBottom = 'unset';
      this.el.current.style.transition = 'opacity 0.1s ease-out';
      if (this.props.captionBigBorder) {
        this.el.current.style.webkitTextStroke = this.props.captionBigBorderpx + 'px ' + this.props.captionBigBorderColor;
      }
      if (this.state.captionDelayTF == TF.scene) {
        this._sceneCommand = () => {showText(() => nextCommand())};
      } else {
        showText(function() { wait(nextCommand); });
      }

    }
  }

  blink(value: string) {
    return (nextCommand: Function) => {
      let fns = new Array<Function>();
      let i = 0;
      const length = this.getPhrase(value).split('/').length;
      for (let word of this.getPhrase(value).split('/')) {
        word = this.getPhrase(word.trim());
        let j = i;
        i += 1;
        fns.push(() => {
          let duration = getTimeout(this.state.blinkTF, this.state.blinkDuration[0], this.state.blinkDuration[0],
              this.state.blinkDuration[1], this.state.blinkSinRate, this.props.currentAudio,
              this.state.blinkBPMMulti, this.props.timeToNextFrame);
          const showText = this.showText(word, duration);
          if (j == length - 1 && (this.state.blinkDelayTF == TF.scene || this.state.blinkGroupDelayTF == TF.scene)) {
            showText(() => nextCommand());
          } else if (this.state.blinkDelayTF == TF.scene) {
            showText(() => this._sceneCommand = fns[j + 1]);
          } else {
            let delay = getTimeout(this.state.blinkDelayTF, this.state.blinkDelay[0], this.state.blinkDelay[0],
              this.state.blinkDelay[1], this.state.blinkDelaySinRate, this.props.currentAudio,
              this.state.blinkDelayBPMMulti, this.props.timeToNextFrame);
            const wait = this.wait(delay);
            showText(() => wait(fns[j + 1]));
          }
        })
      }

      if (this.state.blinkGroupDelayTF != TF.scene && this.state.blinkDelayTF != TF.scene) {
        let delay = getTimeout(this.state.blinkGroupDelayTF, this.state.blinkGroupDelay[0], this.state.blinkGroupDelay[0],
          this.state.blinkGroupDelay[1], this.state.blinkGroupDelaySinRate, this.props.currentAudio,
          this.state.blinkGroupDelayBPMMulti, this.props.timeToNextFrame);
        const lastWait = this.wait(delay);
        fns.push(() => lastWait(nextCommand));
      }

      this.el.current.style.color = this.props.blinkColor;
      this.el.current.style.fontSize = this.props.blinkFontSize + "vmin";
      this.el.current.style.fontFamily = this.props.blinkFontFamily;
      this.el.current.style.display = 'table-cell';
      this.el.current.style.textAlign = 'center';
      this.el.current.style.verticalAlign = 'middle';
      this.el.current.style.paddingBottom = 'unset';
      this.el.current.style.transition = 'opacity 0.1s ease-out';
      if (this.props.blinkBorder) {
        this.el.current.style.webkitTextStroke = this.props.blinkBorderpx + 'px ' + this.props.blinkBorderColor;
      }
      if (this.state.blinkGroupDelayTF == TF.scene || this.state.blinkDelayTF == TF.scene) {
        this._sceneCommand = fns[0];
      } else {
        fns[0]();
      }
    }
  }

  count(start: number, end: number) {
    let values = Array<number>();
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
      let fns = new Array<Function>();
      let i = 0;
      const length = values.length;
      for (let val of values) {
        let j = i;
        i += 1;
        fns.push(() => {
          let duration = getTimeout(this.state.countTF, this.state.countDuration[0], this.state.countDuration[0],
            this.state.countDuration[1], this.state.countSinRate, this.props.currentAudio,
            this.state.countBPMMulti, this.props.timeToNextFrame);
          const showText = this.showText(val.toString(), duration);
          if (j == length - 1 && (this.state.countDelayTF == TF.scene || this.state.countGroupDelayTF == TF.scene)) {
            showText(() => nextCommand());
          } else if (this.state.countDelayTF == TF.scene) {
            showText(() => this._sceneCommand = fns[j + 1]);
          } else {
            let delay = getTimeout(this.state.countDelayTF, this.state.countDelay[0], this.state.countDelay[0],
              this.state.countDelay[1], this.state.countDelaySinRate, this.props.currentAudio,
              this.state.countDelayBPMMulti, this.props.timeToNextFrame);
            const wait = this.wait(delay);
            showText(() => wait(fns[j + 1]));
          }
        })
      }
      
      if (this.state.countGroupDelayTF != TF.scene && this.state.countDelayTF != TF.scene) {
        let delay = getTimeout(this.state.countGroupDelayTF, this.state.countGroupDelay[0], this.state.countGroupDelay[0],
          this.state.countGroupDelay[1], this.state.countGroupDelaySinRate, this.props.currentAudio,
          this.state.countGroupDelayBPMMulti, this.props.timeToNextFrame);
        const lastWait = this.wait(delay);
        fns.push(() => lastWait(nextCommand));
      }

      this.el.current.style.color = this.props.countColor;
      this.el.current.style.fontSize = this.props.countFontSize + "vmin";
      this.el.current.style.fontFamily = this.props.countFontFamily;
      this.el.current.style.display = 'table-cell';
      this.el.current.style.textAlign = 'center';
      this.el.current.style.verticalAlign = 'middle';
      this.el.current.style.paddingBottom = 'unset';
      this.el.current.style.transition = 'opacity 0.1s ease-out';
      if (this.props.countBorder) {
        this.el.current.style.webkitTextStroke = this.props.countBorderpx + 'px ' + this.props.countBorderColor;
      }
      if (this.state.countGroupDelayTF == TF.scene || this.state.countDelayTF == TF.scene) {
        this._sceneCommand = fns[0];
      } else {
        fns[0]();
      }
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

  setBlinkSinRate(sinRate: number) {
    return (nextCommand: Function) => {
      this.setState({blinkSinRate: sinRate});
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

  setBlinkDelaySinRate(sinRate: number) {
    return (nextCommand: Function) => {
      this.setState({blinkDelaySinRate: sinRate});
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

  setBlinkGroupDelaySinRate(sinRate: number) {
    return (nextCommand: Function) => {
      this.setState({blinkGroupDelaySinRate: sinRate});
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

  setCaptionSinRate(sinRate: number) {
    return (nextCommand: Function) => {
      this.setState({captionSinRate: sinRate});
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

  setCaptionDelaySinRate(sinRate: number) {
    return (nextCommand: Function) => {
      this.setState({captionDelaySinRate: sinRate});
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

  setCountSinRate(sinRate: number) {
    return (nextCommand: Function) => {
      this.setState({countSinRate: sinRate});
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

  setCountDelaySinRate(sinRate: number) {
    return (nextCommand: Function) => {
      this.setState({countDelaySinRate: sinRate});
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

  setCountGroupDelaySinRate(sinRate: number) {
    return (nextCommand: Function) => {
      this.setState({countGroupDelaySinRate: sinRate});
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
}