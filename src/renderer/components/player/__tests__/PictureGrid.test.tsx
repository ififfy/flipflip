import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PictureGrid from "../PictureGrid";
import TestProvider from "../../../../../test/util/TestProvider";

jest.mock('../ImageView', () => 'ImageView');

describe("PictureGrid", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <PictureGrid pictures={[]} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
