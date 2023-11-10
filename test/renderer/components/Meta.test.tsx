import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Meta from "../../../src/renderer/components/Meta";
import TestProvider from "../../util/TestProvider";

jest.mock('../../../src/main/ErrorBoundary', () => 'ErrorBoundary');
jest.mock('../../../src/renderer/components/ScenePicker', () => 'ScenePicker');
jest.mock('../../../src/renderer/components/config/ConfigForm', () => 'ConfigForm');
jest.mock('../../../src/renderer/components/library/Library', () => 'Library');
jest.mock('../../../src/renderer/components/library/TagManager', () => 'TagManager');
jest.mock('../../../src/renderer/components/config/GridSetup', () => 'GridSetup');
jest.mock('../../../src/renderer/components/config/VideoClipper', () => 'VideoClipper');
jest.mock('../../../src/renderer/components/player/Player', () => 'Player');
jest.mock('../../../src/renderer/components/sceneDetail/SceneDetail', () => 'SceneDetail');
jest.mock('../../../src/renderer/components/Tutorial', () => 'Tutorial');
jest.mock('../../../src/renderer/components/library/AudioLibrary', () => 'AudioLibrary');
jest.mock('../../../src/renderer/components/sceneDetail/CaptionScriptor', () => 'CaptionScriptor');
jest.mock('../../../src/renderer/components/library/ScriptLibrary', () => 'ScriptLibrary');

describe("Meta", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <Meta/>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
