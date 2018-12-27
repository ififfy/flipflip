import React from 'react';

export default class Modal extends React.Component {
  readonly props: {
    onClose(): void,
    children: JSX.Element[]
  };

  render() {
    return (
      <div className="Modal">
        <div className="Modal__Inner">
          {this.props.children}
          <button className="Modal__Close" onClick={this.props.onClose}>Cancel</button>
        </div>
      </div>
    );
  }
};