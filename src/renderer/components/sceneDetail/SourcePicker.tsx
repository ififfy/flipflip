import {remote} from 'electron';
import * as React from 'react';
import Sortable from "sortablejs";
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

import {SF} from "../../const";
import {arrayMove, getFileGroup, getSourceType} from "../../utils";
import LibrarySource from "../library/LibrarySource";
import Tag from "../library/Tag";
import URLModal from "../sceneDetail/URLModal";
import Modal from '../ui/Modal';
import SimpleOptionPicker from "../ui/SimpleOptionPicker";

type Props = {
  sources: Array<LibrarySource>,
  isSelect: boolean,
  emptyMessage: string,
  removeAllMessage: string,
  removeAllConfirm: string,
  yOffset: number,
  filters: Array<string>,
  onUpdateSources(sources: Array<LibrarySource>): void,
  onClick?(source: LibrarySource, yOffset: number, filters: Array<string>): void,
  onOpenLibraryImport?(): void,
  importSourcesFromLibrary?(sources: Array<string>): void,
  onChangeTextKind?(kind: string): void,
  onChangeTextSource?(hbID: string): void,
};

export default class SourcePicker extends React.Component {
  readonly props: Props;
  readonly state = {
    removeAllIsOpen: false,
    urlImportIsOpen: false,
    isEditing: -1,
    sortable: Sortable,
    filters: this.props.filters,
    selected: Array<string>(),
  };

