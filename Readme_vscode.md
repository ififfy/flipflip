# Debugging (and developing) FlipFlip in VS Code

I visualize configuring tools for remote debugging akin to performing root canal dental surgery ... on one's self, blindfolded, without novocaine, using a jack hammer, while wearing oven gloves. Endless time consuming poking around in the dark with painful results. Information on the internet is contradictory, confusing and outdated. This Readme provides a **TL;DR-type** incisive 5-step guide to quickly set up remote debugging of FlipFlip with [Visual Studio Code](https://code.visualstudio.com/).  **Make sure to read the 'After Surgery' comments at paragraph 5 below.**

## 1 Debugger for Chrome Extension

Install and enable VS Code's [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) extension.
(Quick installation tip - *Launch VS Code Quick Open (Ctrl+P), paste*
`ext install msjsdiag.debugger-for-chrome` and press enter)

(Skipable explanatory waffle: VS Code uses the Chrome debugging protocol to communicate with Electron which runs FlipFlip)

## 2 If on Windows, edit launch.json

You'll need to edit the value of `runtimeExecutable` in `.vscode/launch.json` to reflect the slightly different path to the Electron executable.

The new value should be `"${workspaceRoot}/node_modules/.bin/electron.cmd"`.

## 3 Yarn

In a terminal (Ahem for our Windows friends - a command prompt or Powershell) type: `yarn development`

   (Skipable explanatory waffle: `yarn development`:

   1. Calls the `development` script in FlipFlip's [`package.json`](https://github.com/ififfy/flipflip/blob/master/package.json);
   1. 'Bundles' the code using [webpack](https://webpack.js.org/) and the configuration information provided in FlipFlip's [`webpack.dev.js`](https://github.com/ififfy/flipflip/blob/master/webpack.dev.js) - output being stored under `~/dist`; and
   1. 'Watches' for code changes to dynamically re-bundle when they are saved. )

## 4 Debug

Press Control-Alt-D (to get the Debug Menu and select 'Debug FlipFlip')

   This *should* launch and attach VS Code to FlipFlip, and it should be possible to set Breakpoints and [Logpoints](https://code.visualstudio.com/blogs/2018/07/12/introducing-logpoints-and-auto-attach#_introducing-logpoints). - Logpoints can significantly reduce the need to create `console.log()` type debug code and the VS Code [blogpost](https://code.visualstudio.com/blogs/2018/07/12/introducing-logpoints-and-auto-attach#_introducing-logpoints) is worth a read .

![https://code.visualstudio.com/assets/blogs/2018/07/12/logpoints.gif](https://code.visualstudio.com/assets/blogs/2018/07/12/logpoints.gif)

## 5 After Surgery (Important Aftercare)

### Applying and re-applying breakpoints

IMPORTANT: After launching and sometimes after certain pushes of new code changes from the Visual Studio code editor (while FlipFlip is running) breakpoints need to be applied or re-applied.
They are reapplied through the breakpoints context menu in the Explorer part of Visual Studio Code.

### Network Port conflicts

If remote debugging does not work - check if another application is utilising port 9222: Make sure that FlipFlip is not running and then in a terminal execute : `netstat -nat | grep 9222`. (Our Windows friends possibly will not have `grep` so for them in a Powershell they should execute `netstat -nat | Select-String 9222` instead.

If there is anything marked `LISTEN` on port 9222 returned from executing the command then either close the conflicting application which is holding the port or change the port used.

You can change the port used by replacing 9222 in the two places it is found in the `.vscode/launch.json` file at properties `port` and `runtimeArgs`:

```json
"port": 9222,
"runtimeArgs": [
    "${workspaceFolder}/dist/main.bundle.js",
    "--remote-debugging-port=9222"
```

### webpack.dev.js

The `webpack.dev.js` needs to include `devtool: 'source-map'` to provide accurate source mappings e.g.

```typescript
let rendererConfig = {
    devtool: 'source-map',
```

Happy remote debugging! (Perhaps it can be less painful than self-performed root canal surgery after all)

![# F3](https://avatars3.githubusercontent.com/u/46749380?s=460&v=4)