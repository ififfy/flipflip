import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ZoomMove from "../ZoomMove";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";

describe("ZoomMove", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const component = renderer.create(
      <TestProvider>
        <ZoomMove
          scene={scene}
          reset={false}
          timeToNextFrame={0}
          currentAudio={null}
        >
          <p>Test</p>
        </ZoomMove>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
