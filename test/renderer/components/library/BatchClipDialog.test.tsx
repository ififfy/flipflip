import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import BatchClipDialog from "../../../../src/renderer/components/library/BatchClipDialog";
import TestProvider from "../../../util/TestProvider";

describe("BatchClipDialog", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <BatchClipDialog
            open={false}
            library={[]}
            selected={[]}
            onCloseDialog={()=>{}}
            onUpdateLibrary={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
