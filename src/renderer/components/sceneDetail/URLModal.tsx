import * as React from 'react'
import Modal from "../ui/Modal";
import GooninatorImporter from './GooninatorImporter';
import ImageURLListImporter from './ImageURLListImporter';
import { TabbedSections } from '../ui/TabbedSections';

export default class URLModal extends React.Component {
  readonly props: {
    onClose(): void,
    addDirectories(directories: Array<string>): void,
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
                onDidImport={this.props.onClose}
                addDirectories={this.props.addDirectories} />,

              <GooninatorImporter
                onDidImport={this.props.onClose}
                addDirectories={this.props.addDirectories}
                onChangeTextKind={this.props.onChangeTextKind}
                onChangeTextSource={this.props.onChangeTextSource} />,
            ]}
          />
      </Modal>
    );
  }
}

