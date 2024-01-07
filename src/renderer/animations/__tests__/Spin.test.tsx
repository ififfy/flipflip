import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Spin from "../Spin";

describe("Spin", () => {
  it("should match snapshot", () => {
    const component = renderer.create(<Spin />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
