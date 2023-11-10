import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneOptionCard from "../../../../src/renderer/components/configGroups/SceneOptionCard";
import TestProvider from "../../../util/TestProvider";
import { SceneSettings } from "../../../../src/renderer/data/Config";

jest.mock('../../../../src/renderer/components/configGroups/SceneSelect', () => 'SceneSelect');
jest.mock('../../../../src/renderer/components/config/ColorPicker', () => 'ColorPicker');
jest.mock('../../../../src/renderer/components/config/ColorSetPicker', () => 'ColorSetPicker');
jest.mock('../../../../src/renderer/components/configGroups/MultiSceneSelect', () => 'MultiSceneSelect');

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider');

describe("SceneOptionCard", () => {
  it("should match snapshot", () => {
    const settings = new SceneSettings();
    const component = renderer.create(
      <TestProvider>
        <SceneOptionCard
            allScenes={[]}
            allSceneGrids={[]}
            scene={settings}
            sidebar={false}
            tutorial={null}
            onUpdateScene={(scene, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
