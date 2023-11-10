import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Jiggle from "../../../src/renderer/animations/Jiggle";

describe("Jiggle", () => {
  it("should match snapshot", () => {
    const component = renderer.create(<Jiggle />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
