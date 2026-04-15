import fs from "fs";
import path from "path";
import moment from "moment";
import { rimrafSync } from "rimraf";
import { BrowserWindow, webFrame } from "electron";
import Config from "../common/Config";
import { saveDir, savePath, getBackups } from "./utils-main";
import Backup from "../common/Backup";
import AppStorageState from "../common/AppStorageState";
import LibrarySource from "../common/LibrarySource";
import Scene from "../common/Scene";
import SceneGroup from "../common/SceneGroup";
import SceneGrid from "../common/SceneGrid";
import Audio from "../common/Audio";
import CaptionScript from "../common/CaptionScript";
import Playlist from "../common/Playlist";
import Tag from "../common/Tag";
import { Route } from "../common/Route";
import defaultTheme from "../common/theme";
import { reloadWindow } from "./WindowManager";
import fontList from "font-list";
import SystemFonts from "system-font-families";
import { OAuth } from "oauth";
import http from "http";
import { shell } from "electron";
import { IPC } from "../common/const";
import wretch from "wretch";
import Snoowrap from "snoowrap";
import RedditSubscriptionResponse from "../common/RedditSubscriptionResponse";
import TumblrFollowingResponse from "../common/TumblrFollowingResponse";
import tumblr from "tumblr.js";

export function cleanBackups(config: Config) {
  let backups = getBackups();
  if (backups.length <= 1) return;
  if (config.generalSettings.autoCleanBackup) {
    let keepDays = [backups[0]],
      keepWeeks = [backups[0]],
      keepMonths = [backups[0]];

    const convertFromEpoch = (backupFile: string) => {
      const epochString = backupFile.substring(backupFile.lastIndexOf(".") + 1);
      return new Date(Number.parseInt(epochString));
    };

    for (let backup of backups) {
      let backupDate = convertFromEpoch(backup.url);
      let lastDay = convertFromEpoch(keepDays[keepDays.length - 1].url);
      let lastWeek = convertFromEpoch(keepWeeks[keepWeeks.length - 1].url);
      let lastMonth = convertFromEpoch(keepMonths[keepMonths.length - 1].url);

      if (moment(backupDate).isSame(lastDay, "day")) {
        if (
          moment(backupDate).isSame(new Date(), "day") &&
          backupDate > lastDay
        ) {
          keepDays[keepDays.length - 1] = backup;
        } else if (
          !moment(backupDate).isSame(new Date(), "day") &&
          backupDate < lastDay
        ) {
          keepDays[keepDays.length - 1] = backup;
        }
      } else if (keepDays.length < config.generalSettings.autoCleanBackupDays) {
        keepDays.push(backup);
      }

      if (moment(backupDate).isSame(lastWeek, "week")) {
        if (backupDate < lastWeek) {
          keepWeeks[keepWeeks.length - 1] = backup;
        }
      } else if (
        keepWeeks.length < config.generalSettings.autoCleanBackupWeeks
      ) {
        keepWeeks.push(backup);
      }

      if (moment(backupDate).isSame(lastMonth, "month")) {
        if (backupDate < lastWeek) {
          keepMonths[keepMonths.length - 1] = backup;
        }
      } else if (
        keepMonths.length < config.generalSettings.autoCleanBackupMonths
      ) {
        keepMonths.push(backup);
      }
    }
    backups = backups.filter(
      (b) =>
        !keepDays.includes(b) &&
        !keepWeeks.includes(b) &&
        !keepMonths.includes(b),
    );
  } else {
    for (let k = 0; k < config.generalSettings.cleanRetain; k++) {
      backups.shift(); // Keep the K newest backups
    }
  }

  unlinkBackups(backups);
}

function unlinkBackups(backups: Array<Backup>) {
  for (let backup of backups) {
    try {
      fs.unlinkSync(path.join(saveDir, backup.url));
    } catch (e) {
      console.error(e);
    }
  }
}

