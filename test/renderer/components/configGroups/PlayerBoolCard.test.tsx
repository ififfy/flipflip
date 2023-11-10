import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlayerBoolCard from "../../../../src/renderer/components/configGroups/PlayerBoolCard";
import TestProvider from "../../../util/TestProvider";
import { DisplaySettings } from "../../../../src/renderer/data/Config";

describe("PlayerBoolCard", () => {
  it("should match snapshot", () => {
    const settings = new DisplaySettings();
    const component = renderer.create(
      <TestProvider>
        <PlayerBoolCard
          displaySettings={settings}
          onUpdateDisplaySettings={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
