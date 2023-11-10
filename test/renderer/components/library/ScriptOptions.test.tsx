import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptOptions from "../../../../src/renderer/components/library/ScriptOptions";
import TestProvider from "../../../util/TestProvider";
import CaptionScript from "../../../../src/renderer/data/CaptionScript";

jest.mock('../../../../src/renderer/components/library/FontOptions', () => 'FontOptions');

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
