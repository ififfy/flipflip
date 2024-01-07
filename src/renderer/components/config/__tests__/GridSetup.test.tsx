import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import GridSetup from "../GridSetup";
import TestProvider from "../../../../../test/util/TestProvider";
import SceneGrid from "../../../data/SceneGrid";

jest.mock('../../configGroups/SceneSelect', () => 'SceneSelect');

// mocking this so that test doesn't throw error
jest.mock('@mui/material/MenuList', () => 'MenuList');

describe("GridSetup", () => {
  it("should match snapshot", () => {
    const sceneGrid = new SceneGrid({ name: 'test' })
    const component = renderer.create(
      <TestProvider>
        <GridSetup
            allScenes={[]}
            autoEdit={false}
            scene={sceneGrid}
            tutorial={null}
            goBack={() => {}}
            onDelete={(grid) => {}}
            onGenerate={(scene, children, force) => {}}
            onPlayGrid={(grid) => {}}
            onTutorial={(tutorial) => {}}
            onUpdateGrid={(grid, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
