import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioCard from "../AudioCard";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";

jest.mock('../../player/AudioPlaylist', () => 'AudioPlaylist');
jest.mock('../../library/AudioOptions', () => 'AudioOptions');

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
