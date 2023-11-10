import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import BackupCard from "../../../../src/renderer/components/configGroups/BackupCard";
import TestProvider from "../../../util/TestProvider";
import { GeneralSettings } from "../../../../src/renderer/data/Config";

describe("BackupCard", () => {
  it("should match snapshot", () => {
    const settings = new GeneralSettings();
    const component = renderer.create(
      <TestProvider>
        <BackupCard
          settings={settings}
          onBackup={() => {}}
          onClean={() => {}}
          onRestore={(backupFile) => {}}
          onUpdateSettings={(fn) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
