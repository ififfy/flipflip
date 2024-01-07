import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Meta from "../Meta";
import TestProvider from "../../../../test/util/TestProvider";

jest.mock('../../../main/ErrorBoundary', () => 'ErrorBoundary');
jest.mock('../ScenePicker', () => 'ScenePicker');
jest.mock('../config/ConfigForm', () => 'ConfigForm');
jest.mock('../library/Library', () => 'Library');
jest.mock('../library/TagManager', () => 'TagManager');
jest.mock('../config/GridSetup', () => 'GridSetup');
jest.mock('../config/VideoClipper', () => 'VideoClipper');
jest.mock('../player/Player', () => 'Player');
jest.mock('../sceneDetail/SceneDetail', () => 'SceneDetail');
jest.mock('../Tutorial', () => 'Tutorial');
jest.mock('../library/AudioLibrary', () => 'AudioLibrary');
jest.mock('../sceneDetail/CaptionScriptor', () => 'CaptionScriptor');
jest.mock('../library/ScriptLibrary', () => 'ScriptLibrary');

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
