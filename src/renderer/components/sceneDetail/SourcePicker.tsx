import * as React from 'react';
import Sortable from "sortablejs";
import {remote} from 'electron';

import Modal from '../ui/Modal';
import Tag from "../library/Tag";
import LibrarySource from "../library/LibrarySource";
import URLModal from "../sceneDetail/URLModal";
import {array_move, removeDuplicatesBy} from "../../utils";

type Props = {
  sources: Array<LibrarySource>,
  emptyMessage: string,
  removeAllMessage: string,
  removeAllConfirm: string,
  onUpdateSources(sources: Array<LibrarySource>): void,
  onClick?(source: LibrarySource): void,
};

export default class SourcePicker extends React.Component {
  readonly props: Props;
  readonly state = {
    removeAllIsOpen: false,
    urlImportIsOpen: false,
    isEditing: -1,
  };

  render() {
    return (
      <div className="SourcePicker"  onKeyDown={this.secretHotkey.bind(this)} tabIndex={0}>
        <div className="SourcePicker__Buttons">
          <div className="u-button u-clickable" onClick={this.onAdd.bind(this)}>+ Add local files</div>
          <div className="u-button u-clickable" onClick={this.onAddURL.bind(this)}>+ Add URL</div>
          <div className={`u-button u-float-left ${this.props.sources.length == 0 ? 'u-disabled' : 'u-clickable'} `}
               onClick={this.props.sources.length == 0 ? this.nop : this.toggleRemoveAllModal.bind(this)}>- Remove All</div>
        </div>

        <div id="sources" className="SourcePicker__Sources">
          {this.props.sources.length == 0 && (
            <div className="SourcePicker__Empty">
              {this.props.emptyMessage}
            </div>
          )}
          {this.props.sources.map((source) =>
            <div className="SourcePicker__Source"
                 key={source.id}>
              {this.state.isEditing != source.id && (
                <div className="SourcePicker__SourceTitle u-clickable" onClick={this.props.onClick ? this.props.onClick.bind(this, source) : this.onEdit.bind(this, source.id)}>
                  {source.url}
                </div>
              )}
              {this.state.isEditing == source.id && (
                <form className="SourcePicker__SourceTitle" onSubmit={this.onEdit.bind(this, -1)}>
                  <input
                    autoFocus
                    type="text"
                    value={source.url}
                    onBlur={this.onEdit.bind(this, -1)}
                    onChange={this.onEditSource.bind(this, source.id)} />
                </form>
              )}
              {source.tags && (
                <div id={`tags-${source.id}`} className="SourcePicker__SourceTags">
                  {source.tags.map((tag) =>
                    <span className="SourcePicker__SourceTag" key={tag.id}>{tag.name}</span>
                  )}
                </div>
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
            <p>{this.props.removeAllMessage}</p>
            <div className="u-button u-float-right" onClick={this.removeAll.bind(this)}>
              {this.props.removeAllConfirm}
            </div>
          </Modal>
        )}
        {this.state.urlImportIsOpen && (
          <URLModal
            onClose={this.toggleURLImportModal.bind(this)}
            addSources={this.addSources.bind(this)}
            onChangeTextKind={this.nop}
            onChangeTextSource={this.nop} />
        )}
      </div>
    )
  }

  onEnd(evt: any) {
    let newSources = this.props.sources;
    array_move(newSources, evt.oldIndex, evt.newIndex);
    this.props.onUpdateSources(newSources);
  }

  onEndTag(sourceID: number, evt: any) {
    let newSources = this.props.sources;
    for (let source of newSources) {
      if (source.id==sourceID) {
        array_move(source.tags, evt.oldIndex, evt.newIndex);
      }
    }
    this.props.onUpdateSources(newSources);
  }

  componentDidMount() {
    if (this.props.sources.length == 0) return;
    Sortable.create(document.getElementById('sources'), {
      animation: 150,
      easing: "cubic-bezier(1, 0, 0, 1)",
      onEnd: this.onEnd.bind(this),
    });
    for (let s=0; s<this.props.sources.length; s++) {
      Sortable.create(document.getElementById('tags-' + this.props.sources[s].id), {
        animation: 150,
        easing: "cubic-bezier(1, 0, 0, 1)",
        onEnd: this.onEndTag.bind(this, this.props.sources[s].id),
      });
    }
  }

  // Use alt+P to access import modal
  secretHotkey(e: KeyboardEvent) {
    if (e.altKey && e.key=='p') {
      this.toggleURLImportModal();
    }
  }

  nop() {}

  getSourceURLs() {
    return this.props.sources.map((s) => s.url);
  }

  toggleURLImportModal() {
    this.setState({urlImportIsOpen: !this.state.urlImportIsOpen});
  }

  toggleRemoveAllModal() {
    this.setState({
      removeAllIsOpen: !this.state.removeAllIsOpen
    });
  };

  onEdit(sourceID: number, e: Event) {
    e.preventDefault();
    this.setState({isEditing: sourceID});
    // If user left input blank, remove it from list of sources
    // Also prevent user from inputing duplicate source
    this.props.onUpdateSources(
        removeDuplicatesBy((s: LibrarySource) => s.url,
            this.props.sources.filter((s) => s.url != "")));
  }

  onEditSource(sourceID: number, e: React.FormEvent<HTMLInputElement>) {
    this.props.onUpdateSources(this.props.sources.map(
      function map(source: LibrarySource) {
        if (source.id == sourceID) {
          source.url = e.currentTarget.value;
        }
        return source;
      })
    );
  }

  removeAll() {
    this.toggleRemoveAllModal();
    this.props.onUpdateSources([]);
  }

  onRemove(sourceID: number) {
    this.props.onUpdateSources(this.props.sources.filter((s) => s.id != sourceID));
  }

  onAdd() {
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(),{properties: ['openDirectory', 'multiSelections']});
    if (!result) return;
    this.addSources(result);
  }

  onAddURL() {
    let id= this.props.sources.length + 1;
    this.props.sources.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });
    this.setState({isEditing: id});

    let newLibrary = this.props.sources;
    newLibrary.unshift(new LibrarySource({
      url: "",
      id: id,
      tags: new Array<Tag>(),
    }));
    this.props.onUpdateSources(newLibrary);
  }

  addSources(sources: Array<string>) {
    // dedup
    let sourceURLs = this.getSourceURLs();
    sources = sources.filter((s) => !sourceURLs.includes(s));

    let id= this.props.sources.length + 1;
    this.props.sources.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    let newLibrary = this.props.sources;
    for (let url of sources) {
      newLibrary.push(new LibrarySource({
        url: url,
        id: id,
        tags: new Array<Tag>(),
      }));
      id+=1;
    }
    this.props.onUpdateSources(newLibrary);
  }
};