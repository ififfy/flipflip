import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneOptions from "../../../../src/renderer/components/sceneDetail/SceneOptions";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/components/configGroups/ImageVideoCard', () => 'ImageVideoCard');
jest.mock('../../../../src/renderer/components/configGroups/SceneOptionCard', () => 'SceneOptionCard');

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
