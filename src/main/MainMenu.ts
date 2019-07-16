import { shell } from 'electron'
import defaultMenu from "electron-default-menu";

// Define default menu (optionally append to)
export function createMenuTemplate(app: any, replace?: any) {
  const menu = defaultMenu(app, shell);
  if (process.platform !== 'darwin') {
    menu.splice(0, 0, {
      label: 'File',
      submenu: [
        {role: 'quit'}
      ]
    })
  }
  menu.splice(2, 1, {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
    ]
  });
  if (replace) {
    menu.splice(4, 1, replace);
  } else {
    menu.splice(4, 1);
  }

  return menu;
}

export function createMainMenu(menu: any, template: any) {
  menu.setApplicationMenu(menu.buildFromTemplate(template));
}