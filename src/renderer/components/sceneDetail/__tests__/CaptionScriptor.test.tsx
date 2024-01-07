import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CaptionScriptor from "../CaptionScriptor";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../../player/Player', () => 'Player');
jest.mock('../../configGroups/SceneSelect', () => 'SceneSelect');
jest.mock('../../player/CaptionProgram', () => 'CaptionProgram');
jest.mock('../../configGroups/AudioCard', () => 'AudioCard');
jest.mock('../../library/FontOptions', () => 'FontOptions');

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider');

describe("CaptionScriptor", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <CaptionScriptor
          config={null}
          openScript={null}
          scenes={[]}
          sceneGrids={[]}
          theme={null}
          tutorial={null}
          onAddFromLibrary={() => {}}
          getTags={(source) => []}
          goBack={() => {}}
          onUpdateScene={(scene, fn) => {}}
          onUpdateLibrary={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
