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

### Contribution guidelines

* Try to keep the code repository and the application itself G-rated.
  If you want to break this guideline, email ififfy@mm.st and let's see
  if we can figure something out.
* Code needs to work on both Mac and Windows.
* The project is run on ["open open source"](http://openopensource.org)
  principles.