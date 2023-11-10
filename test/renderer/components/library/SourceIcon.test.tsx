import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SourceIcon from "../../../../src/renderer/components/library/SourceIcon";
import TestProvider from "../../../util/TestProvider";

describe("SourceIcon", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
