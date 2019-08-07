import * as React from "react";
import rimraf from "rimraf";
import Sortable from "react-sortablejs";
import {remote} from "electron";

import {arrayMove, getCachePath, getFileGroup, getFileName, getSourceType, isVideo} from "../../data/utils";
import {AF, SF, ST} from "../../data/const";
import SourceIcon from "./SourceIcon";
import LibrarySource from "../library/LibrarySource";
import Tag from "../library/Tag";
import Config from "../../data/Config";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";

export default class SourceList extends React.Component {
  readonly props: {
    displaySources: Array<LibrarySource>,
    sources: Array<LibrarySource>,
    config: Config,
    isSelect: boolean,
    emptyMessage: string,
    yOffset: number,
    filters: Array<string>,
    selected: Array<string>,
    markUpdate: boolean,
    onUpdateSources(sources: Array<LibrarySource>): void,
    addSources(sources: Array<string>): void,
    onUpdateSelected(selected: Array<string>): void,
    onStartEdit(isEditing: number): void,
    savePosition?(yOffset: number, filters: Array<string>, selected: Array<string>): void,
    onOpenLibraryImport?(): void,
    onClip(source: LibrarySource): void,
    onPlay?(source: LibrarySource, displayed: Array<LibrarySource>): void,
  };

  readonly state = {
    isEditing: -1,
  };

  _sortable: any = null;

