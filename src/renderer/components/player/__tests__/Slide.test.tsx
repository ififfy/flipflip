import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Slide from "../Slide";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";

describe("Slide", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const image = window.document.createElement('img')
    image.setAttribute('key', 'test')
    const component = renderer.create(
      <TestProvider>
        <Slide
          image={image}
          scene={scene}
          timeToNextFrame={0}
          currentAudio={null}
        >
          <p>Test</p>
        </Slide>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
