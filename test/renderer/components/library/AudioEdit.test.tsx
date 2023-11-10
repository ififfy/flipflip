import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioEdit from "../../../../src/renderer/components/library/AudioEdit";
import TestProvider from "../../../util/TestProvider";

// mocking this so that test doesn't throw error
jest.mock('@mui/base/TextareaAutosize', () => 'TextareaAutosize');

describe("AudioEdit", () => {
  it("should match snapshot", () => {
    const audio = new Audio();
    const component = renderer.create(
      <TestProvider>
        <AudioEdit
          audio={audio}
          cachePath=""
          title=""
          onCancel={() => {}}
          onFinishEdit={(common) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
