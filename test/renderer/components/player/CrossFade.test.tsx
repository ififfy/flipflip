import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CrossFade from "../../../../src/renderer/components/player/CrossFade";
import TestProvider from "../../../util/TestProvider";
import Scene from "../../../../src/renderer/data/Scene";

describe("CrossFade", () => {
  it("should match snapshot", () => {
    const scene = new Scene()
    const component = renderer.create(
      <TestProvider>
        <CrossFade 
            image={null}
            scene={scene}
            timeToNextFrame={0}
            currentAudio={null}
        >
          <p>Test</p>
        </CrossFade>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
