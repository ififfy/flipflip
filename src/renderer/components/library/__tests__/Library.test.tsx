import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Library from "../Library";
import TestProvider from "../../../../../test/util/TestProvider";
import Config from "../../../data/Config";

jest.mock('../BatchClipDialog', () => 'BatchClipDialog');
jest.mock('../LibrarySearch', () => 'LibrarySearch');
jest.mock('../SourceIcon', () => 'SourceIcon');
jest.mock('../SourceList', () => 'SourceList');
jest.mock('../../sceneDetail/URLDialog', () => 'URLDialog');
jest.mock('../../sceneDetail/PiwigoDialog', () => 'PiwigoDialog');

describe("Library", () => {
  it("should match snapshot", () => {
    const config = new Config();
    const component = renderer.create(
      <TestProvider>
        <Library
          config={config}
          filters={[]}
          library={[]}
          progressCurrent={0}
          progressMode={null}
          progressTitle={null}
          progressTotal={0}
          selected={[]}
          specialMode={null}
          tags={[]}
          tutorial={null}
          yOffset={0}
          goBack={() => {}}
          onAddSource={(scene, type, args) => {}}
          onBatchClip={() => {}}
          onBatchTag={() => {}}
          onClearBlacklist={(sourceURL) => {}}
          onClip={(source, displayed) => {}}
          onDownload={(source) => {}}
          onEditBlacklist={(sourceURL, blacklist) => {}}
          onExportLibrary={() => {}}
          onImportFromLibrary={(sources) => {}}
          onImportLibrary={(importLibrary) => {}}
          onImportInstagram={() => {}}
          onImportReddit={() => {}}
          onImportTumblr={() => {}}
          onImportTwitter={() => {}}
          onManageTags={() => {}}
          onMarkOffline={() => {}}
          onPlay={(source, displayed) => {}}
          onSort={(scene, algorithm, ascending) => {}}
          onTutorial={(tutorial) => {}}
          onUpdateLibrary={(fn) => {}}
          onUpdateMode={(mode) => {}}
          onUpdateVideoMetadata={() => {}}
          savePosition={(yOffset, filters, selected) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
