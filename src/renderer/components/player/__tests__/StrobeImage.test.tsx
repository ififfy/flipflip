import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import StrobeImage from "../StrobeImage";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";

describe("StrobeImage", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const component = renderer.create(
      <TestProvider>
        <StrobeImage scene={scene} timeToNextFrame={0} currentAudio={null}>
          <p>Test</p>
        </StrobeImage>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
