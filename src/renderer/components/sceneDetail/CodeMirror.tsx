import * as React from "react";
import * as CodeMirrorComp from 'react-codemirror2'
import {createStyles, Theme, withStyles} from "@material-ui/core";

import ChildCallbackHack from "../player/ChildCallbackHack";
import {getTimingFromString} from "../../data/utils";

const styles = (theme: Theme) => createStyles({
  codeMirrorWrapper: {
    overflowY: 'auto',
    height: '100%',
  },
});

const actions = ["blink", "cap", "bigcap", "count", "wait"];
export const tupleSetters = ["setBlinkDuration", "setBlinkDelay", "setBlinkGroupDelay", "setCaptionDuration", "setCaptionDelay",
  "setCountDuration", "setCountDelay", "setCountGroupDelay"];
export const singleSetters = ["setBlinkWaveRate", "setBlinkBPMMulti", "setBlinkDelayWaveRate", "setBlinkDelayBPMMulti",
  "setBlinkGroupDelayWaveRate", "setBlinkGroupDelayBPMMulti", "setCaptionWaveRate", "setCaptionBPMMulti",
  "setCaptionDelayWaveRate", "setCaptionDelayBPMMulti", "setCountWaveRate", "setCountBPMMulti", "setCountDelayWaveRate",
  "setCountDelayBPMMulti", "setCountGroupDelayWaveRate", "setCountGroupDelayBPMMulti", "setBlinkY", "setCaptionY",
  "setBigCaptionY", "setCountY"];
export const stringSetters = ["setBlinkTF", "setBlinkDelayTF", "setBlinkGroupDelayTF", "setCaptionTF", "setCaptionDelayTF",
  "setCountTF", "setCountDelayTF", "setCountGroupDelayTF"];
const storers = ["storephrase", "storePhrase"];
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

    CodeMirror.registerHelper("hintWords", "flipflip", actions.concat(tupleSetters, singleSetters, stringSetters, keywords, storers));

    define('atom', tupleSetters);
    define('atom', singleSetters);
    define('atom', stringSetters);
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
        tupleSetters.includes(command) || singleSetters.includes(command))) {
        // Number parameter
        stream.eatWhile(/\d/);
        if(stream.eol() || !/\w/.test(stream.peek())) {
          state.tokens.push(stream.current());
          if (((command == "count" || tupleSetters.includes(command)) && state.tokens.length > 3) ||
            ((command == "wait" || singleSetters.includes(command)) && state.tokens.length > 2)) {
            return rt("error", state, stream);
          }
          return rt("number", state, stream);
        }
      }
      stream.eatWhile(/[\d\w-]/);
      const cur = stream.current();
      stream.eatSpace();
      if (sol && words.hasOwnProperty(cur) && !keywords.includes(cur)) {
        // Command at start of line
        state.tokens.push(cur);
        return rt(words[cur], state, stream);
      } else if (!sol && command == "blink" && (keywords.includes(cur) || /^\$\d$/.exec(cur) != null)) {
        // Keyword in blink command
        state.tokens.push(cur);
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
        state.tokens.push(cur);
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
        state.tokens.push(cur);
        if (command == "blink" && cur == "/") {
          return rt("operator", state, stream);
        } else if (command == "count" || command == "wait"
          || tupleSetters.includes(command) || singleSetters.includes(command)) {
          return rt("error", state, stream);
        } else if (stringSetters.includes(command)) {
          const tf = getTimingFromString(cur);
          return rt(tf == null ? "error" : "variable", state, stream);
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

class CodeMirror extends React.Component {
  readonly props: {
    classes: any,
    onGutterClick(editor: any, clickedLine: number): void
    onUpdateScript(text: string): void,
    addHack?: ChildCallbackHack,
    overwriteHack?: ChildCallbackHack,
  }

  readonly state = {
    scriptText: "",
    cursor: {line: 0, ch: 0},
  }


  render() {
    const classes = this.props.classes;

    return (
      <CodeMirrorComp.Controlled
        className={classes.codeMirrorWrapper}
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
      this.onUpdateScript(value, editor);
    }
  }

  onCursorActivity(editor: any) {
    this.setState({cursor: editor.getDoc().getCursor()});
  }

  onUpdateScript(scriptText: any, editor?: any) {
    if (editor) {
      this.setState({scriptText: scriptText, cursor: editor.getDoc().getCursor()});
    } else {
      this.setState({scriptText: scriptText});
    }
    clearTimeout(this._sendUpdate);
    this._sendUpdate = setTimeout(this.props.onUpdateScript.bind(this, this.state.scriptText), 500);
  }
}

export default withStyles(styles)(CodeMirror as any);