import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ThemeCard from "../ThemeCard";
import TestProvider from "../../../../../test/util/TestProvider";
import { createTheme } from "@mui/material";
import defaultTheme from "../../../data/theme";

jest.mock('../../config/ThemeColorPicker', () => 'ThemeColorPicker');

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
