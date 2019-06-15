import * as React from 'react';
import tumblr from 'tumblr.js';
import wretch from 'wretch';
import Snoowrap from "snoowrap";

import LibrarySource from "./LibrarySource";
import Tag from "./Tag";
import Config from "../../data/Config";
import SourcePicker from "../sceneDetail/SourcePicker";
import Progress from "../ui/Progress";

export default class Library extends React.Component {
  readonly props: {
    library: Array<LibrarySource>,
    config: Config,
    tags: Array<Tag>,
    isSelect: boolean,
    isBatchTag: boolean,
    yOffset: number,
    filters: Array<string>,
    selected: Array<string>,
    onUpdateLibrary(sources: Array<LibrarySource>): void,
    onClearReddit(): void,
    onPlay(source: LibrarySource): void,
    savePosition(yOffset: number, filters:Array<string>, selected: Array<string>): void,
    goBack(): void,
    manageTags(): void,
    importSourcesFromLibrary(sources: Array<LibrarySource>): void,
    batchTag(isBatchTag: boolean): void,
  };

  readonly state = {
    inProgress: false,
    showProgress: false,
    totalProgress: 0,
    currentProgress: 0,
    progressTitle: "",
    next: "",
  };

  render() {
    return (
      <div className="Library">
        <div className="u-button-row">
          <div className="u-abs-center">
            {!this.state.showProgress && (
              <h2 className="Library__LibraryHeader">Library</h2>
            )}
            {this.state.showProgress && (
              <h2 className="Library__LibraryHeader">Progress</h2>
            )}
          </div>
          {!this.props.isSelect && !this.props.isBatchTag && !this.state.showProgress && (
            <div className="Library__Buttons u-button-row-right">
              <div
                className="Library__TumblirImport u-button u-icon-button u-clickable"
                title="Import Reddit Subscriptions"
                onClick={this.importReddit.bind(this)}>
                <div className="u-reddit"/>
              </div>
              <div
                className="Library__TumblirImport u-button u-icon-button u-clickable"
                title="Import Tumblr Following"
                onClick={this.importTumblr.bind(this)}>
                <div className="u-tumblr"/>
              </div>
              <div
                className="Library__MarkOffline u-button u-icon-button u-clickable"
                title="Mark Offline Sources"
                onClick={this.markOffline.bind(this)}>
                <div className="u-mark-offline"/>
              </div>
              <div
                className="Library__ManageTags u-button u-icon-button u-clickable"
                title="Manage Tags"
                onClick={this.props.manageTags.bind(this)}>
                <div className="u-tags"/>
              </div>
              <div
                className="Library__BatchTag u-button u-icon-button u-clickable"
                title="Batch Tag"
                onClick={this.props.batchTag.bind(this, true)}>
                <div className="u-batch"/>
              </div>
            </div>
          )}
          <div
            className="BackButton u-button u-clickable"
            style={{verticalAlign: '11px'}}
            onClick={this.goBack.bind(this)}>
            {(this.props.isBatchTag ? "Done" : "Back")}
          </div>
          {!this.props.isSelect && !this.props.isBatchTag && !this.state.showProgress && (
            <div
              className="Library__Import u-button u-icon-button u-clickable"
              title="Import Library"
              /*onClick={this.props.import.bind(this)}*/>
              <div className="u-import"/>
            </div>
          )}
          {!this.props.isSelect && !this.props.isBatchTag && !this.state.showProgress && (
            <div
              className="Library__Export u-button u-icon-button u-clickable"
              title="Export Library"
              /*onClick={this.props.export.bind(this)}*/>
              <div className="u-export"/>
            </div>
          )}
        </div>

        {!this.state.showProgress && (
          <SourcePicker
            sources={this.props.library}
            tags={this.props.tags}
            config={this.props.config}
            yOffset={this.props.yOffset}
            filters={this.props.filters}
            selected={this.props.selected}
            emptyMessage="You haven't added anything to the Library yet."
            removeAllMessage="Are you sure you really wanna delete your library...? ಠ_ಠ"
            removeAllConfirm="Yea... I'm sure"
            isSelect={this.props.isSelect}
            isBatchTag={this.props.isBatchTag}
            onUpdateSources={this.props.onUpdateLibrary}
            onPlay={this.props.onPlay}
            savePosition={this.props.savePosition}
            importSourcesFromLibrary={this.props.importSourcesFromLibrary}
          />
        )}
        {this.state.showProgress && (
          <Progress
            total={this.state.totalProgress}
            current={this.state.currentProgress}
            message={"<p>" + this.state.progressTitle + "</p><p>You can return to the Library</p>"} />
        )}
      </div>
    )
  }

  nop() {}

  goBack() {
    if (this.state.showProgress) {
      this.setState({showProgress: false});
    } else if (this.props.isBatchTag) {
      this.props.batchTag(false);
    } else {
      this.props.goBack();
    }
  }

