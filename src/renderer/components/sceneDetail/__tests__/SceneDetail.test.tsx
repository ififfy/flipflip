import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneDetail from "../SceneDetail";
import TestProvider from "../../../../../test/util/TestProvider";
import Config from "../../../data/Config";
import Scene from "../../../data/Scene";

jest.mock('../SceneEffects', () => 'SceneEffects');
jest.mock('../SceneGenerator', () => 'SceneGenerator');
jest.mock('../SceneOptions', () => 'SceneOptions');
jest.mock('../URLDialog', () => 'URLDialog');
jest.mock('../../library/LibrarySearch', () => 'LibrarySearch');
jest.mock('../../library/SourceList', () => 'SourceList');
jest.mock('../AudioTextEffects', () => 'AudioTextEffects');
jest.mock('../PiwigoDialog', () => 'PiwigoDialog');
jest.mock('../../library/SourceIcon', () => 'SourceIcon');

describe("SceneDetail", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const config = new Config();
    const component = renderer.create(
      <TestProvider>
        <SceneDetail
          allScenes={[]}
          allSceneGrids={[]}
          autoEdit={false}
          config={config}
          library={[]}
          scene={scene}
          tags={[]}
          tutorial={null}
          goBack={() => {}}
          onAddSource={(scene, type, args) => {}}
          onAddScript={(playlistIndex) => {}}
          onAddTracks={(playlistIndex) => {}}
          onClearBlacklist={(sourceURL) => {}}
          onClip={(source, displayed) => {}}
          onCloneScene={(scene) => {}}
          onDelete={(scene) => {}}
          onDownload={(source) => {}}
          onEditBlacklist={(sourceURL, blacklist) => {}}
          onExport={(scene) => {}}
          onGenerate={(scene, children, force) => {}}
          onPlayScene={(scene) => {}}
          onPlay={(source, displayed) => {}}
          onPlayAudio={(source, displayed) => {}}
          onPlayScript={(source, sceneID, displayed) => {}}
          onResetScene={(scene) => {}}
          onSaveAsScene={(scene) => {}}
          onSort={(scene, algorithm, ascending) => {}}
          onTutorial={(tutorial) => {}}
          onUpdateScene={(scene, fn) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
