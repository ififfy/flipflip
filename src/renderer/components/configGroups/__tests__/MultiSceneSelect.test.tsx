import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import MultiSceneSelect from "../MultiSceneSelect";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";

describe("MultiSceneSelect", () => {
  it("should match snapshot", () => {
    const scene = new Scene()
    const component = renderer.create(
      <TestProvider>
        <MultiSceneSelect
          scene={scene}
          allScenes={[]}
          values={[]}
          getSceneName={(sceneID) => ''}
          onChange={(sceneIDs) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
