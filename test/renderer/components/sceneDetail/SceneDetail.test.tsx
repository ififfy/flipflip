import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneDetail from "../../../../src/renderer/components/sceneDetail/SceneDetail";
import TestProvider from "../../../util/TestProvider";
import Config from "../../../../src/renderer/data/Config";
import Scene from "../../../../src/renderer/data/Scene";

jest.mock('../../../../src/renderer/components/sceneDetail/SceneEffects', () => 'SceneEffects');
jest.mock('../../../../src/renderer/components/sceneDetail/SceneGenerator', () => 'SceneGenerator');
jest.mock('../../../../src/renderer/components/sceneDetail/SceneOptions', () => 'SceneOptions');
jest.mock('../../../../src/renderer/components/sceneDetail/URLDialog', () => 'URLDialog');
jest.mock('../../../../src/renderer/components/library/LibrarySearch', () => 'LibrarySearch');
jest.mock('../../../../src/renderer/components/library/SourceList', () => 'SourceList');
jest.mock('../../../../src/renderer/components/sceneDetail/AudioTextEffects', () => 'AudioTextEffects');
jest.mock('../../../../src/renderer/components/sceneDetail/PiwigoDialog', () => 'PiwigoDialog');
jest.mock('../../../../src/renderer/components/library/SourceIcon', () => 'SourceIcon');

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
