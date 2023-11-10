import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import FontOptions from "../../../../src/renderer/components/library/FontOptions";
import TestProvider from "../../../util/TestProvider";
import { FontSettingsI } from "../../../../src/renderer/data/CaptionScript";

jest.mock('../../../../src/renderer/components/config/ColorPicker', () => 'ColorPicker');

describe("FontOptions", () => {
  it("should match snapshot", () => {
    const options: FontSettingsI = {
      color: 'red',
      fontSize: 12,
      fontFamily: 'Arial',
      border: false,
      borderpx: 0,
      borderColor: ''
    }
    const component = renderer.create(
      <TestProvider>
        <FontOptions
          name={null}
          options={options}
          systemFonts={[]}
          onUpdateOptions={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
