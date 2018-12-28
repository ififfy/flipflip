# FlipFlip

A random slideshow of images from your computer. Runs on Mac and Windows.

## [Instructions](https://github.com/ififfy/flipflip/releases)

[Mac download](https://github.com/ififfy/flipflip/releases/download/v1.0.0/FlipFlip-Mac.zip)

[Windows download](https://github.com/ififfy/flipflip/releases/download/v1.0.0/FlipFlip-Windows.zip)

If you are on a Mac, you might need to open this by right-clicking the
application, selecting "Open," and accepting all the stupid prompts
that pop up.

![Screenshot 1](/screenshot.png)
![Screenshot 2](/screenshot2.png)

## History

### 1.1 (in progress)

- Fresh UI for editing scenes
- Overlay a scene on top of another with transparency
- Load text scripts from any URL, not just Hastebin
- Audio loops
- Images can be loaded from the web. Create a text file containing one image URL per line, and use
  the "Import URL" option.

### 1.0.4

- Hotkeys work more often
- Don't show images <200px in either dimension
- Bug fixes

### 1.0.3

- Linux support
- Better zoom
- Text script support with Hastebin
- Configurable timing down to the millisecond
- Gifs no longer count as animated if they only have one frame

### 1.0.2

- Zoom
- More timing options
- Gooninator URL import

### 1.0.1

- Fullscreen toggle
- Cross-fade images as they change
- Bug fixes

## Developers

FlipFlip is an Electron app written in TypeScript and React.

### Setup

```sh
git clone https://github.com/ififfy/flipflip.git
cd flipflip
yarn install --dev

# terminal 1:
yarn development

# terminal 2:
yarn start

# app is now running, and you can reload at any time.
# uncomment the "open the dev tools" line in main.ts to get developer
# tools on launch.
```

### Making changes

Create a new branch, make your changes, and open a pull request. The
policy of the FlipFlip project is, "patches are generally accepted."
If your contributions make sense, you will be added as a collaborator
on the project to make changes as you wish. :-)

### JS style guide

* Use proper TypeScript. Some hacks are OK, but be reasonable.
* `import`, not `require`. (To make non-TypeScript modules work, add an entry
  to `src/declaration.d.ts`.)
* 2-space tabs.

### CSS style guide

* The top level of every React component simply has the component's full name as its CSS class
  (`<div className="Modal">`)
* Markup inside the component is `ClassName__Whatever` (`Modal__CloseButton`)
* For different states of the same component, make `m-blah` classes. (`Checkbox m-disabled`)
* For classes used on different kinds of elements, use `u-blah`, like `u-fill-screen`

### Contribution guidelines

* Try to keep the code repository and the application itself G-rated.
  If you want to break this guideline, email ififfy@mm.st and let's see
  if we can figure something out.
* Code needs to work on both Mac and Windows.
* The project is run on ["open open source"](http://openopensource.org)
  principles.