import * as React from "react";
import wretch from "wretch";

import {CancelablePromise, getRandomListItem} from "../../data/utils";
import Tag from "../../data/Tag";

const splitFirstWord = function (s: string) {
  const firstSpaceIndex = s.indexOf(" ");
  if (firstSpaceIndex > 0 && firstSpaceIndex < s.length - 1) {
    const first = s.substring(0, firstSpaceIndex);
    const rest = s.substring(firstSpaceIndex + 1);
    return [first, rest];
  } else {
    return [null, null];
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
    captionColor: string,
    captionFontSize: number,
    captionFontFamily: string,
    captionBigColor: string,
    captionBigFontSize: number,
    captionBigFontFamily: string,
    countColor: string,
    countFontSize: number,
    countFontFamily: string,
    url: string,
    currentSource: string,
    textEndStop: boolean,
    textNextScene: boolean,
    getTags(source: string): Array<Tag>
    goBack(): void,
    playNextScene(): void,
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
  }

  componentWillUnmount() {
    this.reset();
    this.stop();
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return props.url !== this.props.url;
  }

  componentDidUpdate(props: any, state: any) {
    if (!this.el.current || this.props.url == props.url) return;
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
      wretch(url)
        .get()
        .error(503, error => {
          console.warn("Unable to access " + url + " - Service is unavailable");
        })
        .text(data => {
          resolve({data: [data], helpers: null});
        });
    });
    this._runningPromise.then((data) => {
      let hasError = false;
      let newProgram = new Array<Function>();
      for (let line of data.data[0].split('\n')) {
        line = line.trim();

        if (line.length == 0 || line[0] == '#') continue;

        const command = getFirstWord(line);
        const value = getRest(line);
        let fn, ms;
        switch (command.toLocaleLowerCase()) {
          case "count":
            const split = value.split(" ");
            if (split.length != 2) {
              hasError = true;
              console.error("Error: '" + line + "' - invalid count command");
              break;
            }
            let start = parseInt(split[0]);
            const end = parseInt(split[1]);
            if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
              hasError = true;
              console.error("Error: '" + line + "' - invalid count command");
              break;
            }
            newProgram.push(this.count(start, end));
            break;
          case "blink":
          case "cap":
          case "bigcap":
            newProgram.push((this as any)[command](value));
            break;
          case "storephrase":
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
            ms = parseInt(value);
            if (isNaN(ms)) {
              hasError = true;
              console.error("Error: '" + line + "' - invalid command");
              break;
            }
            fn = (this as any)[command](ms);
            newProgram.push(fn);
            break;
          default:
            hasError = true;
            console.error("Error: '" + line + "' - unknown command");
        }
        if (hasError) {
          break;
        }
      }

      if (!hasError) {
        this.setState({program: newProgram});
        this.captionLoop();
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
          if (this.props.textNextScene) {
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

  showText(value: string, ms: number) {
    return (nextCommand: Function) => {
      this.el.current.style.opacity = '1';
      if (value == "$RANDOM_PHRASE") {
        this.el.current.innerHTML = getRandomListItem(this.state.phrases);
      } else if (value == "$TAG_PHRASE") {
        if (this.props.currentSource) {
          const tag = getRandomListItem(this.props.getTags(this.props.currentSource).filter((t) => t.phraseString && t.phraseString != ""));
          if (tag) {
            const phraseString = tag.phraseString;
            this.el.current.innerHTML = getRandomListItem(phraseString.split('\n'));
          }
        }
      } else {
        this.el.current.innerHTML = value;
      }
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
      const showText = this.showText(value, this.state.captionDuration);
      const wait = this.wait(this.state.captionDelay);
      this.el.current.style.color = this.props.captionColor;
      this.el.current.style.fontSize = this.props.captionFontSize + "vmin";
      this.el.current.style.fontFamily = this.props.captionFontFamily;
      this.el.current.style.display = 'table-cell';
      this.el.current.style.textAlign = 'center';
      this.el.current.style.verticalAlign = 'bottom';
      this.el.current.style.paddingBottom = '20vmin';
      this.el.current.style.transition = 'opacity 0.5s ease-in-out';
      showText(function() { wait(nextCommand); });
    }
  }

  bigcap(value: string) {
    return (nextCommand: Function) => {
      const showText = this.showText(value, this.state.captionDuration);
      const wait = this.wait(this.state.captionDelay);
      this.el.current.style.color = this.props.captionBigColor;
      this.el.current.style.fontSize = this.props.captionBigFontSize + "vmin";
      this.el.current.style.fontFamily = this.props.captionBigFontFamily;
      this.el.current.style.display = 'table-cell';
      this.el.current.style.textAlign = 'center';
      this.el.current.style.verticalAlign = 'middle';
      this.el.current.style.transition = 'opacity 0.1s ease-out';
      showText(function() { wait(nextCommand); });
    }
  }

  blink(value: string) {
    return (nextCommand: Function) => {
      let fns = new Array<Function>();
      let i = 0;
      for (let word of value.split('/')) {
        word = word.trim();
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
      this.el.current.style.transition = 'opacity 0.1s ease-out';
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
      this.el.current.style.transition = 'opacity 0.1s ease-out';
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