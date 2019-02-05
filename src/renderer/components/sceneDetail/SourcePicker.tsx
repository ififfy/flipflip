import * as React from 'react';
import Sortable from "sortablejs";
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {remote} from 'electron';

import Modal from '../ui/Modal';
import Tag from "../library/Tag";
import LibrarySource from "../library/LibrarySource";
import URLModal from "../sceneDetail/URLModal";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import {array_move, getSourceType, removeDuplicatesBy} from "../../utils";
import {SF} from "../../const";

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
    sortable: Sortable,
    filters: Array<string>(),
  };

  render() {
    let tags = Array<Tag>();
    let options = Array<{label: string, value: string}>();
    for (let source of this.props.sources) {
      for (let tag of source.tags) {
        tags.push(tag);
      }
    }
    tags = removeDuplicatesBy((t: Tag) => t.name, tags);
    tags.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });
    for (let tag of tags) {
      options.push({label: tag.name, value: tag.name})
    }

    let displaySources = [];
    const filtering = this.state.filters.length > 0;
    if (filtering) {
      for (let source of this.props.sources) {
        let matchesFilter = true;
        for (let filter of this.state.filters) {
          if (!source.tags.map((s) => s.name).includes(filter)) {
            matchesFilter = false;
            break;
          }
        }
        if (matchesFilter) {
          displaySources.push(source);
        }
      }
    } else {
      displaySources = this.props.sources;
    }

    return (
      <div className="SourcePicker"  onKeyDown={this.secretHotkey.bind(this)} tabIndex={0}>
        <div className="SourcePicker__Buttons">
          <div className="u-button u-clickable" onClick={this.onAdd.bind(this)}>+ Add local files</div>
          <div className="u-button u-clickable" onClick={this.onAddURL.bind(this)}>+ Add URL</div>
          <SimpleOptionPicker
              label=""
              value="Sort Sources"
              disableFirst={true}
              keys={["Sort Sources"].concat(Object.values(SF))}
              onChange={this.onSort.bind(this)}
          />
          {tags.length > 0 && (
            <div className="ReactMultiSelectCheckboxes">
              <ReactMultiSelectCheckboxes
                options={options}
                placeholderButtonLabel="Filter Tags"
                onChange={this.onFilter.bind(this)}
                rightAligned={true}
              />
            </div>
          )}
          <div className={`u-button u-float-left ${this.props.sources.length == 0 ? 'u-disabled' : 'u-clickable'} `}
               onClick={this.props.sources.length == 0 ? this.nop : this.toggleRemoveAllModal.bind(this)}>- Remove All</div>
        </div>

        <div id="sources" className="SourcePicker__Sources">
          {displaySources.length == 0 && (
            <div className="SourcePicker__Empty">
              {filtering ? "No results" : this.props.emptyMessage}
            </div>
          )}
          {displaySources.map((source) =>
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
    this.setState({sortable: null});
    this.initSortable();
  }

  componentDidUpdate() {
    this.initSortable();
  }

  initSortable() {
    if (!this.state.sortable && this.props.sources.length > 0) {
      let sortable = Sortable.create(document.getElementById('sources'), {
        animation: 150,
        easing: "cubic-bezier(1, 0, 0, 1)",
        onEnd: this.onEnd.bind(this),
      });
      for (let s = 0; s < this.props.sources.length; s++) {
        Sortable.create(document.getElementById('tags-' + this.props.sources[s].id), {
          animation: 150,
          easing: "cubic-bezier(1, 0, 0, 1)",
          onEnd: this.onEndTag.bind(this, this.props.sources[s].id),
        });
      }
      this.setState({sortable: sortable});
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

  onFilter(tags: Array<{label: string, value: string}>) {
    this.state.sortable.option("disabled", tags.length > 0);
    this.setState({filters: tags.map((t) => t.value)});
  }

  onSort(algorithm: string) {
    switch (algorithm) {
      case SF.alphaA:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          if (a.url < b.url) {
            return -1;
          } else if (a.url > b.url) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.alphaD:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          if (a.url > b.url) {
            return -1;
          } else if (a.url < b.url) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.dateA:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          if (a.id < b.id) {
            return -1;
          } else if (a.id > b.id) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.dateD:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          } else if (a.id < b.id) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.type:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          const aType = getSourceType(a.url);
          const bType = getSourceType(b.url);
          if (aType > bType) {
            return -1;
          } else if (aType < bType) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
    }
  }
};