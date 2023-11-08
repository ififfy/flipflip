import React from 'react';
import { createTheme } from "@mui/material";
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { describe, it, expect } from '@jest/globals';
import renderer from 'react-test-renderer';
import defaultTheme from '../../../../src/renderer/data/theme';
import ColorPicker from '../../../../src/renderer/components/config/ColorPicker';

describe("ColorPicker", () => {
  it('should match snapshot', () => {
    const theme = createTheme(defaultTheme as any)
    const component = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <ColorPicker currentColor='#fff' onChangeColor={(e: any) => {}} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
});
