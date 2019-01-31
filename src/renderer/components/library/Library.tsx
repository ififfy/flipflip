import * as React from 'react';
import {remote} from "electron";

import LibrarySource from "./LibrarySource";
import Tag from "./Tag";
import Modal from "../ui/Modal";
import URLModal from "../sceneDetail/URLModal";

export default class Library extends React.Component {
  readonly props: {
    library: Array<LibrarySource>,
    tags: Array<Tag>,
    onUpdateLibrary(sources: Array<LibrarySource>): void,
    onPlay(source: string): void,
    goBack(): void,
    manageTags(): void,
  };

  readonly state = {
    removeAllIsOpen: false,
    urlImportIsOpen: false,
    isEditing: -1,
  };

  render() {
    return (
      <div className="Library" onKeyDown={this.secretHotkey.bind(this)} tabIndex={0}>
        <div className="u-button-row">
          <div className="u-abs-center">
              <h2 className="Library__LibraryHeader">Library</h2>
          </div>

          <div className="u-button-row-right">
            <div
                className="Library__ManageTags u-button u-clickable"
                onClick={this.props.manageTags.bind(this)}>
              Manage Tags
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        </div>

        <div className="Library__Buttons">
          <div className='u-button u-clickable' onClick={this.onAdd.bind(this)}>+ Add local files</div>
          <div className='u-button u-clickable' onClick={this.onAddURL.bind(this)}>+ Add URL</div>
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
                 key={source.id}>
              {this.state.isEditing != source.id && (
                <div className="Library__SourceTitle u-clickable" onClick={this.props.onPlay.bind(this, source.url)}>
                  {source.url}
                </div>
              )}
              {this.state.isEditing == source.id && (
                <form className="Library__SourceTitle" onSubmit={this.onEdit.bind(this, -1)}>
                  <input
                      autoFocus
                      type="text"
                      value={source.url}
                      onBlur={this.onEdit.bind(this, -1)}
                      onChange={this.onEditSource.bind(this, source.id)} />
                </form>
              )}

              <div className="u-button u-destructive u-clickable"
                 onClick={this.onRemove.bind(this, source.id)}>×️</div>
              <div className="u-button u-edit u-clickable"
                 onClick={this.onEdit.bind(this, source.id)}/>
            </div>
          )}
        </div>

        {this.state.removeAllIsOpen && (
          <Modal onClose={this.toggleRemoveAllModal.bind(this)} title="Remove all?">
            <p>Are you sure you really wanna delete your library...? ಠ_ಠ</p>
            <div className="u-button u-float-right" onClick={this.removeAll.bind(this)}>
              Yea... I'm sure
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

  // Use alt+P to access import modal
  secretHotkey(e: KeyboardEvent) {
    if (e.altKey && e.key=='p') {
      this.toggleURLImportModal();
    }
  }

  onEdit(sourceID: number, e: Event) {
    e.preventDefault();
    // If user left input blank, remove it from list of sources
    // Also prevent user from inputing duplicate source
    let newLibrary = [];
    let newSources = Array<string>();
    let needsUpdate = false;
    for (let source of this.props.library) {
      if (source.url == "" || newSources.includes(source.url)) {
        needsUpdate = true;
      } else {
        newLibrary.push(source);
        newSources.push(source.url);
      }
    }
    this.setState({isEditing: sourceID});
    if (needsUpdate) { // Only update sources if we need to
      this.props.onUpdateLibrary(newLibrary);
    }
  }

  onEditSource(sourceID: number, e: React.FormEvent<HTMLInputElement>) {
    let newLibrary = this.props.library;
    for (let source of newLibrary) {
      if (source.id == sourceID) {
        source.url = e.currentTarget.value;
        break;
      }
    }
    this.props.onUpdateLibrary(newLibrary);
  }

  removeAll() {
    this.toggleRemoveAllModal();
    this.props.onUpdateLibrary([]);
  }

  onRemove(sourceID: number) {
    this.props.onUpdateLibrary(this.props.library.filter((s) => s.id != sourceID));
  }

  onAdd() {
    let result = remote.dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']});
    if (!result) return;
    this.addDirectories(result);
  }

  onAddURL() {
    this.setState({isEditing: this.props.library.length});
    this.addDirectories([""]);
  }

  addDirectories(directories: Array<string>) {
    // dedup
    let sourceURLs = this.getSourceURLs();
    directories = directories.filter((d) => !sourceURLs.includes(d));
    let newLibrary = this.props.library;
    for (let url of directories) {
      let source = new LibrarySource();
      source.url = url;
      source.id = newLibrary.length;
      newLibrary.push(source);
    }
    this.props.onUpdateLibrary(newLibrary);
  }

}