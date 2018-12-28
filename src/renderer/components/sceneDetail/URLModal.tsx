import * as React from 'react'
import Modal from "../ui/Modal";
import GooninatorImporter from './GooninatorImporter';
import { TabbedSections } from '../ui/TabbedSections';
import SimpleURLInput from '../ui/SimpleURLInput';

class ImageURLListImporter extends React.Component {
  readonly props: {
    directories: Array<string>,
    onDidImport(): void,
    onChangeDirectories(directories: Array<string>): void,
    onChangeTextKind(kind: string) : void,
    onChangeTextSource(hbID: string) : void,
  };

  state = {
    url: "",
  }

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
    this.props.onChangeDirectories(this.props.directories.concat([this.state.url]))
    this.props.onDidImport();
  }
}

export default class URLModal extends React.Component {
  readonly props: {
    directories: Array<string>,
    onClose(): void,
    onChangeDirectories(directories: Array<string>): void,
    onChangeTextKind(kind: string) : void,
    onChangeTextSource(hbID: string) : void,
  };

  render() {
    return (
      <Modal onClose={this.props.onClose} title="Import URL">
        <TabbedSections
          style={{maxWidth: '100%', width: '300px', minHeight: '220px'}}
          titles={['Image URL list', 'Gooninator']}
          renderChildren={() => [
              <ImageURLListImporter
                directories={this.props.directories}
                onDidImport={this.props.onClose}
                onChangeDirectories={this.props.onChangeDirectories}
                onChangeTextKind={this.props.onChangeTextKind}
                onChangeTextSource={this.props.onChangeTextSource} />,

              <GooninatorImporter
                directories={this.props.directories}
                onDidImport={this.props.onClose}
                onChangeDirectories={this.props.onChangeDirectories}
                onChangeTextKind={this.props.onChangeTextKind}
                onChangeTextSource={this.props.onChangeTextSource} />,
            ]}
          />
      </Modal>
    );
  }
}

