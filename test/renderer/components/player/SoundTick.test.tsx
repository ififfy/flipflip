import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SoundTick from "../../../../src/renderer/components/player/SoundTick";
import TestProvider from "../../../util/TestProvider";

describe("SoundTick", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <SoundTick
          url={null}
          playing={null}
          speed={1}
          volume={0}
          tick={false}
          onPlaying={(soundData) => {}}
          onError={(errorCode, description) => {}}
          onFinishedPlaying={() => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
