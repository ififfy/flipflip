import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlayerNumCard from "../../../../src/renderer/components/configGroups/PlayerNumCard";
import TestProvider from "../../../util/TestProvider";
import { DisplaySettings } from "../../../../src/renderer/data/Config";

describe("PlayerNumCard", () => {
  it("should match snapshot", () => {
    const settings = new DisplaySettings();
    const component = renderer.create(
      <TestProvider>
        <PlayerNumCard 
          library={[]}
          tags={[]}
          settings={settings}
          onUpdateSettings={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
