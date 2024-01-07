import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioAlbumList from "../AudioAlbumList";
import TestProvider from "../../../../../test/util/TestProvider";

describe("AudioAlbumList", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <AudioAlbumList
          sources={[]}
          showHelp={false}
          onClickAlbum={(album) => {}}
          onClickArtist={(artist) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
