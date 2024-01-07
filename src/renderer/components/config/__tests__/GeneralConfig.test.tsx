import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import GeneralConfig from "../GeneralConfig";
import TestProvider from "../../../../../test/util/TestProvider";
import defaultTheme from "../../../data/theme";
import { createTheme } from "@mui/material";
import Config from "../../../data/Config";

jest.mock('../../configGroups/PlayerBoolCard', () => 'PlayerBoolCard');
jest.mock('../../configGroups/PlayerBoolCard2', () => 'PlayerBoolCard2');
jest.mock('../../configGroups/PlayerNumCard', () => 'PlayerNumCard');
jest.mock('../../configGroups/CacheCard', () => 'CacheCard');
jest.mock('../../configGroups/BackupCard', () => 'BackupCard');
jest.mock('../../configGroups/APICard', () => 'APICard');
jest.mock('../../configGroups/ThemeCard', () => 'ThemeCard');
jest.mock('../../configGroups/WatermarkCard', () => 'WatermarkCard');

// mocking this so that test doesn't throw error
jest.mock('@mui/lab/Masonry/Masonry', () => 'Masonry');

describe("GeneralConfig", () => {
  const theme = createTheme(defaultTheme as any)
  it("should match snapshot", () => {
    const config = new Config();
    const component = renderer.create(
      <TestProvider>
        <GeneralConfig
            config={config}
            library={[]}
            tags={[]}
            theme={theme}
            onBackup={() => {}}
            onChangeThemeColor={(colorTheme, primary) => {}}
            onClean={() => {}}
            onPortableOverride={() => {}}
            onRestore={(backupFile) => {}}
            onToggleDarkMode={() => {}}
            onUpdateCachingSettings={(fn) => {}}
            onUpdateDisplaySettings={(fn) => {}}
            onUpdateGeneralSettings={(fn) => {}}
            onUpdateRemoteSettings={(fn) => {}}
            onUpdateConfig={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
