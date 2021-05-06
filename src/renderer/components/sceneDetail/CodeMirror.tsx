import * as React from "react";
import * as CodeMirrorComp from 'react-codemirror2'

import {getTimingFromString} from "../../data/utils";
import ChildCallbackHack from "../player/ChildCallbackHack";

const actions = ["blink", "cap", "bigcap", "count", "wait", "playAudio", "advance"];
export const tupleSetters = ["setBlinkDuration", "setBlinkDelay", "setBlinkGroupDelay", "setCaptionDuration", "setCaptionDelay",
  "setCountDuration", "setCountDelay", "setCountGroupDelay"];
export const singleSetters = ["setBlinkWaveRate", "setBlinkBPMMulti", "setBlinkDelayWaveRate", "setBlinkDelayBPMMulti",
  "setBlinkGroupDelayWaveRate", "setBlinkGroupDelayBPMMulti", "setBlinkOpacity", "setBlinkX", "setBlinkY",
  "setCaptionWaveRate", "setCaptionBPMMulti", "setCaptionDelayWaveRate", "setCaptionDelayBPMMulti", "setCaptionOpacity",
  "setCaptionX", "setCaptionY", "setBigCaptionX", "setBigCaptionY", "setCountWaveRate", "setCountBPMMulti",
  "setCountDelayWaveRate", "setCountDelayBPMMulti", "setCountGroupDelayWaveRate", "setCountGroupDelayBPMMulti",
  "setCountOpacity", "setCountX", "setCountY", "setCountProgressScale"];
export const stringSetters = ["setBlinkTF", "setBlinkDelayTF", "setBlinkGroupDelayTF", "setCaptionTF", "setCaptionDelayTF",
  "setCountTF", "setCountDelayTF", "setCountGroupDelayTF"];
export const booleanSetters = ["setShowCountProgress", "setCountProgressOffset", "setCountColorMatch"];
export const colorSetters = ["setCountProgressColor"]
const storers = ["storephrase", "storePhrase", "storeAudio"];
const keywords = ["$RANDOM_PHRASE", "$TAG_PHRASE"];
export const timestampRegex = /^((\d?\d:)?\d?\d:\d\d(\.\d\d?\d?)?|\d?\d(\.\d\d?\d?)?)$/;

