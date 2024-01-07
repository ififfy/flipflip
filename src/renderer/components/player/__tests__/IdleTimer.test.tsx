import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import { IdleTimer } from "../IdleTimer";
import TestProvider from "../../../../../test/util/TestProvider";

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
