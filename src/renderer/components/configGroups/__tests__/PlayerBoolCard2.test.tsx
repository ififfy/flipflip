import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlayerBoolCard2 from "../PlayerBoolCard2";
import TestProvider from "../../../../../test/util/TestProvider";
import { GeneralSettings } from "../../../data/Config";

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
