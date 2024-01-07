import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import GooninatorDialog from "../GooninatorDialog";
import TestProvider from "../../../../../test/util/TestProvider";

describe("GooninatorDialog", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <GooninatorDialog
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
