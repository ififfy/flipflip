import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ColorPicker from "../../../../src/renderer/components/config/ColorPicker";
import TestProvider from "../../../util/TestProvider";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { hexToRgb } from "@mui/material";

describe("ColorPicker", () => {
  it("should render without color when currentColor is empty", () => {
    const component = renderer.create(
      <TestProvider>
        <ColorPicker currentColor='' onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render color when currentColor has value", () => {
    const component = renderer.create(
      <TestProvider>
        <ColorPicker currentColor="#f00" onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should change color when a color preset button is clicked", () => {
    const mockFn = jest.fn();
    // unwrap the value, because jest doesn't serialize ChangeEvent well 
    const onChange = (e: any) => mockFn(e.target.value)
    const {container} = render(
      <TestProvider>
        <ColorPicker currentColor="#f00" onChangeColor={onChange} />
      </TestProvider>
    );

    const color = '#2196f3'
    const button = container.querySelector('button[value="' + color + '"]')
    fireEvent.click(button)
    
    expect(mockFn.mock.calls).toHaveLength(1);
    expect(mockFn.mock.calls[0][0]).toBe(color);
  });
  it("should change color on text input", async () => {
    const mockFn = jest.fn();
    // unwrap the value, because jest doesn't serialize ChangeEvent well 
    const onChange = (e: any) => mockFn(e.target.value)
    render(
      <TestProvider>
        <ColorPicker currentColor="#f00" onChangeColor={onChange} />
      </TestProvider>
    );

    const value = '#NoColor'
    const input = screen.getByLabelText('Color');
    fireEvent.change(input, {target: {value}})
    
    expect(mockFn.mock.calls).toHaveLength(1);
    expect(mockFn.mock.calls[0][0]).toBe(value);
  });
  it("should show color picker when color is clicked", () => {
    const {container} = render(
      <TestProvider>
        <ColorPicker currentColor="#f00" onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    expect(container.querySelector("#color-picker")).not.toBeVisible()

    const button = screen.getByLabelText("Pick Color")
    fireEvent.click(button)

    expect(container.querySelector("#color-picker")).toBeVisible()
  });
  it("should apply color picker change to color and input", () => {
    render(
      <TestProvider>
        <ColorPicker currentColor="#f00" onChangeColor={(e) => {}} />
      </TestProvider>
    );

    fireEvent.click(screen.getByLabelText("Pick Color"))

    const color = "#4cb84b"
    const input = screen.getByLabelText("hex")
    fireEvent.change(input, {target: {value: color}})
    
    expect(screen.getByLabelText("Pick Color").style.backgroundColor).toBe(hexToRgb(color))
    expect(screen.getByLabelText("Color")).toHaveValue(color)
  });
  it("should hide color picker when color is clicked again", () => {
    const mockFn = jest.fn();
    // unwrap the value, because jest doesn't serialize ChangeEvent well 
    const onChange = (e: any) => mockFn(e.target.value)
    const {container} = render(
      <TestProvider>
        <ColorPicker currentColor="#f00" onChangeColor={onChange} />
      </TestProvider>
    );

    const button = screen.getByLabelText("Pick Color")
    fireEvent.click(button)
    expect(container.querySelector("#color-picker")).toBeVisible()

    const color = "#4cb84b"
    const input = screen.getByLabelText("hex")
    fireEvent.change(input, {target: {value: color}})
    fireEvent.click(button)

    expect(container.querySelector("#color-picker")).not.toBeVisible()
    expect(mockFn.mock.calls).toHaveLength(1);
    expect(mockFn.mock.calls[0][0]).toBe(color);
  });
});
