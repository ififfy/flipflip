import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioCard from "../../../../src/renderer/components/configGroups/AudioCard";
import TestProvider from "../../../util/TestProvider";
import Scene from "../../../../src/renderer/data/Scene";

jest.mock('../../../../src/renderer/components/player/AudioPlaylist', () => 'AudioPlaylist');
jest.mock('../../../../src/renderer/components/library/AudioOptions', () => 'AudioOptions');

describe("AudioCard", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const component = renderer.create(
      <TestProvider>
        <AudioCard
            scene={scene}
            sidebar={false}
            startPlaying={false}
            onUpdateScene={(scene, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
