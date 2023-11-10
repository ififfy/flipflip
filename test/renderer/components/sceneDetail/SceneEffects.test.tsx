import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneEffects from "../../../../src/renderer/components/sceneDetail/SceneEffects";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/components/configGroups/CrossFadeCard', () => 'CrossFadeCard');
jest.mock('../../../../src/renderer/components/configGroups/SlideCard', () => 'SlideCard');
jest.mock('../../../../src/renderer/components/configGroups/StrobeCard', () => 'StrobeCard');
jest.mock('../../../../src/renderer/components/configGroups/ZoomMoveCard', () => 'ZoomMoveCard');
jest.mock('../../../../src/renderer/components/configGroups/FadeIOCard', () => 'FadeIOCard');
jest.mock('../../../../src/renderer/components/configGroups/PanningCard', () => 'PanningCard');

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
