import * as React from 'react';
import tumblr from 'tumblr.js';

import LibrarySource from "./LibrarySource";
import Tag from "./Tag";
import Config from "../../Config";
import SourcePicker from "../sceneDetail/SourcePicker";
import Progress from "../ui/Progress";

export default class Library extends React.Component {
  readonly props: {
    library: Array<LibrarySource>,
    config: Config,
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

  readonly state = {
    showProgress: false,
    total: 0,
    current: 0,
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
                className={`Library__ImportRemote u-button ${this.state.showProgress ? 'u-disabled' : 'u-clickable'}`}
                onClick={this.state.showProgress ? this.nop : this.importRemote.bind(this)}>
                Import Tumblr Following
              </div>
              <div
                className="Library__ManageTags u-button u-clickable"
                onClick={this.props.manageTags.bind(this)}>
                Manage Tags
              </div>
            </div>
          )}
          <div className="BackButton u-button u-clickable" onClick={this.state.showProgress ? this.hideProgress.bind(this) : this.props.goBack}>Back</div>
        </div>

        {!this.state.showProgress && (
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
        )}
        {this.state.showProgress && (
          <Progress
            total={this.state.total}
            current={this.state.current}
            message={"<p>Importing Tumblr Following...</p>You can return the Library"} />
        )}
      </div>
    )
  }

  nop() {}

  hideProgress() {
    this.setState({showProgress: false});
  }

  importRemote() {
    // If we don't have an import running
    if (this.state.total == 0) {
      // Build our Tumblr client
      const client = tumblr.createClient({
        consumer_key: this.props.config.remoteSettings.tumblrKey,
        consumer_secret: this.props.config.remoteSettings.tumblrSecret,
        token: this.props.config.remoteSettings.tumblrOAuthToken,
        token_secret: this.props.config.remoteSettings.tumblrOAuthTokenSecret,
      });

      // Define our loop
      const tumblrImportLoop = () => {
        const page = this.state.current;
        // Get the next page of blogs
        client.userFollowing({offset: page * 20}, (err, data) => {
          if (err) {
            alert("Error retrieving following: " + err);
            this.setState({current: 0, total: 0, showProgress: false});
            console.error(err);
            return;
          }

          // Get the next 20 blogs
          let following = [];
          for (let blog of data.blogs) {
            const blogURL = "http://" + blog.name + ".tumblr.com/";
            following.push(blogURL);
          }

          // dedup
          let sourceURLs = this.props.library.map((s) => s.url);
          following = following.filter((b) => !sourceURLs.includes(b));

          let id = this.props.library.length + 1;
          this.props.library.forEach((s) => {
            id = Math.max(s.id + 1, id);
          });

          // Add to Library
          let newLibrary = this.props.library;
          for (let url of following) {
            newLibrary.push(new LibrarySource({
              url: url,
              id: id,
              tags: new Array<Tag>(),
            }));
            id += 1;
          }
          this.props.onUpdateLibrary(newLibrary);

          // Update progress
          this.setState({current: page + 1});

          // Loop until we run out of blogs
          if ((page + 1) < this.state.total) {
            setTimeout(tumblrImportLoop, 1500);
          } else {
            this.setState({current: 0, total: 0, showProgress: false});
            alert("Tumblr Following Import has completed");
          }
        });
      };

      // Make the first call just to check the total blogs
      client.userFollowing({limit: 0}, (err, data) => {
        if (err) {
          alert("Error retrieving following: " + err);
          console.error(err);
          return;
        }

        // Show progress bar and kick off loop
        this.setState({current: 0, total: Math.ceil(data.total_blogs / 20), showProgress: true});
        tumblrImportLoop();
      });
    } else {
      // We already have an import running, just show it
      this.setState({showProgress: true});
    }
  }
}