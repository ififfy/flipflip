# Changelog

## 3.0.4 <small>(04/06/2020)</small>
- Add subtitle support (WebVTT)
- Add ability to auto-backup
- Allow clips to be tagged
- Add ability to find mergeable local directories
- Allow BPM to be detected, read, or input
- Allow clips to be toggled on off in a scene
- Add random option for zoom/translation
- Allow RANDOM_PHRASE and TAG_PHRASE to work with blink
- Add display count to Library
- Add progress display on taskbar
- Add options for Reddit feed
- Add ability to view and edit blacklist
- Fix blacklisting
- Fix bug with clip loading
- Fix bug with sorting/searching by count
- Fix Twitter scraping

## 3.0.3 <small>(01/10/2020)</small>
- Add Portable Mode (saves in same directory as FlipFlip)
- Add ability to designate video playback speed
- Add more color options to background and strobe (single, set, or random colors)
- Add ability to move to next scene after all images are played
- Add ability to move to next scene when an audio track ends
- Add ability to move to next scene when the caption script completes
- Add ability to clone scenes
- Add video control hotkeys to video clipper
- Double click Start/End in video clipper to set as current timestamp
- Add support for .asx, .m3u8, .pls, and .xspf playlist files 
- Add option to rotate portrait videos
- Fix bugs with loading and playing next scene
- Fix bug when playing grid with empty scene
- Fix bug with pop-up messages
- Fix bug with drawer in new window
- Fix ImageFap scraping
- Fix Twitter scraping

## 3.0.2 <small>(12/20/2019)</small>
- Add hover effect to source list
- Add .mov as supported video type
- Add type filters to library search
- Allow switching between sources in video clipper
- Fix bug with inheriting tags/clips/blacklist from library

## 3.0.1 <small>(12/03/2019)</small>
- Fix bug with empty overlay
- Fix bug with imagefap scraper

## 3.0.0 <small>(11/13/2019)</small>
- Fix bug with caption script styling
- Fix bug with empty library
- Fix bug with randomization
- Fix bug with generating sources
- Fix bug with darkmode text

#### 3.0.0-beta3 <small>(10/31/2019)</small>
- Material UI redesign
- Interactive Tutorials
- Added BPM timing options
- Allow Caption and Audio to end scene
- Fixed DeviantArt scraping
- Fixed Twitter scraping
- Improve API authorization flow

#### 3.0.0-beta2 <small>(09/23/2019)</small>
- Allow effects to be changed instantly while playing
- Add option to fill entire screen
- Changed library Remove All to only remove visible sources
- Check local files when marking offline
- Fix bug where video volume not starting with scene
- Fix bug with player not restarting
- Fix cursor hiding while using sidebar
- Fix hotkeys while using sidebar
- Fix bug where next scene would play even if paused
- Fix strobe image effect
- Fix library and scene import/export
- Fix bug with video control showing even if no video
- Fix bug with $RANDOM_PRHASE in captioning
- Fix bugs with batch tagging
- Fix bug alt hotkeys on MacOS
- Added option to exclude retweets (add "--" to end of Twitter URL)

#### 3.0.0-beta1 <small>(09/10/2019)</small>

- Grid View
- Select clips from video files
- Skip start/end of videos
- Separate timing for gifs/videos
- Crossfade video audio
- Strobe Image
- Strict ordering
- Source counts
- Blacklist files in source
- Tag phrases function for captioning
- Start scene from command line
- Copy Image to Clipboard
- Improve performance
- Fix video volume while loading bug
- Fix delay with sound starting
- Fix Instagram challenges and 2FA
- Fix image list to allow local list and files
- Fix TagManager overflow
- Fix Tag ordering when navigating with [ ]
- Fix bug with caption script case sensitivity
- Fix bug with running multiple Library imports
- Fix double play bug
- Fix bug with strobe timing

## 2.3.2 <small>(07/24/2019)</small>
- Next Scene bugfix

## 2.3.1 <small>(07/19/2019)</small>
- Sortable bugfix

## 2.3.0 <small>(07/17/2019)</small>
- Multi-window support
- Allow single video files as sources
- E-Hentai & Danbooru/Gelbooru board support
- Improve performance
- Improve scraping
- Add Video Only option
- Add more Fade, Translate, Strobe timing options
- Fix bug with progress display hiding too early

## 2.2.1  <small>(07/08/2019)</small>
- Audio/Video controls
- Sound in videos
- Support for WebM and OGG
- Use multiple overlay layers
- Use multiple audio layers
- Ability to tick audio at set/random intervals
- Finer control over image timing
- Add context option to go to source tagging
- Use [ and ] to navigate between sources while tagging
- Add option for no background
- Add strobe layer between image and background
- Add option to play full video
- Add option to start at random spot in video
- Add option to continue videos from last timestamp
- Add Marked filter
- Export/Import scenes with overlay(s)
- Fix hover for marked/offline in Library
- Fix bug hiding Timing while tagging
- Fix bug with "Next Scene"
- Fix bug with zoom config 
- Fix typo in Tumblr alert

## 2.2.0  <small>(06/24/2019)</small>
- UI Improvements
- Allow player to play video files (.mp4/.mkv)
- Allow sources to scrape video files
- Greatly improve user control over Fade, Zoom, Move, & Strobe effects
- Allow scenes to be weighted by source or by image
- Allow scenes to play sources in order or randomized
- Add option to force all images to play before looping
- Add Library Search
- Add Library Batch Tagging
- Improve Library performance
- Add Library Import/Export
- Add Offline filter
- Add source type logos to sources 
- Add ability to mark specific sources
- Add ability to clean cache for specific source
- Add context link to cache directory
- Allow Scenes to be exported with Tags
- Allow Scene Import to optionally add sources to the Library
- Twitter Following Import
- Instagram Following Import
- Built docs into browseable site
- Fix bug with copying link to clipboard
- Fix bug with caption configs not reseting
- Misc bug fixes

## 2.1.1  <small>(05/28/2019)</small>
- Add more public Tumblr keys
- Allow users to specify Tumblr keys
- Fix bug with new version alert

## 2.1.0 <small>(05/27/2019)</small>
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

## 2.0.0 <small>(04/08/2019)</small>
#### 2.0.0-beta <small>(02/14/2019)</small>

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

## 1.2.0 <small>(01/15/2019)</small>

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

## 1.1.2 <small>(12/31/2018)</small>

- Fix two images loading at once

## 1.1.1 <small>(12/29/2018)</small>

- Fix bug where only one source would be displayed
- Remove code that figures out if gifs are animated or not. It was just too slow to run.

## 1.1.0 <small>(12/28/2018)</small> 

- Fresh UI for editing scenes
- Overlay a scene on top of another with transparency
- Load text scripts from any URL, not just Hastebin
- Audio loops
- Images can be loaded from the web. Create a text file containing one image URL per line, and use
  the "Import URL" option.

## 1.0.4 <small>(12/25/2018)</small>

- Hotkeys work more often
- Don't show images <200px in either dimension
- Bug fixes

## 1.0.3 <small>(12/22/2018)</small>

- Linux support
- Better zoom
- Text script support with Hastebin
- Configurable timing down to the millisecond
- Gifs no longer count as animated if they only have one frame

## 1.0.2 <small>(12/21/2018)</small>

- Zoom
- More timing options
- Gooninator URL import

## 1.0.1 <small>(12/20/2018)</small>

- Fullscreen toggle
- Cross-fade images as they change
- Bug fixes

## 1.0.0 <small>(12/19/2018)</small>