  importReddit() {
    const reddit = new Snoowrap({
      userAgent: this.props.config.remoteSettings.redditUserAgent,
      clientId: this.props.config.remoteSettings.redditClientID,
      clientSecret: "",
      refreshToken: this.props.config.remoteSettings.redditRefreshToken,
    });

    // Define our loop
    const redditImportLoop = () => {
      reddit.getSubscriptions({limit: 20, after: this.state.next}).then((subscriptionListing: any) => {
        if (subscriptionListing.length > 0) {
          // Get the next 20 blogs
          let subscriptions = [];
          for (let sub of subscriptionListing) {
            const subURL = "http://www.reddit.com" + sub.url;
            subscriptions.push(subURL);
          }

          // dedup
          let sourceURLs = this.props.library.map((s) => s.url);
          subscriptions = subscriptions.filter((s) => !sourceURLs.includes(s));

          let id = this.props.library.length + 1;
          this.props.library.forEach((s) => {
            id = Math.max(s.id + 1, id);
          });

          // Add to Library
          let newLibrary = this.props.library;
          for (let url of subscriptions) {
            newLibrary.push(new LibrarySource({
              url: url,
              id: id,
              tags: new Array<Tag>(),
            }));
            id += 1;
          }
          this.props.onUpdateLibrary(newLibrary);

          // Loop until we run out of blogs
          setTimeout(redditImportLoop, 1500);
          this.setState({next: subscriptionListing[subscriptionListing.length - 1].name, currentProgress: this.state.currentProgress + 1});
        } else {
          this.setState({next: "", currentProgress: 0, totalProgress: 0, inProgress: false, progressTitle: ""});
          alert("Reddit Subscription Import has completed");
        }
      }).catch((err: any) => {
        // If user is not authenticated for subscriptions, prompt to re-authenticate
        if (err.statusCode == 403) {
          alert("You have not authorized FlipFlip to work with Reddit subscriptions. Visit config and authorize FlipFlip to work with Reddit.");
          this.props.onClearReddit();
        } else {
          alert("Error retrieving subscriptions: " + err);
          console.error(err);
        }
        this.setState({currentProgress: 0, totalProgress: 0, inProgress: false, progressTitle: ""});
      });
    };

    // Show progress bar and kick off loop
    alert("Your Reddit subscriptions are being imported... You will recieve an alert when the import is finished.");
    this.setState({totalProgress: 1, inProgress: true});
    redditImportLoop();
  }

  importTumblr() {
    // If we don't have an import running
    if (!this.state.inProgress) {
      // Build our Tumblr client
      const client = tumblr.createClient({
        consumer_key: this.props.config.remoteSettings.tumblrKey,
        consumer_secret: this.props.config.remoteSettings.tumblrSecret,
        token: this.props.config.remoteSettings.tumblrOAuthToken,
        token_secret: this.props.config.remoteSettings.tumblrOAuthTokenSecret,
      });

      // Define our loop
      const tumblrImportLoop = () => {
        const offset = this.state.currentProgress;
        // Get the next page of blogs
        client.userFollowing({offset: offset}, (err, data) => {
          if (err) {
            alert("Error retrieving following: " + err);
            this.setState({currentProgress: 0, totalProgress: 0, inProgress: false, showProgress: false, progressTitle: ""});
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

          let nextOffset = offset + 20;
          if (offset > this.state.totalProgress) {
            nextOffset = this.state.totalProgress;
          }

          // Update progress
          this.setState({currentProgress: nextOffset});

          // Loop until we run out of blogs
          if ((nextOffset) < this.state.totalProgress) {
            setTimeout(tumblrImportLoop, 1500);
          } else {
            this.setState({currentProgress: 0, totalProgress: 0, inProgress: false, showProgress: false, progressTitle: ""});
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
        this.setState({
          currentProgress: 0,
          totalProgress: data.total_blogs,
          inProgress: true,
          showProgress: true,
          progressTitle: "Tumblr Following Import"});
        tumblrImportLoop();
      });
    } else {
      // We already have an import running, just show it
      this.setState({showProgress: true});
    }
  }

  markOffline() {
    // If we don't have an import running
    if (!this.state.inProgress) {
      // Define our loop
      const offlineLoop = () => {
        const offset = this.state.currentProgress;
        if (this.props.library.length == offset) {
          this.setState({currentProgress: 0, totalProgress: 0, inProgress: false, showProgress: false, progressTitle: ""});
          alert("Offline Check has completed. Remote sources not available are now marked in red.");
        } else if (this.props.library[offset].url.startsWith("http://") ||
                   this.props.library[offset].url.startsWith("https://")) {
          this.setState({progressTitle: "Checking...</p><p>" + this.props.library[offset].url});
          const lastCheck = this.props.library[offset].lastCheck;
          if (lastCheck != null) {
            // If this link was checked within the last week, skip
            if (new Date().getTime() - new Date(lastCheck).getTime() < 604800000) {
              this.setState({currentProgress: offset + 1});
              setTimeout(offlineLoop, 100);
              return;
            }
          }

          this.props.library[offset].lastCheck = new Date();
          wretch(this.props.library[offset].url)
            .get()
            .notFound((res) => {
              this.props.library[offset].offline = true;
              this.setState({currentProgress: offset + 1});
              setTimeout(offlineLoop, 1000);
            })
            .res((res) => {
              this.props.library[offset].offline = false;
              this.setState({currentProgress: offset + 1});
              setTimeout(offlineLoop, 1000);
            })
            .catch((e) => {
              console.error(e);
              this.props.library[offset].lastCheck = null;
              this.setState({currentProgress: offset + 1});
              setTimeout(offlineLoop, 100);
            });
        } else {
          this.setState({currentProgress: offset + 1});
          setTimeout(offlineLoop, 100);
        }
      };

      // Show progress bar and kick off loop
      this.setState({
        currentProgress: 0,
        totalProgress: this.props.library.length,
        inProgress: true,
        showProgress: true});
      offlineLoop();
    } else {
      // We already have an import running, just show it
      this.setState({showProgress: true});
    }
  }
}