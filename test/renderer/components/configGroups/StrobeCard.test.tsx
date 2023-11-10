import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import StrobeCard from "../../../../src/renderer/components/configGroups/StrobeCard";
import TestProvider from "../../../util/TestProvider";
import { SceneSettings } from "../../../../src/renderer/data/Config";

jest.mock('../../../../src/renderer/components/config/ColorPicker', () => 'ColorPicker');
jest.mock('../../../../src/renderer/components/config/ColorSetPicker', () => 'ColorSetPicker');

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
