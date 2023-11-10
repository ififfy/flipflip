import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioTextEffects from "../../../../src/renderer/components/sceneDetail/AudioTextEffects";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/components/configGroups/AudioCard', () => 'AudioCard');
jest.mock('../../../../src/renderer/components/configGroups/TextCard', () => 'TextCard');

describe("AudioTextEffects", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <AudioTextEffects
          scene={null}
          onAddScript={(playlistIndex) => {}}
          onAddTracks={(playlistIndex) => {}}
          onPlayAudio={(source, displayed) => {}}
          onPlayScript={(source, sceneID, displayed) => {}}
          onUpdateScene={(scene, fn) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
