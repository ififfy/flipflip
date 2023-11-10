import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlayerBoolCard2 from "../../../../src/renderer/components/configGroups/PlayerBoolCard2";
import TestProvider from "../../../util/TestProvider";
import { GeneralSettings } from "../../../../src/renderer/data/Config";

describe("PlayerBoolCard2", () => {
  it("should match snapshot", () => {
    const settings = new GeneralSettings();
    const component = renderer.create(
      <TestProvider>
        <PlayerBoolCard2
            generalSettings={settings}
            onPortableOverride={() => {}}
            onUpdateGeneralSettings={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
