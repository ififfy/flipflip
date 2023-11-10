import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import GeneralConfig from "../../../../src/renderer/components/config/GeneralConfig";
import TestProvider from "../../../util/TestProvider";
import defaultTheme from "../../../../src/renderer/data/theme";
import { createTheme } from "@mui/material";
import Config from "../../../../src/renderer/data/Config";

jest.mock('../../../../src/renderer/components/configGroups/PlayerBoolCard', () => 'PlayerBoolCard');
jest.mock('../../../../src/renderer/components/configGroups/PlayerBoolCard2', () => 'PlayerBoolCard2');
jest.mock('../../../../src/renderer/components/configGroups/PlayerNumCard', () => 'PlayerNumCard');
jest.mock('../../../../src/renderer/components/configGroups/CacheCard', () => 'CacheCard');
jest.mock('../../../../src/renderer/components/configGroups/BackupCard', () => 'BackupCard');
jest.mock('../../../../src/renderer/components/configGroups/APICard', () => 'APICard');
jest.mock('../../../../src/renderer/components/configGroups/ThemeCard', () => 'ThemeCard');
jest.mock('../../../../src/renderer/components/configGroups/WatermarkCard', () => 'WatermarkCard');

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
