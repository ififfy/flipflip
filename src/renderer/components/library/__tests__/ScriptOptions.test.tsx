import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptOptions from "../ScriptOptions";
import TestProvider from "../../../../../test/util/TestProvider";
import CaptionScript from "../../../data/CaptionScript";

jest.mock('../FontOptions', () => 'FontOptions');

describe("ScriptOptions", () => {
  it("should match snapshot", () => {
    const script = new CaptionScript()
    const component = renderer.create(
      <TestProvider>
        <ScriptOptions
          script={script}
          onCancel={() => {}}
          onFinishEdit={(common) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
