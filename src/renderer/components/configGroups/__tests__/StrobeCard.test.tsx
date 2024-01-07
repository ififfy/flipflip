import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import StrobeCard from "../StrobeCard";
import TestProvider from "../../../../../test/util/TestProvider";
import { SceneSettings } from "../../../data/Config";

jest.mock('../../config/ColorPicker', () => 'ColorPicker');
jest.mock('../../config/ColorSetPicker', () => 'ColorSetPicker');

describe("StrobeCard", () => {
  it("should match snapshot", () => {
    const settings = new SceneSettings()
    const component = renderer.create(
      <TestProvider>
        <StrobeCard
          scene={settings}
          easingControls={false}
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
