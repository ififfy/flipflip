import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneSelect from "../SceneSelect";
import TestProvider from "../../../../../test/util/TestProvider";

describe("SceneSelect", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <SceneSelect
            allScenes={[]}
            value={0}
            getSceneName={(sceneID) => ''}
            onChange={(sceneID) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
