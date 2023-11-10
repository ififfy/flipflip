import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Player from "../../../../src/renderer/components/player/Player";
import TestProvider from "../../../util/TestProvider";
import Scene from "../../../../src/renderer/data/Scene";
import Config from "../../../../src/renderer/data/Config";
import { createTheme } from "@mui/material";
import defaultTheme from "../../../../src/renderer/data/theme";

jest.mock('../../../../src/renderer/components/player/AudioAlert', () => 'AudioAlert');
jest.mock('../../../../src/renderer/components/player/CaptionProgramPlaylist', () => 'CaptionProgramPlaylist');
jest.mock('../../../../src/renderer/components/player/GridPlayer', () => 'GridPlayer');
jest.mock('../../../../src/renderer/components/player/ImageView', () => 'ImageView');
jest.mock('../../../../src/renderer/components/player/PictureGrid', () => 'PictureGrid');
jest.mock('../../../../src/renderer/components/player/PlayerBars', () => 'PlayerBars');
jest.mock('../../../../src/renderer/components/player/SourceScraper', () => 'SourceScraper');
jest.mock('../../../../src/renderer/components/player/Strobe', () => 'Strobe');

describe("Player", () => {
  it("should match snapshot", () => {
    const config = new Config();
    const scene = new Scene();
    const theme = createTheme(defaultTheme as any)
    const component = renderer.create(
      <TestProvider>
        <Player
          config={config}
          scene={scene}
          scenes={[]}
          sceneGrids={[]}
          theme={theme}
          tutorial={null}
          cache={(i) => {}}
          getTags={(source: string) => []}
          goBack={() => {}}
          setCount={(sourceURL, count, countComplete) => {}}
          systemMessage={(message) => {}}
          onUpdateScene={(scene, fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
