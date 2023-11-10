import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PictureGrid from "../../../../src/renderer/components/player/PictureGrid";
import TestProvider from "../../../util/TestProvider";

jest.mock('../../../../src/renderer/components/player/ImageView', () => 'ImageView');

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
