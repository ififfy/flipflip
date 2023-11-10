import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import TextCard from "../../../../src/renderer/components/configGroups/TextCard";
import TestProvider from "../../../util/TestProvider";
import Scene from "../../../../src/renderer/data/Scene";

jest.mock('../../../../src/renderer/components/configGroups/ScriptPlaylist', () => 'ScriptPlaylist');
jest.mock('../../../../src/renderer/components/library/ScriptOptions', () => 'ScriptOptions');

describe("TextCard", () => {
  it("should match snapshot", () => {
    const scene = new Scene()
    const component = renderer.create(
      <TestProvider>
        <TextCard
          scene={scene}
          onAddScript={(playlistIndex) => {}}
          onPlay={(source, sceneID, displayed) => {}}
          onUpdateScene={(scene, fn) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
