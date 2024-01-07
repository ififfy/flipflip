import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import VSpin from "../VSpin";

describe("VSpin", () => {
  it("should match snapshot", () => {
    const component = renderer.create(<VSpin />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
