import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import WatermarkCard from "../../../../src/renderer/components/configGroups/WatermarkCard";
import TestProvider from "../../../util/TestProvider";
import { GeneralSettings } from "../../../../src/renderer/data/Config";

jest.mock("../../../../src/renderer/components/config/ColorPicker", () => "ColorPicker");

// mocking this so that test doesn't throw error
jest.mock('@mui/base/TextareaAutosize', () => 'TextareaAutosize');

describe("WatermarkCard", () => {
  it("should match snapshot", () => {
    const settings = new GeneralSettings();
    const component = renderer.create(
      <TestProvider>
        <WatermarkCard settings={settings} onUpdateSettings={(fn) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
