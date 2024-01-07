import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneOptions from "../SceneOptions";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../../configGroups/ImageVideoCard', () => 'ImageVideoCard');
jest.mock('../../configGroups/SceneOptionCard', () => 'SceneOptionCard');

describe("SceneOptions", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <SceneOptions
          allScenes={[]}
          allSceneGrids={[]}
          scene={null}
          tutorial={null}
          isConfig={false}
          onUpdateScene={(scene, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
