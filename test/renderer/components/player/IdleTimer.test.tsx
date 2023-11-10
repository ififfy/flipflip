import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import { IdleTimer } from "../../../../src/renderer/components/player/IdleTimer";
import TestProvider from "../../../util/TestProvider";

describe("IdleTimer", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <IdleTimer>
          <p>Test</p>
        </IdleTimer>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
