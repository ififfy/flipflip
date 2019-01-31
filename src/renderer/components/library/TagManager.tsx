import * as React from "react";
import Sortable from "sortablejs"

import Tag from "./Tag";

function array_move(arr: Array<any>, old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
}

export default class TagManager extends React.Component {
  readonly props: {
    tags: Array<Tag>,
    onUpdateTags(tags: Array<Tag>): void,
    goBack(): void,
  };

  readonly state = {
    removeTags: false,
    isEditing: -1,
    sortable: Sortable,
  };

  render() {
    return (
      <div className="TagManager">
        <div className="u-button-row">
          <div className="u-abs-center">
            <h2 className="TagManager__TagManagerHeader">Tag Manager</h2>
          </div>

          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        </div>

        <div className="TagManager__Buttons">
          <div className={`u-button ${this.state.removeTags ? 'u-disabled' : 'u-clickable'}`}
               onClick={this.state.removeTags ? this.nop : this.onAdd.bind(this)}>+ Add</div>
          {this.state.removeTags && (
            <div className="u-button u-float-left u-clickable"
                 onClick={this.toggleRemoveMode.bind(this)}>Done</div>
          )}
          {!this.state.removeTags && (
            <div className={`u-button u-float-left ${this.props.tags.length == 0 ? 'u-disabled' : 'u-clickable'} `}
                 onClick={this.props.tags.length == 0 ? this.nop : this.toggleRemoveMode.bind(this)}>- Remove Tags</div>
          )}
        </div>

        <div id="tags" className="TagManager__Tags">
          {this.props.tags.map((tag) =>
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
                    onChange={this.onEditTag.bind(this, tag.id)} />
                </form>
              )}
            </div>
          )}
        </div>

        {this.props.tags.length == 0 && (
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

  onEnd(evt: any) {
    let newTags = this.props.tags;
    array_move(newTags, evt.oldIndex, evt.newIndex)
    this.props.onUpdateTags(newTags);
  }

  componentDidMount() {
    let sortable = Sortable.create(document.getElementById('tags'), {
      animation: 150,
      easing: "cubic-bezier(1, 0, 0, 1)",
      onEnd: this.onEnd.bind(this),
    });
    this.setState({sortable: sortable});
  }

  nop() {}

  toggleRemoveMode() {
    this.state.sortable.option("disabled", !this.state.removeTags);
    this.setState({removeTags: !this.state.removeTags});
  };

  onRemove(tagID: number) {
    this.props.onUpdateTags(this.props.tags.filter((t) => t.id != tagID));
  }

  onAdd() {
    this.setState({isEditing: this.props.tags.length});
    let newTags = this.props.tags;
    let highestID = -1;
    for (let tag of newTags) {
      if (tag.id > highestID) {
        highestID = tag.id
      }
    }
    let tag = new Tag();
    tag.name = "";
    tag.id = highestID+1;
    newTags.push(tag);
    this.props.onUpdateTags(newTags);
  }

  onEdit(tagID: number, e: Event) {
    e.preventDefault();
    // If user left input blank, remove it from list of sources
    // Also prevent user from inputing duplicate source
    let newTags = [];
    let newNames = Array<string>();
    let needsUpdate = false;
    for (let tag of this.props.tags) {
      if (tag.name == "" || newNames.includes(tag.name)) {
        needsUpdate = true;
      } else {
        newTags.push(tag);
        newNames.push(tag.name);
      }
    }
    this.setState({isEditing: tagID});
    if (needsUpdate) { // Only update tags if we need to
      this.props.onUpdateTags(newTags);
    }
  }

  onEditTag(tagID: number, e: React.FormEvent<HTMLInputElement>) {
    let newTags = this.props.tags;
    for (let tag of newTags) {
      if (tag.id == tagID) {
        tag.name = e.currentTarget.value;
        break;
      }
    }
    this.props.onUpdateTags(newTags);
  }

}