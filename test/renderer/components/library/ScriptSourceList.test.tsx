import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptSourceList from "../../../../src/renderer/components/library/ScriptSourceList";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/components/library/ScriptSourceListItem', () => 'ScriptSourceListItem');
jest.mock('../../../../src/renderer/components/configGroups/SceneSelect', () => 'SceneSelect');
jest.mock('../../../../src/renderer/components/library/ScriptOptions', () => 'ScriptOptions');

describe("ScriptSourceList", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <ScriptSourceList
          library={[]}
          scenes={[]}
          showHelp={false}
          sources={[]}
          tutorial={null}
          onEditScript={(source) => {}}
          onPlay={(source, sceneID, displayed) => {}}
          onUpdateLibrary={(fn) => {}}
          onUpdateScript={(script) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
