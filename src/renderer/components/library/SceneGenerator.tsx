import * as React from "react";

import LibrarySource from "./LibrarySource";
import Tag from "./Tag";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleTextInput from "../ui/SimpleTextInput";
import SimpleRadioInput from "../ui/SimpleRadioInput";
import Modal from "../ui/Modal";
import {getRandomListItem, removeDuplicatesBy} from "../../utils";
import {TT} from "../../const";

class TagWeight {
  type: string;
  value: number;

  constructor(type: string, value: number) {
    this.type = type;
    this.value = value;
  }
}

// TODO Persist Generators
export default class SceneGenerator extends React.Component {
  readonly props: {
    library: Array<LibrarySource>,
    tags: Array<Tag>,
    goBack(): void,
    onGenerate(sources: Array<string>): void,
  };

  readonly state = {
    tagWeights: new Map<Tag, TagWeight>(),
    max: "300",
    errorMessage: "",
  };

  render() {
    const weights = Array.from(this.state.tagWeights.values());
    const sum = weights.length > 0 ? weights.map((w) => w.value).reduce((total, value) => Number(total) + Number(value)) : 0;
    const hasAll = weights.filter((w) => w.type == TT.all).length > 0;

    let max = parseInt(this.state.max, 10);
    // If we cannot parse this, default to 300
    if (!max && max != 0) {
      max = 300;
    }

    return (
      <div className="SceneGenerator">
        <div className="u-button-row">
          <div className="u-abs-center">
            <h2 className="SceneGenerator__SceneGeneratorHeader">Scene Generator</h2>
          </div>

          <div className="u-button-row-right">
            <SimpleTextInput
              label="Max"
              value={this.state.max}
              isEnabled={true}
              onChange={this.onUpdateMax.bind(this)} />
            <div className={`SceneGenerator__Generate u-button ${(sum > 0 || hasAll) && max > 0 ? 'u-clickable' : 'u-disabled'}`}
                 onClick={(sum > 0 || hasAll) && max > 0 ? this.generateScene.bind(this, this.state.tagWeights) : this.nop}>
              Generate Scene
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        </div>

        <div className="SceneGenerator__Content ControlGroupGroup">
          {this.props.tags.map((tag) =>
            <ControlGroup key={tag.id} title={tag.name} isNarrow={true}>
              <span>{"Weight " + (this.state.tagWeights.has(tag) ? this.state.tagWeights.get(tag).value : 0).toString()}</span>
              <span>{"Percentage: " + (sum > 0 ? (this.state.tagWeights.has(tag) ?
                  (this.state.tagWeights.get(tag).value > 0 ? Math.round((this.state.tagWeights.get(tag).value / sum)*100) + "%" : "--") : "--") : "--")}</span>
              <SimpleSliderInput
                isEnabled={this.state.tagWeights.has(tag) ? this.state.tagWeights.get(tag).type == TT.weight : true}
                onChange={this.onChangeTagWeight.bind(this, tag)}
                label=""
                min={0}
                max={100}
                value={this.state.tagWeights.has(tag) ? this.state.tagWeights.get(tag).value : 0} />
              <SimpleRadioInput
                label=""
                groupName={tag.name}
                value={this.state.tagWeights.has(tag) ? this.state.tagWeights.get(tag).type : TT.weight}
                keys={Object.values(TT)}
                onChange={this.onChangeTagType.bind(this, tag)}
                />
            </ControlGroup>
          )}
        </div>

        {this.state.errorMessage != "" && (
          <Modal onClose={this.onErrorClose.bind(this)} title="Error">
            <p>{this.state.errorMessage}</p>
            <div className="u-button u-float-right" onClick={this.onErrorClose.bind(this)}>
              Ok
            </div>
          </Modal>
        )}
      </div>
    );
  }

  nop() {}

  onErrorClose() {
    this.setState({errorMessage: ""});
  }

  onUpdateMax(max: string) {
    this.setState({max: max});
  }

