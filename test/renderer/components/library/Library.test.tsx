import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Library from "../../../../src/renderer/components/library/Library";
import TestProvider from "../../../util/TestProvider";
import Config from "../../../../src/renderer/data/Config";

jest.mock('../../../../src/renderer/components/library/BatchClipDialog', () => 'BatchClipDialog');
jest.mock('../../../../src/renderer/components/library/LibrarySearch', () => 'LibrarySearch');
jest.mock('../../../../src/renderer/components/library/SourceIcon', () => 'SourceIcon');
jest.mock('../../../../src/renderer/components/library/SourceList', () => 'SourceList');
jest.mock('../../../../src/renderer/components/sceneDetail/URLDialog', () => 'URLDialog');
jest.mock('../../../../src/renderer/components/sceneDetail/PiwigoDialog', () => 'PiwigoDialog');

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
