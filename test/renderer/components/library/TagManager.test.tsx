import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import TagManager from "../../../../src/renderer/components/library/TagManager";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/animations/Jiggle', () => 'Jiggle');

// mocking this so that test doesn't throw error
jest.mock('react-sortablejs', () => 'Sortable');

describe("TagManager", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <TagManager
          tags={[]}
          goBack={() => {}}
          onSort={(scene, algorithm, ascending) => {}}
          onUpdateTags={(tags) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
