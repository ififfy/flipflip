import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import URLDialog from "../URLDialog";
import TestProvider from "../../../../../test/util/TestProvider";

describe("URLDialog", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <URLDialog
          open={false}
          onClose={() => {}}
          onImportURL={(type, e, args) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