  render() {
    const filtering = this.state.filters.length > 0;
    const displaySources = this.getDisplaySources();
    const tags = new Map<string, number>();
    let untaggedCount = 0;
    const options = Array<{ label: string, value: string }>();
    const defaultValues = Array<{ label: string, value: string }>();
    for (let source of displaySources) {
      if (source.tags.length > 0) {
        for (let tag of source.tags) {
          if (tags.has(tag.name)) {
            tags.set(tag.name, tags.get(tag.name) + 1);
          } else {
            tags.set(tag.name, 1);
          }
        }
      } else {
        untaggedCount += 1;
      }
    }
    const tagKeys = Array.from(tags.keys()).sort((a, b) => {
      const aCount = tags.get(a);
      const bCount = tags.get(b);
      if (aCount > bCount) {
        return -1;
      } else if (aCount < bCount) {
        return 1;
      } else {
        return 0;
      }
    });
    for (let filter of this.state.filters) {
      if (filter == null) {
        options.push({label: "<Untagged> (" + untaggedCount + ")", value: null});
        defaultValues.push({label: "<Untagged> (" + untaggedCount + ")", value: null});
      } else {
        options.push({label: filter + " (" + tags.get(filter) + ")", value: filter});
        defaultValues.push({label: filter + " (" + tags.get(filter) + ")", value: filter});
      }
    }

    if (untaggedCount > 0 && !this.state.filters.includes(null)) {
      options.push({label: "<Untagged> (" + untaggedCount + ")", value: null});
    }
    for (let tag of tagKeys) {
      if (!this.state.filters.includes(tag)) {
        options.push({label: tag + " (" + tags.get(tag) + ")", value: tag});
      }
    }

    return (
      <div className="SourcePicker" onKeyDown={this.secretHotkey.bind(this)} tabIndex={0}>
        <div className="SourcePicker__Buttons">
          {!this.props.isSelect && (
            <div className="SourcePicker__AddButtons">
              <div className={`u-button ${this.state.filters.length > 0 ? 'u-disabled' : 'u-clickable'}`} onClick={this.state.filters.length > 0 ? this.nop : this.onAdd.bind(this)}>+ Add local files</div>
              <div className={`u-button ${this.state.filters.length > 0 ? 'u-disabled' : 'u-clickable'}`} onClick={this.state.filters.length > 0 ? this.nop : this.onAddURL.bind(this)}>+ Add URL</div>
              {this.props.onOpenLibraryImport && (
                <div className="u-button u-clickable" onClick={this.props.onOpenLibraryImport.bind(this)}>+ Add From
                  Library</div>
              )}
            </div>
          )}
          <SimpleOptionPicker
            label=""
            value="Sort Sources"
            disableFirst={true}
            keys={["Sort Sources"].concat(Object.values(SF))}
            onChange={this.onSort.bind(this)}
          />
          {options.length > 0 && !this.props.onOpenLibraryImport && (
            <div className="ReactMultiSelectCheckboxes">
              <ReactMultiSelectCheckboxes
                value={defaultValues}
                options={options}
                placeholderButtonLabel="Filter Tags"
                onChange={this.onFilter.bind(this)}
                rightAligned={true}
              />
            </div>
          )}
          {this.props.isSelect && (
            <div className="SourcePicker_SelectButtons">
              <div className={`u-button u-float-left ${this.state.selected.length > 0 ? 'u-clickable' : 'u-disabled'}`}
                   onClick={this.state.selected.length > 0 ? this.props.importSourcesFromLibrary.bind(this, this.state.selected) : this.nop}>
                Import Selected {this.state.selected.length > 0 ? "(" + this.state.selected.length + ")" : ""}
              </div>
              <div className="SourcePicker_SelectAllNone">
                <a href="#" onClick={this.onSelectAll.bind(this)}>
                  Select All
                </a>
                <a href="#" onClick={this.onSelectNone.bind(this)}>
                  Select None
                </a>
              </div>
            </div>
          )}
          {!this.props.isSelect && (
            <div className={`u-button u-float-left ${this.props.sources.length == 0 ? 'u-disabled' : 'u-clickable'} `}
                 onClick={this.props.sources.length == 0 ? this.nop : this.toggleRemoveAllModal.bind(this)}>
              - Remove All
            </div>
          )}
        </div>

        <div id="sources" className={`SourcePicker__Sources ${this.props.isSelect ? 'm-select' : ''}`}>
          {displaySources.length == 0 && (
            <div className="SourcePicker__Empty">
              {filtering ? "No results" : this.props.emptyMessage}
            </div>
          )}
          {displaySources.map((source) =>
            <div className={`SourcePicker__Source ${source.offline ? 'm-offline' : ''}`}
                 key={source.id}>
              {this.props.isSelect && (
                <input type="checkbox" value={source.url} onChange={this.onSelect.bind(this)}
                       checked={this.state.selected.includes(source.url)}/>
              )}
              {this.state.isEditing != source.id && (
                <div className="SourcePicker__SourceTitle u-clickable"
                     onClick={this.props.onClick ? this.onClick.bind(this, source) : this.onEdit.bind(this, source.id)}>
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
                    onChange={this.onEditSource.bind(this, source.id)}/>
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
                   onClick={this.onRemove.bind(this, source.id)}>×️
              </div>
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
            onChangeTextKind={this.props.onChangeTextKind ? this.props.onChangeTextKind.bind(this) : this.nop}
            onChangeTextSource={this.props.onChangeTextSource ? this.props.onChangeTextSource.bind(this) : this.nop}/>
        )}
      </div>
    )
  }

  onClick(source: LibrarySource) {
    this.props.onClick(source, document.getElementById("sources").scrollTop, this.state.filters);
  }

  onEnd(evt: any) {
    let newSources = this.props.sources;
    arrayMove(newSources, evt.oldIndex, evt.newIndex);
    this.props.onUpdateSources(newSources);
  }

  componentDidMount() {
    this.setState({sortable: null});
    this.initSortable();
    document.getElementById("sources").scrollTo(0, this.props.yOffset);
  }

  componentDidUpdate() {
    this.initSortable();
  }

  initSortable() {
    if (!this.state.sortable && this.props.sources.length > 0) {
      this.setState({sortable:
        Sortable.create(document.getElementById('sources'), {
          animation: 150,
          easing: "cubic-bezier(1, 0, 0, 1)",
          onEnd: this.onEnd.bind(this),
        })
      });
    }
  }

  // Use alt+P to access import modal
  secretHotkey(e: KeyboardEvent) {
    if (e.altKey && e.key == 'p') {
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
  }

  onEdit(sourceID: number, e: Event) {
    e.preventDefault();
    this.setState({isEditing: sourceID});
    // If user left input blank, remove it from list of sources
    // Also prevent user from inputing duplicate source
    // If new entry is a duplicate, make sure we remove the new entry
    const newSources = Array<LibrarySource>();
    for (let source of this.props.sources) {
      if (source.url != "") {
        if (!newSources.map((s) => s.url).includes(source.url)) {
          newSources.push(source);
        } else {
          for (let existingSource of newSources) {
            if (existingSource.url == source.url) {
              if (existingSource.id > source.id) {
                newSources[newSources.indexOf(existingSource)] = source;
              }
              break;
            }
          }
        }
      }
    }
    this.props.onUpdateSources(newSources);
  }

  onEditSource(sourceID: number, e: React.FormEvent<HTMLInputElement>) {
    this.props.onUpdateSources(this.props.sources.map(
      function map(source: LibrarySource) {
        if (source.id == sourceID) {
          source.offline = false;
          source.lastCheck = null;
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
    let result = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory', 'multiSelections']});
    if (!result) return;
    this.addSources(result);
  }

  onAddURL() {
    let id = this.props.sources.length + 1;
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

    let id = this.props.sources.length + 1;
    this.props.sources.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    let newLibrary = this.props.sources;
    for (let url of sources) {
      newLibrary.unshift(new LibrarySource({
        url: url,
        id: id,
        tags: new Array<Tag>(),
      }));
      id += 1;
    }
    this.props.onUpdateSources(newLibrary);
  }

  onSelect(event: any) {
    const source = event.currentTarget.value;
    const newSelected = this.state.selected;
    if (newSelected.includes(source)) {
      newSelected.splice(newSelected.indexOf(source), 1)
    } else {
      newSelected.push(source);
    }
    this.setState({selected: newSelected});
  }

  onSelectAll() {
    const displaySources = this.getDisplaySources();
    const newSelected = this.state.selected;
    for (let source of displaySources.map((s) => s.url)) {
      if (!newSelected.includes(source)) {
        newSelected.push(source);
      }
    }
    this.setState({selected: newSelected});
  }

  onSelectNone() {
    const displaySources = this.getDisplaySources();
    const newSelected = this.state.selected;
    for (let source of displaySources.map((s) => s.url)) {
      if (newSelected.includes(source)) {
        newSelected.splice(newSelected.indexOf(source), 1)
      }
    }
    this.setState({selected: newSelected});
  }

  onFilter(tags: Array<{ label: string, value: string }>) {
    this.state.sortable.option("disabled", tags.length > 0);
    this.setState({filters: tags.map((t) => t.value)});
  }

  onSort(algorithm: string) {
    switch (algorithm) {
      case SF.alphaA:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          const aName = getFileGroup(a.url).toLowerCase();
          const bName = getFileGroup(b.url).toLowerCase();
          if (aName < bName) {
            return -1;
          } else if (aName > bName) {
            return 1;
          } else {
            const aType = getSourceType(a.url);
            const bType = getSourceType(b.url);
            if (aType > bType) {
              return -1;
            } else if (aType < bType) {
              return 1;
            } else {
              return 0;
            }
          }
        }));
        break;
      case SF.alphaD:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          const aName = getFileGroup(a.url).toLowerCase();
          const bName = getFileGroup(b.url).toLowerCase();
          if (aName > bName) {
            return -1;
          } else if (aName < bName) {
            return 1;
          } else {
            const aType = getSourceType(a.url);
            const bType = getSourceType(b.url);
            if (aType > bType) {
              return -1;
            } else if (aType < bType) {
              return 1;
            } else {
              return 0;
            }
          }
        }));
        break;
      case SF.alphaFullA:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          const aUrl = a.url.toLowerCase();
          const bUrl = b.url.toLocaleLowerCase();
          if (aUrl < bUrl) {
            return -1;
          } else if (aUrl > bUrl) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.alphaFullD:
        this.props.onUpdateSources(this.props.sources.sort((a, b) => {
          const aUrl = a.url.toLowerCase();
          const bUrl = b.url.toLocaleLowerCase();
          if (aUrl > bUrl) {
            return -1;
          } else if (aUrl < bUrl) {
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

  getDisplaySources() {
    let displaySources = [];
    const untagged = this.state.filters.length == 1 && this.state.filters[0] == null;
    const filtering = this.state.filters.length > 0;
    if (filtering) {
      for (let source of this.props.sources) {
        let matchesFilter = true;
        if (untagged) {
          if (source.tags.length > 0) {
            matchesFilter = false;
          }
        } else {
          for (let filter of this.state.filters) {
            if (!source.tags.map((s) => s.name).includes(filter)) {
              matchesFilter = false;
              break;
            }
          }
        }
        if (matchesFilter) {
          displaySources.push(source);
        }
      }
    } else {
      displaySources = this.props.sources;
    }
    return displaySources;
  }
};