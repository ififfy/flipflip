# Effects
FlipFlip provides a number of different ways to control your Scene, with finite control over each effect.

Most effects share the same types of timings (in ms):
  * Constant: Occurs at a set interval
  * Random: Occurs at a random interval between min & max (ms)
  * Wave: Occurs at sin wave between min & max (ms).
    * You can modify the rate of change as well. _95-100 is generally recommended_ 
  * With Scene: Occurs when the image changes (shares timing with "Scene Effects")

## Scene Effects
This section controls how the scene will play out.

##### Timing
* Choose to change images at a constant rate (ms), random, or in a wave.

##### Background
* Choose between blurred image, solid color, or no background.
 * Control blur amount or color. 

##### Next Scene
* Choose a scene to transition to after this one (or none). Control timing of next scene (sec).

?> The "Next Scene" will pre-load in the background and start after the configured time has passed. Effects, audio, 
text, etc. will also change as configured.

##### Grid View / Overlay
* [Setup a grid](grid.md) of scenes to play (must include current scene).

**OR**

* Add scene(s) to overlay over this one (or none). Control overlay opacity.

?> There is no limit to the number of scenes you can use with grid/overlay, 
but you may experience poor performance if you use too many.

<img src="doc_images/timing_ex.gif" alt="Timing Example">

_An example of **Wave** timing_

## Images/Videos
This section controls which images/videos filters and ordering as well as image/video settings.

##### Image options
* Choose to show all images, only videos, only animated (animated gifs/videos only), or only stills.
* Choose to play the full length (or part) of animated gifs.

##### Video options
* Choose to play the full length (or part) of videos.
* Choose to start videos at a random timestamp (starts from beginning by default).
* Choose to continue videos from last timestamp during this slideshow.
* Choose to use only [video clips](clips.md) or the entire video.
  * If you are not using video clips, you can choose to skip the first and last parts of each video (ms)
* Control video volume for this scene.

##### Order options
* Weight images by source or by image.
  * Weighting by source means each source will be used an even amount (regardless of number of pictures).
  * Weighting by image means each image will be used an even amount (regardless of source).
* Choose to randomize playback.
* Choose to show all images before looping.


## Crossfade
This section controls fade effects.
* Choose whether to cross-fade images/video.
* Choose whether to cross-fade audio when cross-fading video.
* Choose to fade for a constant duration (ms), random, in a wave, or with the scene.

<img src="doc_images/fade_ex.gif" alt="Fade Example">

## Zoom/Move
This section controls image movement.
* Choose zoom on/off. Control start/end scale.
* Choose move horizontally left/right (or none). Control distance (%).
* Choose move vertically up/down (or none). Control distance (%).
* Choose to zoom/move for a constant duration (ms), random, in a wave, or with the scene

<img src="doc_images/zoom_ex.gif" alt="Zoom Example">

## Strobe
This section controls the strobe effect.
* Choose strobe on/off. Control color, strobe time (ms).
* Choose delay on/off. Control delay time (ms).
* Choose to strobe/delay for a constant duration (ms), random, in a wave, or with the scene
* Control strobe layer. If at "Behind All", control opacity.

<img src="doc_images/strobe_ex.gif" alt="Strobe Example">

## Audio
This section controls the scene's audio component. It also contains the audio controls while playing.
"Tick" means the audio file will play/restart at a certain interval.
* Add audio files to loop or "tick".
* For "Tick", choose to play the audio track at a constant rate (ms), random, in a wave, or with the scene
* Control the volume of each track.

## Text
This section controls the caption program.
* Choose a text file that follows the [caption script format](caption_script.md).
  * If the text is hosted on Hastebin, you can simply use the ID, but you could also use the raw URL.
* Click `Font Options` to customize caption font typeface, size, and color. 
  * Captions display in 4 types: `blink`, `caption`, `captionBig`, and `count`.
  * You can customize the font for each of these separately.
  
<img src="doc_images/caption_ex.gif" alt="Caption Example">