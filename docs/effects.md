# Effects
The **EFFECTS** tab controls the various image effects: **Zoom/Move**, **Cross Fade**, and **Strobe**.

![](doc_images/scene_detail_effects.png)

FlipFlip effects all share the same types of timings (in ms):
* **Constant**: Occurs at a set interval
* **Random**: Occurs at a random interval between min & max (ms)
* **Wave**: Occurs at sin wave between min & max (ms).
  * You can modify the rate of change as well. _95-100 is generally recommended_ 
* **BPM**: Occurs at the rate of the BPM of the first audio file
  * You can change the BPM multiplier to increase/decrease this rate.
* **With Scene**: Occurs when the image changes

## Zoom/Move
This section controls image movement.
* Choose zoom on/off. Control start/end scale.
* Choose move horizontally left/right (or none). Control distance (%).
* Choose move vertically up/down (or none). Control distance (%).
* Control zoom/move timing options.

<img src="doc_images/zoom_ex.gif" alt="Zoom Example">

## Crossfade
This section controls fade effects.
* Choose whether to cross-fade images/video.
* Choose whether to cross-fade audio when cross-fading video.
* Control cross fade timing options.

<img src="doc_images/fade_ex.gif" alt="Fade Example">

## Strobe
This section controls the strobe effect.
* Choose strobe on/off. Control strobe time (ms).
* Choose delay on/off. Control delay time (ms).
* Control color(s). Choose single color, set of colors, or random colors.
* Control strobe layer. If at "Behind All", control opacity.
* Control strobe/delay timing options.

<img src="doc_images/strobe_ex.gif" alt="Strobe Example">