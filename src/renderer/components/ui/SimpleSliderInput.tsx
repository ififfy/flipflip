import * as React from 'react';

export default class SimpleSliderInput extends React.Component {
  readonly props: {
    label: string,
    min: number,
    max: number,
    value: number,
    isEnabled: boolean,
    onChange: (value: string) => void
  };

  render() {
    return (
      <div className="SimpleSliderInput">
        <label>{this.props.label}</label>
        <input
          disabled={!this.props.isEnabled}
          type="range"
          min={this.props.min}
          max={this.props.max}
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
