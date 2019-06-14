import {remote} from 'electron';
import * as React from 'react';
import CreatableSelect from 'react-select/creatable';

import {SF} from "../../data/const";
import {getFileGroup, getSourceType} from "../../data/utils";
import SourceList from "./SourceList";
import LibrarySource from "../library/LibrarySource";
import Tag from "../library/Tag";
import URLModal from "../sceneDetail/URLModal";
import Modal from '../ui/Modal';
import Config from "../../data/Config";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleTextInput from "../ui/SimpleTextInput";

type Props = {
  sources: Array<LibrarySource>,
  config: Config,
  isSelect: boolean,
  emptyMessage: string,
  removeAllMessage: string,
  removeAllConfirm: string,
  yOffset: number,
  filters: Array<string>,
  selected: Array<string>,
  onUpdateSources(sources: Array<LibrarySource>): void,
  onPlay?(source: LibrarySource): void,
  savePosition?(yOffset: number, filters: Array<string>, selected: Array<string>): void,
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
    editValue: "",
    isEditing: -1,
    filters: this.props.filters,
    selected: this.props.selected,
    searchInput: "",
    forceUpdate: false,
  };

  handleChange = (search: [{label: string, value: string}]) => {
    if (search == null) {
      this.setState({filters: []});
    } else {
      this.setState({filters: search.map((s) => s.value)});
    }
  };
  handleInputChange = (searchInput: string) => {
    this.setState({searchInput})
  };
  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.state.searchInput) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        this.setState({
          searchInput: "",
          filters: this.state.filters.concat(this.state.searchInput.split(" ")),
        });
        event.preventDefault();
    }
  };
  confirmEdit = (event: KeyboardEvent) => {
    if (event.key == 'Enter') {
      this.onSaveEdit();
    }
  };

  render() {
    const displaySources = this.getDisplaySources();
    const tags = new Map<string, number>();
    let untaggedCount = 0;
    let offlineCount = 0;
    const options = Array<{ label: string, value: string }>();
    const defaultValues = Array<{ label: string, value: string }>();
    for (let source of displaySources) {
      if (source.offline) {
        offlineCount++;
      }

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
      let opt;
      if (filter.endsWith("~")) { // This is a tag filter
        opt = {label: filter.substring(0, filter.length-1) + " (Tag)", value: filter};
      } else {
        opt = {label: filter, value: filter};
      }
      options.push(opt);
      defaultValues.push(opt);
    }

    if (untaggedCount > 0 && !this.state.filters.includes("<Untagged>")) {
      options.push({label: "<Untagged> (" + untaggedCount + ")", value: "<Untagged>"});
    }
    if (offlineCount > 0 && !this.state.filters.includes("<Offline>")) {
      options.push({label: "<Offline> (" + offlineCount + ")", value: "<Offline>"});
    }
    for (let tag of tagKeys) {
      if (!this.state.filters.includes(tag + "~")) {
        options.push({label: tag + " (" + tags.get(tag) + ")", value: tag + "~"});
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
                <div className="u-button u-clickable" onClick={this.props.onOpenLibraryImport.bind(this)}>+ Add From Library</div>
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
          {!this.props.onOpenLibraryImport && (
            <div className="ReactSelect SourcePicker__Search">
              <div>({displaySources.length} Sources)</div>
              <CreatableSelect
                components={{DropdownIndicator: null,}}
                value={defaultValues}
                options={options}
                inputValue={this.state.searchInput}
                isClearable
                isMulti
                rightAligned={true}
                placeholder="Search ..."
                formatCreateLabel={(input: string) => "Search for " + input}
                onChange={this.handleChange}
                onInputChange={this.handleInputChange}
                onKeyDown={this.handleKeyDown}
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

        <SourceList
          sources={displaySources}
          config={this.props.config}
          forceUpdate={this.state.forceUpdate}
          isSelect={this.props.isSelect}
          emptyMessage={this.props.emptyMessage}
          yOffset={this.props.yOffset}
          filters={this.state.filters}
          selected={this.state.selected}
          onUpdateSources={this.props.onUpdateSources.bind(this)}
          onUpdateSelected={this.onUpdateSelected.bind(this)}
          onStartEdit={this.onStartEdit.bind(this)}
          savePosition={this.props.savePosition ? this.props.savePosition.bind(this) : null}
          onOpenLibraryImport={this.props.onOpenLibraryImport ? this.props.onOpenLibraryImport.bind(this) : null}
          importSourcesFromLibrary={this.props.importSourcesFromLibrary? this.props.importSourcesFromLibrary.bind(this) : null}
          onPlay={this.props.onPlay ? this.props.onPlay.bind(this) : null} />

        {this.state.removeAllIsOpen && (
          <Modal onClose={this.toggleRemoveAllModal.bind(this)} title="Remove all?">
            <p>{this.props.removeAllMessage}</p>
            <div className="u-button u-float-right" onClick={this.removeAll.bind(this)}>
              {this.props.removeAllConfirm}
            </div>
          </Modal>
        )}
        {this.state.isEditing !== -1 && (
          <Modal onClose={this.onEndEdit.bind(this)} title="Edit Source">
            <SimpleTextInput
              label="Source URL"
              value={this.state.editValue}
              isEnabled={true}
              onChange={this.onEdit.bind(this)}
              onKeyDown={this.confirmEdit.bind(this)}
              autofocus={true}
            />
            <div className="u-button u-float-right" onClick={this.onSaveEdit.bind(this)}>
              Confirm
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

  shouldComponentUpdate(props: any, state: any): boolean {
    return (state.forceUpdate ||
      (this.props.isSelect !== props.isSelect) ||
      (this.state.removeAllIsOpen !== state.removeAllIsOpen) ||
      (this.state.urlImportIsOpen !== state.urlImportIsOpen) ||
      (this.state.isEditing !== state.isEditing) ||
      (this.state.editValue !== state.editValue) ||
      (this.state.filters !== state.filters) ||
      (this.state.selected.length !== state.selected.length) ||
      (this.state.searchInput !== state.searchInput) ||
      (this.props.sources !== props.sources));
  }

  componentDidUpdate(prevProps: any, prevState: any): void {
    if (prevState.forceUpdate) {
      this.setState({forceUpdate: false});
    }
  }

  nop() {}

  // Use alt+P to access import modal
  // Use alt+U to toggle highlighting untagged sources
  secretHotkey(e: KeyboardEvent) {
    if (e.altKey && e.key == 'p') {
      this.toggleURLImportModal();
    } else if (e.altKey && e.key == 'u') {
      this.toggleUntagged();
    }
  }

  toggleUntagged() {
    let taggingMode = true;
    for (let source of this.props.sources) {
      if (source.untagged) {
        taggingMode = false;
      }
    }

    if (taggingMode) { // We're marking untagged sources
      for (let source of this.props.sources) {
        if (source.tags.length === 0) {
          source.untagged = true;
        }
      }
    } else { // We're unmarking sources
      for (let source of this.props.sources) {
        source.untagged = false;
      }
    }
    this.setState({}); // Trigger update
  }

  toggleURLImportModal() {
    this.setState({urlImportIsOpen: !this.state.urlImportIsOpen});
  }

  toggleRemoveAllModal() {
    this.setState({
      removeAllIsOpen: !this.state.removeAllIsOpen
    });
  }

  removeAll() {
    this.toggleRemoveAllModal();
    this.props.onUpdateSources([]);
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

  getSourceURLs() {
    return this.props.sources.map((s) => s.url);
  }

  onStartEdit(isEditing: number) {
    this.setState({
      isEditing: isEditing,
      editValue: this.props.sources.find((s) => s.id == isEditing).url,
    });
  }

  onEdit(editValue: string) {
    this.setState({editValue});
  }

  onSaveEdit() {
    // If user left input blank, remove it from list of sources
    // Also prevent user from inputing duplicate source
    // If new entry is a duplicate, make sure we remove the new entry
    const newURL = this.state.editValue;
    if (newURL == "" || this.getSourceURLs().includes(newURL)) {
      this.props.onUpdateSources(this.props.sources.filter((s) => s.id != this.state.isEditing));
    } else {
      this.props.onUpdateSources(this.props.sources.map((source: LibrarySource) => {
        if (source.id == this.state.isEditing) {
          source.offline = false;
          source.lastCheck = null;
          source.url = this.state.editValue;
        }
        return source;
      }));
    }
    this.onEndEdit();
  }

  onEndEdit() {
    this.setState({isEditing: -1, editValue: ""});
  }

  onUpdateSelected(selected: Array<string>) {
    this.setState({selected});
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
    this.setState({forceUpdate: true});
  }

  getDisplaySources() {
    let displaySources = [];
    const filtering = this.state.filters.length > 0;
    if (filtering) {
      for (let source of this.props.sources) {
        let matchesFilter = true;
        for (let filter of this.state.filters) {
          if (filter == "<Offline>") { // This is offline filter
            matchesFilter = source.offline;
          } else if (filter == "<Untagged>") { // This is untagged filter
            matchesFilter = source.tags.length === 0;
          } else if (filter.endsWith("~")) { // This is a tag filter
            const tag = filter.substring(0, filter.length-1);
            matchesFilter = source.tags.find((t) => t.name == tag) != null;
          } else { // This is a search filter
            filter = filter.replace("\\", "\\\\");
            if (filter.startsWith("-")) {
              filter = filter.substring(1, filter.length);
              const regex = new RegExp(filter, "i");
              matchesFilter = !regex.test(source.url);
            } else {
              const regex = new RegExp(filter, "i");
              matchesFilter = regex.test(source.url);
            }
          }
          if (!matchesFilter) break;
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