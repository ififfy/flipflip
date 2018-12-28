import * as React from 'react';
import { triggerAsyncId } from 'async_hooks';

class TabContent extends React.Component {
  readonly props: {
    isActive: boolean,
    children?: React.ReactNode,
  }

  render() {
    return (
      <div className={`TabContent ${this.props.isActive ? '' : 'm-hidden'}`}>
        {this.props.children}
      </div>
    );
  }
}

class Tab extends React.Component {
  readonly props: {
    isActive: boolean,
    title: string,
    onClick(): void,
  }

  render() {
    return (
      <div className={`Tab ${this.props.isActive ? 'm-active' : 'm-inactive'}`} onClick={this.props.onClick}>
        {this.props.title}
      </div>
    );
  }
}

class TabBar extends React.Component {
  readonly props: {
    titles: string[],
    activeIndex: number,
    onChangeActiveIndex(i: number): void,
  }

  render() {
    return (
      <div className="TabBar">
        {this.props.titles.map((t, i) => {
          return <Tab
            key={i}
            isActive={i === this.props.activeIndex}
            title={t}
            onClick={() => this.props.onChangeActiveIndex(i)} />;
        })}
      </div>
    );
  }
}

export class TabbedSections extends React.Component {
  readonly props: {
    style: any,
    titles: Array<string>,
    renderChildren: () => React.ReactNode[],
  }

  readonly state = {
    activeIndex: 0,
  }

  render() {
    return (
      <div className="TabbedSections" style={this.props.style}>
        <TabBar
          titles={this.props.titles}
          activeIndex={this.state.activeIndex}
          onChangeActiveIndex={this.changeActiveIndex.bind(this)} />
        <div className="TabbedSections__Content">
          {this.props.renderChildren().map((child, i) => {
            return (
              <TabContent key={i} isActive={i === this.state.activeIndex} children={child} />
            );
          })}
        </div>
      </div>
    );
  }

  changeActiveIndex(i: number) {
    this.setState({activeIndex: i});
  }
}
