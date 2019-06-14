import * as React from "react";
import rimraf from "rimraf";
import Sortable from "sortablejs";

import {arrayMove, getCachePath, getSourceType} from "../../data/utils";
import {ST} from "../../data/const";
import LibrarySource from "../library/LibrarySource";
import Config from "../../data/Config";

export default class SourceList extends React.Component {
  readonly props: {
    sources: Array<LibrarySource>,
    config: Config,
    forceUpdate: boolean,
    isSelect: boolean,
    emptyMessage: string,
    yOffset: number,
    filters: Array<string>,
    selected: Array<string>,
    onUpdateSources(sources: Array<LibrarySource>): void,
    onUpdateSelected(selected: Array<string>): void,
    onStartEdit(isEditing: number): void,
    savePosition?(yOffset: number, filters: Array<string>, selected: Array<string>): void,
    onPlay?(source: LibrarySource): void,
  };

  readonly state = {
    isEditing: -1,
    sortable: Sortable,
  };

  render() {
    const filtering = this.props.filters.length > 0;
    return (
      <div id="sources" className={`SourceList__Sources ${this.props.isSelect ? 'm-select' : ''}`}>
        {this.props.sources.length == 0 && (
          <div className="SourceList__Empty">
            {filtering ? "No results" : this.props.emptyMessage}
          </div>
        )}
        {this.props.sources.map((source) =>
          <div className={`SourceList__Source ${source.offline ? 'm-offline' : ''} ${source.untagged ? 'm-untagged' : ''}`}
               key={source.id}>
            {this.props.isSelect && (
              <input type="checkbox" value={source.url} onChange={this.onSelect.bind(this)}
                     checked={this.props.selected.includes(source.url)}/>
            )}
            {this.state.isEditing != source.id && (
              <div className="SourceList__SourceTitle u-clickable"
                   onClick={this.props.onPlay ? this.onPlay.bind(this, source) : this.onEdit.bind(this, source.id)}>
                {source.url}
              </div>
            )}
            {this.state.isEditing == source.id && (
              <form className="SourceList__SourceTitle" onSubmit={this.onEdit.bind(this, -1)}>
                <input
                  autoFocus
                  type="text"
                  value={source.url}
                  onBlur={this.onEdit.bind(this, -1)}
                  onChange={this.onEditSource.bind(this, source.id)}/>
              </form>
            )}
            {source.tags && this.props.onPlay &&  (
              <div id={`tags-${source.id}`} className="SourceList__SourceTags">
                {source.tags.map((tag) =>
                  <span className="SourceList__SourceTag" key={tag.id}>{tag.name}</span>
                )}
              </div>
            )}

            <div className="u-button u-destructive u-clickable"
                 onClick={this.onRemove.bind(this, source.id)}
                 title="Remove">×️
            </div>
            {this.props.config.caching.enabled && getSourceType(source.url) != ST.local && (
              <div className="u-button u-clean u-clickable"
                   onClick={this.onClean.bind(this, source.id)}
                   title="Clear cache"/>)}
            <div className="u-button u-edit u-clickable"
                 onClick={this.onEdit.bind(this, source.id)}
                 title="Edit"/>
          </div>
        )}
      </div>
    )
  }

  nop() {}

  componentDidMount() {
    this.setState({sortable: null});
    this.initSortable();
    document.getElementById("sources").scrollTo(0, this.props.yOffset);
  }

  shouldComponentUpdate(props:any, state: any) {
    return (props.forceUpdate ||
      (this.props.isSelect !== props.isSelect) ||
      (this.props.filters !== props.filters) ||
      (this.props.selected.length !== props.selected.length) ||
      (this.props.sources !== props.sources))
  }

  componentDidUpdate(): void {
    if (this.state.sortable) {
      this.state.sortable.option("disabled", this.props.filters.length > 0);
    }
    this.initSortable();
  }

  componentWillUnmount() {
    if (this.props.savePosition) {
      this.props.savePosition(document.getElementById("sources").scrollTop, this.props.filters, this.props.selected);
    }
  }

  initSortable() {
    if (!this.state.sortable) {
      this.setState({sortable:
          Sortable.create(document.getElementById('sources'), {
            animation: 150,
            easing: "cubic-bezier(1, 0, 0, 1)",
            onEnd: this.onEnd.bind(this),
          })
      });
    }
  }

  onEnd(evt: any) {
    let newSources = this.props.sources;
    arrayMove(newSources, evt.oldIndex, evt.newIndex);
    this.props.onUpdateSources(newSources);
  }

  onPlay(source: LibrarySource) {
    this.props.savePosition(document.getElementById("sources").scrollTop, this.props.filters, this.props.selected);
    this.props.onPlay(source);
  }

  onSelect(event: any) {
    const source = event.currentTarget.value;
    let newSelected = Array.from(this.props.selected);
    if (newSelected.includes(source)) {
      newSelected.splice(newSelected.indexOf(source), 1)
    } else {
      newSelected.push(source);
    }
    this.props.onUpdateSelected(newSelected);
  }

  onEdit(sourceID: number, e: Event) {
    if (this.props.onPlay) { // This is the Library, open the Modal
      this.props.onStartEdit(sourceID);
    } else { // Otherwise, just use the simple text input
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

  onClean(sourceID: number) {
    const sourceURL = this.props.sources.find((s) => s.id == sourceID).url;
    const fileType = getSourceType(sourceURL);
    if (fileType != ST.local) {
      const cachePath = getCachePath(sourceURL, this.props.config);
      if (!confirm("Are you SURE you want to delete " + cachePath + "?")) return;
      rimraf.sync(cachePath);
    }
  }

  onRemove(sourceID: number) {
    this.props.onUpdateSources(this.props.sources.filter((s) => s.id != sourceID));
  }
}