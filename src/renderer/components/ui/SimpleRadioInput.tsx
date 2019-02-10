import * as React from 'react';

import en from "../../en";

export default class SimpleRadioInput extends React.Component {
  readonly props: {
    label: string,
    groupName: string,
    value: string,
    keys: Array<string>,
    onChange: (value: string) => void
  };

  render() {
    return (
      <div className="SimpleRadioInput">
        <label>{this.props.label}</label>
        {this.props.keys.map((k) =>
          <span className="SimpleRadioInput__Choice" key={this.props.groupName + "-" + k}>
            <input
              type="radio"
              name={this.props.groupName}
              value={k}
              checked={this.props.value == k}
              onChange={this.onChange.bind(this)}>
            </input>
            <span onClick={this.props.onChange.bind(this, k)}>
              {en.get(k) != null ? en.get(k) : k}
            </span>
          </span>
        )}
      </div>
    );
  }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
}
