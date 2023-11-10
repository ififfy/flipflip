import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioSourceList from "../../../../src/renderer/components/library/AudioSourceList";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/components/library/AudioSourceListItem', () => 'AudioSourceListItem');
jest.mock('../../../../src/renderer/components/library/AudioEdit', () => 'AudioEdit');
jest.mock('../../../../src/renderer/components/library/AudioOptions', () => 'AudioOptions');

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
