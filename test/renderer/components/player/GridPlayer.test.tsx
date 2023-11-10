import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import GridPlayer from "../../../../src/renderer/components/player/GridPlayer";
import TestProvider from "../../../util/TestProvider";
import SceneGrid from "../../../../src/renderer/data/SceneGrid";

jest.mock('../../../../src/renderer/components/player/Player', () => 'Player');

describe("GridPlayer", () => {
  it("should match snapshot", () => {
    const sceneGrid = new SceneGrid();
    const component = renderer.create(
      <TestProvider>
        <GridPlayer
          config={null}
          scene={sceneGrid}
          allScenes={[]}
          sceneGrids={[]}
          theme={null}
          cache={(i) => {}}
          getTags={(source) => []}
          goBack={() => {}}
          onGenerate={(scene, children, force) => {}}
          setCount={(sourceURL, count, countComplete) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