export function restoreFromBackup(backupFile: string): AppStorageState {
  const data = JSON.parse(fs.readFileSync(backupFile, "utf-8"));
  const state: AppStorageState = {
    version: data.version,
    specialMode: data.specialMode ? data.specialMode : null,
    openTab: data.openTab ? data.openTab : 0,
    displayedSources: Array<LibrarySource>(),
    config: new Config(data.config),
    scenes: data.scenes.map(
      (s: any) => new Scene(path.sep, process.platform, s),
    ),
    sceneGroups: data.sceneGroups
      ? data.sceneGroups.map((g: any) => new SceneGroup(g))
      : Array<SceneGroup>(),
    grids: data.grids
      ? data.grids.map((g: any) => new SceneGrid(g))
      : Array<SceneGrid>(),
    audios: data.audios
      ? data.audios.map((a: any) => new Audio(a))
      : Array<Audio>(),
    scripts: data.scripts
      ? data.scripts.map((a: any) => new CaptionScript(a))
      : Array<CaptionScript>(),
    playlists: data.playlists
      ? data.playlists.map((p: any) => new Playlist(p))
      : Array<Playlist>(),
    library: data.library.map((s: any) => new LibrarySource(s)),
    tags: data.tags.map((t: any) => new Tag(t)),
    route: data.route.map((s: any) => new Route(s)),
    libraryYOffset: 0,
    libraryFilters: Array<string>(),
    librarySelected: Array<string>(),
    audioOpenTab: data.audioOpenTab ? data.audioOpenTab : 3,
    audioYOffset: 0,
    audioFilters: Array<string>(),
    audioSelected: Array<string>(),
    scriptYOffset: 0,
    scriptFilters: Array<string>(),
    scriptSelected: Array<string>(),
    progressMode: null as string,
    progressTitle: null as string,
    progressCurrent: 0,
    progressTotal: 0,
    progressNext: null as string,
    systemMessage: null as string,
    systemSnack: null as string,
    systemSnackSeverity: null as string,
    tutorial: null as string,
    theme: data.theme ? data.theme : defaultTheme,
    systemSnackOpen: false,
  };

  return state;
}

export function reset(windowId: number) {
  rimrafSync(savePath);
  reloadWindow(windowId);
}

export function getFonts() {
  if (process.platform == "darwin") {
    return new SystemFonts().getFonts();
  } else {
    return fontList.getFonts().then((res: Array<string>) => {
      return res.map((r) => {
        if (r.startsWith('"') && r.endsWith('"')) {
          return r.substring(1, r.length - 1);
        } else {
          return r;
        }
      });
    });
  }
}

export function tumblrAuth(
  window: BrowserWindow,
  tumblrKey: string,
  tumblrSecret: string,
) {
  // Tumblr endpoints
  const authorizeUrl = "https://www.tumblr.com/oauth/authorize";
  const requestTokenUrl = "https://www.tumblr.com/oauth/request_token";
  const accessTokenUrl = "https://www.tumblr.com/oauth/access_token";

  const oauth = new OAuth(
    requestTokenUrl,
    accessTokenUrl,
    tumblrKey,
    tumblrSecret,
    "1.0A",
    "http://localhost:65010",
    "HMAC-SHA1",
  );

  let sharedSecret = "";

  oauth.getOAuthRequestToken(
    (
      err: { statusCode: number; data: string },
      token: string,
      secret: string,
    ) => {
      if (err) {
        const error = err.statusCode + " - " + err.data;
        console.error(error);
        window.webContents.send(IPC.tumblrAuthResponse, { error });
        server.close();
        return;
      }

      sharedSecret = secret;
      shell.openExternal(authorizeUrl + "?oauth_token=" + token);
    },
  );

  // Start a server to listen for Tumblr OAuth response
  const server = http.createServer();
  server
    .on(
      "request",
      (
        req: http.IncomingMessage,
        res: http.ServerResponse<http.IncomingMessage> & {
          req: http.IncomingMessage;
        },
      ) => {
        // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
        const html =
          "<html><body><h1>Please return to FlipFlip</h1></body></html>";
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(html);

        if (!req.url.endsWith("favicon.ico")) {
          if (
            req.url.includes("oauth_token") &&
            req.url.includes("oauth_verifier")
          ) {
            const args = req.url.replace("\/?", "").split("&");
            const oauthToken = args[0].substring(12);
            const oauthVerifier = args[1].substring(15);

            oauth.getOAuthAccessToken(
              oauthToken,
              sharedSecret,
              oauthVerifier,
              (err: any, token: string, secret: string) => {
                if (err) {
                  console.error("Validation failed with error", err);
                  window.webContents.send(IPC.tumblrAuthResponse, {
                    error: String(err),
                  });
                  server.close();
                  req.socket.destroy();
                  res.end();
                  return;
                }

                window.webContents.send(IPC.tumblrAuthResponse, {
                  success: { token, secret },
                });
                window.show();

                server.close();
                req.socket.destroy();
              },
            );
          } else {
            window.webContents.send(IPC.tumblrAuthResponse, {
              error: "Access Denied",
            });
            server.close();
            req.socket.destroy();
          }
        }
        res.end();
      },
    )
    .listen(65010);
}

