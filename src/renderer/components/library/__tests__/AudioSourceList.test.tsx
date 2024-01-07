import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioSourceList from "../AudioSourceList";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../AudioSourceListItem', () => 'AudioSourceListItem');
jest.mock('../AudioEdit', () => 'AudioEdit');
jest.mock('../AudioOptions', () => 'AudioOptions');

describe("AudioSourceList", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <AudioSourceList
          cachePath={null}
          isSelect={false}
          selected={[]}
          showHelp={false}
          sources={[]}
          yOffset={0}
          tutorial={null}
          onClickAlbum={(album) => {}}
          onClickArtist={(artist) => {}}
          onPlay={(source, displayed) => {}}
          onUpdateSelected={(selected) => {}}
          onUpdateLibrary={(fn) => {}}
          onUpdatePlaylists={(fn) => {}}
          savePosition={() => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
