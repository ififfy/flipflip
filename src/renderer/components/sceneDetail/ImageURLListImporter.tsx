import * as React from 'react'
import SimpleURLInput from '../ui/SimpleURLInput';

export default class ImageURLListImporter extends React.Component {
  readonly props: {
    onDidImport(): void,
    addDirectories(directories: Array<string>): void,
  };

  state = {
    url: "",
  };

  render() {
    return (
      <div className="ImageURLListImporter">
        <SimpleURLInput
          label="URL to a raw text file containing image URLs on separate lines"
          isEnabled={true}
          value={this.state.url}
          onChange={(value) => this.setState({url: value})} />
        <br />
        <div style={{clear: 'both'}} />
        <div className="u-button u-float-right" onClick={this.import.bind(this)}>OK</div>
        <div style={{clear: 'both'}} />
      </div>
    );
  }

  import() {
    if (this.state.url) {
      this.props.addDirectories([this.state.url])
    }
    this.props.onDidImport();
  }
}
