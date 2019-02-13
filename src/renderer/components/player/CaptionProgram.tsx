import * as React from 'react';
import wretch from 'wretch';

import {CancelablePromise, getRandomListItem} from '../../utils'

class CaptionSettings {
  blinkColor: string;
  blinkFontSize: number;
  blinkFontFamily: string;
  captionColor: string;
  captionFontSize: number;
  captionFontFamily: string;
  captionBigColor: string;
  captionBigFontSize: number;
  captionBigFontFamily: string;

  constructor(init?: Partial<CaptionSettings>) {
    Object.assign(this, init);
  }
}

let STYLES: { [style: string]: string } = {};

let programCounter = 0;
let PROGRAM: Function[] = [];
let BLINK_DURATION = 200;
let BLINK_DELAY = 80;
let BLINK_GROUP_DELAY = 1200;
let CAPTION_DURATION = 2000;
let CAPTION_DELAY = 1200;
let PHRASES: string[] = [];

function reset() {
  PROGRAM = [];
  programCounter = 0;
}

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

const fnIntArg = function (innerFn: Function) {
  return function (el: HTMLElement, value: string) {
    const ms = parseInt(value, 10);
    if (isNaN(ms)) { return null; }
    return innerFn(ms);
  };
};

const COMMANDS: { [command: string]: (el: HTMLElement, value: string, config: CaptionSettings) => any; } = {
  saveStyleRules: function (el: HTMLElement, value: string) {
    const firstWord = getFirstWord(value);
    const style = getRest(value);
    if (!firstWord || !style) { return null; }

    STYLES[firstWord] = STYLES[firstWord] || '';
    STYLES[firstWord] += style;

    return function(f : Function) { f() };
  },

  applySavedStyle: function (el: HTMLElement, value: string) {
    return function (runNextCommand: Function) {
      el.style.cssText = STYLES[value];
      runNextCommand();
    }
  },

  showText: function (el: HTMLElement, value: string) {
    let textString = getRest(value);
    const msString = getFirstWord(value);
    const ms = parseInt(msString, 10);
    if (!textString || isNaN(ms)) { return null; }

    if (textString === '$RANDOM_PHRASE') {
      textString = getRandomListItem(PHRASES);
    }

    return function (runNextCommand: Function) {
      el.style.opacity = '1.0';
      el.innerHTML = textString;
      setTimeout(function () {
        el.style.opacity = '0.0';
        runNextCommand();
      }, ms);
    }
  },

  wait: fnIntArg(function(ms : number) {
    return function(runNextCommand : Function) { setTimeout(runNextCommand, ms); }
  }),

  setBlinkDuration: fnIntArg(function (ms: number) {
    return function (runNextCommand: Function) {
      BLINK_DURATION = ms;
      runNextCommand();
    }
  }),

  setBlinkDelay: fnIntArg(function (ms: number) {
    return function (runNextCommand: Function) {
      BLINK_DELAY = ms;
      runNextCommand();
    }
  }),

  setBlinkGroupDelay: fnIntArg(function (ms: number) {
    return function (runNextCommand: Function) {
      BLINK_GROUP_DELAY = ms;
      runNextCommand();
    }
  }),

  setCaptionDuration: fnIntArg(function (ms: number) {
    return function (runNextCommand: Function) {
      CAPTION_DURATION = ms;
      runNextCommand();
    }
  }),

  setCaptionDelay: fnIntArg(function (ms: number) {
    return function (runNextCommand: Function) {
      CAPTION_DELAY = ms;
      runNextCommand();
    }
  }),

  storePhrase: function (el: HTMLElement, value: string) {
    PHRASES.push(value);
    return function(f : Function) { f() };
  },

  blink: function (el: HTMLElement, value: string, config: CaptionSettings) {
    return function (runNextCommand: Function) {
      let fns: Function[] = [];
      let i = 0;
      el.style.color = config.blinkColor;
      el.style.fontSize = config.blinkFontSize + "vmin";
      el.style.fontFamily = config.blinkFontFamily;
      el.className = "text-blink";
      value.split('/').forEach(function (word) {
        word = word.trim();
        let j = i;
        i += 1;
        fns.push(function () {
          const showText = COMMANDS.showText(el, BLINK_DURATION + ' ' + word, config);
          const wait = COMMANDS.wait(el, '' + BLINK_DELAY, config);
          showText(function() { wait(fns[j + 1]); });
        })
      });
      const lastWait = COMMANDS.wait(el, '' + BLINK_GROUP_DELAY, config);
      fns.push(function () {
        lastWait(runNextCommand);
      });
      fns[0]();
    }
  },

  cap: function (el: HTMLElement, value: string, config: CaptionSettings) {
    const showText = COMMANDS.showText(el, CAPTION_DURATION + ' ' + value, config);
    const wait = COMMANDS.wait(el, '' + CAPTION_DELAY, config);
    return function (runNextCommand: Function) {
      el.style.color = config.captionColor;
      el.style.fontSize = config.captionFontSize + "vmin";
      el.style.fontFamily = config.captionFontFamily;
      el.className = "text-caption";
      showText(function() { wait(runNextCommand); });
    }
  },

  bigcap: function (el: HTMLElement, value: string, config: CaptionSettings) {
    const showText = COMMANDS.showText(el, CAPTION_DURATION + ' ' + value, config);
    const wait = COMMANDS.wait(el, '' + CAPTION_DELAY, config);
    return function (runNextCommand: Function) {
      el.style.color = config.captionBigColor;
      el.style.fontSize = config.captionBigFontSize + "vmin";
      el.style.fontFamily = config.captionBigFontFamily;
      el.className = "text-caption-big";
      showText(function() { wait(runNextCommand); });
    }
  }
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
    url: string,
  };

  readonly state = {
    runningPromise: new CancelablePromise((resolve, reject) => {})
  };

  render() {
    return (
      <div className="CaptionProgram u-fill-container">
        <div ref={this.el}/>
      </div>
    );
  }

  componentDidMount() {
    this.start();
  }

  componentWillUnmount() {
    reset();
    this.stop(false);
  }

  shouldComponentUpdate(nextProps: { url: string }, nextState: any) {
    return nextProps.url !== this.props.url;
  }

  componentWillReceiveProps(nextProps: { url: string }) {
    if (!this.el.current || nextProps.url == this.props.url) return;
    this.stop(true);
    reset();
    this.start(nextProps.url);
  }

  start(url?: string) {
    if (url == undefined) {
      url = this.props.url;
    }
    const newPromise = new CancelablePromise((resolve, reject) => {
      wretch(url)
        .get()
        .error(503, error => {
          console.warn("Unable to access " + url + " - Service is unavailable");
        })
        .text(data => {
          resolve({data: [data], next: null});
        });
    });
    this.setState({runningPromise: newPromise});
    newPromise
      .then((data) => {
        let hasError = false;
        const captionSettings = new CaptionSettings({
          blinkColor: this.props.blinkColor,
          blinkFontSize: this.props.blinkFontSize,
          blinkFontFamily: this.props.blinkFontFamily,
          captionColor: this.props.captionColor,
          captionFontSize: this.props.captionFontSize,
          captionFontFamily: this.props.captionFontFamily,
          captionBigColor: this.props.captionBigColor,
          captionBigFontSize: this.props.captionBigFontSize,
          captionBigFontFamily: this.props.captionBigFontFamily,
        });
        for (let line of data.data[0].split('\n')) {
          line = line.trim();

          if (line.length == 0 || line[0] === '#') continue;

          const command = getFirstWord(line);
          if (command) {
            const value = getRest(line);
            if (COMMANDS[command]) {
              const fn = COMMANDS[command](this.el.current, value, captionSettings);
              if (fn) {
                if (command.toLowerCase().startsWith("set")) {
                  fn(() => {return newPromise.hasCanceled;});
                } else {
                  PROGRAM.push(fn);
                }
              } else {
                hasError = true;
                console.error("Error: '" + line + "' - invalid arguments");
                break;
              }
            } else {
              hasError = true;
              console.error("Error: '" + line + "' - unknown command");
              break;
            }
          }
        }

        function captionLoop(hasCanceled: boolean) {
          if (hasCanceled) {
            return;
          }
          PROGRAM[programCounter](() => {
            programCounter += 1;
            if (programCounter >= PROGRAM.length) {
              programCounter = 0;
            }
            captionLoop(newPromise.hasCanceled);
          });
        }

        if (!hasError) {
          captionLoop(newPromise.hasCanceled);
        }
      });
  }

  stop(setState: boolean) {
    if (this.state.runningPromise) {
      this.state.runningPromise.cancel();
      if (setState) this.setState({runningPromise: null});
    }
  }
}