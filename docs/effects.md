# Effects
FlipFlip gives users some pretty finite control over various playback effects.

## Scene effects
This section controls how the scene will play out.
* Choose to display images at a constant rate (ms), randomly, or in a wave.
  * For randomly and wave, choose min and max (ms) of time range.
  * For wave, choose wave rate. _95-100 is generally recommended_
* Choose a scene to transition to after this one (or none). Control timing of next scene (sec).
* Add scene(s) to overlay over this one (or none). Control overlay opacity.
  * There is no limit to the number of overlays, but you may experience poor performance if you use too many.

_The "Next Scene" will pre-load in the background and start after the configured time has passed. Effects, audio, 
text, etc. will also change as configured_

<details>
  <summary>Show Example</summary>
  <img src="doc_images/timing_ex.gif" alt="Timing Example">
</details>

## Image effects
This section controls the background and fade effects.
* Choose either a blurred or solid color background. Control blur amount or color.
* Choose whether to cross-fade images. Control fade duration (ms).

<details>
  <summary>Show Example</summary>
  <img src="doc_images/fade_ex.gif" alt="Fade Example">
</details>

## Zoom/Move
This section controls image movement.
* Choose zoom on/off. Control start/end scale.
* Choose move horizontally left/right (or none). Control distance (%).
* Choose move vertically up/down (or none). Control distance (%).
* Control zoom/move time (ms).

<details>
  <summary>Show Example</summary>
  <img src="doc_images/zoom_ex.gif" alt="Zoom Example">
</details>

## Strobe
This section controls the strobe effect.
* Choose strobe on/off. Control color, strobe time (ms).
* Choose delay on/off. Control delay time (ms).
* Control strobe layer. If at "Behind All", control opacity.

<details>
  <summary>Show Example</summary>
  <img src="doc_images/strobe_ex.gif" alt="Strobe Example">
</details>

## Images
This section controls which images are displayed and in what order.
* Choose to show all images, only gifs (animated only), or only stills.
* Choose to play the full length of any animated gif.
* Weight images by source or by image.
  * Weighting by source means each source will be used an even amount (regardless of number of pictures).
  * Weighting by image means each image will be used an even amount (regardless of source).
* Choose to randomize playback.
* Choose to show all images before looping.

## Audio
This section controls the scene's audio component. It also contains the audio controls while playing.
"Tick" means the audio file will play/restart at a certain interval.
* Add audio files to loop or "tick".
* For "Tick", choose to play the audio track at a constant rate (ms), randomly, or in a wave.
  * For randomly and wave, choose min and max (ms) of time range.
  * For wave, choose wave rate. _95-100 is generally recommended_
* Control the volume of each track.
  
## Video Controls
This section controls video settings. While playing, this section contains the video playback controls and appears 
at the top. This includes controls for any overlay videos.
* Choose to start videos at a random timestamp (start from beginning by default)
* Choose to continue videos from last timestamp during this slideshow
* Control video volume for this scene

## Text
This section controls the caption program.
* Choose a text file that follows the [caption script format](caption_script.md).
  * If the text is hosted on Hastebin, you can simply use the ID, but you could also use the raw URL.
* Click `Font Options` to customize caption font typeface, size, and color. 
  * Captions display in 4 types: `blink`, `caption`, `captionBig`, and 'count'.
  * You can customize the font for each of these separately.
  
<details>
  <summary>Show Example</summary>
  <img src="doc_images/caption_ex.gif" alt="Caption Example">
</details>