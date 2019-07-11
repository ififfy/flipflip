import * as React from 'react';

export default class SimpleTextInput extends React.Component {
  readonly props: {
    label: string,
    value: string,
    isEnabled: boolean,
    autofocus?: boolean
    isPassword?: boolean,
    children?: React.ReactNode,
    onKeyDown?(e: any): void,
    onChange(value: string): void
  };

  render() {
    return (
      <div className="SimpleTextInput">
        <label>{this.props.label}</label>
        <input
          autoFocus={this.props.autofocus}
          type={this.props.isPassword ? "password" : " text"}
          disabled={!this.props.isEnabled}
          value={this.props.value}
          onFocus={this.props.autofocus ? this.handleFocus : this.nop}
          onKeyDown={this.props.onKeyDown ? this.props.onKeyDown.bind(this) : this.nop}
          onChange={this.onChange.bind(this)}>
        </input>
        {this.props.children}
      </div>
    );
  }

  nop() {}

  handleFocus(e: any): void {
    e.target.select();
  }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
}
