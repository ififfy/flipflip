import * as React from 'react';
import * as ReactDOM from 'react-dom';
import en from '../en';


export default class SimpleOptionPicker extends React.Component {
  readonly props: {
    label: string,
    value: string,
    keys: Array<string>
    onChange: (value: string) => void
  }

  render() {
    return ( 
      <div className="SimpleOptionPicker">
        <label>{this.props.label}</label>
        <select
          value={this.props.value}
          onChange={this.onChange.bind(this)}>
          {this.props.keys.map((k) => <option value={k} key={k}>{en.get(k) != null ? en.get(k) : k}</option>)}
        </select>
      </div>
    );
  }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
}
