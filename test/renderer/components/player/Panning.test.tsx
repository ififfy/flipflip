import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Panning from "../../../../src/renderer/components/player/Panning";
import TestProvider from "../../../util/TestProvider";
import Scene from "../../../../src/renderer/data/Scene";

describe("Panning", () => {
  it("should match snapshot", () => {
    const scene = new Scene()
    const component = renderer.create(
      <TestProvider>
        <Panning
            togglePan={false}
            currentAudio={null}
            timeToNextFrame={0}
            scene={scene}
            panFunction={() => {}}
        >
          <p>Test</p>
        </Panning>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
