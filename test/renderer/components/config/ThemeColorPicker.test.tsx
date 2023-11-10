import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ThemeColorPicker from "../../../../src/renderer/components/config/ThemeColorPicker";
import TestProvider from "../../../util/TestProvider";

describe("ThemeColorPicker", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <ThemeColorPicker currentColor="#fff" onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
