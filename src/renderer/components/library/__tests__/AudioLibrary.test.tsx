import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioLibrary from "../AudioLibrary";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../LibrarySearch', () => 'LibrarySearch');
jest.mock('../AudioSourceList', () => 'AudioSourceList');
jest.mock('../AudioArtistList', () => 'AudioArtistList');
jest.mock('../AudioAlbumList', () => 'AudioAlbumList');
jest.mock('../../configGroups/PlaylistSelect', () => 'PlaylistSelect');
jest.mock('../PlaylistList', () => 'PlaylistList');
jest.mock('../AudioEdit', () => 'AudioEdit');

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
