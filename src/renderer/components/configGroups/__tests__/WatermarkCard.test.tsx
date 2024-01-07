import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import WatermarkCard from "../WatermarkCard";
import TestProvider from "../../../../../test/util/TestProvider";
import { GeneralSettings } from "../../../data/Config";

jest.mock("../../config/ColorPicker", () => "ColorPicker");

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