  render() {
    const filtering = this.props.filters.length > 0;
    return (
      <div className="SourceList" style={{width: `${this.props.isSelect ? '150px' : '283px'}`}}>
        <div className="SourceList__Buttons u-float-right">
          {!this.props.isSelect && (
            <SimpleOptionPicker
              label=""
              value="+ Add Sources"
              disableFirst={true}
              keys={["+ Add Sources"].concat([AF.url, AF.directory, AF.videos]).concat(this.props.onOpenLibraryImport ? [AF.library] : [])}
              disabled={this.props.filters.length > 0}
              onChange={this.onAddSource.bind(this)}
            />
          )}
          <SimpleOptionPicker
            label=""
            value="Sort Sources"
            disableFirst={true}
            keys={["Sort Sources"].concat(Object.values(SF))}
            onChange={this.onSort.bind(this)}
          />
        </div>

        <div id="sources" className={`SourceList__Sources ${this.props.isSelect ? 'm-select' : ''}`}>
          {this.props.displaySources.length == 0 && (
            <div className="SourceList__Empty">
              {filtering ? "No results" : this.props.emptyMessage}
            </div>
          )}
          <Sortable
            options={{
              animation: 150,
              easing: "cubic-bezier(1, 0, 0, 1)",
              disabled: filtering,
            }}
            ref={(node: any) => {
              if (node) {
                this._sortable = node.sortable;
              }
            }}
            onChange={(order: any, sortable: any, evt: any) => {
              let newSources = Array.from(this.props.sources);
              arrayMove(newSources, evt.oldIndex, evt.newIndex);
              this.props.onUpdateSources(newSources);
            }}>
            {this.props.displaySources.map((source) =>
                <div className={`SourceList__Source ${source.offline ? 'm-offline' : ''} ${source.marked ? 'm-marked' : ''}`}
                     key={source.id}>
                  {this.props.isSelect && (
                    <input type="checkbox" value={source.url} onChange={this.onSelect.bind(this)}
                           checked={this.props.selected.includes(source.url)}/>
                  )}
                  {this.props.onPlay && (
                    <SourceIcon url={source.url}/>
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
                  {source.tags && this.props.onPlay && (
                    <div id={`tags-${source.id}`} className="SourceList__SourceTags">
                      {source.tags.map((tag) =>
                        <span className="SourceList__SourceTag" key={tag.id}>{tag.name}</span>
                      )}
                    </div>
                  )}

                  <div className="u-button u-small-icon-button u-clickable"
                       onClick={this.onRemove.bind(this, source.id)}
                       title="Remove">
                    <div className="u-delete"/>
                  </div>
                  {this.props.config.caching.enabled && getSourceType(source.url) != ST.local &&
                    (getSourceType(source.url) != ST.video || /^https?:\/\//g.exec(source.url) != null) && (
                    <div className="u-button u-small-icon-button u-clean u-clickable"
                         onClick={this.onClean.bind(this, source.id)}
                         title="Clear cache">
                      <div className="u-clean"/>
                    </div>
                  )}
                  {getSourceType(source.url) == ST.video && (
                    <div className="u-button u-small-icon-button u-clean u-clickable"
                         onClick={this.onClip.bind(this, source)}
                         title="Select Parts of Video">
                      <div className="u-clip"/>
                    </div>
                  )}
                  <div className="u-button u-small-icon-button u-clickable"
                       onClick={this.onEdit.bind(this, source.id)}
                       title="Edit">
                    <div className="u-edit"/>
                  </div>
                  {source.count > 0 && (
                    <div className="SourceList__SourceCount">({source.count}{source.countComplete ? '' : '+'})</div>
                  )}
                </div>
            )}
          </Sortable>
        </div>
      </div>
    )
  }

  nop() {}

  componentDidMount() {
    document.getElementById("sources").scrollTo(0, this.props.yOffset);
  }

  shouldComponentUpdate(props:any, state: any) {
    return ((this.props.markUpdate !== props.markUpdate) ||
      (this.props.isSelect !== props.isSelect) ||
      (this.props.filters !== props.filters) ||
      (this.props.selected.length !== props.selected.length) ||
      (this.props.displaySources !== props.displaySources) ||
      (this.props.sources !== props.sources));
  }

  componentDidUpdate(): void {
    this._sortable.option("disabled", this.props.filters.length > 0);
  }

  componentWillUnmount() {
    if (this.props.savePosition) {
      this.props.savePosition(document.getElementById("sources").scrollTop, this.props.filters, this.props.selected);
    }
  }

  onPlay(source: LibrarySource) {
    this.props.savePosition(document.getElementById("sources").scrollTop, this.props.filters, this.props.selected);
    this.props.onPlay(source, this.props.displaySources);
  }

  onClip(source: LibrarySource) {
    if (this.props.savePosition) {
      this.props.savePosition(document.getElementById("sources").scrollTop, this.props.filters, this.props.selected);
    }
    this.props.onClip(source);
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

  onAddSource(type: string) {
    switch (type) {
      case AF.url:
        let id = this.props.sources.length + 1;
        this.props.sources.forEach((s) => {
          id = Math.max(s.id + 1, id);
        });
        let newLibrary = Array.from(this.props.sources);
        newLibrary.unshift(new LibrarySource({
          url: "",
          id: id,
          tags: new Array<Tag>(),
        }));
        this.props.onUpdateSources(newLibrary);

        if (this.props.onPlay) {
          // Delay this for a second so that the parent layer has updated and added the new source;
          setTimeout(this.props.onStartEdit.bind(this, id), 10);
        } else {
          this.setState({isEditing: id});
        }
        break;

      case AF.directory:
        let dResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory', 'multiSelections']});
        if (!dResult) return;
        this.props.addSources(dResult);
        break;

      case AF.videos:
        let vResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
          {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'MP4', extensions: ['mp4']}, {name: 'MKV', extensions: ['mkv']}, {name: 'WebM', extensions: ['webm']}, {name: 'OGG', extensions: ['ogv']}], properties: ['openFile', 'multiSelections']});
        if (!vResult) return;
        vResult = vResult.filter((r) => isVideo(r, true));
        this.props.addSources(vResult);
        break;

      case AF.library:
        this.props.onOpenLibraryImport();
        break;
    }
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
          source.count = 0;
          source.countComplete = false;
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
      let cachePath;
      if (fileType == ST.video) {
        cachePath = getCachePath(sourceURL, this.props.config) + getFileName(sourceURL);
      } else {
        cachePath = getCachePath(sourceURL, this.props.config);
      }
      if (!confirm("Are you SURE you want to delete " + cachePath + "?")) return;
      rimraf.sync(cachePath);
    }
  }

  onRemove(sourceID: number) {
    this.props.onUpdateSources(this.props.sources.filter((s) => s.id != sourceID));
  }

  onSort(algorithm: string) {
    const sources = Array.from(this.props.sources);
    switch (algorithm) {
      case SF.alphaA:
        this.props.onUpdateSources(sources.sort((a, b) => {
          const aName = getSourceType(a.url) == ST.video ? getFileName(a.url).toLowerCase() : getFileGroup(a.url).toLowerCase();
          const bName = getSourceType(b.url) == ST.video ? getFileName(b.url).toLowerCase() : getFileGroup(b.url).toLowerCase();
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
        this.props.onUpdateSources(sources.sort((a, b) => {
          const aName = getSourceType(a.url) == ST.video ? getFileName(a.url).toLowerCase() : getFileGroup(a.url).toLowerCase();
          const bName = getSourceType(b.url) == ST.video ? getFileName(b.url).toLowerCase() : getFileGroup(b.url).toLowerCase();
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
        this.props.onUpdateSources(sources.sort((a, b) => {
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
        this.props.onUpdateSources(sources.sort((a, b) => {
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
        this.props.onUpdateSources(sources.sort((a, b) => {
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
        this.props.onUpdateSources(sources.sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          } else if (a.id < b.id) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.countA:
        this.props.onUpdateSources(sources.sort((a, b) => {
          if (a.count === undefined) a.count = 0;
          if (b.count === undefined) b.count = 0;
          if (a.countComplete === undefined) a.countComplete = false;
          if (b.countComplete === undefined) b.countComplete = false;
          if (a.count < b.count) {
            return -1;
          } else if (a.count > b.count) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.countD:
        this.props.onUpdateSources(sources.sort((a, b) => {
          if (a.count === undefined) a.count = 0;
          if (b.count === undefined) b.count = 0;
          if (a.countComplete === undefined) a.countComplete = false;
          if (b.countComplete === undefined) b.countComplete = false;
          if (a.count > b.count) {
            return -1;
          } else if (a.count < b.count) {
            return 1;
          } else {
            return 0;
          }
        }));
        break;
      case SF.type:
        this.props.onUpdateSources(sources.sort((a, b) => {
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
}