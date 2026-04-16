import { app, protocol, net, Menu, session } from "electron";
import { initializeIpcEvents, releaseIpcEvents } from "./IPCEvents";
import { createMainMenu, createMenuTemplate } from "./MainMenu";
import { createNewWindow, startScene } from "./WindowManager";
import started from "electron-squirrel-startup";
import { getSourceType, proxy, unproxy } from "../common/utils";
import { ST } from "../common/const";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Use this scheme to proxy content URLs
protocol.registerSchemesAsPrivileged([
  {
    scheme: "ff",
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  protocol.handle("ff", async (req) => {
    try {
      let url = unproxy(req.url);
      if (url === 'src/renderer/icons/flipflip_logo.png' || url === 'index.js.map') {
        const entry = MAIN_WINDOW_WEBPACK_ENTRY
        url = entry.substring(0, entry.lastIndexOf('/') + 1) + url
      }

      const promise = net.fetch(new Request(url, req));
      if (getSourceType(url) === ST.nimja) {
        const res = await promise
        let html = await res.text()
        const baseURL = 'https://hypno.nimja.com'
        html = html.replace('<head>', `<head><base href="${baseURL}/">`)
        html = html.replace(
          '<link rel="manifest" href="/site.webmanifest">',
          ''
        )
        return Promise.resolve(new Response(html, { headers: { 'Content-Type': 'text/html' } }))
      } else if (url.endsWith('/main_window/index.html')) {
        const res = await promise
        let html = await res.text()
        const baseURL = url.startsWith('http') ? new URL(url).origin : url.substring(0, url.indexOf('/main_window'))
        html = html.replace(/<script.*\/main_window\/index.js"><\/script>/, `<script defer src="${proxy(baseURL + '/main_window/index.js')}"></script>`)
        return Promise.resolve(new Response(html, { headers: { 'Content-Type': 'text/html' } }))
      } else {
        return promise
      }
    }
    catch (err) {
      console.error(err)
      return Promise.resolve(Response.error())
    }
  });

  session.defaultSession.webRequest.onHeadersReceived(
    (details: any, callback: any) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
        },
      });
    },
  );

  // Enable garbage collection
  app.commandLine.appendSwitch("js-flags", "--expose_gc");

  createNewWindow();
  createMainMenu(Menu, createMenuTemplate(app));
  initializeIpcEvents();

  // This could be improved, but there are only two command line options currently
  const sceneName = process.argv.find(
    (el, i, arr) =>
      el != "--no-dev-tools" &&
      !el.endsWith("electron.exe") &&
      !el.endsWith("bundle.js"),
  );
  if (sceneName) {
    setTimeout(startScene.bind(null, sceneName), 1500);
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  releaseIpcEvents();
  app.quit();
});

app.commandLine.appendSwitch("--autoplay-policy", "no-user-gesture-required");
