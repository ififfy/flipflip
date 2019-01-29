import * as React from 'react';
import LibrarySource from "./LibrarySource";
import {remote} from "electron";
import Modal from "../ui/Modal";
import URLModal from "../sceneDetail/URLModal";

export default class Library extends React.Component {
  readonly props: {
    library: Array<LibrarySource>,
    onUpdateLibrary(sources: Array<LibrarySource>): void,
    goBack(): void,
  };

  readonly state = {
    removeAllIsOpen: false,
    urlImportIsOpen: false,
  };

  render() {
    return (
      <div className="Library">
        <div className="u-button-row">
          <div className="u-abs-center">
              <h2 className="Library__LibraryHeader">Library</h2>
          </div>

          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        </div>

        <div className="Library__Buttons">
          <div className='u-button u-clickable' onClick={this.onAdd.bind(this)}>+ Add local files</div>
          <div className='u-button u-clickable' onClick={this.toggleURLImportModal.bind(this)}>+ Import URL</div>
          <div className={`u-button u-float-left ${this.props.library.length == 0 ? 'u-disabled' : 'u-clickable'} `}
               onClick={this.props.library.length == 0 ? this.nop : this.toggleRemoveAllModal.bind(this)}>- Remove All</div>
        </div>

        <div className="Library__Sources">
          {this.props.library.length == 0 && (
            <div className="Library__Empty">
              You haven't added anything to the Library yet.
            </div>
          )}
          {this.props.library.map((source) =>
            <div className="Library__Source"
                 key={(source.id as any) as number}>
              {source.url}
              <div className="u-button u-destructive u-clickable"
                   onClick={this.onRemove.bind(this, source.url)}>×️</div>
            </div>
          )}
        </div>

        {this.state.removeAllIsOpen && (
          <Modal onClose={this.toggleRemoveAllModal.bind(this)} title="Remove all?">
            <p>Are you sure you want to remove everything from this scene?</p>
            <div className="u-button u-float-right" onClick={this.removeAll.bind(this)}>
              OK
            </div>
          </Modal>
        )}
        {this.state.urlImportIsOpen && (
          <URLModal
            onClose={this.toggleURLImportModal.bind(this)}
            addDirectories={this.addDirectories.bind(this)}
            onChangeTextKind={this.nop}
            onChangeTextSource={this.nop} />
        )}
      </div>
    )
  }

  nop() {}

  getSourceURLs() {
    let sourceURLs = [];
    for (let source of this.props.library) {
      sourceURLs.push(source.url);
    }
    return sourceURLs;
  }

  toggleRemoveAllModal() {
    this.setState({removeAllIsOpen: !this.state.removeAllIsOpen});
  };

  toggleURLImportModal() {
    this.setState({urlImportIsOpen: !this.state.urlImportIsOpen});
  }

  removeAll() {
    this.toggleRemoveAllModal();
    this.props.onUpdateLibrary([]);
  }

  onRemove(sourceURL: string) {
    this.props.onUpdateLibrary(this.props.library.filter((s) => s.url != sourceURL));
  }

  onAdd() {
    let result = remote.dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']});
    if (!result) return;
    this.addDirectories(result);
  }

  addDirectories(directories: Array<string>) {
    // dedup
    let sourceURLs = this.getSourceURLs();
    directories = directories.filter((d) => !sourceURLs.includes(d));
    let newLibrary = this.props.library;
    for (let url of directories) {
      let source = new LibrarySource();
      source.setURL(url);
      newLibrary.push(source);
    }
    this.props.onUpdateLibrary(newLibrary);
  }

}