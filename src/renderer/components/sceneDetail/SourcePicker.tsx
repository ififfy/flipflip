import * as React from 'react';
import Select, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import SourceList from "./SourceList";
import LibrarySource from "../library/LibrarySource";
import Tag from "../library/Tag";
import URLModal from "../sceneDetail/URLModal";
import Modal from '../ui/Modal';
import Config from "../../data/Config";
import SimpleTextInput from "../ui/SimpleTextInput";

const Option = (props: any) => (
  <div>
    <components.Option {...props}>
      <input type="checkbox" checked={props.isSelected} onChange={() => null} />{" "}
      <label>{props.label}</label>
    </components.Option>
  </div>
);

const MultiValue = (props: any) => (
  <components.MultiValue {...props}>
    <span>{props.data.label}</span>
  </components.MultiValue>
);

type Props = {
  sources: Array<LibrarySource>,
  tags?: Array<Tag>,
  config: Config,
  isSelect: boolean,
  isBatchTag: boolean
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
  importSourcesFromLibrary?(sources: Array<LibrarySource>): void,
  onChangeTextKind?(kind: string): void,
  onChangeTextSource?(hbID: string): void,
};

export default class SourcePicker extends React.Component {
  readonly props: Props;
  readonly state = {
    removeAllIsOpen: false,
    urlImportIsOpen: false,
    batchTagIsOpen: false,
    editValue: "",
    isEditing: -1,
    filters: this.props.filters,
    selected: this.props.selected,
    searchInput: "",
    markUpdate: false,
  };

  _selectedTags: Array<any> = null;

