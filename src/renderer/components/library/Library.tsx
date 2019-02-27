import * as React from 'react';

import LibrarySource from "./LibrarySource";
import Tag from "./Tag";
import SourcePicker from "../sceneDetail/SourcePicker";

export default class Library extends React.Component {
  readonly props: {
    library: Array<LibrarySource>,
    tags: Array<Tag>,
    isSelect: boolean,
    yOffset: number,
    filters: Array<string>,
    onUpdateLibrary(sources: Array<LibrarySource>): void,
    onPlay(source: LibrarySource, yOffset: number, filters: Array<string>): void,
    goBack(): void,
    manageTags(): void,
    importSources(sources: Array<string>): void,
  };

  render() {
    return (
      <div className="Library">
        <div className="u-button-row">
          <div className="u-abs-center">
            <h2 className="Library__LibraryHeader">Library</h2>
          </div>
          {!this.props.isSelect && (
            <div className="u-button-row-right">
              <div
                className="Library__ManageTags u-button u-clickable"
                onClick={this.props.manageTags.bind(this)}>
                Manage Tags
              </div>
            </div>
          )}
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        </div>

        <SourcePicker
          sources={this.props.library}
          yOffset={this.props.yOffset}
          filters={this.props.filters}
          emptyMessage="You haven't added anything to the Library yet."
          removeAllMessage="Are you sure you really wanna delete your library...? ಠ_ಠ"
          removeAllConfirm="Yea... I'm sure"
          isSelect={this.props.isSelect}
          onUpdateSources={this.props.onUpdateLibrary}
          onClick={this.props.isSelect ? this.nop : this.props.onPlay}
          importSourcesFromLibrary={this.props.importSources}
        />
      </div>
    )
  }

  nop() {}
}