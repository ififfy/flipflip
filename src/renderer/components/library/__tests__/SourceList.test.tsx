import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SourceList from "../SourceList";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../SourceListItem', () => 'SourceListItem');

describe("SourceList", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceList
          config={null}
          library={[]}
          showHelp={false}
          sources={[]}
          tutorial={null}
          onClearBlacklist={(sourceURL) => {}}
          onClip={(source, displayed) => {}}
          onDownload={(source) => {}}
          onEditBlacklist={(sourceURL, blacklist) => {}}
          onPlay={(source, displayed) => {}}
          systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
