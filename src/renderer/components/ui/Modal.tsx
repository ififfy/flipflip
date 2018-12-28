import React from 'react';

export default class Modal extends React.Component {
  readonly props: {
    title: string,
    onClose(): void,
    children?: React.ReactNode,
  };

  render() {
    return (
      <div className="Modal">
        <div className="Modal__Inner">
          <div className="Modal__Bar__Container">
            <div className="Modal__Bar">
              <div className="Modal__Bar__Close" onClick={this.props.onClose} />
              <div className="Modal__Bar__Title">{this.props.title}</div>
              <div style={{clear: 'both'}} />
            </div>
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }
};