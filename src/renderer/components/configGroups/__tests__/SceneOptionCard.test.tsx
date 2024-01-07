import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneOptionCard from "../SceneOptionCard";
import TestProvider from "../../../../../test/util/TestProvider";
import { SceneSettings } from "../../../data/Config";

jest.mock('../SceneSelect', () => 'SceneSelect');
jest.mock('../../config/ColorPicker', () => 'ColorPicker');
jest.mock('../../config/ColorSetPicker', () => 'ColorSetPicker');
jest.mock('../MultiSceneSelect', () => 'MultiSceneSelect');

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
