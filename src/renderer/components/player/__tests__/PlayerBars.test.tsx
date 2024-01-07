import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlayerBars from "../PlayerBars";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";
import Config from "../../../data/Config";

jest.mock('../../configGroups/SceneOptionCard', () => 'SceneOptionCard');
jest.mock('../../configGroups/ImageVideoCard', () => 'ImageVideoCard');
jest.mock('../../configGroups/ZoomMoveCard', () => 'ZoomMoveCard');
jest.mock('../../configGroups/CrossFadeCard', () => 'CrossFadeCard');
jest.mock('../../configGroups/SlideCard', () => 'SlideCard');
jest.mock('../../configGroups/StrobeCard', () => 'StrobeCard');
jest.mock('../../configGroups/AudioCard', () => 'AudioCard');
jest.mock('../../configGroups/TextCard', () => 'TextCard');
jest.mock('../../configGroups/VideoCard', () => 'VideoCard');
jest.mock('../VideoControl', () => 'VideoControl');
jest.mock('../../configGroups/FadeIOCard', () => 'FadeIOCard');
jest.mock('../../configGroups/PanningCard', () => 'PanningCard');

describe("PlayerBars", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const config = new Config();
    const component = renderer.create(
      <TestProvider>
        <PlayerBars
          config={config}
          hasStarted={false}
          historyPaths={[]}
          historyOffset={0}
          imagePlayerAdvanceHacks={[]}
          imagePlayerDeleteHack={null}
          isEmpty={false}
          isPlaying={false}
          mainVideo={null}
          overlayVideos={[]}
          persistAudio={false}
          persistText={false}
          recentPictureGrid={false}
          scene={scene}
          scenes={[]}
          sceneGrids={[]}
          title={null}
          tutorial={null}
          goBack={() => {}}
          historyBack={() => {}}
          historyForward={() => {}}
          navigateTagging={(offset) => {}}
          onGenerate={(scene, children, force) => {}}
          onRecentPictureGrid={() => {}}
          onUpdateScene={(scene, fn) => {}}
          playNextScene={() => {}}
          play={() => {}}
          pause={() => {}}
          setCurrentAudio={(audio) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
