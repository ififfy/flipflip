# Effects
The **EFFECTS** tab controls the various image effects: **Zoom/Move**, **Cross Fade**, **Strobe**, **Fade In/Out**, 
and **Panning**.

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
This section controls image movement. This effect restarts when the displayed image changes.
* Choose zoom on/off. Control start/end scale and randomization.
* Choose move horizontally left/right/either (or none). Control distance (%) and randomization.
* Choose move vertically up/down/either (or none). Control distance (%) and randomization.
* Control zoom/move timing options.

<img src="doc_images/zoom_ex.gif" alt="Zoom Example">

## Crossfade
This section controls fade effects.  This effect restarts when the displayed image changes.
* Choose whether to cross-fade images/video.
* Choose whether to cross-fade audio when cross-fading video.
* Control cross fade timing options.

<img src="doc_images/fade_ex.gif" alt="Fade Example">

## Strobe
This section controls the strobe effect.  This effect restarts when the displayed image changes.
* Choose strobe on/off. Control strobe time (ms).
* Choose delay on/off. Control delay time (ms).
* Control color(s). Choose single color, set of colors, or random colors.
* Control strobe layer. If at "Behind All", control opacity.

<img src="doc_images/strobe_ex.gif" alt="Strobe Example">

## Fade In/Out BETA
This section controls the fade in/out effect. This effect is continuous and will continue even if the displayed image 
changes.
* Choose fade in/out on/off. Control fade in/out time (ms).
  * This time represents a full fade in/out (half fade in, half fade out)

<img src="doc_images/fadeio_ex.gif" alt="Fade In/Out Example">

?> This is a BETA effect and may produce unexpected results when used with more complex timing functions or in 
combination with other effects.

## Panning BETA
This section controls the panning effect. This effect is continuous and will continue even if the displayed image 
changes.
* Choose panning on/off.
* Choose panning horizontally from left/right/either (or none). Control distance (%) and randomization.
* Choose panning vertically from up/down/either (or none). Control distance (%) and randomization.
* Control panning timing options.

<img src="doc_images/panning_ex.gif" alt="Panning Example">

?> This is a BETA effect and may produce unexpected results when used with more complex timing functions or in 
combination with other effects.