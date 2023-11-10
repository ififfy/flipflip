import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlayerBars from "../../../../src/renderer/components/player/PlayerBars";
import TestProvider from "../../../util/TestProvider";
import Scene from "../../../../src/renderer/data/Scene";
import Config from "../../../../src/renderer/data/Config";

jest.mock('../../../../src/renderer/components/configGroups/SceneOptionCard', () => 'SceneOptionCard');
jest.mock('../../../../src/renderer/components/configGroups/ImageVideoCard', () => 'ImageVideoCard');
jest.mock('../../../../src/renderer/components/configGroups/ZoomMoveCard', () => 'ZoomMoveCard');
jest.mock('../../../../src/renderer/components/configGroups/CrossFadeCard', () => 'CrossFadeCard');
jest.mock('../../../../src/renderer/components/configGroups/SlideCard', () => 'SlideCard');
jest.mock('../../../../src/renderer/components/configGroups/StrobeCard', () => 'StrobeCard');
jest.mock('../../../../src/renderer/components/configGroups/AudioCard', () => 'AudioCard');
jest.mock('../../../../src/renderer/components/configGroups/TextCard', () => 'TextCard');
jest.mock('../../../../src/renderer/components/configGroups/VideoCard', () => 'VideoCard');
jest.mock('../../../../src/renderer/components/player/VideoControl', () => 'VideoControl');
jest.mock('../../../../src/renderer/components/configGroups/FadeIOCard', () => 'FadeIOCard');
jest.mock('../../../../src/renderer/components/configGroups/PanningCard', () => 'PanningCard');

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
