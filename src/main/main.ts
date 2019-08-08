import { app, Menu, session } from 'electron';
import { initializeIpcEvents, releaseIpcEvents } from './IPCEvents';
import { createMainMenu, createMenuTemplate } from './MainMenu';
import {createNewWindow, startScene} from "./WindowManager";

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

  if (process.argv[2] && process.argv[2] != '--no-dev-tools') {
    setTimeout(startScene.bind(null, process.argv[2]), 1000);
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  releaseIpcEvents();
  app.quit();
});