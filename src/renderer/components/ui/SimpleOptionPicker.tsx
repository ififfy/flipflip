import * as React from 'react';
import en from '../../en';

export default class SimpleOptionPicker extends React.Component {
  readonly props: {
    label: string,
    value: string,
    keys: Array<string>,
    disableFirst?: boolean,
    parseKeyFunction?: (id: string) => string,
    onChange: (value: string) => void,
  };

  render() {
    return ( 
      <div className="SimpleOptionPicker">
        {this.props.label && (
          <label>{this.props.label}</label>
        )}
        <select
          value={this.props.value}
          onChange={this.onChange.bind(this)}>
          {this.props.keys.map((k, index) => {
            const text  = this.props.parseKeyFunction
              ? this.props.parseKeyFunction(k)
              : (
                en.get(k) != null ? en.get(k) : k
              );
            return <option value={k} key={k} disabled={this.props.disableFirst && index==0}>{text}</option>;
          })}
        </select>
      </div>
    );
  }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
}
