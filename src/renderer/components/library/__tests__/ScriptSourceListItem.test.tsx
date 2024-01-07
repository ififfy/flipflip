import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptSourceListItem from "../ScriptSourceListItem";
import TestProvider from "../../../../../test/util/TestProvider";
import CaptionScript from "../../../data/CaptionScript";

jest.mock('../SourceIcon', () => 'SourceIcon');

describe("ScriptSourceListItem", () => {
  it("should match snapshot", () => {
    const script = new CaptionScript({url: 'script.txt'});
    const component = renderer.create(
      <TestProvider>
        <ScriptSourceListItem
          checked={false}
          index={0}
          isEditing={null}
          specialMode={null}
          lastSelected={false}
          source={script}
          style={null}
          tutorial={null}
          onDelete={(source) => {}}
          onEditScript={(source) => {}}
          onEndEdit={(newURL) => {}}
          onPlay={(source) => {}}
          onRemove={(source) => {}}
          onSourceOptions={(source) => {}}
          onStartEdit={(id) => {}}
          onToggleSelect={() => {}}
          savePosition={() => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
