import * as React from 'react';

export default class Library extends React.Component {
  readonly props: {
    goBack(): void,
  };

  render() {
    return (
        <div className="Library">
          <div className="u-button-row">
            <div className="u-abs-center">
                <h2 className="LibraryHeader">Library</h2>
            </div>

            <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
          </div>
        </div>
    )
  }

}