import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioControl from "../AudioControl";
import TestProvider from "../../../../../test/util/TestProvider";
import { RP } from "../../../data/const";
import Audio from "../../../data/Audio";

jest.mock('../SoundTick', () => 'SoundTick');

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider');

describe("AudioControl", () => {
  it("should match snapshot", () => {
    const audio = new Audio();
    const component = renderer.create(
      <TestProvider>
        <AudioControl
          audio={audio}
          audioEnabled={false}
          singleTrack={false}
          lastTrack={false}
          repeat={RP.none}
          scenePaths={[]}
          startPlaying={false}
          onAudioSliderChange={(e, value) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
