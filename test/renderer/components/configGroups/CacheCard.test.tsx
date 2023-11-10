import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CacheCard from "../../../../src/renderer/components/configGroups/CacheCard";
import TestProvider from "../../../util/TestProvider";
import Config from "../../../../src/renderer/data/Config";

describe("CacheCard", () => {
  it("should match snapshot", () => {
    const config = new Config()
    const component = renderer.create(
      <TestProvider>
        <CacheCard config={config} onUpdateSettings={(fn) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
