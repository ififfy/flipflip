import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CaptionScriptor from "../../../../src/renderer/components/sceneDetail/CaptionScriptor";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/components/player/Player', () => 'Player');
jest.mock('../../../../src/renderer/components/configGroups/SceneSelect', () => 'SceneSelect');
jest.mock('../../../../src/renderer/components/player/CaptionProgram', () => 'CaptionProgram');
jest.mock('../../../../src/renderer/components/configGroups/AudioCard', () => 'AudioCard');
jest.mock('../../../../src/renderer/components/library/FontOptions', () => 'FontOptions');

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
