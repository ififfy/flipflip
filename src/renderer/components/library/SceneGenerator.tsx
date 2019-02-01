import * as React from "react";

import LibrarySource from "./LibrarySource";
import Tag from "./Tag";
import ControlGroup from "../sceneDetail/ControlGroup";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import {getRandomListItem, removeDuplicatesBy} from "../../utils";

export default class SceneGenerator extends React.Component {
  readonly props: {
    library: Array<LibrarySource>,
    tags: Array<Tag>,
    goBack(): void,
    onGenerate(sources: Array<string>): void,
  };

  readonly state = {
    tagWeights: new Map<Tag, number>(),
  };

  render() {
    const weights = Array.from(this.state.tagWeights.values());
    const sum = weights.length > 0 ? weights.reduce((total, weight) => total + weight) : 0;
    return (
      <div className="SceneGenerator">
        <div className="u-button-row">
          <div className="u-abs-center">
            <h2 className="SceneGenerator__SceneGeneratorHeader">Scene Generator</h2>
          </div>

          <div className="u-button-row-right">
            <div className={`SceneGenerator__Generate u-button ${sum > 0 ? 'u-clickable' : 'u-disabled'}`}
                 onClick={sum > 0 ? this.generateScene.bind(this, this.state.tagWeights) : this.nop}>
              Generate Scene
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
        </div>

        <div className="SceneGenerator__Content ControlGroupGroup">

          {this.props.tags.map((tag) =>
            <ControlGroup key={tag.id} title={tag.name} isNarrow={true}>
              <SimpleSliderInput
                isEnabled={true}
                onChange={this.onChangeTagWeight.bind(this, tag)}
                label={"Weight " + (this.state.tagWeights.has(tag) ? this.state.tagWeights.get(tag) : 0).toString()}
                min={0}
                max={10}
                value={this.state.tagWeights.has(tag) ? this.state.tagWeights.get(tag) : 0} />
            </ControlGroup>
          )}
        </div>
      </div>
    );
  }

  nop() {}

  onChangeTagWeight(tag: Tag, weight: number) {
    this.setState({tagWeights: this.state.tagWeights.set(tag, weight)})
  }

  generateScene(tagWeights: Map<Tag, number>) {
    const sum = Array.from(tagWeights.values()).reduce((total, weight) => total + weight);
    const max = 300; // TODO Make this configurable
    tagWeights.forEach(function(value,key,map) { // Get rid of any tags with weight = 0
      if(tagWeights.get(key) == 0) map.delete(key);
    });

    // Map sources to our tags
    let taggedSources = Array<Array<string>>();
    for (let source of this.props.library) {
      for (let tag of source.tags) {
        let index = 0;
        for (let weightedTag of tagWeights.keys()) {
          if (tag.name == weightedTag.name) {
            if (taggedSources[index] == undefined) {
              taggedSources[index] = [];
            }
            // If this source has tag that we are weighting, add it array
            taggedSources[index].push(source.url);
          }
          index+=1;
        }
      }
    }

    let sceneSources = Array<string>();
    let index = 0;
    for (let tag of tagWeights.keys()) {
      if (taggedSources[index] != undefined) { // If we actually found sources for this tag
        // Add sources equal to this tags percent of the max
        sceneSources = sceneSources.concat(getRandomListItem(taggedSources[index], (tagWeights.get(tag) / sum) * max));
      }
      index+=1;
    }
    // Randomize our whole list
    sceneSources = getRandomListItem(sceneSources, sceneSources.length);

    // Make a new scene
    this.props.onGenerate(removeDuplicatesBy((s: string) => s, sceneSources));
  }
}
