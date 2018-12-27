import wretch from 'wretch';
import * as React from 'react';
import {TK} from '../const';

let STYLES : {[style : string] : string} = {};

let programCounter = 0;
let PROGRAM : Function[] = [];
let BLINK_DURATION = 200;
let BLINK_DELAY = 80;
let BLINK_GROUP_DELAY = 1200;
let CAPTION_DURATION = 2000;
let CAPTION_DELAY = 1200;
let PHRASES : string[] = [];

const splitFirstWord = function(s : string) {
  const firstSpaceIndex = s.indexOf(" ");
  if (firstSpaceIndex > 0 && firstSpaceIndex < s.length - 1) {
    const first = s.substring(0, firstSpaceIndex);
    const rest = s.substring(firstSpaceIndex + 1);
    return [first, rest];
  } else {
    return [null, null];
  }
};

const getFirstWord = function(s : string) {
  return splitFirstWord(s)[0];
};

const getRest = function(s : string) {
  return splitFirstWord(s)[1];
};

const fnIntArg = function(innerFn : Function) {
  return function(el : HTMLElement, value : string) {
    const ms = parseInt(value, 10);
    if (isNaN(ms)) { return null; }
    return innerFn(ms);
  };
};

const getRandomIndex = (list : any[]) => {
  return Math.floor(Math.random()*list.length)
};

const getRandomListItem = (list : any[]) => {
  return list[getRandomIndex(list)];
};


const COMMANDS : { [command : string] : (el: HTMLElement, value : string) => any;} = {
  saveStyleRules: function(el : HTMLElement, value : string) {
    const firstWord = getFirstWord(value);
    const style = getRest(value);
    if (!firstWord || !style) { return null; }

    STYLES[firstWord] = STYLES[firstWord] || '';
    STYLES[firstWord] += style;

    return function(f : Function) { f() };
  },

  applySavedStyle: function(el : HTMLElement, value : string) {
    return function(runNextCommand : Function) {
      el.style.cssText = STYLES[value];
      runNextCommand();
    }
  },

  showText: function(el : HTMLElement, value : string) {
    let textString = getRest(value);
    const msString = getFirstWord(value);
    const ms = parseInt(msString, 10);
    if (!textString || isNaN(ms)) { return null; }

    if (textString === '$RANDOM_PHRASE') {
      textString = getRandomListItem(PHRASES);
    }

    return function(runNextCommand : Function) {
      el.style.opacity = '1.0';
      el.innerHTML = textString;
      setTimeout(function() {
        el.style.opacity = '0.0';
        runNextCommand();
      }, ms);
    }
  },

  wait: fnIntArg(function(ms : number) {
    return function(runNextCommand : Function) { setTimeout(runNextCommand, ms); }
  }),

  setBlinkDuration: fnIntArg(function(ms : number) {
    return function(runNextCommand : Function) {
      BLINK_DURATION = ms;
      runNextCommand();
    }
  }),

  setBlinkDelay: fnIntArg(function(ms : number) {
    return function(runNextCommand : Function) {
      BLINK_DELAY = ms;
      runNextCommand();
    }
  }),

  setBlinkGroupDelay: fnIntArg(function(ms : number) {
    return function(runNextCommand : Function) {
      BLINK_GROUP_DELAY = ms;
      runNextCommand();
    }
  }),

  setCaptionDuration: fnIntArg(function(ms : number) {
    return function(runNextCommand : Function) {
      CAPTION_DURATION = ms;
      runNextCommand();
    }
  }),

  setCaptionDelay: fnIntArg(function(ms : number) {
    return function(runNextCommand : Function) {
      CAPTION_DELAY = ms;
      runNextCommand();
    }
  }),

  storePhrase: function(el : HTMLElement, value : string) {
    PHRASES.push(value);
    return function(f : Function) { f() };
  },

  blink: function(el : HTMLElement, value : string) {
    return function(runNextCommand : Function) {
      let fns : Function[] = [];
      let i = 0;
      el.className = "text-blink";
      value.split('/').forEach(function(word) {
        word = word.trim();
        let j = i;
        i += 1;
        fns.push(function() {
          const showText = COMMANDS.showText(el, BLINK_DURATION + ' ' + word);
          const wait = COMMANDS.wait(el, '' + BLINK_DELAY);
          showText(function() { wait(fns[j + 1]); });
        })
      });
      const lastWait = COMMANDS.wait(el, '' + BLINK_GROUP_DELAY);
      fns.push(function() {
        lastWait(runNextCommand);
      });
      fns[0]();
    }
  },

  cap: function(el : HTMLElement, value : string) {
    const showText = COMMANDS.showText(el, CAPTION_DURATION + ' ' + value);
    const wait = COMMANDS.wait(el, '' + CAPTION_DELAY);
    return function(runNextCommand : Function) {
      el.className = "text-caption";
      showText(function() { wait(runNextCommand); });
    }
  },

  bigcap: function(el : HTMLElement, value : string) {
    const showText = COMMANDS.showText(el, CAPTION_DURATION + ' ' + value);
    const wait = COMMANDS.wait(el, '' + CAPTION_DELAY);
    return function(runNextCommand : Function) {
      el.className = "text-caption-big";
      showText(function() { wait(runNextCommand); });
    }
  }
};

