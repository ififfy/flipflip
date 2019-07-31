import * as React from 'react';
import wretch from 'wretch';

import {CancelablePromise, getRandomListItem} from '../../data/utils'

//let STYLES: { [style: string]: string } = {};

let programCounter = 0;
let PROGRAM: Function[] = [];
let BLINK_DURATION = 200;
let BLINK_DELAY = 80;
let BLINK_GROUP_DELAY = 1200;
let CAPTION_DURATION = 2000;
let CAPTION_DELAY = 1200;
let COUNT_DURATION = 600;
let COUNT_DELAY = 400;
let COUNT_GROUP_DELAY = 1200;
let PHRASES: string[] = [];

function reset() {
  PROGRAM = [];
  programCounter = 0;
  //STYLES = {};
  BLINK_DURATION = 200;
  BLINK_DELAY = 80;
  BLINK_GROUP_DELAY = 1200;
  CAPTION_DURATION = 2000;
  CAPTION_DELAY = 1200;
  COUNT_DURATION = 600;
  COUNT_DELAY = 400;
  COUNT_GROUP_DELAY = 1200;
  PHRASES = [];
}

// TODO Timeout's aren't being properly canceled, results in odd behavior when switching scenes
//      This may also be causing memory leak

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

  shouldComponentUpdate(props: any, state: any): boolean {
    return props.url !== this.props.url;
  }

  componentDidUpdate(props: any, state: any) {
    if (!this.el.current || this.props.url == props.url) return;
    this.stop(true);
    reset();
    this.start(this.props.url);
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
        for (let line of data.data[0].split('\n')) {
          line = line.trim();

          if (line.length == 0 || line[0] === '#') continue;

          const command = getFirstWord(line);
          if (command) {
            const value = getRest(line);
            if (this.COMMANDS[command]) {
              const fn = this.COMMANDS[command](this.el.current, value);
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

        function captionLoop() {
          if (newPromise.hasCanceled) {
            return;
          }
          PROGRAM[programCounter](() => {
            programCounter += 1;
            if (programCounter >= PROGRAM.length) {
              programCounter = 0;
            }
            captionLoop();
          });
        }

        if (!hasError) {
          captionLoop();
        }
      });
  }

  stop(setState: boolean) {
    if (this.state.runningPromise) {
      this.state.runningPromise.cancel();
      if (setState) this.setState({runningPromise: null});
    }
  }

  COMMANDS: { [command: string]: (el: HTMLElement, value: string) => any; } = {
    /*saveStyleRules: function (el: HTMLElement, value: string) {
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
    },*/

    showText: function (el: HTMLElement, value: string) {
      let textString = getRest(value);
      const msString = getFirstWord(value);
      const ms = parseInt(msString, 10);
      if (!textString || isNaN(ms)) { return null; }

      if (textString === '$RANDOM_PHRASE') {
        return function (runNextCommand: Function) {
          el.style.opacity = '1.0';
          el.innerHTML = getRandomListItem(PHRASES);
          setTimeout(function () {
            el.style.opacity = '0.0';
            runNextCommand();
          }, ms);
        }
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

    setCountDuration: fnIntArg(function (ms: number) {
      return function (runNextCommand: Function) {
        COUNT_DURATION = ms;
        runNextCommand();
      }
    }),

    setCountDelay: fnIntArg(function (ms: number) {
      return function (runNextCommand: Function) {
        COUNT_DELAY = ms;
        runNextCommand();
      }
    }),

    setCountGroupDelay: fnIntArg(function (ms: number) {
      return function (runNextCommand: Function) {
        COUNT_GROUP_DELAY = ms;
        runNextCommand();
      }
    }),

    storePhrase: function (el: HTMLElement, value: string) {
      PHRASES.push(value);
      return function(f : Function) { f() };
    },

    blink: function(this: CaptionProgram, el: HTMLElement, value: string) {
      return function (this: CaptionProgram, runNextCommand: Function) {
        let fns: Function[] = [];
        let i = 0;
        el.style.color = this.props.blinkColor;
        el.style.fontSize = this.props.blinkFontSize + "vmin";
        el.style.fontFamily = this.props.blinkFontFamily;
        el.className = "text-blink";
        value.split('/').forEach(function (this: CaptionProgram, word: string) {
          word = word.trim();
          let j = i;
          i += 1;
          fns.push(function (this: CaptionProgram) {
            const showText = this.COMMANDS.showText(el, BLINK_DURATION + ' ' + word);
            const wait = this.COMMANDS.wait(el, '' + BLINK_DELAY);
            showText(function() { wait(fns[j + 1]); });
          }.bind(this))
        }.bind(this));
        const lastWait = this.COMMANDS.wait(el, '' + BLINK_GROUP_DELAY);
        fns.push(function () {
          lastWait(runNextCommand);
        });
        fns[0]();
      }.bind(this);
    }.bind(this),

    cap: function (this: CaptionProgram, el: HTMLElement, value: string) {
      const showText = this.COMMANDS.showText(el, CAPTION_DURATION + ' ' + value);
      const wait = this.COMMANDS.wait(el, '' + CAPTION_DELAY);
      return function (this: CaptionProgram, runNextCommand: Function) {
        el.style.color = this.props.captionColor;
        el.style.fontSize = this.props.captionFontSize + "vmin";
        el.style.fontFamily = this.props.captionFontFamily;
        el.className = "text-caption";
        showText(function() { wait(runNextCommand); });
      }.bind(this)
    }.bind(this),

    bigcap: function (this: CaptionProgram, el: HTMLElement, value: string) {
      const showText = this.COMMANDS.showText(el, CAPTION_DURATION + ' ' + value);
      const wait = this.COMMANDS.wait(el, '' + CAPTION_DELAY);
      return function (this: CaptionProgram, runNextCommand: Function) {
        el.style.color = this.props.captionBigColor;
        el.style.fontSize = this.props.captionBigFontSize + "vmin";
        el.style.fontFamily = this.props.captionBigFontFamily;
        el.className = "text-caption-big";
        showText(function() { wait(runNextCommand); });
      }.bind(this)
    }.bind(this),

    count: function(this: CaptionProgram, el: HTMLElement, value: string) {
      return function (this: CaptionProgram, runNextCommand: Function) {
        let fns: Function[] = [];
        el.style.color = this.props.countColor;
        el.style.fontSize = this.props.countFontSize + "vmin";
        el.style.fontFamily = this.props.countFontFamily;
        el.className = "text-count";
        const split = value.split(" ");
        if (split.length != 2) {
          console.error("Invalid count command: "  + value);
          runNextCommand();
          return;
        }
        let number = parseInt(split[0], 10);
        const end = parseInt(split[1], 10);
        if (isNaN(number) || isNaN(end) || number < 0 || end < 0) {
          console.error("Invalid count command: "  + value);
          runNextCommand();
          return;
        }

        let values = [];
        do {
          values.push(number);
          if (number == end) {
            break;
          } else if (number < end) {
            number+=1;
          } else if (number > end) {
            number-=1;
          }
        } while (true);

        let i = 0;
        values.forEach(function (this: CaptionProgram, number: number) {
          let j = i;
          i += 1;
          fns.push(function (this: CaptionProgram) {
            const showText = this.COMMANDS.showText(el, COUNT_DURATION + ' ' + number);
            const wait = this.COMMANDS.wait(el, '' + COUNT_DELAY);
            showText(function() { wait(fns[j + 1]); });
          }.bind(this));
        }.bind(this));
        const lastWait = this.COMMANDS.wait(el, '' + COUNT_GROUP_DELAY);
        fns.push(function () {
          lastWait(runNextCommand);
        });
        fns[0]();
      }.bind(this);
    }.bind(this),
  };
}