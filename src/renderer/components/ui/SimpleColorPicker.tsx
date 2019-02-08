import * as React from 'react';

export default class SimpleColorPicker extends React.Component {
  readonly props: {
    label: string,
    value: string,
    onChange: (value: string) => void
  };

  render() {
    return (
      <div className="SimpleColorPicker">
        <label>{this.props.label}</label>
        <input
          type="color"
          value={this.props.value}
          onChange={this.onChange.bind(this)}>
        </input>
      </div>
    );
  }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
}
