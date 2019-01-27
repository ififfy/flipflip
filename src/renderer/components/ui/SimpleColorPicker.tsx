import * as React from 'react';


export default class SimpleColorPicker extends React.Component {
  readonly props: {
    label: string,
    value: string,
    isEnabled: boolean,
    children?: React.ReactNode,
    onChange: (value: string) => void
  };

    render() {
            return (
                <div className="SimpleColorPicker">
                    <label>{this.props.label}</label>
                    <input
                        type="color"
                        disabled={!this.props.isEnabled}
                        value={this.props.value}
                        onChange={this.onChange.bind(this)}>
                    </input>
                    {this.props.children}
                </div>
            );
    }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
}
