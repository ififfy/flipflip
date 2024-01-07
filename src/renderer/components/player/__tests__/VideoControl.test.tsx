import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import VideoControl from "../VideoControl";
import TestProvider from "../../../../../test/util/TestProvider";

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
