import * as React from 'react';


export default class SimpleSimpleColorPicker extends React.Component {
  readonly props: {
    label: string,
    value: string,
    isVisible: boolean,
    isEnabled: boolean,
    children?: React.ReactNode,
    onChange: (value: string) => void
  };

    render() {
        if (this.props.isVisible) {
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
        else
        return (<div/>);
    }

  onChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.onChange(e.currentTarget.value);
  }
}
