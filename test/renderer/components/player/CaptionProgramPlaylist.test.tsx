import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CaptionProgramPlaylist from "../../../../src/renderer/components/player/CaptionProgramPlaylist";
import TestProvider from "../../../util/TestProvider";
import { RP } from "../../../../src/renderer/data/const";
import Scene from "../../../../src/renderer/data/Scene";

jest.mock('../../../../src/renderer/components/player/CaptionProgram', () => 'CaptionProgram');

describe("CaptionProgramPlaylist", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const component = renderer.create(
      <TestProvider>
        <CaptionProgramPlaylist
          playlistIndex={0}
          playlist={{ scripts: [], shuffle: false, repeat: RP.none }}
          currentAudio={null}
          currentImage={null}
          scale={1}
          scene={scene}
          timeToNextFrame={0}
          getTags={(source, clipID) => []}
          goBack={() => {}}
          orderScriptTags={(script) => {}}
          playNextScene={() => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
