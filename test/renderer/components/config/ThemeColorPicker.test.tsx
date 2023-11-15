import React from "react";
import { describe, it, expect } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import renderer from "react-test-renderer";
import ThemeColorPicker from "../../../../src/renderer/components/config/ThemeColorPicker";
import TestProvider from "../../../util/TestProvider";

describe("ThemeColorPicker", () => {
  it("should render without color when currentColor is null", () => {
    const component = renderer.create(
      <TestProvider>
        <ThemeColorPicker currentColor={null} onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render color when currentColor has value", () => {
    const component = renderer.create(
      <TestProvider>
        <ThemeColorPicker currentColor="#f00" onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should change color and input when a color preset button is clicked", async () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestProvider>
        <ThemeColorPicker currentColor="#f00" onChangeColor={onChange} />
      </TestProvider>
    );
    
    const color = '#9c27b0'
    const button = container.querySelector('button[value="' + color + '"]')
    fireEvent.click(button)
    
    expect(onChange.mock.calls).toHaveLength(1);
    expect(onChange.mock.calls[0][0].main).toBe(color);

  });
  it("should not allow input changes", async () => {
    render(
      <TestProvider>
        <ThemeColorPicker currentColor="#f00" onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    const input = screen.getByRole('textbox')
    expect(input.hasAttribute('readonly')).toBe(true)
  });
  it("should not show color picker when color is clicked", async () => {
    const {container} = render(
      <TestProvider>
        <ThemeColorPicker currentColor='#f00' onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    const button = container.querySelector('button[class*=" ThemeColorPicker-colorButton-"]') as HTMLButtonElement
    expect(button.onclick).toBe(null)
  });
});