export function redditAuth(
  window: BrowserWindow,
  userAgent: string,
  clientID: string,
  deviceID: string,
) {
  // Start a server to listen for Reddit OAuth response
  const server = http.createServer();
  server
    .on(
      "request",
      (
        req: http.IncomingMessage,
        res: http.ServerResponse<http.IncomingMessage> & {
          req: http.IncomingMessage;
        },
      ) => {
        // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
        const html =
          "<html><body><h1>Please return to FlipFlip</h1></body></html>";
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(html);

        if (!req.url.endsWith("favicon.ico")) {
          if (req.url.includes("state") && req.url.includes("code")) {
            const args = req.url.replace("\/?", "").split("&");
            // This should be the same as the deviceID
            const state = args[0].substring(6);
            if (state == deviceID) {
              // This is what we use to get our token
              const code = args[1].substring(5);
              wretch("https://www.reddit.com/api/v1/access_token")
                .headers({
                  "User-Agent": userAgent,
                  Authorization: "Basic " + btoa(clientID + ":"),
                })
                .formData({
                  grant_type: "authorization_code",
                  code: code,
                  redirect_uri: "http://localhost:65010",
                })
                .post()
                .json((json) => {
                  window.webContents.send(IPC.redditAuthResponse, {
                    success: { token: json.refresh_token, secret: "" },
                  });
                  window.show();
                  server.close();
                  req.socket.destroy();
                })
                .catch((e) => {
                  console.error(e);
                  window.webContents.send(IPC.redditAuthResponse, {
                    error: e.message,
                  });
                  server.close();
                  req.socket.destroy();
                  res.end();
                });
            }
          } else if (req.url.includes("state") && req.url.includes("error")) {
            const args = req.url.replace("\/?", "").split("&");
            // This should be the same as the deviceID
            const state = args[0].substring(6);
            if (state == deviceID) {
              const error = args[1].substring(6);
              console.error(error);
              window.webContents.send(IPC.redditAuthResponse, { error });
            }

            server.close();
            req.socket.destroy();
          }
        }
        res.end();
      },
    )
    .listen(65010);

  // Make initial request and open authorization form in browser
  wretch(
    "https://www.reddit.com/api/v1/authorize?client_id=" +
      clientID +
      "&response_type=code&state=" +
      deviceID +
      "&redirect_uri=http://localhost:65010&duration=permanent&scope=read,mysubreddits,history",
  )
    .post()
    .res((res) => {
      shell.openExternal(res.url);
    })
    .catch((e) => {
      console.error(e);
      window.webContents.send(IPC.redditAuthResponse, { error: e.message });
      server.close();
    });
}

export function printMemoryReport() {
  function format(x: any) {
    let f = x.toString();
    while (f.length < 15) {
      f = " " + f;
    }
    f = f.substr(0, 15);
    return f;
  }
  function logB(x: any) {
    console.log(
      format(x[0]),
      format((x[1] / (1000.0 * 1000)).toFixed(2)),
      "MB",
    );
  }
  function logKB(x: any) {
    console.log(format(x[0]), format((x[1] / 1000.0).toFixed(2)), "MB");
  }
  function logCount(x: any) {
    console.log(
      format(x[0]),
      format(x[1].count),
      format((x[1].size / (1000.0 * 1000)).toFixed(2)),
      "MB",
      format((x[1].liveSize / (1000.0 * 1000)).toFixed(2)),
      "MB",
    );
  }

  Object.entries(process.memoryUsage()).map(logB);
  Object.entries(process.getProcessMemoryInfo()).map(logKB);
  Object.entries(process.getSystemMemoryInfo()).map(logKB);
  console.log("\n");
  console.log(
    format("object"),
    format("count"),
    format("size"),
    format("liveSize"),
  );
  Object.entries(webFrame.getResourceUsage()).map(logCount);
  console.log("------");
}

export function getRedditSubscriptions(
  userAgent: string,
  clientId: string,
  refreshToken: string,
  after: string,
): RedditSubscriptionResponse {
  const reddit = new Snoowrap({
    userAgent,
    clientId,
    clientSecret: "",
    refreshToken,
  });

  const listing = reddit.getSubscriptions({ limit: 20, after });
  const subs: string[] = [];
  for (const sub of listing) {
    subs.push(sub.url);
  }

  const next = listing[listing.length - 1].name;
  return { subs, next };
}

export function getTumblrFollowing(
  key: string,
  secret: string,
  token: string,
  tokenSecret: string,
  limit: number,
  offset: number,
) {
  return new Promise<TumblrFollowingResponse>((resolve) => {
    const client = tumblr.createClient({
      consumer_key: key,
      consumer_secret: secret,
      token,
      token_secret: tokenSecret,
    });

    client.userFollowing({ limit, offset }, (err, resp) => {
      let error;
      let total = 0;
      const blogs = [];
      if (err) {
        error = String(err);
      } else {
        total = resp.total_blogs;
        for (const blog of resp.blogs) {
          blogs.push(blog.name);
        }
      }

      resolve({ error, total, blogs });
    });
  });
}
