import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import FadeInOut from "../FadeInOut";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";

describe("FadeInOut", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const component = renderer.create(
      <TestProvider>
        <FadeInOut
          toggleFade={false}
          currentAudio={null}
          timeToNextFrame={0}
          scene={scene}
          fadeFunction={() => {}}
        >
          <p>Test</p>
        </FadeInOut>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
