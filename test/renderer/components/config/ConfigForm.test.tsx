import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ConfigForm from "../../../../src/renderer/components/config/ConfigForm";
import TestProvider from "../../../util/TestProvider";
import { createTheme } from "@mui/material";
import defaultTheme from "../../../../src/renderer/data/theme";
import Config from "../../../../src/renderer/data/Config";

jest.mock('../../../../src/renderer/components/config/GeneralConfig', () => 'GeneralConfig');
jest.mock('../../../../src/renderer/components/sceneDetail/SceneOptions', () => 'SceneOptions');
jest.mock('../../../../src/renderer/components/sceneDetail/SceneEffects', () => 'SceneEffects');

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
