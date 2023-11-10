import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioArtistList from "../../../../src/renderer/components/library/AudioArtistList";
import TestProvider from "../../../util/TestProvider";

describe("AudioArtistList", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <AudioArtistList
          sources={[]}
          showHelp={false}
          onClickArtist={(artist) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
