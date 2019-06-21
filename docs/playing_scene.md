# Playing Your Scene
After you have added at least 1 source and configured your chosen effects, click the `Play` button ( 
<img style="vertical-align: -5px" src="doc_icons/play.svg" alt="Play" width="20" height="20"> ) to start the show!

## Scene loading
While a Scene (or its overlay) is loading, a progress indicator will display showing the current source being loaded 
and the progress so far. If a Scene finishes loading before its overlay, you will see a separate overlay loading 
indicator as well. When both the Scene and overlay have loaded, the slideshow will begin. 

?> To avoid lag and janky playback, it's recommended to let loading finish, but if you want to start early anyway, 
click `Start Now` when it appears. You can also configure all scenes to start immediately in [Preferences](config.md#player-settings).

![](doc_images/scene_loading.png)


## Playback controls
All scene options (except the image filter) can also be changed while playing a slideshow by hovering over the sidebar 
on the left.

![](doc_images/player_options.png)

## Image info
While a Scene is playing, you can right click on an image to get more information about it. The image's source and 
individual URL are always shown (click to copy to the clipboard). You can also choose to open the source or image 
directly (will use your system's default app for opening that type of link). 

If the URL is for a local file, you are 
given options to view it in Explorer/Finder or delete it from the system (handy for pruning images you don't want in 
FlipFlip). 

If it is for a remote file and you have enabled caching, a link to the caching directory is also provided.

![](doc_images/image_context_menu.png)

## Player Hotkeys
A number of hotkeys are available for quickly performing user actions. These functions are also available in the menu.

Use the arrow keys (← / →) to navigate through playback history. Use `Space` to pause/resume playback. 
These controls are also available in the bar at the top.

| Hotkey                | Function             |
|:---------------------:|:--------------------:|
| Space                 | Play/Pause           |
| ← →                   | Navigate History     |
| Esc                   | Exit Scene           |
| Del                   | Delete Image         |
| **⌘+F** / **Ctrl+F** | Toggle Fullscreen    |
| **⌘+T** / **Ctrl+T** | Toggle Always On Top |
| **⌘+^** / **Ctrl+^** | Toggle Menu Bar      |

