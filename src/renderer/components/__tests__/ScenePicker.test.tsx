import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScenePicker from "../ScenePicker";
import TestProvider from "../../../../test/util/TestProvider";

jest.mock('../../animations/Jiggle', () => 'Jiggle');
jest.mock('../../animations/VSpin', () => 'VSpin');
jest.mock('../../SceneSearch', () => 'SceneSearch');

// mocking this so that test doesn't throw error
jest.mock('react-sortablejs', () => 'Sortable');

describe("ScenePicker", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <ScenePicker
          canGenerate={false}
          canGrid={false}
          config={null}
          grids={[]}
          audioLibraryCount={0}
          scriptLibraryCount={0}
          libraryCount={0}
          openTab={0}
          scenes={[]}
          sceneGroups={[]}
          tutorial={null}
          version={null}
          onAddGenerator={() => {}}
          onAddGrid={() => {}}
          onAddGroup={(type) => {}}
          onAddScene={() => {}}
          onChangeTab={(newTab) => {}}
          onDeleteGroup={(group) => {}}
          onDeleteScenes={(sceneIDs) => {}}
          onImportScene={(importScenes, addToLibrary) => {}}
          onOpenConfig={() => {}}
          onOpenAudioLibrary={() => {}}
          onOpenScriptLibrary={() => {}}
          onOpenCaptionScriptor={() => {}}
          onOpenLibrary={() => {}}
          onOpenScene={(scene) => {}}
          onOpenGrid={(grid) => {}}
          onTutorial={(tutorial) => {}}
          onSort={(algorithm, ascending) => {}}
          onUpdateConfig={(config) => {}}
          onUpdateGroups={(groups) => {}}
          onUpdateScenes={(scenes) => {}}
          onUpdateGrids={(grids) => {}}
          startTutorial={() => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