const run = function(getHasStopped : Function) {
  if (getHasStopped()) {
    return;
  }
  PROGRAM[programCounter](function() {
    programCounter += 1;
    if (programCounter >= PROGRAM.length) {
      programCounter = 0;
    }
    run(getHasStopped);
  })
};


const startText = function(el : HTMLElement, programText : string) {
  let i = -1;
  let hasError = false;
  let hasStopped = false;
  const getHasStopped = () => { return hasStopped; };

  programText.split('\n').forEach(function(line) {
    line = line.trim();
    i += 1;
    if (line.length < 1) return;

    if (line[0] === '#') {
      return;
    }
    const command = getFirstWord(line);
    if (command) {
      const value = getRest(line);
      if (COMMANDS[command]) {
        const fn = COMMANDS[command](el, value);
        if (fn) {
          if (command.toLowerCase().startsWith("set")) {
            fn(getHasStopped);
          } else {
            PROGRAM.push(fn);
          }
        } else {
          hasError = true;
          console.error("Error on line", i, "- invalid arguments");
        }
      } else {
        hasError = true;
        console.error("Error on line", i, "- unknown command");
      }
    }
  });

  if (!hasError) {
    run(getHasStopped);
  }
  return () => { hasStopped = true; };
};


const startShowingText = function(el : HTMLElement, url : string) {
  if (url === 'test') {
    let testProgram = `
    setBlinkDuration 300
    setBlinkDelay 100
    setBlinkGroupDelay 1200
    setCaptionDuration 2000
    setCaptionDelay 1200

    bigcap YOU LOVE FLUFFY KITTENS
    blink KITTENS / ARE / YOUR / LIFE
    cap Cuddle all the kittens forever because you love them.
    `;
    return startText(el, testProgram);
  }

  let _hasStoppedEarly = false;
  let _stop = () => {
    _hasStoppedEarly = true;
  };
  const stop = () => { _stop(); };
  wretch(url)
    .get()
    .text(data => {
      if (_hasStoppedEarly) return;
      if (localStorage.debugText) {
        console.log(data);
      }
      _stop = startText(el, data);
    });
  return stop;
};

export default class CaptionProgram extends React.Component {
  readonly el = React.createRef<HTMLDivElement>();

  readonly props: {
    url: string,
  };

  readonly state = {
    stopFunc: Function(),
    lastURL: ""
  };

  shouldComponentUpdate(nextProps : {url : string}, nextState: any) {
    return nextProps.url !== this.props.url;
  }

  componentWillReceiveProps(nextProps : {url : string}) {
    this._update(nextProps);
  }

  componentWillUnmount() {
    PROGRAM = [];
    programCounter = 0;
    this.state.stopFunc();
  }

  _update(props: {url : string}) {
    if (!this.el.current) return;
    if (props.url == this.state.lastURL) return;
    this.setState({lastURL: props.url});
    this._stop();
    this.setState({stopFunc: startShowingText(this.el.current, props.url)});
  }

  _stop() {
    if (this.state.stopFunc) {
      this.state.stopFunc();
      this.setState({stopFunc: null});
    }
  }

  render() {
    return (
      <div className="CaptionProgram u-fill-container"><div ref={this.el} /></div>
    );
  }
}