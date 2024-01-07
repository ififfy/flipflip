import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import BackupCard from "../BackupCard";
import TestProvider from "../../../../../test/util/TestProvider";
import { GeneralSettings } from "../../../data/Config";

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
