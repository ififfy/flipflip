import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptLibrary from "../ScriptLibrary";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../LibrarySearch', () => 'LibrarySearch');
jest.mock('../ScriptSourceList', () => 'ScriptSourceList');

describe("ScriptLibrary", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <ScriptLibrary
          allScenes={[]}
          filters={[]}
          library={[]}
          selected={[]}
          specialMode={null}
          tags={[]}
          tutorial={null}
          yOffset={0}
          goBack={() => {}}
          onBatchTag={() => {}}
          onEditScript={(source) => {}}
          onImportFromLibrary={(sources) => {}}
          onImportToScriptor={(source) => {}}
          onManageTags={() => {}}
          onPlay={(source, sceneID, displayed) => {}}
          onSort={(algorithm, ascending) => {}}
          onTutorial={(tutorial) => {}}
          onUpdateLibrary={(fn) => {}}
          onUpdateMode={(mode) => {}}
          onUpdateScript={(script) => {}}
          savePosition={(yOffset, filters, selected) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
