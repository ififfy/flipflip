import * as React from "react";
import Sortable from "react-sortablejs"

import {arrayMove, removeDuplicatesBy} from "../../data/utils";
import Tag from "./Tag";
import Jiggle from "../../animations/Jiggle";
import Modal from "../ui/Modal";
import SimpleTextInput from "../ui/SimpleTextInput";

export default class TagManager extends React.Component {
  readonly props: {
    tags: Array<Tag>,
    onUpdateTags(tags: Array<Tag>): void,
    goBack(): void,
  };

  readonly state = {
    tags: Array<Tag>(),
    isEditing: -1,
    isEditingPhrase: -1,
    phraseString: "",
    changeMade: false,
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
            <div className="TagManager__Add u-button u-clickable"
                 onClick={this.onAdd.bind(this)}>
              + Add New Tag
            </div>
            <div className="TagManager__Apply u-button u-clickable"
                 onClick={this.applyConfig.bind(this)}>
              Apply
            </div>
            <div className="TagManager__OK u-button u-clickable"
                 onClick={this.onOK.bind(this)}>
              OK
            </div>
          </div>

          <div className="BackButton u-button u-clickable" onClick={this.goBack.bind(this)}>Back</div>
        </div>

        <Sortable
          className="TagManager__Tags"
          options={{
            animation: 150,
            easing: "cubic-bezier(1, 0, 0, 1)",
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
            <div
              className="TagManager__Tag u-clickable"
              key={tag.id}>
              {this.state.isEditing != tag.id && (
                <React.Fragment>
                  <Jiggle
                    bounce={false}
                    className="TagManager__RemoveButton u-icon-button"
                    title="Delete Tag"
                    onClick={this.onRemove.bind(this, tag.id)}>
                    <div className="u-delete"/>
                  </Jiggle>
                  <Jiggle
                    bounce={false}
                    className="TagManager__PhraseButton u-icon-button"
                    title="Edit Tag Phrases"
                    onClick={this.onEditPhrase.bind(this, tag.id)}>
                    <div className="u-script"/>
                  </Jiggle>
                  <div
                    className="TagManager__TagTitle"
                    onClick={this.onEdit.bind(this, tag.id)}>
                    {tag.name}
                  </div>
                </React.Fragment>
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

        {this.state.isEditingPhrase != -1 && (
          <Modal onClose={this.cancelEditPhrase.bind(this)} title={`Tag Phrases: ${this.state.tags.find((t) => t.id == this.state.isEditingPhrase).name}`}>
            <p>Enter phrases associated with this tag, used with $TAG_PHRASE</p>
            <p>Enter one phrase per line and hit Save.</p>
            <SimpleTextInput
              label=""
              textArea={true}
              value={this.state.phraseString}
              isEnabled={true}
              onChange={this.onChangePhraseString.bind(this)}/>
            <div className="u-button u-float-right" onClick={this.savePhraseString.bind(this)}>
              Save
            </div>
          </Modal>
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

  goBack() {
    if (this.state.changeMade) {
      alert("Be sure to press OK if you want to save your changes");
      this.setState({changeMade: false});
    } else {
      this.props.goBack();
    }
  }

  onOK() {
    this.applyConfig();
    this.props.goBack();
  }

  applyConfig() {
    this.props.onUpdateTags(this.state.tags);
  }

  onRemove(tagID: number) {
    this.setState({tags: this.state.tags.filter((t) => t.id != tagID), changeMade: true});
  }

  onAdd() {
    let id = this.state.tags.length + 1;
    this.state.tags.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });
    this.props.tags.forEach((s) => {
      id = Math.max(s.id + 1, id);
    });

    let newTags = this.state.tags;
    newTags.push(new Tag({
      name: "",
      id: id,
    }));
    this.setState({isEditing: id, tags: newTags, changeMade: true});
  }

  onEdit(tagID: number, e: Event) {
    e.preventDefault();
    // If user left input blank, remove it from list of sources
    // Also prevent user from inputing duplicate source
    this.setState({isEditing: tagID, changeMade: true, tags:
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
        }), changeMade: true
    });
  }

  onEditPhrase(tagID: number) {
    let tag = this.state.tags.find((t) => t.id == tagID);
    this.setState({ isEditingPhrase: tagID, phraseString: tag.phraseString });
  }

  savePhraseString() {
    let newTags = this.state.tags;
    let tag = this.state.tags.find((t) => t.id == this.state.isEditingPhrase);
    tag.phraseString = this.state.phraseString;
    this.setState({tags: newTags, isEditingPhrase: -1, phraseString: "", changeMade: true});
  }

  cancelEditPhrase() {
    this.setState({ isEditingPhrase: -1, phraseString: "" });
  }

  onChangePhraseString(phraseString: string) {
    this.setState({ phraseString: phraseString });
  }

}