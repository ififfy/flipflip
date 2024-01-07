import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ConfigForm from "../ConfigForm";
import TestProvider from "../../../../../test/util/TestProvider";
import { createTheme } from "@mui/material";
import defaultTheme from "../../../data/theme";
import Config from "../../../data/Config";

jest.mock('../GeneralConfig', () => 'GeneralConfig');
jest.mock('../../sceneDetail/SceneOptions', () => 'SceneOptions');
jest.mock('../../sceneDetail/SceneEffects', () => 'SceneEffects');

describe("ConfigForm", () => {
  it("should match snapshot", () => {
    const config = new Config();
    const theme = createTheme(defaultTheme as any);
    const component = renderer.create(
      <TestProvider>
        <ConfigForm
            config={config}
            library={[]}
            scenes={[]}
            sceneGrids={[]}
            tags={[]}
            theme={theme}
            goBack={() =>{}}
            onBackup={() =>{}}
            onChangeThemeColor={(colorTheme: any, primary: boolean) =>{}}
            onClean={() =>{}}
            onDefault={() =>{}}
            onResetTutorials={() =>{}}
            onRestore={(backupFile: string) =>{}}
            onToggleDarkMode={() =>{}}
            onUpdateConfig={(config: Config) =>{}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
