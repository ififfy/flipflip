import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneGenerator from "../../../../src/renderer/components/sceneDetail/SceneGenerator";
import TestProvider from "../../../util/TestProvider";
import Scene from "../../../../src/renderer/data/Scene";

jest.mock('../../../../src/renderer/components/library/LibrarySearch', () => 'LibrarySearch');

// mocking this so that test doesn't throw error
jest.mock('@mui/material/MenuList', () => 'MenuList');

describe("SceneGenerator", () => {
  it("should match snapshot", () => {
    const scene = new Scene({generatorWeights: []});
    const component = renderer.create(
      <TestProvider>
        <SceneGenerator
          library={[]}
          scene={scene}
          tags={[]}
          tutorial={null}
          onTutorial={(tutorial) => {}}
          onUpdateScene={(scene, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
