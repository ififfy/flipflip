import * as React from "react";

import {TT} from "../../const";
import {getRandomListItem, removeDuplicatesBy} from "../../utils";
import Scene from "../../Scene";
import LibrarySource from "./LibrarySource";
import Tag from "./Tag";
import ControlGroup from "../sceneDetail/ControlGroup";
import Modal from "../ui/Modal";
import SimpleRadioInput from "../ui/SimpleRadioInput";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleNumberInput from "../ui/SimpleNumberInput";

class TagWeight {
  type: string;
  value: number;

  constructor(type: string, value: number) {
    this.type = type;
    this.value = value;
  }
}

export default class SceneGenerator extends React.Component {
  readonly nameInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  readonly props: {
    library: Array<LibrarySource>,
    tags: Array<Tag>,
    scene: Scene,
    autoEdit: boolean,
    scenes: Array<Scene>,
    goBack(): void,
    onGenerate(): void,
    onUpdateScene(scene: Scene, fn: (scene: Scene) => void): void,
    onDelete(scene: Scene): void,
  };

  readonly state = {
    errorMessage: "",
    isEditingName: this.props.autoEdit,
  };

  render() {
    const tagWeights = new Map<Tag, TagWeight>(JSON.parse(this.props.scene.tagWeights));
    let sceneWeights = new Map<number, TagWeight>();
    if (this.props.scene.sceneWeights != null) {
      sceneWeights = new Map<number, TagWeight>(JSON.parse(this.props.scene.sceneWeights));
    }
    const weights = Array.from(tagWeights.values()).concat(Array.from(sceneWeights.values()));
    const sum = weights.length > 0 ? weights.map((w) => w.value).reduce((total, value) => Number(total) + Number(value)) : 0;
    const hasAll = weights.filter((w) => w.type == TT.all).length > 0;

    return (
      <div className="SceneGenerator">
        <div className="u-button-row">
          <div className="u-abs-center">
            {this.state.isEditingName && (
              <form className="SceneNameForm" onSubmit={this.endEditingName.bind(this)}>
                <input
                  autoFocus
                  type="text"
                  ref={this.nameInputRef}
                  value={this.props.scene.name}
                  onBlur={this.endEditingName.bind(this)}
                  onChange={this.updateSceneName.bind(this)}/>
              </form>
            )}
            {!this.state.isEditingName && (
              <h2
                className="SceneGenerator__SceneGeneratorHeader u-clickable"
                onClick={this.beginEditingName.bind(this)}>{this.props.scene.name}</h2>
            )}
          </div>

          <div className="u-button-row-right">
            <SimpleNumberInput
              label="Max"
              value={this.props.scene.generatorMax}
              min={0}
              isEnabled={true}
              onChange={this.onUpdateMax.bind(this)}/>
            <div
              className={`SceneGenerator__Generate u-button ${this.props.scene.sources.length > 0 ? 'u-clickable' : 'u-disabled'}`}
              onClick={this.props.scene.sources.length > 0 ? this.previousScene.bind(this) : this.nop}>
              Previous Scene
            </div>
            <div
              className={`SceneGenerator__Generate u-button ${(sum > 0 || hasAll) && this.props.scene.generatorMax > 0 ? 'u-clickable' : 'u-disabled'}`}
              onClick={(sum > 0 || hasAll) && this.props.scene.generatorMax > 0 ? this.generateScene.bind(this, tagWeights, sceneWeights) : this.nop}>
              Generate Scene
            </div>
          </div>
          <div className="BackButton u-button u-clickable" onClick={this.props.goBack}>Back</div>
          <div
            className="DeleteButton u-destructive u-button u-clickable"
            onClick={this.props.onDelete.bind(this, this.props.scene)}>
            Delete
          </div>
        </div>

        <div className="SceneGenerator__Content">
          <div className="ControlGroupGroup">
            {this.props.tags.map((tag) => {
              // If this weight hasn't been set before, it won't be in the map
              const mapTagArray =  Array.from(tagWeights.keys()).filter((t) => t.id == tag.id);
              const found = mapTagArray.length > 0;
              const weight = found ? tagWeights.get(mapTagArray[0]).value : 0;
              const type = found ? tagWeights.get(mapTagArray[0]).type : TT.weight;
              let percentage = "--";
              if (sum > 0 && weight > 0) {
                percentage = Math.round((weight / sum) * 100) + "%";
              }
              return (
                <ControlGroup key={"t" + tag.id} title={tag.name} isNarrow={true}
                              canCollapse={type == TT.weight && weight == 0}
                              startCollapsed={type == TT.weight && weight == 0}
                              bold={type != TT.weight || weight > 0}>
                  <span style={{fontWeight: type == TT.weight && weight > 0 ? "bolder" : "initial", opacity: type == TT.weight ? 1 : 0.3}}>{"Weight: " + weight}</span>
                  <span style={{fontWeight: type == TT.weight && percentage != "--" ? "bolder" : "initial", opacity: type == TT.weight ? 1 : 0.3}}>{"Percentage: " + percentage}</span>
                  <SimpleSliderInput
                    isEnabled={type == TT.weight}
                    onChange={this.onChangeTagWeight.bind(this, tag)}
                    label=""
                    min={0}
                    max={100}
                    value={weight}/>
                  <SimpleRadioInput
                    label=""
                    groupName={tag.name}
                    value={type}
                    keys={Object.values(TT)}
                    bold={true}
                    onChange={this.onChangeTagType.bind(this, tag)}
                  />
                </ControlGroup>
              )}
            )}
          </div>
          <hr/>
          <div className="ControlGroupGroup">
            {this.props.scenes.filter((s) => s.id !== this.props.scene.id).map((scene) => {
              // If this weight hasn't been set before, it won't be in the map
              const mapScene =  sceneWeights.get(scene.id);
              const weight = mapScene != null ? mapScene.value : 0;
              let percentage = "--";
              if (sum > 0 && weight > 0) {
                percentage = Math.round((weight / sum) * 100) + "%";
              }
              return (
                <ControlGroup key={"s" + scene.id} title={scene.name} isNarrow={true}
                              canCollapse={weight == 0}
                              startCollapsed={weight == 0}
                              bold={weight > 0}>
                  <span style={{fontWeight: weight > 0 ? "bolder" : "initial", opacity: 1}}>{"Weight: " + weight}</span>
                  <span style={{fontWeight: percentage != "--" ? "bolder" : "initial", opacity: 1}}>{"Percentage: " + percentage}</span>
                  <SimpleSliderInput
                    isEnabled={true}
                    onChange={this.onChangeSceneWeight.bind(this, scene)}
                    label=""
                    min={0}
                    max={100}
                    value={weight}/>
                </ControlGroup>
              )}
            )}
          </div>
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

  componentDidMount() {
    if (this.nameInputRef.current) {
      this.nameInputRef.current.select();
      this.nameInputRef.current.focus();
    }
  }

  nop() {}

  onErrorClose() {
    this.setState({errorMessage: ""});
  }

  onUpdateMax(generatorMax: number) {
    this.update((s) => { s.generatorMax = generatorMax; });
  }

  beginEditingName() {
    this.setState({isEditingName: true});
  }

  endEditingName(e: Event) {
    e.preventDefault();
    this.setState({isEditingName: false});
  }

  update(fn: (scene: Scene) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  updateTagWeights(tagWeights: string) {
    this.update((s) => { s.tagWeights = tagWeights; });
  }

  updateSceneWeights(sceneWeights: string) {
    this.update((s) => { s.sceneWeights = sceneWeights; });
  }

  updateSceneSources(sources: Array<LibrarySource>) {
    this.update((s) => { s.sources = sources; });
  }

  updateSceneName(e: React.FormEvent<HTMLInputElement>) {
    this.update((s) => { s.name = e.currentTarget.value; });
  }

  onChangeSceneWeight(scene: Scene, weight: number) {
    let sceneWeights = new Map<number, TagWeight>();
    if (this.props.scene.sceneWeights != null) {
      sceneWeights = new Map<number, TagWeight>(JSON.parse(this.props.scene.sceneWeights));
    }

    let sceneWeight = sceneWeights.get(scene.id);
    if (sceneWeight != null) {
      sceneWeight.value = weight;
    } else {
      sceneWeights.set(scene.id, new TagWeight(TT.weight, weight));
    }
    this.updateSceneWeights(JSON.stringify(Array.from(sceneWeights)));
  }

  onChangeTagWeight(tag: Tag, weight: number) {
    const tagWeights = new Map<Tag, TagWeight>(JSON.parse(this.props.scene.tagWeights));

    let found = false;
    for (let key of tagWeights.keys()) {
      if (tag.id == key.id) {
        let tagWeight = tagWeights.get(key);
        tagWeight.value = weight;
        tagWeights.set(key, tagWeight);
        found = true;
        break;
      }
    }

    // If this weight hasn't been set before, it won't be in the map
    // Make a new TagWeight object
    if (!found) {
      tagWeights.set(tag, new TagWeight(TT.weight, weight));
    }

    this.updateTagWeights(JSON.stringify(Array.from(tagWeights)));
  }

  onChangeTagType(tag: Tag, type: string) {
    const tagWeights = new Map<Tag, TagWeight>(JSON.parse(this.props.scene.tagWeights));

    let found = false;
    for (let key of tagWeights.keys()) {
      if (tag.id == key.id) {
        let tagWeight = tagWeights.get(key);
        tagWeight.type = type;
        tagWeights.set(key, tagWeight);
        found = true;
        break;
      }
    }

    // If this weight hasn't been set before, it won't be in the map
    // Make a new TagWeight object
    if (!found) {
      tagWeights.set(tag, new TagWeight(type, 0));
    }

    this.updateTagWeights(JSON.stringify(Array.from(tagWeights)));
  }

  previousScene() {
    this.props.onGenerate();
  }

  getScene(id: number): Scene {
    return this.props.scenes.find((s) => s.id === id);
  }

  generateScene(tagWeightMap: Map<Tag, TagWeight>, sceneWeightMap: Map<number, TagWeight>) {
    tagWeightMap = new Map(tagWeightMap);
    sceneWeightMap = new Map(sceneWeightMap);
    const weights = Array.from(tagWeightMap.values()).concat(Array.from(sceneWeightMap.values()));
    const sum = weights.length > 0 ? weights.map((w) => w.value).reduce((total, weight) => Number(total) + Number(weight)) : 1;
    let allList = Array<string>();
    let noneList = Array<string>();
    tagWeightMap.forEach(function (value, key, map) { // Get rid of any weighted tags with weight = 0
      if (value.type == TT.weight && value.value == 0) {
        map.delete(key);
      } else if (value.type == TT.all) {
        allList.push(key.name);
        map.delete(key);
      } else if (value.type == TT.none) {
        noneList.push(key.name);
        map.delete(key);
      }
    });
    sceneWeightMap.forEach(function (value, key, map) {
      if (value.value == 0) {
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
              checkTag(taggedSources, sourceTags, source.url, index);
            }
            index += 1;
          }
        } else { // If we only have Alls
          checkTag(taggedSources, sourceTags, source.url, 0);
        }
      }
    }

    let randomSources = Array<string>();
    if (tagWeightMap.size > 0 || sceneWeightMap.size > 0) { // If we have weights
      let index = 0;
      for (let tag of tagWeightMap.keys()) {
        if (taggedSources[index] != undefined) { // If we actually found sources for this tag
          let sources = taggedSources[index];
          sources = sources.filter((s) => !randomSources.includes(s));
          // Add sources equal to this tags percent of the max
          randomSources = randomSources.concat(getRandomListItem(sources, Math.round((tagWeightMap.get(tag).value / sum) * this.props.scene.generatorMax)));
        }
        index += 1;
      }
      for (let sceneId of sceneWeightMap.keys()) {
        let scene = this.getScene(sceneId);
        if (scene != undefined) {
          let sources = scene.sources.map((s) => s.url);
          sources = sources.filter((s) => !randomSources.includes(s));
          // Add sources equal to this scenes percent of the max
          randomSources = randomSources.concat(getRandomListItem(sources, Math.round((sceneWeightMap.get(sceneId).value / sum) * this.props.scene.generatorMax)));
        }
      }
    } else { // IF we only have Alls
      if (taggedSources[0] != undefined) { // If we actually found sources for this tag
        // Add sources equal to max
        randomSources = randomSources.concat(getRandomListItem(taggedSources[0], this.props.scene.generatorMax));
      }
    }
    // Randomize our whole list
    if (randomSources.length > 1) {
      randomSources = getRandomListItem(randomSources, randomSources.length);
    }

    if (randomSources.length == 0) {
      this.setState({errorMessage: "Sorry, no sources were found for this configuration ¯\\_(ツ)_/¯"});
      return;
    }

    // Set sources for scene
    let sceneSources = Array<LibrarySource>();
    for (let source of removeDuplicatesBy((s: string) => s, randomSources)) {
      sceneSources.push(new LibrarySource({
        url: source,
        id: sceneSources.length + 1,
        tags: new Array<Tag>(),
      }));
    }
    this.updateSceneSources(sceneSources);
    this.props.onGenerate();
  }
}
