import {
  app,
  BrowserWindow,
  Menu,
} from "electron";
import { createMainMenu, createMenuTemplate } from "./MainMenu";
import { IPC } from "../common/const";

export default class PlayerMenu {
  private static instance?: PlayerMenu;
  private static counter = 0;

  public static create(
    isPlaying: boolean,
    fullScreen: boolean,
    alwaysOnTop: boolean,
    showMenu: boolean,
    cachingEnabled: boolean,
    downloadScene: boolean,
    audioScene: boolean,
    scriptScene: boolean,
    hasAllTags: boolean,
  ) {
    // TODO change global menu from player menu to regular menu when focused window changes
    if (this.counter === 0) {
      PlayerMenu.instance = new PlayerMenu(
        isPlaying,
        fullScreen,
        alwaysOnTop,
        showMenu,
        cachingEnabled,
        downloadScene,
        audioScene,
        scriptScene,
        hasAllTags,
      );
    }

    this.counter++;
  }

  public static destroy() {
    this.counter--;
    if (this.counter === 0) {
      PlayerMenu.instance = undefined;
      createMainMenu(Menu, createMenuTemplate(app));
    }
  }

  public static setIsPlaying(playing: boolean) {
    if (PlayerMenu.instance == null) {
      return;
    }

    const menu = Menu.getApplicationMenu();
    const item = menu.getMenuItemById("playPause");
    item.label = "Play/Pause " + (playing ? "(Playing)" : "(Paused)");
  }

  public static setAlwaysOnTop(alwaysOnTop: boolean) {
    if (PlayerMenu.instance == null) {
      return;
    }

    const menu = Menu.getApplicationMenu();
    const item = menu.getMenuItemById("toggleAlwaysOnTop");
    item.label = "Toggle Always On Top " + (alwaysOnTop ? "(On)" : "(Off)");
  }

  public static setMenuBarVisibility(showMenu: boolean) {
    if (PlayerMenu.instance == null) {
      return;
    }

    const menu = Menu.getApplicationMenu();
    const item = menu.getMenuItemById("toggleMenuBarDisplay");
    item.label = "Toggle Menu Bar " + (showMenu ? "(On)" : "(Off)");
  }

  public static setFullScreen(fullScreen: boolean) {
    if (PlayerMenu.instance == null) {
      return;
    }

    const menu = Menu.getApplicationMenu();
    const item = menu.getMenuItemById("toggleFullscreen");
    item.label = "Toggle Fullscreen " + (fullScreen ? "(On)" : "(Off)");
  }

  private constructor(
    isPlaying: boolean,
    fullScreen: boolean,
    alwaysOnTop: boolean,
    showMenu: boolean,
    cachingEnabled: boolean,
    downloadScene: boolean,
    audioScene: boolean,
    scriptScene: boolean,
    hasAllTags: boolean,
  ) {
    const keyMap = new Map<String, Array<string>>([
      [
        "playPause",
        ["Play/Pause " + (isPlaying ? "(Playing)" : "(Paused)"), "space"],
      ],
      ["historyBack", ["Back in Time", "left"]],
      ["historyForward", ["Forward in Time", "right"]],
      ["navigateBack", ["Go Back to Scene Details", "escape"]],
      [
        "toggleFullscreen",
        ["Toggle Fullscreen " + (fullScreen ? "(On)" : "(Off)"), "Control+F"],
      ],
      [
        "toggleAlwaysOnTop",
        [
          "Toggle Always On Top " + (alwaysOnTop ? "(On)" : "(Off)"),
          "Control+T",
        ],
      ],
      [
        "toggleMenuBarDisplay",
        ["Toggle Menu Bar " + (showMenu ? "(On)" : "(Off)"), "Control+G"],
      ],
    ]);

    if (cachingEnabled) {
      keyMap.set("onDelete", ["Delete Image", "Delete"]);
    }

    if (!downloadScene && !audioScene && !scriptScene && hasAllTags) {
      keyMap.set("prevSource", ["Previous Source", "["]);
      keyMap.set("nextSource", ["Next Source", "]"]);
    }

    createMainMenu(
      Menu,
      createMenuTemplate(app, {
        label: "Player controls",
        submenu: Array.from(keyMap.entries()).map(([k, v]) => {
          const [label, accelerator] = v;
          return {
            id: k,
            label,
            accelerator,
            click: (this as any)[k as any].bind(this),
          };
        }),
      }),
    );
  }

  private getBrowserWindow() {
    return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  }

  playPause() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuPlayPause);
  }

  historyBack() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuHistoryBack);
  }

  historyForward() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuHistoryForward);
  }

  navigateBack() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuNavigateBack);
  }

  toggleFullscreen() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuToggleFullscreen);
  }

  toggleAlwaysOnTop() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuToggleAlwaysOnTop);
  }

  toggleMenuBarDisplay() {
    this.getBrowserWindow().webContents.send(
      IPC.playerMenuToggleMenuBarDisplay,
    );
  }

  onDelete() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuOnDelete);
  }

  prevSource() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuPrevSource);
  }

  nextSource() {
    this.getBrowserWindow().webContents.send(IPC.playerMenuNextSource);
  }
}