  handleChange = (search: [{label: string, value: string}]) => {
    if (search == null) {
      this.setState({filters: []});
    } else {
      let filters = Array<string>();
      for (let s of search) {
        if (s.value.endsWith("~")) {
          filters = filters.concat(s.value);
        } else {
          filters = filters.concat(s.value.split(" "));
        }
      }
      this.setState({filters});
    }
  };
  handleInputChange = (searchInput: string) => {
    this.setState({searchInput})
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
    let markedCount = 0;
    const options = Array<{ label: string, value: string }>();
    const defaultValues = Array<{ label: string, value: string }>();
    for (let source of displaySources) {
      if (source.offline) {
        offlineCount++;
      }
      if (source.marked) {
        markedCount++;
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
    if (markedCount > 0 && !this.state.filters.includes("<Marked>")) {
      options.push({label: "<Marked> (" + markedCount + ")", value: "<Marked>"});
    }
    for (let tag of tagKeys) {
      if (!this.state.filters.includes(tag + "~")) {
        options.push({label: tag + " (" + tags.get(tag) + ")", value: tag + "~"});
      }
    }
    if (this.state.searchInput.startsWith("-")) {
      for (let tag of tagKeys) {
        if (!this.state.filters.includes(tag + "~")) {
          options.push({label: "-" + tag + " (" + tags.get(tag) + ")", value: "-" + tag + "~"});
        }
      }
    }

    let tagSelectValue = new Array<{label: string, value: string}>();
    if (this.state.batchTagIsOpen) {
      let commonTags = Array<string>();
      for (let sourceURL of this.state.selected) {
        const source = this.props.sources.find((s) => s.url === sourceURL);
        const tags = source.tags.map((t) => t.name);
        if (commonTags.length == 0) {
          commonTags = tags;
        } else {
          commonTags = commonTags.filter((t) => tags.includes(t));
        }

        if (commonTags.length == 0) break;
      }

      if (commonTags.length > 0) {
        tagSelectValue = commonTags.map((t) => {return {label: t, value: t}});
      }

      if (this._selectedTags == null) {
        this._selectedTags = tagSelectValue;
      }
    }
    return (
      <div className="SourcePicker" onKeyDown={this.secretHotkey.bind(this)} tabIndex={0}>
        <div className="SourcePicker__Buttons">
          {!this.props.onOpenLibraryImport && (
            <div className="ReactSelect SourcePicker__Search">
              <div className="m-long">({displaySources.length} Sources)</div>
              <div className="m-short">({displaySources.length})</div>
              <CreatableSelect
                className="CreatableSelect"
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
              />
            </div>
          )}
          {(this.props.isSelect || this.props.isBatchTag) && (
            <div className="SourcePicker_SelectButtons">
              {this.props.isSelect && (
                <div className={`u-button u-float-left ${this.state.selected.length > 0 ? 'u-clickable' : 'u-disabled'}`}
                     onClick={this.state.selected.length > 0 ? this.importSourcesFromLibrary.bind(this) : this.nop}>
                  Import Selected {this.state.selected.length > 0 ? "(" + this.state.selected.length + ")" : ""}
                </div>
              )}
              {this.props.isBatchTag && (
                <div className={`u-button u-float-left ${this.state.selected.length > 0 ? 'u-clickable' : 'u-disabled'}`}
                     onClick={this.state.selected.length > 0 ? this.toggleBatchTagModal.bind(this) : this.nop}>
                  Batch Tag Selection {this.state.selected.length > 0 ? "(" + this.state.selected.length + ")" : ""}
                </div>
              )}
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
          {!this.props.isSelect && !this.props.isBatchTag && (
            <div className={`u-button u-float-left ${this.props.sources.length == 0 ? 'u-disabled' : 'u-clickable'} `}
                 onClick={this.props.sources.length == 0 ? this.nop : this.toggleRemoveAllModal.bind(this)}>
              - Remove All
            </div>
          )}
        </div>

        <SourceList
          displaySources={displaySources}
          sources={this.props.sources}
          config={this.props.config}
          isSelect={this.props.isSelect || this.props.isBatchTag}
          emptyMessage={this.props.emptyMessage}
          yOffset={this.props.yOffset}
          filters={this.state.filters}
          selected={this.state.selected}
          markUpdate={this.state.markUpdate}
          onUpdateSources={this.props.onUpdateSources.bind(this)}
          addSources={this.addSources.bind(this)}
          onUpdateSelected={this.onUpdateSelected.bind(this)}
          onStartEdit={this.onStartEdit.bind(this)}
          savePosition={this.props.savePosition ? this.props.savePosition.bind(this) : null}
          onOpenLibraryImport={this.props.onOpenLibraryImport ? this.props.onOpenLibraryImport.bind(this) : null}
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
        {this.state.batchTagIsOpen && (
          <Modal onClose={this.toggleBatchTagModal.bind(this)} title="Batch Tag">
            <p>Choose the tags to be applied to the selected sources</p>
            <div className="ReactSelect SourcePicker__BatchTag">
              <Select
                defaultValue={tagSelectValue}
                options={this.props.tags.map((tag) => {return {label: tag.name, value: tag.id}})}
                components={{ Option, MultiValue }}
                isClearable
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                backspaceRemovesValue={false}
                placeholder="Tag These Sources"
                onChange={this.selectTags.bind(this)} />
            </div>
            <div className="u-button u-float-right" onClick={this.batchTagAdd.bind(this)}>
              + Add
            </div>
            <div className="u-button u-float-right" onClick={this.batchTagRemove.bind(this)}>
              - Remove
            </div>
            <div className="u-button" onClick={this.batchTagOverwrite.bind(this)}>
              Overwrite
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
    return ((this.props.isSelect !== props.isSelect) ||
      (this.props.isBatchTag !== props.isBatchTag) ||
      (this.state.markUpdate !== props.markUpdate) ||
      (this.state.removeAllIsOpen !== state.removeAllIsOpen) ||
      (this.state.urlImportIsOpen !== state.urlImportIsOpen) ||
      (this.state.batchTagIsOpen !== state.batchTagIsOpen) ||
      (this.state.isEditing !== state.isEditing) ||
      (this.state.editValue !== state.editValue) ||
      (this.state.filters !== state.filters) ||
      (this.state.selected.length !== state.selected.length) ||
      (this.state.searchInput !== state.searchInput) ||
      (this.props.sources !== props.sources));
  }

  nop() {}

  // Use alt+P to access import modal
  // Use alt+U to toggle highlighting untagged sources
  secretHotkey(e: KeyboardEvent) {
    if (e.altKey && e.key == 'p') {
      this.toggleURLImportModal();
    } else if (e.altKey && e.key == 'm') {
      this.toggleMarked();
    }
  }

  toggleMarked() {
    let taggingMode = true;
    for (let source of this.props.sources) {
      if (source.marked) {
        taggingMode = false;
      }
    }

    if (taggingMode) { // We're marking sources
      for (let source of this.getDisplaySources()) {
        source.marked = true;
      }
    } else { // We're unmarking sources
      for (let source of this.props.sources) {
        source.marked = false;
      }
    }
    this.setState({markUpdate: !this.state.markUpdate}); // Trigger update
  }

  toggleURLImportModal() {
    this.setState({urlImportIsOpen: !this.state.urlImportIsOpen});
  }

  toggleRemoveAllModal() {
    this.setState({removeAllIsOpen: !this.state.removeAllIsOpen});
  }

  toggleBatchTagModal() {
    this._selectedTags = null;
    this.setState({batchTagIsOpen: !this.state.batchTagIsOpen});
  }

  selectTags(selectedTags: [{label: string, value: string}]) {
    this._selectedTags = selectedTags;
  }

  batchTagOverwrite() {
    for (let sourceURL of this.state.selected) {
      const source = this.props.sources.find((s) => s.url === sourceURL);
      source.tags = new Array<Tag>();
      if (this._selectedTags) {
        for (let tag of this._selectedTags) {
          source.tags.push(new Tag({name: tag.label, id: tag.value}));
        }
      }
    }
    this.toggleBatchTagModal();
  }

  batchTagAdd() {
    if (this._selectedTags) {
      for (let sourceURL of this.state.selected) {
        const source = this.props.sources.find((s) => s.url === sourceURL);
        const sourceTags = source.tags.map((t) => t.name);
        for (let tag of this._selectedTags) {
          if (!sourceTags.includes(tag.label)) {
            source.tags.push(new Tag({name: tag.label, id: tag.value}));
          }
        }
      }
    }
    this.toggleBatchTagModal();
  }

  batchTagRemove() {
    if (this._selectedTags) {
      for (let sourceURL of this.state.selected) {
        const source = this.props.sources.find((s) => s.url === sourceURL);
        const sourceTags = source.tags.map((t) => t.name);
        for (let tag of this._selectedTags) {
          if (sourceTags.includes(tag.label)) {
            source.tags.splice(sourceTags.indexOf(tag.label), 1);
          }
        }
      }
    }
    this.toggleBatchTagModal();
  }

  importSourcesFromLibrary() {
    const selected = this.state.selected;
    const sources = new Array<LibrarySource>();
    for (let url of selected) {
      const source = this.props.sources.find((s) => s.url == url);
      if (source) {
        sources.push(source);
      }
    }
    this.props.importSourcesFromLibrary(sources);
  }

  removeAll() {
    this.toggleRemoveAllModal();
    this.props.onUpdateSources([]);
  }

  addSources(sources: Array<string>) {
    // dedup
    let sourceURLs = this.getSourceURLs();
    sources = sources.filter((s) => !sourceURLs.includes(s));

    let id = this.props.sources.length + 1;
    this.props.sources.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    let newLibrary = Array.from(this.props.sources);
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
    const newSelected = Array.from(this.state.selected);
    for (let source of displaySources.map((s) => s.url)) {
      if (!newSelected.includes(source)) {
        newSelected.push(source);
      }
    }
    this.setState({selected: newSelected});
  }

  onSelectNone() {
    const displaySources = this.getDisplaySources();
    let newSelected = Array.from(this.state.selected);
    for (let source of displaySources.map((s) => s.url)) {
      if (newSelected.includes(source)) {
        newSelected.splice(newSelected.indexOf(source), 1)
      }
    }
    this.setState({selected: newSelected});
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
          } else if (filter == "<Marked>") { // This is a marked filter
            matchesFilter = source.marked;
          }else if (filter == "<Untagged>") { // This is untagged filter
            matchesFilter = source.tags.length === 0;
          } else if (filter.endsWith("~")) { // This is a tag filter
            let tag = filter.substring(0, filter.length-1);
            if (tag.startsWith("-")) {
              tag = tag.substring(1, tag.length);
              matchesFilter = source.tags.find((t) => t.name == tag) == null;
            } else {
              matchesFilter = source.tags.find((t) => t.name == tag) != null;
            }
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