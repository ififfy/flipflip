import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import APICard from "../../../../src/renderer/components/configGroups/APICard";
import TestProvider from "../../../util/TestProvider";
import { RemoteSettings } from "../../../../src/renderer/data/Config";

jest.mock("../../../../src/renderer/components/library/SourceIcon", () => "SourceIcon");

describe("APICard", () => {
  it("should match snapshot", () => {
    const settings = new RemoteSettings();
    const component = renderer.create(
      <TestProvider>
        <APICard
          settings={settings}
          onUpdateSettings={(fn) => {}}
          onUpdateConfig={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
