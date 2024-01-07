import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ZoomMoveCard from "../ZoomMoveCard";
import TestProvider from "../../../../../test/util/TestProvider";
import { SceneSettings } from "../../../data/Config";

describe("ZoomMoveCard", () => {
  it("should match snapshot", () => {
    const settings = new SceneSettings();
    const component = renderer.create(
      <TestProvider>
        <ZoomMoveCard
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
