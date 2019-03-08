import * as React from "react";

export default class ControlGroup extends React.Component {
  readonly props: {
    title: string,
    isNarrow: boolean,
    canCollapse?: boolean, // Default true
    startCollapsed?: boolean, // Default false
    bold?: boolean, // Default false
    children: React.ReactNode,
  };

  readonly state = {
    collapsed: false,
  };

  render() {
    const canCollapse = this.props.canCollapse != null ? this.props.canCollapse : true;
    const bold = this.props.bold != null ? this.props.bold : false;
    return (
      <form
        className={`ControlGroup ${this.props.isNarrow ? 'm-narrow' : 'm-wide'} ${bold ? 'm-bold' : ''}`}
        onSubmit={this.preventDefault.bind(this)}>
        <div className={`ControlGroup__Title ${canCollapse ? 'm-can-collapse' : ''} ${bold ? 'm-bold' : ''}`}
             onClick={canCollapse ? this.toggleCollapse.bind(this) : this.nop}>{this.props.title}</div>
        {!this.state.collapsed && (
          this.props.children
        )}
      </form>
    );
  }

  nop() {}

  preventDefault(e: Event) {
    e.preventDefault();
    return;
  }

  componentDidMount() {
    if ((this.props.canCollapse == null || this.props.canCollapse ) && this.props.startCollapsed != null && this.props.startCollapsed) {
      this.setState({collapsed: true});
    }
  }

  toggleCollapse() {
    this.setState({collapsed: !this.state.collapsed});
  }
}