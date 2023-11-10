import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CodeMirror from "../../../../src/renderer/components/sceneDetail/CodeMirror";
import TestProvider from "../../../util/TestProvider";

describe("CodeMirror", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <CodeMirror
          onGutterClick={(editor: any, clickedLine: number) => {}}
          onUpdateScript={(text: string, changed?: boolean) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
