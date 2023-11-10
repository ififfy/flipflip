import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioLibrary from "../../../../src/renderer/components/library/AudioLibrary";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/components/library/LibrarySearch', () => 'LibrarySearch');
jest.mock('../../../../src/renderer/components/library/AudioSourceList', () => 'AudioSourceList');
jest.mock('../../../../src/renderer/components/library/AudioArtistList', () => 'AudioArtistList');
jest.mock('../../../../src/renderer/components/library/AudioAlbumList', () => 'AudioAlbumList');
jest.mock('../../../../src/renderer/components/configGroups/PlaylistSelect', () => 'PlaylistSelect');
jest.mock('../../../../src/renderer/components/library/PlaylistList', () => 'PlaylistList');
jest.mock('../../../../src/renderer/components/library/AudioEdit', () => 'AudioEdit');

describe("AudioLibrary", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <AudioLibrary 
          cachePath={null}
          filters={[]}
          library={[]}
          progressCurrent={0}
          progressMode={null}
          progressTitle={null}
          progressTotal={0}
          openTab={0}
          playlists={[]}
          selected={[]}
          specialMode={null}
          tags={[]}
          tutorial={null}
          yOffset={0}
          goBack={() => {}}
          onAddToPlaylist={() => {}}
          onBatchTag={() => {}}
          onBatchEdit={() => {}}
          onBatchDetectBPM={() => {}}
          onChangeTab={(newTab) => {}}
          onImportFromLibrary={(sources) => {}}
          onManageTags={() => {}}
          onPlay={(source, displayed) => {}}
          onSort={(algorithm, ascending) => {}}
          onSortPlaylist={(playist, algorithm, ascending) => {}}
          onTutorial={(tutorial) => {}}
          onUpdateLibrary={(fn) => {}}
          onUpdatePlaylists={(fn) => {}}
          onUpdateMode={(mode) => {}}
          savePosition={(yOffset, filters, selected) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
