import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioAlert from "../AudioAlert";
import TestProvider from "../../../../../test/util/TestProvider";
import Audio from "../../../data/Audio";

describe("AudioAlert", () => {
  it("should match snapshot", () => {
    const audio = new Audio();
    const component = renderer.create(
      <TestProvider>
        <AudioAlert audio={audio} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