  onChangeTagWeight(tag: Tag, weight: number) {
    let tagWeight = this.state.tagWeights.get(tag);
    if (tagWeight == undefined) {
      tagWeight = new TagWeight(TT.weight, weight);
    } else {
      tagWeight.value = weight;
    }
    this.setState({tagWeights: this.state.tagWeights.set(tag, tagWeight)});
  }

  onChangeTagType(tag: Tag, type: string) {
    let tagWeight = this.state.tagWeights.get(tag);
    if (tagWeight == undefined) {
      tagWeight = new TagWeight(type, 0);
    } else {
      tagWeight.type = type;
    }
    this.setState({tagWeights: this.state.tagWeights.set(tag, tagWeight)});
  }

  generateScene(tagWeightMap: Map<Tag, TagWeight>) {
    tagWeightMap = new Map(tagWeightMap);
    const weights = Array.from(tagWeightMap.values());
    const sum = weights.length > 0 ? weights.map((w) => w.value).reduce((total, weight) => Number(total) + Number(weight)) : 1;
    let max = parseInt(this.state.max, 10);
    // If we cannot parse this, default to 300
    if (!max && max != 0) {
      max = 300;
    }
    let allList = Array<string>();
    let noneList = Array<string>();
    tagWeightMap.forEach(function(value, key, map) { // Get rid of any weighted tags with weight = 0
      if(value.type == TT.weight && value.value == 0) {
        map.delete(key);
      } else if (value.type == TT.all) {
        allList.push(key.name);
        map.delete(key);
      } else if (value.type == TT.none) {
        noneList.push(key.name);
        map.delete(key);
      }
    });

    function checkTag(taggedSources: Array<Array<string>>, sourceTags: Array<string>, url: string, index: number) {
      // Make sure it matches all of our allList
      let passAll = true;
      for (let allTag of allList) {
        if (!sourceTags.includes(allTag)) {
          passAll = false;
          break;
        }
      }

      // Make sure it matches none of our noneList
      let passNone = true;
      for (let noneTag of noneList) {
        if (sourceTags.includes(noneTag)) {
          passNone = false;
          break;
        }
      }

      // Add it to array
      if (passAll && passNone) {
        if (taggedSources[index] == undefined) {
          taggedSources[index] = [];
        }
        taggedSources[index].push(url);
      }
    }

    // Map sources to our tags
    let taggedSources = Array<Array<string>>();
    for (let source of this.props.library) {
      let sourceTags = source.tags.map((t) => t.name);
      for (let tag of source.tags) {
        if (tagWeightMap.size > 0) { // If we have weights
          let index = 0;
          for (let weightedTag of tagWeightMap.keys()) {
            if (tag.name == weightedTag.name) { // If this source has tag that we are weighting
              checkTag(taggedSources,sourceTags, source.url, index);
            }
            index += 1;
          }
        } else { // If we only have Alls
          checkTag(taggedSources,sourceTags, source.url, 0);
        }
      }
    }

    let sceneSources = Array<string>();
    if (tagWeightMap.size > 0) { // If we have weights
      let index = 0;
      for (let tag of tagWeightMap.keys()) {
        if (taggedSources[index] != undefined) { // If we actually found sources for this tag
          let sources = taggedSources[index];
          sources = sources.filter((s) => !sceneSources.includes(s));
          // Add sources equal to this tags percent of the max
          sceneSources = sceneSources.concat(getRandomListItem(sources, Math.round((tagWeightMap.get(tag).value / sum) * max)));
        }
        index += 1;
      }
    } else { // IF we only have Alls
      if (taggedSources[0] != undefined) { // If we actually found sources for this tag
        // Add sources equal to max
        sceneSources = sceneSources.concat(getRandomListItem(taggedSources[0], max));
      }
    }
    // Randomize our whole list
    if (sceneSources.length > 1) {
      sceneSources = getRandomListItem(sceneSources, sceneSources.length);
    }

    if (sceneSources.length == 0) {
      this.setState({errorMessage: "Sorry, no sources were found for this configuration ¯\\_(ツ)_/¯"});
      return;
    }

    // Make a new scene
    this.props.onGenerate(removeDuplicatesBy((s: string) => s, sceneSources));
  }
}
