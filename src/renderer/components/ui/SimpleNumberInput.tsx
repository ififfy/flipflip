import * as React from 'react';

export default class SimpleNumberInput extends React.Component {
  readonly props: {
    label: string,
    min?: number,
    max?: number,
    value: number,
    isEnabled: boolean,
    onChange: (value: string) => void
  };

  render() {
    return (
      <div className="SimpleNumberInput">
        <label>{this.props.label}</label>
        <input
          disabled={!this.props.isEnabled}
          type="number"
          min={this.props.min}
          max={this.props.max}
          value={this.props.value}
          onChange={this.onChange.bind(this)}>
        </input>
      </div>
    );
  }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    if (e.currentTarget.value == "") {
      this.props.onChange(e.currentTarget.value);
    } else {
      const value = parseInt(e.currentTarget.value);
      if ((this.props.min == null || value >= this.props.min) && (this.props.max == null || value <= this.props.max)) {
        this.props.onChange(e.currentTarget.value);
      }
    }
  }
}
