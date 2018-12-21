import React from 'react';

export default class Modal extends React.Component {
  readonly props: {
    onClose(): void,
    show: boolean,
    children: JSX.Element[]
  };

  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    return (
      <div className="backdrop" style={{position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 50}}>
        <div className="modal" style={{backgroundColor: '#fff',
          borderRadius: 5,
          maxWidth: 500,
          minHeight: 300,
          margin: '0 auto',
          padding: 30,
          color: 'black'}}>
          {this.props.children}

          <button onClick={this.props.onClose} style={{float: 'right'}}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
};