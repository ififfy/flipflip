import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlaylistList from "../PlaylistList";
import TestProvider from "../../../../../test/util/TestProvider";

describe("PlaylistList", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <PlaylistList
          playlists={[]}
          audios={[]}
          showHelp={false}
          onClickPlaylist={(playlist) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
