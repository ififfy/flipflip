import $ from 'jquery';
import * as React from 'react';

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
      console.log("Timeout is " + ms);
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


const startShowingText = function(el : HTMLElement, hastebinId : string) {
  if (hastebinId === 'test') {
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

  // const url = `text/${pastebinId}.txt`;
  // const url = 'https://crossorigin.me/http://pastebin.com/raw/' + pastebinId;
  // const url = 'http://cors-proxy.htmldriven.com/?url=http://pastebin.com/raw/' + hastebinId;
  // const url = 'http://cors-proxy.htmldriven.com/?url=https://hastebin.com/raw/' + hastebinId;
  // const url = 'https://cors-anywhere.herokuapp.com/https://hastebin.com/raw/' + hastebinId;
  const url = 'https://hastebin.com/raw/' + hastebinId;

  let _hasStoppedEarly = false;
  let _stop = () => {
    _hasStoppedEarly = true;
  };
  const stop = () => { _stop(); };
  $.ajax({
    url: url,
    method: 'get',
    success: function(data) {
      if (_hasStoppedEarly) return;
      try {
        JSON.parse(data.body);
        return;
      } catch (e) {
        // ok; old format
      }
      if (data.body) {
        data = data.body;
      }
      console.log(data);
      _stop = startText(el, data);
    },
    error: function(err) {
      console.error("Could not load hastebin ID", hastebinId);
      alert("Could not load your hastebin. This may or may not be temporary.");
    },
  });
  return stop;
};

export default class CaptionProgram extends React.Component {
  readonly el = React.createRef<HTMLDivElement>();

  readonly props: {
    hastebinID: string,
  };

  readonly state = {
    stopFunc: Function(),
    lastHastebinID: ""
  };

  shouldComponentUpdate(nextProps : {hastebinID : string}, nextState: any) {
    return nextProps.hastebinID !== this.props.hastebinID;
  }

  componentWillReceiveProps(nextProps : {hastebinID : string}) {
    this._update(nextProps);
  }

  componentWillUnmount() {
    PROGRAM = [];
    programCounter = 0;
    this.state.stopFunc();
  }

  _update(props: {hastebinID : string}) {
    if (!this.el.current) return;
    if (props.hastebinID == this.state.lastHastebinID) return;
    this.setState({lastHastebinID: props.hastebinID});
    this._stop();
    this.setState({stopFunc: startShowingText(this.el.current, props.hastebinID)});
  }

  _stop() {
    if (this.state.stopFunc) {
      this.state.stopFunc();
      this.setState({stopFunc: null});
    }
  }

  render() {
    return (
      <div style={{pointerEvents: 'none', display: 'table', width: '100%', height: '100%'}}
          className="u-fill-container text-display">
        <div style={{display: 'table-cell'}} ref={this.el} />
      </div>
    );
  }
}