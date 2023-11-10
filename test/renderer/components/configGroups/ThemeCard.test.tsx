import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ThemeCard from "../../../../src/renderer/components/configGroups/ThemeCard";
import TestProvider from "../../../util/TestProvider";
import { createTheme } from "@mui/material";
import defaultTheme from "../../../../src/renderer/data/theme";

jest.mock('../../../../src/renderer/components/config/ThemeColorPicker', () => 'ThemeColorPicker');

describe("ThemeCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <ThemeCard
          theme={createTheme(defaultTheme as any)}
          onChangeThemeColor={(colorTheme, primary) => {}}
          onToggleDarkMode={() => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
