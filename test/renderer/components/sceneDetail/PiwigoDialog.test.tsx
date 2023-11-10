import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PiwigoDialog from "../../../../src/renderer/components/sceneDetail/PiwigoDialog";
import TestProvider from "../../../util/TestProvider";
import Config from "../../../../src/renderer/data/Config";

describe("PiwigoDialog", () => {
  it("should match snapshot", () => {
    const config = new Config();
    const component = renderer.create(
      <TestProvider>
        <PiwigoDialog
          config={config}
          open={false}
          onClose={() => {}}
          onImportURL={(type: string, e: MouseEvent, ...args: any[]) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
