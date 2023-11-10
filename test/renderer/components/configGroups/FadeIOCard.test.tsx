import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import FadeIOCard from "../../../../src/renderer/components/configGroups/FadeIOCard";
import TestProvider from "../../../util/TestProvider";
import { SceneSettings } from "../../../../src/renderer/data/Config";

describe("FadeIOCard", () => {
  it("should match snapshot", () => {
    const settings = new SceneSettings()
    const component = renderer.create(
      <TestProvider>
        <FadeIOCard
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