(function(mod) {
  mod(require("codemirror/lib/codemirror"));
})(function(CodeMirror: any) {
  CodeMirror.defineMode('flipflip', function() {

    let words: any = {};
    function define(style: any, dict: any) {
      for(let i = 0; i < dict.length; i++) {
        words[dict[i]] = style;
      }
    }

    CodeMirror.registerHelper("hintWords", "flipflip", actions.concat(tupleSetters, singleSetters, stringSetters, booleanSetters, colorSetters, keywords, storers));

    define('atom', tupleSetters);
    define('atom', singleSetters);
    define('atom', stringSetters);
    define('atom', booleanSetters);
    define('atom', colorSetters);
    define('variable', keywords);
    define('variable-3', storers);
    define('builtin', actions);

    function parse(stream: any, state: any) {
      if (stream.eatSpace()) return rt(null, state, stream);

      let sol = stream.sol();
      const ch = stream.next();

      if (ch === '#' && sol) {
        stream.skipToEnd();
        return "comment";
      }

      let command = null;
      let timestamp = false;

      if (state.tokens.length > 0) {
        if (timestampRegex.exec(state.tokens[0]) != null) {
          timestamp = true;
          if (state.tokens.length > 1) {
            command = state.tokens[1];
          } else {
            sol = true;
          }
        } else {
          command = state.tokens[0];
        }
      }

      if (ch === "/" && command == "blink") {
        state.tokens.push(ch);
        return rt("operator", state, stream);
      }
      if (ch === "\\" && !stream.eol() && /n/.test(stream.peek()) && !sol && (command == "blink" || command == "cap" || command == "bigcap")) {
        stream.next();
        state.tokens.push(ch);
        return rt("operator", state, stream);
      }

      if (ch === "$" && command != null && command.toLowerCase() == "storephrase") {
        stream.next();
        if(stream.eol() || /\s/.test(stream.peek())) {
          state.tokens.push(stream.current());
          return rt("number", state, stream);
        }
      }

      if (/\d/.test(ch) && sol && !timestamp) {
        // Timestamp
        stream.eatWhile(/[\d:.]/);
        if(stream.eol() || !/\w/.test(stream.peek())) {
          const timestamp = stream.current();
          state.tokens.push(timestamp);
          if (timestampRegex.exec(timestamp) != null) {
            return rt("number", state, stream);
          } else {
            return rt("error", state, stream);
          }
        }
      }

      if (/[-\d]/.test(ch) && (command == "count" || command == "wait" ||
        tupleSetters.includes(command) || singleSetters.includes(command) || colorSetters.includes(command) ||
        (command == "playAudio" && state.tokens.length == (timestamp ? 3 : 2)))) {
        // Number parameter
        stream.eatWhile(/\d/);
        if(stream.eol() || !/\w/.test(stream.peek())) {
          const cur = stream.current();
          state.tokens.push(cur);
          if (command == "playAudio" && (cur > 100 || cur < 0)) {
            return rt("error", state, stream);
          } else if (((command == "count" || command == "playAudio" || tupleSetters.includes(command)) && state.tokens.length > (timestamp ? 4 : 3)) ||
            ((command == "wait" || singleSetters.includes(command)) && state.tokens.length > (timestamp ? 3 : 2))) {
            return rt("error", state, stream);
          }
          return rt("number", state, stream);
        }
      }

      if (command == "storeAudio" && state.tokens.length == (timestamp ? 2 : 1)) {
        if (ch == "'") {
          stream.eatWhile(/[^']/);
          if (stream.eol() || !/'/.test(stream.peek())) {
            return rt("error", state, stream);
          }
          stream.next();
        } else if (ch == "\"") {
          stream.eatWhile(/[^"]/);
          if (stream.eol() || !/"/.test(stream.peek())) {
            return rt("error", state, stream);
          }
          stream.next();
        } else {
          stream.eatWhile(/[\d\w-]/);
        }
      } else {
        stream.eatWhile(/[\d\w-]/);
      }
      const cur = stream.current();
      stream.eatSpace();
      state.tokens.push(cur);

      if (command == "advance") {
        return rt("error", state, stream);
      } else if (sol && words.hasOwnProperty(cur) && !keywords.includes(cur)) {
        // Command at start of line
        return rt(words[cur], state, stream);
      } else if (!sol && command == "blink" && (keywords.includes(cur) || /^\$\d$/.exec(cur) != null)) {
        // Keyword in blink command
        if ((state.tokens.length == (timestamp ? 3 : 2) || state.tokens[state.tokens.length - 2] == "/") && (stream.eol() || /\//.test(stream.peek()))) {
          if (cur == "$RANDOM_PHRASE" && !state.storedPhrases.has(0)) {
            return rt("error", state, stream);
          } else {
            const registerRegex = /^\$(\d)$/.exec(cur);
            if (registerRegex != null) {
              if (!state.storedPhrases.has(parseInt(registerRegex[1]))) {
                return rt("error", state, stream);
              } else {
                return rt("variable", state, stream);
              }
            }
          }
          return rt(words[cur], state, stream);
        } else {
          return rt("string", state, stream);
        }
      } else if (!sol && (command == "cap" || command == "bigcap") && (keywords.includes(cur) || /^\$\d$/.exec(cur) != null)) {
        // Keyword in a cap or bigcap command
        if (state.tokens.length == (timestamp ? 3 : 2) && stream.eol()) {
          if (cur == "$RANDOM_PHRASE" && !state.storedPhrases.has(0)) {
            return rt("error", state, stream);
          } else {
            const registerRegex = /^\$(\d)$/.exec(cur);
            if (registerRegex != null) {
              if (!state.storedPhrases.has(parseInt(registerRegex[1]))) {
                return rt("error", state, stream);
              } else {
                return rt("variable", state, stream);
              }
            }
          }
          return rt(words[cur], state, stream);
        } else {
          return rt("string", state, stream);
        }
      } else if (!sol && state.tokens.length > 0) {
        // String Parameter
        if (command == "blink" && cur == "/") {
          return rt("operator", state, stream);
        } else if (command == "count" || command == "wait"
          || tupleSetters.includes(command) || singleSetters.includes(command)) {
          return rt("error", state, stream);
        } else if (stringSetters.includes(command)) {
          const tf = getTimingFromString(cur);
          return rt(tf == null ? "error" : "variable", state, stream);
        } else if (booleanSetters.includes(command)) {
          if (cur.toLowerCase() == "true" ||
              cur.toLowerCase() == "t" ||
              cur.toLowerCase() == "false" ||
              cur.toLowerCase() == "f") {
            return rt("number", state, stream);
          } else {
            return rt("error", state, stream);
          }
        } else if (colorSetters.includes(command)) {
          const colorRegex = /^#([a-f0-9]{3}){1,2}$/i.exec(cur);
          if (colorRegex != null) {
            return rt("variable-3", state, stream);
          } else {
            return rt("error", state, stream);
          }
        } else if (command == "playAudio" && state.tokens.length > (timestamp ? 3 : 2)) {
          return rt("error", state, stream);
        } else if (command == "storeAudio" && state.tokens.length > (timestamp ? 4 : 3)) {
          return rt("error", state, stream);
        }
        return rt("string", state, stream);
      } else {
        return rt("error", state, stream);
      }
    }

    function rt(type: string, state: any, stream: any) {
      if (stream.eol()) {
        if (state.tokens.length > 0 && state.tokens[0].toLowerCase() == "storephrase") {
          const registerRegex = /^\$(\d)$/.exec(state.tokens[1]);
          if (registerRegex != null) {
            if (state.tokens.length > 1) {
              state.storedPhrases.set(parseInt(registerRegex[1]), true);
              state.storedPhrases.set(0, true);
            }
          } else {
            state.storedPhrases.set(0, true);
          }
        }
        state.tokens = new Array<string>();
      }
      return type;
    }

    return {
      startState: function() {return {tokens: new Array<string>(), storedPhrases: new Map<number, boolean>()};},
      token: function(stream: any, state: any) {
        return parse(stream, state);
      },
    };
  });
});

export default class CodeMirror extends React.Component {
  readonly props: {
    onGutterClick(editor: any, clickedLine: number): void
    onUpdateScript(text: string, changed?: boolean): void,
    addHack?: ChildCallbackHack,
    className?: string,
    overwriteHack?: ChildCallbackHack,
  }

  readonly state = {
    scriptText: "",
    cursor: {line: 0, ch: 0},
  }

  render() {
    return (
      <CodeMirrorComp.Controlled
        className={this.props.className}
        value={this.state.scriptText}
        autoScroll={false}
        options={{
          mode: 'flipflip',
          theme: 'material',
          lineNumbers: true,
          lineWrapping: true,
          viewportMargin: Infinity,
        }}
        onBeforeChange={this.onBeforeChangeScript.bind(this)}
        onCursorActivity={this.onCursorActivity.bind(this)}
        onGutterClick={this.props.onGutterClick}
      />
    );
  }

  componentDidMount() {
    if (this.props.addHack) {
      this.props.addHack.listener = (args) => {
        let string: string = args[0];
        const newLine: boolean = args[1];
        let newValue = "";
        if (newLine == true) {
          const lines = this.state.scriptText.split('\n');
          for (let l = 0; l < lines.length; l++) {
            if (l == this.state.cursor.line + 1) {
              if (lines[l].length > 0) {
                newValue += "\n";
              }
              newValue += string + "\n" + lines[l];
            } else if (l == lines.length - 1) {
              newValue += "\n" + lines[l] + "\n" + string;
            } else {
              newValue += "\n" + lines[l];
            }
          }
        } else {
          const lines = this.state.scriptText.split('\n');
          for (let l = 0; l < lines.length; l++) {
            if (l == this.state.cursor.line) {
              let newLine = lines[l];
              newLine = newLine.slice(0, this.state.cursor.ch) + string + newLine.slice(this.state.cursor.ch);
              newValue += "\n" + newLine;
            } else {
              newValue += "\n" + lines[l];
            }
          }
        }
        newValue = newValue.trim();
        this.onUpdateScript(newValue);
      }
    }

    if (this.props.overwriteHack) {
      this.props.overwriteHack.listener = (args) => {
        this.onUpdateScript(args[0]);
      }
    }
  }

  componentWillUnmount() {
    if (this.props.addHack) {
      this.props.addHack.listener = null;
    }
    if (this.props.overwriteHack) {
      this.props.overwriteHack.listener = null;
    }
  }

  _sendUpdate: NodeJS.Timeout = null;
  onBeforeChangeScript(editor: any, data: any, value: any)  {
    if (this.state.scriptText != value) {
      this.onUpdateScript(value, editor, true);
    }
  }

  onCursorActivity(editor: any) {
    this.setState({cursor: editor.getDoc().getCursor()});
  }

  onUpdateScript(scriptText: any, editor?: any, changed = false) {
    if (editor) {
      this.setState({scriptText: scriptText, cursor: editor.getDoc().getCursor()});
    } else {
      this.setState({scriptText: scriptText});
    }
    clearTimeout(this._sendUpdate);
    this._sendUpdate = setTimeout(this.props.onUpdateScript.bind(this, scriptText, changed), 500);
  }
}

(CodeMirror as any).displayName="CodeMirror";