import React from "react";
import { createTheme } from "@mui/material";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Player from "../Player";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";
import Config from "../../../data/Config";
import defaultTheme from "../../../data/theme";

jest.mock('../AudioAlert', () => 'AudioAlert');
jest.mock('../CaptionProgramPlaylist', () => 'CaptionProgramPlaylist');
jest.mock('../GridPlayer', () => 'GridPlayer');
jest.mock('../ImageView', () => 'ImageView');
jest.mock('../PictureGrid', () => 'PictureGrid');
jest.mock('../PlayerBars', () => 'PlayerBars');
jest.mock('../SourceScraper', () => 'SourceScraper');
jest.mock('../Strobe', () => 'Strobe');

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
