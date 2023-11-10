import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioSourceListItem from "../../../../src/renderer/components/library/AudioSourceListItem";
import TestProvider from "../../../util/TestProvider";
import Audio from "../../../../src/renderer/data/Audio";

jest.mock('../../../../src/renderer/components/library/SourceIcon', () => 'SourceIcon');

describe("AudioSourceListItem", () => {
  it("should match snapshot", () => {
    const audio = new Audio({url: 'audio.mp3'})
    const component = renderer.create(
      <TestProvider>
        <AudioSourceListItem
          checked={false}
          index={0}
          isSelect={false}
          lastSelected={false}
          source={audio}
          sources={[]}
          style={null}
          onClickAlbum={(album) => {}}
          onClickArtist={(artist) => {}}
          onDelete={(source) => {}}
          onEditSource={(source) => {}}
          onPlay={(source, displaySources) => {}}
          onRemove={(source) => {}}
          onSourceOptions={(source) => {}}
          onToggleSelect={() => {}}
          savePosition={() => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
