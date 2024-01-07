import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneEffects from "../SceneEffects";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../../configGroups/CrossFadeCard', () => 'CrossFadeCard');
jest.mock('../../configGroups/SlideCard', () => 'SlideCard');
jest.mock('../../configGroups/StrobeCard', () => 'StrobeCard');
jest.mock('../../configGroups/ZoomMoveCard', () => 'ZoomMoveCard');
jest.mock('../../configGroups/FadeIOCard', () => 'FadeIOCard');
jest.mock('../../configGroups/PanningCard', () => 'PanningCard');

describe("SceneEffects", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <SceneEffects
          scene={null}
          easingControls={false}
          tutorial={null}
          onUpdateScene={(scene, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
