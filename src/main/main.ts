import { app, Menu, session, powerSaveBlocker } from 'electron';
import { initializeIpcEvents, releaseIpcEvents } from './IPCEvents';
import { createMainMenu, createMenuTemplate } from './MainMenu';
import {createNewWindow, startScene} from "./WindowManager";

let psID: number;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived((details: any, callback: any) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'none\'']
      }
    })
  });

  // Enable garbage collection
  app.commandLine.appendSwitch('js-flags', '--expose_gc');

  createNewWindow();
  createMainMenu(Menu, createMenuTemplate(app));
  initializeIpcEvents();

  psID = powerSaveBlocker.start('prevent-display-sleep');

  // This could be improved, but there are only two command line options currently
  const sceneName = process.argv.find((el, i, arr) => el != '--no-dev-tools' && !el.endsWith('electron.exe') && !el.endsWith('bundle.js'));
  if (sceneName) {
    setTimeout(startScene.bind(null, sceneName), 1000);
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  releaseIpcEvents();
  powerSaveBlocker.stop(psID);
  app.quit();
});