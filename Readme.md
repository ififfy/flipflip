# FlipFlip

A random slideshow of images from your computer. Runs on Mac and Windows.

## Instructions

**[Downloads (Mac/Windows/Linux)](https://github.com/ififfy/flipflip/releases/latest)**

**[User manual](https://github.com/ififfy/flipflip/wiki/FlipFlip-User-Manual)**

**[Subreddit](https://www.reddit.com/r/flipflip/)**

If you are on a Mac, you might need to open this by right-clicking the
application, selecting "Open," and accepting all the stupid prompts
that pop up.

![Screenshot](/doc_images/flipflip_home.png)

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
  
## History

### 2.1.1
- Add more public Tumblr keys
- Allow users to specify Tumblr keys
- Fix bug with  new version alert

### 2.1.0
- Major performance improvements
- Allow scenes to transition into other scenes
- Allow scenes to be started as soon as the first image loads
- Allow overlay to be changed while playing
- Add "count" command to captioning
- 404 Checker (mark offline sources)
- Allow other Scenes to be weighted in Scene Generator
- Use Tumblr OAuth for retrieving images (prevent 429 error)
- Added ImageFap as source
- Added Sex.com as source
- Added Imgur as source
- Added Twitter as source
- Added DeviantArt as source
- Added Instagram as source
- Improve image link parsing
- Added more config options
- Misc bug fixes

### 2.0.0

- Many bugfixes
- Remote sources -- Tumblr and Reddit so far
- Remote source import -- Tumblr and Reddit so far
- Library
- Source tagging
- Source sorting & filtering
- Scene Generation
- Scene Export/Import
- Configure FlipFlip options
- Backup/Restore
- Caching
- Open random scene
- Add config option for image background (color vs blur)
- Add config option for strobe effect
- Add config option for caption font styles
- Detect and list system fonts
- Add slower timing functions
- Allow Text and Audio options to be changed while playing
- "Always On Top" and "Show/Hide Menu" options in player
- Improve source interface
- Drag'n'drop elements

### 1.2.0

- Fix importing duplicate directories
- Add progress circle for loading scenes
- Fix bug with No images warning
- Fix bug with overlay when scene loads first
- Improve animated gif detection (much better performance)
- Add horizontal and vertical transition options
- Add context menu with image information and actions
- Hide menu-bar when in fullscreen (and automatically exit fullscreen when scene ends)
- Add sidebar to player for modifying effects and timing
- Right arrow now advances slideshow if at the most recent image
- Fixed a bug with image filter resetting

### 1.1.2

- Fix two images loading at once

### 1.1.1

- Fix bug where only one source would be displayed
- Remove code that figures out if gifs are animated or not. It was just too slow to run.

### 1.1

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