import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlaylistSelect from "../../../../src/renderer/components/configGroups/PlaylistSelect";
import TestProvider from "../../../util/TestProvider";

describe("PlaylistSelect", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <PlaylistSelect playlists={[]} onChange={(sceneID) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
