import * as React from "react";
import Sortable from "react-sortablejs"

import {arrayMove, removeDuplicatesBy} from "../../data/utils";
import Tag from "./Tag";

export default class TagManager extends React.Component {
  readonly props: {
    tags: Array<Tag>,
    onUpdateTags(tags: Array<Tag>): void,
    goBack(): void,
  };

  readonly state = {
    tags: Array<Tag>(),
    removeTags: false,
    isEditing: -1,
  };

  _sortable: any = null;

  render() {
    return (
      <div className="TagManager">
        <div className="u-button-row">
          <div className="u-abs-center">
            <h2 className="TagManager__TagManagerHeader">Tag Manager</h2>
          </div>
          <div className="u-button-row-right">
            <div className="Config__Apply u-button u-clickable"
                 onClick={this.applyConfig.bind(this)}>
              Apply
            </div>
            <div className="Config__OK u-button u-clickable"
                 onClick={this.onOK.bind(this)}>
              OK
            </div>
          </div>

          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        </div>

        <div className="TagManager__Buttons">
          <div className={`u-button ${this.state.removeTags ? 'u-disabled' : 'u-clickable'}`}
               onClick={this.state.removeTags ? this.nop : this.onAdd.bind(this)}>+ Add
          </div>
          {this.state.removeTags && (
            <div className="u-button u-float-left u-clickable"
                 onClick={this.toggleRemoveMode.bind(this)}>Done</div>
          )}
          {!this.state.removeTags && (
            <div className={`u-button u-float-left ${this.state.tags.length == 0 ? 'u-disabled' : 'u-clickable'} `}
                 onClick={this.state.tags.length == 0 ? this.nop : this.toggleRemoveMode.bind(this)}>- Remove Tags</div>
          )}
        </div>

        <Sortable
          className="TagManager__Tags"
          options={{
            animation: 150,
            easing: "cubic-bezier(1, 0, 0, 1)",
            disabled: this.state.removeTags,
          }}
          ref={(node: any) => {
            if (node) {
              this._sortable = node.sortable;
            }
          }}
          onChange={(order: any, sortable: any, evt: any) => {
            let newTags = Array.from(this.state.tags);
            arrayMove(newTags, evt.oldIndex, evt.newIndex);
            this.setState({tags: newTags});
          }}>
          {this.state.tags.map((tag) =>
            <div className={`TagManager__Tag u-clickable ${this.state.removeTags ? 'u-destructive-bg' : ''}`}
                 onClick={this.state.removeTags ? this.onRemove.bind(this, tag.id) : this.onEdit.bind(this, tag.id)}
                 key={tag.id}>
              {this.state.isEditing != tag.id && (
                <div className="TagManager_TagTitle">
                  {tag.name}
                </div>
              )}
              {this.state.isEditing == tag.id && (
                <form className="TagManager_TagTitle" onSubmit={this.onEdit.bind(this, -1)}>
                  <input
                    autoFocus
                    type="text"
                    value={tag.name}
                    onBlur={this.onEdit.bind(this, -1)}
                    onChange={this.onEditTag.bind(this, tag.id)}/>
                </form>
              )}
            </div>
          )}
        </Sortable>

        {this.state.tags.length == 0 && (
          <div className="TagManager__Empty">
            You haven't added any tags yet.
          </div>
        )}
        {this.state.removeTags && (
          <div className="TagManager__Remove">
            Click a tag to remove it. Click Done when you're finished.
          </div>
        )}
      </div>
    )
  }

  componentDidMount() {
        // Make a deep copy of Tags
    // For some reason, shallow copy was still modifying props' Tags
    let newTags = Array<Tag>();
    for (let tag of this.props.tags) {
      newTags.push(JSON.parse(JSON.stringify(tag)));
    }
    this.setState({tags: newTags});
  }

  nop() {}

  onOK() {
    this.applyConfig();
    this.props.goBack();
  }

  applyConfig() {
    this.props.onUpdateTags(this.state.tags);
  }

  toggleRemoveMode() {
    this._sortable.option("disabled", !this.state.removeTags);
    this.setState({removeTags: !this.state.removeTags});
  };

  onRemove(tagID: number) {
    this.setState({tags: this.state.tags.filter((t) => t.id != tagID)});
  }

  onAdd() {
    let id = this.state.tags.length + 1;
    this.state.tags.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });
    this.props.tags.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    this.setState({isEditing: id});
    let newTags = this.state.tags;
    newTags.push(new Tag({
      name: "",
      id: id,
    }));
    this.setState({tags: newTags});
  }

  onEdit(tagID: number, e: Event) {
    e.preventDefault();
    // If user left input blank, remove it from list of sources
    // Also prevent user from inputing duplicate source
    this.setState({isEditing: tagID, tags:
      removeDuplicatesBy((t: Tag) => t.name,
        this.state.tags.filter((t) => t.name != ""))});
  }

  onEditTag(tagID: number, e: React.FormEvent<HTMLInputElement>) {
    this.setState({
      tags: this.state.tags.map(
        function map(tag: Tag) {
          if (tag.id == tagID) {
            tag.name = e.currentTarget.value;
          }
          return tag;
        })
    });
  }

}