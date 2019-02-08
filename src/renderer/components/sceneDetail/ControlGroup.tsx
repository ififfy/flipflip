import * as React from "react";

export default class ControlGroup extends React.Component {
  readonly props: {
    title: string,
    isNarrow: boolean,
    children: React.ReactNode,
  };

  render() {
    return (
      <form
        className={`ControlGroup ${this.props.isNarrow ? 'm-narrow' : 'm-wide'}`}
        onSubmit={this.preventDefault.bind(this)}>
        <div className="ControlGroup__Title">{this.props.title}</div>
        {this.props.children}
      </form>
    );
  }

  preventDefault(e: Event) {
    e.preventDefault();
    return;
  }
}