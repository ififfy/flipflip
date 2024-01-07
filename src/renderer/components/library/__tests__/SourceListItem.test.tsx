import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SourceListItem from "../SourceListItem";
import TestProvider from "../../../../../test/util/TestProvider";
import LibrarySource from "../../../data/LibrarySource";
import Config from "../../../data/Config";

jest.mock('../SourceIcon', () => 'SourceIcon');

describe("SourceListItem", () => {
  it("should match snapshot", () => {
    const config = new Config();
    const source = new LibrarySource({url: 'image.png'});
    const component = renderer.create(
      <TestProvider>
        <SourceListItem
          checked={false}
          config={config}
          index={0}
          isEditing={null}
          isLibrary={false}
          isSelect={false}
          source={source}
          sources={[]}
          style={null}
          tutorial={null}
          onClean={(source) => {}}
          onClearBlacklist={(sourceURL) => {}}
          onClip={(source, displaySources) => {}}
          onDelete={(source) => {}}
          onDownload={(source) => {}}
          onEditBlacklist={(source) => {}}
          onEndEdit={(newURL) => {}}
          onOpenClipMenu={(source) => {}}
          onOpenWeightMenu={(source) => {}}
          onPlay={(source, displaySources) => {}}
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
