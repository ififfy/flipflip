import * as React from "react";
import wretch from "wretch";

import {CancelablePromise, getRandomListItem, htmlEntities} from "../../data/utils";
import Tag from "../../data/Tag";
import ChildCallbackHack from "./ChildCallbackHack";

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
    currentSource: string,
    currentClip: string,
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
    blinkDuration: 200,
    blinkDelay: 80,
    blinkGroupDelay: 1200,
    captionDuration: 2000,
    captionDelay: 1200,
    countDuration: 600,
    countDelay: 400,
    countGroupDelay: 1200,
    phrases: Array<string>(),
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
    return props.url !== this.props.url || props.script !== this.props.script;
  }

  componentDidUpdate(props: any, state: any) {
    if (!this.el.current || (this.props.url == props.url && this.props.script == props.script)) return;
    this.stop();
    this.reset();
    this.start();
  }

  reset() {
    this.setState({
      program: [],
      programCounter: 0,
      blinkDuration: 200,
      blinkDelay: 80,
      blinkGroupDelay: 1200,
      captionDuration: 2000,
      captionDelay: 1200,
      countDuration: 600,
      countDelay: 400,
      countGroupDelay: 1200,
      phrases: [],
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
      for (let line of data.data[0].split('\n')) {
        index++;
        line = line.trim();

        if (line.length == 0 || line[0] == '#') continue;

        const command = getFirstWord(line);
        const value = getRest(line);
        let fn, ms;
        switch (command.toLocaleLowerCase()) {
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
            newProgram.push((this as any)[command](value));
            break;
          case "storephrase":
            if (value == null) {
              error = "Error: {" + index + "} '" + line + "' - missing parameter";
              break;
            }
            let newPhrases = this.state.phrases;
            newPhrases = newPhrases.concat([value]);
            this.setState({phrases: newPhrases});
            break;
          case "setblinkduration":
          case "setblinkdelay":
          case "setblinkgroupdelay":
          case "setcaptionduration":
          case "setcaptiondelay":
          case "setcountduration":
          case "setcountdelay":
          case "setcountgroupdelay":
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
          default:
            error = "Error: {" + index + "} '" + line + "' - unknown command";
        }
        if (error != null) {
          break;
        }
      }

      if (error == null) {
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
      if (this.props.currentSource) {
        const tag = getRandomListItem(this.props.getTags(this.props.currentSource, this.props.currentClip).filter((t) => t.phraseString && t.phraseString != ""));
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
      const showText = this.showText(this.getPhrase(value), this.state.captionDuration);
      const wait = this.wait(this.state.captionDelay);
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
      showText(function() { wait(nextCommand); });
    }
  }

  bigcap(value: string) {
    return (nextCommand: Function) => {
      const showText = this.showText(this.getPhrase(value), this.state.captionDuration);
      const wait = this.wait(this.state.captionDelay);
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
      showText(function() { wait(nextCommand); });
    }
  }

  blink(value: string) {
    return (nextCommand: Function) => {
      let fns = new Array<Function>();
      let i = 0;
      for (let word of this.getPhrase(value).split('/')) {
        word = this.getPhrase(word.trim());
        let j = i;
        i += 1;
        fns.push(() => {
          const showText = this.showText(word, this.state.blinkDuration);
          const wait = this.wait(this.state.blinkDelay);
          showText(() => wait(fns[j + 1]));
        })
      }
      const lastWait = this.wait(this.state.blinkGroupDelay);
      fns.push(() => lastWait(nextCommand));

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
      fns[0]();
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
      for (let val of values) {
        let j = i;
        i += 1;
        fns.push(() => {
          const showText = this.showText(val.toString(), this.state.countDuration);
          const wait = this.wait(this.state.countDelay);
          showText(() => wait(fns[j + 1]));
        })
      }
      const lastWait = this.wait(this.state.countGroupDelay);
      fns.push(() => lastWait(nextCommand));

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
      fns[0]();
    }
  }

  setBlinkDuration(ms: number) {
    return (nextCommand: Function) => {
      this.setState({blinkDuration: ms});
      nextCommand();
    }
  }

  setBlinkDelay(ms: number) {
    return (nextCommand: Function) => {
      this.setState({blinkDelay: ms});
      nextCommand();
    }
  }

  setBlinkGroupDelay(ms: number) {
    return (nextCommand: Function) => {
      this.setState({blinkGroupDelay: ms});
      nextCommand();
    }
  }

  setCaptionDuration(ms: number) {
    return (nextCommand: Function) => {
      this.setState({captionDuration: ms});
      nextCommand();
    }
  }

  setCaptionDelay(ms: number) {
    return (nextCommand: Function) => {
      this.setState({captionDelay: ms});
      nextCommand();
    }
  }

  setCountDuration(ms: number) {
    return (nextCommand: Function) => {
      this.setState({countDuration: ms});
      nextCommand();
    }
  }

  setCountDelay(ms: number) {
    return (nextCommand: Function) => {
      this.setState({countDelay: ms});
      nextCommand();
    }
  }

  setCountGroupDelay(ms: number) {
    return (nextCommand: Function) => {
      this.setState({countGroupDelay: ms});
      nextCommand();
    }
  }
}