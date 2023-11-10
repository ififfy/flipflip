import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import VideoControl from "../../../../src/renderer/components/player/VideoControl";
import TestProvider from "../../../util/TestProvider";

describe("VideoControl", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <VideoControl video={null} onChangeVolume={(volume) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
