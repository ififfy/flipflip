import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Tutorial from "../../../src/renderer/components/Tutorial";
import TestProvider from "../../util/TestProvider";
import Config from "../../../src/renderer/data/Config";

describe("Tutorial", () => {
  it("should match snapshot", () => {
    const config = new Config()
    const component = renderer.create(
      <TestProvider>
        <Tutorial
          config={config}
          route={[]}
          scene={null}
          tutorial={null}
          onDoneTutorial={(lastTutorial: string) => {}}
          onSetTutorial={(nextTutorial: string) => {}}
          onSkipAllTutorials={() => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
