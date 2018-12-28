import * as React from 'react'
import Modal from "../ui/Modal";
import GooninatorImporter from './GooninatorImporter';
import ImageURLListImporter from './ImageURLListImporter';
import { TabbedSections } from '../ui/TabbedSections';

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

