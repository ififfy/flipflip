import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ErrorBoundary from "../../src/main/ErrorBoundary";
import TestProvider from "../util/TestProvider";

describe("ErrorBoundary", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <ErrorBoundary
          version="1.0.0"
          goBack={() => {}}
          onRestore={(backupFile) => {}}
        >
          <p>FlipFlip</p>
        </ErrorBoundary>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
