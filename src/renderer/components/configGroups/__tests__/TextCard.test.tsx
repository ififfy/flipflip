import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import TextCard from "../TextCard";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";

jest.mock('../ScriptPlaylist', () => 'ScriptPlaylist');
jest.mock('../../library/ScriptOptions', () => 'ScriptOptions');

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
