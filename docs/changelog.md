# Changelog

## 3.1.3 <small>(05/21/2021)</small>
- Scrape images in separate thread
- Add top level error-page
- Add ability to search for Scenes
- Add new options for cleaning backups
- Add ability to disable scene-delete confirmation
- Add ability to batch delete scenes
- Prevent playing same image consecutively, if possible
- Prevent re-downloading of cached images
- Improve core data.json saving, prevent leaving empty file
- Improve ImageFap scraping and add captcha display
- When restarting, continue playing from offset image
- Fix bug with Imgur, GfyCat, and RedGifs URL resolution
- Fix bug with Default Scene config
- Fix bug with deleted grids being left in overlays
- Fix bug with default cache path
- Fix bug with concurrent Hydrus metadata requests
- Fix bug with gif options not working for Hydrus
- Fix bug with extra Hydrus arguments not be respected
- Fix bug with Hydrus Session/API key

## 3.1.2 <small>(04/29/2021)</small>
- Allow Play Full video to advance even when seeking
- Fix subtitle styling and add to video clipper
- Fix bugs with portable mode
- Fix bugs with sidebar video controls
- Fix bug with regenerating empty scene
- Fix bug with grid loading in wrong size
- Fix bug with incorrect audio alert/watermark when shuffling
- Fix bug where cursor wasn't hidden when using grid overlay
- Fix bug where configuring default scene resulted in white screen

## 3.1.1 <small>(03/12/2021)</small>
- Allow Scenes to use Grids as overlays
- Add Back/Forth option
- Add options for image/video orientation
- Add BPM Detection to Audio Library
- Add warning when using 'Audio BPM' timing, but with no BPM metadata 
- Add ability to recursively import directories of videos/audio/scripts
- Add option to prevent Portable Mode from saving locally
- Add options to persist audios/captions through Next Scenes
- Allow caption script to trigger audio files
- Allow caption script to advance scene 
- Show sort button while importing from library
- Allow video controls to skip to the next source during Scene playback
- Improve some booru scraping
- Add additional player hotkeys
- Fix bug preventing scene from overlaying itself 
- Fix bug when migrating to 3.1.x with an empty audio track
- Fix bug with Portable Mode
- Fix bug with library source IDs
- Fix bug with RedGif parsing
- Fix bug with grid loading
- Fix bug with auto-generation of overlays/grids

## 3.1.0 <small>(02/17/2021)</small>
- Add ability to detect and use video duration/resolution
- Add ability to set caption opacity globally and within script
- Add progress bar capability with caption count command
- Allow overlays to use 100% opacity
- Fix bug with caption timing
- Fix bug with single caption script not properly repeating
- Fix bug with stored phrases not resetting
- Fix bug with adding unavailable audio track
- Fix bug with Mac filepaths
- Fix bug with Hydrus

#### 3.1.0-beta2 <small>(01/19/2021)</small>
- Caption Scriptor
- Caption Script Library
- Timing functions for caption scripts
- Timestamps in caption script
- Sync audio with caption script timestamps
- Newlines in caption scripts
- Store caption phrases in separate groups
- Change command position in caption scripts
- Multiple concurrent Caption Script playlists
- Allow generators to auto-generate on playback
- Add Hydrus as source
- Add dynamic watermark
- Allow scenes to restore from configured defaults
- Allow saved Reddit posts as source
- Allow Tumblr throttle alert to be disabled
- Make tag background translucent
- Add scraper for E621
- Improve RedGif parsing
- Add Random sort function
- Fix bug with GoTo Clip Source
- Fix bug where scraping threads would die
- Fix bug with audio tag ordering
- Fix bug with backslash in search
- Fix bug with centered images
- Fix bug with BDSMlr sources
- Fix bug with loading system fonts
- Fix bug with audio repeat functions
- Fix bug with scene generator using weighted types
- Fix bug with copying remote images to clipboard

#### 3.1.0-beta1 <small>(09/25/2020)</small>
- Easing Controls
- Audio Library
- Allow multiple audio playlists within Scene
- Fix bug where scraping threads would die

## 3.0.7 <small>(09/16/2020)</small>
- New Effect: Continuous Fade In/Out (BETA)
- New Effect: Continuous Panning (BETA)
- Add option for Center (No Clipping)
- Add additional tooltips to UI
- Use searchable select throughout app when selecting Tags/Scenes
- Add option to localize offline library content
- Add option to delete source from file system
- Improve Picture Grid
- Improve Scene Generator
- Allow scene generators to match on source type
- Allow next button to be clicked to force next source
- Allow "/" in $RANDOM_PHRASE to correctly blink
- Increase granularity of BPM multiplier (x0.1-x10.0)
- Add context option for "Goto Clip Source"
- Fix bug with "Goto Tag Source"
- Fix bug with batch tagging only showing used tags
- Fix bug with full video playback at non-standard speed
- Fix bug with default weighting in config
- Fix bug with video timeline not displaying clip
- Fix bug with inner directories
- Fix bug with missing video
- Fix bug with source ordering
- Fix bug with continue video
- Fix bug with strobe timing
- Fix bug with playback speed
- Fix bug with disabled clips
- Fix redgif/gfycat parsing
- Revert Electron to latest working version

## 3.0.5 <small>(07/20/2020)</small>
- Add filter for only image files
- Add separate ordering for sources vs images
- Add randomized Play Part option for gifs and videos
- Allow random Next Scene from list
- Allow exact phrase search in Library
- Allow volume to be saved per clip
- Add ↑/↓ hotkeys to Video Clipper timestamps
- Add scrollwheel controls to video volume
- Add option for border on caption text
- Show chosen/total counts on generator rules
- Allow bpm detection for remote files
- Add ability for local sources to treat inner-directories as individual sources
- Add ability to view recent files in a grid
- Performance Improvements
- Make font loading more obvious
- Fix bug with reloading while tagging
- Fix bug with overlay loading text
- Fix bug with random phrase not splitting properly
- Fix bug with invalid strobe color
- Fix bug with color picker
- Fix bug with restoring default config

## 3.0.4 <small>(04/06/2020)</small>
- Add subtitle support (WebVTT)
- Add ability to auto-backup
- Allow clips to be tagged
- Add ability to find mergeable local directories
- Allow BPM to be detected, read, or input
- Allow clips to be individually toggled on off in a scene
- Add random option for zoom/translation
- Allow RANDOM_PHRASE and TAG_PHRASE to work with blink
- Add display count to Library
- Add progress display on taskbar
- Add options for Reddit feeds
- Add options for Twitter feeds
- Add ability to view and edit blacklist
- Prevent screensaver while playing slideshow
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