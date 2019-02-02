import * as React from 'react';
import en from '../../en';

export default class SimpleOptionPicker extends React.Component {
  readonly props: {
    label: string,
    value: string,
    keys: Array<string>,
    getLabel?: (id: string) => string,
    onChange: (value: string) => void,
  };

  render() {
    return ( 
      <div className="SimpleOptionPicker">
        <label>{this.props.label}</label>
        <select
          value={this.props.value}
          onChange={this.onChange.bind(this)}>
          {this.props.keys.map((k) => {
            const label  = this.props.getLabel
              ? this.props.getLabel(k)
              : (
                en.get(k) != null ? en.get(k) : k
              );
            return <option value={k} key={k}>{label}</option>;
          })}
        </select>
      </div>
    );
  }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
}
