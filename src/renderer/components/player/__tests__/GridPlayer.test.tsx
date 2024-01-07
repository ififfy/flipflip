import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import GridPlayer from "../GridPlayer";
import TestProvider from "../../../../../test/util/TestProvider";
import SceneGrid from "../../../data/SceneGrid";

jest.mock('../Player', () => 'Player');

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
