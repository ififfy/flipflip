import * as React from 'react';
import {remote} from 'electron';
import fileURL from 'file-url';
import SimpleTextInput from './SimpleTextInput';

export default class SimpleURLInput extends React.Component {
  readonly props: {
    label: string,
    value: string,
    isEnabled: boolean,
    onChange: (value: string) => void
  };

  render() {
    return (
      <SimpleTextInput
        label={this.props.label}
        value={this.props.value}
        isEnabled={this.props.isEnabled}
        onChange={this.props.onChange}>
        {" "}
        <button onClick={this.pickFile.bind(this)}>Browse files</button>
        {" "}
        <button onClick={this.paste.bind(this)}>Paste</button>
      </SimpleTextInput>
    );
  }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
  
  pickFile() {
    let result = remote.dialog.showOpenDialog({properties: ['openFile']});
    if (!result || !result.length) return;
    this.props.onChange(fileURL(result[0]));
  }

  paste() {
    (navigator as any).clipboard.readText().then((pastedText: string) => {
      this.props.onChange(pastedText);
    });
  }
}
