# Preferences
FlipFlip allows you to configure default Scene effects and more! To access the Preferences page, click the little 
gear icon &nbsp; ( <img style="vertical-align: -5px" src="doc_icons/gear.svg" alt="Preferences" width="20" height="20"> ) 
on the Home page.

When you are done making changes to the Preferences, click `Apply` or `OK`. Settings will only be saved if they are valid.

![](doc_images/config.png)

## Scene Defaults
Configure default settings for each Scene just like you would in the Scene itself. These preferences will be applied 
whenever you create a new Scene (or Generator).

## Player Settings
These settings control various player options.

* `Always On Top` - keep Player on top of other windows
* `Show Menu` - show menu bar while playing
* `Fullscreen` - display player in fullscreen mode
* `Start Immediately` - don't wait for full scene to load, start as soon as first image loads
  * _Be aware this may cause the beginning to be janky, while the sources continue loading_


* `Min Image/Video Size` - the minimum number of pixels each dimension of an image/video must be 
(default: 200 - image's width _and_ height must be larger than 200px).
* `Max in Memory` - the maximum number of images to queue up for rendering.
* `Max in History` - the maximum number of images to keep in history (navigating backwards and forwards).
  * Images in memory and in history are cleared when the slideshow is stopped.
* `Max Loading at Once` - the number of threads to have loading images.
  * _Be cautious increasing this number as this will degrade performance._

## Caching
These settings control the caching abilities of FlipFlip. By default, FlipFlip caches 500MB of images in the 
`appData` directory. However, you can customize the caching dir and max size by changing values here. 
Turning caching off will prevent FlipFlip from reading from or writing to the cache.

## API Keys
These settings control how remote sources are used. 

#### Tumblr
By default, Tumblr API keys are provided. However, if you are experiencing 429 responses from Tumblr, you may replace 
these with your own API keys to improve performance. Instructions for getting your own API key are [here](tumblr_api.md). 

In order to import your Tumblr Following, you must first activate FlipFlip with your account. You should only ever 
have to do this once.

Tumblr has no Read-Only mode, so read AND write access are requested. FlipFlip does not store any user information or 
make any changes to your account.

* Click `Activate FlipFlip with Tumblr`
* Click `OK` on the confirmation dialog
* You will be directed to Tumblr.com in your browser
* Click `Allow` to give FlipFlip read permission
* Go back to FlipFlip
* You should see a Success! message

#### Reddit
In order to use Reddit Subreddits/Users as sources or import your Subscriptions, you must first activate FlipFlip 
with your account. You should only ever have to do this once.

FlipFlip does not store any user information or make any changes to your account.

* Click `Activate FlipFlip with Reddit`
* Click `OK` on the confirmation dialog
* You will be directed to Reddit.com in your browser
* Click `Allow` to give FlipFlip read permission
* Go back to FlipFlip
* You should see a Success! message

#### Twitter
In order to use Twitter Profiles as sources or import your Following, you must first activate FlipFlip with your 
account. You should only ever have to do this once.

FlipFlip does not store any user information or make any changes to your account.

* Click `Activate FlipFlip with Twitter`
* Click `OK` on the confirmation dialog
* You will be directed to Twitter.com in your browser
* Click `Allow` to give FlipFlip permission
* Go back to FlipFlip
* You should see a Success! message

#### Instagram
In order to use Instagram Profiles as sources, you'll need to provide your username and password. 
FlipFlip does not store any user information or make changes to your account. Your login information is 
stored locally on your computer and is never shared with anyone or sent to any server (besides Instagram, obviously).

## Backup
Backup your FlipFlip data or restore from a previous backup.

#### Backup Data
This creates a backup with all your current FlipFlip data (preferences, library, scenes, etc.)

#### Restore Backup
A dialog will appear with a list the your FlipFlip backups (by date/time). Select the backup you wish to 
restore and click `Confirm`

#### Clean Backups
Backups might build up over time. Click `Clean Backups` to delete all but the most recent backup.