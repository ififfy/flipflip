import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioPlaylist from "../../../../src/renderer/components/player/AudioPlaylist";
import TestProvider from "../../../util/TestProvider";
import { RP } from "../../../../src/renderer/data/const";
import Scene from "../../../../src/renderer/data/Scene";

jest.mock('../../../../src/renderer/components/player/AudioControl', () => 'AudioControl');
jest.mock('../../../../src/renderer/components/library/SourceIcon', () => 'SourceIcon');

// mocking this so that test doesn't throw error
jest.mock('react-sortablejs', () => 'Sortable');

describe("AudioPlaylist", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const component = renderer.create(
      <TestProvider>
        <AudioPlaylist
          playlistIndex={0}
          playlist={{ audios: [], shuffle: false, repeat: RP.none }}
          scene={scene}
          sidebar={false}
          startPlaying={false}
          onAddTracks={(playlistIndex) => {}}
          onSourceOptions={(audio) => {}}
          onUpdateScene={(scene, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
