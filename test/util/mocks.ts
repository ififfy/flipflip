import * as fs from "fs";

jest.mock("electron", () => {
  const originalModule = jest.requireActual("electron");
  return {
    __esModule: true,
    ...originalModule,
    ipcRenderer: {
      on: (event: string, action: Function) => {}
    },
    remote: {
      app: {
        getPath: (name: string) =>
          name === "appData" ? "/flipflip/data" : undefined,
        getAppPath: () => "/flipflip/app",
      },
      Menu: {
        setApplicationMenu: (menu: any) => {},
        buildFromTemplate: (template: any) => template
      },
      getCurrentWindow: () => ({
        setAlwaysOnTop: (alwaysOnTop: boolean) => {},
        setMenuBarVisibility: (showMenu: boolean) => {},
        setFullScreen: (fullScreen: boolean) => {}
      })
    },
  };
});

jest.mock("fs", () => {
  const originalModule = jest.requireActual("fs");
  return {
    __esModule: true,
    ...originalModule,
    readdirSync: (path: fs.PathLike): string[] => [],
  };
});

jest.mock("react-dom", () => ({
  // @ts-ignore
  ...jest.requireActual("react-dom"),
  createPortal: (node) => node,
}));

jest.mock('codemirror/lib/codemirror.css', () => ({}))
jest.mock('codemirror/theme/material.css', () => ({}))

window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();
window.Worker = jest.fn();

window.__VERSION__ = '1.0.0';
window.soundManager = {
  setup: jest.fn()
}
