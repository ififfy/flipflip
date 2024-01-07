import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import VideoCard from "../VideoCard";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../../player/VideoControl', () => 'VideoControl');

describe("VideoCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <VideoCard
            scene={null}
            otherScenes={[]}
            isPlaying={false}
            mainVideo={null}
            mainClip={null}
            mainClipValue={[]}
            otherVideos={[]}
            imagePlayerAdvanceHacks={[]}
            onUpdateScene={(scene, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
