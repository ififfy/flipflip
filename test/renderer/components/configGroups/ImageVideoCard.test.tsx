import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ImageVideoCard from "../../../../src/renderer/components/configGroups/ImageVideoCard";
import TestProvider from "../../../util/TestProvider";
import { SceneSettings } from "../../../../src/renderer/data/Config";

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider');

describe("ImageVideoCard", () => {
  it("should match snapshot", () => {
    const settings = new SceneSettings()
    const component = renderer.create(
      <TestProvider>
        <ImageVideoCard
          scene={settings}
          easingControls={false}
          sidebar={false}
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
